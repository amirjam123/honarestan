"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash, UserGroup } from "@/components/icons";
import ExcelImport from "@/components/admin/ExcelImport";

interface Teacher {
  id: string;
  name: string;
  title: string;
  bio: string | null;
  image: string | null;
  specialty: string | null;
  sortOrder: number;
  published: boolean;
}

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", title: "", bio: "", image: "", specialty: "", sortOrder: 0, published: true });
  const [uploading, setUploading] = useState(false);

  const fetchTeachers = useCallback(async () => {
    const res = await fetch("/api/teachers");
    if (res.ok) setTeachers(await res.json());
  }, []);

  useEffect(() => { fetchTeachers(); }, [fetchTeachers]);

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
    const url = editingId ? `/api/teachers/${editingId}` : "/api/teachers";
    const method = editingId ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    resetForm();
    fetchTeachers();
  };

  const handleEdit = (item: Teacher) => {
    setForm({ name: item.name, title: item.title, bio: item.bio || "", image: item.image || "", specialty: item.specialty || "", sortOrder: item.sortOrder, published: item.published });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این استاد اطمینان دارید؟")) return;
    await fetch(`/api/teachers/${id}`, { method: "DELETE" });
    fetchTeachers();
  };

  const resetForm = () => {
    setForm({ name: "", title: "", bio: "", image: "", specialty: "", sortOrder: 0, published: true });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-900">مدیریت اساتید</h1>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="admin-btn-primary flex items-center gap-1.5">
          <Plus size={16} />
          {showForm ? "بستن" : "استاد جدید"}
        </button>
      </div>

      <ExcelImport model="teachers" onImportComplete={fetchTeachers} />

      {showForm && (
        <div className="admin-card mb-6 animate-fade-in">
          <h2 className="text-sm font-bold mb-4 text-slate-800">{editingId ? "ویرایش استاد" : "استاد جدید"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">نام استاد</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="admin-input" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">عنوان/سمت</label>
                <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="admin-input" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">تخصص</label>
              <input type="text" value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} className="admin-input" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">بیوگرافی</label>
              <textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="admin-input resize-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">تصویر</label>
              <input type="file" accept="image/*" onChange={handleUpload} className="admin-input" disabled={uploading} />
              {uploading && <p className="text-xs text-slate-400 mt-1">در حال آپلود...</p>}
              {form.image && <img src={form.image} alt="preview" className="mt-2 w-20 h-20 object-cover rounded-full" />}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">یا آدرس تصویر (URL)</label>
              <input type="text" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="admin-input" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">ترتیب نمایش</label>
                <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} className="admin-input" />
              </div>
              <div className="flex items-end">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="published" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="w-4 h-4 rounded" />
                  <label htmlFor="published" className="text-xs text-slate-600">نمایش در سایت</label>
                </div>
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
        {teachers.length === 0 ? (
          <div className="col-span-full text-center text-slate-400 py-12 admin-card">
            <UserGroup size={32} className="mx-auto mb-2 text-slate-300" />
            <p className="text-sm">هنوز استادی اضافه نشده است</p>
          </div>
        ) : (
          teachers.map((item) => (
            <div key={item.id} className="admin-card text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <UserGroup size={24} className="text-slate-400" />}
              </div>
              <h3 className="font-semibold text-sm text-slate-800">{item.name}</h3>
              <p className="text-primary-600 text-xs">{item.title}</p>
              {item.specialty && <p className="text-slate-400 text-[11px] mt-0.5">{item.specialty}</p>}
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${item.published ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                  {item.published ? "نمایش" : "مخفی"}
                </span>
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
