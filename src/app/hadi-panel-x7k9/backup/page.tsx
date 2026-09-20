"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Download, Upload, Loader, CheckCircle, XCircle, RefreshCw,
  Shield, Clock, Trash, Eye,
} from "@/components/icons";

interface BackupEntry {
  id: string;
  type: string;
  status: string;
  size: number;
  records: number;
  tables: string;
  checksum: string | null;
  notes: string | null;
  createdBy: string | null;
  completedAt: string | null;
  createdAt: string;
}

export default function AdminBackupPage() {
  const [backups, setBackups] = useState<BackupEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restorePreview, setRestorePreview] = useState<Record<string, unknown> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchBackups = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchBackups();
  }, [fetchBackups]);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 بایت";
    const units = ["بایت", "کیلوبایت", "مگابایت", "گیگابایت"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { text: string; color: string }> = {
      pending: { text: "در حال پردازش", color: "text-amber-600 bg-amber-50" },
      completed: { text: "تکمیل شده", color: "text-emerald-600 bg-emerald-50" },
      failed: { text: "ناموفق", color: "text-red-600 bg-red-50" },
      verified: { text: "تأیید شده", color: "text-blue-600 bg-blue-50" },
    };
    return badges[status] || { text: status, color: "text-slate-600 bg-slate-100" };
  };

  const getTypeBadge = (type: string) => {
    const badges: Record<string, { text: string; color: string }> = {
      manual: { text: "دستی", color: "text-slate-600 bg-slate-100" },
      daily: { text: "روزانه", color: "text-blue-600 bg-blue-50" },
      weekly: { text: "هفتگی", color: "text-violet-600 bg-violet-50" },
      monthly: { text: "ماهانه", color: "text-amber-600 bg-amber-50" },
    };
    return badges[type] || { text: type, color: "text-slate-600 bg-slate-100" };
  };

  const handleCreateBackup = async (type: string = "manual") => {
    setCreating(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `honarestan-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);

        const size = res.headers.get("X-Backup-Size");
        const records = res.headers.get("X-Backup-Records");

        setMessage({
          type: "success",
          text: `بکاپ با موفقیت ایجاد شد — ${records} رکورد، ${formatSize(Number(size))}`,
        });
        fetchBackups();
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "خطا در ایجاد بکاپ" });
      }
    } catch {
      setMessage({ type: "error", text: "خطا در ارتباط با سرور" });
    } finally {
      setCreating(false);
    }
  };

  const handleVerify = async (backupId: string) => {
    setVerifying(backupId);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/backup", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", backupId }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.valid) {
          setMessage({ type: "success", text: "بکاپ تأیید شد — تمام داده‌ها مطابقت دارند" });
        } else {
          setMessage({
            type: "error",
            text: `بکاپ مطابقت ندارد — رکوردها: ${data.backup.records} vs ${data.current.records}`,
          });
        }
        fetchBackups();
      } else {
        setMessage({ type: "error", text: data.error || "خطا در تأیید بکاپ" });
      }
    } catch {
      setMessage({ type: "error", text: "خطا در ارتباط با سرور" });
    } finally {
      setVerifying(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoreFile(file);
    setMessage(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.tables) {
          setRestorePreview(data);
        } else {
          setMessage({ type: "error", text: "فرمت فایل بکاپ نامعتبر است" });
          setRestoreFile(null);
        }
      } catch {
        setMessage({ type: "error", text: "خطا در خواندن فایل" });
        setRestoreFile(null);
      }
    };
    reader.readAsText(file);
  };

  const handleRestore = async () => {
    if (!restorePreview) return;

    setRestoring(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/backup", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore", data: restorePreview }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({
          type: "success",
          text: `بازیابی با موفقیت انجام شد — ${data.restored} رکورد بازیابی شد`,
        });
        setShowRestoreDialog(false);
        setRestoreFile(null);
        setRestorePreview(null);
        fetchBackups();
      } else {
        setMessage({ type: "error", text: data.error || "خطا در بازیابی" });
      }
    } catch {
      setMessage({ type: "error", text: "خطا در ارتباط با سرور" });
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">مدیریت بکاپ</h1>
          <p className="text-xs text-slate-500 mt-1">ایجاد، تأیید و بازیابی بکاپ‌ها</p>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-4 flex items-center gap-2 text-sm p-3 rounded-lg ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700"
              : message.type === "error"
              ? "bg-red-50 text-red-700"
              : "bg-blue-50 text-blue-700"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle size={16} />
          ) : message.type === "error" ? (
            <XCircle size={16} />
          ) : (
            <Shield size={16} />
          )}
          {message.text}
        </div>
      )}

      {/* Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="admin-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
              <Download size={16} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">بکاپ دستی</h3>
              <p className="text-[10px] text-slate-500">دانلود فوری</p>
            </div>
          </div>
          <button
            onClick={() => handleCreateBackup("manual")}
            disabled={creating}
            className="w-full admin-btn-primary flex items-center justify-center gap-2 disabled:opacity-50 text-xs"
          >
            {creating ? (
              <>
                <Loader size={14} className="animate-spin" />
                در حال ایجاد...
              </>
            ) : (
              <>
                <Download size={14} />
                ایجاد بکاپ
              </>
            )}
          </button>
        </div>

        <div className="admin-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center">
              <Upload size={16} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">بازیابی</h3>
              <p className="text-[10px] text-slate-500">از فایل بکاپ</p>
            </div>
          </div>
          <button
            onClick={() => setShowRestoreDialog(true)}
            className="w-full admin-btn-secondary flex items-center justify-center gap-2 text-xs"
          >
            <Upload size={14} />
            آپلود فایل بکاپ
          </button>
        </div>

        <div className="admin-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-violet-50 rounded-lg flex items-center justify-center">
              <Clock size={16} className="text-violet-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">بکاپ زمان‌بندی</h3>
              <p className="text-[10px] text-slate-500">از Neon داشبورد</p>
            </div>
          </div>
          <a
            href="https://console.neon.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full admin-btn-secondary flex items-center justify-center gap-2 text-xs"
          >
            <Shield size={14} />
            باز کردن Neon
          </a>
        </div>

        <div className="admin-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center">
              <RefreshCw size={16} className="text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">بروزرسانی</h3>
              <p className="text-[10px] text-slate-500">لیست بکاپ‌ها</p>
            </div>
          </div>
          <button
            onClick={fetchBackups}
            className="w-full admin-btn-secondary flex items-center justify-center gap-2 text-xs"
          >
            <RefreshCw size={14} />
            بروزرسانی لیست
          </button>
        </div>
      </div>

      {/* Backup Info */}
      <div className="admin-card mb-6">
        <h2 className="text-sm font-bold text-slate-800 mb-3">درباره بکاپ‌ها</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="font-medium text-slate-700 mb-1">بکاپ خودکار</p>
            <p>Neon به صورت خودکار از پایگاه داده شما بکاپ می‌گیرد (Point-in-Time Recovery)</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="font-medium text-slate-700 mb-1">بکاپ دستی</p>
            <p>خروجی JSON از تمام داده‌ها — قابل دانلود و بازیابی در هر زمان</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="font-medium text-slate-700 mb-1">تأیید صحت</p>
            <p>بررسی یکپارچگی بکاپ با مقایسه checksum و تعداد رکوردها</p>
          </div>
        </div>
      </div>

      {/* Retention Policy */}
      <div className="admin-card mb-6">
        <h2 className="text-sm font-bold text-slate-800 mb-3">سیاست نگهداری</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-right py-2 px-3 font-medium text-slate-600">نوع</th>
                <th className="text-right py-2 px-3 font-medium text-slate-600">دوره نگهداری</th>
                <th className="text-right py-2 px-3 font-medium text-slate-600">حداکثر تعداد</th>
                <th className="text-right py-2 px-3 font-medium text-slate-600">توضیح</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-2 px-3">دستی</td>
                <td className="py-2 px-3">نامحدود</td>
                <td className="py-2 px-3">—</td>
                <td className="py-2 px-3 text-slate-500">بکاپ‌های دستی حذف نمی‌شوند</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 px-3">روزانه</td>
                <td className="py-2 px-3">۳۰ روز</td>
                <td className="py-2 px-3">۳۰</td>
                <td className="py-2 px-3 text-slate-500">بکاپ‌های روزانه پس از ۳۰ روز حذف می‌شوند</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 px-3">هفتگی</td>
                <td className="py-2 px-3">۱۲ هفته</td>
                <td className="py-2 px-3">۱۲</td>
                <td className="py-2 px-3 text-slate-500">بکاپ‌های هفتگی پس از ۳ ماه حذف می‌شوند</td>
              </tr>
              <tr>
                <td className="py-2 px-3">ماهانه</td>
                <td className="py-2 px-3">۱۲ ماه</td>
                <td className="py-2 px-3">۱۲</td>
                <td className="py-2 px-3 text-slate-500">بکاپ‌های ماهانه پس از ۱ سال حذف می‌شوند</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Backup History */}
      <div className="admin-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-800">تاریخچه بکاپ‌ها</h2>
          <span className="text-[11px] text-slate-400">{backups.length} بکاپ</span>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <Loader size={24} className="mx-auto mb-2 text-slate-400 animate-spin" />
          </div>
        ) : backups.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Download size={32} className="mx-auto mb-2 text-slate-300" />
            <p className="text-sm">هنوز بکاپی ایجاد نشده</p>
          </div>
        ) : (
          <div className="space-y-2">
            {backups.map((backup) => {
              const statusBadge = getStatusBadge(backup.status);
              const typeBadge = getTypeBadge(backup.type);
              const tableCounts = backup.tables ? JSON.parse(backup.tables) : {};

              return (
                <div
                  key={backup.id}
                  className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${typeBadge.color}`}>
                          {typeBadge.text}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${statusBadge.color}`}>
                          {statusBadge.text}
                        </span>
                      </div>
                      <p className="text-xs text-slate-800 font-medium">
                        {formatDate(backup.completedAt || backup.createdAt)}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-[11px] text-slate-500">
                        {backup.records > 0 && <span>{backup.records} رکورد</span>}
                        {backup.size > 0 && <span>{formatSize(backup.size)}</span>}
                        {backup.createdBy && <span>توسط: {backup.createdBy}</span>}
                      </div>
                      {Object.keys(tableCounts).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {Object.entries(tableCounts)
                            .filter(([, count]) => (count as number) > 0)
                            .map(([table, count]) => (
                              <span
                                key={table}
                                className="px-1.5 py-0.5 bg-white rounded text-[9px] text-slate-500 border border-slate-200"
                              >
                                {table}: {count as number}
                              </span>
                            ))}
                        </div>
                      )}
                      {backup.notes && (
                        <p className="text-[11px] text-red-500 mt-1">{backup.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {backup.status === "completed" && (
                        <button
                          onClick={() => handleVerify(backup.id)}
                          disabled={verifying === backup.id}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                          title="تأیید صحت"
                        >
                          {verifying === backup.id ? (
                            <Loader size={14} className="animate-spin" />
                          ) : (
                            <Shield size={14} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Restore Dialog */}
      {showRestoreDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 mb-4">بازیابی از فایل بکاپ</h3>

            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-600 mb-2">
                فایل بکاپ (JSON)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="admin-input text-xs"
              />
            </div>

            {restorePreview && typeof restorePreview.tables === "object" && restorePreview.tables !== null && (
              <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                <p className="text-xs font-medium text-slate-700 mb-2">پیش‌نمایش:</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {Object.entries(restorePreview.tables as Record<string, unknown[]>).map(
                    ([table, items]) => {
                      const count = Array.isArray(items) ? items.length : 0;
                      const tableName = String(table);
                      return (
                        <div key={tableName} className="flex items-center justify-between p-2 bg-white rounded border border-slate-200">
                          <span className="text-slate-600">{tableName}</span>
                          <span className="font-medium text-slate-800">{count} رکورد</span>
                        </div>
                      );
                    }
                  )}
                </div>
                {typeof restorePreview.exportedAt === "string" && (
                  <p className="text-[10px] text-slate-400 mt-2">
                    تاریخ بکاپ: {formatDate(restorePreview.exportedAt as string)}
                  </p>
                )}
              </div>
            )}

            <div className="p-3 bg-amber-50 rounded-lg mb-4">
              <p className="text-xs text-amber-700">
                <strong>توجه:</strong> بازیابی، داده‌های موجود را با داده‌های بکاپ جایگزین می‌کند.
                رکوردهای موجود به‌روزرسانی و رکوردهای جدید اضافه می‌شوند.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowRestoreDialog(false);
                  setRestoreFile(null);
                  setRestorePreview(null);
                }}
                className="admin-btn-secondary"
              >
                انصراف
              </button>
              <button
                onClick={handleRestore}
                disabled={!restorePreview || restoring}
                className="admin-btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                {restoring ? (
                  <>
                    <Loader size={14} className="animate-spin" />
                    در حال بازیابی...
                  </>
                ) : (
                  <>
                    <Upload size={14} />
                    بازیابی
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
