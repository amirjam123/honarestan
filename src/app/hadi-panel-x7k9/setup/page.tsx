"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Lock, Upload, AcademicCap, Phone, Home, User, BookOpen,
  UserGroup, Megaphone, CheckCircle, ExclamationTriangle,
  ArrowLeft, ArrowRight, Loader, Globe, Eye,
} from "@/components/icons";
import { getAdminPath } from "@/lib/admin-config";

interface SetupSteps {
  changePassword: boolean;
  uploadLogo: boolean;
  schoolName: boolean;
  contactInfo: boolean;
  homepage: boolean;
  principalProfile: boolean;
  schoolProfile: boolean;
  firstTeacher: boolean;
  firstCourse: boolean;
  firstNews: boolean;
  verifyWebsite: boolean;
}

interface SetupStatus {
  setupComplete: boolean;
  steps: SetupSteps;
  completedCount: number;
  totalSteps: number;
  progress: number;
}

const STEP_DEFINITIONS = [
  { key: "changePassword", label: "تغییر رمز عبور", icon: Lock, description: "رمز عبور پیش‌فرض را تغییر دهید" },
  { key: "uploadLogo", label: "آپلود لوگو", icon: Upload, description: "لوگوی مدرسه را آپلود کنید" },
  { key: "schoolName", label: "نام مدرسه", icon: AcademicCap, description: "نام مدرسه را تنظیم کنید" },
  { key: "contactInfo", label: "اطلاعات تماس", icon: Phone, description: "آدرس، تلفن و ایمیل" },
  { key: "homepage", label: "صفحه اصلی", icon: Home, description: "بنر اصلی و محتوای صفحه نخست" },
  { key: "principalProfile", label: "پروفایل مدیر", icon: User, description: "اطلاعات مدیر مدرسه" },
  { key: "schoolProfile", label: "پروفایل هنرستان", icon: BookOpen, description: "مرور و تاریخچه مدرسه" },
  { key: "firstTeacher", label: "اولین استاد", icon: UserGroup, description: "ثبت اطلاعات یک استاد" },
  { key: "firstCourse", label: "اولین دوره", icon: BookOpen, description: "ایجاد یک دوره آموزشی" },
  { key: "firstNews", label: "اولین خبر", icon: Megaphone, description: "انتشار اولین خبر" },
  { key: "verifyWebsite", label: "بررسی سایت", icon: Eye, description: "مشاهده سایت عمومی" },
] as const;

function PasswordStrengthBar({ score }: { score: number }) {
  const getColor = (barIndex: number) => {
    if (barIndex >= score) return "bg-slate-200";
    if (score <= 1) return "bg-red-400";
    if (score <= 2) return "bg-amber-400";
    return "bg-emerald-400";
  };

  return (
    <div className="flex gap-1" role="img" aria-label={`قدرت رمز عبور: ${score} از ۴`}>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${getColor(i)}`} />
      ))}
    </div>
  );
}

function StepError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600" role="alert">
      <ExclamationTriangle size={14} className="flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export default function SetupWizardPage() {
  const router = useRouter();
  const stepContentRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<SetupStatus | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);

  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: "" });
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [principal, setPrincipal] = useState({ name: "", position: "", welcomeMessage: "", biography: "" });
  const [schoolData, setSchoolData] = useState({ overview: "", history: "", departments: "" });
  const [teacher, setTeacher] = useState({ name: "", title: "", specialty: "", bio: "" });
  const [course, setCourse] = useState({ title: "", description: "", duration: "", level: "beginner" });
  const [news, setNews] = useState({ title: "", excerpt: "", content: "" });
  const [uploading, setUploading] = useState(false);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/setup/status");
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
        const firstIncomplete = STEP_DEFINITIONS.findIndex(
          (s) => !data.steps[s.key as keyof SetupSteps]
        );
        setCurrentStep(firstIncomplete >= 0 ? firstIncomplete : 0);
      }
    } catch (error) {
      console.error("Failed to fetch setup status:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  useEffect(() => {
    if (!status) return;
    const stepKey = STEP_DEFINITIONS[currentStep]?.key;
    if (["schoolName", "contactInfo", "homepage", "uploadLogo"].includes(stepKey)) {
      fetch("/api/settings").then((r) => r.ok ? r.json() : {}).then((data) => setSettings(data)).catch(() => {});
    }
    if (stepKey === "principalProfile") {
      fetch("/api/principal").then((r) => r.ok ? r.json() : null).then((data) => { if (data) setPrincipal(data); }).catch(() => {});
    }
    if (stepKey === "schoolProfile") {
      fetch("/api/school").then((r) => r.ok ? r.json() : null).then((data) => { if (data) setSchoolData(data); }).catch(() => {});
    }
  }, [currentStep, status]);

  // Password strength — mirrors server-side scoring from password.ts (0-4, valid >= 3)
  useEffect(() => {
    if (!passwords.new) { setPasswordStrength({ score: 0, feedback: "" }); return; }
    let score = 0;
    const fb: string[] = [];
    if (passwords.new.length >= 8) score++; else fb.push("حداقل ۸ کاراکتر");
    if (/[A-Z]/.test(passwords.new)) score++; else fb.push("حداقل یک حرف بزرگ");
    if (/[a-z]/.test(passwords.new)) score++; else fb.push("حداقل یک حرف کوچک");
    if (/[0-9]/.test(passwords.new)) score++; else fb.push("حداقل یک عدد");
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwords.new)) {
      score = Math.min(score + 1, 4);
    }
    const commonPasswords = ["password", "123456", "12345678", "qwerty", "abc123", "password123", "admin", "letmein", "welcome", "monkey"];
    if (commonPasswords.includes(passwords.new.toLowerCase())) {
      score = 0;
      fb.length = 0;
      fb.push("این رمز عبور بسیار رایج است");
    }
    let label = "بسیار ضعیف";
    if (score === 1) label = "ضعیف";
    else if (score === 2) label = "متوسط";
    else if (score === 3) label = "خوب";
    else if (score >= 4) label = "عالی";
    setPasswordStrength({ score, feedback: fb.length > 0 ? `${label} — ${fb.join(", ")}` : label });
  }, [passwords.new]);

  // Clear error when step changes
  useEffect(() => {
    setStepError(null);
    setSuccess(false);
  }, [currentStep]);

  // Focus step content on step change for screen readers
  useEffect(() => {
    stepContentRef.current?.focus({ preventScroll: false });
  }, [currentStep]);

  const handlePasswordChange = async (): Promise<boolean> => {
    // Client-side validation
    if (!passwords.current) {
      setStepError("رمز عبور فعلی را وارد کنید");
      return false;
    }
    if (!passwords.new) {
      setStepError("رمز عبور جدید را وارد کنید");
      return false;
    }
    if (passwords.new !== passwords.confirm) {
      setStepError("رمزهای عبور مطابقت ندارند");
      return false;
    }
    if (passwords.new.length < 8) {
      setStepError("رمز عبور جدید باید حداقل ۸ کاراکتر باشد");
      return false;
    }
    if (passwordStrength.score < 3) {
      setStepError("رمز عبور جدید به اندازه کافی قوی نیست");
      return false;
    }

    setSaving(true);
    setStepError(null);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.new }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setPasswords({ current: "", new: "", confirm: "" });
        setPasswordStrength({ score: 0, feedback: "" });
        setTimeout(() => setSuccess(false), 3000);
        return true;
      }
      setStepError(data.error || "خطا در تغییر رمز عبور");
      return false;
    } catch {
      setStepError("خطا در اتصال به سرور");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async (keys: Record<string, string>): Promise<boolean> => {
    setSaving(true);
    setStepError(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(keys),
      });
      if (res.ok) {
        setSettings((prev) => ({ ...prev, ...keys }));
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
        return true;
      }
      setStepError("خطا در ذخیره تنظیمات");
      return false;
    } catch {
      setStepError("خطا در اتصال به سرور");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSavePrincipal = async (): Promise<boolean> => {
    setSaving(true);
    setStepError(null);
    try {
      const res = await fetch("/api/principal", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...principal, published: true }),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
        return true;
      }
      setStepError("خطا در ذخیره اطلاعات مدیر");
      return false;
    } catch {
      setStepError("خطا در اتصال به سرور");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSchool = async (): Promise<boolean> => {
    setSaving(true);
    setStepError(null);
    try {
      const res = await fetch("/api/school", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...schoolData, published: true }),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
        return true;
      }
      setStepError("خطا در ذخیره اطلاعات مدرسه");
      return false;
    } catch {
      setStepError("خطا در اتصال به سرور");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleCreateTeacher = async (): Promise<boolean> => {
    if (!teacher.name || !teacher.title) {
      setStepError("نام و سمت استاد الزامی است");
      return false;
    }
    setSaving(true);
    setStepError(null);
    try {
      const res = await fetch("/api/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...teacher, sortOrder: 0, published: true }),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
        return true;
      }
      setStepError("خطا در ثبت استاد");
      return false;
    } catch {
      setStepError("خطا در اتصال به سرور");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleCreateCourse = async (): Promise<boolean> => {
    if (!course.title || !course.description) {
      setStepError("عنوان و توضیحات دوره الزامی است");
      return false;
    }
    setSaving(true);
    setStepError(null);
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...course, sortOrder: 0, published: true }),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
        return true;
      }
      setStepError("خطا در ثبت دوره");
      return false;
    } catch {
      setStepError("خطا در اتصال به سرور");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNews = async (): Promise<boolean> => {
    if (!news.title || !news.content) {
      setStepError("عنوان و متن خبر الزامی است");
      return false;
    }
    setSaving(true);
    setStepError(null);
    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...news, published: true }),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
        return true;
      }
      setStepError("خطا در ثبت خبر");
      return false;
    } catch {
      setStepError("خطا در اتصال به سرور");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setStepError(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        setSettings((prev) => ({ ...prev, logo_url: data.url }));
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
      } else {
        setStepError("خطا در آپلود فایل");
      }
    } catch {
      setStepError("خطا در اتصال به سرور");
    } finally {
      setUploading(false);
    }
  };

  const handleCompleteSetup = async () => {
    setSaving(true);
    try {
      await fetch("/api/setup/complete", { method: "POST" });
      router.push(getAdminPath());
    } catch {
      setSaving(false);
      setStepError("خطا در تکمیل راه‌اندازی");
    }
  };

  const handleSkip = async () => {
    setSaving(true);
    try {
      await fetch("/api/setup/skip", { method: "POST" });
      router.push(getAdminPath());
    } catch {
      setSaving(false);
      setStepError("خطا در رد کردن راه‌اندازی");
    }
  };

  const goNext = async () => {
    const stepKey = STEP_DEFINITIONS[currentStep]?.key;
    let saved = false;

    if (stepKey === "changePassword") {
      if (passwords.current && passwords.new && passwords.confirm) {
        saved = await handlePasswordChange();
      }
    } else if (stepKey === "uploadLogo") {
      if (settings["logo_url"]) {
        saved = await handleSaveSettings({ logo_url: settings["logo_url"] });
      }
    } else if (stepKey === "schoolName") {
      if (settings["school_name"]?.trim()) {
        saved = await handleSaveSettings({ school_name: settings["school_name"] });
      }
    } else if (stepKey === "contactInfo") {
      if (settings["address"]?.trim() || settings["phone"]?.trim() || settings["email"]?.trim()) {
        saved = await handleSaveSettings({
          address: settings["address"] || "",
          phone: settings["phone"] || "",
          email: settings["email"] || "",
        });
      }
    } else if (stepKey === "homepage") {
      if (settings["hero_title"]?.trim() || settings["hero_subtitle"]?.trim()) {
        saved = await handleSaveSettings({ hero_title: settings["hero_title"] || "", hero_subtitle: settings["hero_subtitle"] || "" });
      }
    } else if (stepKey === "principalProfile") {
      if (principal.name?.trim()) {
        saved = await handleSavePrincipal();
      }
    } else if (stepKey === "schoolProfile") {
      if (schoolData.overview?.trim() || schoolData.history?.trim()) {
        saved = await handleSaveSchool();
      }
    } else if (stepKey === "firstTeacher") {
      if (teacher.name?.trim() && teacher.title?.trim()) {
        saved = await handleCreateTeacher();
      }
    } else if (stepKey === "firstCourse") {
      if (course.title?.trim() && course.description?.trim()) {
        saved = await handleCreateCourse();
      }
    } else if (stepKey === "firstNews") {
      if (news.title?.trim() && news.content?.trim()) {
        saved = await handleCreateNews();
      }
    }

    await fetchStatus();
    if (currentStep < STEP_DEFINITIONS.length - 1) setCurrentStep((prev) => prev + 1);
  };

  const goPrev = () => { if (currentStep > 0) setCurrentStep((prev) => prev - 1); };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      goNext();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader size={24} className="text-primary-600 animate-spin" />
        <span className="mr-3 text-sm text-slate-500">در حال بارگذاری...</span>
      </div>
    );
  }

  const current = STEP_DEFINITIONS[currentStep];
  const progress = status ? status.progress : 0;
  const isLastStep = currentStep === STEP_DEFINITIONS.length - 1;
  const stepComplete = status?.steps[current.key as keyof SetupSteps];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8 relative">
        <button
          onClick={() => setShowSkipConfirm(true)}
          className="absolute top-0 left-0 text-xs text-slate-400 hover:text-slate-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100"
        >
          رد کردن راه‌اندازی
        </button>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium mb-3">
          <Globe size={14} />
          راه‌اندازی اولیه
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">جادوی راه‌اندازی</h1>
        <p className="text-sm text-slate-500">مراحل زیر را برای تکمیل راه‌اندازی سایت دنبال کنید. می‌توانید هر زمان خواستید از این صفحه خارج شوید.</p>
      </div>

      <div className="admin-card mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-700">پیشرفت کلی</span>
          <span className="text-sm font-bold text-primary-600">{status?.completedCount || 0} از {status?.totalSteps || 11}</span>
        </div>
        <div
          className="w-full h-2 bg-slate-100 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`پیشرفت راه‌اندازی: ${progress} درصد`}
        >
          <div className="h-full bg-gradient-to-l from-primary-500 to-primary-600 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="admin-card mb-6 overflow-x-auto" role="tablist" aria-label="مراحل راه‌اندازی">
        <div className="flex gap-1.5 min-w-max pb-1">
          {STEP_DEFINITIONS.map((step, i) => {
            const StepIcon = step.icon;
            const isComplete = status?.steps[step.key as keyof SetupSteps];
            const isCurrent = i === currentStep;
            return (
              <button
                key={step.key}
                role="tab"
                aria-selected={isCurrent}
                aria-label={`${step.label}${isComplete ? " (تکمیل شده)" : " (در انتظار)"}`}
                onClick={() => { setCurrentStep(i); setStepError(null); }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap ${
                  isCurrent
                    ? "bg-primary-600 text-white shadow-sm"
                    : isComplete
                      ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                }`}
              >
                {isComplete ? (
                  <CheckCircle size={14} className={isCurrent ? "text-white" : "text-emerald-500"} />
                ) : (
                  <StepIcon size={14} />
                )}
                <span>{step.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="admin-card" role="tabpanel" aria-label={current.label}>
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stepComplete ? "bg-emerald-50 text-emerald-600" : "bg-primary-50 text-primary-600"}`}>
            {stepComplete ? <CheckCircle size={20} /> : <current.icon size={20} />}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{current.label}</h2>
            <p className="text-xs text-slate-500">{current.description}</p>
          </div>
          {stepComplete && (
            <span className="mr-auto px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[11px] font-medium">
              تکمیل شده
            </span>
          )}
        </div>

        <div ref={stepContentRef} tabIndex={-1} className="min-h-[280px] outline-none" onKeyDown={handleKeyDown}>
          <StepError message={stepError} />

          {current.key === "changePassword" && (
            <div className="space-y-4 max-w-md mt-4">
              <p className="text-xs text-slate-500 mb-4">
                رمز عبور پیش‌‌فرض (
                <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">Hadi1234</code>
                ) را به رمزی امن تغییر دهید.
              </p>
              <div>
                <label htmlFor="setup-current-pw" className="block text-xs font-medium text-slate-600 mb-1.5">
                  رمز عبور فعلی <span className="text-red-500">*</span>
                </label>
                <input
                  id="setup-current-pw"
                  type="password"
                  autoComplete="current-password"
                  aria-required="true"
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  className="admin-input"
                  placeholder="رمز عبور فعلی را وارد کنید"
                />
              </div>
              <div>
                <label htmlFor="setup-new-pw" className="block text-xs font-medium text-slate-600 mb-1.5">
                  رمز عبور جدید <span className="text-red-500">*</span>
                </label>
                <input
                  id="setup-new-pw"
                  type="password"
                  autoComplete="new-password"
                  aria-required="true"
                  aria-describedby={passwords.new ? "pw-strength-desc" : undefined}
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                  className="admin-input"
                  placeholder="حداقل ۸ کاراکتر"
                />
                {passwords.new && (
                  <div className="mt-2" id="pw-strength-desc">
                    <PasswordStrengthBar score={passwordStrength.score} />
                    <p className="text-[11px] text-slate-500 mt-1" aria-live="polite">{passwordStrength.feedback}</p>
                  </div>
                )}
              </div>
              <div>
                <label htmlFor="setup-confirm-pw" className="block text-xs font-medium text-slate-600 mb-1.5">
                  تکرار رمز عبور جدید <span className="text-red-500">*</span>
                </label>
                <input
                  id="setup-confirm-pw"
                  type="password"
                  autoComplete="new-password"
                  aria-required="true"
                  aria-invalid={passwords.confirm !== "" && passwords.new !== passwords.confirm}
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  className={`admin-input ${passwords.confirm && passwords.new !== passwords.confirm ? "border-red-400 focus:ring-red-500" : ""}`}
                  placeholder="تکرار رمز عبور جدید"
                />
                {passwords.confirm && passwords.new !== passwords.confirm && (
                  <p className="text-[11px] text-red-500 mt-1" role="alert">رمزها مطابقت ندارند</p>
                )}
              </div>
            </div>
          )}

          {current.key === "uploadLogo" && (
            <div className="space-y-4 max-w-md mt-4">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  {settings.logo_url ? (
                    <div className="w-24 h-24 rounded-xl border-2 border-slate-200 overflow-hidden bg-white flex items-center justify-center">
                      <img src={settings.logo_url} alt="لوگوی مدرسه" className="max-w-full max-h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center">
                      <Upload size={24} className="text-slate-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <label className={`admin-btn-secondary cursor-pointer flex items-center gap-2 ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
                    <Upload size={16} />
                    {uploading ? "در حال آپلود..." : "انتخاب فایل"}
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" disabled={uploading} aria-label="انتخاب فایل لوگو" />
                  </label>
                  <p className="text-[11px] text-slate-400 mt-2">فرمت‌های مجاز: PNG, JPG, SVG</p>
                  <div className="mt-3">
                    <label htmlFor="setup-logo-url" className="block text-xs font-medium text-slate-600 mb-1.5">یا آدرس URL تصویر</label>
                    <input
                      id="setup-logo-url"
                      type="url"
                      placeholder="https://example.com/logo.png"
                      value={settings.logo_url || ""}
                      onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                      className="admin-input"
                      dir="ltr"
                      aria-label="آدرس URL لوگو"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {current.key === "schoolName" && (
            <div className="space-y-4 max-w-md mt-4">
              <div>
                <label htmlFor="setup-school-name" className="block text-xs font-medium text-slate-600 mb-1.5">
                  نام مدرسه <span className="text-red-500">*</span>
                </label>
                <input
                  id="setup-school-name"
                  type="text"
                  placeholder="مثلاً: هنرستان هادی"
                  value={settings.school_name || ""}
                  onChange={(e) => setSettings({ ...settings, school_name: e.target.value })}
                  className="admin-input"
                  aria-required="true"
                />
                <p className="text-[11px] text-slate-400 mt-1">نامی که در هدر و سرتیترها نمایش داده می‌شود</p>
              </div>
            </div>
          )}

          {current.key === "contactInfo" && (
            <div className="space-y-4 max-w-md mt-4">
              <div>
                <label htmlFor="setup-address" className="block text-xs font-medium text-slate-600 mb-1.5">
                  آدرس <span className="text-red-500">*</span>
                </label>
                <input
                  id="setup-address"
                  type="text"
                  placeholder="تهران، خیابان نمونه"
                  value={settings.address || ""}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="admin-input"
                  aria-required="true"
                />
              </div>
              <div>
                <label htmlFor="setup-phone" className="block text-xs font-medium text-slate-600 mb-1.5">
                  تلفن <span className="text-red-500">*</span>
                </label>
                <input
                  id="setup-phone"
                  type="tel"
                  placeholder="شماره تلفن"
                  value={settings.phone || ""}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="admin-input"
                  dir="ltr"
                  aria-required="true"
                />
              </div>
              <div>
                <label htmlFor="setup-email" className="block text-xs font-medium text-slate-600 mb-1.5">
                  ایمیل <span className="text-red-500">*</span>
                </label>
                <input
                  id="setup-email"
                  type="email"
                  placeholder="info@example.com"
                  value={settings.email || ""}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="admin-input"
                  dir="ltr"
                  aria-required="true"
                />
              </div>
            </div>
          )}

          {current.key === "homepage" && (
            <div className="space-y-4 max-w-md mt-4">
              <div>
                <label htmlFor="setup-hero-title" className="block text-xs font-medium text-slate-600 mb-1.5">عنوان بنر اصلی</label>
                <input
                  id="setup-hero-title"
                  type="text"
                  placeholder="مثلاً: هنرستان هادی"
                  value={settings.hero_title || ""}
                  onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })}
                  className="admin-input"
                />
              </div>
              <div>
                <label htmlFor="setup-hero-subtitle" className="block text-xs font-medium text-slate-600 mb-1.5">زیرعنوان بنر اصلی</label>
                <input
                  id="setup-hero-subtitle"
                  type="text"
                  placeholder="مثلاً: مرکز آموزش هنرهای زیبا"
                  value={settings.hero_subtitle || ""}
                  onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })}
                  className="admin-input"
                />
              </div>
            </div>
          )}

          {current.key === "principalProfile" && (
            <div className="space-y-4 max-w-lg mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="setup-principal-name" className="block text-xs font-medium text-slate-600 mb-1.5">
                    نام <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="setup-principal-name"
                    type="text"
                    value={principal.name}
                    onChange={(e) => setPrincipal({ ...principal, name: e.target.value })}
                    className="admin-input"
                    placeholder="نام و نام خانوادگی"
                    aria-required="true"
                  />
                </div>
                <div>
                  <label htmlFor="setup-principal-position" className="block text-xs font-medium text-slate-600 mb-1.5">سمت</label>
                  <input
                    id="setup-principal-position"
                    type="text"
                    value={principal.position}
                    onChange={(e) => setPrincipal({ ...principal, position: e.target.value })}
                    className="admin-input"
                    placeholder="مثلاً: مدیر هنرستان"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="setup-principal-welcome" className="block text-xs font-medium text-slate-600 mb-1.5">پیام خوش‌آمدگویی</label>
                <textarea
                  id="setup-principal-welcome"
                  value={principal.welcomeMessage}
                  onChange={(e) => setPrincipal({ ...principal, welcomeMessage: e.target.value })}
                  className="admin-input resize-none"
                  rows={3}
                  placeholder="متن پیام خوش‌آمدگویی برای بازدیدکنندگان"
                />
              </div>
              <div>
                <label htmlFor="setup-principal-bio" className="block text-xs font-medium text-slate-600 mb-1.5">زندگینامه</label>
                <textarea
                  id="setup-principal-bio"
                  value={principal.biography}
                  onChange={(e) => setPrincipal({ ...principal, biography: e.target.value })}
                  className="admin-input resize-none"
                  rows={3}
                  placeholder="خلاصه‌ای از سوابق مدیر مدرسه"
                />
              </div>
            </div>
          )}

          {current.key === "schoolProfile" && (
            <div className="space-y-4 max-w-lg mt-4">
              <div>
                <label htmlFor="setup-school-overview" className="block text-xs font-medium text-slate-600 mb-1.5">مرور کلی</label>
                <textarea
                  id="setup-school-overview"
                  value={schoolData.overview}
                  onChange={(e) => setSchoolData({ ...schoolData, overview: e.target.value })}
                  className="admin-input resize-none"
                  rows={4}
                  placeholder="توضیحات کلی درباره هنرستان"
                />
              </div>
              <div>
                <label htmlFor="setup-school-history" className="block text-xs font-medium text-slate-600 mb-1.5">تاریخچه</label>
                <textarea
                  id="setup-school-history"
                  value={schoolData.history}
                  onChange={(e) => setSchoolData({ ...schoolData, history: e.target.value })}
                  className="admin-input resize-none"
                  rows={3}
                  placeholder="تاریخچه تأسیس و فعالیت هنرستان"
                />
              </div>
              <div>
                <label htmlFor="setup-school-depts" className="block text-xs font-medium text-slate-600 mb-1.5">دپارتمان‌ها</label>
                <textarea
                  id="setup-school-depts"
                  value={schoolData.departments}
                  onChange={(e) => setSchoolData({ ...schoolData, departments: e.target.value })}
                  className="admin-input resize-none"
                  rows={2}
                  placeholder="مثال: نقاشی، خوشنویسی، موسیقی"
                />
              </div>
            </div>
          )}

          {current.key === "firstTeacher" && (
            <div className="space-y-4 max-w-lg mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="setup-teacher-name" className="block text-xs font-medium text-slate-600 mb-1.5">
                    نام <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="setup-teacher-name"
                    type="text"
                    value={teacher.name}
                    onChange={(e) => setTeacher({ ...teacher, name: e.target.value })}
                    className="admin-input"
                    placeholder="نام کامل استاد"
                    aria-required="true"
                  />
                </div>
                <div>
                  <label htmlFor="setup-teacher-title" className="block text-xs font-medium text-slate-600 mb-1.5">
                    سمت <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="setup-teacher-title"
                    type="text"
                    value={teacher.title}
                    onChange={(e) => setTeacher({ ...teacher, title: e.target.value })}
                    className="admin-input"
                    placeholder="مثلاً: استاد نقاشی"
                    aria-required="true"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="setup-teacher-specialty" className="block text-xs font-medium text-slate-600 mb-1.5">تخصص</label>
                <input
                  id="setup-teacher-specialty"
                  type="text"
                  value={teacher.specialty}
                  onChange={(e) => setTeacher({ ...teacher, specialty: e.target.value })}
                  className="admin-input"
                  placeholder="مثلاً: نقاشی رنگ روغن"
                />
              </div>
              <div>
                <label htmlFor="setup-teacher-bio" className="block text-xs font-medium text-slate-600 mb-1.5">بیوگرافی</label>
                <textarea
                  id="setup-teacher-bio"
                  value={teacher.bio}
                  onChange={(e) => setTeacher({ ...teacher, bio: e.target.value })}
                  className="admin-input resize-none"
                  rows={3}
                  placeholder="خلاصه‌ای از سوابق و تخصص استاد"
                />
              </div>
            </div>
          )}

          {current.key === "firstCourse" && (
            <div className="space-y-4 max-w-lg mt-4">
              <div>
                <label htmlFor="setup-course-title" className="block text-xs font-medium text-slate-600 mb-1.5">
                  عنوان <span className="text-red-500">*</span>
                </label>
                <input
                  id="setup-course-title"
                  type="text"
                  value={course.title}
                  onChange={(e) => setCourse({ ...course, title: e.target.value })}
                  className="admin-input"
                  placeholder="مثلاً: نقاشی و طراحی"
                  aria-required="true"
                />
              </div>
              <div>
                <label htmlFor="setup-course-desc" className="block text-xs font-medium text-slate-600 mb-1.5">
                  توضیحات <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="setup-course-desc"
                  value={course.description}
                  onChange={(e) => setCourse({ ...course, description: e.target.value })}
                  className="admin-input resize-none"
                  rows={3}
                  placeholder="توضیحات دوره آموزشی"
                  aria-required="true"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="setup-course-duration" className="block text-xs font-medium text-slate-600 mb-1.5">مدت</label>
                  <input
                    id="setup-course-duration"
                    type="text"
                    value={course.duration}
                    onChange={(e) => setCourse({ ...course, duration: e.target.value })}
                    className="admin-input"
                    placeholder="مثلاً: ۲ سال"
                  />
                </div>
                <div>
                  <label htmlFor="setup-course-level" className="block text-xs font-medium text-slate-600 mb-1.5">سطح</label>
                  <select
                    id="setup-course-level"
                    value={course.level}
                    onChange={(e) => setCourse({ ...course, level: e.target.value })}
                    className="admin-input"
                  >
                    <option value="beginner">مبتدی</option>
                    <option value="intermediate">متوسط</option>
                    <option value="advanced">پیشرفته</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {current.key === "firstNews" && (
            <div className="space-y-4 max-w-lg mt-4">
              <div>
                <label htmlFor="setup-news-title" className="block text-xs font-medium text-slate-600 mb-1.5">
                  عنوان <span className="text-red-500">*</span>
                </label>
                <input
                  id="setup-news-title"
                  type="text"
                  value={news.title}
                  onChange={(e) => setNews({ ...news, title: e.target.value })}
                  className="admin-input"
                  placeholder="مثلاً: شروع سال تحصیلی جدید"
                  aria-required="true"
                />
              </div>
              <div>
                <label htmlFor="setup-news-excerpt" className="block text-xs font-medium text-slate-600 mb-1.5">خلاصه</label>
                <textarea
                  id="setup-news-excerpt"
                  value={news.excerpt}
                  onChange={(e) => setNews({ ...news, excerpt: e.target.value })}
                  className="admin-input resize-none"
                  rows={2}
                  placeholder="خلاصه کوتاهی از خبر"
                />
              </div>
              <div>
                <label htmlFor="setup-news-content" className="block text-xs font-medium text-slate-600 mb-1.5">
                  متن <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="setup-news-content"
                  value={news.content}
                  onChange={(e) => setNews({ ...news, content: e.target.value })}
                  className="admin-input resize-none"
                  rows={5}
                  placeholder="متن کامل خبر"
                  aria-required="true"
                />
              </div>
            </div>
          )}

          {current.key === "verifyWebsite" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-50 flex items-center justify-center">
                <CheckCircle size={32} className="text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">راه‌اندازی تکمیل شد!</h3>
              <p className="text-sm text-slate-500 mb-6">اکنون سایت را در تابلوی بررسی کنید</p>
              <a href="/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm">
                <Eye size={16} />
                مشاهده سایت عمومی
              </a>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-3 min-h-[24px]">
            {success && (
              <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium" role="status" aria-live="polite">
                <CheckCircle size={14} />
                ذخیره شد
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSkipConfirm(true)}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors px-2 py-1.5 rounded hover:bg-slate-50"
            >
              رد کردن
            </button>
            {currentStep > 0 && (
              <button
                onClick={goPrev}
                className="admin-btn-secondary flex items-center gap-2 text-xs"
                aria-label="رفتن به مرحله قبلی"
              >
                <ArrowRight size={14} />
                قبلی
              </button>
            )}
            {isLastStep ? (
              <button
                onClick={handleCompleteSetup}
                disabled={saving}
                className="admin-btn-primary flex items-center gap-2 text-xs disabled:opacity-50"
                aria-label="تکمیل راه‌اندازی"
              >
                {saving ? <Loader size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                تکمیل راه‌اندازی
              </button>
            ) : (
              <button
                onClick={goNext}
                disabled={saving}
                className="admin-btn-primary flex items-center gap-2 text-xs disabled:opacity-50"
                aria-label={stepComplete ? "رفتن به مرحله بعدی" : "ذخیره و رفتن به مرحله بعدی"}
              >
                {saving ? <Loader size={14} className="animate-spin" /> : <ArrowLeft size={14} />}
                {stepComplete ? "بعدی" : "ذخیره و بعدی"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Skip Confirmation Dialog */}
      {showSkipConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowSkipConfirm(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold text-slate-900 mb-2">رد کردن راه‌اندازی؟</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              می‌توانید تنظیمات هنرستان را بعداً از بخش تنظیمات یا داشبورد تکمیل کنید. پیشرفت فعلی شما ذخیره خواهد شد.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setShowSkipConfirm(false)}
                className="admin-btn-secondary text-xs"
              >
                ادامه راه‌اندازی
              </button>
              <button
                onClick={handleSkip}
                disabled={saving}
                className="admin-btn-primary text-xs flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader size={14} className="animate-spin" /> : null}
                رد کردن و رفتن به داشبورد
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
