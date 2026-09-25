import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { transactPay } from '@/lib/payments/transactpay/client'
import { nanoid } from 'nanoid'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { eventId, nomineeId, categoryId, quantity, voterEmail } = body

    // 1. Basic validation
    if (!eventId || !nomineeId || !quantity || !voterEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters (eventId, nomineeId, quantity, voterEmail)' },
        { status: 400 }
      )
    }

    const voteQty = parseInt(quantity, 10)
    if (isNaN(voteQty) || voteQty < 10) {
      return NextResponse.json(
        { success: false, error: 'The minimum vote quantity from voters is 10 votes (₦1,000 minimum).' },
        { status: 400 }
      )
    }

    // 2. Authoritative database lookup
    const event = db.getEventById(eventId)
    if (!event) {
      return NextResponse.json({ success: false, error: 'Event not found.' }, { status: 404 })
    }

    if (event.status !== 'published') {
      return NextResponse.json(
        { success: false, error: 'This event is not currently accepting votes.' },
        { status: 400 }
      )
    }

    const now = new Date()
    const startDate = new Date(event.start_date)
    const endDate = new Date(event.end_date)

    if (now < startDate) {
      return NextResponse.json(
        { success: false, error: 'Voting for this event has not started yet.' },
        { status: 400 }
      )
    }

    if (now > endDate) {
      return NextResponse.json(
        { success: false, error: 'Voting for this event has officially closed.' },
        { status: 400 }
      )
    }

    const nominee = db.getNomineeById(nomineeId)
    if (!nominee || nominee.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'The selected nominee is invalid or not active.' },
        { status: 400 }
      )
    }

    // 3. Server-Authoritative calculation (never trust frontend math)
    const unitPrice = Math.max(100, Number(event.vote_price) || 100)
    const totalAmount = voteQty * unitPrice
    const currency = event.currency || 'NGN'

    if (totalAmount < 1000 && currency === 'NGN') {
      return NextResponse.json(
        { success: false, error: 'The minimum order amount is ₦1,000 (minimum 10 votes at ₦100/vote).' },
        { status: 400 }
      )
    }

    // Unique payment reference
    const paymentRef = `JVA-${Date.now()}-${nanoid(6).toUpperCase()}`

    // 4. Create pending Payment & Vote records in database
    const payment = db.createPayment({
      id: nanoid(),
      event_id: event.id,
      voter_email: voterEmail.trim().toLowerCase(),
      amount: totalAmount,
      currency,
      payment_reference: paymentRef,
      gateway: 'transactpay',
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    const vote = db.createVote({
      id: nanoid(),
      event_id: event.id,
      category_id: categoryId || nominee.category_id,
      nominee_id: nominee.id,
      voter_email: voterEmail.trim().toLowerCase(),
      quantity: voteQty,
      unit_price: unitPrice,
      total_amount: totalAmount,
      currency,
      payment_id: payment.id,
      payment_reference: paymentRef,
      status: 'pending',
      created_at: new Date().toISOString(),
    })

    // 5. Initialize standard checkout with TransactPay
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const redirectUrl = `${baseUrl}/payment/callback?ref=${paymentRef}`

    const orderResponse = await transactPay.createOrder({
      customer: {
        firstname: 'Voter',
        lastname: nominee.name.split(' ')[0] || 'Supporter',
        email: voterEmail.trim().toLowerCase(),
        country: 'NG',
      },
      order: {
        amount: totalAmount,
        currency,
        reference: paymentRef,
        description: `${voteQty} Vote(s) for ${nominee.name} - ${event.name}`,
      },
      payment: {
        RedirectUrl: redirectUrl,
      },
    })

    if (!orderResponse.status || !orderResponse.data) {
      db.updatePaymentStatus(paymentRef, 'failed')
      db.updateVoteStatus(paymentRef, 'failed')
      return NextResponse.json(
        { success: false, error: orderResponse.message || 'Payment initialization failed with gateway.' },
        { status: 502 }
      )
    }

    const checkoutUrl = orderResponse.data.checkoutUrl || orderResponse.data.paymentUrl

    return NextResponse.json({
      success: true,
      reference: paymentRef,
      checkoutUrl,
      orderId: orderResponse.data.orderId,
    })
  } catch (err: any) {
    console.error('Error in initialize-payment:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
