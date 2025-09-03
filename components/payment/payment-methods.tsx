"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CreditCard, Plus, Trash2, Shield } from "lucide-react"

interface PaymentMethod {
  id: string
  type: "card" | "bank" | "kakao" | "naver"
  name: string
  details: string
  isDefault: boolean
  isVerified: boolean
}

export function PaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: "1",
      type: "card",
      name: "신한카드",
      details: "**** **** **** 1234",
      isDefault: true,
      isVerified: true,
    },
    {
      id: "2",
      type: "bank",
      name: "국민은행",
      details: "123-456-789012",
      isDefault: false,
      isVerified: true,
    },
  ])
  const [showAddDialog, setShowAddDialog] = useState(false)

  const handleSetDefault = (id: string) => {
    setPaymentMethods((prev) =>
      prev.map((method) => ({
        ...method,
        isDefault: method.id === id,
      })),
    )
  }

  const handleDelete = (id: string) => {
    if (confirm("결제 수단을 삭제하시겠습니까?")) {
      setPaymentMethods((prev) => prev.filter((method) => method.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">결제 수단 관리</h2>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              결제 수단 추가
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 결제 수단 추가</DialogTitle>
            </DialogHeader>
            <AddPaymentMethodForm
              onAdd={(method) => {
                setPaymentMethods((prev) => [...prev, { ...method, id: Date.now().toString() }])
                setShowAddDialog(false)
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {paymentMethods.map((method) => (
          <Card key={method.id} className={method.isDefault ? "border-purple-500 bg-purple-50" : ""}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{method.name}</h3>
                      {method.isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          기본
                        </Badge>
                      )}
                      {method.isVerified && (
                        <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                          <Shield className="h-3 w-3 mr-1" />
                          인증완료
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{method.details}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!method.isDefault && (
                    <Button variant="outline" size="sm" onClick={() => handleSetDefault(method.id)}>
                      기본으로 설정
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(method.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {paymentMethods.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">등록된 결제 수단이 없습니다</h3>
            <p className="text-gray-500 mb-4">경매 참여를 위해 결제 수단을 등록해주세요.</p>
            <Button onClick={() => setShowAddDialog(true)} className="bg-purple-600 hover:bg-purple-700">
              결제 수단 추가
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function AddPaymentMethodForm({ onAdd }: { onAdd: (method: Omit<PaymentMethod, "id">) => void }) {
  const [type, setType] = useState<"card" | "bank">("card")
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryDate: "",
    cardHolder: "",
    bankName: "",
    accountNumber: "",
    accountHolder: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (type === "card") {
      onAdd({
        type: "card",
        name: "신용카드",
        details: `**** **** **** ${formData.cardNumber.slice(-4)}`,
        isDefault: false,
        isVerified: false,
      })
    } else {
      onAdd({
        type: "bank",
        name: formData.bankName,
        details: formData.accountNumber,
        isDefault: false,
        isVerified: false,
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">결제 수단 유형</label>
        <Select value={type} onValueChange={(value: "card" | "bank") => setType(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="card">신용/체크카드</SelectItem>
            <SelectItem value="bank">계좌이체</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {type === "card" ? (
        <>
          <div>
            <label className="text-sm font-medium mb-2 block">카드번호</label>
            <Input
              value={formData.cardNumber}
              onChange={(e) => setFormData((prev) => ({ ...prev, cardNumber: e.target.value }))}
              placeholder="0000-0000-0000-0000"
              maxLength={19}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">유효기간</label>
              <Input
                value={formData.expiryDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, expiryDate: e.target.value }))}
                placeholder="MM/YY"
                maxLength={5}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">카드소유자명</label>
              <Input
                value={formData.cardHolder}
                onChange={(e) => setFormData((prev) => ({ ...prev, cardHolder: e.target.value }))}
                placeholder="홍길동"
                required
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <div>
            <label className="text-sm font-medium mb-2 block">은행명</label>
            <Select
              value={formData.bankName}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, bankName: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="은행을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="국민은행">국민은행</SelectItem>
                <SelectItem value="신한은행">신한은행</SelectItem>
                <SelectItem value="우리은행">우리은행</SelectItem>
                <SelectItem value="하나은행">하나은행</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">계좌번호</label>
            <Input
              value={formData.accountNumber}
              onChange={(e) => setFormData((prev) => ({ ...prev, accountNumber: e.target.value }))}
              placeholder="123-456-789012"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">예금주명</label>
            <Input
              value={formData.accountHolder}
              onChange={(e) => setFormData((prev) => ({ ...prev, accountHolder: e.target.value }))}
              placeholder="홍길동"
              required
            />
          </div>
        </>
      )}

      <Button type="submit" className="w-full">
        결제 수단 추가
      </Button>
    </form>
  )
}
