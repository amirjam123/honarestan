"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center">
        <p className="text-7xl font-bold text-red-600 mb-4">۵۰۰</p>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">خطای داخلی سرور</h1>
        <p className="text-slate-500 text-sm mb-8 max-w-md mx-auto">
          متأسفانه خطایی رخ داده است. لطفاً دوباره تلاش کنید.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium text-sm hover:bg-primary-700 transition-colors"
        >
          تلاش مجدد
        </button>
      </div>
    </div>
  );
}
