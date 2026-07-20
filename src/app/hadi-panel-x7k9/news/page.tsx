"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash } from "@/components/icons";
import ExcelImport from "@/components/admin/ExcelImport";

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  image: string | null;
  published: boolean;
  createdAt: string;
}

export default function AdminNewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", content: "", excerpt: "", image: "", published: false });

  const fetchNews = useCallback(async () => {
    const res = await fetch("/api/news");
    if (res.ok) setNews(await res.json());
  }, []);

  useEffect(() => { fetchNews(); }, [fetchNews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/news/${editingId}` : "/api/news";
    const method = editingId ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    resetForm();
    fetchNews();
  };

  const handleEdit = (item: NewsItem) => {
    setForm({ title: item.title, content: item.content, excerpt: item.excerpt, image: item.image || "", published: item.published });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این خبر اطمینان دارید؟")) return;
    await fetch(`/api/news/${id}`, { method: "DELETE" });
    fetchNews();
  };

  const resetForm = () => {
    setForm({ title: "", content: "", excerpt: "", image: "", published: false });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-900">مدیریت اخبار</h1>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="admin-btn-primary flex items-center gap-1.5">
          <Plus size={16} />
          {showForm ? "بستن" : "خبر جدید"}
        </button>
      </div>

      <ExcelImport model="news" onImportComplete={fetchNews} />

      {showForm && (
        <div className="admin-card mb-6 animate-fade-in">
          <h2 className="text-sm font-bold mb-4 text-slate-800">{editingId ? "ویرایش خبر" : "خبر جدید"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">عنوان خبر</label>
              <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="admin-input" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">خلاصه</label>
              <textarea rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className="admin-input resize-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">متن کامل خبر</label>
              <textarea rows={6} required value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="admin-input resize-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">آدرس تصویر (URL)</label>
              <input type="text" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="admin-input" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="published" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="w-4 h-4 rounded" />
              <label htmlFor="published" className="text-xs text-slate-600">منتشر شده</label>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="admin-btn-primary">{editingId ? "ذخیره تغییرات" : "ایجاد خبر"}</button>
              <button type="button" onClick={resetForm} className="admin-btn-secondary">انصراف</button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-card">
        <div className="space-y-3">
          {news.length === 0 ? (
            <p className="text-slate-400 text-center py-8 text-sm">هنوز خبری اضافه نشده است</p>
          ) : (
            news.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3.5 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-slate-800 truncate">{item.title}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium flex-shrink-0 ${item.published ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      {item.published ? "منتشر شده" : "پیش‌نویس"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{item.excerpt}</p>
                </div>
                <div className="flex gap-1.5 mr-3">
                  <button onClick={() => handleEdit(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" aria-label="ویرایش">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors" aria-label="حذف">
                    <Trash size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
