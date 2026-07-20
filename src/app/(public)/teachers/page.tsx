import { prisma } from "@/lib/prisma";
import Hero from "@/components/ui/Hero";
import { UserGroup } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function TeachersPage() {
  const teachers = await prisma.teacher.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div>
      <Hero title="اساتید هنرستان" subtitle="تیمی از بهترین و مجرب‌ترین اساتید هنر کشور" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        {teachers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {teachers.map((teacher) => (
              <div key={teacher.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-300 text-center p-6">
                <div className="w-28 h-28 mx-auto mb-5 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-[3px] border-white shadow-sm">
                  {teacher.image ? (
                    <img src={teacher.image} alt={teacher.name} loading="lazy" className="w-full h-full object-cover" />
                  ) : (
                    <UserGroup size={36} className="text-slate-400" />
                  )}
                </div>
                <h2 className="text-base font-bold mb-1.5 text-slate-800">{teacher.name}</h2>
                <p className="text-primary-600 font-medium text-xs mb-3">{teacher.title}</p>
                {teacher.specialty && (
                  <span className="inline-block px-2.5 py-0.5 bg-primary-50 text-primary-600 rounded text-[11px] font-medium mb-3">
                    {teacher.specialty}
                  </span>
                )}
                {teacher.bio && (
                  <p className="text-slate-500 text-xs leading-6">{teacher.bio}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-slate-400 py-20">
            <UserGroup size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="text-base text-slate-500">اطلاعات اساتید به زودی اضافه خواهد شد</p>
          </div>
        )}
      </div>
    </div>
  );
}
