"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Chart, Megaphone, Photo, BookOpen, UserGroup, PaintBrush,
  Calendar, Document, Cog, Envelope, Home, AcademicCap, User, Download,
  ChatBubble, Bars3, XMark, ArrowLeftOnRectangle, Lock, Trash, Globe, Sparkles,
} from "@/components/icons";
import { getAdminPath } from "@/lib/admin-config";

const adminLinks = [
  { href: "", label: "داشبورد", icon: Chart },
  { href: "/news", label: "اخبار", icon: Megaphone },
  { href: "/gallery", label: "گالری", icon: Photo },
  { href: "/media", label: "کتابخانه رسانه", icon: Photo },
  { href: "/teachers", label: "اساتید", icon: UserGroup },
  { href: "/student-works", label: "آثار هنرجویان", icon: PaintBrush },
  { href: "/events", label: "رویدادها", icon: Calendar },
  { href: "/pages", label: "صفحات", icon: Document },
  { href: "/school", label: "پروفایل هنرستان", icon: AcademicCap },
  { href: "/principal", label: "مدیر مدرسه", icon: User },
  { href: "/templates", label: "قالب‌های اکسل", icon: Download },
  { href: "/seo", label: "مدیریت SEO", icon: Globe },
  { href: "/settings", label: "تنظیمات", icon: Cog },
  { href: "/password", label: "تغییر رمز عبور", icon: Lock },
  { href: "/tickets", label: "تیکت‌ها", icon: ChatBubble },
  { href: "/recycle-bin", label: "سطل زباله", icon: Trash },
  { href: "/backup", label: "بکاپ", icon: Download },
];

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const [schoolName, setSchoolName] = useState("هنرستان هادی");

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : {}))
      .then((data: Record<string, string>) => {
        if (data["school_name"]) setSchoolName(data["school_name"]);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 right-0 z-50
          w-60 bg-slate-900 text-white
          flex flex-col
          transform transition-transform duration-200 ease-in-out
          ${open ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex items-center justify-between p-4 mb-2">
          <Link href={getAdminPath()} className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">ه</span>
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">پنل مدیریت</p>
              <p className="text-[10px] text-slate-400">{schoolName}</p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded"
            aria-label="بستن منو"
          >
            <XMark size={20} />
          </button>
        </div>

        <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto" aria-label="منوی مدیریت">
          <Link
            href={getAdminPath("/setup")}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              pathname === getAdminPath("/setup")
                ? "bg-amber-500 text-white"
                : "text-amber-400 hover:text-amber-300 hover:bg-slate-800"
            }`}
          >
            <Sparkles size={16} />
            <span>راهنمای راه‌اندازی</span>
          </Link>
          {adminLinks.map((link) => {
            const fullPath = getAdminPath(link.href);
            const isActive =
              pathname === fullPath || pathname.startsWith(fullPath + "/");
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

        <div className="p-2 border-t border-slate-800 space-y-0.5">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-xs font-medium"
          >
            <Home size={16} />
            <span>مشاهده سایت</span>
          </Link>
          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.href = getAdminPath("/login");
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-slate-800 rounded-lg transition-colors text-xs font-medium"
          >
            <ArrowLeftOnRectangle size={16} />
            <span>خروج</span>
          </button>
        </div>
      </aside>
    </>
  );
}
