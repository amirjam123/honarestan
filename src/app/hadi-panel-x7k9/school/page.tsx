"use client";

import { useState, useEffect, useCallback } from "react";
import { Save, CheckCircle, Loader } from "@/components/icons";

interface SchoolProfile {
  overview: string;
  history: string;
  vision: string;
  mission: string;
  educationalGoals: string;
  departments: string;
  facilities: string;
  statistics: string;
  additionalInfo: string;
  published: boolean;
}

const emptyProfile: SchoolProfile = {
  overview: "",
  history: "",
  vision: "",
  mission: "",
  educationalGoals: "",
  departments: "",
  facilities: "",
  statistics: "{}",
  additionalInfo: "",
  published: true,
};

const textFields: { key: keyof SchoolProfile; label: string; placeholder: string; rows: number }[] = [
  { key: "overview", label: "معرفی کلی", placeholder: "توضیحات کلی درباره هنرستان...", rows: 4 },
  { key: "history", label: "تاریخچه", placeholder: "تاریخچه تأسیس و فعالیت‌های هنرستان...", rows: 4 },
  { key: "vision", label: "چشم‌انداز", placeholder: "چشم‌انداز آینده هنرستان...", rows: 3 },
  { key: "mission", label: "مأموریت", placeholder: "مأموریت و اهداف اصلی...", rows: 3 },
  { key: "educationalGoals", label: "اهداف آموزشی", placeholder: "اهداف آموزشی و پرورشی...", rows: 3 },
  { key: "departments", label: "بخش‌ها و گروه‌ها", placeholder: "معرفی بخش‌ها و گروه‌های آموزشی...", rows: 3 },
  { key: "facilities", label: "امکانات", placeholder: "امکانات و تجهیزات هنرستان...", rows: 3 },
  { key: "statistics", label: "آمار (JSON)", placeholder: '{"تعداد دانش‌آموزان": 500, "تعداد کادر": 30}', rows: 3 },
  { key: "additionalInfo", label: "اطلاعات تکمیلی", placeholder: "سایر اطلاعات...", rows: 3 },
];

export default function AdminSchoolPage() {
  const [profile, setProfile] = useState<SchoolProfile>(emptyProfile);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/school");
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setProfile({
            overview: data.overview || "",
            history: data.history || "",
            vision: data.vision || "",
            mission: data.mission || "",
            educationalGoals: data.educationalGoals || "",
            departments: data.departments || "",
            facilities: data.facilities || "",
            statistics: data.statistics || "{}",
            additionalInfo: data.additionalInfo || "",
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
      // Validate statistics JSON
      if (profile.statistics) {
        JSON.parse(profile.statistics);
      }
    } catch {
      setError("فرمت آمار نامعتبر است. لطفاً JSON معتبر وارد کنید.");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/school", {
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
      <h1 className="text-xl font-bold mb-6 text-slate-900">پروفایل هنرستان</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="admin-card">
          <h2 className="text-sm font-bold mb-4 text-slate-800">اطلاعات هنرستان</h2>
          <div className="space-y-4">
            {textFields.map((field) => (
              <div key={field.key}>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  {field.label}
                </label>
                <textarea
                  rows={field.rows}
                  placeholder={field.placeholder}
                  value={profile[field.key] as string}
                  onChange={(e) => setProfile({ ...profile, [field.key]: e.target.value })}
                  className="admin-input resize-none"
                />
              </div>
            ))}
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
