"use client";

import { useState, useRef } from "react";
import { Upload, XMark, Photo } from "@/components/icons";

interface ImageUploadProps {
  value: string;
  telegramFileId?: string;
  onChange: (url: string, fileId?: string) => void;
  label?: string;
}

export default function ImageUpload({ value, telegramFileId, onChange, label = "تصویر" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload/telegram", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "خطا در آپلود");
        return;
      }

      onChange(data.url, data.fileId);
    } catch {
      setError("خطا در اتصال به سرور");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleRemove = () => {
    onChange("", undefined);
    if (fileRef.current) fileRef.current.value = "";
  };

  const displayUrl = value;

  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1.5">{label}</label>

      {displayUrl ? (
        <div className="relative group">
          <div className="w-full max-w-xs aspect-video rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
            <img src={displayUrl} alt="" className="w-full h-full object-cover" />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 left-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="حذف تصویر"
          >
            <XMark size={14} />
          </button>
          <p className="text-[10px] text-slate-400 mt-1 truncate max-w-xs">
            {telegramFileId ? "آپلود شده در تلگرام" : displayUrl}
          </p>
        </div>
      ) : (
        <div
          onClick={() => fileRef.current?.click()}
          className="w-full max-w-xs aspect-video rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-colors"
        >
          {uploading ? (
            <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full" />
          ) : (
            <>
              <Photo size={24} className="text-slate-300" />
              <span className="text-xs text-slate-400">کلیک کنید یا فایل را بکشید</span>
            </>
          )}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleUpload}
        className="hidden"
      />

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
