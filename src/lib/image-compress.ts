export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  outputFormat?: "jpeg" | "webp" | "png";
}

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  reduction: number;
  width: number;
  height: number;
}

export function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.85,
    outputFormat = "jpeg",
  } = options;

  const originalSize = file.size;

  const img = new Image();
  const url = URL.createObjectURL(file);

  return new Promise((resolve, reject) => {
    img.onload = () => {
      URL.revokeObjectURL(url);

      let { naturalWidth: w, naturalHeight: h } = img;

      // Scale down if needed
      if (w > maxWidth || h > maxHeight) {
        const ratio = Math.min(maxWidth / w, maxHeight / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      // White background for JPEG
      if (outputFormat === "jpeg") {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, w, h);
      }

      ctx.drawImage(img, 0, 0, w, h);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Failed to compress image"));
            return;
          }

          const ext = outputFormat === "jpeg" ? "jpg" : outputFormat;
          const compressedFile = new File([blob], file.name, {
            type: `image/${outputFormat}`,
            lastModified: Date.now(),
          });

          resolve({
            file: compressedFile,
            originalSize,
            compressedSize: blob.size,
            reduction: Math.round((1 - blob.size / originalSize) * 100),
            width: w,
            height: h,
          });
        },
        `image/${outputFormat}`,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image for compression"));
    };

    img.src = url;
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}
