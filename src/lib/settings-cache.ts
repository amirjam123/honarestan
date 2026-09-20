let cachedSettings: Record<string, string> | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60_000;

export async function getSettings(): Promise<Record<string, string>> {
  const now = Date.now();
  if (cachedSettings && now - cacheTimestamp < CACHE_TTL) {
    return cachedSettings;
  }

  try {
    const res = await fetch("/api/settings", {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      cachedSettings = await res.json();
      cacheTimestamp = now;
      return cachedSettings!;
    }
  } catch {
    // Silent fail
  }

  return cachedSettings || {};
}
