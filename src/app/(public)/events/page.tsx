import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Hero from "@/components/ui/Hero";
import JsonLd from "@/components/ui/JsonLd";
import { generateSeoMetadata, generateBreadcrumbJsonLd, generateWebPageJsonLd, generateEventJsonLd, generateJsonLd, getSeoForPage, SITE_URL } from "@/lib/seo";
import { Calendar, LocationMarker } from "@/components/icons";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata("/events");
}

export default async function EventsPage() {
  const [events, seo] = await Promise.all([
    prisma.event.findMany({
      where: { published: true, deletedAt: null },
      orderBy: { date: "desc" },
    }),
    getSeoForPage("/events"),
  ]);

  return (
    <div>
      <JsonLd data={generateWebPageJsonLd("/events", "رویدادهای هنرستان هادی", "رویدادهای هنرستان هادی. نمایشگاه‌ها، جشنواره‌ها و برنامه‌های ویژه.")} />
      {generateJsonLd("/events", seo) && <JsonLd data={generateJsonLd("/events", seo)!} />}
      <JsonLd data={generateBreadcrumbJsonLd([
        { name: "صفحه اصلی", url: SITE_URL },
        { name: "رویدادها", url: `${SITE_URL}/events` },
      ])} />
      <Hero title="رویدادها" subtitle="آخرین رویدادها و برنامه‌های هنرستان هادی" />

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        {events.length === 0 ? (
          <div className="text-center text-slate-400 py-12">
            <Calendar size={48} className="mx-auto mb-3 text-slate-300" />
            <p className="text-sm">هنوز رویدادی ثبت نشده است</p>
          </div>
        ) : (
          <div className="space-y-6">
            {events.map((event) => (
              <div key={event.id}>
                <JsonLd data={generateEventJsonLd({
                  title: event.title,
                  description: event.description,
                  date: event.date,
                  location: event.location,
                  image: event.image,
                  url: `${SITE_URL}/events#${event.id}`,
                })} />
                <div
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row">
                    {event.image && (
                      <div className="md:w-72 flex-shrink-0">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-48 md:h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6 flex-1">
                      <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} />
                          {new Date(event.date).toLocaleDateString("fa-IR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1.5">
                            <LocationMarker size={14} />
                            {event.location}
                          </span>
                        )}
                      </div>
                      <h2 className="text-lg font-bold text-slate-900 mb-2">
                        {event.title}
                      </h2>
                      <p className="text-slate-600 text-sm leading-7">
                        {event.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
