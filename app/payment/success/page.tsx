'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const paymentIntentId = searchParams.get('payment_intent');
    if (paymentIntentId) {
      setPaymentIntentId(paymentIntentId);
      // In a real app, you would fetch payment details from your API
      fetchPaymentDetails(paymentIntentId);
    } else {
      setIsLoading(false);
    }
  }, [searchParams]);

  const fetchPaymentDetails = async (id: string) => {
    try {
      // In a real app, you would fetch this from your API
      // const response = await fetch(`/api/payments/${id}`);
      // const data = await response.json();
      
      // Mock response for demo purposes
      setTimeout(() => {
        setPaymentDetails({
          id,
          amount: 9999, // in cents
          currency: 'usd',
          status: 'succeeded',
          created: Math.floor(Date.now() / 1000),
          // Add more details as needed
        });
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching payment details:', error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4">Processing your payment...</p>
      </div>
    );
  }

  if (!paymentDetails) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg inline-flex items-center">
          <span>Unable to find payment details.</span>
        </div>
        <div className="mt-6">
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-green-100 text-green-800 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-muted-foreground mb-8">
          Thank you for your payment. Your transaction has been completed successfully.
        </p>

        <div className="bg-muted/50 p-6 rounded-lg text-left mb-8">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Payment ID</p>
              <p className="font-medium">{paymentDetails.id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="font-medium">
                ${(paymentDetails.amount / 100).toFixed(2)} {paymentDetails.currency.toUpperCase()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-medium capitalize">{paymentDetails.status}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-medium">
                {new Date(paymentDetails.created * 1000).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auction-listings" className="w-full sm:w-auto">
            <Button className="w-full">Browse More Auctions</Button>
          </Link>
          <Link href="/dashboard/purchases" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full">View Purchases</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
