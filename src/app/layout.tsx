import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://jvican-vote-arena.com"),
  title: {
    default: "JVican Vote Arena — Discover, Support & Vote",
    template: "%s | JVican Vote Arena",
  },
  description:
    "JVican Vote Arena is the premier platform for discovering live competitions, supporting your favorite contestants, and casting verified votes with instant receipts.",
  keywords: [
    "JVican Vote Arena",
    "JVican voting",
    "online contest voting",
    "paid voting platform",
    "Miss Igbeti 2026",
    "awards voting Nigeria",
    "TransactPay verified voting",
    "live leaderboards",
  ],
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
      "Join live contests, support exceptional talents, and participate in transparent, verified online voting.",
    url: "https://votearena.jvican.com",
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
      "Cast verified votes for your favorite contestants in live competitions across Nigeria and beyond.",
    images: ["/brand/jvican-vote-arena-logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full scroll-smooth ${plusJakartaSans.variable}`}>
      <body className="flex min-h-screen flex-col bg-[#fafafa] text-[#0f172a] font-sans antialiased selection:bg-blue-600 selection:text-white dark:bg-[#090d16] dark:text-[#f1f5f9]">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
