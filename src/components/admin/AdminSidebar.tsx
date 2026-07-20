"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Chart, Megaphone, Photo, BookOpen, UserGroup, PaintBrush,
  Calendar, Document, Cog, Envelope, Home, AcademicCap, User, Download,
  ChatBubble,
} from "@/components/icons";
import { getAdminPath } from "@/lib/admin-config";

const adminLinks = [
  { href: "", label: "داشبورد", icon: Chart },
  { href: "/news", label: "اخبار", icon: Megaphone },
  { href: "/gallery", label: "گالری", icon: Photo },
  { href: "/teachers", label: "اساتید", icon: UserGroup },
  { href: "/student-works", label: "آثار هنرجویان", icon: PaintBrush },
  { href: "/events", label: "رویدادها", icon: Calendar },
  { href: "/pages", label: "صفحات", icon: Document },
  { href: "/school", label: "پروفایل هنرستان", icon: AcademicCap },
  { href: "/principal", label: "مدیر مدرسه", icon: User },
  { href: "/templates", label: "قالب‌های اکسل", icon: Download },
  { href: "/settings", label: "تنظیمات", icon: Cog },
  { href: "/tickets", label: "تیکت‌ها", icon: ChatBubble },
  { href: "/backup", label: "بکاپ", icon: Download },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [schoolName, setSchoolName] = useState("هنرستان هادی");

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.ok ? res.json() : {})
      .then((data: Record<string, string>) => {
        if (data["school_name"]) setSchoolName(data["school_name"]);
      })
      .catch(() => {});
  }, []);

  return (
    <aside className="w-60 bg-slate-900 text-white min-h-screen flex flex-col">
      <div className="p-4 mb-2">
        <Link href={getAdminPath()} className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">ه</span>
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">پنل مدیریت</p>
            <p className="text-[10px] text-slate-400">{schoolName}</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-2 space-y-0.5" aria-label="منوی مدیریت">
        {adminLinks.map((link) => {
          const fullPath = getAdminPath(link.href);
          const isActive = pathname === fullPath || pathname.startsWith(fullPath + "/");
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={fullPath}
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
