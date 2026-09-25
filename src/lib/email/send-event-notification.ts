import { sendEmail, EMAIL_FROM_NOTIFICATIONS } from './resend';
import { generateEventNotificationEmailHtml, EventNotificationEmailData } from './templates/event-notification-email';
import { Event } from '@/types/database';

export interface SendEventNotificationEmailParams {
  event: Event;
  status: 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  organizerEmail: string;
  organizerName?: string;
  rejectionReason?: string;
}

export async function sendEventNotificationEmail(params: SendEventNotificationEmailParams) {
  const { event, status, organizerEmail, organizerName, rejectionReason } = params;

  if (!organizerEmail) {
    return { success: false, error: 'Organizer email is required' };
  }

  const statusTypeMap: Record<'SUBMITTED' | 'APPROVED' | 'REJECTED', 'EVENT_SUBMITTED' | 'EVENT_APPROVED' | 'EVENT_REJECTED'> = {
    SUBMITTED: 'EVENT_SUBMITTED',
    APPROVED: 'EVENT_APPROVED',
    REJECTED: 'EVENT_REJECTED',
  };

  const type = statusTypeMap[status];

  // Idempotency key per event status transition (e.g. event-approved-ev123)
  const idempotencyKey = `event-${status.toLowerCase()}-${event.id}-${event.updated_at || event.created_at}`;

  const emailData: EventNotificationEmailData = {
    type,
    organizerName: organizerName || event.organizer_name || 'Organizer',
    organizerEmail,
    eventName: event.name,
    eventId: event.id,
    eventSlug: event.slug,
    rejectionReason: rejectionReason || event.rejection_reason || null,
  };

  const html = generateEventNotificationEmailHtml(emailData);

  const subjectMap = {
    SUBMITTED: `Event Submitted for Review: "${event.name}" - JVican Arena`,
    APPROVED: `🎉 Congratulations! Your Event "${event.name}" Has Been Approved`,
    REJECTED: `Update on your Event Submission: "${event.name}" - JVican Arena`,
  };

  return await sendEmail({
    type,
    to: organizerEmail,
    from: EMAIL_FROM_NOTIFICATIONS,
    subject: subjectMap[status],
    html,
    relatedResourceType: 'event',
    relatedResourceId: event.id,
    idempotencyKey,
  });
}
