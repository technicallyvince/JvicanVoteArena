import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/lib/auth";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#040404",
};

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://jvicanvotearena.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "JVican Vote Arena — Discover, Support & Cast Verified Votes",
    template: "%s | JVican Vote Arena",
  },
  description:
    "JVican Vote Arena is the premier verified voting platform for competitions, pageants, awards, and talent showcases with frictionless voter checkout and instant cryptographic receipts.",
  keywords: [
    "JVican Vote Arena",
    "online voting platform Nigeria",
    "paid voting portal",
    "beauty pageant voting",
    "award voting system",
    "instant verified voting",
    "live leaderboards",
    "instant voter receipts",
    "contest organizer portal",
    "tamper-proof voting",
  ],
  authors: [{ name: "JVican Technologies", url: appUrl }],
  creator: "JVican Vote Arena",
  publisher: "JVican Vote Arena",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/brand/jvican-vote-arena-logo.png", type: "image/png" },
    ],
    apple: [
      { url: "/brand/jvican-vote-arena-logo.png" },
    ],
  },
  openGraph: {
    title: "JVican Vote Arena — Where Every Vote Counts",
    description:
      "Join live events, support exceptional candidates, and participate in transparent, verified online voting with cryptographic instant receipts.",
    url: appUrl,
    siteName: "JVican Vote Arena",
    images: [
      {
        url: "/brand/jvican-vote-arena-logo.png",
        width: 1024,
        height: 1024,
        alt: "JVican Vote Arena Official Brand Mark",
      },
    ],
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JVican Vote Arena — Discover & Vote",
    description:
      "Cast verified votes for your favorite nominees in live competitions across Nigeria and beyond.",
    images: ["/brand/jvican-vote-arena-logo.png"],
    creator: "@jvicanvotearena",
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
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${appUrl}/#organization`,
      "name": "JVican Vote Arena",
      "url": appUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${appUrl}/brand/jvican-vote-arena-logo.png`,
        "width": 1024,
        "height": 1024,
      },
      "sameAs": [
        "https://twitter.com/jvicanvotearena",
        "https://instagram.com/jvicanvotearena",
        "https://facebook.com/jvicanvotearena",
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "Customer Support",
        "email": "support@jvicanvotes.com.ng",
        "areaServed": "NG",
        "availableLanguage": ["English"],
      },
    },
    {
      "@type": "WebSite",
      "@id": `${appUrl}/#website`,
      "url": appUrl,
      "name": "JVican Vote Arena",
      "description": "Premier verified event voting platform with cryptographic instant receipts.",
      "publisher": {
        "@id": `${appUrl}/#organization`,
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${appUrl}/nominees?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full scroll-smooth ${plusJakartaSans.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="flex min-h-screen flex-col bg-[#040404] text-[#f0efe8] font-sans antialiased selection:bg-[#C9A84C] selection:text-[#040404]">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
        {/* Payment Gateway Checkout SDK */}
        <Script
          src="https://payment-web-sdk.transactpay.ai/v1/checkout"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}

