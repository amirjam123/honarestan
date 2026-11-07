import Link from "next/link";
import { ActivityCard } from "./ActivityCard";
import { Activity, activityHref } from "../../lib/activities";

const PAGE_SIZE = 12;

export default function ActivitiesList({
  activities,
  pageNumber,
  totalCount,
  hasPreviousPage,
  hasNextPage,
}: {
  activities: Activity[];
  pageNumber: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}) {
  const startIndex = (pageNumber - 1) * PAGE_SIZE;
  const paginatedActivities = activities.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {paginatedActivities.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            href={activityHref(activity)}
          />
        ))}
      </div>

      {hasPreviousPage || hasNextPage ? (
        <div className="mt-10 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {hasPreviousPage
              ? `صفحه ${pageNumber} از ${Math.ceil(totalCount / PAGE_SIZE)}`
              : `صفحه ${pageNumber}`}
          </p>
          <div className="flex gap-2">
            {hasPreviousPage ? (
              <Link
                href={{
                  pathname: "/activities",
                  query: { page: String(pageNumber - 1) },
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                قبلی
              </Link>
            ) : (
              <span className="text-sm text-slate-400">قبلی</span>
            )}
            {hasNextPage ? (
              <Link
                href={{
                  pathname: "/activities",
                  query: { page: String(pageNumber + 1) },
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                بعدی
              </Link>
            ) : (
              <span className="text-sm text-slate-400">بعدی</span>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
