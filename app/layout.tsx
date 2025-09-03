import type { Metadata } from "next"
import { Montserrat, Open_Sans } from "next/font/google"
import "./globals.css"

export const metadata: Metadata = {
  title: '위마켓 경매 플랫폼',
  description: '실시간 경매 플랫폼',
}

// 폰트 설정 (서버 컴포넌트에서만 사용)
const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
  weight: ["400", "600", "700", "900"],
  preload: true,
})

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open-sans",
  weight: ["400", "500", "600"],
  preload: true,
})

import ClientRoot from './client-root'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html 
      lang="ko" 
      className={`${montserrat.variable} ${openSans.variable} antialiased`} 
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        <ClientRoot>
          {children}
        </ClientRoot>
      </body>
    </html>
  )
}
