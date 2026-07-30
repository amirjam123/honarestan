const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";

if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
  console.warn("TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set. Image upload will not work.");
}

const FILE_PATH_CACHE = new Map<string, { path: string; expires: number }>();
const CACHE_TTL = 3600_000; // 1 hour

export async function sendImageToTelegram(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<{ fileId: string; url: string }> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    throw new Error("Telegram bot not configured");
  }

  const blob = new Blob([new Uint8Array(buffer)], { type: mimeType });
  const formData = new FormData();
  formData.append("chat_id", TELEGRAM_CHAT_ID);
  formData.append("photo", blob, filename);

  const response = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`,
    { method: "POST", body: formData }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Telegram API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  if (!data.ok) {
    throw new Error(`Telegram API error: ${data.description}`);
  }

  const photos = data.result.photo as Array<{ file_id: string; file_size: number }>;
  const bestPhoto = photos[photos.length - 1];
  return { fileId: bestPhoto.file_id, url: `/api/images?file_id=${bestPhoto.file_id}` };
}

export async function sendDocumentToTelegram(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<{ fileId: string; url: string }> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    throw new Error("Telegram bot not configured");
  }

  const blob = new Blob([new Uint8Array(buffer)], { type: mimeType });
  const formData = new FormData();
  formData.append("chat_id", TELEGRAM_CHAT_ID);
  formData.append("document", blob, filename);

  const response = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`,
    { method: "POST", body: formData }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Telegram API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  if (!data.ok) {
    throw new Error(`Telegram API error: ${data.description}`);
  }

  const doc = data.result.document as { file_id: string };
  return { fileId: doc.file_id, url: `/api/images?file_id=${doc.file_id}` };
}

export async function getTelegramFilePath(fileId: string): Promise<string | null> {
  const cached = FILE_PATH_CACHE.get(fileId);
  if (cached && cached.expires > Date.now()) return cached.path;

  if (!TELEGRAM_BOT_TOKEN) return null;

  const response = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${fileId}`
  );

  if (!response.ok) return null;

  const data = await response.json();
  if (!data.ok) return null;

  const filePath = data.result.file_path as string;
  FILE_PATH_CACHE.set(fileId, { path: filePath, expires: Date.now() + CACHE_TTL });
  return filePath;
}

export function getTelegramFileUrl(filePath: string): string {
  return `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${filePath}`;
}

export function isTelegramConfigured(): boolean {
  return Boolean(TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID);
}
