import { NextRequest, NextResponse } from 'next/server';
import { subscribeToNewsletter } from '@/lib/email/newsletter';
import { NewsletterSource } from '@/types/database';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, source } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    const validSources: NewsletterSource[] = ['WEBSITE', 'VOTING_FLOW', 'ORGANIZER', 'ADMIN'];
    const resolvedSource: NewsletterSource = validSources.includes(source) ? source : 'WEBSITE';

    const result = await subscribeToNewsletter({
      email,
      name: typeof name === 'string' ? name : undefined,
      source: resolvedSource,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      subscriber: result.subscriber,
      isNew: result.isNew,
    });
  } catch (err: any) {
    console.error('Error in /api/newsletter/subscribe:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to process subscription request.' },
      { status: 500 }
    );
  }
}
