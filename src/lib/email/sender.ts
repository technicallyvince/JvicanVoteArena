import { generateReceiptHtml } from './receipt-template'

interface SendReceiptParams {
  to: string
  subject: string
  props: Parameters<typeof generateReceiptHtml>[0]
}

export async function sendReceiptEmail(params: SendReceiptParams): Promise<{ success: boolean; error?: string }> {
  const html = generateReceiptHtml(params.props)
  const resendApiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.EMAIL_FROM || 'JVican Vote Arena Receipts <receipts@votearena.jvican.com>'

  // If live Resend API key is configured
  if (resendApiKey && !resendApiKey.includes('mock') && !resendApiKey.includes('your_api_key')) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: fromEmail,
          to: params.to,
          subject: params.subject,
          html,
        }),
      })

      if (!res.ok) {
        const errorText = await res.text()
        console.error('Failed to send receipt via Resend:', errorText)
        return { success: false, error: errorText }
      }

      return { success: true }
    } catch (err: any) {
      console.error('Error in sendReceiptEmail:', err)
      return { success: false, error: err.message }
    }
  }

  // Development / Logging mode
  console.log('----------------------------------------------------')
  console.log(`[EMAIL DISPATCH] To: ${params.to} | Subject: ${params.subject}`)
  console.log(`[RECEIPT ID] ${params.props.receiptNumber} | Total: ${params.props.totalAmount} ${params.props.currency}`)
  console.log('----------------------------------------------------')

  return { success: true }
}
