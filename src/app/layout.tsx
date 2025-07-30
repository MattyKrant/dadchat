import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ClaimAppeal AI - Health Insurance Appeal Letters",
  description: "Generate professional health insurance appeal letters from denied claims using AI-powered OCR and GPT.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full bg-background text-foreground antialiased`}>
        {children}
      </body>
    </html>
  );
}
