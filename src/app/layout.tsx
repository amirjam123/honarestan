import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import { SITE_URL } from "@/lib/seo";
import "./globals.css";

const vazir = Vazirmatn({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-vazir",
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "هنرستان فنی حرفه ای هادی | Honarestan Hadi",
    template: "%s | هنرستان فنی حرفه ای هادی",
  },
  description:
    "هنرستان فنی حرفه ای هادی؛ آموزش فنی و حرفه‌ای در رشته‌های حسابداری و شبکه و نرم‌افزار.",
  keywords: [
    "هنرستان فنی حرفه ای هادی",
    "هنرستان هادی",
    "ثبت نام هنرستان",
    "رشته حسابداری",
    "شبکه و نرم افزار",
  ],
  openGraph: {
    type: "website",
    locale: "fa_IR",
    siteName: "هنرستان فنی حرفه ای هادی",
    title: "هنرستان فنی حرفه ای هادی",
    description:
      "هنرستان فنی حرفه ای هادی؛ آموزش فنی و حرفه‌ای در رشته‌های حسابداری و شبکه و نرم‌افزار.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "هنرستان فنی حرفه ای هادی",
    description:
      "هنرستان فنی حرفه ای هادی؛ آموزش فنی و حرفه‌ای در رشته‌های حسابداری و شبکه و نرم‌افزار.",
  },
  metadataBase: new URL(SITE_URL),
  applicationName: "هنرستان فنی حرفه ای هادی",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
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
    <html lang="fa" dir="rtl" className={`h-full antialiased ${vazir.variable}`}>
      <head>
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-vazir)]">
        <a href="#main-content" className="skip-to-content">
          رفتن به محتوای اصلی
        </a>
        {children}
      </body>
    </html>
  );
}
