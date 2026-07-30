import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
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
    url: "https://honarestan-hadi.ir",
  },
  twitter: {
    card: "summary_large_image",
    title: "هنرستان هادی | مرکز آموزش هنرهای زیبا",
    description: "هنرستان هادی - مرکز آموزش هنرهای زیبا و صنایع خلاق.",
  },
  metadataBase: new URL("https://honarestan-hadi.ir"),
  applicationName: "هنرستان هادی",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
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
