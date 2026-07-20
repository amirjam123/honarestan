"use client";

import { useState, useEffect, useCallback } from "react";
import { XMark, Trash } from "@/components/icons";

interface GalleryItemProps {
  id: string;
  title: string;
  image: string;
  description?: string | null;
  category: string;
  onDelete?: (id: string) => void;
}

export default function GalleryItem({ id, title, image, description, category, onDelete }: GalleryItemProps) {
  const [showModal, setShowModal] = useState(false);

  const closeModal = useCallback(() => setShowModal(false), []);

  useEffect(() => {
    if (!showModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [showModal, closeModal]);

  return (
    <>
      <div className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all duration-300">
        <div className="aspect-square bg-slate-100 relative overflow-hidden">
          <img
            src={image}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
            onClick={() => setShowModal(true)}
          />
          <div className="absolute top-3 right-3">
            <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-md text-[11px] font-medium text-slate-600">
              {category}
            </span>
          </div>
          {onDelete && (
            <button
              onClick={() => onDelete(id)}
              className="absolute top-3 left-3 p-1.5 bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
              aria-label={`حذف ${title}`}
            >
              <Trash size={14} />
            </button>
          )}
        </div>
        <div className="p-3.5">
          <h3 className="font-semibold text-sm text-slate-800">{title}</h3>
          {description && <p className="text-slate-500 text-xs mt-1 line-clamp-2 leading-5">{description}</p>}
        </div>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 animate-fade-in"
          onClick={closeModal}
          role="dialog"
          aria-label={`تصویر ${title}`}
          aria-modal="true"
        >
          <div className="relative max-w-4xl max-h-[85vh]">
            <img src={image} alt={title} className="max-w-full max-h-[85vh] object-contain rounded-lg" />
            <button
              className="absolute -top-3 -left-3 p-2 bg-white text-slate-700 rounded-full shadow-lg hover:bg-slate-100 transition-colors"
              onClick={closeModal}
              aria-label="بستن"
            >
              <XMark size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
