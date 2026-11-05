"use client";

import { useState } from "react";
import { Photo } from "./icons";

interface ActivityImageProps {
  src?: string | null;
  alt: string;
  className?: string;
}

export function ActivityImage({ src, alt, className = "h-full w-full object-cover" }: ActivityImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src) {
    return (
      <div className="flex items-center justify-center bg-slate-100">
        <Photo className="h-10 w-10 text-slate-400" />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-slate-100">
      {failed ? (
        <div className="flex items-center justify-center bg-slate-100 text-slate-400">
          <Photo className="h-8 w-8" />
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={className}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
