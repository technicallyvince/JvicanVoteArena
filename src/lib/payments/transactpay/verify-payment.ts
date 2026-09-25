import { transactPay } from './client'
import { processTransactPayPayment, WebhookProcessingResult } from './webhook'
import { db } from '@/lib/db'

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

  const vote = db.getVoteByRef(reference)
  const payment = db.getPayments().find((p) => p.payment_reference === reference)

  if (!vote || !payment) {
    return { success: false, error: 'Transaction record not found in system' }
  }

  // Idempotency check: If already confirmed, retrieve existing receipt
  if (vote.status === 'confirmed' && payment.status === 'successful') {
    const existingReceipt = db.getReceiptByVoteId(vote.id)
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

    if (
      !verification.status ||
      (verification.data && verification.data.status !== 'successful')
    ) {
      // Mark as failed if gateway explicitly says failed
      if (verification.data && verification.data.status === 'failed') {
        db.updatePaymentStatus(reference, 'failed')
        db.updateVoteStatus(reference, 'failed')
      }

      return {
        success: false,
        error: verification.message || 'Payment is not marked as successful by TransactPay.',
      }
    }

    // Process and fulfill
    await processTransactPayPayment(
      {
        status: verification.data?.status || 'successful',
        reference,
        gateway_reference: verification.data?.gateway_reference,
        amount: verification.data?.amount,
        currency: verification.data?.currency,
        paid_at: verification.data?.paid_at,
      },
      'server_verification'
    )

    const updatedVote = db.getVoteByRef(reference)
    const updatedPayment = db.getPayments().find((p) => p.payment_reference === reference)
    const receipt = db.getReceiptByVoteId(vote.id)

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
