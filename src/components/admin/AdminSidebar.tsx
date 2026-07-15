"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Chart, Megaphone, Photo, BookOpen, UserGroup, PaintBrush,
  Calendar, ChatBubble, Document, Cog, Envelope, Home,
} from "@/components/icons";

const adminLinks = [
  { href: "/admin", label: "داشبورد", icon: Chart },
  { href: "/admin/news", label: "اخبار", icon: Megaphone },
  { href: "/admin/gallery", label: "گالری", icon: Photo },
  { href: "/admin/courses", label: "دوره‌ها", icon: BookOpen },
  { href: "/admin/teachers", label: "اساتید", icon: UserGroup },
  { href: "/admin/student-works", label: "آثار هنرجویان", icon: PaintBrush },
  { href: "/admin/events", label: "رویدادها", icon: Calendar },
  { href: "/admin/testimonials", label: "نظرات", icon: ChatBubble },
  { href: "/admin/pages", label: "صفحات", icon: Document },
  { href: "/admin/settings", label: "تنظیمات", icon: Cog },
  { href: "/admin/messages", label: "پیام‌ها", icon: Envelope },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-slate-900 text-white min-h-screen flex flex-col">
      <div className="p-4 mb-2">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">ه</span>
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">پنل مدیریت</p>
            <p className="text-[10px] text-slate-400">هنرستان هادی</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-2 space-y-0.5" aria-label="منوی مدیریت">
        {adminLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? "bg-primary-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Icon size={16} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-slate-800">
        <Link
          href="/"
          className="flex items-center gap-2.5 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-xs font-medium"
        >
          <Home size={16} />
          <span>مشاهده سایت</span>
        </Link>
      </div>
    </aside>
  );
}
