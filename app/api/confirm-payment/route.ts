import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: Request) {
  try {
    const { paymentIntentId } = await request.json();

    // Confirm the payment
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: 'pm_card_visa', // In production, you'll get this from the client
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
    });

    return NextResponse.json({
      status: paymentIntent.status,
      paymentIntent,
    });
  } catch (err) {
    console.error('Error confirming payment:', err);
    return NextResponse.json(
      { error: 'Error confirming payment' },
      { status: 500 }
    );
  }
}
