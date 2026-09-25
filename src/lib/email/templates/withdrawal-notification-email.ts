import { getAppUrl } from '../resend';

export interface WithdrawalNotificationData {
  recipientName: string;
  status: 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'FAILED';
  amount: number;
  currency?: string;
  withdrawalId: string;
  accountDetails?: {
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
  };
  rejectionReason?: string;
  failureReason?: string;
  estimatedArrival?: string;
  date: string;
}

export function generateWithdrawalNotificationEmailHtml(data: WithdrawalNotificationData): string {
  const appUrl = getAppUrl();
  const dashboardUrl = `${appUrl}/dashboard/wallet`;
  const currency = data.currency || 'USD';
  const formattedAmount = `${currency === 'USD' ? '$' : currency + ' '}${data.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const statusConfig = {
    REQUESTED: {
      badgeText: 'WITHDRAWAL REQUESTED',
      badgeBg: 'rgba(234, 179, 8, 0.15)',
      badgeBorder: 'rgba(234, 179, 8, 0.3)',
      badgeColor: '#eab308',
      headline: 'Withdrawal Request Received',
      subtext: `We have received your withdrawal request of ${formattedAmount}. It is currently under review by our finance operations team.`,
      icon: '⏳'
    },
    APPROVED: {
      badgeText: 'WITHDRAWAL APPROVED',
      badgeBg: 'rgba(16, 185, 129, 0.15)',
      badgeBorder: 'rgba(16, 185, 129, 0.3)',
      badgeColor: '#10b981',
      headline: 'Withdrawal Approved & Processing',
      subtext: `Your withdrawal request of ${formattedAmount} has been approved and sent to our payout provider for execution.`,
      icon: '✓'
    },
    REJECTED: {
      badgeText: 'WITHDRAWAL REJECTED',
      badgeBg: 'rgba(239, 68, 68, 0.15)',
      badgeBorder: 'rgba(239, 68, 68, 0.3)',
      badgeColor: '#ef4444',
      headline: 'Withdrawal Request Not Approved',
      subtext: `Your withdrawal request of ${formattedAmount} could not be approved at this time. The funds have been returned to your wallet balance.`,
      icon: '✕'
    },
    COMPLETED: {
      badgeText: 'PAYOUT COMPLETED',
      badgeBg: 'rgba(16, 185, 129, 0.15)',
      badgeBorder: 'rgba(16, 185, 129, 0.3)',
      badgeColor: '#10b981',
      headline: 'Funds Dispatched Successfully',
      subtext: `Good news! Your payout of ${formattedAmount} has been successfully settled by the payout gateway.`,
      icon: '💰'
    },
    FAILED: {
      badgeText: 'PAYOUT FAILED',
      badgeBg: 'rgba(239, 68, 68, 0.15)',
      badgeBorder: 'rgba(239, 68, 68, 0.3)',
      badgeColor: '#ef4444',
      headline: 'Payout Execution Failed',
      subtext: `Our payout provider encountered an issue while transferring ${formattedAmount}. Your organizer wallet balance has been credited back.`,
      icon: '⚠️'
    }
  }[data.status];

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${statusConfig.headline} - JVican Vote Arena</title>
</head>
<body style="margin: 0; padding: 0; background-color: #050507; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f3f4f6; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #050507; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Container -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background: linear-gradient(180deg, #111116 0%, #0c0c10 100%); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);">
          
          <!-- Top Header Accent -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, #10b981 0%, #f59e0b 50%, #6366f1 100%);"></td>
          </tr>

          <!-- Header / Logo -->
          <tr>
            <td style="padding: 36px 40px 24px; text-align: center;">
              <table border="0" cellspacing="0" cellpadding="0" align="center" style="margin: 0 auto;">
                <tr>
                  <td style="vertical-align: middle; padding-right: 12px;">
                    <div style="width: 38px; height: 38px; border-radius: 10px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); display: inline-block; text-align: center; line-height: 38px; color: #000; font-weight: 900; font-size: 20px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);">
                      J
                    </div>
                  </td>
                  <td style="vertical-align: middle;">
                    <span style="font-size: 24px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff; display: block;">
                      JVICAN <span style="background: linear-gradient(90deg, #10b981, #34d399); -webkit-background-clip: text; -webkit-text-fill-color: transparent; color: #10b981;">ARENA</span>
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Status Indicator -->
          <tr>
            <td style="padding: 0 40px 28px; text-align: center;">
              <div style="display: inline-block; padding: 6px 16px; border-radius: 9999px; background-color: ${statusConfig.badgeBg}; border: 1px solid ${statusConfig.badgeBorder}; color: ${statusConfig.badgeColor}; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">
                ${statusConfig.badgeText}
              </div>
              <h1 style="margin: 18px 0 10px; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                ${statusConfig.headline}
              </h1>
              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #9ca3af; max-width: 460px; margin-left: auto; margin-right: auto;">
                ${statusConfig.subtext}
              </p>
            </td>
          </tr>

          <!-- Summary Box -->
          <tr>
            <td style="padding: 0 40px 28px;">
              <div style="background-color: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 14px; padding: 24px;">
                
                <!-- Amount Block -->
                <div style="text-align: center; padding-bottom: 20px; margin-bottom: 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
                  <div style="font-size: 12px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Withdrawal Amount</div>
                  <div style="font-size: 32px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">${formattedAmount}</div>
                  <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Ref ID: #${data.withdrawalId}</div>
                </div>

                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding: 6px 0; font-size: 13px; color: #9ca3af;">Beneficiary:</td>
                    <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #ffffff; text-align: right;">${data.recipientName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 13px; color: #9ca3af;">Date & Time:</td>
                    <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #ffffff; text-align: right;">${data.date}</td>
                  </tr>
                  ${data.accountDetails?.bankName ? `
                  <tr>
                    <td style="padding: 6px 0; font-size: 13px; color: #9ca3af;">Destination Bank:</td>
                    <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #ffffff; text-align: right;">${data.accountDetails.bankName}</td>
                  </tr>
                  ` : ''}
                  ${data.accountDetails?.accountNumber ? `
                  <tr>
                    <td style="padding: 6px 0; font-size: 13px; color: #9ca3af;">Account Number:</td>
                    <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #ffffff; text-align: right;">${data.accountDetails.accountNumber}</td>
                  </tr>
                  ` : ''}
                  ${data.estimatedArrival ? `
                  <tr>
                    <td style="padding: 6px 0; font-size: 13px; color: #9ca3af;">Est. Settlement:</td>
                    <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #34d399; text-align: right;">${data.estimatedArrival}</td>
                  </tr>
                  ` : ''}
                </table>

                ${data.rejectionReason ? `
                <div style="margin-top: 18px; padding: 14px; background-color: rgba(239, 68, 68, 0.08); border-left: 3px solid #ef4444; border-radius: 6px;">
                  <div style="font-size: 12px; font-weight: 700; color: #f87171; text-transform: uppercase; margin-bottom: 4px;">Rejection Reason</div>
                  <div style="font-size: 13px; color: #fca5a5; line-height: 1.5;">${data.rejectionReason}</div>
                </div>
                ` : ''}

                ${data.failureReason ? `
                <div style="margin-top: 18px; padding: 14px; background-color: rgba(239, 68, 68, 0.08); border-left: 3px solid #ef4444; border-radius: 6px;">
                  <div style="font-size: 12px; font-weight: 700; color: #f87171; text-transform: uppercase; margin-bottom: 4px;">Gateway Failure Detail</div>
                  <div style="font-size: 13px; color: #fca5a5; line-height: 1.5;">${data.failureReason}</div>
                </div>
                ` : ''}
              </div>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 40px 36px; text-align: center;">
              <table border="0" cellspacing="0" cellpadding="0" align="center" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="border-radius: 12px; background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                    <a href="${dashboardUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 14px; font-weight: 700; color: #000000; text-decoration: none; border-radius: 12px; letter-spacing: 0.3px;">
                      Open Wallet & Payouts →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="border-top: 1px solid rgba(255, 255, 255, 0.06);"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px 36px; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #6b7280;">
                Secured by JVican Arena Payout Gateway. This is a transactional account notification.
              </p>
              <p style="margin: 0; font-size: 11px; color: #4b5563;">
                © ${new Date().getFullYear()} JVican Vote Arena. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
