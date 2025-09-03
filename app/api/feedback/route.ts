import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const session = await auth();
    const data = await req.json();

    // In a real app, you would validate the input data here
    const { page, feedback, rating } = data;

    // Save to database (example using Prisma)
    await db.feedback.create({
      data: {
        userId: session?.user?.id || 'anonymous',
        page,
        feedback,
        rating,
        userAgent: req.headers.get('user-agent') || '',
        ip: req.headers.get('x-forwarded-for') || '',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}
