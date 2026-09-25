import { NextRequest, NextResponse } from 'next/server'
import { verifyAndFulfillPayment } from '@/lib/payments/transactpay/verify-payment'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const reference = searchParams.get('ref')

    if (!reference) {
      return NextResponse.json(
        { success: false, error: 'Missing payment reference' },
        { status: 400 }
      )
    }

    const result = await verifyAndFulfillPayment(reference)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Payment verification failed',
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      alreadyProcessed: result.alreadyProcessed,
      vote: result.vote,
      payment: result.payment,
      receipt: result.receipt,
    })
  } catch (err: any) {
    console.error('Error in verify-payment route:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Verification error' },
      { status: 500 }
    )
  }
}
