"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle, Loader, Eye, Globe, XCircle, ExclamationTriangle } from "@/components/icons";

interface SeoSetting {
  id: string;
  pagePath: string;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  robots: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  jsonLd: string;
}

interface ValidationResult {
  field: string;
  status: "ok" | "warning" | "error";
  message: string;
}

interface ValidationSummary {
  errors: number;
  warnings: number;
  oks: number;
  score: "excellent" | "good" | "needs_work" | "poor";
}

const PAGE_LABELS: Record<string, string> = {
  "/": "صفحه اصلی",
  "/about": "درباره ما",
  "/gallery": "گالری",
  "/news": "اخبار",
  "/contact": "تماس با ما",
  "/events": "رویدادها",
  "/teachers": "اساتید",
  "/student-works": "آثار هنرجویان",
};

const EMPTY_FORM: Partial<SeoSetting> = {
  pagePath: "/",
  metaTitle: "",
  metaDescription: "",
  canonicalUrl: "",
  robots: "index, follow",
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterTitle: "",
  twitterDescription: "",
  twitterImage: "",
  jsonLd: "{}",
};

export default function AdminSeoPage() {
  const [seoList, setSeoList] = useState<SeoSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<SeoSetting>>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [validationSummary, setValidationSummary] = useState<ValidationSummary | null>(null);
  const [previewTab, setPreviewTab] = useState<"google" | "facebook" | "twitter">("google");
  const [showJsonLd, setShowJsonLd] = useState(false);
  const [jsonLdError, setJsonLdError] = useState("");

  const fetchSeoList = useCallback(async () => {
    try {
      const res = await fetch("/api/seo");
      if (res.ok) {
        const data = await res.json();
        setSeoList(data);
      }
    } catch (error) {
      console.error("Failed to fetch SEO settings:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSeoList(); }, [fetchSeoList]);

  const selectPage = (pagePath: string) => {
    setSelectedPage(pagePath);
    const existing = seoList.find((s) => s.pagePath === pagePath);
    if (existing) {
      setForm({ ...existing });
    } else {
      setForm({ ...EMPTY_FORM, pagePath });
    }
    setValidationResults([]);
    setValidationSummary(null);
    setSuccess(false);
    setJsonLdError("");
  };

  const handleSave = async () => {
    if (!form.pagePath || !form.metaTitle || !form.metaDescription) return;
    setSaving(true);
    setSuccess(false);

    try {
      const res = await fetch("/api/seo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const saved = await res.json();
        setSeoList((prev) => {
          const idx = prev.findIndex((s) => s.pagePath === form.pagePath);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = saved;
            return next;
          }
          return [...prev, saved];
        });
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleValidate = async () => {
    setValidating(true);
    try {
      const res = await fetch("/api/seo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        setValidationResults(data.results);
        setValidationSummary(data.summary);
      }
    } catch (error) {
      console.error("Validation failed:", error);
    } finally {
      setValidating(false);
    }
  };

  const handleJsonLdChange = (value: string) => {
    setForm({ ...form, jsonLd: value });
    try {
      if (value && value !== "{}") {
        JSON.parse(value);
        setJsonLdError("");
      } else {
        setJsonLdError("");
      }
    } catch {
      setJsonLdError("JSON نامعتبر است");
    }
  };

  const getStatusForPage = (pagePath: string) => {
    const seo = seoList.find((s) => s.pagePath === pagePath);
    if (!seo) return "none";
    if (!seo.metaTitle || !seo.metaDescription) return "incomplete";
    return "complete";
  };

  const allPages = Object.keys(PAGE_LABELS);
  const configuredCount = seoList.filter((s) => s.metaTitle && s.metaDescription).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader size={24} className="text-primary-600 animate-spin" />
        <span className="mr-3 text-sm text-slate-500">در حال بارگذاری...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">مدیریت SEO</h1>
          <p className="text-sm text-slate-500 mt-1">
            {configuredCount} از {allPages.length} صفحه تنظیم شده
          </p>
        </div>
        <a
          href="/sitemap.xml"
          target="_blank"
          rel="noopener noreferrer"
          className="admin-btn-secondary flex items-center gap-2 text-xs"
        >
          <Globe size={14} />
          sitemap.xml
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Page List */}
        <div className="lg:col-span-1">
          <div className="admin-card">
            <h2 className="text-sm font-bold text-slate-800 mb-3">صفحات سایت</h2>
            <div className="space-y-1">
              {allPages.map((pagePath) => {
                const status = getStatusForPage(pagePath);
                const isSelected = selectedPage === pagePath;
                return (
                  <button
                    key={pagePath}
                    onClick={() => selectPage(pagePath)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-right transition-colors ${
                      isSelected
                        ? "bg-primary-50 text-primary-700 border border-primary-200"
                        : "text-slate-700 hover:bg-slate-50 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">{PAGE_LABELS[pagePath]}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{pagePath}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {status === "complete" && <CheckCircle size={14} className="text-emerald-500" />}
                      {status === "incomplete" && <ExclamationTriangle size={14} className="text-amber-500" />}
                      {status === "none" && <XCircle size={14} className="text-slate-300" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="lg:col-span-2 space-y-6">
          {selectedPage ? (
            <>
              {/* Preview */}
              <div className="admin-card">
                <div className="flex items-center gap-2 mb-4">
                  <Eye size={16} className="text-slate-500" />
                  <h2 className="text-sm font-bold text-slate-800">پیش‌نمایش</h2>
                  <div className="mr-auto flex gap-1">
                    {(["google", "facebook", "twitter"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setPreviewTab(tab)}
                        className={`px-3 py-1 rounded text-[11px] font-medium transition-colors ${
                          previewTab === tab
                            ? "bg-slate-800 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {tab === "google" ? "گوگل" : tab === "facebook" ? "فیسبوک" : "توییتر"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Google Preview */}
                {previewTab === "google" && (
                  <div className="border border-slate-200 rounded-lg p-4 bg-white">
                    <div className="max-w-lg">
                      <p className="text-[13px] text-slate-500 mb-0.5 truncate">{form.canonicalUrl || `https://honarestan-hadi.ir${form.pagePath}`}</p>
                      <h3 className="text-[18px] text-blue-700 hover:underline cursor-pointer mb-1 leading-snug">
                        {form.metaTitle || "عنوان صفحه"}
                      </h3>
                      <p className="text-[13px] text-slate-600 leading-5 line-clamp-2">
                        {form.metaDescription || "توضیحات صفحه اینجا نمایش داده می‌شود..."}
                      </p>
                    </div>
                  </div>
                )}

                {/* Facebook/OG Preview */}
                {previewTab === "facebook" && (
                  <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                    <div className="aspect-[1.91/1] bg-slate-100 flex items-center justify-center">
                      {form.ogImage ? (
                        <img src={form.ogImage} alt="OG" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-slate-400 text-xs">تصویر OG</span>
                      )}
                    </div>
                    <div className="p-3 border-t border-slate-100">
                      <p className="text-[11px] text-slate-400 uppercase truncate">honarestan-hadi.ir</p>
                      <h3 className="text-[15px] font-bold text-slate-900 mt-0.5 leading-snug">
                        {form.ogTitle || form.metaTitle || "عنوان صفحه"}
                      </h3>
                      <p className="text-[13px] text-slate-500 mt-1 line-clamp-2 leading-5">
                        {form.ogDescription || form.metaDescription || "توضیحات صفحه..."}
                      </p>
                    </div>
                  </div>
                )}

                {/* Twitter Preview */}
                {previewTab === "twitter" && (
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                    <div className="aspect-[2/1] bg-slate-100 flex items-center justify-center">
                      {form.twitterImage || form.ogImage ? (
                        <img src={form.twitterImage || form.ogImage} alt="Twitter" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-slate-400 text-xs">تصویر Twitter</span>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="text-[15px] font-bold text-slate-900 leading-snug">
                        {form.twitterTitle || form.ogTitle || form.metaTitle || "عنوان صفحه"}
                      </h3>
                      <p className="text-[13px] text-slate-500 mt-1 line-clamp-2 leading-5">
                        {form.twitterDescription || form.ogDescription || form.metaDescription || "توضیحات..."}
                      </p>
                      <p className="text-[12px] text-slate-400 mt-2">honarestan-hadi.ir</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Basic SEO */}
              <div className="admin-card">
                <h2 className="text-sm font-bold text-slate-800 mb-4">اطلاعات پایه</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      عنوان Meta <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.metaTitle || ""}
                      onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                      className="admin-input"
                      placeholder="عنوان صفحه برای موتورهای جستجو"
                      maxLength={70}
                    />
                    <div className="flex justify-between mt-1">
                      <p className="text-[11px] text-slate-400">حداکثر ۶۰ کاراکتر توصیه می‌شود</p>
                      <p className={`text-[11px] ${(form.metaTitle || "").length > 60 ? "text-amber-500" : "text-slate-400"}`}>
                        {(form.metaTitle || "").length}/60
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      توضیحات Meta <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={form.metaDescription || ""}
                      onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                      className="admin-input resize-none"
                      rows={3}
                      placeholder="توضیحات صفحه برای موتورهای جستجو"
                      maxLength={200}
                    />
                    <div className="flex justify-between mt-1">
                      <p className="text-[11px] text-slate-400">حداکثر ۱۶۰ کاراکتر توصیه می‌شود</p>
                      <p className={`text-[11px] ${(form.metaDescription || "").length > 160 ? "text-amber-500" : "text-slate-400"}`}>
                        {(form.metaDescription || "").length}/160
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">آدرس Canonical</label>
                    <input
                      type="url"
                      value={form.canonicalUrl || ""}
                      onChange={(e) => setForm({ ...form, canonicalUrl: e.target.value })}
                      className="admin-input"
                      placeholder={`https://honarestan-hadi.ir${form.pagePath}`}
                    />
                    <p className="text-[11px] text-slate-400 mt-1">خالی بگذارید تا از آدرس فعلی استفاده شود</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Robots</label>
                    <select
                      value={form.robots || "index, follow"}
                      onChange={(e) => setForm({ ...form, robots: e.target.value })}
                      className="admin-input"
                    >
                      <option value="index, follow">index, follow (پیش‌فرض)</option>
                      <option value="noindex, follow">noindex, follow</option>
                      <option value="index, nofollow">index, nofollow</option>
                      <option value="noindex, nofollow">noindex, nofollow</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Open Graph */}
              <div className="admin-card">
                <h2 className="text-sm font-bold text-slate-800 mb-4">Open Graph (فیسبوک)</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">عنوان OG</label>
                    <input
                      type="text"
                      value={form.ogTitle || ""}
                      onChange={(e) => setForm({ ...form, ogTitle: e.target.value })}
                      className="admin-input"
                      placeholder="عنوان برای اشتراک‌گذاری در شبکه‌های اجتماعی"
                      maxLength={95}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">توضیحات OG</label>
                    <textarea
                      value={form.ogDescription || ""}
                      onChange={(e) => setForm({ ...form, ogDescription: e.target.value })}
                      className="admin-input resize-none"
                      rows={2}
                      placeholder="توضیحات برای اشتراک‌گذاری در شبکه‌های اجتماعی"
                      maxLength={200}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">تصویر OG</label>
                    <input
                      type="url"
                      value={form.ogImage || ""}
                      onChange={(e) => setForm({ ...form, ogImage: e.target.value })}
                      className="admin-input"
                      placeholder="https://example.com/image.jpg"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">ابعاد پیشنهادی: 1200×630 پیکسل</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">نوع OG</label>
                    <select
                      value={form.ogType || "website"}
                      onChange={(e) => setForm({ ...form, ogType: e.target.value })}
                      className="admin-input"
                    >
                      <option value="website">website</option>
                      <option value="article">article</option>
                      <option value="product">product</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Twitter Card */}
              <div className="admin-card">
                <h2 className="text-sm font-bold text-slate-800 mb-4">Twitter Card</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">نوع کارت</label>
                    <select
                      value={form.twitterCard || "summary_large_image"}
                      onChange={(e) => setForm({ ...form, twitterCard: e.target.value })}
                      className="admin-input"
                    >
                      <option value="summary_large_image">summary_large_image</option>
                      <option value="summary">summary</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">عنوان Twitter</label>
                    <input
                      type="text"
                      value={form.twitterTitle || ""}
                      onChange={(e) => setForm({ ...form, twitterTitle: e.target.value })}
                      className="admin-input"
                      placeholder="عنوان برای توییتر"
                      maxLength={70}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">توضیحات Twitter</label>
                    <textarea
                      value={form.twitterDescription || ""}
                      onChange={(e) => setForm({ ...form, twitterDescription: e.target.value })}
                      className="admin-input resize-none"
                      rows={2}
                      placeholder="توضیحات برای توییتر"
                      maxLength={200}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">تصویر Twitter</label>
                    <input
                      type="url"
                      value={form.twitterImage || ""}
                      onChange={(e) => setForm({ ...form, twitterImage: e.target.value })}
                      className="admin-input"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
              </div>

              {/* Structured Data */}
              <div className="admin-card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-slate-800">داده‌های ساختاریافته (JSON-LD)</h2>
                  <button
                    type="button"
                    onClick={() => setShowJsonLd(!showJsonLd)}
                    className="text-xs text-primary-600 hover:text-primary-700"
                  >
                    {showJsonLd ? "بستن" : "ویرایش"}
                  </button>
                </div>
                {showJsonLd && (
                  <div>
                    <textarea
                      value={form.jsonLd || "{}"}
                      onChange={(e) => handleJsonLdChange(e.target.value)}
                      className={`admin-input resize-none font-mono text-xs ${jsonLdError ? "border-red-300" : ""}`}
                      rows={8}
                      placeholder='{"@context": "https://schema.org", "@type": "WebPage", ...}'
                      dir="ltr"
                    />
                    {jsonLdError && (
                      <p className="text-[11px] text-red-500 mt-1">{jsonLdError}</p>
                    )}
                    <p className="text-[11px] text-slate-400 mt-1">
                      JSON-LD برای داده‌های ساختاریافته گوگل استفاده می‌شود
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving || !form.metaTitle || !form.metaDescription}
                  className="admin-btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader size={16} />
                      در حال ذخیره...
                    </>
                  ) : (
                    "ذخیره تنظیمات SEO"
                  )}
                </button>
                <button
                  onClick={handleValidate}
                  disabled={validating}
                  className="admin-btn-secondary flex items-center gap-2 disabled:opacity-50"
                >
                  {validating ? (
                    <>
                      <Loader size={16} />
                      در حال بررسی...
                    </>
                  ) : (
                    "اعتبارسنجی"
                  )}
                </button>
                {success && (
                  <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
                    <CheckCircle size={14} />
                    ذخیره شد
                  </span>
                )}
              </div>

              {/* Validation Results */}
              {validationSummary && (
                <div className="admin-card">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-slate-800">نتایج اعتبارسنجی</h2>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                        validationSummary.score === "excellent" ? "bg-emerald-50 text-emerald-700" :
                        validationSummary.score === "good" ? "bg-blue-50 text-blue-700" :
                        validationSummary.score === "needs_work" ? "bg-amber-50 text-amber-700" :
                        "bg-red-50 text-red-700"
                      }`}>
                        {validationSummary.score === "excellent" ? "عالی" :
                         validationSummary.score === "good" ? "خوب" :
                         validationSummary.score === "needs_work" ? "نیاز به بهبود" : "ضعیف"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-4 mb-4 text-xs">
                    <span className="text-emerald-600">{validationSummary.oks} مناسب</span>
                    <span className="text-amber-600">{validationSummary.warnings} هشدار</span>
                    <span className="text-red-600">{validationSummary.errors} خطا</span>
                  </div>
                  <div className="space-y-2">
                    {validationResults.map((result, i) => (
                      <div
                        key={i}
                        className={`flex items-start gap-2 p-2 rounded text-xs ${
                          result.status === "ok" ? "bg-emerald-50" :
                          result.status === "warning" ? "bg-amber-50" : "bg-red-50"
                        }`}
                      >
                        {result.status === "ok" && <CheckCircle size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />}
                        {result.status === "warning" && <ExclamationTriangle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />}
                        {result.status === "error" && <XCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />}
                        <span className={
                          result.status === "ok" ? "text-emerald-700" :
                          result.status === "warning" ? "text-amber-700" : "text-red-700"
                        }>
                          {result.message}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="admin-card flex flex-col items-center justify-center py-16 text-center">
              <Globe size={40} className="text-slate-300 mb-3" />
              <p className="text-sm text-slate-500">یک صفحه را از لیست سمت راست انتخاب کنید</p>
              <p className="text-xs text-slate-400 mt-1">برای ویرایش تنظیمات SEO صفحه</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
