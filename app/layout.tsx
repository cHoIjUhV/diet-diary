import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '루본간추 다이어리',
  description: '나만의 식사 기록 앱',
  manifest: '/manifest.json',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-dvh flex flex-col">{children}</body>
    </html>
  )
}
