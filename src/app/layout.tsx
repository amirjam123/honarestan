import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "هنرستان هادی | Honarestan Hadi",
    template: "%s | هنرستان هادی",
  },
  description: "هنرستان هادی - مرکز آموزش هنرهای زیبا و صنایع خلاق. آموزش نقاشی، مجسمه‌سازی، خوشنویسی، عکاسی و گرافیک با بهترین اساتید.",
  keywords: ["هنرستان هادی", "آموزش هنر", "نقاشی", "مجسمه‌سازی", "خوشنویسی", "عکاسی", "گرافیک"],
  openGraph: {
    type: "website",
    locale: "fa_IR",
    siteName: "هنرستان هادی",
    title: "هنرستان هادی | مرکز آموزش هنرهای زیبا",
    description: "مرکز آموزش هنرهای زیبا و صنایع خلاق با تیمی حرفه‌ای و مجرب",
  },
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
