import type React from "react"
import type { Metadata } from "next"
import { Fredoka } from "next/font/google"
import "./globals.css"

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "MIAO - The Green Cat Token | Community Owned Memecoin",
  description: "Join the MIAO community! Connect your wallet, swap tokens, and explore our contract. First came the dogs, then the frogs, but the streets were never safe from the shadows. 100% community owned memecoin on Solana.",
  keywords: ["MIAO", "miao token", "memecoin", "solana", "community", "contract", "connect", "swap", "cryptocurrency", "blockchain"],
  authors: [{ name: "MIAO Community" }],
  creator: "MIAO Community",
  publisher: "MIAO Community",
  generator: "Next.js",
  metadataBase: new URL("https://miaotoken.vip"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "MIAO - The Green Cat Token | Community Owned Memecoin",
    description: "Join the MIAO community! Connect your wallet, swap tokens, and explore our contract. First came the dogs, then the frogs, but the streets were never safe from the shadows.",
    url: "https://miaotoken.vip",
    siteName: "MIAO Token",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "MIAO - The Green Cat Token",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MIAO - The Green Cat Token | Community Owned Memecoin",
    description: "Join the MIAO community! Connect your wallet, swap tokens, and explore our contract. First came the dogs, then the frogs, but the streets were never safe from the shadows.",
    images: ["/logo.png"],
    creator: "@miaoonsol",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
    shortcut: "/icon-light-32x32.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon-light-32x32.png" sizes="32x32" type="image/png" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "MIAO Token",
              "alternateName": "MIAO - The Green Cat Token",
              "url": "https://miaotoken.vip",
              "logo": "https://miaotoken.vip/logo.png",
              "description": "MIAO is a community-owned memecoin on Solana. Join the community, connect your wallet, and swap tokens.",
              "sameAs": [
                "https://t.me/miaotokensol",
                "https://x.com/miaoonsol",
                "https://www.instagram.com/miaotoken/",
                "https://www.tiktok.com/@miaoonsol"
              ],
              "foundingDate": "2024",
              "founder": {
                "@type": "Organization",
                "name": "MIAO Community"
              }
            }),
          }}
        />
      </head>
      <body className={`${fredoka.className} antialiased`} suppressHydrationWarning>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = typeof localStorage !== 'undefined' ? localStorage.getItem('theme') || 'light' : 'light';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {
                  document.documentElement.setAttribute('data-theme', 'light');
                }
              })();
            `,
          }}
        />
        <script src="https://js.puter.com/v2/" async></script>
      </body>
    </html>
  )
}
