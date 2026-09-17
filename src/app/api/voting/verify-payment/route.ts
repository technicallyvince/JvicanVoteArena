import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { transactPay } from '@/lib/payments/transactpay/client'
import { generateReceiptNumber } from '@/lib/utils'
import { sendReceiptEmail } from '@/lib/email/sender'
import { nanoid } from 'nanoid'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const reference = searchParams.get('ref')

    if (!reference) {
      return NextResponse.json({ success: false, error: 'Missing reference parameter' }, { status: 400 })
    }

    const vote = db.getVoteByRef(reference)
    const payment = db.getPayments().find((p) => p.payment_reference === reference)

    if (!vote || !payment) {
      return NextResponse.json({ success: false, error: 'Transaction record not found' }, { status: 404 })
    }

    // Idempotency check: if vote is already confirmed, return existing receipt
    if (vote.status === 'confirmed') {
      const existingReceipt = db.getReceiptByVoteId(vote.id)
      return NextResponse.json({
        success: true,
        alreadyProcessed: true,
        vote,
        payment,
        receipt: existingReceipt,
      })
    }

    // Authoritative verification with TransactPay
    const verifyResult = await transactPay.verifyTransaction(reference)

    if (!verifyResult.status || verifyResult.data?.status !== 'successful') {
      db.updatePaymentStatus(reference, 'failed')
      db.updateVoteStatus(reference, 'failed')
      return NextResponse.json({
        success: false,
        error: 'Payment verification was not successful.',
        details: verifyResult.message,
      })
    }

    // Mark payment successful and vote confirmed
    const gatewayRef = verifyResult.data?.gateway_reference || `TP-${Date.now()}`
    db.updatePaymentStatus(reference, 'successful', gatewayRef)
    db.updateVoteStatus(reference, 'confirmed', payment.id)

    // Generate unique official voting receipt
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

    // Look up related entities for email formatting
    const contest = db.getEventById(vote.event_id)
    const contestant = db.getNomineeById(vote.nominee_id)
    const category = db.getCategoryById(vote.category_id)

    // Send transactional receipt email asynchronously
    sendReceiptEmail({
      to: vote.voter_email,
      subject: `Official Voting Receipt [${receiptNumber}] - ${contest?.name || 'JVican Vote Arena'}`,
      props: {
        contestName: contest?.name || 'Contest',
        contestLogo: contest?.logo_url,
        contestantName: contestant?.name || 'Contestant',
        categoryName: category?.name || 'General Category',
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
    }).then((res) => {
      if (res.success) {
        receipt.email_status = 'sent'
      } else {
        receipt.email_status = 'failed'
      }
    })

    return NextResponse.json({
      success: true,
      vote,
      payment,
      receipt,
    })
  } catch (err: any) {
    console.error('Error in verify-payment:', err)
    return NextResponse.json({ success: false, error: err.message || 'Verification error' }, { status: 500 })
  }
}
