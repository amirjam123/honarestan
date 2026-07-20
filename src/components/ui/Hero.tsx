import Link from "next/link";
import { ArrowLeft } from "@/components/icons";

interface HeroProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
}

export default function Hero({ title, subtitle, backgroundImage }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-[#0c1929]">
      {/* Background */}
      <div className="absolute inset-0">
        {backgroundImage && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-10"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
        )}
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-20 sm:pb-24 lg:pt-28 lg:pb-32">
        <div className="max-w-2xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-5 leading-[1.3] text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="text-base sm:text-lg text-slate-300 mb-8 leading-8 font-light">{subtitle}</p>
          )}
          <div className="flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-7 py-3 bg-white text-[#0c1929] rounded-lg font-semibold text-sm hover:bg-slate-50 transition-colors"
            >
              تماس با ما
              <ArrowLeft size={16} />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 px-7 py-3 border border-slate-500 text-slate-200 rounded-lg font-semibold text-sm hover:bg-white/5 transition-colors"
            >
              درباره ما
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
