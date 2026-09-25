import { getAppUrl } from '@/lib/email/resend'

export interface EventNotificationEmailData {
  type: 'EVENT_SUBMITTED' | 'EVENT_APPROVED' | 'EVENT_REJECTED'
  organizerName: string
  organizerEmail: string
  eventName: string
  eventId: string
  eventSlug?: string
  rejectionReason?: string | null
}

export function generateEventNotificationEmailHtml(data: EventNotificationEmailData): string {
  const appUrl = getAppUrl()
  const manageUrl = `${appUrl}/dashboard/events/${data.eventId}`
  const publicUrl = data.eventSlug ? `${appUrl}/events/${data.eventSlug}` : `${appUrl}/events`

  const config = {
    EVENT_SUBMITTED: {
      badge: '⏳ Submission Received • In Review',
      badgeColor: '#fbbf24',
      badgeBg: 'rgba(245, 158, 11, 0.15)',
      badgeBorder: 'rgba(245, 158, 11, 0.35)',
      title: 'Event Submitted for Review',
      headline: `Your event <strong>"${data.eventName}"</strong> is undergoing verification`,
      message: `Thank you for submitting your event on <strong>JVican Vote Arena</strong>. Our Super Admin compliance team has received your submission. We review contest rules, categories, and nominee brackets to ensure total integrity. You will receive an email as soon as your contest is approved.`,
      btnText: 'Manage Event in Dashboard',
      btnUrl: manageUrl,
      note: 'You can continue setting up nominees and previewing your event layout while in review mode.',
    },
    EVENT_APPROVED: {
      badge: '✓ Verified & Live on Marketplace',
      badgeColor: '#34d399',
      badgeBg: 'rgba(16, 185, 129, 0.15)',
      badgeBorder: 'rgba(16, 185, 129, 0.35)',
      title: 'Event Approved & Published!',
      headline: `Congratulations! <strong>"${data.eventName}"</strong> is now live`,
      message: `Your event has been approved by the Chief Super Admin and is now fully active on the <strong>JVican Public Marketplace</strong>. Voters can now browse categories, cast verified votes, and view live results.`,
      btnText: 'Open Event Dashboard',
      btnUrl: manageUrl,
      secondaryBtnText: 'View Live Public Page',
      secondaryBtnUrl: publicUrl,
      note: 'Share your public voting link with contestants and audiences to start receiving votes.',
    },
    EVENT_REJECTED: {
      badge: '✕ Action Required • Event Returned',
      badgeColor: '#f87171',
      badgeBg: 'rgba(239, 68, 68, 0.15)',
      badgeBorder: 'rgba(239, 68, 68, 0.35)',
      title: 'Event Revision Needed',
      headline: `Action required for <strong>"${data.eventName}"</strong>`,
      message: `Your event submission requires revision before it can be published to the public marketplace. Please review the specific feedback provided by the Super Admin below, update your event settings, and resubmit.`,
      btnText: 'Edit & Resubmit Event',
      btnUrl: manageUrl,
      note: 'Once you update and resubmit, your event will be prioritized for expedited review.',
    },
  }[data.type]

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.title} - JVican Vote Arena</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #040404;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #e2e8f0;
    }
    .wrapper {
      width: 100%;
      background-color: #040404;
      padding: 30px 12px;
      box-sizing: border-box;
    }
    .container {
      max-width: 580px;
      margin: 0 auto;
      background-color: #0a0c14;
      border: 1px solid rgba(201, 168, 76, 0.25);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
    }
    .top-gold-bar {
      height: 4px;
      background: linear-gradient(90deg, #7A5C1E 0%, #C9A84C 50%, #D4B86A 100%);
    }
    .header {
      padding: 32px 28px 24px;
      text-align: center;
      background: radial-gradient(circle at 50% 0%, rgba(201, 168, 76, 0.12) 0%, transparent 70%);
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }
    .brand-pill {
      display: inline-block;
      padding: 4px 14px;
      background-color: rgba(201, 168, 76, 0.12);
      border: 1px solid rgba(201, 168, 76, 0.3);
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #D4B86A;
      margin-bottom: 12px;
    }
    .title {
      margin: 0 0 12px 0;
      font-size: 22px;
      font-weight: 900;
      color: #ffffff;
    }
    .badge {
      display: inline-block;
      padding: 5px 14px;
      background-color: ${config.badgeBg};
      border: 1px solid ${config.badgeBorder};
      border-radius: 9999px;
      color: ${config.badgeColor};
      font-size: 12px;
      font-weight: 700;
    }
    .content {
      padding: 28px;
    }
    .greeting {
      font-size: 15px;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 12px 0;
    }
    .text {
      font-size: 14px;
      line-height: 1.6;
      color: #cbd5e1;
      margin: 0 0 20px 0;
    }
    .reason-box {
      background-color: rgba(239, 68, 68, 0.08);
      border: 1px solid rgba(239, 68, 68, 0.25);
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 24px;
    }
    .reason-title {
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #f87171;
      margin-bottom: 6px;
    }
    .reason-text {
      font-size: 13px;
      color: #fee2e2;
      line-height: 1.5;
      margin: 0;
    }
    .btn-main {
      display: block;
      width: 100%;
      box-sizing: border-box;
      text-align: center;
      background: linear-gradient(135deg, #C9A84C 0%, #D4B86A 100%);
      color: #050608 !important;
      text-decoration: none;
      padding: 14px 20px;
      border-radius: 9999px;
      font-weight: 900;
      font-size: 14px;
      margin-bottom: 12px;
    }
    .btn-sub {
      display: block;
      width: 100%;
      box-sizing: border-box;
      text-align: center;
      background-color: #0e1018;
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #cbd5e1 !important;
      text-decoration: none;
      padding: 12px 20px;
      border-radius: 9999px;
      font-weight: 700;
      font-size: 13px;
      margin-bottom: 16px;
    }
    .note {
      font-size: 12px;
      color: #94a3b8;
      text-align: center;
      margin: 16px 0 0 0;
    }
    .footer {
      padding: 20px 28px;
      background-color: #07080c;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      text-align: center;
      font-size: 11px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="top-gold-bar"></div>
      
      <div class="header">
        <div class="brand-pill">JVican Organizer Hub</div>
        <h1 class="title">${config.title}</h1>
        <div class="badge">${config.badge}</div>
      </div>

      <div class="content">
        <div class="greeting">Hello ${data.organizerName || 'Organizer'},</div>
        <p class="text">${config.message}</p>

        ${
          data.type === 'EVENT_REJECTED' && data.rejectionReason
            ? `
          <div class="reason-box">
            <div class="reason-title">Super Admin Feedback</div>
            <p class="reason-text">${data.rejectionReason}</p>
          </div>
        `
            : ''
        }

        <a href="${config.btnUrl}" class="btn-main" target="_blank">${config.btnText}</a>

        ${
          (config as any).secondaryBtnText
            ? `<a href="${(config as any).secondaryBtnUrl}" class="btn-sub" target="_blank">${(config as any).secondaryBtnText}</a>`
            : ''
        }

        <p class="note">${config.note}</p>
      </div>

      <div class="footer">
        JVican Vote Arena Organizer Notifications.<br>
        Sent to: ${data.organizerEmail} • Event ID: ${data.eventId}
      </div>
    </div>
  </div>
</body>
</html>
  `.trim()
}
