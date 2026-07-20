"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LocationMarker, Phone, Envelope, ArrowLeft } from "@/components/icons";

export default function Footer() {
  const [schoolName, setSchoolName] = useState("هنرستان هادی");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [contactInfo, setContactInfo] = useState({
    address: "تهران، خیابان نمونه، کوچه نمونه، پلاک ۱۲۳",
    phone: "021-12345678",
    email: "info@honarestan-hadi.ir",
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.ok ? res.json() : {})
      .then((data: Record<string, string>) => {
        if (data["school_name"]) setSchoolName(data["school_name"]);
        if (data["logo_url"]) setLogoUrl(data["logo_url"]);
        if (data["address"]) setContactInfo(prev => ({ ...prev, address: data["address"] }));
        if (data["phone"]) setContactInfo(prev => ({ ...prev, phone: data["phone"] }));
        if (data["email"]) setContactInfo(prev => ({ ...prev, email: data["email"] }));
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="bg-slate-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              {logoUrl ? (
                <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center bg-white">
                  <img src={logoUrl} alt={schoolName} className="max-w-full max-h-full object-contain" />
                </div>
              ) : (
                <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-base">ه</span>
                </div>
              )}
              <p className="font-bold text-lg">{schoolName}</p>
            </div>
            <p className="text-slate-400 text-sm leading-7">
              {schoolName}
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-bold text-sm mb-4 text-slate-200">دسترسی سریع</h3>
            <nav className="space-y-2.5" aria-label="پیوندهای سریع">
              {[
                { href: "/about", label: "درباره ما" },
                { href: "/teachers", label: "اساتید" },
                { href: "/gallery", label: "گالری تصاویر" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors group"
                >
                  <ArrowLeft size={14} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* More links */}
          <div>
            <h3 className="font-bold text-sm mb-4 text-slate-200">ارتباط با ما</h3>
            <nav className="space-y-2.5" aria-label="ارتباط">
              {[
                { href: "/news", label: "اخبار و اطلاعیه‌ها" },
                { href: "/contact", label: "تماس با ما" },
                { href: "/student-works", label: "آثار هنرجویان" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors group"
                >
                  <ArrowLeft size={14} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact info */}
          <div>
            <h3 className="font-bold text-sm mb-4 text-slate-200">تماس با ما</h3>
            <address className="not-italic space-y-3 text-slate-400 text-sm">
              <p className="flex items-start gap-2.5">
                <LocationMarker size={16} className="text-slate-500 mt-0.5 flex-shrink-0" />
                <span>آدرس: {contactInfo.address}</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Phone size={16} className="text-slate-500 flex-shrink-0" />
                <span dir="ltr" className="font-mono text-xs">{contactInfo.phone}</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Envelope size={16} className="text-slate-500 flex-shrink-0" />
                <span className="font-mono text-xs">{contactInfo.email}</span>
              </p>
            </address>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-slate-500 text-xs">
            &copy; {new Date().getFullYear()} {schoolName}. تمامی حقوق محفوظ است.
          </p>
          <Link
            href="/hadi-panel-x7k9/login"
            className="text-slate-600 hover:text-slate-400 text-xs transition-colors"
          >
            ورود مدیران
          </Link>
        </div>
      </div>
    </footer>
  );
}
