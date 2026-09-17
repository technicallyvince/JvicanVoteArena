import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateReceiptNumber } from '@/lib/utils'
import { sendReceiptEmail } from '@/lib/email/sender'
import { nanoid } from 'nanoid'

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    let payload: any = {}

    try {
      payload = JSON.parse(rawBody)
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
    }

    // Reference from TransactPay webhook event
    const reference = payload.reference || payload.order?.reference || payload.data?.reference

    if (!reference) {
      return NextResponse.json({ error: 'No reference in webhook payload' }, { status: 400 })
    }

    const vote = db.getVoteByRef(reference)
    const payment = db.getPayments().find((p) => p.payment_reference === reference)

    if (!vote || !payment) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    // Idempotent safeguard: If already confirmed, acknowledge success immediately
    if (vote.status === 'confirmed') {
      return NextResponse.json({ success: true, message: 'Already processed idempotently.' })
    }

    const eventType = payload.event || payload.status
    if (eventType === 'payment.success' || payload.status === 'successful' || payload.status === 'success') {
      db.updatePaymentStatus(reference, 'successful', payload.gateway_reference || payload.id)
      db.updateVoteStatus(reference, 'confirmed', payment.id)

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

      const contest = db.getEventById(vote.event_id)
      const contestant = db.getNomineeById(vote.nominee_id)
      const category = db.getCategoryById(vote.category_id)

      // Send receipt email
      sendReceiptEmail({
        to: vote.voter_email,
        subject: `Official Voting Receipt [${receiptNumber}] - ${contest?.name || 'JVican Vote Arena'}`,
        props: {
          contestName: contest?.name || 'Contest',
          contestLogo: contest?.logo_url,
          contestantName: contestant?.name || 'Contestant',
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
    } else {
      db.updatePaymentStatus(reference, 'failed')
      db.updateVoteStatus(reference, 'failed')
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Webhook error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
