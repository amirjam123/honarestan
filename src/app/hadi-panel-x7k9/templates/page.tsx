"use client";

import { Download, Document } from "@/components/icons";

const templates = [
  {
    key: "teachers",
    name: "اساتید",
    description: "قالب ورود اطلاعات اساتید و مدرسین",
    fields: ["نام", "عنوان", "تخصص", "بیوگرافی", "تصویر", "ترتیب"],
    requiredFields: ["نام", "عنوان"],
  },
  {
    key: "courses",
    name: "دوره‌ها",
    description: "قالب ورود دوره‌های آموزشی",
    fields: ["عنوان", "توضیحات", "مدت", "سطح", "تصویر", "ترتیب"],
    requiredFields: ["عنوان", "توضیحات"],
  },
  {
    key: "news",
    name: "اخبار",
    description: "قالب ورود اخبار و اطلاعیه‌ها",
    fields: ["عنوان", "خلاصه", "متن", "اسلاگ", "تصویر"],
    requiredFields: ["عنوان", "متن"],
  },
  {
    key: "events",
    name: "رویدادها",
    description: "قالب ورود رویدادها و برنامه‌ها",
    fields: ["عنوان", "توضیحات", "تاریخ", "مکان", "تصویر"],
    requiredFields: ["عنوان", "توضیحات", "تاریخ"],
  },
  {
    key: "gallery",
    name: "گالری",
    description: "قالب ورود تصاویر گالری",
    fields: ["عنوان", "توضیحات", "تصویر", "دسته‌بندی"],
    requiredFields: ["عنوان", "تصویر"],
  },
  {
    key: "student-works",
    name: "آثار هنرجویان",
    description: "قالب ورود آثار هنرجویان",
    fields: ["عنوان", "نام هنرجو", "توضیحات", "تصویر", "دسته‌بندی", "سال"],
    requiredFields: ["عنوان", "نام هنرجو", "تصویر"],
  },
];

export default function AdminTemplatesPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">قالب‌های اکسل</h1>
          <p className="text-xs text-slate-500 mt-1">دانلود قالب‌های آماده برای ورود اطلاعات</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <div key={template.key} className="admin-card hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Document size={18} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800">{template.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{template.description}</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-[11px] text-slate-400 mb-2">فیلدهای قالب:</p>
              <div className="flex flex-wrap gap-1.5">
                {template.fields.map((field) => (
                  <span
                    key={field}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                      template.requiredFields.includes(field)
                        ? "bg-red-50 text-red-600"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {field}
                    {template.requiredFields.includes(field) && " *"}
                  </span>
                ))}
              </div>
            </div>

            <a
              href={`/templates/${template.key}-template.xlsx`}
              download
              className="admin-btn-primary w-full flex items-center justify-center gap-2 text-xs"
            >
              <Download size={14} />
              دانلود قالب
            </a>
          </div>
        ))}
      </div>

      <div className="admin-card mt-6">
        <h2 className="text-sm font-bold mb-3 text-slate-800">راهنمای استفاده</h2>
        <div className="space-y-2 text-xs text-slate-600">
          <p>۱. قالب مورد نظر خود را دانلود کنید</p>
          <p>۲. فیلدهای الزامی با علامت * مشخص شده‌اند</p>
          <p>۳. ردیف دوم نشان‌دهنده فیلدهای الزامی/اختیاری است</p>
          <p>۴. ردیف سوم توضیحات هر فیلد را نشان می‌دهد</p>
          <p>۵. ردیف چهارم نمونه‌ای از داده صحیح است</p>
          <p>۶. پس از تکمیل، فایل را در صفحه مربوطه آپلود کنید</p>
        </div>
      </div>
    </div>
  );
}
