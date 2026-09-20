"use client";

import { useState, useRef } from "react";
import { Upload, Loader, CheckCircle, XCircle } from "@/components/icons";

interface ImportResult {
  summary: {
    totalRows: number;
    validRows: number;
    imported: number;
    duplicates: number;
    validationErrors: number;
  };
  detectedColumns: string[];
  duplicates: { row: number; value: string; message: string }[];
  validationErrors: { row: number; message: string }[];
}

interface ExcelImportProps {
  model: "teachers" | "courses" | "news";
  onImportComplete?: (result: ImportResult) => void;
}

const MODEL_LABELS: Record<string, string> = {
  teachers: "اساتید",
  courses: "دوره‌ها",
  news: "اخبار",
};

export default function ExcelImport({ model, onImportComplete }: ExcelImportProps) {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "xlsx" && ext !== "xls") {
      setError("فقط فایل‌های اکسل (.xlsx و .xls) مجاز هستند");
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);
    setFileName(file.name);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/import/${model}`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "خطا در بارگذاری فایل");
        return;
      }

      setResult(data);
      onImportComplete?.(data);
    } catch {
      setError("خطا در ارتباط با سرور");
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setFileName(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="admin-card animate-fade-in">
      <h2 className="text-sm font-bold mb-4 text-slate-800">
        ورود اطلاعات از اکسل — {MODEL_LABELS[model]}
      </h2>

      {!result ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors"
        >
          <Upload size={32} className="mx-auto mb-3 text-slate-400" />
          <p className="text-sm text-slate-600 mb-1">
            فایل اکسل را اینجا رها کنید یا کلیک کنید
          </p>
          <p className="text-xs text-slate-400 mb-4">فرمت‌های مجاز: .xlsx, .xls</p>
          <label
            className={`admin-btn-primary cursor-pointer inline-flex items-center gap-2 ${uploading ? "opacity-50 pointer-events-none" : ""}`}
          >
            {uploading ? (
              <>
                <Loader size={16} />
                در حال بارگذاری...
              </>
            ) : (
              <>
                <Upload size={16} />
                انتخاب فایل
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleInputChange}
              className="hidden"
              disabled={uploading}
            />
          </label>
          {fileName && uploading && (
            <p className="text-xs text-slate-500 mt-3">{fileName}</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-slate-800">{result.summary.totalRows}</p>
              <p className="text-[11px] text-slate-500">کل ردیف‌ها</p>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-emerald-700">{result.summary.imported}</p>
              <p className="text-[11px] text-emerald-600">وارد شده</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-amber-700">{result.summary.duplicates}</p>
              <p className="text-[11px] text-amber-600">تکراری</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-red-700">{result.summary.validationErrors}</p>
              <p className="text-[11px] text-red-600">خطای اعتبارسنجی</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-blue-700">{result.detectedColumns.length}</p>
              <p className="text-[11px] text-blue-600">ستون شناسایی شده</p>
            </div>
          </div>

          {/* Detected columns */}
          <div>
            <p className="text-xs font-medium text-slate-600 mb-1">ستون‌های شناسایی شده:</p>
            <div className="flex flex-wrap gap-1.5">
              {result.detectedColumns.map((col) => (
                <span key={col} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[11px] font-medium">
                  {col}
                </span>
              ))}
            </div>
          </div>

          {/* Duplicates */}
          {result.duplicates.length > 0 && (
            <div>
              <p className="text-xs font-medium text-amber-700 mb-2">ردیف‌های تکراری:</p>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {result.duplicates.map((d, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs bg-amber-50 rounded p-2">
                    <XCircle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                    <span className="text-amber-800">سطر {d.row}: {d.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Validation errors */}
          {result.validationErrors.length > 0 && (
            <div>
              <p className="text-xs font-medium text-red-700 mb-2">خطاهای اعتبارسنجی:</p>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {result.validationErrors.map((err, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs bg-red-50 rounded p-2">
                    <XCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-red-800">سطر {err.row}: {err.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Success message */}
          {result.summary.imported > 0 && result.summary.duplicates === 0 && result.summary.validationErrors === 0 && (
            <div className="flex items-center gap-2 bg-emerald-50 rounded-lg p-3">
              <CheckCircle size={18} className="text-emerald-600" />
              <span className="text-sm text-emerald-800">
                {result.summary.imported} ردیف با موفقیت وارد شد
              </span>
            </div>
          )}

          <button onClick={handleReset} className="admin-btn-secondary">
            بارگذاری فایل جدید
          </button>
        </div>
      )}

      {error && (
        <div className="mt-3 flex items-start gap-2 bg-red-50 rounded-lg p-3">
          <XCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
          <span className="text-sm text-red-800">{error}</span>
        </div>
      )}
    </div>
  );
}
