export interface OtpEmailData {
  email: string
  otp: string
  name?: string
  expiresInMinutes?: number
}

export function generateOtpEmailHtml(data: OtpEmailData): string {
  const { otp, name, expiresInMinutes = 10 } = data

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Verification Code - JVican Vote Arena</title>
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
      padding: 40px 10px;
    }
    .container {
      max-width: 540px;
      margin: 0 auto;
      background: #0a0c14;
      border: 1px solid rgba(201, 168, 76, 0.25);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 50px rgba(0,0,0,0.8);
    }
    .header {
      padding: 32px 24px;
      text-align: center;
      background: linear-gradient(180deg, #101424 0%, #0a0c14 100%);
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }
    .brand-badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 800;
      color: #C9A84C;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .title {
      font-size: 20px;
      font-weight: 900;
      color: #ffffff;
      margin: 0;
    }
    .content {
      padding: 32px 28px;
    }
    .otp-card {
      background: #121626;
      border: 1px solid rgba(201, 168, 76, 0.35);
      border-radius: 16px;
      padding: 24px;
      text-align: center;
      margin: 24px 0;
    }
    .otp-code {
      font-size: 36px;
      font-weight: 900;
      letter-spacing: 8px;
      color: #C9A84C;
      margin: 10px 0;
      font-family: monospace, Courier, monospace;
    }
    .footer {
      padding: 24px;
      text-align: center;
      font-size: 11px;
      color: #64748b;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      background-color: #07080d;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="brand-badge">JVican Vote Arena Security</div>
        <h1 class="title">Verification Code</h1>
      </div>
      <div class="content">
        <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1; margin-top: 0;">
          Hello ${name ? name : 'there'},
        </p>
        <p style="font-size: 13px; line-height: 1.6; color: #94a3b8;">
          You requested a verification code to authenticate into your JVican Vote Arena account. Enter this code to complete sign in / verification:
        </p>
        <div class="otp-card">
          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8;">
            One-Time Passcode (OTP)
          </div>
          <div class="otp-code">${otp}</div>
          <div style="font-size: 12px; color: #e2e8f0;">
            Valid for the next <strong>${expiresInMinutes} minutes</strong>
          </div>
        </div>
        <p style="font-size: 12px; line-height: 1.6; color: #64748b;">
          If you did not request this code, you can safely ignore this email. Do not share this code with anyone.
        </p>
      </div>
      <div class="footer">
        © ${new Date().getFullYear()} JVican Vote Arena. All rights reserved.
      </div>
    </div>
  </div>
</body>
</html>
`
}
