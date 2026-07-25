"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Megaphone, Photo, UserGroup, PaintBrush, Calendar, ChatBubble,
  Envelope, Clock, CheckCircle, XCircle, Search, Plus, ArrowUp,
  Cog, Shield, Loader, Bell, Eye, Download, AcademicCap, Document,
  RefreshCw, Lock, Star,
} from "@/components/icons";
import { getAdminPath } from "@/lib/admin-config";

interface DashboardData {
  counts: {
    news: number;
    gallery: number;
    teachers: number;
    studentWorks: number;
    events: number;
    courses: number;
    tickets: number;
    messages: number;
    unpublishedNews: number;
    unpublishedTeachers: number;
    openTickets: number;
    unreadMessages: number;
  };
  recentNews: { id: string; title: string; published: boolean; createdAt: string }[];
  recentGallery: { id: string; title: string; image: string; createdAt: string }[];
  recentTeachers: { id: string; name: string; title: string; published: boolean; createdAt: string }[];
  recentStudentWorks: { id: string; title: string; studentName: string; createdAt: string }[];
  recentTickets: { id: string; subject: string; userName: string; status: string; createdAt: string }[];
  recentMessages: { id: string; name: string; email: string; subject: string | null; read: boolean; createdAt: string }[];
  securityLogs: { id: string; event: string; ip: string; username: string | null; details: string | null; createdAt: string }[];
  schoolName: string;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchDashboardData = useCallback(async () => {
    try {
      const [newsRes, galleryRes, teachersRes, worksRes, eventsRes, coursesRes, ticketsRes, messagesRes, securityRes, settingsRes] =
        await Promise.all([
          fetch("/api/news").then((r) => r.ok ? r.json() : []),
          fetch("/api/gallery").then((r) => r.ok ? r.json() : []),
          fetch("/api/teachers").then((r) => r.ok ? r.json() : []),
          fetch("/api/student-works").then((r) => r.ok ? r.json() : []),
          fetch("/api/events").then((r) => r.ok ? r.json() : []),
          fetch("/api/courses").then((r) => r.ok ? r.json() : []),
          fetch("/api/admin/tickets").then((r) => r.ok ? r.json() : []),
          fetch("/api/contact").then((r) => r.ok ? r.json() : []),
          fetch("/api/admin/security-logs?limit=10").then((r) => (r.ok ? r.json() : { logs: [] })),
          fetch("/api/settings").then((r) => (r.ok ? r.json() : {})),
        ]);

      const settingsMap: Record<string, string> = {};
      if (Array.isArray(settingsRes)) {
        settingsRes.forEach((s: { key: string; value: string }) => {
          settingsMap[s.key] = s.value;
        });
      } else if (settingsRes && typeof settingsRes === "object") {
        Object.assign(settingsMap, settingsRes);
      }

      const logs = securityRes.logs || securityRes || [];

      setData({
        counts: {
          news: newsRes.length,
          gallery: galleryRes.length,
          teachers: teachersRes.length,
          studentWorks: worksRes.length,
          events: eventsRes.length,
          courses: coursesRes.length,
          tickets: Array.isArray(ticketsRes) ? ticketsRes.length : 0,
          messages: messagesRes.length,
          unpublishedNews: newsRes.filter((n: { published: boolean }) => !n.published).length,
          unpublishedTeachers: teachersRes.filter((t: { published: boolean }) => !t.published).length,
          openTickets: (Array.isArray(ticketsRes) ? ticketsRes : []).filter(
            (t: { status: string }) => t.status === "open"
          ).length,
          unreadMessages: messagesRes.filter((m: { read: boolean }) => !m.read).length,
        },
        recentNews: newsRes.slice(0, 5),
        recentGallery: galleryRes.slice(0, 6),
        recentTeachers: teachersRes.slice(0, 5),
        recentStudentWorks: worksRes.slice(0, 5),
        recentTickets: (Array.isArray(ticketsRes) ? ticketsRes : []).slice(0, 5),
        recentMessages: messagesRes.slice(0, 5),
        securityLogs: Array.isArray(logs) ? logs.slice(0, 8) : [],
        schoolName: settingsMap["school_name"] || "هنرستان هادی",
      });
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader size={24} className="text-slate-400 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-slate-500">
        خطا در بارگذاری اطلاعات داشبورد
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "همین الان";
    if (diffMins < 60) return `${diffMins} دقیقه پیش`;
    if (diffHours < 24) return `${diffHours} ساعت پیش`;
    if (diffDays < 7) return `${diffDays} روز پیش`;
    return d.toLocaleDateString("fa-IR");
  };

  const getEventLabel = (event: string) => {
    const labels: Record<string, { text: string; color: string }> = {
      login_success: { text: "ورود موفق", color: "text-emerald-600 bg-emerald-50" },
      login_failed: { text: "ورود ناموفق", color: "text-red-600 bg-red-50" },
      logout: { text: "خروج", color: "text-slate-600 bg-slate-100" },
      record_create: { text: "ایجاد رکورد", color: "text-blue-600 bg-blue-50" },
      record_update: { text: "ویرایش رکورد", color: "text-amber-600 bg-amber-50" },
      record_delete: { text: "حذف رکورد", color: "text-red-600 bg-red-50" },
      admin_action: { text: "عملیات مدیر", color: "text-purple-600 bg-purple-50" },
      file_upload: { text: "آپلود فایل", color: "text-cyan-600 bg-cyan-50" },
      rate_limit_hit: { text: "محدودیت نرخ", color: "text-orange-600 bg-orange-50" },
    };
    return labels[event] || { text: event, color: "text-slate-600 bg-slate-100" };
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { text: string; color: string }> = {
      open: { text: "باز", color: "text-amber-600 bg-amber-50" },
      answered: { text: "پاسخ داده شده", color: "text-emerald-600 bg-emerald-50" },
      closed: { text: "بسته", color: "text-slate-600 bg-slate-100" },
    };
    return badges[status] || { text: status, color: "text-slate-600 bg-slate-100" };
  };

  const statCards = [
    { label: "اخبار", count: data.counts.news, sub: data.counts.unpublishedNews > 0 ? `${data.counts.unpublishedNews} پیش‌نویس` : null, icon: Megaphone, href: getAdminPath("/news"), color: "from-blue-500 to-blue-600", lightColor: "bg-blue-50 text-blue-600" },
    { label: "گالری", count: data.counts.gallery, sub: null, icon: Photo, href: getAdminPath("/gallery"), color: "from-emerald-500 to-emerald-600", lightColor: "bg-emerald-50 text-emerald-600" },
    { label: "اساتید", count: data.counts.teachers, sub: data.counts.unpublishedTeachers > 0 ? `${data.counts.unpublishedTeachers} مخفی` : null, icon: UserGroup, href: getAdminPath("/teachers"), color: "from-amber-500 to-amber-600", lightColor: "bg-amber-50 text-amber-600" },
    { label: "دوره‌ها", count: data.counts.courses, sub: null, icon: AcademicCap, href: getAdminPath("/courses"), color: "from-violet-500 to-violet-600", lightColor: "bg-violet-50 text-violet-600" },
    { label: "آثار هنرجویان", count: data.counts.studentWorks, sub: null, icon: PaintBrush, href: getAdminPath("/student-works"), color: "from-pink-500 to-pink-600", lightColor: "bg-pink-50 text-pink-600" },
    { label: "رویدادها", count: data.counts.events, sub: null, icon: Calendar, href: getAdminPath("/events"), color: "from-cyan-500 to-cyan-600", lightColor: "bg-cyan-50 text-cyan-600" },
    { label: "تیکت‌ها", count: data.counts.tickets, sub: data.counts.openTickets > 0 ? `${data.counts.openTickets} باز` : null, icon: ChatBubble, href: getAdminPath("/tickets"), color: "from-orange-500 to-orange-600", lightColor: "bg-orange-50 text-orange-600" },
    { label: "پیام‌ها", count: data.counts.messages, sub: data.counts.unreadMessages > 0 ? `${data.counts.unreadMessages} جدید` : null, icon: Envelope, href: getAdminPath("/messages"), color: "from-teal-500 to-teal-600", lightColor: "bg-teal-50 text-teal-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">داشبورد مدیریت</h1>
          <p className="text-xs text-slate-500 mt-1">{data.schoolName}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="جستجو..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-input pr-8 text-xs"
            />
          </div>
          <button
            onClick={fetchDashboardData}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="بروزرسانی"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Alerts */}
      {(data.counts.openTickets > 0 || data.counts.unreadMessages > 0) && (
        <div className="flex flex-wrap gap-3">
          {data.counts.openTickets > 0 && (
            <Link
              href={getAdminPath("/tickets")}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 hover:bg-amber-100 transition-colors"
            >
              <Bell size={14} />
              <span className="font-medium">{data.counts.openTickets} تیکت باز نیاز به پاسخ دارد</span>
            </Link>
          )}
          {data.counts.unreadMessages > 0 && (
            <Link
              href={getAdminPath("/messages")}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700 hover:bg-blue-100 transition-colors"
            >
              <Envelope size={14} />
              <span className="font-medium">{data.counts.unreadMessages} پیام جدید خوانده نشده</span>
            </Link>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="admin-card hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg ${stat.lightColor} flex items-center justify-center`}>
                  <Icon size={16} />
                </div>
                <ArrowUp size={12} className="text-slate-300 group-hover:text-primary-500 transition-colors" />
              </div>
              <p className="text-lg font-bold text-slate-900">{stat.count}</p>
              <p className="text-[11px] text-slate-500">{stat.label}</p>
              {stat.sub && (
                <p className="text-[10px] text-amber-600 font-medium mt-0.5">{stat.sub}</p>
              )}
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="admin-card">
        <h2 className="text-sm font-bold text-slate-800 mb-3">دسترسی سریع</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: "خبر جدید", href: getAdminPath("/news"), icon: Plus, color: "bg-blue-50 text-blue-600 hover:bg-blue-100" },
            { label: "تصویر جدید", href: getAdminPath("/gallery"), icon: Photo, color: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" },
            { label: "استاد جدید", href: getAdminPath("/teachers"), icon: UserGroup, color: "bg-amber-50 text-amber-600 hover:bg-amber-100" },
            { label: "تنظیمات", href: getAdminPath("/settings"), icon: Cog, color: "bg-slate-100 text-slate-600 hover:bg-slate-200" },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${action.color}`}
              >
                <Icon size={14} />
                {action.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent News */}
        <div className="admin-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-800">آخرین اخبار</h2>
            <Link href={getAdminPath("/news")} className="text-[11px] text-primary-600 hover:underline">
              مشاهده همه
            </Link>
          </div>
          <div className="space-y-2.5">
            {data.recentNews.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">خبری ثبت نشده</p>
            ) : (
              data.recentNews.map((news) => (
                <div key={news.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Megaphone size={14} className="text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-800 truncate">{news.title}</p>
                    <p className="text-[10px] text-slate-400">{formatDate(news.createdAt)}</p>
                  </div>
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${news.published ? "bg-emerald-500" : "bg-slate-300"}`} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Tickets */}
        <div className="admin-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-800">آخرین تیکت‌ها</h2>
            <Link href={getAdminPath("/tickets")} className="text-[11px] text-primary-600 hover:underline">
              مشاهده همه
            </Link>
          </div>
          <div className="space-y-2.5">
            {data.recentTickets.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">تیکتی ثبت نشده</p>
            ) : (
              data.recentTickets.map((ticket) => {
                const badge = getStatusBadge(ticket.status);
                return (
                  <div key={ticket.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                      <ChatBubble size={14} className="text-orange-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-800 truncate">{ticket.subject}</p>
                      <p className="text-[10px] text-slate-400">{ticket.userName} · {formatDate(ticket.createdAt)}</p>
                    </div>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${badge.color}`}>
                      {badge.text}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Messages */}
        <div className="admin-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-800">آخرین پیام‌ها</h2>
            <Link href={getAdminPath("/messages")} className="text-[11px] text-primary-600 hover:underline">
              مشاهده همه
            </Link>
          </div>
          <div className="space-y-2.5">
            {data.recentMessages.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">پیامی ثبت نشده</p>
            ) : (
              data.recentMessages.map((msg) => (
                <div key={msg.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                    <Envelope size={14} className="text-teal-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-800 truncate">{msg.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{msg.subject || msg.email}</p>
                  </div>
                  {!msg.read && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Gallery */}
        <div className="admin-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-800">آخرین تصاویر گالری</h2>
            <Link href={getAdminPath("/gallery")} className="text-[11px] text-primary-600 hover:underline">
              مشاهده همه
            </Link>
          </div>
          {data.recentGallery.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">تصویری ثبت نشده</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {data.recentGallery.map((img) => (
                <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 group">
                  <img
                    src={img.image}
                    alt={img.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end">
                    <p className="text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity p-1.5 truncate w-full">
                      {img.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Security Log */}
        <div className="admin-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-800">فعالیت‌های اخیر</h2>
            <Shield size={14} className="text-slate-400" />
          </div>
          <div className="space-y-2">
            {data.securityLogs.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">فعالیتی ثبت نشده</p>
            ) : (
              data.securityLogs.map((log) => {
                const eventInfo = getEventLabel(log.event);
                return (
                  <div key={log.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium whitespace-nowrap ${eventInfo.color}`}>
                      {eventInfo.text}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-slate-700 truncate">
                        {log.username || log.ip} {log.details ? `— ${log.details}` : ""}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {formatDate(log.createdAt)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="admin-card">
        <h2 className="text-sm font-bold text-slate-800 mb-4">وضعیت سیستم</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <span className="text-[11px] font-medium text-slate-700">پایگاه داده</span>
            </div>
            <p className="text-[10px] text-slate-500">Neon PostgreSQL</p>
            <p className="text-[10px] text-emerald-600">متصل</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <span className="text-[11px] font-medium text-slate-700">هاستینگ</span>
            </div>
            <p className="text-[10px] text-slate-500">Vercel</p>
            <p className="text-[10px] text-emerald-600">فعال</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <span className="text-[11px] font-medium text-slate-700">فریمورک</span>
            </div>
            <p className="text-[10px] text-slate-500">Next.js 16</p>
            <p className="text-[10px] text-emerald-600">Turbopack</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <span className="text-[11px] font-medium text-slate-700">ORM</span>
            </div>
            <p className="text-[10px] text-slate-500">Prisma 7.8</p>
            <p className="text-[10px] text-emerald-600">PostgreSQL</p>
          </div>
        </div>
      </div>

      {/* Recent Teachers & Student Works */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Teachers */}
        <div className="admin-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-800">آخرین اساتید</h2>
            <Link href={getAdminPath("/teachers")} className="text-[11px] text-primary-600 hover:underline">
              مشاهده همه
            </Link>
          </div>
          <div className="space-y-2.5">
            {data.recentTeachers.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">استادی ثبت نشده</p>
            ) : (
              data.recentTeachers.map((teacher) => (
                <div key={teacher.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <UserGroup size={14} className="text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-800">{teacher.name}</p>
                    <p className="text-[10px] text-slate-400">{teacher.title}</p>
                  </div>
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${teacher.published ? "bg-emerald-500" : "bg-slate-300"}`} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Student Works */}
        <div className="admin-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-800">آخرین آثار هنرجویان</h2>
            <Link href={getAdminPath("/student-works")} className="text-[11px] text-primary-600 hover:underline">
              مشاهده همه
            </Link>
          </div>
          <div className="space-y-2.5">
            {data.recentStudentWorks.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">اثری ثبت نشده</p>
            ) : (
              data.recentStudentWorks.map((work) => (
                <div key={work.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center flex-shrink-0">
                    <PaintBrush size={14} className="text-pink-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-800 truncate">{work.title}</p>
                    <p className="text-[10px] text-slate-400">{work.studentName} · {formatDate(work.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
