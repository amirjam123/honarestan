"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import GlobalSearch from "@/components/admin/GlobalSearch";
import { getAdminPath } from "@/lib/admin-config";
import { Bars3 } from "@/components/icons";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isLoginPage = pathname.endsWith("/login");

  useEffect(() => {
    if (isLoginPage) {
      setAuthenticated(true);
      return;
    }

    console.log("[layout] checking auth, pathname:", pathname);
    fetch("/api/auth/me")
      .then((res) => {
        console.log("[layout] auth/me status:", res.status);
        if (res.ok) {
          setAuthenticated(true);
        } else {
          setAuthenticated(false);
          window.location.href = getAdminPath("/login");
        }
      })
      .catch((err) => {
        console.error("[layout] auth/me error:", err);
        setAuthenticated(false);
        window.location.href = getAdminPath("/login");
      });
  }, [isLoginPage, pathname]);

  // Setup wizard is optional — no forced redirect

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (authenticated === null || authenticated === false) {
    return (
      <div className="flex min-h-screen bg-slate-50 items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 text-sm">
          <svg
            className="w-5 h-5 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
          </svg>
          <span>در حال بررسی احراز هویت...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar open={sidebarOpen} onClose={closeSidebar} />
      <div className="flex-1 min-w-0">
        {/* Mobile header with search */}
        <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg flex-shrink-0"
            aria-label="باز کردن منو"
          >
            <Bars3 size={22} />
          </button>
          <div className="flex-1 min-w-0">
            <GlobalSearch />
          </div>
        </div>

        {/* Desktop header with search */}
        <div className="hidden lg:flex sticky top-0 z-20 bg-white border-b border-slate-200 px-6 py-3 items-center gap-4">
          <div className="flex-1 max-w-md">
            <GlobalSearch />
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
