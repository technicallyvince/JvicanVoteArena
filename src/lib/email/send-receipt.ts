import { sendEmail, getAppUrl, EMAIL_FROM_RECEIPTS } from './resend';
import { generateReceiptEmailHtml, ReceiptEmailData } from './templates/receipt-email';
import { db } from '../db';
import { Receipt, Vote, Event, Nominee, Category } from '@/types/database';

export interface SendReceiptEmailParams {
  receipt: Receipt;
  vote: Vote;
  event: Event;
  category?: Category;
  nominee?: Nominee;
  recipientEmail?: string;
}

export async function sendReceiptEmail(params: SendReceiptEmailParams) {
  const { receipt, vote, event, category, nominee, recipientEmail } = params;
  
  const toEmail = recipientEmail || vote.voter_email || receipt.voter_email;
  if (!toEmail) {
    console.warn(`[sendReceiptEmail] No email available for receipt ${receipt.id}`);
    return { success: false, error: 'No recipient email found' };
  }

  const idempotencyKey = `receipt-${receipt.id}-${vote.payment_reference}`;

  const emailData: ReceiptEmailData = {
    eventName: event.name,
    eventLogo: event.logo_url || null,
    nomineeName: nominee?.name || 'Nominee',
    categoryName: category?.name || 'General Category',
    receiptNumber: receipt.receipt_number || vote.payment_reference,
    publicId: receipt.public_id || receipt.id,
    voterEmail: toEmail,
    quantity: vote.quantity || 1,
    unitPrice: vote.unit_price || 0,
    totalAmount: vote.total_amount || receipt.amount || 0,
    currency: vote.currency || receipt.currency || 'USD',
    paymentReference: vote.payment_reference,
    issuedAt: receipt.issued_at || receipt.created_at,
  };

  const html = generateReceiptEmailHtml(emailData);

  const result = await sendEmail({
    type: 'RECEIPT',
    to: toEmail,
    from: EMAIL_FROM_RECEIPTS,
    subject: `Official Voting Receipt [${emailData.receiptNumber}] - ${event.name}`,
    html,
    relatedResourceType: 'receipt',
    relatedResourceId: receipt.id,
    idempotencyKey,
  });

  return result;
}
