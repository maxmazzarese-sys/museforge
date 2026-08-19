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
  title: "MuseForge — One idea that actually changes your day",
  description:
    "A daily AI spark engineered for creators, founders, and operators. Personalized ideas, prompts, and strategies delivered every morning. Cancel anytime.",
  openGraph: {
    title: "MuseForge — Daily ideas worth paying for",
    description:
      "Stop staring at a blank page. Get one sharp, personalized idea every morning.",
    type: "website",
  },
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
      <body className="min-h-full bg-[#07060c] text-zinc-100">{children}</body>
    </html>
  );
}
