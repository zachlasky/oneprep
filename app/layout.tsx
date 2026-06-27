import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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
  title: "OnePrep",
  description: "AI-powered 1:1 meeting preparation for engineering teams.",
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
      <body className="min-h-full flex flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-zinc-200 px-8 py-5">
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-semibold tracking-tight">OnePrep</span>
            <p className="max-w-md text-zinc-600">
              AI-powered 1:1 meeting preparation for engineering teams.
            </p>
          </div>
          <nav className="flex gap-4 text-sm font-medium text-zinc-700">
            <Link href="/" className="transition-colors hover:text-indigo-600">
              Home
            </Link>
            <Link href="/about" className="transition-colors hover:text-indigo-600">
              About
            </Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
