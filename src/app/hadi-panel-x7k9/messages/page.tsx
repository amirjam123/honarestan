"use client";

import { useState, useEffect, useCallback } from "react";
import { Envelope, Trash, CheckCircle, Search, Filter } from "@/components/icons";

interface Message {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<Message | null>(null);
  const [filter, setFilter] = useState<"all" | "read" | "unread">("all");
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    const res = await fetch("/api/contact");
    if (res.ok) setMessages(await res.json());
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const toggleRead = async (msg: Message) => {
    await fetch("/api/contact", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: msg.id, read: !msg.read }),
    });
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, read: !m.read } : m))
    );
    if (selected?.id === msg.id) {
      setSelected({ ...msg, read: !msg.read });
    }
  };

  const deleteMessage = async (id: string) => {
    await fetch(`/api/contact?id=${id}`, { method: "DELETE" });
    setMessages((prev) => prev.filter((m) => m.id !== id));
    if (selected?.id === id) setSelected(null);
    setDeleteConfirm(null);
  };

  const filtered = messages.filter((msg) => {
    if (filter === "read" && !msg.read) return false;
    if (filter === "unread" && msg.read) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        msg.name.toLowerCase().includes(q) ||
        msg.email.toLowerCase().includes(q) ||
        (msg.subject && msg.subject.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-900">
          پیام‌های تماس
          {unreadCount > 0 && (
            <span className="mr-2 text-xs font-medium bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
              {unreadCount} جدید
            </span>
          )}
        </h1>
      </div>

      {/* Filters & Search */}
      <div className="admin-card mb-5">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="جستجو در نام، ایمیل یا موضوع..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input pr-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            {(["all", "unread", "read"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  filter === f
                    ? "bg-primary-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {f === "all" ? "همه" : f === "unread" ? "خوانده نشده" : "خوانده شده"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="admin-card text-center py-12">
          <Envelope size={32} className="mx-auto mb-2 text-slate-300" />
          <p className="text-slate-400 text-sm">هنوز پیامی دریافت نشده است</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-1 space-y-2 max-h-[600px] overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">
                پیامی یافت نشد
              </p>
            ) : (
              filtered.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => {
                    setSelected(msg);
                    if (!msg.read) toggleRead(msg);
                  }}
                  className={`w-full text-right p-3.5 rounded-lg border transition-colors ${
                    selected?.id === msg.id
                      ? "border-primary-500 bg-primary-50"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  } ${!msg.read ? "border-r-[3px] border-r-primary-500" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-slate-800">
                      {msg.name}
                    </h3>
                    {!msg.read && (
                      <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{msg.email}</p>
                  {msg.subject && (
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {msg.subject}
                    </p>
                  )}
                </button>
              ))
            )}
          </div>

          <div className="lg:col-span-2">
            {selected ? (
              <div className="admin-card">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {selected.name}
                    </h2>
                    <p className="text-xs text-slate-500">{selected.email}</p>
                    {selected.phone && (
                      <p className="text-xs text-slate-500" dir="ltr">
                        {selected.phone}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-[11px] text-slate-400">
                      {new Date(selected.createdAt).toLocaleDateString("fa-IR")}
                    </p>
                    <button
                      onClick={() => toggleRead(selected)}
                      className={`p-1.5 rounded transition-colors ${
                        selected.read
                          ? "text-slate-400 hover:text-primary-600 hover:bg-primary-50"
                          : "text-primary-600 hover:text-slate-400 hover:bg-slate-50"
                      }`}
                      title={selected.read ? "علامت‌گذاری به عنوان خوانده نشده" : "علامت‌گذاری به عنوان خوانده شده"}
                    >
                      <CheckCircle size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(selected.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="حذف پیام"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
                {selected.subject && (
                  <div className="mb-4 pb-3 border-b border-slate-100">
                    <span className="text-xs font-medium text-slate-500">
                      موضوع:{" "}
                    </span>
                    <span className="text-xs text-slate-700">
                      {selected.subject}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-sm text-slate-700 leading-7 whitespace-pre-wrap">
                    {selected.message}
                  </p>
                </div>
              </div>
            ) : (
              <div className="admin-card text-center py-12">
                <Envelope size={32} className="mx-auto mb-2 text-slate-300" />
                <p className="text-slate-400 text-sm">یک پیام را انتخاب کنید</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-base font-bold text-slate-900 mb-2">حذف پیام</h3>
            <p className="text-sm text-slate-600 mb-6">
              آیا از حذف این پیام اطمینان دارید؟ این عمل قابل بازگشت نیست.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="admin-btn-secondary"
              >
                انصراف
              </button>
              <button
                onClick={() => deleteMessage(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
