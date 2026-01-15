import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from './components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CoreCMS',
  description: 'CoreCMS is a modern, secure, and scalable content management system designed to help universities, institutes, and organizations easily manage content, users, and digital resources from a single dashboard.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        
      {children}
      </body>
    </html>
  )
}