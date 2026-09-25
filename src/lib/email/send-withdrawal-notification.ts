import { sendEmail, EMAIL_FROM_NOTIFICATIONS } from './resend';
import { generateWithdrawalNotificationEmailHtml, WithdrawalNotificationData } from './templates/withdrawal-notification-email';
import { WithdrawalRequest } from '@/types/database';

export interface SendWithdrawalNotificationEmailParams {
  withdrawal: WithdrawalRequest;
  status: 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'FAILED';
  organizerEmail?: string;
  organizerName?: string;
  rejectionReason?: string;
  failureReason?: string;
  estimatedArrival?: string;
}

export async function sendWithdrawalNotificationEmail(params: SendWithdrawalNotificationEmailParams) {
  const { withdrawal, status, organizerEmail, organizerName, rejectionReason, failureReason, estimatedArrival } = params;

  const toEmail = organizerEmail || withdrawal.organizer_email;
  if (!toEmail) {
    return { success: false, error: 'Organizer email is required' };
  }

  const idempotencyKey = `withdrawal-${status.toLowerCase()}-${withdrawal.id}-${withdrawal.updated_at || withdrawal.created_at}`;

  const emailData: WithdrawalNotificationData = {
    recipientName: organizerName || withdrawal.organizer_name || 'Organizer',
    status,
    amount: withdrawal.amount,
    currency: withdrawal.currency || 'USD',
    withdrawalId: withdrawal.id,
    accountDetails: {
      bankName: withdrawal.payout_bank,
      accountNumber: withdrawal.payout_account_number,
      accountName: withdrawal.payout_account_name,
    },
    rejectionReason: rejectionReason || withdrawal.rejection_reason || undefined,
    failureReason,
    estimatedArrival,
    date: new Date(withdrawal.updated_at || withdrawal.created_at).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }),
  };

  const html = generateWithdrawalNotificationEmailHtml(emailData);

  const subjectMap = {
    REQUESTED: `Withdrawal Request Received ($${withdrawal.amount}) - JVican Arena`,
    APPROVED: `Withdrawal Approved ($${withdrawal.amount}) - JVican Arena`,
    REJECTED: `Withdrawal Request Declined - JVican Arena`,
    COMPLETED: `Payout Completed: $${withdrawal.amount} Dispatched - JVican Arena`,
    FAILED: `Action Required: Payout Failed ($${withdrawal.amount}) - JVican Arena`,
  };

  const typeMap = {
    REQUESTED: 'WITHDRAWAL_REQUESTED' as const,
    APPROVED: 'WITHDRAWAL_APPROVED' as const,
    REJECTED: 'WITHDRAWAL_REJECTED' as const,
    COMPLETED: 'WITHDRAWAL_COMPLETED' as const,
    FAILED: 'WITHDRAWAL_FAILED' as const,
  };

  return await sendEmail({
    type: typeMap[status],
    to: toEmail,
    from: EMAIL_FROM_NOTIFICATIONS,
    subject: subjectMap[status],
    html,
    relatedResourceType: 'withdrawal',
    relatedResourceId: withdrawal.id,
    idempotencyKey,
  });
}
