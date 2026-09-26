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

  // Persist to Supabase if configured
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasSupabase = supabaseUrl && !supabaseUrl.includes('placeholder')
    if (hasSupabase) {
      const { getSupabaseAdmin } = await import('@/lib/supabase/admin')
      const { createClient } = await import('@/lib/supabase/server')
      const admin = getSupabaseAdmin()
      const supabase = await createClient()
      const client = admin || supabase

      if (client) {
        await client.from('newsletter_subscribers').upsert(
          {
            email,
            name: params.name || null,
            source: params.source || 'WEBSITE',
            status: 'SUBSCRIBED',
            subscribed_at: new Date().toISOString(),
            unsubscribed_at: null,
          },
          { onConflict: 'email' }
        )
      }
    }
  } catch (supabaseErr) {
    console.warn('[subscribeToNewsletter] Supabase persistence error (non-fatal):', supabaseErr)
  }

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

  // Send welcome confirmation email
  try {
    const emailHtml = generateNewsletterEmailHtml({
      subject: 'Welcome to JVican Vote Arena Updates',
      headline: 'Welcome to JVican Vote Arena!',
      contentHtml: `<p>Thank you for subscribing to the official JVican Vote Arena updates.</p><p>You will receive curated announcements about major award ceremonies, spotlight nominees, live leaderboards, and exclusive community events.</p>`,
      subscriberEmail: email,
      subscriberName: params.name || undefined,
    });

    await sendEmail({
      type: 'NEWSLETTER_WELCOME',
      to: email,
      from: EMAIL_FROM_NEWSLETTER,
      subject: 'Welcome to JVican Vote Arena Updates',
      html: emailHtml,
      relatedResourceType: 'newsletter',
      relatedResourceId: result.subscriber.id,
    });
  } catch (emailErr) {
    console.warn('[subscribeToNewsletter] Welcome email sending warning (non-fatal):', emailErr);
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
  let activeSubscribers: { id: string; email: string; name?: string | null }[] = [];

  // 1. Fetch active subscribers from Supabase if configured
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasSupabase = supabaseUrl && !supabaseUrl.includes('placeholder');
    if (hasSupabase) {
      const { getSupabaseAdmin } = await import('@/lib/supabase/admin');
      const { createClient } = await import('@/lib/supabase/server');
      const admin = getSupabaseAdmin();
      const supabase = await createClient();
      const client = admin || supabase;

      if (client) {
        const { data, error } = await client
          .from('newsletter_subscribers')
          .select('id, email, name, status')
          .eq('status', 'SUBSCRIBED');

        if (!error && data && data.length > 0) {
          activeSubscribers = data.map((d: any) => ({
            id: d.id || `sub-${d.email}`,
            email: d.email,
            name: d.name,
          }));
        }
      }
    }
  } catch (err) {
    console.warn('[sendNewsletterBroadcast] Supabase query warning, falling back to local DB:', err);
  }

  // 2. Merge/fallback with local DB subscribers
  if (activeSubscribers.length === 0) {
    const localSubs = db.getNewsletterSubscribers('SUBSCRIBED');
    activeSubscribers = localSubs.map((s) => ({
      id: s.id,
      email: s.email,
      name: s.name,
    }));
  }
  
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

