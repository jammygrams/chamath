import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: "All Prophets",
  description: 'How accurate are the All-In Podcast hosts\' predictions?',
  icons: {
    icon: '/all-in.png',
  },
  openGraph: {
    title: 'All Prophets',
    description: 'How accurate are the All-In Podcast hosts\' predictions?',
    images: [
      {
        url: 'https://www.allprophets.org/rankings-screenshot.png',
        width: 1104,
        height: 690,
        alt: 'All Prophets - All-In Podcast Predictions',
      },
    ],
    url: 'https://www.allprophets.org',
    siteName: 'All Prophets',
    type: 'website',
  },
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
      </head>
      <body className={`${inter.className} bg-gray-900 text-gray-100`}>{children}</body>
    </html>
  )
}

