import { prisma } from "@/lib/prisma";
import Hero from "@/components/ui/Hero";
import Link from "next/link";
import { ArrowLeft, UserGroup, Globe, Heart } from "@/components/icons";

export const dynamic = "force-dynamic";

function renderMarkdown(text: string) {
  return text
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("## ")) return `<h2>${trimmed.slice(3)}</h2>`;
      if (trimmed.startsWith("### ")) return `<h3>${trimmed.slice(4)}</h3>`;
      if (trimmed.startsWith("- ")) return `<li>${trimmed.slice(2)}</li>`;
      if (trimmed === "") return "";
      return `<p>${trimmed}</p>`;
    })
    .filter(Boolean)
    .join("\n");
}

export default async function AboutPage() {
  const [schoolProfile, principalProfile, page, teachers] = await Promise.all([
    prisma.schoolProfile.findFirst({ where: { published: true } }),
    prisma.principalProfile.findFirst({ where: { published: true } }),
    prisma.page.findUnique({ where: { slug: "about" } }),
    prisma.teacher.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
      take: 3,
    }),
  ]);

  const hasProfile = !!schoolProfile;

  return (
    <div>
      <Hero title="درباره هنرستان هادی" subtitle="آشنایی با تاریخچه، ماموریت و ارزش‌های ما" />

      {/* Principal Welcome Message */}
      {principalProfile?.welcomeMessage && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="bg-gradient-to-br from-primary-50 to-white rounded-2xl border border-primary-100 p-8 lg:p-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {principalProfile.photo && (
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg flex-shrink-0">
                  <img src={principalProfile.photo} alt={principalProfile.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="text-center md:text-right">
                {principalProfile.name && (
                  <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mb-1">{principalProfile.name}</h2>
                )}
                {principalProfile.position && (
                  <p className="text-primary-600 text-sm font-medium mb-4">{principalProfile.position}</p>
                )}
                <p className="text-slate-600 leading-7 text-sm">{principalProfile.welcomeMessage}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Overview */}
      {schoolProfile?.overview && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="bg-white rounded-xl border border-slate-200 p-6 lg:p-10">
            <div className="prose-content" dangerouslySetInnerHTML={{ __html: renderMarkdown(schoolProfile.overview) }} />
          </div>
        </section>
      )}

      {/* Fallback: Page content if no SchoolProfile */}
      {!hasProfile && page?.content && (
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="bg-white rounded-xl border border-slate-200 p-6 lg:p-10">
            <div className="prose-content" dangerouslySetInnerHTML={{ __html: renderMarkdown(page.content) }} />
          </div>
        </section>
      )}

      {/* No data placeholder */}
      {!hasProfile && !page?.content && !principalProfile && (
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 text-center">
          <div className="bg-white rounded-xl border border-slate-200 p-10">
            <Globe size={48} className="text-slate-300 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-slate-700 mb-2">اطلاعات در حال بروزرسانی است</h2>
            <p className="text-slate-500 text-sm">محتوای این صفحه به زودی توسط مدیر سایت تکمیل خواهد شد.</p>
          </div>
        </section>
      )}

      {/* History */}
      {schoolProfile?.history && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-8 text-center">تاریخچه</h2>
          <div className="bg-white rounded-xl border border-slate-200 p-6 lg:p-10">
            <div className="prose-content" dangerouslySetInnerHTML={{ __html: renderMarkdown(schoolProfile.history) }} />
          </div>
        </section>
      )}

      {/* Vision & Mission */}
      {(schoolProfile?.vision || schoolProfile?.mission) && (
        <section className="bg-slate-50 py-16 lg:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {schoolProfile?.vision && (
                <div className="bg-white rounded-xl border border-slate-200 p-6 lg:p-8">
                  <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center mb-4">
                    <Globe size={22} className="text-primary-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4">چشم‌انداز</h3>
                  <div className="prose-content" dangerouslySetInnerHTML={{ __html: renderMarkdown(schoolProfile.vision) }} />
                </div>
              )}
              {schoolProfile?.mission && (
                <div className="bg-white rounded-xl border border-slate-200 p-6 lg:p-8">
                  <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center mb-4">
                    <Heart size={22} className="text-amber-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4">ماموریت</h3>
                  <div className="prose-content" dangerouslySetInnerHTML={{ __html: renderMarkdown(schoolProfile.mission) }} />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Educational Goals */}
      {schoolProfile?.educationalGoals && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-8 text-center">اهداف آموزشی</h2>
          <div className="bg-white rounded-xl border border-slate-200 p-6 lg:p-10">
            <div className="prose-content" dangerouslySetInnerHTML={{ __html: renderMarkdown(schoolProfile.educationalGoals) }} />
          </div>
        </section>
      )}

      {/* Departments */}
      {schoolProfile?.departments && (
        <section className="bg-slate-50 py-16 lg:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-8 text-center">دپارتمان‌ها</h2>
            <div className="bg-white rounded-xl border border-slate-200 p-6 lg:p-10">
              <div className="prose-content" dangerouslySetInnerHTML={{ __html: renderMarkdown(schoolProfile.departments) }} />
            </div>
          </div>
        </section>
      )}

      {/* Facilities */}
      {schoolProfile?.facilities && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-8 text-center">امکانات</h2>
          <div className="bg-white rounded-xl border border-slate-200 p-6 lg:p-10">
            <div className="prose-content" dangerouslySetInnerHTML={{ __html: renderMarkdown(schoolProfile.facilities) }} />
          </div>
        </section>
      )}

      {/* Principal Biography */}
      {principalProfile?.biography && (
        <section className="bg-slate-50 py-16 lg:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-8 text-center">درباره مدیر</h2>
            <div className="bg-white rounded-xl border border-slate-200 p-6 lg:p-10">
              <div className="flex flex-col md:flex-row gap-8">
                {principalProfile.photo && (
                  <div className="w-40 h-48 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0 mx-auto md:mx-0">
                    <img src={principalProfile.photo} alt={principalProfile.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div>
                  {principalProfile.name && <h3 className="text-lg font-bold text-slate-900 mb-1">{principalProfile.name}</h3>}
                  {principalProfile.position && <p className="text-primary-600 text-sm mb-4">{principalProfile.position}</p>}
                  <div className="prose-content" dangerouslySetInnerHTML={{ __html: renderMarkdown(principalProfile.biography) }} />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Teachers Preview */}
      {teachers.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center mb-10">
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-3">اساتید ما</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {teachers.map((teacher) => (
              <div key={teacher.id} className="bg-white rounded-xl border border-slate-200 p-6 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                  {teacher.image ? (
                    <img src={teacher.image} alt={teacher.name} loading="lazy" className="w-full h-full object-cover" />
                  ) : (
                    <UserGroup size={28} className="text-slate-400" />
                  )}
                </div>
                <h3 className="font-bold text-sm text-slate-800">{teacher.name}</h3>
                <p className="text-primary-600 text-xs">{teacher.title}</p>
                {teacher.specialty && <p className="text-slate-400 text-[11px] mt-1">{teacher.specialty}</p>}
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/teachers"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm"
            >
              مشاهده همه اساتید
              <ArrowLeft size={16} />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
