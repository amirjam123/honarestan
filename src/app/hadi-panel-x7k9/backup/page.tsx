"use client";

import { useState, useEffect } from "react";
import { Loader, CheckCircle, XCircle, Download } from "@/components/icons";

interface Backup {
  timestamp: string;
  database: string;
  uploads: boolean;
}

export default function AdminBackupPage() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      const res = await fetch("/api/admin/backup");
      if (res.ok) {
        const data = await res.json();
        setBackups(data.backups || []);
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async () => {
    setCreating(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/backup", { method: "POST" });
      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "بکاپ با موفقیت ایجاد شد" });
        fetchBackups();
      } else {
        setMessage({ type: "error", text: data.error || "خطا در ایجاد بکاپ" });
      }
    } catch {
      setMessage({ type: "error", text: "خطا در ارتباط با سرور" });
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (timestamp: string) => {
    const year = timestamp.substring(0, 4);
    const month = timestamp.substring(4, 6);
    const day = timestamp.substring(6, 8);
    const hour = timestamp.substring(9, 11);
    const minute = timestamp.substring(11, 13);
    return `${year}/${month}/${day} - ${hour}:${minute}`;
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-6 text-slate-900">مدیریت بکاپ‌ها</h1>

      {/* Create Backup */}
      <div className="admin-card mb-6">
        <h2 className="text-sm font-bold mb-4 text-slate-800">ایجاد بکاپ جدید</h2>
        <p className="text-xs text-slate-500 mb-4">
          بکاپ شامل تمام دیتابیس، تصاویر آپلود شده و تنظیمات سایت است.
        </p>
        <button
          onClick={createBackup}
          disabled={creating}
          className="admin-btn-primary flex items-center gap-2 disabled:opacity-50"
        >
          {creating ? (
            <>
              <Loader size={16} className="animate-spin" />
              در حال ایجاد بکاپ...
            </>
          ) : (
            <>
              <Download size={16} />
              ایجاد بکاپ
            </>
          )}
        </button>

        {message && (
          <div className={`mt-4 flex items-center gap-2 text-sm ${
            message.type === "success" ? "text-emerald-600" : "text-red-600"
          }`}>
            {message.type === "success" ? <CheckCircle size={16} /> : <XCircle size={16} />}
            {message.text}
          </div>
        )}
      </div>

      {/* Backup List */}
      <div className="admin-card">
        <h2 className="text-sm font-bold mb-4 text-slate-800">بکاپ‌های موجود</h2>
        
        {loading ? (
          <div className="text-center py-8">
            <Loader size={24} className="mx-auto mb-2 text-slate-400 animate-spin" />
            <p className="text-slate-500 text-sm">در حال بارگذاری...</p>
          </div>
        ) : backups.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p className="text-sm">هنوز بکاپی ایجاد نشده است</p>
          </div>
        ) : (
          <div className="space-y-3">
            {backups.map((backup) => (
              <div
                key={backup.timestamp}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {formatDate(backup.timestamp)}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span className={backup.database ? "text-emerald-600" : "text-slate-400"}>
                      {backup.database ? "✓ دیتابیس" : "✗ دیتابیس"}
                    </span>
                    <span className={backup.uploads ? "text-emerald-600" : "text-slate-400"}>
                      {backup.uploads ? "✓ تصاویر" : "✗ تصاویر"}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-slate-400">
                  {backup.database}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="admin-card mt-6">
        <h2 className="text-sm font-bold mb-3 text-slate-800">راهنمای بازیابی</h2>
        <div className="text-xs text-slate-600 space-y-2">
          <p>برای بازیابی بکاپ از خط فرمان استفاده کنید:</p>
          <code className="block bg-slate-100 p-2 rounded text-xs" dir="ltr">
            ./scripts/restore.sh
          </code>
          <p>یا با مشخص کردن timestamp:</p>
          <code className="block bg-slate-100 p-2 rounded text-xs" dir="ltr">
            ./scripts/restore.sh 20260720_123456
          </code>
        </div>
      </div>
    </div>
  );
}
