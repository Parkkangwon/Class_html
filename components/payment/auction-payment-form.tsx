'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

type PaymentMethod = 'card' | 'trans' | 'vbank' | 'phone' | 'samsung' | 'kpay' | 'kakaopay' | 'payco' | 'lpay' | 'ssgpay';

interface AuctionPaymentFormProps {
  auctionId: string;
  auctionTitle: string;
  amount: number;
  onPaymentComplete?: () => void;
}

export function AuctionPaymentForm({
  auctionId,
  auctionTitle,
  amount,
  onPaymentComplete
}: AuctionPaymentFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [paymentData, setPaymentData] = useState<any>(null);

  // 결제 정보 초기화
  useEffect(() => {
    const initializePayment = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/payment/prepare', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            auctionId,
            amount,
            auctionTitle
          }),
        });

        if (!response.ok) {
          throw new Error('결제 정보를 불러오는데 실패했습니다.');
        }

        const data = await response.json();
        setPaymentData(data);
      } catch (error) {
        console.error('결제 초기화 오류:', error);
        toast.error('결제를 초기화하는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    if (auctionId && amount) {
      initializePayment();
    }
  }, [auctionId, amount]);

  // 결제 요청
  const requestPayment = () => {
    if (!paymentData) {
      toast.error('결제 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    // IMP 객체가 있는지 확인 (아임포트 라이브러리 로드 확인)
    if (typeof window !== 'undefined' && (window as any).IMP) {
      const { IMP } = window as any;
      
      // 결제 요청 데이터
      const paymentRequest = {
        pg: 'html5_inicis', // PG사
        pay_method: paymentMethod,
        merchant_uid: paymentData.merchant_uid,
        name: paymentData.name,
        amount: paymentData.amount,
        buyer_email: paymentData.buyer_email,
        buyer_name: paymentData.buyer_name,
        buyer_tel: paymentData.buyer_tel,
        m_redirect_url: `${window.location.origin}/payment/complete`,
      };

      // 결제 요청
      IMP.request_pay(paymentRequest, async (response: any) => {
        try {
          if (response.success) {
            // 결제 성공 시 서버 검증
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                imp_uid: response.imp_uid,
                merchant_uid: response.merchant_uid,
              }),
            });

            const result = await verifyResponse.json();

            if (result.success) {
              toast.success('결제가 완료되었습니다!');
              if (onPaymentComplete) {
                onPaymentComplete();
              }
              router.push(`/auctions/${auctionId}/complete`);
            } else {
              toast.error('결제 검증에 실패했습니다. 고객센터에 문의해주세요.');
            }
          } else {
            // 결제 실패
            toast.error(response.error_msg || '결제에 실패했습니다.');
          }
        } catch (error) {
          console.error('결제 처리 중 오류 발생:', error);
          toast.error('결제 처리 중 오류가 발생했습니다.');
        }
      });
    } else {
      toast.error('결제 모듈을 불러오는 데 실패했습니다. 페이지를 새로고침 해주세요.');
    }
  };

  // 아임포트 스크립트 로드
  useEffect(() => {
    const jquery = document.createElement('script');
    jquery.src = 'https://code.jquery.com/jquery-1.12.4.min.js';
    jquery.async = true;
    jquery.onload = () => {
      const iamport = document.createElement('script');
      iamport.src = 'https://cdn.iamport.kr/v1/iamport.js';
      iamport.async = true;
      iamport.onload = () => {
        const { IMP } = window as any;
        IMP.init(process.env.NEXT_PUBLIC_IMPORT_CID || 'imp12345678'); // 가맹점 식별코드
      };
      document.head.appendChild(iamport);
    };
    document.head.appendChild(jquery);

    return () => {
      document.head.removeChild(jquery);
    };
  }, []);

  if (isLoading || !paymentData) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">결제 정보를 불러오는 중입니다...</span>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">결제하기</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">주문 정보</h3>
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">상품명</p>
              <p className="font-medium">{paymentData.name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">결제 금액</p>
              <p className="font-bold text-lg">{paymentData.amount.toLocaleString()}원</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">결제 수단</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {[
              { id: 'card', label: '카드결제' },
              { id: 'trans', label: '실시간계좌이체' },
              { id: 'vbank', label: '가상계좌' },
              { id: 'phone', label: '휴대폰' },
              { id: 'kakaopay', label: '카카오페이' },
              { id: 'payco', label: '페이코' },
            ].map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                className={`p-4 border rounded-lg text-center transition-colors ${
                  paymentMethod === method.id
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'hover:bg-muted/50'
                }`}
              >
                {method.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4">
          <Button
            onClick={requestPayment}
            size="lg"
            className="w-full py-6 text-lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                처리 중...
              </>
            ) : (
              `${amount.toLocaleString()}원 결제하기`
            )}
          </Button>
          
          <p className="mt-2 text-sm text-muted-foreground text-center">
            결제 시 이용약관 및 개인정보 처리방침에 동의하신 것으로 간주됩니다.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
