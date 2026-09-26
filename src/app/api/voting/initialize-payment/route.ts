import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { createTransactPayCheckout } from '@/lib/payments/transactpay/create-checkout'
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
        { success: false, error: 'The minimum vote quantity is 10 votes (₦1,000 minimum).' },
        { status: 400 }
      )
    }

    // 2. Authoritative database lookup
    let event: any = null
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasSupabase = supabaseUrl && !supabaseUrl.includes('placeholder')

    if (hasSupabase) {
      const admin = getSupabaseAdmin()
      const supabase = await createClient()
      for (const client of [admin, supabase].filter(Boolean)) {
        const { data, error } = await client!
          .from('events')
          .select('*')
          .or(`id.eq.${eventId},slug.eq.${eventId}`)
          .maybeSingle()
        if (!error && data) {
          event = data
          break
        }
      }
    }

    if (!event) {
      event = db.getEventById(eventId) || db.getEventBySlug(eventId)
    }

    if (!event) {
      return NextResponse.json({ success: false, error: 'Event not found.' }, { status: 404 })
    }

    if (event.status !== 'published' && event.status !== 'approved') {
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

    // 3. Server-Authoritative calculation (never trust frontend amounts)
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

    // 5. Initialize hosted checkout session with TransactPay
    const checkoutResult = await createTransactPayCheckout({
      reference: paymentRef,
      amount: totalAmount,
      currency,
      voterEmail: voterEmail.trim().toLowerCase(),
      nomineeName: nominee.name,
      eventName: event.name,
      voteQuantity: voteQty,
    })

    if (!checkoutResult.success || !checkoutResult.redirectUrl) {
      db.updatePaymentStatus(paymentRef, 'failed')
      db.updateVoteStatus(paymentRef, 'failed')
      return NextResponse.json(
        { success: false, error: checkoutResult.error || 'Payment initialization failed with gateway.' },
        { status: 502 }
      )
    }

    return NextResponse.json({
      success: true,
      reference: paymentRef,
      checkoutUrl: checkoutResult.redirectUrl,
      orderId: checkoutResult.orderId,
    })
  } catch (err: any) {
    console.error('Error in initialize-payment:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
