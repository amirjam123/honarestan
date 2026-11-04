import type { Metadata, Viewport } from "next";
import { SITE_URL } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "هنرستان فنی و حرفه ای هادی | Honarestan Hadi",
    template: "%s | هنرستان فنی و حرفه ای هادی",
  },
  description:
    "هنرستان فنی و حرفه ای هادی؛ آموزش فنی و حرفه‌ای در رشته‌های حسابداری و شبکه و نرم‌افزار.",
  keywords: [
    "هنرستان فنی و حرفه ای هادی",
    "هنرستان هادی",
    "ثبت نام هنرستان",
    "رشته حسابداری",
    "شبکه و نرم افزار",
  ],
  openGraph: {
    type: "website",
    locale: "fa_IR",
    siteName: "هنرستان فنی و حرفه ای هادی",
    title: "هنرستان فنی و حرفه ای هادی",
    description:
      "هنرستان فنی و حرفه ای هادی؛ آموزش فنی و حرفه‌ای در رشته‌های حسابداری و شبکه و نرم‌افزار.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "هنرستان فنی و حرفه ای هادی",
    description:
      "هنرستان فنی و حرفه ای هادی؛ آموزش فنی و حرفه‌ای در رشته‌های حسابداری و شبکه و نرم‌افزار.",
  },
  metadataBase: new URL(SITE_URL),
  applicationName: "هنرستان فنی و حرفه ای هادی",
  icons: [
    {
      url: "/icon.svg",
      type: "image/svg+xml",
      sizes: "any",
    },
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className="h-full antialiased">
      <head>
        <meta name="theme-color" content="#2563eb" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" sizes="any" />
      </head>
      <body className="min-h-full flex flex-col">
        <a href="#main-content" className="skip-to-content">
          رفتن به محتوای اصلی
        </a>
        {children}
      </body>
    </html>
  );
}
