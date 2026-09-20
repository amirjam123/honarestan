"use client";

import { useState, useEffect, useCallback } from "react";
import { Save, CheckCircle, Loader } from "@/components/icons";

interface PrincipalProfile {
  name: string;
  photo: string;
  position: string;
  biography: string;
  welcomeMessage: string;
  resume: string;
  achievements: string;
  contactInfo: string;
  published: boolean;
}

const emptyProfile: PrincipalProfile = {
  name: "",
  photo: "",
  position: "",
  biography: "",
  welcomeMessage: "",
  resume: "",
  achievements: "[]",
  contactInfo: "",
  published: true,
};

export default function AdminPrincipalPage() {
  const [profile, setProfile] = useState<PrincipalProfile>(emptyProfile);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/principal");
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setProfile({
            name: data.name || "",
            photo: data.photo || "",
            position: data.position || "",
            biography: data.biography || "",
            welcomeMessage: data.welcomeMessage || "",
            resume: data.resume || "",
            achievements: data.achievements || "[]",
            contactInfo: data.contactInfo || "",
            published: data.published ?? true,
          });
        }
      }
    } catch {
      setError("خطا در دریافت اطلاعات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      if (profile.achievements) {
        JSON.parse(profile.achievements);
      }
    } catch {
      setError("فرمت دستاوردها نامعتبر است. لطفاً JSON معتبر وارد کنید.");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/principal", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError("خطا در ذخیره اطلاعات");
      }
    } catch {
      setError("خطا در ارتباط با سرور");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader size={24} className="text-slate-400" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-6 text-slate-900">پروفایل مدیر</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="admin-card">
          <h2 className="text-sm font-bold mb-4 text-slate-800">اطلاعات شخصی</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                نام و نام خانوادگی
              </label>
              <input
                type="text"
                placeholder="نام مدیر هنرستان..."
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="admin-input"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                آدرس تصویر
              </label>
              <input
                type="text"
                placeholder="/uploads/principal.jpg"
                value={profile.photo}
                onChange={(e) => setProfile({ ...profile, photo: e.target.value })}
                className="admin-input"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                سمت
              </label>
              <input
                type="text"
                placeholder="مدیر هنرستان..."
                value={profile.position}
                onChange={(e) => setProfile({ ...profile, position: e.target.value })}
                className="admin-input"
              />
            </div>
          </div>
        </div>

        <div className="admin-card">
          <h2 className="text-sm font-bold mb-4 text-slate-800">محتوای متنی</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                بیوگرافی
              </label>
              <textarea
                rows={4}
                placeholder="بیوگرافی مدیر هنرستان..."
                value={profile.biography}
                onChange={(e) => setProfile({ ...profile, biography: e.target.value })}
                className="admin-input resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                پیام خوش‌آمدگویی
              </label>
              <textarea
                rows={4}
                placeholder="پیام خوش‌آمدگویی به دانش‌آموزان و والدین..."
                value={profile.welcomeMessage}
                onChange={(e) => setProfile({ ...profile, welcomeMessage: e.target.value })}
                className="admin-input resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                رزومه
              </label>
              <textarea
                rows={4}
                placeholder="سوابق تحصیلی و حرفه‌ای..."
                value={profile.resume}
                onChange={(e) => setProfile({ ...profile, resume: e.target.value })}
                className="admin-input resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                دستاوردها (JSON)
              </label>
              <textarea
                rows={3}
                placeholder='["کسب رتبه اول استان", "راه‌اندازی رشته جدید"]'
                value={profile.achievements}
                onChange={(e) => setProfile({ ...profile, achievements: e.target.value })}
                className="admin-input resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                اطلاعات تماس (اختیاری)
              </label>
              <textarea
                rows={2}
                placeholder="شماره تماس، ایمیل و..."
                value={profile.contactInfo}
                onChange={(e) => setProfile({ ...profile, contactInfo: e.target.value })}
                className="admin-input resize-none"
              />
            </div>
          </div>
        </div>

        <div className="admin-card">
          <h2 className="text-sm font-bold mb-4 text-slate-800">تنظیمات انتشار</h2>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              checked={profile.published}
              onChange={(e) => setProfile({ ...profile, published: e.target.checked })}
              className="w-4 h-4 rounded"
            />
            <label htmlFor="published" className="text-xs text-slate-600">
              منتشر شده
            </label>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="admin-btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader size={16} />
                در حال ذخیره...
              </>
            ) : (
              <>
                <Save size={16} />
                ذخیره تغییرات
              </>
            )}
          </button>

          {success && (
            <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
              <CheckCircle size={14} />
              اطلاعات با موفقیت ذخیره شد
            </span>
          )}

          {error && (
            <span className="text-red-600 text-xs font-medium">
              {error}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
