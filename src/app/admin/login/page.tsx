"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "@/components/icons";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        setError("نام کاربری یا رمز عبور اشتباه است");
      }
    } catch {
      setError("خطا در ورود به سیستم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-7 w-full max-w-sm">
        <div className="text-center mb-7">
          <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-bold text-xl">ه</span>
          </div>
          <h1 className="text-lg font-bold text-slate-900">ورود به پنل مدیریت</h1>
          <p className="text-slate-500 text-xs mt-1">هنرستان هادی</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-xs font-medium text-slate-600 mb-1.5">نام کاربری</label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="admin-input"
              autoComplete="username"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-xs font-medium text-slate-600 mb-1.5">رمز عبور</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="admin-input"
              autoComplete="current-password"
            />
          </div>
          {error && (
            <p className="text-red-600 text-xs text-center bg-red-50 py-2 rounded-lg">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full admin-btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader size={16} />
                در حال ورود...
              </>
            ) : (
              "ورود"
            )}
          </button>
        </form>

        <p className="text-center text-[11px] text-slate-400 mt-5">
          نام کاربری پیش‌فرض: admin / رمز: admin123
        </p>
      </div>
    </div>
  );
}
