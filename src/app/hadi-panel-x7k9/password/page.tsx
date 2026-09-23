"use client";

import { useState } from "react";
import { Lock, Loader, CheckCircle, XCircle } from "@/components/icons";

export default function AdminPasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const getStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strength = getStrength(newPassword);
  const strengthLabels = ["", "ضعیف", "متوسط", "خوب", "قوی", "عالی"];
  const strengthColors = ["", "bg-red-500", "bg-amber-500", "bg-yellow-500", "bg-emerald-500", "bg-emerald-600"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);

    if (newPassword !== confirmPassword) {
      setResult({ type: "error", text: "رمز عبور جدید و تکرار آن مطابقت ندارند" });
      return;
    }

    if (newPassword.length < 8) {
      setResult({ type: "error", text: "رمز عبور باید حداقل ۸ کاراکتر باشد" });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setResult({ type: "success", text: "رمز عبور با موفقیت تغییر کرد" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setResult({ type: "error", text: data.error || "خطا در تغییر رمز عبور" });
      }
    } catch {
      setResult({ type: "error", text: "خطا در ارتباط با سرور" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-6 text-slate-900">تغییر رمز عبور</h1>

      <div className="max-w-lg">
        <div className="admin-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
              <Lock size={18} className="text-primary-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">رمز عبور جدید</h2>
              <p className="text-xs text-slate-500">رمز عبور قوی انتخاب کنید</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                رمز عبور فعلی
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="admin-input"
                autoComplete="current-password"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                رمز عبور جدید
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="admin-input"
                autoComplete="new-password"
              />
              {newPassword.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i <= strength ? strengthColors[strength] : "bg-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    قدرت رمز: {strengthLabels[strength]}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                تکرار رمز عبور جدید
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="admin-input"
                autoComplete="new-password"
              />
              {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                <p className="text-[11px] text-red-500 mt-1">رمز عبور مطابقت ندارد</p>
              )}
            </div>

            {result && (
              <div
                className={`flex items-center gap-2 text-sm p-3 rounded-lg ${
                  result.type === "success"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {result.type === "success" ? (
                  <CheckCircle size={16} />
                ) : (
                  <XCircle size={16} />
                )}
                {result.text}
              </div>
            )}

            <button
              type="submit"
              disabled={saving || (confirmPassword.length > 0 && newPassword !== confirmPassword)}
              className="admin-btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  در حال ذخیره...
                </>
              ) : (
                "تغییر رمز عبور"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
