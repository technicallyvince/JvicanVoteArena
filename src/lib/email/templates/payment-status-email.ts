import { formatCurrency, formatDateTime } from '@/lib/utils'
import { getAppUrl } from '@/lib/email/resend'

export interface PaymentStatusEmailData {
  status: 'successful' | 'failed' | 'pending'
  voterEmail: string
  amount: number
  currency: string
  paymentReference: string
  eventName: string
  nomineeName?: string
  failureReason?: string
  receiptPublicId?: string
}

export function generatePaymentStatusEmailHtml(data: PaymentStatusEmailData): string {
  const appUrl = getAppUrl()
  const receiptUrl = data.receiptPublicId ? `${appUrl}/receipt/${data.receiptPublicId}` : `${appUrl}/events`

  const statusConfig = {
    successful: {
      badge: '✓ Payment Verified & Successful',
      badgeColor: '#34d399',
      badgeBg: 'rgba(16, 185, 129, 0.15)',
      badgeBorder: 'rgba(16, 185, 129, 0.35)',
      title: 'Payment Confirmed',
      message: `Your payment of <strong>${formatCurrency(data.amount, data.currency)}</strong> for <strong>${data.eventName}</strong> (${data.nomineeName ? `supporting ${data.nomineeName}` : 'voting'}) was successfully verified. Your votes have been recorded.`,
      btnText: 'View Official Receipt',
      btnUrl: receiptUrl,
    },
    failed: {
      badge: '✕ Payment Unsuccessful',
      badgeColor: '#f87171',
      badgeBg: 'rgba(239, 68, 68, 0.15)',
      badgeBorder: 'rgba(239, 68, 68, 0.35)',
      title: 'Payment Failed',
      message: `Your payment transaction for <strong>${data.eventName}</strong> could not be processed. ${data.failureReason ? `<strong>Reason:</strong> ${data.failureReason}. ` : ''}<strong>Important:</strong> No votes were recorded on the contest ledger and your card was not charged.`,
      btnText: 'Try Voting Again',
      btnUrl: `${appUrl}/events`,
    },
    pending: {
      badge: '⏳ Payment Verification In Progress',
      badgeColor: '#fbbf24',
      badgeBg: 'rgba(245, 158, 11, 0.15)',
      badgeBorder: 'rgba(245, 158, 11, 0.35)',
      title: 'Payment Verification In Progress',
      message: `We received your payment order of <strong>${formatCurrency(data.amount, data.currency)}</strong> for <strong>${data.eventName}</strong>. TransactPay is verifying the bank settlement. Once confirmed, your votes will automatically be added and a verified receipt will be delivered.`,
      btnText: 'Check Event Standings',
      btnUrl: `${appUrl}/events`,
    },
  }[data.status]

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${statusConfig.title} - JVican Vote Arena</title>
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
      background-color: ${statusConfig.badgeBg};
      border: 1px solid ${statusConfig.badgeBorder};
      border-radius: 9999px;
      color: ${statusConfig.badgeColor};
      font-size: 12px;
      font-weight: 700;
    }
    .content {
      padding: 28px;
    }
    .text {
      font-size: 14px;
      line-height: 1.6;
      color: #cbd5e1;
      margin: 0 0 20px 0;
    }
    .details-card {
      background-color: #0e1018;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 24px;
      font-size: 13px;
    }
    .btn {
      display: block;
      width: 100%;
      box-sizing: border-box;
      text-align: center;
      background: linear-gradient(135deg, #C9A84C 0%, #D4B86A 100%);
      color: #050608 !important;
      text-decoration: none;
      padding: 14px 20px;
      border-radius: 9999px;
      font-weight: 800;
      font-size: 14px;
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
        <div class="brand-pill">JVican Vote Arena</div>
        <h1 class="title">${statusConfig.title}</h1>
        <div class="badge">${statusConfig.badge}</div>
      </div>

      <div class="content">
        <p class="text">${statusConfig.message}</p>

        <div class="details-card">
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
            <tr>
              <td style="color: #94a3b8; padding: 6px 0;">Event</td>
              <td style="color: #ffffff; font-weight: 700; text-align: right; padding: 6px 0;">${data.eventName}</td>
            </tr>
            <tr>
              <td style="color: #94a3b8; padding: 6px 0;">Amount</td>
              <td style="color: #C9A84C; font-weight: 800; text-align: right; padding: 6px 0;">${formatCurrency(data.amount, data.currency)}</td>
            </tr>
            <tr>
              <td style="color: #94a3b8; padding: 6px 0;">Payment Reference</td>
              <td style="color: #cbd5e1; font-family: monospace; text-align: right; padding: 6px 0;">${data.paymentReference}</td>
            </tr>
          </table>
        </div>

        <a href="${statusConfig.btnUrl}" class="btn" target="_blank">${statusConfig.btnText}</a>
      </div>

      <div class="footer">
        Automated payment status notification from JVican Vote Arena.<br>
        Recipient: ${data.voterEmail}
      </div>
    </div>
  </div>
</body>
</html>
  `.trim()
}
