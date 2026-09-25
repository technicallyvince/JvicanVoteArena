import { NextRequest, NextResponse } from 'next/server';
import { unsubscribeFromNewsletter } from '@/lib/email/newsletter';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    const result = await unsubscribeFromNewsletter(email);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (err: any) {
    console.error('Error in /api/newsletter/unsubscribe:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to process unsubscribe request.' },
      { status: 500 }
    );
  }
}
