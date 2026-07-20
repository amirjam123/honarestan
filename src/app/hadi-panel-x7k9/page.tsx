import { prisma } from "@/lib/prisma";
import {
  Megaphone, Photo, UserGroup, PaintBrush,
  Calendar,
} from "@/components/icons";
import { getAdminPath } from "@/lib/admin-config";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [newsCount, galleryCount, teachersCount, worksCount, eventsCount, settings] = await Promise.all([
    prisma.news.count(),
    prisma.gallery.count(),
    prisma.teacher.count(),
    prisma.studentWork.count(),
    prisma.event.count(),
    prisma.siteSetting.findMany(),
  ]);

  const settingsMap: Record<string, string> = {};
  settings.forEach((s) => { settingsMap[s.key] = s.value; });
  const schoolName = settingsMap["school_name"] || "هنرستان هادی";

  const stats = [
    { label: "اخبار", count: newsCount, icon: Megaphone, href: getAdminPath("/news"), color: "text-blue-600 bg-blue-50" },
    { label: "تصاویر گالری", count: galleryCount, icon: Photo, href: getAdminPath("/gallery"), color: "text-emerald-600 bg-emerald-50" },
    { label: "اساتید", count: teachersCount, icon: UserGroup, href: getAdminPath("/teachers"), color: "text-amber-600 bg-amber-50" },
    { label: "آثار هنرجویان", count: worksCount, icon: PaintBrush, href: getAdminPath("/student-works"), color: "text-pink-600 bg-pink-50" },
    { label: "رویدادها", count: eventsCount, icon: Calendar, href: getAdminPath("/events"), color: "text-cyan-600 bg-cyan-50" },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold mb-6 text-slate-900">داشبورد مدیریت {schoolName}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <a
              key={stat.label}
              href={stat.href}
              className="admin-card hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">{stat.count}</p>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                </div>
              </div>
            </a>
          );
        })}
      </div>

      <div className="mt-6 admin-card">
        <h2 className="text-sm font-bold mb-3 text-slate-800">راهنمای سریع</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-600">
          {[
            { href: getAdminPath("/news"), label: "اخبار", desc: "اضافه کردن خبر جدید" },
            { href: getAdminPath("/gallery"), label: "گالری", desc: "آپلود تصویر" },
            { href: getAdminPath("/teachers"), label: "اساتید", desc: "مدیریت اساتید" },
            { href: getAdminPath("/student-works"), label: "آثار هنرجویان", desc: "نمایش آثار برتر" },
            { href: getAdminPath("/events"), label: "رویدادها", desc: "مدیریت رویدادها" },
            { href: getAdminPath("/pages"), label: "صفحات", desc: "ویرایش صفحات سایت" },
            { href: getAdminPath("/settings"), label: "تنظیمات", desc: "تغییر تنظیمات سایت" },
          ].map((item) => (
            <p key={item.href}>
              &bull;{" "}
              <a href={item.href} className="text-primary-600 font-medium hover:underline">
                {item.label}
              </a>
              {" "}&mdash; {item.desc}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
