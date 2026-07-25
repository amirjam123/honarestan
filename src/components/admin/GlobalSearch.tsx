"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader, XMark, Megaphone, Photo, UserGroup, AcademicCap, PaintBrush, Envelope, ChatBubble, Document, Clock, ArrowLeft } from "@/components/icons";
import { getAdminPath } from "@/lib/admin-config";

interface SearchResult {
  id: string;
  type: string;
  typeLabel: string;
  title: string;
  excerpt: string;
  image: string | null;
  href: string;
  createdAt: string;
}

interface SearchResponse {
  results: SearchResult[];
  total: number;
}

const TYPE_CONFIG: Record<string, { icon: typeof Megaphone; color: string; bg: string }> = {
  news: { icon: Megaphone, color: "text-blue-500", bg: "bg-blue-500/10" },
  teachers: { icon: UserGroup, color: "text-amber-500", bg: "bg-amber-500/10" },
  gallery: { icon: Photo, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  courses: { icon: AcademicCap, color: "text-violet-500", bg: "bg-violet-500/10" },
  "student-works": { icon: PaintBrush, color: "text-pink-500", bg: "bg-pink-500/10" },
  messages: { icon: Envelope, color: "text-teal-500", bg: "bg-teal-500/10" },
  tickets: { icon: ChatBubble, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  pages: { icon: Document, color: "text-slate-400", bg: "bg-slate-500/10" },
};

function highlightText(text: string, query: string): React.ReactNode {
  if (!query || query.length < 2) return text;

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-yellow-200/40 text-yellow-200 rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (diffMin < 1) return "همین الان";
  if (diffMin < 60) return `${diffMin} دقیقه پیش`;
  if (diffH < 24) return `${diffH} ساعت پیش`;
  if (diffD < 7) return `${diffD} روز پیش`;
  return date.toLocaleDateString("fa-IR", { month: "short", day: "numeric" });
}

export default function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Group results by type
  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    results.forEach((r) => {
      if (!groups[r.type]) groups[r.type] = [];
      groups[r.type].push(r);
    });
    return groups;
  }, [results]);

  const groupKeys = Object.keys(groupedResults);

  // Flat list for keyboard navigation
  const flatResults = useMemo(() => results, [results]);

  // Debounced search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    // Cancel previous request
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`/api/admin/search?q=${encodeURIComponent(searchQuery)}`, {
        signal: controller.signal,
      });
      if (res.ok) {
        const data: SearchResponse = await res.json();
        setResults(data.results);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle input change with debounce
  const handleInputChange = useCallback(
    (value: string) => {
      setQuery(value);
      setActiveIndex(-1);
      setLoading(true);
      setOpen(true);

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        performSearch(value);
      }, 250);
    },
    [performSearch]
  );

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      // Escape to close
      if (e.key === "Escape" && open) {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handleGlobalKey);
    return () => document.removeEventListener("keydown", handleGlobalKey);
  }, [open]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  // Navigate to result
  const navigateTo = useCallback(
    (result: SearchResult) => {
      setOpen(false);
      setQuery("");
      setResults([]);
      // All results link to admin pages
      router.push(getAdminPath(result.href));
    },
    [router]
  );

  // Keyboard navigation within dropdown
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open || flatResults.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((prev) => (prev < flatResults.length - 1 ? prev + 1 : 0));
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : flatResults.length - 1));
          break;
        case "Enter":
          e.preventDefault();
          if (activeIndex >= 0 && activeIndex < flatResults.length) {
            navigateTo(flatResults[activeIndex]);
          }
          break;
        case "Escape":
          setOpen(false);
          break;
      }
    },
    [open, flatResults, activeIndex, navigateTo]
  );

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0) {
      const el = document.getElementById(`search-result-${activeIndex}`);
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      {/* Search Input */}
      <div className="relative">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => query.length >= 2 && setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="جستجوی سراسری..."
          className="w-full pr-10 pl-20 py-2.5 text-sm bg-slate-100 border border-transparent rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-500/20 transition-all"
        />

        {/* Right side: loading or clear */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {loading ? (
            <Loader size={14} className="text-primary-500 animate-spin" />
          ) : query ? (
            <button
              onClick={() => {
                setQuery("");
                setResults([]);
                inputRef.current?.focus();
              }}
              className="p-0.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <XMark size={14} />
            </button>
          ) : null}

          {/* Keyboard shortcut hint */}
          {!query && (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 bg-slate-200 rounded border border-slate-300">
              <span className="text-xs">Ctrl</span>
              <span>K</span>
            </kbd>
          )}
        </div>
      </div>

      {/* Dropdown */}
      {open && (
        <div
          ref={dropdownRef}
          className="absolute top-full mt-2 right-0 w-full bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-fade-in max-h-[70vh] flex flex-col"
        >
          {query.length < 2 ? (
            <div className="p-6 text-center text-sm text-slate-400">
              حداقل ۲ حرف تایپ کنید
            </div>
          ) : loading && results.length === 0 ? (
            <div className="p-6 text-center">
              <Loader size={20} className="mx-auto text-primary-500 animate-spin mb-2" />
              <p className="text-sm text-slate-400">در حال جستجو...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-6 text-center">
              <Search size={28} className="mx-auto text-slate-200 mb-2" />
              <p className="text-sm text-slate-500 mb-1">نتیجه‌ای یافت نشد</p>
              <p className="text-xs text-slate-400">عبارت دیگری امتحان کنید</p>
            </div>
          ) : (
            <div className="overflow-y-auto max-h-[70vh]">
              {/* Results count */}
              <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {results.length} نتیجه برای &quot;{query}&quot;
                </span>
              </div>

              {/* Grouped results */}
              {groupKeys.map((type) => {
                const config = TYPE_CONFIG[type] || TYPE_CONFIG.pages;
                const Icon = config.icon;
                const items = groupedResults[type];
                const groupLabel = items[0]?.typeLabel || type;

                return (
                  <div key={type}>
                    {/* Group header */}
                    <div className="px-4 py-2 bg-slate-50 border-y border-slate-100 flex items-center gap-2">
                      <div className={`w-5 h-5 rounded flex items-center justify-center ${config.bg}`}>
                        <Icon size={12} className={config.color} />
                      </div>
                      <span className="text-xs font-semibold text-slate-600">{groupLabel}</span>
                      <span className="text-[10px] text-slate-400 mr-auto">{items.length}</span>
                    </div>

                    {/* Items */}
                    {items.map((item) => {
                      const flatIndex = flatResults.indexOf(item);
                      return (
                        <button
                          key={`${item.type}-${item.id}`}
                          id={`search-result-${flatIndex}`}
                          onClick={() => navigateTo(item)}
                          onMouseEnter={() => setActiveIndex(flatIndex)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-right transition-colors cursor-pointer border-b border-slate-50 last:border-0 ${
                            activeIndex === flatIndex
                              ? "bg-primary-50"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          {/* Thumbnail or icon */}
                          {item.image ? (
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                              <img
                                src={item.image}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                              <Icon size={18} className={config.color} />
                            </div>
                          )}

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate leading-tight">
                              {highlightText(item.title, query)}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5 leading-tight">
                              {highlightText(item.excerpt, query)}
                            </p>
                          </div>

                          {/* Meta */}
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <div className="flex items-center gap-1 text-[10px] text-slate-400">
                              <Clock size={10} />
                              {formatDate(item.createdAt)}
                            </div>
                            <ArrowLeft size={12} className="text-slate-300" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
