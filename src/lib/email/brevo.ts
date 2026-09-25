import { BrevoClient } from '@getbrevo/brevo';

/**
 * Server-only Brevo Client wrapper.
 * Safely initializes without crashing build-time or runtime when BREVO_API_KEY is not configured yet.
 */

// Helper to sanitize and check the Brevo API key
function getRawBrevoApiKey(): string | undefined {
  const key = process.env.BREVO_API_KEY;
  if (!key) return undefined;
  const trimmed = key.trim();
  if (
    trimmed === '' ||
    trimmed.includes('placeholder') ||
    trimmed.includes('your_api_key') ||
    trimmed.includes('mock')
  ) {
    return undefined;
  }
  return trimmed;
}

let brevoClientInstance: BrevoClient | null = null;

/**
 * Server-side utility to determine whether Brevo is fully configured with an API key.
 * Never exposed to client-side code.
 */
export function isBrevoConfigured(): boolean {
  return Boolean(getRawBrevoApiKey());
}

/**
 * Server-only Brevo client accessor.
 * Returns BrevoClient instance when BREVO_API_KEY is present, or null if unconfigured.
 */
export function getBrevoClient(): BrevoClient | null {
  const apiKey = getRawBrevoApiKey();
  if (!apiKey) {
    return null;
  }

  if (!brevoClientInstance) {
    try {
      brevoClientInstance = new BrevoClient({
        apiKey,
      });
    } catch (err) {
      console.error('[BREVO INITIALIZATION ERROR]', err);
      return null;
    }
  }

  return brevoClientInstance;
}

export interface BrevoSenderPayload {
  email: string;
  name?: string;
}

export interface BrevoRecipientPayload {
  email: string;
  name?: string;
}

export interface SendBrevoTransactionalEmailOptions {
  sender: BrevoSenderPayload;
  to: BrevoRecipientPayload[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  replyTo?: { email: string; name?: string };
  headers?: Record<string, string>;
  tags?: string[];
}

export interface BrevoSendResult {
  success: boolean;
  provider: 'brevo';
  providerMessageId?: string | null;
  error?: string | null;
  statusCode?: number;
  isSafeToFallback?: boolean; // Indicates if failure is network/5xx vs client 4xx
}

/**
 * Parses a "Sender Name <email@domain.com>" or "email@domain.com" string into email and name.
 */
export function parseEmailSender(senderStr: string): BrevoSenderPayload {
  if (!senderStr) {
    return { email: 'notifications@jvican.com', name: 'JVican Arena' };
  }

  const match = senderStr.match(/^(.*?)\s*<([^>]+)>$/);
  if (match) {
    return {
      name: match[1].trim() || undefined,
      email: match[2].trim(),
    };
  }

  return {
    email: senderStr.trim(),
  };
}

/**
 * Sends a transactional email using the official BrevoClient SDK.
 * Returns normalized success/failure response without throwing unhandled exceptions.
 */
export async function sendBrevoEmail(options: SendBrevoTransactionalEmailOptions): Promise<BrevoSendResult> {
  const client = getBrevoClient();

  if (!client) {
    return {
      success: false,
      provider: 'brevo',
      error: 'Brevo is not configured (missing or invalid BREVO_API_KEY).',
      isSafeToFallback: false,
    };
  }

  try {
    const payload = {
      sender: options.sender,
      to: options.to,
      subject: options.subject,
      htmlContent: options.htmlContent,
      textContent: options.textContent,
      replyTo: options.replyTo,
      headers: options.headers && Object.keys(options.headers).length > 0 ? options.headers : undefined,
      tags: options.tags,
    };

    const response = await client.transactionalEmails.sendTransacEmail(payload);

    const messageId = response.messageId || (response.messageIds && response.messageIds[0]) || null;

    return {
      success: true,
      provider: 'brevo',
      providerMessageId: messageId,
    };
  } catch (err: any) {
    console.error('[BREVO API ERROR]', err);

    const errorMessage = err?.message || err?.body?.message || 'Unknown Brevo dispatch error';
    const statusCode = err?.statusCode || err?.status || (err?.response ? err.response.status : undefined);

    // If 4xx (e.g. invalid recipient, bad request), it's not a safe retryable error.
    // If 5xx or network/timeout, it's server-side.
    const isClientError = statusCode && statusCode >= 400 && statusCode < 500;

    return {
      success: false,
      provider: 'brevo',
      error: errorMessage,
      statusCode,
      isSafeToFallback: !isClientError,
    };
  }
}
