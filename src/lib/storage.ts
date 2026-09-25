import { randomUUID } from "node:crypto";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

const CLOUDINARY_ENV_VARS = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
] as const;

const UPLOAD_FOLDER = "honarestan/uploads";

type CloudinaryConfig = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

function getCloudinaryConfig(): CloudinaryConfig {
  const values = Object.fromEntries(
    CLOUDINARY_ENV_VARS.map((name) => [name, process.env[name]?.trim() ?? ""])
  ) as Record<(typeof CLOUDINARY_ENV_VARS)[number], string>;

  const missing = CLOUDINARY_ENV_VARS.filter((name) => !values[name]);

  if (missing.length > 0) {
    throw new Error(`Missing Cloudinary environment variables: ${missing.join(", ")}`);
  }

  return {
    cloudName: values.CLOUDINARY_CLOUD_NAME,
    apiKey: values.CLOUDINARY_API_KEY,
    apiSecret: values.CLOUDINARY_API_SECRET,
  };
}

function configureCloudinary(config: CloudinaryConfig): void {
  cloudinary.config({
    cloud_name: config.cloudName,
    api_key: config.apiKey,
    api_secret: config.apiSecret,
    secure: true,
  });
}

function createPublicId(filename: string, contentType: string): string {
  const fallback = contentType === "image/jpeg" ? "image" : "file";
  const base = (filename || fallback)
    .replace(/\.[a-z0-9]{1,10}$/i, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .toLowerCase();

  return `${base || fallback}-${randomUUID()}`;
}

export async function uploadToCloudinary(
  body: Buffer,
  filename: string,
  contentType: string
): Promise<{ key: string; url: string }> {
  const config = getCloudinaryConfig();
  configureCloudinary(config);

  const result: UploadApiResponse = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: UPLOAD_FOLDER,
        public_id: createPublicId(filename, contentType),
        resource_type: "image",
        type: "upload",
        overwrite: false,
        use_filename: false,
        unique_filename: false,
      },
      (error, uploaded) => {
        if (error) {
          reject(new Error(`Cloudinary upload failed: ${error.message}`));
          return;
        }
        if (!uploaded) {
          reject(new Error("Cloudinary upload failed: empty response"));
          return;
        }
        resolve(uploaded);
      }
    );

    stream.end(body);
  });

  if (!result.secure_url) {
    throw new Error("Cloudinary upload failed: missing secure_url in response");
  }

  return {
    key: result.public_id ?? result.secure_url,
    url: result.secure_url,
  };
}
