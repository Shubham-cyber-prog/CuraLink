import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CuraLink — AI-Powered Telehealth Platform",
  description:
    "Connect with licensed doctors instantly. Describe your symptoms, get AI-powered guidance, and book a real-time consultation from anywhere.",
  keywords: ["telehealth", "online doctor", "AI health", "virtual consultation", "CuraLink"],
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white">{children}</body>
    </html>
  );
}
