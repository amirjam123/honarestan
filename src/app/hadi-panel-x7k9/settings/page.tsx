"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle, Loader, Upload } from "@/components/icons";

interface Settings {
  [key: string]: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchSettings = useCallback(async () => {
    const res = await fetch("/api/settings");
    if (res.ok) setSettings(await res.json());
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        setSettings({ ...settings, logo_url: data.url });
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });

    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-6 text-slate-900">تنظیمات سایت</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo Section */}
        <div className="admin-card">
          <h2 className="text-sm font-bold mb-4 text-slate-800">لوگوی سایت</h2>
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              {settings.logo_url ? (
                <div className="w-24 h-24 rounded-xl border-2 border-slate-200 overflow-hidden bg-white flex items-center justify-center">
                  <img src={settings.logo_url} alt="لوگو" className="max-w-full max-h-full object-contain" />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center">
                  <span className="text-2xl text-slate-400">ه</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-600 mb-1.5">آپلود لوگو</label>
              <div className="flex items-center gap-3">
                <label className={`admin-btn-secondary cursor-pointer flex items-center gap-2 ${uploading ? "opacity-50" : ""}`}>
                  <Upload size={16} />
                  {uploading ? "در حال آپلود..." : "انتخاب فایل"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                {settings.logo_url && (
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, logo_url: "" })}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    حذف لوگو
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-2">فرمت‌های مجاز: PNG, JPG, SVG - حداکثر ۲ مگابایت</p>
              <div className="mt-3">
                <label className="block text-xs font-medium text-slate-600 mb-1.5">یا وارد کردن آدرس URL</label>
                <input
                  type="text"
                  placeholder="https://example.com/logo.png"
                  value={settings.logo_url || ""}
                  onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                  className="admin-input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* School Name */}
        <div className="admin-card">
          <h2 className="text-sm font-bold mb-4 text-slate-800">نام مدرسه</h2>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">نام مدرسه (نمایش در هدر و داشبورد)</label>
            <input
              type="text"
              placeholder="هنرستان هادی"
              value={settings.school_name || ""}
              onChange={(e) => setSettings({ ...settings, school_name: e.target.value })}
              className="admin-input"
            />
          </div>
        </div>

        {/* Hero Section */}
        <div className="admin-card">
          <h2 className="text-sm font-bold mb-4 text-slate-800">بنر اصلی</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">عنوان بنر اصلی</label>
              <input
                type="text"
                placeholder="هنرستان هادی"
                value={settings.hero_title || ""}
                onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })}
                className="admin-input"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">زیرعنوان بنر اصلی</label>
              <input
                type="text"
                placeholder="مرکز آموزش هنرهای زیبا"
                value={settings.hero_subtitle || ""}
                onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })}
                className="admin-input"
              />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="admin-card">
          <h2 className="text-sm font-bold mb-4 text-slate-800">اطلاعات تماس</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">آدرس</label>
              <input
                type="text"
                placeholder="تهران، خیابان نمونه"
                value={settings.address || ""}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="admin-input"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">تلفن</label>
              <input
                type="text"
                placeholder="۰۲۱-۱۲۳۴۵۶۷۸"
                value={settings.phone || ""}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="admin-input"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">ایمیل</label>
              <input
                type="text"
                placeholder="info@example.com"
                value={settings.email || ""}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="admin-input"
              />
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="admin-card">
          <h2 className="text-sm font-bold mb-4 text-slate-800">شبکه‌های اجتماعی</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">اینستاگرام</label>
              <input
                type="text"
                placeholder="https://instagram.com/..."
                value={settings.instagram || ""}
                onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
                className="admin-input"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">تلگرام</label>
              <input
                type="text"
                placeholder="https://t.me/..."
                value={settings.telegram || ""}
                onChange={(e) => setSettings({ ...settings, telegram: e.target.value })}
                className="admin-input"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="admin-btn-primary flex items-center gap-2 disabled:opacity-50">
            {saving ? (
              <>
                <Loader size={16} />
                در حال ذخیره...
              </>
            ) : (
              "ذخیره تنظیمات"
            )}
          </button>
          {success && (
            <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
              <CheckCircle size={14} />
              تنظیمات با موفقیت ذخیره شد
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
