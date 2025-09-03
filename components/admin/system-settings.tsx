"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Settings, Shield, Bell, Database, Globe } from "lucide-react"

interface SystemConfig {
  siteName: string
  siteDescription: string
  contactEmail: string
  supportPhone: string
  maintenanceMode: boolean
  registrationEnabled: boolean
  emailNotifications: boolean
  smsNotifications: boolean
  auctionSettings: {
    defaultDuration: number
    minBidIncrement: number
    buyerPremium: number
    sellerCommission: number
    extendTimeOnBid: number
  }
  paymentSettings: {
    paymentTimeout: number
    supportedMethods: string[]
    minimumDeposit: number
  }
  securitySettings: {
    maxLoginAttempts: number
    sessionTimeout: number
    requirePhoneVerification: boolean
    requireEmailVerification: boolean
  }
}

export function SystemSettings() {
  const [config, setConfig] = useState<SystemConfig>({
    siteName: "프리미엄 경매",
    siteDescription: "명품 및 수집품 전문 경매 플랫폼",
    contactEmail: "support@auction.com",
    supportPhone: "1588-0000",
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotifications: true,
    smsNotifications: true,
    auctionSettings: {
      defaultDuration: 7,
      minBidIncrement: 10000,
      buyerPremium: 10,
      sellerCommission: 15,
      extendTimeOnBid: 5,
    },
    paymentSettings: {
      paymentTimeout: 10,
      supportedMethods: ["card", "bank", "kakao"],
      minimumDeposit: 100000,
    },
    securitySettings: {
      maxLoginAttempts: 5,
      sessionTimeout: 30,
      requirePhoneVerification: true,
      requireEmailVerification: true,
    },
  })

  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
    alert("설정이 저장되었습니다.")
  }

  const updateConfig = (section: keyof SystemConfig, field: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      [section]: typeof prev[section] === "object" ? { ...prev[section], [field]: value } : value,
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">시스템 설정</h2>
        <Button onClick={handleSave} disabled={isSaving} className="bg-purple-600 hover:bg-purple-700">
          {isSaving ? "저장 중..." : "설정 저장"}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">일반</TabsTrigger>
          <TabsTrigger value="auction">경매</TabsTrigger>
          <TabsTrigger value="payment">결제</TabsTrigger>
          <TabsTrigger value="security">보안</TabsTrigger>
          <TabsTrigger value="notifications">알림</TabsTrigger>
          <TabsTrigger value="maintenance">유지보수</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                일반 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">사이트 이름</label>
                  <Input value={config.siteName} onChange={(e) => updateConfig("siteName", "", e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">고객지원 전화</label>
                  <Input
                    value={config.supportPhone}
                    onChange={(e) => updateConfig("supportPhone", "", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">사이트 설명</label>
                <Textarea
                  value={config.siteDescription}
                  onChange={(e) => updateConfig("siteDescription", "", e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">고객지원 이메일</label>
                <Input
                  type="email"
                  value={config.contactEmail}
                  onChange={(e) => updateConfig("contactEmail", "", e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">신규 회원가입 허용</label>
                  <p className="text-xs text-gray-500">새로운 사용자의 회원가입을 허용합니다</p>
                </div>
                <Switch
                  checked={config.registrationEnabled}
                  onCheckedChange={(checked) => updateConfig("registrationEnabled", "", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auction">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                경매 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">기본 경매 기간 (일)</label>
                  <Input
                    type="number"
                    value={config.auctionSettings.defaultDuration}
                    onChange={(e) => updateConfig("auctionSettings", "defaultDuration", Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">최소 입찰 인상폭 (원)</label>
                  <Input
                    type="number"
                    value={config.auctionSettings.minBidIncrement}
                    onChange={(e) => updateConfig("auctionSettings", "minBidIncrement", Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">구매자 수수료 (%)</label>
                  <Input
                    type="number"
                    value={config.auctionSettings.buyerPremium}
                    onChange={(e) => updateConfig("auctionSettings", "buyerPremium", Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">판매자 수수료 (%)</label>
                  <Input
                    type="number"
                    value={config.auctionSettings.sellerCommission}
                    onChange={(e) => updateConfig("auctionSettings", "sellerCommission", Number(e.target.value))}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">입찰 시 연장 시간 (분)</label>
                <Input
                  type="number"
                  value={config.auctionSettings.extendTimeOnBid}
                  onChange={(e) => updateConfig("auctionSettings", "extendTimeOnBid", Number(e.target.value))}
                />
                <p className="text-xs text-gray-500 mt-1">경매 종료 5분 전 입찰 시 자동 연장되는 시간</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                결제 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">결제 제한 시간 (분)</label>
                  <Input
                    type="number"
                    value={config.paymentSettings.paymentTimeout}
                    onChange={(e) => updateConfig("paymentSettings", "paymentTimeout", Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">최소 보증금 (원)</label>
                  <Input
                    type="number"
                    value={config.paymentSettings.minimumDeposit}
                    onChange={(e) => updateConfig("paymentSettings", "minimumDeposit", Number(e.target.value))}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">지원 결제 수단</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "card", label: "신용/체크카드" },
                    { id: "bank", label: "계좌이체" },
                    { id: "kakao", label: "카카오페이" },
                    { id: "naver", label: "네이버페이" },
                    { id: "payco", label: "페이코" },
                  ].map((method) => (
                    <Badge
                      key={method.id}
                      variant={config.paymentSettings.supportedMethods.includes(method.id) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        const methods = config.paymentSettings.supportedMethods.includes(method.id)
                          ? config.paymentSettings.supportedMethods.filter((m) => m !== method.id)
                          : [...config.paymentSettings.supportedMethods, method.id]
                        updateConfig("paymentSettings", "supportedMethods", methods)
                      }}
                    >
                      {method.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                보안 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">최대 로그인 시도 횟수</label>
                  <Input
                    type="number"
                    value={config.securitySettings.maxLoginAttempts}
                    onChange={(e) => updateConfig("securitySettings", "maxLoginAttempts", Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">세션 타임아웃 (분)</label>
                  <Input
                    type="number"
                    value={config.securitySettings.sessionTimeout}
                    onChange={(e) => updateConfig("securitySettings", "sessionTimeout", Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">휴대폰 인증 필수</label>
                    <p className="text-xs text-gray-500">회원가입 시 휴대폰 인증을 필수로 합니다</p>
                  </div>
                  <Switch
                    checked={config.securitySettings.requirePhoneVerification}
                    onCheckedChange={(checked) => updateConfig("securitySettings", "requirePhoneVerification", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">이메일 인증 필수</label>
                    <p className="text-xs text-gray-500">회원가입 시 이메일 인증을 필수로 합니다</p>
                  </div>
                  <Switch
                    checked={config.securitySettings.requireEmailVerification}
                    onCheckedChange={(checked) => updateConfig("securitySettings", "requireEmailVerification", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                알림 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">이메일 알림</label>
                  <p className="text-xs text-gray-500">입찰, 낙찰, 결제 등의 이메일 알림을 발송합니다</p>
                </div>
                <Switch
                  checked={config.emailNotifications}
                  onCheckedChange={(checked) => updateConfig("emailNotifications", "", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">SMS 알림</label>
                  <p className="text-xs text-gray-500">중요한 알림을 SMS로 발송합니다</p>
                </div>
                <Switch
                  checked={config.smsNotifications}
                  onCheckedChange={(checked) => updateConfig("smsNotifications", "", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                유지보수 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">유지보수 모드</label>
                  <p className="text-xs text-gray-500">사이트를 일시적으로 점검 모드로 전환합니다</p>
                </div>
                <Switch
                  checked={config.maintenanceMode}
                  onCheckedChange={(checked) => updateConfig("maintenanceMode", "", checked)}
                />
              </div>
              {config.maintenanceMode && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ 유지보수 모드가 활성화되어 있습니다. 관리자를 제외한 모든 사용자는 사이트에 접근할 수 없습니다.
                  </p>
                </div>
              )}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">시스템 정보</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-gray-600">서버 상태</p>
                    <p className="font-medium text-green-600">정상</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-gray-600">데이터베이스</p>
                    <p className="font-medium text-green-600">연결됨</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-gray-600">마지막 백업</p>
                    <p className="font-medium">2024-01-22 03:00</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-gray-600">시스템 버전</p>
                    <p className="font-medium">v2.1.0</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
