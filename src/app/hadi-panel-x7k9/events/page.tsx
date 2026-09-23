"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash, Calendar, LocationMarker } from "@/components/icons";

interface EventItem {
  id: string;
  title: string;
  description: string;
  image: string | null;
  date: string;
  location: string | null;
  published: boolean;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", image: "", date: "", location: "", published: false });

  const fetchEvents = useCallback(async () => {
    const res = await fetch("/api/events");
    if (res.ok) setEvents(await res.json());
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/events/${editingId}` : "/api/events";
    const method = editingId ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    resetForm();
    fetchEvents();
  };

  const handleEdit = (item: EventItem) => {
    setForm({ title: item.title, description: item.description, image: item.image || "", date: item.date.split("T")[0], location: item.location || "", published: item.published });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این رویداد اطمینان دارید؟")) return;
    await fetch(`/api/events/${id}`, { method: "DELETE" });
    fetchEvents();
  };

  const resetForm = () => {
    setForm({ title: "", description: "", image: "", date: "", location: "", published: false });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-900">مدیریت رویدادها</h1>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="admin-btn-primary flex items-center gap-1.5">
          <Plus size={16} />
          {showForm ? "بستن" : "رویداد جدید"}
        </button>
      </div>

      {showForm && (
        <div className="admin-card mb-6 animate-fade-in">
          <h2 className="text-sm font-bold mb-4 text-slate-800">{editingId ? "ویرایش رویداد" : "رویداد جدید"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">عنوان رویداد</label>
              <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="admin-input" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">توضیحات رویداد</label>
              <textarea rows={4} required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="admin-input resize-none" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">تاریخ رویداد</label>
                <input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="admin-input" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">مکان برگزاری</label>
                <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="admin-input" />
              </div>
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
              <button type="submit" className="admin-btn-primary">{editingId ? "ذخیره تغییرات" : "ایجاد رویداد"}</button>
              <button type="button" onClick={resetForm} className="admin-btn-secondary">انصراف</button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-card">
        <div className="space-y-3">
          {events.length === 0 ? (
            <p className="text-slate-400 text-center py-8 text-sm">هنوز رویدادی اضافه نشده است</p>
          ) : (
            events.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3.5 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-slate-800 truncate">{item.title}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium flex-shrink-0 ${item.published ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      {item.published ? "منتشر شده" : "پیش‌نویس"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{item.description.substring(0, 80)}...</p>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1"><Calendar size={11} /> {new Date(item.date).toLocaleDateString("fa-IR")}</span>
                    {item.location && <span className="flex items-center gap-1"><LocationMarker size={11} /> {item.location}</span>}
                  </div>
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
