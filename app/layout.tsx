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
        <header className="flex flex-col gap-1 border-b border-zinc-200 px-8 py-5">
          <span className="text-3xl font-semibold tracking-tight">OnePrep</span>
          <p className="max-w-md text-zinc-600">
            AI-powered 1:1 meeting preparation for engineering teams.
          </p>
        </header>
        {children}
      </body>
    </html>
  );
}
