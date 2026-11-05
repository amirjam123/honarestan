import Link from "next/link";
import { formatDate } from "../lib/utils";
import { Activity } from "../lib/activities";
import { ActivityImage } from "./ActivityImage";

export interface ActivityCardProps {
  activity: Activity;
  href: string;
}

export function ActivityCard({ activity, href }: ActivityCardProps) {
  return (
    <Link
      href={href}
      className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow hover:shadow-md"
    >
      <div className="aspect-[16/10] bg-slate-100 overflow-hidden">
        <ActivityImage
          src={activity.image}
          alt={`${activity.title} - ${activity.typeLabel}`}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-primary-50 px-2.5 py-1 text-[11px] font-semibold text-primary-700">
            {activity.typeLabel}
          </span>
        </div>

        <h3 className="mt-2 font-bold text-slate-900 leading-snug line-clamp-2">
          {activity.title}
        </h3>

        {activity.description ? (
          <p className="mt-1 line-clamp-2 text-sm text-slate-500">{activity.description}</p>
        ) : null}

        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-400">
          <span>{formatDate(activity.date)}</span>
          <span className="font-medium text-primary-600">مشاهده جزئیات</span>
        </div>
      </div>
    </Link>
  );
}

