"use client";

import { useState } from "react";
import Hero from "@/components/ui/Hero";
import { LocationMarker, Phone, Envelope, CheckCircle, XCircle, Loader, Send } from "@/components/icons";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div>
      <Hero title="تماس با ما" subtitle="با ما در ارتباط باشید" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Contact info */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-6 text-slate-900">اطلاعات تماس</h2>
            <div className="space-y-5">
              {[
                { icon: LocationMarker, title: "آدرس", value: "تهران، خیابان نمونه، کوچه نمونه، پلاک ۱۲۳" },
                { icon: Phone, title: "تلفن", value: "۰۲۱-۱۲۳۴۵۶۷۸", ltr: true },
                { icon: Envelope, title: "ایمیل", value: "info@honarestan-hadi.ir", ltr: true },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3.5">
                  <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <item.icon size={18} className="text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-slate-800 mb-0.5">{item.title}</h3>
                    <p className="text-slate-500 text-sm" dir={item.ltr ? "ltr" : undefined}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-6 lg:p-8">
            <h2 className="text-xl font-bold mb-5 text-slate-900">پیام بفرستید</h2>
            {status === "success" ? (
              <div className="text-center py-12">
                <CheckCircle size={48} className="mx-auto mb-4 text-emerald-500" />
                <p className="text-lg font-bold text-emerald-600">پیام شما با موفقیت ارسال شد</p>
                <p className="text-slate-500 text-sm mt-2">به زودی با شما تماس خواهیم گرفت</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-xs font-medium text-slate-600 mb-1.5">نام و نام خانوادگی *</label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="admin-input"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-xs font-medium text-slate-600 mb-1.5">ایمیل *</label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="admin-input"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-xs font-medium text-slate-600 mb-1.5">شماره تلفن</label>
                    <input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="admin-input"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-xs font-medium text-slate-600 mb-1.5">موضوع</label>
                    <input
                      id="subject"
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="admin-input"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="message" className="block text-xs font-medium text-slate-600 mb-1.5">پیام شما *</label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="admin-input resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full admin-btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {status === "loading" ? (
                    <>
                      <Loader size={16} />
                      در حال ارسال...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      ارسال پیام
                    </>
                  )}
                </button>
                {status === "error" && (
                  <div className="flex items-center gap-2 text-red-600 text-sm justify-center">
                    <XCircle size={16} />
                    <span>خطا در ارسال پیام. لطفاً دوباره تلاش کنید.</span>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
