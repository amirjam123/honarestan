"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash, PaintBrush, Sparkles } from "@/components/icons";

interface StudentWork {
  id: string;
  title: string;
  studentName: string;
  description: string | null;
  image: string;
  category: string;
  year: string | null;
  featured: boolean;
  published: boolean;
}

export default function AdminStudentWorksPage() {
  const [works, setWorks] = useState<StudentWork[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", studentName: "", description: "", image: "", category: "general", year: "", featured: false, published: true });
  const [uploading, setUploading] = useState(false);

  const fetchWorks = useCallback(async () => {
    const res = await fetch("/api/student-works");
    if (res.ok) setWorks(await res.json());
  }, []);

  useEffect(() => { fetchWorks(); }, [fetchWorks]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const { url } = await res.json();
        setForm((prev) => ({ ...prev, image: url }));
      }
    } catch { alert("خطا در آپلود فایل"); }
    finally { setUploading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/student-works/${editingId}` : "/api/student-works";
    const method = editingId ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    resetForm();
    fetchWorks();
  };

  const handleEdit = (item: StudentWork) => {
    setForm({ title: item.title, studentName: item.studentName, description: item.description || "", image: item.image, category: item.category, year: item.year || "", featured: item.featured, published: item.published });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این اثر اطمینان دارید؟")) return;
    await fetch(`/api/student-works/${id}`, { method: "DELETE" });
    fetchWorks();
  };

  const resetForm = () => {
    setForm({ title: "", studentName: "", description: "", image: "", category: "general", year: "", featured: false, published: true });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-900">مدیریت آثار هنرجویان</h1>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="admin-btn-primary flex items-center gap-1.5">
          <Plus size={16} />
          {showForm ? "بستن" : "اثر جدید"}
        </button>
      </div>

      {showForm && (
        <div className="admin-card mb-6 animate-fade-in">
          <h2 className="text-sm font-bold mb-4 text-slate-800">{editingId ? "ویرایش اثر" : "اثر جدید"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">عنوان اثر</label>
                <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="admin-input" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">نام هنرجو</label>
                <input type="text" required value={form.studentName} onChange={(e) => setForm({ ...form, studentName: e.target.value })} className="admin-input" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">توضیحات</label>
              <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="admin-input resize-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">تصویر اثر</label>
              <input type="file" accept="image/*" onChange={handleUpload} className="admin-input" disabled={uploading} />
              {uploading && <p className="text-xs text-slate-400 mt-1">در حال آپلود...</p>}
              {form.image && <img src={form.image} alt="preview" className="mt-2 w-24 h-24 object-cover rounded-lg" />}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">یا آدرس تصویر (URL)</label>
              <input type="text" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="admin-input" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">دسته‌بندی</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="admin-input">
                  <option value="general">عمومی</option>
                  <option value="painting">نقاشی</option>
                  <option value="sculpture">مجسمه‌سازی</option>
                  <option value="calligraphy">خوشنویسی</option>
                  <option value="photography">عکاسی</option>
                  <option value="digital">دیجیتال آرت</option>
                  <option value="graphic">گرافیک</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">سال</label>
                <input type="text" placeholder="مثال: ۱۴۰۳" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className="admin-input" />
              </div>
              <div className="flex items-end gap-4">
                <label className="flex items-center gap-1.5">
                  <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 rounded" />
                  <span className="text-xs text-slate-600">برتر</span>
                </label>
                <label className="flex items-center gap-1.5">
                  <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="w-4 h-4 rounded" />
                  <span className="text-xs text-slate-600">نمایش</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="admin-btn-primary">{editingId ? "ذخیره تغییرات" : "افزودن"}</button>
              <button type="button" onClick={resetForm} className="admin-btn-secondary">انصراف</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {works.length === 0 ? (
          <div className="col-span-full text-center text-slate-400 py-12 admin-card">
            <PaintBrush size={32} className="mx-auto mb-2 text-slate-300" />
            <p className="text-sm">هنوز اثری اضافه نشده است</p>
          </div>
        ) : (
          works.map((item) => (
            <div key={item.id} className="admin-card">
              <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 mb-3">
                <img src={item.image} alt={item.title} loading="lazy" className="w-full h-full object-cover" />
              </div>
              <h3 className="font-semibold text-sm text-slate-800">{item.title}</h3>
              <p className="text-primary-600 text-xs">{item.studentName}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] text-slate-400">{item.category}</span>
                {item.featured && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-600 font-medium">
                    <Sparkles size={10} /> برتر
                  </span>
                )}
              </div>
              <div className="flex gap-1.5 mt-3">
                <button onClick={() => handleEdit(item)} className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-600 rounded text-xs hover:bg-blue-100 transition-colors">
                  <Pencil size={12} />
                  ویرایش
                </button>
                <button onClick={() => handleDelete(item.id)} className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-600 rounded text-xs hover:bg-red-100 transition-colors">
                  <Trash size={12} />
                  حذف
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
