"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle, Loader } from "@/components/icons";

interface Settings {
  [key: string]: string;
}

const settingFields = [
  { key: "school_name", label: "نام مدرسه", placeholder: "هنرستان هادی" },
  { key: "hero_title", label: "عنوان بنر اصلی", placeholder: "هنرستان هادی" },
  { key: "hero_subtitle", label: "زیرعنوان بنر اصلی", placeholder: "مرکز آموزش هنرهای زیبا" },
  { key: "address", label: "آدرس", placeholder: "تهران، خیابان نمونه" },
  { key: "phone", label: "تلفن", placeholder: "۰۲۱-۱۲۳۴۵۶۷۸" },
  { key: "email", label: "ایمیل", placeholder: "info@example.com" },
  { key: "instagram", label: "اینستاگرام", placeholder: "https://instagram.com/..." },
  { key: "telegram", label: "تلگرام", placeholder: "https://t.me/..." },
  { key: "logo_url", label: "آدرس لوگو", placeholder: "URL تصویر لوگو" },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const fetchSettings = useCallback(async () => {
    const res = await fetch("/api/settings");
    if (res.ok) setSettings(await res.json());
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

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

      <div className="admin-card">
        <form onSubmit={handleSubmit} className="space-y-5">
          {settingFields.map((field) => (
            <div key={field.key}>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">{field.label}</label>
              <input
                type="text"
                placeholder={field.placeholder}
                value={settings[field.key] || ""}
                onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
                className="admin-input"
              />
            </div>
          ))}
          <div className="flex items-center gap-3 pt-2">
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
    </div>
  );
}
