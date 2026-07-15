"use client";

import { useState, useEffect, useCallback } from "react";
import { Envelope } from "@/components/icons";

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

  const fetchMessages = useCallback(async () => {
    const res = await fetch("/api/contact");
    if (res.ok) setMessages(await res.json());
  }, []);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  return (
    <div>
      <h1 className="text-xl font-bold mb-6 text-slate-900">پیام‌های تماس</h1>

      {messages.length === 0 ? (
        <div className="admin-card text-center py-12">
          <Envelope size={32} className="mx-auto mb-2 text-slate-300" />
          <p className="text-slate-400 text-sm">هنوز پیامی دریافت نشده است</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-1 space-y-2">
            {messages.map((msg) => (
              <button
                key={msg.id}
                onClick={() => setSelected(msg)}
                className={`w-full text-right p-3.5 rounded-lg border transition-colors ${
                  selected?.id === msg.id
                    ? "border-primary-500 bg-primary-50"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                } ${!msg.read ? "border-r-[3px] border-r-primary-500" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-slate-800">{msg.name}</h3>
                  {!msg.read && <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0" />}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">{msg.email}</p>
                {msg.subject && <p className="text-[11px] text-slate-500 mt-0.5 truncate">{msg.subject}</p>}
              </button>
            ))}
          </div>

          <div className="lg:col-span-2">
            {selected ? (
              <div className="admin-card">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{selected.name}</h2>
                    <p className="text-xs text-slate-500">{selected.email}</p>
                    {selected.phone && <p className="text-xs text-slate-500" dir="ltr">{selected.phone}</p>}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {new Date(selected.createdAt).toLocaleDateString("fa-IR")}
                  </p>
                </div>
                {selected.subject && (
                  <div className="mb-4 pb-3 border-b border-slate-100">
                    <span className="text-xs font-medium text-slate-500">موضوع: </span>
                    <span className="text-xs text-slate-700">{selected.subject}</span>
                  </div>
                )}
                <div>
                  <p className="text-sm text-slate-700 leading-7 whitespace-pre-wrap">{selected.message}</p>
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
    </div>
  );
}
