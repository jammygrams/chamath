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
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />
        <meta property="og:title" content="Chamath's Predictions" />
        <meta property="og:description" content="How accurate are Chamath Palihapitiya's predictions?" />
        <meta property="og:image" content="https://raw.githubusercontent.com/jammygrams/chamath/main/public/chamath_cropped.png" />
        <meta property="og:url" content="https://chamath-eight.vercel.app" />
      </head>
      <body className={`${inter.className} bg-gray-900 text-gray-100`}>{children}</body>
    </html>
  )
}

