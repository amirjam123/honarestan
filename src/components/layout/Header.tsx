"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bars3, XMark } from "@/components/icons";

const navLinks = [
  { href: "/", label: "خانه" },
  { href: "/about", label: "درباره ما" },
  { href: "/courses", label: "دوره‌ها" },
  { href: "/teachers", label: "اساتید" },
  { href: "/gallery", label: "گالری" },
  { href: "/news", label: "اخبار" },
  { href: "/contact", label: "تماس با ما" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <header
      className={`sticky top-0 z-50 transition-shadow duration-200 ${
        scrolled ? "bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]" : "bg-white"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-[72px]">
          <Link href="/" className="flex items-center gap-2.5" aria-label="صفحه اصلی هنرستان هادی">
            <div className="w-9 h-9 lg:w-10 lg:h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-base lg:text-lg" aria-hidden="true">ه</span>
            </div>
            <div className="hidden sm:block">
              <p className="font-bold text-base lg:text-lg text-slate-900 leading-tight">هنرستان هادی</p>
              <p className="text-[10px] text-slate-400 tracking-widest font-medium">HONARESTAN HADI</p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center" aria-label="منوی اصلی">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative px-4 py-2 text-[13px] font-medium transition-colors cursor-pointer ${
                    isActive
                      ? "text-primary-700"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 right-2 left-2 h-[2px] bg-primary-600 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label={mobileOpen ? "بستن منو" : "باز کردن منو"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <XMark size={24} /> : <Bars3 size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 top-16 z-40 bg-black/20" onClick={() => setMobileOpen(false)} aria-hidden="true" />
      )}

      {/* Mobile menu */}
      <div
        className={`lg:hidden fixed top-16 right-0 bottom-0 w-72 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-out ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="منوی موبایل"
      >
        <nav className="p-4 space-y-1" aria-label="منوی موبایل">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                aria-current={isActive ? "page" : undefined}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "text-primary-700 bg-primary-50 border-r-2 border-r-primary-600"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
