import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
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
  title: {
    default: "MyBacklog - Track Your Entertainment",
    template: "%s | MyBacklog",
  },
  description: "Track movies, TV shows, books, and music you want to enjoy. Never lose track of your entertainment backlog again.",
  keywords: ["movies", "tv shows", "books", "music", "backlog", "tracker", "watchlist", "reading list"],
  authors: [{ name: "MyBacklog" }],
  creator: "MyBacklog",
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://thebacklog.vercel.app",
    title: "MyBacklog - Track Your Entertainment",
    description: "Track movies, TV shows, books, and music you want to enjoy.",
    siteName: "MyBacklog",
  },
  twitter: {
    card: "summary_large_image",
    title: "MyBacklog - Track Your Entertainment",
    description: "Track movies, TV shows, books, and music you want to enjoy.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#8b5cf6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

