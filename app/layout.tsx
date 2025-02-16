import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: "Chamath Palihapitiya's Predictions",
  description: 'How accurate are Chamath Palihapitiya\'s predictions',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/chamath_cropped.png" />
        <meta property="og:title" content="Chamath's Predictions" />
        <meta property="og:description" content="How accurate are Chamath Palihapitiya's predictions?" />
        <meta property="og:image" content="https://chamath-eight.vercel.app/_next/image?url=%2Fchamath_cropped.png" />
        <meta property="og:url" content="https://chamath-eight.vercel.app" />
      </head>
      <body className={`${inter.className} bg-gray-900 text-gray-100`}>{children}</body>
    </html>
  )
}

