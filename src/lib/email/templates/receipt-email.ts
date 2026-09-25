import { formatCurrency, formatDateTime } from '@/lib/utils'
import { getAppUrl } from '@/lib/email/resend'

export interface ReceiptEmailData {
  eventName: string
  eventLogo?: string | null
  nomineeName: string
  categoryName: string
  receiptNumber: string
  publicId: string
  voterEmail: string
  quantity: number
  unitPrice: number
  totalAmount: number
  currency: string
  paymentReference: string
  issuedAt: string
}

export function generateReceiptEmailHtml(data: ReceiptEmailData): string {
  const appUrl = getAppUrl()
  const verifyUrl = `${appUrl}/receipt/${data.publicId}`

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Official Voting Receipt [${data.receiptNumber}]</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #040404;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #e2e8f0;
      -webkit-font-smoothing: antialiased;
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
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(201, 168, 76, 0.08);
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
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 900;
      color: #ffffff;
      letter-spacing: -0.02em;
    }
    .subtitle {
      margin: 0 0 16px 0;
      font-size: 14px;
      color: #94a3b8;
    }
    .badge-verified {
      display: inline-flex;
      align-items: center;
      padding: 5px 14px;
      background-color: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.35);
      border-radius: 9999px;
      color: #34d399;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.04em;
    }
    .content {
      padding: 28px;
    }
    .greeting {
      font-size: 14px;
      line-height: 1.6;
      color: #cbd5e1;
      margin: 0 0 24px 0;
    }
    .receipt-box {
      background-color: #0e1018;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      padding: 20px;
      margin-bottom: 24px;
    }
    .row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px dashed rgba(255, 255, 255, 0.08);
      font-size: 13px;
    }
    .row:last-child {
      border-bottom: none;
    }
    .label {
      color: #94a3b8;
      font-weight: 500;
    }
    .val {
      color: #ffffff;
      font-weight: 700;
      text-align: right;
    }
    .val-gold {
      color: #C9A84C;
      font-weight: 800;
    }
    .val-mono {
      font-family: SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 12px;
      color: #cbd5e1;
    }
    .total-divider {
      margin-top: 8px;
      padding-top: 14px;
      border-top: 2px solid rgba(201, 168, 76, 0.4);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .total-label {
      font-size: 14px;
      font-weight: 700;
      color: #ffffff;
    }
    .total-amount {
      font-size: 22px;
      font-weight: 900;
      color: #C9A84C;
    }
    .btn-verify {
      display: block;
      width: 100%;
      box-sizing: border-box;
      text-align: center;
      background: linear-gradient(135deg, #C9A84C 0%, #D4B86A 100%);
      color: #050608 !important;
      text-decoration: none;
      padding: 15px 24px;
      border-radius: 9999px;
      font-weight: 900;
      font-size: 14px;
      letter-spacing: 0.02em;
      box-shadow: 0 8px 20px rgba(201, 168, 76, 0.25);
      margin-bottom: 16px;
    }
    .footer {
      padding: 24px 28px;
      background-color: #07080c;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      text-align: center;
      font-size: 11px;
      color: #64748b;
      line-height: 1.6;
    }
    .footer a {
      color: #C9A84C;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="top-gold-bar"></div>
      
      <div class="header">
        <div class="brand-pill">JVican Vote Arena</div>
        <h1 class="title">${data.eventName}</h1>
        <div class="subtitle">Official Verified Voting Receipt</div>
        <div class="badge-verified">✓ Cryptographically Confirmed &amp; Recorded</div>
      </div>

      <div class="content">
        <p class="greeting">
          Hello, thank you for participating in <strong>${data.eventName}</strong>. Your vote for <strong>${data.nomineeName}</strong> in the <strong>${data.categoryName}</strong> bracket has been verified by the payment engine and authoritatively added to the public leaderboard.
        </p>

        <div class="receipt-box">
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
            <tr class="row">
              <td class="label" style="padding: 8px 0;">Receipt Number</td>
              <td class="val val-gold" style="padding: 8px 0; text-align: right;">${data.receiptNumber}</td>
            </tr>
            <tr class="row">
              <td class="label" style="padding: 8px 0;">Nominee</td>
              <td class="val" style="padding: 8px 0; text-align: right;">${data.nomineeName}</td>
            </tr>
            <tr class="row">
              <td class="label" style="padding: 8px 0;">Category</td>
              <td class="val" style="padding: 8px 0; text-align: right;">${data.categoryName}</td>
            </tr>
            <tr class="row">
              <td class="label" style="padding: 8px 0;">Votes Cast</td>
              <td class="val val-gold" style="padding: 8px 0; text-align: right;">${data.quantity.toLocaleString()} vote${data.quantity > 1 ? 's' : ''}</td>
            </tr>
            <tr class="row">
              <td class="label" style="padding: 8px 0;">Unit Price</td>
              <td class="val" style="padding: 8px 0; text-align: right;">${formatCurrency(data.unitPrice, data.currency)}</td>
            </tr>
            <tr class="row">
              <td class="label" style="padding: 8px 0;">Payment Reference</td>
              <td class="val val-mono" style="padding: 8px 0; text-align: right;">${data.paymentReference}</td>
            </tr>
            <tr class="row">
              <td class="label" style="padding: 8px 0;">Issued Date &amp; Time</td>
              <td class="val" style="padding: 8px 0; text-align: right;">${formatDateTime(data.issuedAt)}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding-top: 14px; border-top: 2px solid rgba(201, 168, 76, 0.4);">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td class="total-label" style="font-size: 14px; font-weight: 700; color: #ffffff;">Total Amount Paid</td>
                    <td class="total-amount" style="font-size: 20px; font-weight: 900; color: #C9A84C; text-align: right;">${formatCurrency(data.totalAmount, data.currency)}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </div>

        <a href="${verifyUrl}" class="btn-verify" target="_blank">View Verified Receipt</a>
        
        <p style="text-align: center; font-size: 11px; color: #64748b; margin: 12px 0 0 0;">
          Direct Verification Link: <a href="${verifyUrl}" style="color: #C9A84C; word-break: break-all;">${verifyUrl}</a>
        </p>
      </div>

      <div class="footer">
        This is an automated transactional receipt from <strong>JVican Vote Arena</strong>.<br>
        Voter Email: ${data.voterEmail} • Public Verification ID: ${data.publicId}<br>
        © ${new Date().getFullYear()} JVican Vote Arena. All transactions are final and audited.
      </div>
    </div>
  </div>
</body>
</html>
  `.trim()
}
