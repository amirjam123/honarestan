import { prisma } from "./prisma";

export type ActivityKind = "gallery" | "news" | "event";

export type Activity = {
  id: string;
  kind: ActivityKind;
  typeLabel: string;
  title: string;
  description: string | null;
  image: string | null;
  date: Date;
  createdAt: Date;
};

export const ACTIVITY_LABELS: Record<ActivityKind, string> = {
  gallery: "گالری",
  news: "خبر",
  event: "رویداد",
};

async function toNewsActivity(news: {
  id: string;
  title: string;
  excerpt: string | null;
  image: string | null;
  createdAt: Date;
}): Promise<Activity> {
  return {
    id: news.id,
    kind: "news",
    typeLabel: ACTIVITY_LABELS.news,
    title: news.title,
    description: news.excerpt?.trim() || null,
    image: news.image ?? null,
    date: news.createdAt,
    createdAt: news.createdAt,
  };
}

async function toGalleryActivity(gallery: {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
  createdAt: Date;
}): Promise<Activity> {
  return {
    id: gallery.id,
    kind: "gallery",
    typeLabel: ACTIVITY_LABELS.gallery,
    title: gallery.title,
    description: gallery.description,
    image: gallery.image ?? null,
    date: gallery.createdAt,
    createdAt: gallery.createdAt,
  };
}

async function toEventActivity(event: {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
  date: Date;
  createdAt: Date;
}): Promise<Activity> {
  return {
    id: event.id,
    kind: "event",
    typeLabel: ACTIVITY_LABELS.event,
    title: event.title,
    description: event.description,
    image: event.image ?? null,
    date: event.date,
    createdAt: event.createdAt,
  };
}

export async function getActivities({
  type,
}: {
  type?: ActivityKind;
} = {}): Promise<{ items: Activity[]; total: number }> {
  const [news, galleries, events] = await Promise.all([
    prisma.news.findMany({
      where: {
        published: true,
        deletedAt: null,
      },
    }),
    prisma.gallery.findMany({
      where: {
        deletedAt: null,
      },
    }),
    prisma.event.findMany({
      where: {
        published: true,
        deletedAt: null,
      },
    }),
  ]);

  const items: Activity[] = [];

  for (const newsItem of news) {
    items.push(await toNewsActivity(newsItem));
  }

  for (const galleryItem of galleries) {
    items.push(await toGalleryActivity(galleryItem));
  }

  for (const eventItem of events) {
    items.push(await toEventActivity(eventItem));
  }

  const sortedItems = [...items].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );

  const filteredItems = type
    ? sortedItems.filter((item) => item.kind === type)
    : sortedItems;

  return {
    items: filteredItems,
    total: filteredItems.length,
  };
}

export function activityHref(activity: Activity): string {
  if (activity.kind === "gallery") {
    return `/gallery?item=${activity.id}`;
  }
  if (activity.kind === "news") {
    return `/news/${activity.id}`;
  }
  return `/events#${activity.id}`;
}

export async function getLatestActivities({
  limit = 6,
  type,
}: {
  limit?: number;
  type?: ActivityKind;
} = {}): Promise<{ items: Activity[]; total: number }> {
  const { items, total } = await getActivities({ type });

  return {
    items: items.slice(0, limit),
    total,
  };
}
