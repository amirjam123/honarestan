"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader } from "@/components/icons";

interface Page {
  id: string;
  slug: string;
  title: string;
  content: string;
}

const predefinedPages = [
  { slug: "about", title: "درباره ما" },
];

export default function AdminPagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("about");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchPages = useCallback(async () => {
    const res = await fetch("/api/pages");
    if (res.ok) setPages(await res.json());
  }, []);

  useEffect(() => { fetchPages(); }, [fetchPages]);

  useEffect(() => {
    const page = pages.find((p) => p.slug === selectedSlug);
    if (page) {
      setTitle(page.title);
      setContent(page.content);
    } else {
      const predefined = predefinedPages.find((p) => p.slug === selectedSlug);
      setTitle(predefined?.title || "");
      setContent("");
    }
  }, [selectedSlug, pages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    await fetch("/api/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: selectedSlug, title, content }),
    });

    setSaving(false);
    fetchPages();
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-6 text-slate-900">مدیریت صفحات</h1>

      <div className="flex gap-2 mb-6">
        {predefinedPages.map((page) => (
          <button
            key={page.slug}
            onClick={() => setSelectedSlug(page.slug)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              selectedSlug === page.slug
                ? "bg-primary-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {page.title}
          </button>
        ))}
      </div>

      <div className="admin-card">
        <h2 className="text-sm font-bold mb-4 text-slate-800">ویرایش: {title}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">عنوان صفحه</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="admin-input" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">محتوا (Markdown)</label>
            <textarea
              rows={18}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="admin-input resize-y font-mono text-xs leading-6"
            />
          </div>
          <button type="submit" disabled={saving} className="admin-btn-primary flex items-center gap-2 disabled:opacity-50">
            {saving ? (
              <>
                <Loader size={16} />
                در حال ذخیره...
              </>
            ) : (
              "ذخیره"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
