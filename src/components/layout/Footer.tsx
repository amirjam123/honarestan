import Link from "next/link";
import { LocationMarker, Phone, Envelope, ArrowLeft } from "@/components/icons";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-base">ه</span>
              </div>
              <p className="font-bold text-lg">هنرستان هادی</p>
            </div>
            <p className="text-slate-400 text-sm leading-7">
              مرکز آموزش هنرهای زیبا و صنایع خلاق با تیمی حرفه‌ای و مجرب
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-bold text-sm mb-4 text-slate-200">دسترسی سریع</h3>
            <nav className="space-y-2.5" aria-label="پیوندهای سریع">
              {[
                { href: "/about", label: "درباره ما" },
                { href: "/courses", label: "دوره‌های آموزشی" },
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
                <span>آدرس: تهران، خیابان نمونه، کوچه نمونه، پلاک ۱۲۳</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Phone size={16} className="text-slate-500 flex-shrink-0" />
                <span dir="ltr" className="font-mono text-xs">021-12345678</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Envelope size={16} className="text-slate-500 flex-shrink-0" />
                <span className="font-mono text-xs">info@honarestan-hadi.ir</span>
              </p>
            </address>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-slate-500 text-xs">
            &copy; {new Date().getFullYear()} هنرستان هادی. تمامی حقوق محفوظ است.
          </p>
          <Link
            href="/admin/login"
            className="text-slate-600 hover:text-slate-400 text-xs transition-colors"
          >
            ورود مدیران
          </Link>
        </div>
      </div>
    </footer>
  );
}
