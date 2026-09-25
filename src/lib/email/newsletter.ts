import { sendEmail, getResendClient, EMAIL_FROM_NEWSLETTER, getAppUrl } from './resend';
import { generateNewsletterEmailHtml } from './templates/newsletter-email';
import { db } from '../db';
import { NewsletterSource, NewsletterSubscriber } from '@/types/database';

export interface SubscribeParams {
  email: string;
  name?: string;
  source?: NewsletterSource;
}

export async function subscribeToNewsletter(params: SubscribeParams): Promise<{
  success: boolean;
  subscriber?: NewsletterSubscriber;
  message: string;
  isNew: boolean;
}> {
  const email = params.email.trim().toLowerCase();
  
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, message: 'Invalid email address provided', isNew: false };
  }

  const existing = db.getNewsletterSubscriberByEmail(email);
  if (existing && existing.status === 'SUBSCRIBED') {
    return {
      success: true,
      subscriber: existing,
      message: 'You are already subscribed to the JVican newsletter.',
      isNew: false
    };
  }

  // Local database subscription
  const result = db.subscribeNewsletter({
    email,
    name: params.name || undefined,
    source: params.source || 'WEBSITE',
  });

  // Sync to Resend Audience if configured and online
  const resend = getResendClient();
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (resend && audienceId) {
    try {
      await resend.contacts.create({
        email,
        firstName: params.name || undefined,
        unsubscribed: false,
        audienceId,
      });
    } catch (err) {
      console.warn('[subscribeToNewsletter] Resend audience sync warning (non-fatal):', err);
    }
  }

  return {
    success: true,
    subscriber: result.subscriber,
    message: 'Thank you for subscribing to JVican updates!',
    isNew: result.isNew,
  };
}

export async function unsubscribeFromNewsletter(email: string): Promise<{
  success: boolean;
  message: string;
}> {
  const normalizedEmail = email.trim().toLowerCase();
  const subscriber = db.unsubscribeNewsletter(normalizedEmail);

  if (!subscriber) {
    return { success: false, message: 'Subscriber record not found.' };
  }

  // Sync unsubscribe to Resend Audience if configured
  const resend = getResendClient();
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (resend && audienceId) {
    try {
      await resend.contacts.update({
        email: normalizedEmail,
        unsubscribed: true,
        audienceId,
      });
    } catch (err) {
      console.warn('[unsubscribeFromNewsletter] Resend audience update warning (non-fatal):', err);
    }
  }

  return {
    success: true,
    message: 'You have been successfully unsubscribed from JVican marketing emails.'
  };
}

export interface SendNewsletterBroadcastParams {
  subject: string;
  headline: string;
  contentHtml: string;
  ctaText?: string;
  ctaUrl?: string;
}

export async function sendNewsletterBroadcast(params: SendNewsletterBroadcastParams): Promise<{
  totalSubscribers: number;
  sentCount: number;
  failedCount: number;
}> {
  const activeSubscribers = db.getNewsletterSubscribers('SUBSCRIBED');
  
  let sentCount = 0;
  let failedCount = 0;

  for (const sub of activeSubscribers) {
    const html = generateNewsletterEmailHtml({
      subject: params.subject,
      headline: params.headline,
      contentHtml: params.contentHtml,
      ctaText: params.ctaText,
      ctaUrl: params.ctaUrl,
      subscriberEmail: sub.email,
      subscriberName: sub.name || undefined,
    });

    const result = await sendEmail({
      type: 'NEWSLETTER_BROADCAST',
      to: sub.email,
      from: EMAIL_FROM_NEWSLETTER,
      subject: params.subject,
      html,
      relatedResourceType: 'newsletter',
      relatedResourceId: sub.id,
      idempotencyKey: `newsletter-broadcast-${encodeURIComponent(params.subject)}-${sub.id}-${Date.now().toString().slice(0, 7)}`,
    });

    if (result.success) {
      sentCount++;
    } else {
      failedCount++;
    }
  }

  return {
    totalSubscribers: activeSubscribers.length,
    sentCount,
    failedCount,
  };
}
