import { sendEmail, EMAIL_FROM_NOTIFICATIONS } from './resend';
import { generatePaymentStatusEmailHtml, PaymentStatusEmailData } from './templates/payment-status-email';
import { Payment, Event, Nominee } from '@/types/database';

export interface SendPaymentStatusEmailParams {
  payment: Payment;
  status: 'successful' | 'failed' | 'pending';
  event?: Event;
  nominee?: Nominee;
  recipientEmail?: string;
  failureReason?: string;
  receiptPublicId?: string;
}

export async function sendPaymentStatusEmail(params: SendPaymentStatusEmailParams) {
  const { payment, status, event, nominee, recipientEmail, failureReason, receiptPublicId } = params;

  const toEmail = recipientEmail || payment.voter_email;
  if (!toEmail) {
    return { success: false, error: 'No recipient email found' };
  }

  const idempotencyKey = `payment-${status}-${payment.id}-${payment.payment_reference}`;

  const emailData: PaymentStatusEmailData = {
    status,
    voterEmail: toEmail,
    amount: payment.amount || 0,
    currency: payment.currency || 'USD',
    paymentReference: payment.payment_reference,
    eventName: event?.name || 'JVican Contest Event',
    nomineeName: nominee?.name,
    failureReason,
    receiptPublicId,
  };

  const html = generatePaymentStatusEmailHtml(emailData);

  const subjectMap = {
    successful: `Payment Confirmed: ${payment.payment_reference} - JVican Arena`,
    failed: `Payment Unsuccessful: Reference ${payment.payment_reference} - JVican Arena`,
    pending: `Payment Pending Verification: Reference ${payment.payment_reference} - JVican Arena`,
  };

  const emailTypeMap = {
    successful: 'PAYMENT_SUCCESS' as const,
    failed: 'PAYMENT_FAILED' as const,
    pending: 'PAYMENT_PENDING' as const,
  };

  return await sendEmail({
    type: emailTypeMap[status],
    to: toEmail,
    from: EMAIL_FROM_NOTIFICATIONS,
    subject: subjectMap[status],
    html,
    relatedResourceType: 'payment',
    relatedResourceId: payment.id,
    idempotencyKey,
  });
}
