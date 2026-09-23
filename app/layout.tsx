import type { Metadata } from "next";
import { Inter, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "CuraLink — AI-Powered Telehealth Platform",
  description:
    "Connect with licensed doctors instantly. Describe your symptoms, get AI-powered guidance, and book a real-time consultation from anywhere.",
  keywords: ["telehealth", "online doctor", "AI health", "virtual consultation", "CuraLink"],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/logo.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "CuraLink — AI-Powered Telehealth Platform",
    description:
      "Connect with licensed doctors instantly through AI-powered guidance and real-time consultations.",
    type: "website",
    locale: "en_US",
    siteName: "CuraLink",
  },
  twitter: {
    card: "summary_large_image",
    title: "CuraLink — AI-Powered Telehealth Platform",
    description: "Connect with licensed doctors instantly through AI-powered guidance.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${geistMono.variable} ${instrument.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
