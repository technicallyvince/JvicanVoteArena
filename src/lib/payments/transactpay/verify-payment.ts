import { transactPay } from './client'
import { processTransactPayPayment } from './webhook'
import { db } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

/**
 * Reconciles and verifies a payment with TransactPay backend
 * Ensures idempotent fulfillment and returns receipt details
 */
export async function verifyAndFulfillPayment(reference: string): Promise<{
  success: boolean
  alreadyProcessed?: boolean
  error?: string
  vote?: any
  payment?: any
  receipt?: any
}> {
  if (!reference) {
    return { success: false, error: 'Reference is required' }
  }

  let vote = db.getVoteByRef(reference)
  let payment = db.getPayments().find((p) => p.payment_reference === reference)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasSupabase = supabaseUrl && !supabaseUrl.includes('placeholder')

  // Supabase fallback lookup if not present in current serverless memory
  if ((!vote || !payment) && hasSupabase) {
    try {
      const admin = getSupabaseAdmin()
      const supabase = await createClient()
      const dbClient = admin || supabase
      if (dbClient) {
        if (!vote) {
          const { data: vData } = await dbClient
            .from('votes')
            .select('*')
            .eq('payment_reference', reference)
            .maybeSingle()
          if (vData) {
            vote = vData
            db.createVote(vData)
          }
        }
        if (!payment) {
          const { data: pData } = await dbClient
            .from('payments')
            .select('*')
            .eq('payment_reference', reference)
            .maybeSingle()
          if (pData) {
            payment = pData
            db.createPayment(pData)
          }
        }
      }
    } catch (dbErr) {
      console.warn('[verifyAndFulfillPayment] Supabase lookup fallback error:', dbErr)
    }
  }

  if (!vote || !payment) {
    return { success: false, error: 'Transaction record not found in system' }
  }

  // Idempotency check: If already confirmed, retrieve existing receipt
  if (vote.status === 'confirmed' && payment.status === 'successful') {
    let existingReceipt = db.getReceiptByVoteId(vote.id)
    if (!existingReceipt && hasSupabase) {
      try {
        const admin = getSupabaseAdmin()
        const supabase = await createClient()
        const dbClient = admin || supabase
        if (dbClient) {
          const { data: rData } = await dbClient
            .from('receipts')
            .select('*')
            .eq('vote_id', vote.id)
            .maybeSingle()
          if (rData) {
            existingReceipt = rData
          }
        }
      } catch (rErr) {
        console.warn('Error fetching existing receipt from Supabase:', rErr)
      }
    }
    return {
      success: true,
      alreadyProcessed: true,
      vote,
      payment,
      receipt: existingReceipt,
    }
  }

  // Verify transaction status with TransactPay gateway
  try {
    const verification = await transactPay.verifyTransaction(reference)
    console.log('[TransactPay Verification Response]:', JSON.stringify(verification, null, 2))

    const vAny = verification as any
    const d: any = vAny.data || {}
    const orderData: any = d.order || {}
    const paymentData: any = d.payment || {}

    // Extract statusId (5 = Successful in TransactPay)
    const statusId =
      d.statusId ??
      d.StatusId ??
      orderData.statusId ??
      orderData.StatusId ??
      paymentData.statusId ??
      paymentData.StatusId ??
      vAny.statusId

    // Extract status string from all possible TransactPay response locations
    const statusStr = String(
      d.status ||
      d.Status ||
      d.paymentStatus ||
      orderData.status ||
      orderData.paymentStatus ||
      paymentData.status ||
      vAny.status ||
      ''
    ).toLowerCase().trim()

    const statusCode = String(
      vAny.statusCode ||
      d.statusCode ||
      ''
    ).trim()

    // Determine authoritative success:
    // StatusId === 5 OR status string matches positive indicator OR statusCode is '00' with successful/paid
    const isSuccess =
      statusId === 5 ||
      statusId === '5' ||
      ['successful', 'success', 'paid', 'approved', 'completed', 'settled'].includes(statusStr) ||
      (statusCode === '00' && !['failed', 'declined', 'cancelled', 'canceled', 'expired', 'reversed', 'pending', 'unpaid'].includes(statusStr))

    const isPending =
      !isSuccess &&
      (statusId === 1 ||
        statusId === '1' ||
        ['pending', 'unpaid', 'processing', 'in_progress', 'initiated'].includes(statusStr))

    const isExplicitlyFailed =
      statusId === 3 ||
      statusId === 4 ||
      ['failed', 'declined', 'cancelled', 'canceled', 'expired', 'reversed'].includes(statusStr)

    if (!isSuccess) {
      if (isExplicitlyFailed) {
        db.updatePaymentStatus(reference, 'failed')
        db.updateVoteStatus(reference, 'failed')
      }

      if (isPending) {
        return {
          success: false,
          error: 'Your payment is currently being processed by your bank/gateway. Please refresh this page in a few moments.',
        }
      }

      // Do not return generic "Order details fetched successfully" as an error message to the voter
      const cleanError =
        verification.message && verification.message !== 'Order details fetched successfully'
          ? verification.message
          : 'Payment was not marked as successful by TransactPay.'

      return {
        success: false,
        error: cleanError,
      }
    }

    const gatewayRef =
      d.paymentReference ||
      d.PaymentReference ||
      orderData.processorReference ||
      orderData.reference ||
      d.gateway_reference ||
      vAny.id ||
      `TP-${Date.now()}`

    // Process and fulfill
    await processTransactPayPayment(
      {
        status: 'successful',
        reference,
        gateway_reference: gatewayRef,
        amount: d.amount || orderData.amount || vote.total_amount,
        currency: d.currency || orderData.currency || vote.currency,
        paid_at: d.paid_at || orderData.paidAt || new Date().toISOString(),
        data: d,
      },
      'server_verification'
    )

    const updatedVote = db.getVoteByRef(reference) || vote
    const updatedPayment = db.getPayments().find((p) => p.payment_reference === reference) || payment
    let receipt = db.getReceiptByVoteId(vote.id)

    if (!receipt && hasSupabase) {
      try {
        const admin = getSupabaseAdmin()
        const supabase = await createClient()
        const dbClient = admin || supabase
        if (dbClient) {
          const { data: rData } = await dbClient
            .from('receipts')
            .select('*')
            .eq('vote_id', vote.id)
            .maybeSingle()
          if (rData) receipt = rData
        }
      } catch (rErr) {
        console.warn('Error retrieving receipt from Supabase:', rErr)
      }
    }

    return {
      success: true,
      vote: updatedVote,
      payment: updatedPayment,
      receipt,
    }
  } catch (err: any) {
    console.error('verifyAndFulfillPayment error:', err)
    return {
      success: false,
      error: err.message || 'Gateway verification failed',
    }
  }
}

