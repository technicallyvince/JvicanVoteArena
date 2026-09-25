import { NextRequest, NextResponse } from 'next/server';
import { sendNewsletterBroadcast } from '@/lib/email/newsletter';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subject, headline, contentHtml, ctaText, ctaUrl } = body;

    if (!subject || !headline || !contentHtml) {
      return NextResponse.json(
        { success: false, error: 'Subject, headline, and contentHtml are required.' },
        { status: 400 }
      );
    }

    const result = await sendNewsletterBroadcast({
      subject,
      headline,
      contentHtml,
      ctaText,
      ctaUrl,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    console.error('Error in /api/admin/newsletter/broadcast:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to broadcast newsletter.' },
      { status: 500 }
    );
  }
}
