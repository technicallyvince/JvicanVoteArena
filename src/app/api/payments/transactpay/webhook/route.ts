import { NextRequest, NextResponse } from 'next/server'
import {
  processTransactPayPayment,
  verifyWebhookSignature,
} from '@/lib/payments/transactpay/webhook'

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const signature =
      req.headers.get('x-transactpay-signature') ||
      req.headers.get('x-signature') ||
      req.headers.get('signature')

    const secretKey =
      process.env.TRANSACTPAY_WEBHOOK_SECRET ||
      process.env.TRANSACTPAY_SECRET_KEY ||
      ''

    // 1. Signature Verification (if secret configured)
    if (secretKey && signature) {
      const isValid = verifyWebhookSignature(rawBody, signature, secretKey)
      if (!isValid) {
        console.error('[TransactPay Webhook] Invalid webhook signature rejected')
        return NextResponse.json(
          { error: 'Invalid webhook signature' },
          { status: 401 }
        )
      }
    }

    let payload: any = {}
    try {
      payload = JSON.parse(rawBody)
    } catch (parseErr) {
      console.error('[TransactPay Webhook] Invalid JSON payload:', parseErr)
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
    }

    // 2. Process payment idempotently
    const result = await processTransactPayPayment(payload, 'webhook')

    if (!result.success && result.statusCode === 404) {
      return NextResponse.json({ error: result.message }, { status: 404 })
    }

    // Always respond with 200 OK to TransactPay to acknowledge receipt
    return NextResponse.json({
      success: true,
      message: result.message,
      alreadyProcessed: result.alreadyProcessed,
    })
  } catch (err: any) {
    console.error('[TransactPay Webhook] Error handling webhook:', err)
    return NextResponse.json(
      { error: err.message || 'Internal webhook error' },
      { status: 500 }
    )
  }
}
