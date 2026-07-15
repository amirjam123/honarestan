import { prisma } from "@/lib/prisma";
import {
  Megaphone, Photo, BookOpen, UserGroup, PaintBrush,
  Calendar, ChatBubble, Envelope, Bell,
} from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [newsCount, galleryCount, messagesCount, unreadMessages, teachersCount, coursesCount, worksCount, eventsCount, testimonialsCount] = await Promise.all([
    prisma.news.count(),
    prisma.gallery.count(),
    prisma.contactMessage.count(),
    prisma.contactMessage.count({ where: { read: false } }),
    prisma.teacher.count(),
    prisma.course.count(),
    prisma.studentWork.count(),
    prisma.event.count(),
    prisma.testimonial.count(),
  ]);

  const stats = [
    { label: "اخبار", count: newsCount, icon: Megaphone, href: "/admin/news", color: "text-blue-600 bg-blue-50" },
    { label: "تصاویر گالری", count: galleryCount, icon: Photo, href: "/admin/gallery", color: "text-emerald-600 bg-emerald-50" },
    { label: "دوره‌ها", count: coursesCount, icon: BookOpen, href: "/admin/courses", color: "text-violet-600 bg-violet-50" },
    { label: "اساتید", count: teachersCount, icon: UserGroup, href: "/admin/teachers", color: "text-amber-600 bg-amber-50" },
    { label: "آثار هنرجویان", count: worksCount, icon: PaintBrush, href: "/admin/student-works", color: "text-pink-600 bg-pink-50" },
    { label: "رویدادها", count: eventsCount, icon: Calendar, href: "/admin/events", color: "text-cyan-600 bg-cyan-50" },
    { label: "نظرات", count: testimonialsCount, icon: ChatBubble, href: "/admin/testimonials", color: "text-teal-600 bg-teal-50" },
    { label: "پیام‌ها", count: messagesCount, icon: Envelope, href: "/admin/messages", color: "text-slate-600 bg-slate-100" },
    { label: "خوانده نشده", count: unreadMessages, icon: Bell, href: "/admin/messages", color: "text-red-600 bg-red-50" },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold mb-6 text-slate-900">داشبورد مدیریت</h1>
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
            { href: "/admin/news", label: "اخبار", desc: "اضافه کردن خبر جدید" },
            { href: "/admin/gallery", label: "گالری", desc: "آپلود تصویر" },
            { href: "/admin/courses", label: "دوره‌ها", desc: "مدیریت دوره‌های آموزشی" },
            { href: "/admin/teachers", label: "اساتید", desc: "مدیریت اساتید" },
            { href: "/admin/student-works", label: "آثار هنرجویان", desc: "نمایش آثار برتر" },
            { href: "/admin/events", label: "رویدادها", desc: "مدیریت رویدادها" },
            { href: "/admin/testimonials", label: "نظرات", desc: "نظرات هنرجویان" },
            { href: "/admin/pages", label: "صفحات", desc: "ویرایش صفحات سایت" },
            { href: "/admin/settings", label: "تنظیمات", desc: "تغییر تنظیمات سایت" },
            { href: "/admin/messages", label: "پیام‌ها", desc: "مشاهده پیام‌های تماس" },
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
