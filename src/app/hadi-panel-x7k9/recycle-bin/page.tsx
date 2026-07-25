"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Trash, RefreshCw, Search, Filter, Loader, XCircle,
  Megaphone, Photo, UserGroup, PaintBrush, Calendar,
  Envelope, AcademicCap, CheckCircle,
} from "@/components/icons";

interface DeletedItem {
  id: string;
  _model: string;
  title?: string;
  name?: string;
  subject?: string;
  studentName?: string;
  deletedAt: string;
  deletedBy: string | null;
  [key: string]: unknown;
}

const MODEL_CONFIG: Record<string, { label: string; icon: typeof Megaphone; color: string }> = {
  news: { label: "اخبار", icon: Megaphone, color: "bg-blue-50 text-blue-600" },
  gallery: { label: "گالری", icon: Photo, color: "bg-emerald-50 text-emerald-600" },
  teachers: { label: "اساتید", icon: UserGroup, color: "bg-amber-50 text-amber-600" },
  courses: { label: "دوره‌ها", icon: AcademicCap, color: "bg-violet-50 text-violet-600" },
  "student-works": { label: "آثار هنرجویان", icon: PaintBrush, color: "bg-pink-50 text-pink-600" },
  events: { label: "رویدادها", icon: Calendar, color: "bg-cyan-50 text-cyan-600" },
  messages: { label: "پیام‌ها", icon: Envelope, color: "bg-teal-50 text-teal-600" },
};

export default function AdminRecycleBinPage() {
  const [items, setItems] = useState<DeletedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<{ model: string; id: string; title: string } | null>(null);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== "all") params.set("model", filter);
      if (search) params.set("search", search);

      const res = await fetch(`/api/admin/recycle-bin?${params}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleRestore = async (model: string, id: string) => {
    setRestoring(`${model}-${id}`);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/recycle-bin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, id }),
      });
      if (res.ok) {
        setMessage({ type: "success", text: "آیتم با موفقیت بازیابی شد" });
        fetchItems();
      } else {
        setMessage({ type: "error", text: "خطا در بازیابی آیتم" });
      }
    } catch {
      setMessage({ type: "error", text: "خطا در ارتباط با سرور" });
    } finally {
      setRestoring(null);
    }
  };

  const handlePermanentDelete = async () => {
    if (!confirmDelete) return;
    setMessage(null);
    try {
      const res = await fetch(
        `/api/admin/recycle-bin?model=${confirmDelete.model}&id=${confirmDelete.id}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setMessage({ type: "success", text: "آیتم برای همیشه حذف شد" });
        fetchItems();
      } else {
        setMessage({ type: "error", text: "خطا در حذف دائمی" });
      }
    } catch {
      setMessage({ type: "error", text: "خطا در ارتباط با سرور" });
    } finally {
      setConfirmDelete(null);
    }
  };

  const getTitle = (item: DeletedItem): string => {
    return (item.title || item.name || item.subject || item.studentName || "بدون عنوان") as string;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">سطل زباله</h1>
          <p className="text-xs text-slate-500 mt-1">
            آیتم‌های حذف شده قابل بازیابی هستند
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-card mb-5">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="جستجو..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input pr-8 text-xs"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={14} className="text-slate-400" />
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                filter === "all"
                  ? "bg-primary-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              همه
            </button>
            {Object.entries(MODEL_CONFIG).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  filter === key
                    ? "bg-primary-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-4 flex items-center gap-2 text-sm p-3 rounded-lg ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle size={16} />
          ) : (
            <XCircle size={16} />
          )}
          {message.text}
        </div>
      )}

      {/* Items List */}
      {loading ? (
        <div className="text-center py-12">
          <Loader size={24} className="mx-auto mb-2 text-slate-400 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="admin-card text-center py-12">
          <Trash size={32} className="mx-auto mb-2 text-slate-300" />
          <p className="text-slate-400 text-sm">سطل زباله خالی است</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const config = MODEL_CONFIG[item._model];
            const Icon = config?.icon || Trash;
            return (
              <div
                key={`${item._model}-${item.id}`}
                className="admin-card flex items-center gap-4"
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    config?.color || "bg-slate-100 text-slate-600"
                  }`}
                >
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {getTitle(item)}
                    </p>
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                      {config?.label || item._model}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                    <span>حذف شده: {formatDate(item.deletedAt)}</span>
                    {item.deletedBy && <span>توسط: {item.deletedBy}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRestore(item._model, item.id)}
                    disabled={restoring === `${item._model}-${item.id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {restoring === `${item._model}-${item.id}` ? (
                      <Loader size={12} className="animate-spin" />
                    ) : (
                      <RefreshCw size={12} />
                    )}
                    بازیابی
                  </button>
                  <button
                    onClick={() =>
                      setConfirmDelete({
                        model: item._model,
                        id: item.id,
                        title: getTitle(item),
                      })
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash size={12} />
                    حذف دائمی
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Permanent Delete Confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <XCircle size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">حذف دائمی</h3>
                <p className="text-xs text-slate-500">این عمل غیرقابل بازگشت است</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              آیا از حذف دائمی <span className="font-medium">{confirmDelete.title}</span> اطمینان
              دارید؟ این آیتم برای همیشه حذف خواهد شد.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                className="admin-btn-secondary"
              >
                انصراف
              </button>
              <button
                onClick={handlePermanentDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                حذف دائمی
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
