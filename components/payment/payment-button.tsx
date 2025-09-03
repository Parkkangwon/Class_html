"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PaymentModal } from "@/components/payment/payment-modal"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { iamportService } from "@/services/iamport.service"
import { Loader2 } from "lucide-react"

interface PaymentButtonProps {
  itemId: string
  itemName: string
  amount: number
  disabled?: boolean
  className?: string
}

export function PaymentButton({ 
  itemId, 
  itemName, 
  amount, 
  disabled = false,
  className = ""
}: PaymentButtonProps) {
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  // Iamport 초기화
  useEffect(() => {
    const initIamport = async () => {
      try {
        // 실제 환경에서는 환경 변수에서 가져오는 것이 좋습니다.
        const IMP_UID = process.env.NEXT_PUBLIC_IAMPORT_UID || 'imp12345678'; // 테스트용 UID
        await iamportService.initialize(IMP_UID);
      } catch (error) {
        console.error('결제 시스템 초기화 실패:', error);
        toast.error('결제 시스템을 초기화하는데 실패했습니다.');
      }
    };

    if (isPaymentOpen) {
      initIamport();
    }
  }, [isPaymentOpen]);

  const handlePaymentComplete = async (paymentMethod: string) => {
    if (!user) return;
    
    setIsProcessing(true);
    
    try {
      const result = await iamportService.requestPayment({
        method: paymentMethod as 'CARD' | 'BANK_TRANSFER' | 'MOBILE_PAYMENT',
        amount,
        itemName,
        itemId,
        buyerName: (user as any).name || '고객',
        buyerEmail: (user as any).email || '',
        buyerTel: (user as any).phone || '010-0000-0000',
        buyerAddr: '',
        buyerPostcode: ''
      });

      toast.success('결제가 완료되었습니다.', {
        description: `${itemName} 상품이 성공적으로 결제되었습니다.`
      });
      
      // 결제 완료 후 주문 상세 페이지로 이동
      router.push(`/orders/${result.orderId}`);
    } catch (error) {
      console.error('결제 처리 중 오류 발생:', error);
      toast.error('결제 처리 중 오류가 발생했습니다.', {
        description: error instanceof Error ? error.message : '잠시 후 다시 시도해주세요.'
      });
    } finally {
      setIsProcessing(false);
      setIsPaymentOpen(false);
    }
  };

  const handleClick = () => {
    if (!user) {
      toast.info('로그인이 필요합니다.', {
        description: '결제를 진행하려면 로그인해주세요.',
        action: {
          label: '로그인',
          onClick: () => router.push('/login')
        }
      })
      return
    }
    
    if (disabled) {
      toast.warning('결제할 수 없는 상품입니다.')
      return
    }
    
    setIsPaymentOpen(true)
  }

  return (
    <>
      <Button 
        onClick={handleClick}
        disabled={disabled || isProcessing}
        className={`w-full py-3 text-base font-medium rounded-lg bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            처리 중...
          </>
        ) : '바로 구매하기'}
      </Button>
      
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => !isProcessing && setIsPaymentOpen(false)}
        amount={amount}
        itemName={itemName}
        onPaymentComplete={handlePaymentComplete}
        isProcessing={isProcessing}
      />
    </>
  )
}
