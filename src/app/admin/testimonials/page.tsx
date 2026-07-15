"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash, Star } from "@/components/icons";

interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  content: string;
  image: string | null;
  rating: number;
  sortOrder: number;
  published: boolean;
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", role: "", content: "", image: "", rating: 5, sortOrder: 0, published: true });

  const fetchTestimonials = useCallback(async () => {
    const res = await fetch("/api/testimonials");
    if (res.ok) setTestimonials(await res.json());
  }, []);

  useEffect(() => { fetchTestimonials(); }, [fetchTestimonials]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/testimonials/${editingId}` : "/api/testimonials";
    const method = editingId ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    resetForm();
    fetchTestimonials();
  };

  const handleEdit = (item: Testimonial) => {
    setForm({ name: item.name, role: item.role || "", content: item.content, image: item.image || "", rating: item.rating, sortOrder: item.sortOrder, published: item.published });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این نظر اطمینان دارید؟")) return;
    await fetch(`/api/testimonials/${id}`, { method: "DELETE" });
    fetchTestimonials();
  };

  const resetForm = () => {
    setForm({ name: "", role: "", content: "", image: "", rating: 5, sortOrder: 0, published: true });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-900">مدیریت نظرات</h1>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="admin-btn-primary flex items-center gap-1.5">
          <Plus size={16} />
          {showForm ? "بستن" : "نظر جدید"}
        </button>
      </div>

      {showForm && (
        <div className="admin-card mb-6 animate-fade-in">
          <h2 className="text-sm font-bold mb-4 text-slate-800">{editingId ? "ویرایش نظر" : "نظر جدید"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">نام شخص</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="admin-input" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">سمت/موقعیت</label>
                <input type="text" placeholder="مثال: فارغ‌التحصیل نقاشی" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="admin-input" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">متن نظر</label>
              <textarea rows={4} required value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="admin-input resize-none" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">امتیاز</label>
                <select value={form.rating} onChange={(e) => setForm({ ...form, rating: parseInt(e.target.value) })} className="admin-input">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n} ستاره</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">ترتیب نمایش</label>
                <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} className="admin-input" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">آدرس تصویر (URL)</label>
                <input type="text" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="admin-input" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="published" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="w-4 h-4 rounded" />
              <label htmlFor="published" className="text-xs text-slate-600">نمایش در سایت</label>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="admin-btn-primary">{editingId ? "ذخیره تغییرات" : "افزودن"}</button>
              <button type="button" onClick={resetForm} className="admin-btn-secondary">انصراف</button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-card">
        <div className="space-y-3">
          {testimonials.length === 0 ? (
            <p className="text-slate-400 text-center py-8 text-sm">هنوز نظری اضافه نشده است</p>
          ) : (
            testimonials.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3.5 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-slate-800">{item.name}</h3>
                    <span className="flex gap-0.5">
                      {Array.from({ length: item.rating }).map((_, i) => (
                        <Star key={i} size={11} filled className="text-amber-400" />
                      ))}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${item.published ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      {item.published ? "نمایش" : "مخفی"}
                    </span>
                  </div>
                  {item.role && <p className="text-xs text-primary-600 mt-0.5">{item.role}</p>}
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{item.content.substring(0, 120)}...</p>
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
