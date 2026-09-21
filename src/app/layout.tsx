import type { Metadata } from "next";
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

export const metadata: Metadata = {
  metadataBase: new URL("https://jvican-vote-arena.com"),
  title: {
    default: "JVican Vote Arena — Discover, Support & Vote",
    template: "%s | JVican Vote Arena",
  },
  description:
    "JVican Vote Arena is the premier platform for discovering live competitions, supporting your favorite nominees, and casting verified votes with instant receipts.",
  keywords: [
    "JVican Vote Arena",
    "JVican voting",
    "online event voting",
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
      "Join live events, support exceptional talents, and participate in transparent, verified online voting.",
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
      "Cast verified votes for your favorite nominees in live competitions across Nigeria and beyond.",
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
      <body className="flex min-h-screen flex-col bg-[#080808] text-[#f4f4f5] font-sans antialiased selection:bg-[#ff5500] selection:text-white">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
