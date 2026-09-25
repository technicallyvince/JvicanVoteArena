import crypto from 'crypto'
import { db } from '@/lib/db'
import { generateReceiptNumber } from '@/lib/utils'
import { sendReceiptEmail } from '@/lib/email/sender'
import { sendPaymentStatusEmail } from '@/lib/email/send-payment-status'
import { nanoid } from 'nanoid'
import { transactPay } from '@/lib/payments/transactpay/client'
import { TransactPayWebhookPayload } from '@/lib/payments/transactpay/types'

export interface WebhookProcessingResult {
  success: boolean
  message: string
  reference?: string
  alreadyProcessed?: boolean
  statusCode: number
}

/**
 * Validates HMAC SHA-256 / SHA-512 signatures if provided in webhook headers
 */
export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  secretKey: string
): boolean {
  if (!signatureHeader || !secretKey) {
    return true
  }

  try {
    const hash256 = crypto
      .createHmac('sha256', secretKey)
      .update(rawBody)
      .digest('hex')

    const hash512 = crypto
      .createHmac('sha512', secretKey)
      .update(rawBody)
      .digest('hex')

    const sig = signatureHeader.toLowerCase()
    return sig === hash256.toLowerCase() || sig === hash512.toLowerCase()
  } catch (err) {
    console.error('Error verifying webhook signature:', err)
    return false
  }
}

/**
 * Authoritatively processes a TransactPay payment event
 * Idempotent: Never records votes twice or double-bills
 */
export async function processTransactPayPayment(
  payload: TransactPayWebhookPayload,
  source: 'webhook' | 'server_verification' = 'webhook'
): Promise<WebhookProcessingResult> {
  // Extract reference matching TransactPay payload variations:
  // - data.orderReference / data.paymentReference
  // - orderReference / paymentReference
  // - order.reference / reference
  const d = (payload as any).data || (payload as any).Data || {}
  const reference =
    d.orderReference ||
    d.OrderReference ||
    d.reference ||
    (payload as any).orderReference ||
    (payload as any).OrderReference ||
    payload.reference ||
    payload.order?.reference ||
    (payload as any).order_reference ||
    d.paymentReference ||
    (payload as any).paymentReference

  if (!reference) {
    return {
      success: false,
      message: 'No transaction reference found in payload',
      statusCode: 400,
    }
  }

  const vote = db.getVoteByRef(reference)
  const payment = db.getPayments().find((p) => p.payment_reference === reference)

  if (!vote || !payment) {
    console.warn(`[TransactPay] Transaction reference not found in database: ${reference}`)
    return {
      success: false,
      message: `Transaction reference not found: ${reference}`,
      reference,
      statusCode: 404,
    }
  }

  // Idempotent safeguard: If already confirmed, return success immediately without side effects
  if (vote.status === 'confirmed' && payment.status === 'successful') {
    return {
      success: true,
      message: 'Payment has already been processed idempotently.',
      reference,
      alreadyProcessed: true,
      statusCode: 200,
    }
  }

  // Determine final gateway status based on StatusID (5 = Successful) and status strings
  const statusId = d.statusId || d.StatusId || (payload as any).statusId || (payload as any).StatusId
  const statusString = String(
    d.status ||
    d.Status ||
    payload.status ||
    payload.order?.status ||
    ''
  ).toLowerCase()

  const eventName = (payload.event || '').toLowerCase()

  const isSuccess =
    statusId === 5 ||
    statusId === '5' ||
    statusString === 'successful' ||
    statusString === 'success' ||
    statusString === 'paid' ||
    eventName === 'payment.success' ||
    eventName === 'order.paid'

  const gatewayRef =
    d.paymentReference ||
    d.PaymentReference ||
    (payload as any).paymentReference ||
    payload.gateway_reference ||
    payload.id ||
    `TP-${Date.now()}`

  if (isSuccess) {
    // 1. Update internal Payment and Vote status (DB automatically updates financial ledger)
    db.updatePaymentStatus(reference, 'successful', gatewayRef)
    db.updateVoteStatus(reference, 'confirmed', payment.id)

    // 2. Generate cryptographically unique public receipt
    const receiptPublicId = `rc_${nanoid(12)}`
    const receiptNumber = generateReceiptNumber()

    const receipt = db.createReceipt({
      id: nanoid(),
      vote_id: vote.id,
      receipt_number: receiptNumber,
      public_id: receiptPublicId,
      voter_email: vote.voter_email,
      amount: vote.total_amount,
      currency: vote.currency,
      issued_at: new Date().toISOString(),
      email_status: 'queued',
      created_at: new Date().toISOString(),
    })

    // 3. Look up related entities for email formatting
    const event = db.getEventById(vote.event_id)
    const nominee = db.getNomineeById(vote.nominee_id)
    const category = db.getCategoryById(vote.category_id)

    // 4. Send official transactional receipt email asynchronously
    sendReceiptEmail({
      to: vote.voter_email,
      subject: `Official Voting Receipt [${receiptNumber}] - ${event?.name || 'JVican Vote Arena'}`,
      props: {
        eventName: event?.name || 'Event',
        eventLogo: event?.logo_url,
        nomineeName: nominee?.name || 'Nominee',
        categoryName: category?.name || 'Category',
        receiptNumber,
        publicId: receiptPublicId,
        voterEmail: vote.voter_email,
        quantity: vote.quantity,
        unitPrice: vote.unit_price,
        totalAmount: vote.total_amount,
        currency: vote.currency,
        paymentReference: reference,
        issuedAt: receipt.issued_at,
      },
    })
      .then((res) => {
        if (res.success) {
          receipt.email_status = 'sent'
        } else {
          receipt.email_status = 'failed'
        }
      })
      .catch((err) => {
        console.error('[TransactPay] Failed to dispatch receipt email:', err)
        receipt.email_status = 'failed'
      })

    return {
      success: true,
      message: 'Payment verified and fulfilled successfully.',
      reference,
      statusCode: 200,
    }
  } else {
    // Payment failed or was cancelled
    db.updatePaymentStatus(reference, 'failed', gatewayRef)
    db.updateVoteStatus(reference, 'failed', payment.id)

    const event = db.getEventById(vote.event_id)
    const nominee = db.getNomineeById(vote.nominee_id)
    
    sendPaymentStatusEmail({
      payment,
      status: 'failed',
      event: event || undefined,
      nominee: nominee || undefined,
      failureReason: statusString || 'Transaction was declined or cancelled by customer/gateway.',
    }).catch((err) => console.warn('[TransactPay] Failed to send payment failed email:', err))

    return {
      success: false,
      message: `Payment status marked as ${statusString || 'failed'}`,
      reference,
      statusCode: 200,
    }
  }
}
