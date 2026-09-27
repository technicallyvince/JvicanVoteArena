import { Resend } from 'resend'
import { db } from '@/lib/db'
import { EmailType } from '@/types/database'
import {
  isBrevoConfigured,
  sendBrevoEmail,
  parseEmailSender,
  BrevoRecipientPayload,
} from './brevo'

// Export Brevo utilities through service layer
export { isBrevoConfigured }

// Server-side Resend Client Singleton
const resendApiKey = process.env.RESEND_API_KEY
export const resend = new Resend(resendApiKey || 're_placeholder_key')

export function getResendClient(): Resend | null {
  if (
    resendApiKey &&
    !resendApiKey.includes('mock') &&
    !resendApiKey.includes('placeholder') &&
    !resendApiKey.includes('your_api_key')
  ) {
    return resend
  }
  return null
}

export function isResendConfigured(): boolean {
  return Boolean(getResendClient())
}

/**
 * Resolves the application base URL dynamically without hardcoding any temporary domain.
 * Strictly uses process.env.NEXT_PUBLIC_APP_URL.
 */
export function getAppUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return url.replace(/\/$/, '')
}

/**
 * Sender addresses configured through environment variables.
 *
 * The defaults use jvicanvotes.com.ng because that is the domain verified in
 * Resend. Resend rejects any sender on an unverified domain, so falling back to
 * a bare jvican.com address made every send fail with
 * "The jvican.com domain is not verified" whenever the environment variables
 * were absent, for example on Vercel. Add jvican.com to Resend and update these
 * defaults if that domain becomes the sending domain.
 */
export const EMAIL_FROM_RECEIPTS =
  process.env.EMAIL_FROM_RECEIPTS ||
  process.env.EMAIL_FROM ||
  'JVican Receipts <receipts@jvicanvotes.com.ng>'
export const EMAIL_FROM_NOTIFICATIONS =
  process.env.EMAIL_FROM_NOTIFICATIONS ||
  process.env.EMAIL_FROM ||
  'JVican Notifications <notifications@jvicanvotes.com.ng>'
export const EMAIL_FROM_NEWSLETTER =
  process.env.EMAIL_FROM_NEWSLETTER ||
  process.env.EMAIL_FROM ||
  'JVican Newsletter <newsletter@jvicanvotes.com.ng>'

export const EMAIL_FROM = {
  RECEIPTS: EMAIL_FROM_RECEIPTS,
  NOTIFICATIONS: EMAIL_FROM_NOTIFICATIONS,
  NEWSLETTER: EMAIL_FROM_NEWSLETTER,
}

export interface SendEmailOptions {
  from: string
  to: string | string[]
  subject: string
  html: string
  text?: string
  type: EmailType
  relatedResourceType?: 'receipt' | 'payment' | 'event' | 'withdrawal' | 'newsletter' | string | null
  relatedResourceId?: string | null
  idempotencyKey?: string | null
  headers?: Record<string, string>
  replyTo?: string
  tags?: string[]
}

export interface SendEmailResult {
  success: boolean
  provider?: 'resend' | 'brevo' | 'system'
  messageId?: string | null
  error?: string | null
  idempotentSkip?: boolean
  attemptCount?: number
  /**
   * True when the send was only logged to the server console because no email
   * provider is configured. No message left the server, so callers that depend
   * on real delivery (e.g. sending a login code) must not report success.
   */
  simulated?: boolean
}

/**
 * Determines whether a Resend failure is safe to fallback to Brevo.
 * Fallback is only attempted on server errors / timeouts / 5xx, NOT on client-side errors like
 * invalid email format, duplicate suppression, unverified domain, or bad request.
 */
function isSafeToFallbackError(error: any): boolean {
  if (!error) return true

  const message = (typeof error === 'string' ? error : error.message || JSON.stringify(error)).toLowerCase()
  const name = (error.name || '').toLowerCase()

  // Only reject fallback if the recipient email itself is fundamentally malformed or empty
  if (
    message.includes('invalid_email') ||
    message.includes('missing_required_field')
  ) {
    return false
  }

  // Domain verification errors, rate limits, 403, 400, 422, timeouts, 5xx are all safe to route via Brevo
  return true
}

/**
 * Centralized email dispatcher with:
 * 1. Resend as primary provider
 * 2. Brevo as safe fallback provider
 * 3. Server-side idempotency checking against duplicates
 * 4. Immutable audit logging in database
 * 5. Simulation mode for local dev when neither API key is active
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const recipient = Array.isArray(options.to) ? options.to.join(', ') : options.to

  // Provider configuration settings
  const primaryProvider = (process.env.EMAIL_PRIMARY_PROVIDER || 'resend').toLowerCase()
  const fallbackProvider = (process.env.EMAIL_FALLBACK_PROVIDER || 'brevo').toLowerCase()
  const enableFallback = process.env.EMAIL_ENABLE_FALLBACK !== 'false'

  // 1. Idempotency Check: prevent duplicate email sending across retries/callbacks
  if (options.idempotencyKey) {
    const existingSent = db.getEmailLogByIdempotencyKey(options.idempotencyKey)
    if (existingSent) {
      console.log(`[EMAIL IDEMPOTENT SKIP] Email with key "${options.idempotencyKey}" was already sent.`)
      return {
        success: true,
        provider: (existingSent.provider_used || existingSent.provider) as any,
        messageId: existingSent.provider_message_id,
        idempotentSkip: true,
        attemptCount: existingSent.attempt_count || 1,
      }
    }
  }

  let attemptCount = 0

  // 2. Create initial queued log entry
  const emailLog = db.createEmailLog({
    type: options.type,
    recipient,
    subject: options.subject,
    related_resource_type: options.relatedResourceType || null,
    related_resource_id: options.relatedResourceId || null,
    provider: primaryProvider === 'brevo' ? 'brevo' : 'resend',
    primary_provider: primaryProvider as any,
    provider_used: null,
    provider_message_id: null,
    idempotency_key: options.idempotencyKey || null,
    status: 'queued',
    attempt_count: 0,
    error: null,
    sent_at: null,
  })

  const resendActive = isResendConfigured()
  const brevoActive = isBrevoConfigured()

  // Helper to format recipients for Brevo
  const toBrevoRecipients = (): BrevoRecipientPayload[] => {
    if (Array.isArray(options.to)) {
      return options.to.map((email) => ({ email: email.trim() }))
    }
    return [{ email: options.to.trim() }]
  }

  // ==========================================
  // Primary Attempt: Resend
  // ==========================================
  if (primaryProvider === 'resend' && resendActive) {
    attemptCount++
    try {
      const emailHeaders: Record<string, string> = {
        ...(options.headers || {}),
      }
      if (options.idempotencyKey) {
        emailHeaders['Idempotency-Key'] = options.idempotencyKey
      }

      const { data, error } = await resend.emails.send({
        from: options.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo,
        headers: Object.keys(emailHeaders).length > 0 ? emailHeaders : undefined,
      })

      if (!error && data?.id) {
        const messageId = data.id
        db.updateEmailLog(emailLog.id, {
          status: 'sent',
          provider: 'resend',
          provider_used: 'resend',
          provider_message_id: messageId,
          attempt_count: attemptCount,
          sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        return {
          success: true,
          provider: 'resend',
          messageId,
          attemptCount,
        }
      }

      // If Resend failed with an error object
      console.error('[RESEND DISPATCH ERROR]', error)
      const isSafeFallback = isSafeToFallbackError(error)

      if (enableFallback && isSafeFallback && brevoActive) {
        console.warn(`[EMAIL FALLBACK] Resend failed with safe error; triggering Brevo fallback for "${recipient}"...`)
        attemptCount++

        const brevoResult = await sendBrevoEmail({
          sender: parseEmailSender(options.from),
          to: toBrevoRecipients(),
          subject: options.subject,
          htmlContent: options.html,
          textContent: options.text,
          replyTo: options.replyTo ? parseEmailSender(options.replyTo) : undefined,
          headers: options.headers,
          tags: options.tags || [options.type],
        })

        if (brevoResult.success) {
          db.updateEmailLog(emailLog.id, {
            status: 'sent',
            provider: 'brevo',
            provider_used: 'brevo',
            provider_message_id: brevoResult.providerMessageId,
            attempt_count: attemptCount,
            sent_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

          return {
            success: true,
            provider: 'brevo',
            messageId: brevoResult.providerMessageId,
            attemptCount,
          }
        }
      }

      // If fallback not available or also failed
      const errText = error ? error.message || JSON.stringify(error) : 'Resend error'
      db.updateEmailLog(emailLog.id, {
        status: 'failed',
        provider_used: 'resend',
        attempt_count: attemptCount,
        error: errText,
        updated_at: new Date().toISOString(),
      })

      return { success: false, provider: 'resend', error: errText, attemptCount }
    } catch (err: any) {
      console.error('[RESEND EXCEPTION]', err)
      const isSafeFallback = isSafeToFallbackError(err)

      if (enableFallback && isSafeFallback && brevoActive) {
        console.warn(`[EMAIL FALLBACK] Resend threw network exception; triggering Brevo fallback for "${recipient}"...`)
        attemptCount++

        const brevoResult = await sendBrevoEmail({
          sender: parseEmailSender(options.from),
          to: toBrevoRecipients(),
          subject: options.subject,
          htmlContent: options.html,
          textContent: options.text,
          replyTo: options.replyTo ? parseEmailSender(options.replyTo) : undefined,
          headers: options.headers,
          tags: options.tags || [options.type],
        })

        if (brevoResult.success) {
          db.updateEmailLog(emailLog.id, {
            status: 'sent',
            provider: 'brevo',
            provider_used: 'brevo',
            provider_message_id: brevoResult.providerMessageId,
            attempt_count: attemptCount,
            sent_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

          return {
            success: true,
            provider: 'brevo',
            messageId: brevoResult.providerMessageId,
            attemptCount,
          }
        }
      }

      db.updateEmailLog(emailLog.id, {
        status: 'failed',
        provider_used: 'resend',
        attempt_count: attemptCount,
        error: err.message || 'Resend exception',
        updated_at: new Date().toISOString(),
      })

      return { success: false, provider: 'resend', error: err.message || 'Resend exception', attemptCount }
    }
  }

  // ==========================================
  // Direct Brevo (if primary is Brevo or Resend key is missing but Brevo key exists)
  // ==========================================
  if (brevoActive) {
    attemptCount++
    const brevoResult = await sendBrevoEmail({
      sender: parseEmailSender(options.from),
      to: toBrevoRecipients(),
      subject: options.subject,
      htmlContent: options.html,
      textContent: options.text,
      replyTo: options.replyTo ? parseEmailSender(options.replyTo) : undefined,
      headers: options.headers,
      tags: options.tags || [options.type],
    })

    if (brevoResult.success) {
      db.updateEmailLog(emailLog.id, {
        status: 'sent',
        provider: 'brevo',
        provider_used: 'brevo',
        provider_message_id: brevoResult.providerMessageId,
        attempt_count: attemptCount,
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      return {
        success: true,
        provider: 'brevo',
        messageId: brevoResult.providerMessageId,
        attemptCount,
      }
    }

    db.updateEmailLog(emailLog.id, {
      status: 'failed',
      provider_used: 'brevo',
      attempt_count: attemptCount,
      error: brevoResult.error,
      updated_at: new Date().toISOString(),
    })

    return {
      success: false,
      provider: 'brevo',
      error: brevoResult.error,
      attemptCount,
    }
  }

  // ==========================================
  // Development & Demo mode simulation (No live API keys configured)
  // Nothing is actually delivered here. `simulated: true` lets callers that
  // require real delivery refuse to claim success.
  // ==========================================
  attemptCount++
  const simulatedId = `sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`[EMAIL DISPATCH (SIMULATED)] Type: ${options.type}`)
  console.log(`From: ${options.from} → To: ${recipient}`)
  console.log(`Subject: ${options.subject}`)
  console.log(`Primary Provider: ${primaryProvider} (unconfigured) | Fallback: ${fallbackProvider} (unconfigured)`)
  console.log(`Idempotency Key: ${options.idempotencyKey || 'none'}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  db.updateEmailLog(emailLog.id, {
    status: 'sent',
    provider: 'system',
    provider_used: 'system',
    provider_message_id: simulatedId,
    attempt_count: attemptCount,
    sent_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  return {
    success: true,
    provider: 'system',
    messageId: simulatedId,
    attemptCount,
    simulated: true,
  }
}
