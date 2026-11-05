import type { Metadata, Viewport } from "next";
import { Sora, Inter, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-hindi",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Yojana Saathi - Government Welfare Finder",
  description: "Check eligibility and official criteria for central and state schemes across India.",
};

export const viewport: Viewport = {
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
    <html lang="en" className={`${sora.variable} ${inter.variable} ${notoSansDevanagari.variable}`}>
      <body className="bg-offwhite dark:bg-offwhite-dark text-ink dark:text-slate-100 font-body antialiased min-h-screen transition-colors duration-150">
        {children}
      </body>
    </html>
  );
}
