import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "nexus-7 os",
  description: "NEXUS-7 OS - A futuristic web-based desktop interface with AI capabilities",
  keywords: ["NEXUS-7", "OS", "desktop", "AI", "webOS", "Next.js", "TypeScript", "Tailwind CSS"],
  authors: [{ name: "NEXUS-7 Team" }],
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "nexus-7 os",
    description: "A futuristic web-based desktop interface with AI capabilities",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "nexus-7 os",
    description: "A futuristic web-based desktop interface with AI capabilities",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
