import { sendEmail, getAppUrl, EMAIL_FROM_RECEIPTS, SendEmailResult } from './resend'
import { generateReceiptEmailHtml, ReceiptEmailData } from './templates/receipt-email'
import { db } from '../db'

export interface SendReceiptParams {
  to: string
  subject: string
  props: {
    eventName: string
    eventLogo?: string | null
    nomineeName: string
    categoryName: string
    receiptNumber: string
    publicId: string
    voterEmail: string
    quantity: number
    unitPrice?: number
    totalAmount: number
    currency: string
    paymentReference: string
    issuedAt: string
  }
}

export async function sendReceiptEmail(params: SendReceiptParams): Promise<SendEmailResult> {
  const { to, subject, props } = params

  if (!to) {
    return { success: false, error: 'Recipient email is required' }
  }

  const idempotencyKey = `receipt-${props.publicId}-${props.paymentReference}`

  const emailData: ReceiptEmailData = {
    eventName: props.eventName,
    eventLogo: props.eventLogo ?? null,
    nomineeName: props.nomineeName,
    categoryName: props.categoryName,
    receiptNumber: props.receiptNumber,
    publicId: props.publicId,
    voterEmail: props.voterEmail,
    quantity: props.quantity,
    unitPrice: props.unitPrice ?? 0,
    totalAmount: props.totalAmount,
    currency: props.currency,
    paymentReference: props.paymentReference,
    issuedAt: props.issuedAt,
  }

  const html = generateReceiptEmailHtml(emailData)

  return await sendEmail({
    type: 'RECEIPT',
    to,
    from: EMAIL_FROM_RECEIPTS,
    subject: subject || `Official Voting Receipt [${props.receiptNumber}] - ${props.eventName}`,
    html,
    relatedResourceType: 'receipt',
    relatedResourceId: props.publicId,
    idempotencyKey,
  })
}

