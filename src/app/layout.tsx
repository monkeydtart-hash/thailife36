import type { Metadata } from 'next'
import { Sarabun, Noto_Serif_Thai } from 'next/font/google'
import './globals.css'

const sarabun = Sarabun({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sarabun',
  display: 'swap',
})

const notoSerifThai = Noto_Serif_Thai({
  subsets: ['thai'],
  weight: ['400', '600', '700'],
  variable: '--font-serif-thai',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Digital Office — ไทยประกันชีวิต',
  description: 'หน้าโปรไฟล์ตัวแทนประกันชีวิตไทยประกันชีวิต',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className={`${sarabun.variable} ${notoSerifThai.variable} font-sarabun bg-white`}>
        {children}
      </body>
    </html>
  )
}
