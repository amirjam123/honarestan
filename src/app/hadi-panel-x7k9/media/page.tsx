"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  Photo, Upload, Search, Trash, Copy, CheckCircle,
  Loader, XCircle, Folder, Tag, RefreshCw, Eye, Pencil,
  Squares2x2, ListBullet, Check, ArrowDownTray, ArrowsRightLeft,
  XMark, FolderPlus, ExclamationTriangle,
} from "@/components/icons";
import { compressImage, formatFileSize, getImageDimensions } from "@/lib/image-compress";

interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  alt: string | null;
  title: string | null;
  caption: string | null;
  folder: string;
  tags: string;
  category: string;
  uploadedBy: string | null;
  deletedAt: string | null;
  deletedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

interface MediaResponse {
  items: MediaItem[];
  total: number;
  page: number;
  pages: number;
  folders: string[];
  categories: string[];
  tags: string[];
  stats: { totalSize: number; totalCount: number };
}

interface UploadProgress {
  file: File;
  progress: number;
  status: "pending" | "compressing" | "uploading" | "done" | "error";
  error?: string;
  result?: { url: string; width: number; height: number };
}

const CATEGORIES = [
  { value: "general", label: "عمومی" },
  { value: "news", label: "اخبار" },
  { value: "teachers", label: "اساتید" },
  { value: "gallery", label: "گالری" },
  { value: "courses", label: "دوره‌ها" },
  { value: "events", label: "رویدادها" },
  { value: "student-works", label: "آثار هنرجویان" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "جدیدترین" },
  { value: "oldest", label: "قدیمی‌ترین" },
  { value: "name", label: "نام (الفبا)" },
  { value: "name-desc", label: "نام (معکوس)" },
  { value: "size", label: "حجم (کم)" },
  { value: "size-desc", label: "حجم (زیاد)" },
];

const MIME_FILTERS = [
  { value: "all", label: "همه انواع" },
  { value: "image", label: "تصاویر" },
  { value: "video", label: "ویدیوها" },
  { value: "document", label: "اسناد" },
];

export default function AdminMediaPage() {
  // Data state
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [folders, setFolders] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [stats, setStats] = useState({ totalSize: 0, totalCount: 0 });

  // Filter state
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterFolder, setFilterFolder] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterTag, setFilterTag] = useState("all");
  const [filterMime, setFilterMime] = useState("all");
  const [sort, setSort] = useState("newest");

  // View state
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    alt: "",
    caption: "",
    folder: "",
    category: "",
    tags: "",
  });

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<UploadProgress[]>([]);
  const [dragging, setDragging] = useState(false);
  const [compressEnabled, setCompressEnabled] = useState(true);

  // UI state
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [permanentDeleteConfirm, setPermanentDeleteConfirm] = useState<string | null>(null);
  const [restoreConfirm, setRestoreConfirm] = useState<string | null>(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [bulkRestoreConfirm, setBulkRestoreConfirm] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [showTrash, setShowTrash] = useState(false);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [replaceItem, setReplaceItem] = useState<MediaItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce search
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [search]);

  // Fetch items
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (filterFolder !== "all") params.set("folder", filterFolder);
      if (filterCategory !== "all") params.set("category", filterCategory);
      if (filterTag !== "all") params.set("tag", filterTag);
      if (filterMime !== "all") params.set("mimeType", filterMime);
      params.set("sort", sort);
      params.set("page", String(page));
      params.set("limit", "50");
      if (showTrash) params.set("includeDeleted", "true");

      const res = await fetch(`/api/media?${params}`);
      if (res.ok) {
        const data: MediaResponse = await res.json();
        setItems(data.items || []);
        setTotal(data.total || 0);
        setPages(data.pages || 1);
        setFolders(data.folders || []);
        setCategories(data.categories || []);
        setAllTags(data.tags || []);
        setStats(data.stats || { totalSize: 0, totalCount: 0 });
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filterFolder, filterCategory, filterTag, filterMime, sort, page, showTrash]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Reset selection when filters change
  useEffect(() => {
    setSelectedIds(new Set());
    setSelectionMode(false);
  }, [debouncedSearch, filterFolder, filterCategory, filterTag, filterMime, showTrash]);

  // Show message helper
  const showMessage = useCallback((type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  }, []);

  // Upload handler
  const handleUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setUploading(true);
    const queue: UploadProgress[] = fileArray.map((file) => ({
      file,
      progress: 0,
      status: "pending" as const,
    }));
    setUploadQueue(queue);

    const uploaded: string[] = [];
    const errors: string[] = [];

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      try {
        // Update status to compressing
        setUploadQueue((prev) =>
          prev.map((q, idx) => (idx === i ? { ...q, status: "compressing" as const } : q))
        );

        let uploadFile = item.file;
        let width = 0;
        let height = 0;

        // Get dimensions
        try {
          const dims = await getImageDimensions(item.file);
          width = dims.width;
          height = dims.height;
        } catch {
          // ignore
        }

        // Compress if enabled and is image
        if (compressEnabled && item.file.type.startsWith("image/")) {
          try {
            const result = await compressImage(item.file, {
              maxWidth: 1920,
              maxHeight: 1920,
              quality: 0.85,
              outputFormat: item.file.type === "image/png" ? "png" : "jpeg",
            });
            uploadFile = result.file;
            width = result.width;
            height = result.height;
          } catch {
            // Use original if compression fails
          }
        }

        // Update status to uploading
        setUploadQueue((prev) =>
          prev.map((q, idx) => (idx === i ? { ...q, status: "uploading" as const, progress: 50 } : q))
        );

        // Upload file
        const formData = new FormData();
        formData.append("file", uploadFile);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });

        if (uploadRes.ok) {
          const { url } = await uploadRes.json();

          // Create media item
          const mediaRes = await fetch("/api/media", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              filename: item.file.name,
              originalName: item.file.name,
              url,
              mimeType: item.file.type,
              size: uploadFile.size,
              width,
              height,
              folder: filterFolder !== "all" ? filterFolder : "uploads",
              category: filterCategory !== "all" ? filterCategory : "general",
            }),
          });

          if (mediaRes.ok) {
            uploaded.push(item.file.name);
            setUploadQueue((prev) =>
              prev.map((q, idx) =>
                idx === i ? { ...q, status: "done" as const, progress: 100, result: { url, width, height } } : q
              )
            );
          } else {
            errors.push(item.file.name);
            setUploadQueue((prev) =>
              prev.map((q, idx) =>
                idx === i ? { ...q, status: "error" as const, error: "خطا در ذخیره" } : q
              )
            );
          }
        } else {
          errors.push(item.file.name);
          setUploadQueue((prev) =>
            prev.map((q, idx) =>
              idx === i ? { ...q, status: "error" as const, error: "خطا در آپلود" } : q
            )
          );
        }
      } catch {
        errors.push(item.file.name);
        setUploadQueue((prev) =>
          prev.map((q, idx) =>
            idx === i ? { ...q, status: "error" as const, error: "خطای غیرمنتظره" } : q
          )
        );
      }
    }

    if (uploaded.length > 0) {
      showMessage("success", `${uploaded.length} فایل با موفقیت آپلود شد`);
      fetchItems();
    }
    if (errors.length > 0) {
      showMessage("error", `خطا در آپلود ${errors.length} فایل`);
    }

    setTimeout(() => {
      setUploadQueue([]);
      setUploading(false);
    }, 2000);
  };

  // Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files);
    }
  };

  // Copy URL
  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(window.location.origin + url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = window.location.origin + url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    }
  };

  // Delete (soft)
  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/media?id=${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((i) => i.id !== id));
      if (selected?.id === id) setSelected(null);
      setDeleteConfirm(null);
      showMessage("success", "تصویر به سطل زباله منتقل شد");
      fetchItems();
    } catch {
      showMessage("error", "خطا در حذف");
    }
  };

  // Permanent delete
  const handlePermanentDelete = async (id: string) => {
    try {
      await fetch(`/api/media?id=${id}&permanent=true`, { method: "DELETE" });
      setItems((prev) => prev.filter((i) => i.id !== id));
      if (selected?.id === id) setSelected(null);
      setPermanentDeleteConfirm(null);
      showMessage("success", "تصویر برای همیشه حذف شد");
      fetchItems();
    } catch {
      showMessage("error", "خطا در حذف دائمی");
    }
  };

  // Restore
  const handleRestore = async (id: string) => {
    try {
      const res = await fetch("/api/media", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, restore: true }),
      });
      if (res.ok) {
        setRestoreConfirm(null);
        showMessage("success", "تصویر بازیابی شد");
        fetchItems();
      }
    } catch {
      showMessage("error", "خطا در بازیابی");
    }
  };

  // Bulk operations
  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    try {
      if (showTrash) {
        // Permanent delete from trash
        const res = await fetch("/api/media", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bulkDelete: ids }),
        });
        if (res.ok) {
          showMessage("success", `${ids.length} تصویر برای همیشه حذف شد`);
        }
      } else {
        // Soft delete
        for (const id of ids) {
          await fetch(`/api/media?id=${id}`, { method: "DELETE" });
        }
        showMessage("success", `${ids.length} تصویر به سطل زباله منتقل شد`);
      }
      setSelectedIds(new Set());
      setBulkDeleteConfirm(false);
      fetchItems();
    } catch {
      showMessage("error", "خطا در حذف گروهی");
    }
  };

  const handleBulkRestore = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    try {
      const res = await fetch("/api/media", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bulkRestore: ids }),
      });
      if (res.ok) {
        showMessage("success", `${ids.length} تصویر بازیابی شد`);
        setSelectedIds(new Set());
        setBulkRestoreConfirm(false);
        fetchItems();
      }
    } catch {
      showMessage("error", "خطا در بازیابی گروهی");
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((i) => i.id)));
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Save edit
  const handleSaveEdit = async () => {
    if (!selected) return;
    try {
      const res = await fetch("/api/media", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selected.id,
          title: editForm.title || null,
          alt: editForm.alt || null,
          caption: editForm.caption || null,
          folder: editForm.folder,
          category: editForm.category,
          tags: editForm.tags ? editForm.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setItems((prev) => prev.map((i) => (i.id === selected.id ? updated : i)));
        setSelected(updated);
        setEditMode(false);
        showMessage("success", "تغییرات ذخیره شد");
      }
    } catch {
      showMessage("error", "خطا در ذخیره");
    }
  };

  // Replace image
  const handleReplace = async (item: MediaItem, file: File) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });

      if (uploadRes.ok) {
        const { url } = await uploadRes.json();
        let width = 0;
        let height = 0;
        try {
          const dims = await getImageDimensions(file);
          width = dims.width;
          height = dims.height;
        } catch {
          // ignore
        }

        const res = await fetch("/api/media", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: item.id,
            url,
            filename: file.name,
            originalName: file.name,
            mimeType: file.type,
            size: file.size,
            width,
            height,
          }),
        });

        if (res.ok) {
          const updated = await res.json();
          setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
          if (selected?.id === item.id) setSelected(updated);
          setReplaceItem(null);
          showMessage("success", "تصویر با موفقیت جایگزین شد");
        }
      }
    } catch {
      showMessage("error", "خطا در جایگزینی تصویر");
    } finally {
      setUploading(false);
    }
  };

  // Start edit
  const startEdit = (item: MediaItem) => {
    const tags = item.tags ? JSON.parse(item.tags) : [];
    setEditForm({
      title: item.title || "",
      alt: item.alt || "",
      caption: item.caption || "",
      folder: item.folder,
      category: item.category,
      tags: tags.join(", "),
    });
    setEditMode(true);
  };

  // Create new folder
  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    const sanitized = newFolderName.trim().replace(/[^a-zA-Z0-9\-_]/g, "-").toLowerCase();
    if (!folders.includes(sanitized)) {
      setFolders((prev) => [...prev, sanitized]);
    }
    setFilterFolder(sanitized);
    setNewFolderName("");
    setShowNewFolder(false);
  };

  // Format helpers
  const formatSize = (bytes: number) => formatFileSize(bytes);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatDateFull = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const parseTags = (tagsStr: string): string[] => {
    try {
      const parsed = JSON.parse(tagsStr);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  // Memoize active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filterFolder !== "all") count++;
    if (filterCategory !== "all") count++;
    if (filterTag !== "all") count++;
    if (filterMime !== "all") count++;
    return count;
  }, [filterFolder, filterCategory, filterTag, filterMime]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Photo size={22} className="text-primary-500" />
            کتابخانه رسانه
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {stats.totalCount} فایل — {formatSize(stats.totalSize)} فضای استفاده شده
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTrash(!showTrash)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              showTrash
                ? "bg-amber-500 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Trash size={14} />
            سطل زباله
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="admin-btn-primary flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {uploading ? (
              <>
                <Loader size={14} className="animate-spin" />
                در حال آپلود...
              </>
            ) : (
              <>
                <Upload size={14} />
                آپلود فایل
              </>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx,.txt"
            onChange={(e) => e.target.files && handleUpload(e.target.files)}
            className="hidden"
          />
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-4 flex items-center gap-2 text-sm p-3 rounded-lg animate-fade-in ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.type === "success" ? <CheckCircle size={16} /> : <XCircle size={16} />}
          {message.text}
        </div>
      )}

      {/* Upload Queue */}
      {uploadQueue.length > 0 && (
        <div className="admin-card mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-slate-800">
              {uploadQueue.filter((q) => q.status === "done").length} از {uploadQueue.length} فایل آپلود شد
            </p>
            <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={compressEnabled}
                onChange={(e) => setCompressEnabled(e.target.checked)}
                className="rounded"
              />
              فشرده‌سازی تصویر
            </label>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {uploadQueue.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 text-xs">
                <div className="flex-shrink-0">
                  {item.status === "done" && <CheckCircle size={14} className="text-emerald-500" />}
                  {item.status === "error" && <XCircle size={14} className="text-red-500" />}
                  {item.status === "compressing" && <Loader size={14} className="text-blue-500 animate-spin" />}
                  {item.status === "uploading" && <Loader size={14} className="text-blue-500 animate-spin" />}
                  {item.status === "pending" && <div className="w-3.5 h-3.5 rounded-full bg-slate-200" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-slate-700">{item.file.name}</p>
                  {item.error && <p className="text-red-500 text-[10px]">{item.error}</p>}
                </div>
                <span className="text-slate-400">{formatSize(item.file.size)}</span>
                {(item.status === "compressing" || item.status === "uploading") && (
                  <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all duration-300"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`mb-5 p-8 border-2 border-dashed rounded-xl text-center transition-all duration-200 ${
          dragging
            ? "border-primary-500 bg-primary-50 scale-[1.01]"
            : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100"
        }`}
      >
        <div className={`w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center transition-colors ${
          dragging ? "bg-primary-100" : "bg-slate-100"
        }`}>
          <Upload size={28} className={dragging ? "text-primary-500" : "text-slate-300"} />
        </div>
        <p className="text-sm font-medium text-slate-600">
          {dragging ? "فایل‌ها را اینجا رها کنید" : "فایل‌ها را بکشید و اینجا رها کنید"}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          یا روی دکمه آپلود بالا کلیک کنید — حداکثر ۱۰ مگابایت
        </p>
      </div>

      {/* Filters Bar */}
      <div className="admin-card mb-5">
        <div className="flex flex-col gap-4">
          {/* Search + View Toggle */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="جستجو در نام، عنوان، برچسب..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="admin-input pr-8 text-xs"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <XMark size={14} />
                </button>
              )}
            </div>
            <div className="flex items-center border border-slate-700 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 transition-colors cursor-pointer ${
                  viewMode === "grid" ? "bg-primary-600 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Squares2x2 size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 transition-colors cursor-pointer ${
                  viewMode === "list" ? "bg-primary-600 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <ListBullet size={16} />
              </button>
            </div>
          </div>

          {/* Filter Row */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Folder */}
            <div className="flex items-center gap-1.5">
              <Folder size={14} className="text-slate-400" />
              <select
                value={filterFolder}
                onChange={(e) => { setFilterFolder(e.target.value); setPage(1); }}
                className="admin-input text-xs w-auto py-1.5"
              >
                <option value="all">همه پوشه‌ها</option>
                {folders.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
              <button
                onClick={() => setShowNewFolder(true)}
                className="p-1.5 text-slate-400 hover:text-primary-500 transition-colors cursor-pointer"
                title="پوشه جدید"
              >
                <FolderPlus size={14} />
              </button>
            </div>

            {/* Category */}
            <div className="flex items-center gap-1.5">
              <Tag size={14} className="text-slate-400" />
              <select
                value={filterCategory}
                onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
                className="admin-input text-xs w-auto py-1.5"
              >
                <option value="all">همه دسته‌ها</option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* MIME Type */}
            <div className="flex items-center gap-1.5">
              <Eye size={14} className="text-slate-400" />
              <select
                value={filterMime}
                onChange={(e) => { setFilterMime(e.target.value); setPage(1); }}
                className="admin-input text-xs w-auto py-1.5"
              >
                {MIME_FILTERS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-1.5">
              <ArrowsRightLeft size={14} className="text-slate-400" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="admin-input text-xs w-auto py-1.5"
              >
                {SORT_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Active filters indicator */}
            {activeFiltersCount > 0 && (
              <button
                onClick={() => {
                  setFilterFolder("all");
                  setFilterCategory("all");
                  setFilterTag("all");
                  setFilterMime("all");
                  setPage(1);
                }}
                className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-primary-600 bg-primary-50 rounded-full hover:bg-primary-100 transition-colors cursor-pointer"
              >
                <XMark size={10} />
                پاک کردن فیلترها ({activeFiltersCount})
              </button>
            )}
          </div>

          {/* Tags */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 items-center">
              <Tag size={12} className="text-slate-400" />
              <button
                onClick={() => { setFilterTag("all"); setPage(1); }}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                  filterTag === "all"
                    ? "bg-primary-600 text-white"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                همه
              </button>
              {allTags.slice(0, 15).map((tag) => (
                <button
                  key={tag}
                  onClick={() => { setFilterTag(filterTag === tag ? "all" : tag); setPage(1); }}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                    filterTag === tag
                      ? "bg-primary-600 text-white"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New Folder Modal */}
      {showNewFolder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FolderPlus size={18} />
              ایجاد پوشه جدید
            </h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="نام پوشه"
              className="admin-input text-xs mb-4"
              onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => { setShowNewFolder(false); setNewFolderName(""); }} className="admin-btn-secondary text-xs">
                انصراف
              </button>
              <button onClick={handleCreateFolder} className="admin-btn-primary text-xs">
                ایجاد
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selectionMode && selectedIds.size > 0 && (
        <div className="admin-card mb-4 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-primary-600">
              {selectedIds.size} مورد انتخاب شده
            </span>
            <button
              onClick={toggleSelectAll}
              className="text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
            >
              {selectedIds.size === items.length ? "لغو انتخاب همه" : "انتخاب همه"}
            </button>
          </div>
          <div className="flex items-center gap-2">
            {showTrash ? (
              <>
                <button
                  onClick={() => setBulkRestoreConfirm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                >
                  <RefreshCw size={12} />
                  بازیابی
                </button>
                <button
                  onClick={() => setBulkDeleteConfirm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash size={12} />
                  حذف دائمی
                </button>
              </>
            ) : (
              <button
                onClick={() => setBulkDeleteConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
              >
                <Trash size={12} />
                حذف ({selectedIds.size})
              </button>
            )}
          </div>
        </div>
      )}

      {/* Selection Mode Toggle */}
      {items.length > 0 && !showTrash && (
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-slate-500">
            {total} فایل
          </span>
          <button
            onClick={() => {
              setSelectionMode(!selectionMode);
              if (selectionMode) setSelectedIds(new Set());
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              selectionMode
                ? "bg-primary-50 text-primary-600 border border-primary-200"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            <Check size={12} />
            {selectionMode ? "حالت انتخاب فعال" : "انتخاب چندگانه"}
          </button>
        </div>
      )}

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Grid / List */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="text-center py-16">
              <Loader size={28} className="mx-auto mb-3 text-slate-300 animate-spin" />
              <p className="text-sm text-slate-400">در حال بارگذاری...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="admin-card text-center py-16">
              <Photo size={40} className="mx-auto mb-3 text-slate-200" />
              <p className="text-slate-400 text-sm mb-1">
                {showTrash ? "سطل زباله خالی است" : "فایلی یافت نشد"}
              </p>
              {!showTrash && (
                <p className="text-slate-400 text-xs">
                  فایل‌های خود را بکشید و رها کنید یا روی آپلود کلیک کنید
                </p>
              )}
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (selectionMode) {
                      toggleSelectItem(item.id);
                    } else {
                      setSelected(item);
                      setEditMode(false);
                    }
                  }}
                  className={`relative aspect-square rounded-xl overflow-hidden bg-slate-100 cursor-pointer group border-2 transition-all duration-150 ${
                    selectedIds.has(item.id)
                      ? "border-primary-500 ring-2 ring-primary-200"
                      : selected?.id === item.id
                      ? "border-primary-500"
                      : "border-transparent hover:border-slate-300"
                  } ${item.deletedAt ? "opacity-50" : ""}`}
                >
                  {item.mimeType.startsWith("image/") ? (
                    <img
                      src={item.url}
                      alt={item.alt || item.originalName}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-50">
                      <Photo size={28} className="text-slate-300" />
                    </div>
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                  {/* Selection checkbox */}
                  {selectionMode && (
                    <div className={`absolute top-2 right-2 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      selectedIds.has(item.id)
                        ? "bg-primary-500 border-primary-500"
                        : "bg-black/30 border-white/50"
                    }`}>
                      {selectedIds.has(item.id) && <Check size={12} className="text-white" />}
                    </div>
                  )}

                  {/* Quick actions */}
                  {!selectionMode && (
                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleCopyUrl(item.url); }}
                        className="p-1.5 bg-black/50 rounded-lg text-white hover:bg-black/70 backdrop-blur-sm transition-colors cursor-pointer"
                        title="کپی آدرس"
                      >
                        {copiedUrl === item.url ? <CheckCircle size={12} /> : <Copy size={12} />}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setPreviewItem(item); }}
                        className="p-1.5 bg-black/50 rounded-lg text-white hover:bg-black/70 backdrop-blur-sm transition-colors cursor-pointer"
                        title="پیش‌نمایش"
                      >
                        <Eye size={12} />
                      </button>
                    </div>
                  )}

                  {/* Bottom info */}
                  <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[10px] text-white truncate font-medium">{item.originalName}</p>
                    <p className="text-[9px] text-white/70">{formatSize(item.size)}</p>
                  </div>

                  {/* Trash badge */}
                  {item.deletedAt && (
                    <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-amber-500 rounded text-[9px] text-white font-medium">
                      حذف شده
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="space-y-1.5">
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (selectionMode) toggleSelectItem(item.id);
                    else { setSelected(item); setEditMode(false); }
                  }}
                  className={`admin-card flex items-center gap-4 cursor-pointer transition-all duration-150 ${
                    selectedIds.has(item.id)
                      ? "!border-primary-500 !bg-primary-50/10"
                      : selected?.id === item.id
                      ? "!border-primary-500"
                      : ""
                  } ${item.deletedAt ? "opacity-50" : ""}`}
                >
                  {selectionMode && (
                    <div
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                        selectedIds.has(item.id)
                          ? "bg-primary-500 border-primary-500"
                          : "border-slate-400"
                      }`}
                    >
                      {selectedIds.has(item.id) && <Check size={10} className="text-white" />}
                    </div>
                  )}

                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                    {item.mimeType.startsWith("image/") ? (
                      <img src={item.url} alt={item.alt || ""} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Photo size={16} className="text-slate-300" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {item.title || item.originalName}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[10px] text-slate-400">{formatSize(item.size)}</span>
                      {item.width && item.height && (
                        <span className="text-[10px] text-slate-400">{item.width}×{item.height}</span>
                      )}
                      <span className="text-[10px] text-slate-400">{item.mimeType}</span>
                      <span className="text-[10px] text-slate-400">{formatDate(item.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[9px] font-medium bg-slate-100 text-slate-500">
                      {CATEGORIES.find((c) => c.value === item.category)?.label || item.category}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleCopyUrl(item.url); }}
                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="کپی آدرس"
                    >
                      {copiedUrl === item.url ? <CheckCircle size={14} /> : <Copy size={14} />}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setPreviewItem(item); }}
                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="پیش‌نمایش"
                    >
                      <Eye size={14} />
                    </button>
                    {showTrash && item.deletedAt && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setRestoreConfirm(item.id); }}
                        className="p-1.5 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        title="بازیابی"
                      >
                        <RefreshCw size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="admin-btn-secondary text-xs disabled:opacity-30 cursor-pointer"
              >
                قبلی
              </button>
              <span className="text-xs text-slate-500 px-3">
                صفحه {page} از {pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="admin-btn-secondary text-xs disabled:opacity-30 cursor-pointer"
              >
                بعدی
              </button>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-1">
          {selected ? (
            <div className="admin-card sticky top-4">
              {/* Preview */}
              <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 mb-4 relative group/preview">
                {selected.mimeType.startsWith("image/") ? (
                  <img
                    src={selected.url}
                    alt={selected.alt || selected.originalName}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Photo size={48} className="text-slate-300" />
                  </div>
                )}

                {/* Preview overlay actions */}
                <div className="absolute inset-0 bg-black/0 group-hover/preview:bg-black/20 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover/preview:opacity-100">
                  <button
                    onClick={() => setPreviewItem(selected)}
                    className="p-2 bg-black/50 rounded-lg text-white hover:bg-black/70 backdrop-blur-sm transition-colors cursor-pointer"
                  >
                    <Eye size={18} />
                  </button>
                  <a
                    href={selected.url}
                    download={selected.originalName}
                    className="p-2 bg-black/50 rounded-lg text-white hover:bg-black/70 backdrop-blur-sm transition-colors"
                  >
                    <ArrowDownTray size={18} />
                  </a>
                </div>
              </div>

              {/* Info */}
              {!editMode ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800 leading-tight">
                      {selected.title || selected.originalName}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{selected.originalName}</p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 bg-slate-800 rounded-lg">
                      <p className="text-slate-400">حجم</p>
                      <p className="font-medium text-slate-200">{formatSize(selected.size)}</p>
                    </div>
                    {selected.width && selected.height && (
                      <div className="p-2 bg-slate-800 rounded-lg">
                        <p className="text-slate-400">ابعاد</p>
                        <p className="font-medium text-slate-200">{selected.width}×{selected.height}</p>
                      </div>
                    )}
                    <div className="p-2 bg-slate-800 rounded-lg">
                      <p className="text-slate-400">نوع</p>
                      <p className="font-medium text-slate-200 truncate">{selected.mimeType.split("/")[1]}</p>
                    </div>
                    <div className="p-2 bg-slate-800 rounded-lg">
                      <p className="text-slate-400">تاریخ</p>
                      <p className="font-medium text-slate-200">{formatDate(selected.createdAt)}</p>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-2 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">پوشه</span>
                      <span className="font-medium text-slate-200 bg-slate-800 px-2 py-0.5 rounded">{selected.folder}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">دسته‌بندی</span>
                      <span className="font-medium text-slate-200 bg-slate-800 px-2 py-0.5 rounded">
                        {CATEGORIES.find((c) => c.value === selected.category)?.label || selected.category}
                      </span>
                    </div>
                    {selected.uploadedBy && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">آپلود توسط</span>
                        <span className="font-medium text-slate-200">{selected.uploadedBy}</span>
                      </div>
                    )}
                  </div>

                  {/* Alt text */}
                  {selected.alt && (
                    <div className="text-[11px]">
                      <p className="text-slate-400">متن جایگزین</p>
                      <p className="font-medium text-slate-200 mt-0.5">{selected.alt}</p>
                    </div>
                  )}

                  {/* Tags */}
                  {parseTags(selected.tags).length > 0 && (
                    <div className="text-[11px]">
                      <p className="text-slate-400 mb-1.5">برچسب‌ها</p>
                      <div className="flex flex-wrap gap-1">
                        {parseTags(selected.tags).map((tag: string) => (
                          <span key={tag} className="px-2 py-0.5 bg-primary-500/10 text-primary-400 rounded text-[10px] font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopyUrl(selected.url)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors cursor-pointer"
                      >
                        {copiedUrl === selected.url ? <CheckCircle size={12} /> : <Copy size={12} />}
                        {copiedUrl === selected.url ? "کپی شد" : "کپی آدرس"}
                      </button>
                      <button
                        onClick={() => startEdit(selected)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-primary-400 bg-primary-500/10 hover:bg-primary-500/20 rounded-lg transition-colors cursor-pointer"
                      >
                        <Pencil size={12} />
                        ویرایش
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setReplaceItem(selected)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg transition-colors cursor-pointer"
                      >
                        <ArrowsRightLeft size={12} />
                        جایگزینی
                      </button>
                      {showTrash && selected.deletedAt ? (
                        <button
                          onClick={() => setRestoreConfirm(selected.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-colors cursor-pointer"
                        >
                          <RefreshCw size={12} />
                          بازیابی
                        </button>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(selected.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash size={12} />
                          حذف
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Edit Mode */
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">عنوان</label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="admin-input text-xs"
                      placeholder="عنوان تصویر"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">متن جایگزین</label>
                    <input
                      type="text"
                      value={editForm.alt}
                      onChange={(e) => setEditForm({ ...editForm, alt: e.target.value })}
                      className="admin-input text-xs"
                      placeholder="توصیف تصویر برای دسترسی‌پذیری"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">توضیحات</label>
                    <textarea
                      value={editForm.caption}
                      onChange={(e) => setEditForm({ ...editForm, caption: e.target.value })}
                      className="admin-input text-xs resize-none"
                      rows={2}
                      placeholder="توضیحات تصویر"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">پوشه</label>
                    <select
                      value={editForm.folder}
                      onChange={(e) => setEditForm({ ...editForm, folder: e.target.value })}
                      className="admin-input text-xs"
                    >
                      {folders.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">دسته‌بندی</label>
                    <select
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      className="admin-input text-xs"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">برچسب‌ها (با کاما جدا کنید)</label>
                    <input
                      type="text"
                      value={editForm.tags}
                      onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                      className="admin-input text-xs"
                      placeholder="برچسب۱, برچسب۲, برچسب۳"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => setEditMode(false)} className="flex-1 admin-btn-secondary text-xs cursor-pointer">
                      انصراف
                    </button>
                    <button onClick={handleSaveEdit} className="flex-1 admin-btn-primary text-xs cursor-pointer">
                      ذخیره
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="admin-card text-center py-12">
              <Photo size={36} className="mx-auto mb-3 text-slate-700" />
              <p className="text-slate-400 text-sm mb-1">یک تصویر انتخاب کنید</p>
              <p className="text-slate-500 text-[11px]">برای مشاهده اطلاعات و ویرایش</p>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {previewItem && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewItem(null)}
        >
          <button
            onClick={() => setPreviewItem(null)}
            className="absolute top-4 left-4 p-2 text-white/70 hover:text-white transition-colors cursor-pointer z-10"
          >
            <XMark size={24} />
          </button>

          <div className="max-w-5xl max-h-[90vh] w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            {previewItem.mimeType.startsWith("image/") ? (
              <img
                src={previewItem.url}
                alt={previewItem.alt || previewItem.originalName}
                className="max-w-full max-h-[75vh] object-contain rounded-lg"
              />
            ) : (
              <div className="w-64 h-64 bg-white/10 rounded-lg flex items-center justify-center">
                <Photo size={48} className="text-white/30" />
              </div>
            )}

            <div className="mt-4 text-center text-white">
              <p className="text-sm font-medium">{previewItem.title || previewItem.originalName}</p>
              <div className="flex items-center justify-center gap-4 mt-2 text-xs text-white/60">
                <span>{formatSize(previewItem.size)}</span>
                {previewItem.width && previewItem.height && (
                  <span>{previewItem.width}×{previewItem.height}</span>
                )}
                <span>{previewItem.mimeType}</span>
                <span>{formatDateFull(previewItem.createdAt)}</span>
              </div>

              <div className="flex items-center justify-center gap-2 mt-4">
                <button
                  onClick={() => handleCopyUrl(previewItem.url)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                >
                  {copiedUrl === previewItem.url ? <CheckCircle size={14} /> : <Copy size={14} />}
                  {copiedUrl === previewItem.url ? "کپی شد" : "کپی آدرس"}
                </button>
                <a
                  href={previewItem.url}
                  download={previewItem.originalName}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <ArrowDownTray size={14} />
                  دانلود
                </a>
                <button
                  onClick={() => { setSelected(previewItem); setPreviewItem(null); setEditMode(false); }}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors cursor-pointer"
                >
                  <Pencil size={14} />
                  ویرایش
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Replace Image Modal */}
      {replaceItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <ArrowsRightLeft size={20} className="text-amber-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">جایگزینی تصویر</h3>
                <p className="text-xs text-slate-500">تصویر جدید جایگزین تصویر فعلی می‌شود</p>
              </div>
            </div>

            <div className="aspect-video rounded-lg overflow-hidden bg-slate-100 mb-4">
              <img src={replaceItem.url} alt="" className="w-full h-full object-contain" />
            </div>

            <p className="text-sm text-slate-600 mb-4 text-center">{replaceItem.originalName}</p>

            <input
              ref={replaceInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0] && replaceItem) {
                  handleReplace(replaceItem, e.target.files[0]);
                }
              }}
              className="hidden"
            />

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setReplaceItem(null)}
                className="admin-btn-secondary"
              >
                انصراف
              </button>
              <button
                onClick={() => replaceInputRef.current?.click()}
                disabled={uploading}
                className="admin-btn-primary flex items-center gap-2 cursor-pointer"
              >
                {uploading ? <Loader size={14} className="animate-spin" /> : <Upload size={14} />}
                انتخاب تصویر جدید
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <ExclamationTriangle size={20} className="text-amber-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">انتقال به سطل زباله</h3>
                <p className="text-xs text-slate-500">قابل بازیابی از سطل زباله</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              آیا از حذف این تصویر اطمینان دارید؟
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="admin-btn-secondary cursor-pointer">
                انصراف
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors cursor-pointer"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permanent Delete Confirmation */}
      {permanentDeleteConfirm && (
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
              آیا از حذف دائمی این تصویر اطمینان دارید؟
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setPermanentDeleteConfirm(null)} className="admin-btn-secondary cursor-pointer">
                انصراف
              </button>
              <button
                onClick={() => handlePermanentDelete(permanentDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors cursor-pointer"
              >
                حذف دائمی
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Confirmation */}
      {restoreConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                <RefreshCw size={20} className="text-emerald-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">بازیابی تصویر</h3>
                <p className="text-xs text-slate-500">تصویر به کتابخانه بازمی‌گردد</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              آیا از بازیابی این تصویر اطمینان دارید؟
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setRestoreConfirm(null)} className="admin-btn-secondary cursor-pointer">
                انصراف
              </button>
              <button
                onClick={() => handleRestore(restoreConfirm)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                بازیابی
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation */}
      {bulkDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <ExclamationTriangle size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {showTrash ? "حذف دائمی گروهی" : "حذف گروهی"}
                </h3>
                <p className="text-xs text-slate-500">
                  {showTrash ? "این عمل غیرقابل بازگشت است" : `${selectedIds.size} تصویر به سطل زباله منتقل می‌شود`}
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setBulkDeleteConfirm(false)} className="admin-btn-secondary cursor-pointer">
                انصراف
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors cursor-pointer"
              >
                {showTrash ? "حذف دائمی" : "حذف"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Restore Confirmation */}
      {bulkRestoreConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                <RefreshCw size={20} className="text-emerald-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">بازیابی گروهی</h3>
                <p className="text-xs text-slate-500">{selectedIds.size} تصویر بازیابی می‌شود</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setBulkRestoreConfirm(false)} className="admin-btn-secondary cursor-pointer">
                انصراف
              </button>
              <button
                onClick={handleBulkRestore}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                بازیابی
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
