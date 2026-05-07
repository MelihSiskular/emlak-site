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
  metadataBase: new URL("https://kirklareliemlakgayrimenkul.com"),

  title: {
    default: "Kırklareli Emlak Gayrimenkul",
    template: "%s | Kırklareli Emlak",
  },

  description:
    "Kırklareli satılık ve kiralık daire, arsa, villa ve iş yeri ilanları. Güncel emlak ve gayrimenkul ilanlarını inceleyin.",

  keywords: [
    "Kırklareli emlak",
    "Kırklareli gayrimenkul",
    "Kırklareli satılık daire",
    "Kırklareli kiralık daire",
    "Kırklareli arsa",
    "Kırklareli villa",
    "Kırklareli iş yeri",
  ],

  openGraph: {
    title: "Kırklareli Emlak Gayrimenkul",
    description:
      "Kırklareli bölgesindeki güncel satılık ve kiralık emlak ilanları.",
    url: "https://kirklareliemlakgayrimenkul.com",
    siteName: "Kırklareli Emlak Gayrimenkul",
    locale: "tr_TR",
    type: "website",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}