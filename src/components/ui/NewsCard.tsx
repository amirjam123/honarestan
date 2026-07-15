import Link from "next/link";
import { Calendar, ArrowLeft } from "@/components/icons";

interface NewsCardProps {
  title: string;
  excerpt: string;
  image?: string | null;
  date: string;
  slug: string;
}

export default function NewsCard({ title, excerpt, image, date, slug }: NewsCardProps) {
  return (
    <Link
      href={`/news/${slug}`}
      className="group block bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all duration-300"
    >
      <div className="aspect-[16/10] bg-slate-100 relative overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            </div>
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-2.5">
          <Calendar size={14} />
          <span>{date}</span>
        </div>
        <h3 className="font-bold text-base mb-2 text-slate-900 group-hover:text-primary-700 transition-colors line-clamp-2 leading-7">
          {title}
        </h3>
        <p className="text-slate-500 text-sm leading-6 line-clamp-2">{excerpt}</p>
        <div className="flex items-center gap-1 text-primary-600 text-xs font-medium mt-3 group-hover:gap-2 transition-all">
          <span>ادامه مطلب</span>
          <ArrowLeft size={14} />
        </div>
      </div>
    </Link>
  );
}
