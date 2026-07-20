"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { getAdminPath } from "@/lib/admin-config";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  const isLoginPage = pathname.endsWith("/login");

  useEffect(() => {
    if (isLoginPage) {
      setAuthenticated(true);
      return;
    }

    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) {
          setAuthenticated(true);
        } else {
          setAuthenticated(false);
          window.location.href = getAdminPath("/login");
        }
      })
      .catch(() => {
        setAuthenticated(false);
        window.location.href = getAdminPath("/login");
      });
  }, [isLoginPage]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (authenticated === null || authenticated === false) {
    return (
      <div className="flex min-h-screen bg-slate-50 items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 text-sm">
          <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
          </svg>
          <span>در حال بررسی احراز هویت...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <div className="flex-1 p-6 lg:p-8 overflow-x-hidden">{children}</div>
    </div>
  );
}
