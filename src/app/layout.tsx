import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "هنرستان هادی | Honarestan Hadi",
    template: "%s | هنرستان هادی",
  },
  description:
    "هنرستان هادی - مرکز آموزش هنرهای زیبا و صنایع خلاق. آموزش نقاشی، مجسمه‌سازی، خوشنویسی، عکاسی و گرافیک با بهترین اساتید.",
  keywords: [
    "هنرستان هادی",
    "آموزش هنر",
    "نقاشی",
    "مجسمه‌سازی",
    "خوشنویسی",
    "عکاسی",
    "گرافیک",
  ],
  openGraph: {
    type: "website",
    locale: "fa_IR",
    siteName: "هنرستان هادی",
    title: "هنرستان هادی | مرکز آموزش هنرهای زیبا",
    description: "هنرستان هادی - مرکز آموزش هنرهای زیبا و صنایع خلاق.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="ltr" className="h-full antialiased">
      <head>
        <meta name="theme-color" content="#2563eb" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700&display=swap"
        />
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
