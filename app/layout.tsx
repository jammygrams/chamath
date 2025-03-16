import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: "All-In Podcast Predictions",
  description: 'How accurate are the All-In Podcast hosts\' predictions?',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/all-in.png" />
        <link rel="apple-touch-icon" href="/all-in.png" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />
        <meta property="og:title" content="All Prophets" />
        <meta property="og:description" content="How accurate are the All-In Podcast hosts' predictions?" />
        <meta property="og:image" content="https://raw.githubusercontent.com/jammygrams/chamath/main/public/all-in.png" />
        <meta property="og:url" content="https://www.allprophets.org" />
      </head>
      <body className={`${inter.className} bg-gray-900 text-gray-100`}>{children}</body>
    </html>
  )
}

