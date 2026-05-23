import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeSync } from "@/components/jarvis/ThemeSync";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "J.A.R.V.I.S. - Just A Rather Very Intelligent System",
  description:
    "Futuristic AI assistant inspired by Iron Man's JARVIS. Cinematic HUD interface with voice recognition, intelligent conversation, and real-time system monitoring.",
  keywords: [
    "JARVIS",
    "AI Assistant",
    "Iron Man",
    "HUD",
    "Voice Recognition",
    "Chat",
  ],
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeSync />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
