"use client"

import { useState, useEffect } from "react"
import { X, CreditCard, Smartphone, Landmark, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

type PaymentMethod = 'CARD' | 'BANK_TRANSFER' | 'MOBILE_PAYMENT'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  itemName: string
  onPaymentComplete: (paymentMethod: string) => void
  isProcessing?: boolean
}

export function PaymentModal({ 
  isOpen, 
  onClose, 
  amount, 
  itemName, 
  onPaymentComplete, 
  isProcessing: externalIsProcessing = false 
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [isProcessing, setIsProcessing] = useState(externalIsProcessing)
  const [isSuccess, setIsSuccess] = useState(false)
  
  // Update isProcessing when prop changes
  useEffect(() => {
    setIsProcessing(externalIsProcessing)
  }, [externalIsProcessing])
  const [cardNumber, setCardNumber] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cvc, setCvc] = useState("")
  const [cardName, setCardName] = useState("")

  const handlePayment = async () => {
    if (!selectedMethod) {
      toast.error('결제 수단을 선택해주세요.');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Call the parent's payment complete handler with the selected method
      await onPaymentComplete(selectedMethod);
      
      // Show success state if the payment was successful
      setIsSuccess(true);
      
      // Close the modal after a short delay
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('결제 처리 중 오류가 발생했습니다.', {
        description: error instanceof Error ? error.message : '잠시 후 다시 시도해주세요.'
      });
    } finally {
      setIsProcessing(false);
    }
  }

  const renderPaymentForm = () => {
    if (isSuccess) {
      return (
        <div className="text-center py-8">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">결제가 완료되었습니다!</h3>
          <p className="text-gray-600">감사합니다. 결제가 정상적으로 처리되었습니다.</p>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-medium">결제 수단 선택</h3>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setSelectedMethod('CARD')}
              className={`p-4 border rounded-lg flex flex-col items-center justify-center space-y-2 transition-colors ${
                selectedMethod === 'CARD' 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <CreditCard className="w-6 h-6 text-gray-700" />
              <span>신용/체크카드</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedMethod('BANK_TRANSFER')}
              className={`p-4 border rounded-lg flex flex-col items-center justify-center space-y-2 transition-colors ${
                selectedMethod === 'BANK_TRANSFER' 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <Landmark className="w-6 h-6 text-gray-700" />
              <span>무통장입금</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedMethod('MOBILE_PAYMENT')}
              className={`p-4 border rounded-lg flex flex-col items-center justify-center space-y-2 transition-colors ${
                selectedMethod === 'MOBILE_PAYMENT' 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <Smartphone className="w-6 h-6 text-gray-700" />
              <span>휴대폰결제</span>
            </button>
          </div>
        </div>

        {selectedMethod && (
          <div className="pt-4 border-t border-gray-200">
            <h3 className="font-medium mb-4">결제 정보</h3>
            
            {selectedMethod === 'CARD' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">카드 번호</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 '))}
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    maxLength={19}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">유효기간</label>
                    <input
                      type="text"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value.replace(/\D/g, '').replace(/(\d{2})(?=\d{2})/, '$1/').substring(0, 5))}
                      placeholder="MM/YY"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                    <input
                      type="text"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').substring(0, 3))}
                      placeholder="CVC"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      maxLength={3}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">카드 소유자 이름</label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="카드에 표시된 이름"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            )}

            {selectedMethod === 'BANK_TRANSFER' && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 mb-4">아래 계좌로 입금해주세요. 입금 확인 후 주문이 완료됩니다.</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">은행명</span>
                    <span className="font-medium">네이버페이은행</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">계좌번호</span>
                    <span className="font-mono">333-1234-5678-90</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">예금주</span>
                    <span className="font-medium">(주)나팔컴퍼니</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">입금금액</span>
                    <span className="font-bold text-lg text-green-600">{amount.toLocaleString()}원</span>
                  </div>
                </div>
              </div>
            )}

            {selectedMethod === 'MOBILE_PAYMENT' && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 mb-4">휴대폰 결제를 진행합니다. 결제를 진행해주세요.</p>
                <div className="space-y-3">
                  <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
                    <input 
                      type="radio" 
                      id="skt" 
                      name="mobile-carrier" 
                      className="h-4 w-4 text-green-500 focus:ring-green-500"
                      defaultChecked
                    />
                    <label htmlFor="skt" className="ml-2 block text-sm text-gray-700">SKT</label>
                  </div>
                  <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
                    <input 
                      type="radio" 
                      id="kt" 
                      name="mobile-carrier" 
                      className="h-4 w-4 text-green-500 focus:ring-green-500"
                    />
                    <label htmlFor="kt" className="ml-2 block text-sm text-gray-700">KT</label>
                  </div>
                  <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
                    <input 
                      type="radio" 
                      id="lgu" 
                      name="mobile-carrier" 
                      className="h-4 w-4 text-green-500 focus:ring-green-500"
                    />
                    <label htmlFor="lgu" className="ml-2 block text-sm text-gray-700">LG U+</label>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-600">총 결제금액</span>
                <span className="text-2xl font-bold">{amount.toLocaleString()}원</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>결제하기</DialogTitle>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <DialogDescription>
            {itemName} 상품을 구매합니다.
          </DialogDescription>
        </DialogHeader>
        
        {renderPaymentForm()}
      </DialogContent>
    </Dialog>
  )
}
