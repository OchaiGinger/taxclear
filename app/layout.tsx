import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://fiscora.com"), // change to your real domain

  title: {
    default: "Fiscora — Nigeria Tax Calculator & FIRS Compliance Tool",
    template: "%s | Fiscora",
  },

  description:
    "Master your tax liability in real-time with Fiscora. Instantly calculate PAYE, VAT, and effective tax rates under Nigeria’s 2024 Finance Act. Secure, anonymous, and 100% FIRS-compliant.",

  keywords: [
    "Nigeria tax calculator",
    "PAYE Nigeria",
    "FIRS tax tool",
    "Finance Act 2024 Nigeria",
    "income tax Nigeria",
    "tax compliance Nigeria",
    "BVN tax verification",
    "VAT Nigeria",
    "tax clearance Nigeria",
  ],

  authors: [{ name: "Fiscora" }],
  creator: "Fiscora",
  publisher: "Fiscora",

  openGraph: {
    title: "Fiscora — Master Your Tax Liability in Real-Time",
    description:
      "Instantly calculate your PAYE, track compliance, and optimize your tax legally under Nigeria’s 2024 Finance Act.",
    url: "https://fiscora.com",
    siteName: "Fiscora",
    images: [
      {
        url: "/og-image.png", // put your actual OG image in /public
        width: 1200,
        height: 630,
        alt: "Fiscora Tax Dashboard",
      },
    ],
    locale: "en_NG",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Fiscora — Nigeria Tax Calculator",
    description:
      "Calculate PAYE, track compliance, and reduce tax risk with Nigeria’s smartest tax tool.",
    images: ["/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
  },

  icons: {
    icon: "/favicon.ico",
  },

  category: "finance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-black">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
