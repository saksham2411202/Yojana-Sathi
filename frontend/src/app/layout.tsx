import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yojana Saathi - Govt Scheme Matcher",
  description: "Guided, multilingual Government Scheme Matcher for India",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen">
        <main className="mx-auto max-w-md min-h-screen flex flex-col px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
