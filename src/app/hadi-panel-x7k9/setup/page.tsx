"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Lock, Upload, AcademicCap, Phone, Home, User, BookOpen,
  UserGroup, Megaphone, CheckCircle,
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
  { key: "changePassword", label: "\u062a\u063a\u06cc\u06cc\u0631 \u0631\u0645\u0632 \u0639\u0628\u0648\u0631", icon: Lock, description: "\u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u067e\u06cc\u0634\u200c\u062f\u0641\u0639 \u0631\u0627 \u062a\u063a\u06cc\u06cc\u0631 \u062f\u0647\u06cc\u062f" },
  { key: "uploadLogo", label: "\u0622\u067e\u0644\u0648\u062f \u0644\u0648\u06af\u0648", icon: Upload, description: "\u0644\u0648\u06af\u0648\u06cc \u0645\u062f\u0631\u0633\u0647 \u0631\u0627 \u0622\u067e\u0644\u0648\u062f \u06a9\u0646\u06cc\u062f" },
  { key: "schoolName", label: "\u0646\u0627\u0645 \u0645\u062f\u0631\u0633\u0647", icon: AcademicCap, description: "\u0646\u0627\u0645 \u0645\u062f\u0631\u0633\u0647 \u0631\u0627 \u062a\u0646\u0638\u06cc\u0645 \u06a9\u0646\u06cc\u062f" },
  { key: "contactInfo", label: "\u0627\u0637\u0644\u0627\u0639\u0627\u062a \u062a\u0645\u0627\u0633", icon: Phone, description: "\u0622\u062f\u0631\u0633\u060c \u062a\u0644\u0641\u0646 \u0648 \u0627\u06cc\u0645\u06cc\u0644" },
  { key: "homepage", label: "\u0635\u0641\u062d\u0647 \u0627\u0635\u0644\u06cc", icon: Home, description: "\u0628\u0646\u0631 \u0627\u0635\u0644\u06cc \u0648 \u0645\u062d\u062a\u0648\u0627\u06cc \u0635\u0641\u062d\u0647 \u0646\u062e\u0633\u062a" },
  { key: "principalProfile", label: "\u067e\u0631\u0648\u0641\u0627\u06cc\u0644 \u0645\u062f\u06cc\u0631", icon: User, description: "\u0627\u0637\u0644\u0627\u0639\u0627\u062a \u0645\u062f\u06cc\u0631 \u0645\u062f\u0631\u0633\u0647" },
  { key: "schoolProfile", label: "\u067e\u0631\u0648\u0641\u0627\u06cc\u0644 \u0647\u0646\u0631\u0633\u062a\u0627\u0646", icon: BookOpen, description: "\u0645\u0631\u062a\u0628\u0637 \u0648 \u062a\u0627\u0631\u06cc\u062e\u0634\u0647 \u0645\u062f\u0631\u0633\u0647" },
  { key: "firstTeacher", label: "\u0627\u0648\u0644\u06cc\u0646 \u0627\u0633\u062a\u0627\u062f", icon: UserGroup, description: "\u062b\u0628\u062a \u0627\u0637\u0644\u0627\u0639\u0627\u062a \u06cc\u06a9 \u0627\u0633\u062a\u0627\u062f" },
  { key: "firstCourse", label: "\u0627\u0648\u0644\u06cc\u0646 \u062f\u0648\u0631\u0647", icon: BookOpen, description: "\u0627\u06cc\u062c\u0627\u062f \u06cc\u06a9 \u062f\u0648\u0631\u0647 \u0622\u0645\u0648\u0632\u0634\u06cc" },
  { key: "firstNews", label: "\u0627\u0648\u0644\u06cc\u0646 \u062e\u0628\u0631", icon: Megaphone, description: "\u0627\u0646\u062a\u0634\u0627\u0631 \u0627\u0648\u0644\u06cc\u0646 \u062e\u0628\u0631" },
  { key: "verifyWebsite", label: "\u0628\u0631\u0631\u0633\u06cc \u0633\u0627\u06cc\u062a", icon: Eye, description: "\u0645\u0634\u0627\u0647\u062f\u0647 \u0633\u0627\u06cc\u062a \u0639\u0645\u0648\u0645\u06cc" },
] as const;

export default function SetupWizardPage() {
  const router = useRouter();
  const [status, setStatus] = useState<SetupStatus | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: "" });
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [principal, setPrincipal] = useState({ name: "", position: "", welcomeMessage: "", biography: "" });
  const [schoolData, setSchoolData] = useState({ overview: "", history: "", departments: "" });
  const [teacher, setTeacher] = useState({ name: "", title: "", specialty: "", bio: "" });
  const [course, setCourse] = useState({ title: "", description: "", duration: "", level: "beginner" });
  const [news, setNews] = useState({ title: "", excerpt: "", content: "" });
  const [uploading, setUploading] = useState(false);

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

  useEffect(() => {
    if (!passwords.new) { setPasswordStrength({ score: 0, feedback: "" }); return; }
    let score = 0;
    const fb: string[] = [];
    if (passwords.new.length >= 8) score++; else fb.push("\u062d\u062f\u0627\u0642\u0644 \u06f8 \u06a9\u0627\u0631\u0627\u06a9\u062a\u0631");
    if (/[A-Z]/.test(passwords.new)) score++; else fb.push("\u062d\u0631\u0641 \u0628\u0632\u0631\u06af");
    if (/[a-z]/.test(passwords.new)) score++; else fb.push("\u062d\u0631\u0641 \u06a9\u0648\u0686\u06a9");
    if (/[0-9]/.test(passwords.new)) score++; else fb.push("\u0639\u062f\u062f");
    setPasswordStrength({ score, feedback: fb.length > 0 ? fb.join(", ") : "\u0639\u0627\u0644\u06cc" });
  }, [passwords.new]);

  const handlePasswordChange = async () => {
    if (!passwords.current || !passwords.new || passwords.new !== passwords.confirm) return false;
    setSaving(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.new }),
      });
      if (res.ok) { setSuccess(true); setTimeout(() => setSuccess(false), 2000); return true; }
      return false;
    } catch { return false; } finally { setSaving(false); }
  };

  const handleSaveSettings = async (keys: Record<string, string>) => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(keys),
      });
      if (res.ok) { setSettings((prev) => ({ ...prev, ...keys })); setSuccess(true); setTimeout(() => setSuccess(false), 2000); return true; }
      return false;
    } catch { return false; } finally { setSaving(false); }
  };

  const handleSavePrincipal = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/principal", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...principal, published: true }),
      });
      if (res.ok) { setSuccess(true); setTimeout(() => setSuccess(false), 2000); return true; }
      return false;
    } catch { return false; } finally { setSaving(false); }
  };

  const handleSaveSchool = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/school", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...schoolData, published: true }),
      });
      if (res.ok) { setSuccess(true); setTimeout(() => setSuccess(false), 2000); return true; }
      return false;
    } catch { return false; } finally { setSaving(false); }
  };

  const handleCreateTeacher = async () => {
    if (!teacher.name || !teacher.title) return false;
    setSaving(true);
    try {
      const res = await fetch("/api/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...teacher, sortOrder: 0, published: true }),
      });
      if (res.ok) { setSuccess(true); setTimeout(() => setSuccess(false), 2000); return true; }
      return false;
    } catch { return false; } finally { setSaving(false); }
  };

  const handleCreateCourse = async () => {
    if (!course.title || !course.description) return false;
    setSaving(true);
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...course, sortOrder: 0, published: true }),
      });
      if (res.ok) { setSuccess(true); setTimeout(() => setSuccess(false), 2000); return true; }
      return false;
    } catch { return false; } finally { setSaving(false); }
  };

  const handleCreateNews = async () => {
    if (!news.title || !news.content) return false;
    setSaving(true);
    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...news, published: true }),
      });
      if (res.ok) { setSuccess(true); setTimeout(() => setSuccess(false), 2000); return true; }
      return false;
    } catch { return false; } finally { setSaving(false); }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) { const data = await res.json(); setSettings((prev) => ({ ...prev, logo_url: data.url })); }
    } catch {} finally { setUploading(false); }
  };

  const handleCompleteSetup = async () => {
    setSaving(true);
    try {
      await fetch("/api/setup/complete", { method: "POST" });
      router.push(getAdminPath());
    } catch { setSaving(false); }
  };

  const goNext = async () => {
    const stepKey = STEP_DEFINITIONS[currentStep]?.key;
    let saved = false;

    if (stepKey === "changePassword") saved = await handlePasswordChange();
    else if (stepKey === "uploadLogo") saved = await handleSaveSettings({ logo_url: settings["logo_url"] || "" });
    else if (stepKey === "schoolName") saved = await handleSaveSettings({ school_name: settings["school_name"] || "" });
    else if (stepKey === "contactInfo") saved = await handleSaveSettings({ address: settings["address"] || "", phone: settings["phone"] || "", email: settings["email"] || "" });
    else if (stepKey === "homepage") saved = await handleSaveSettings({ hero_title: settings["hero_title"] || "", hero_subtitle: settings["hero_subtitle"] || "" });
    else if (stepKey === "principalProfile") saved = await handleSavePrincipal();
    else if (stepKey === "schoolProfile") saved = await handleSaveSchool();
    else if (stepKey === "firstTeacher") saved = await handleCreateTeacher();
    else if (stepKey === "firstCourse") saved = await handleCreateCourse();
    else if (stepKey === "firstNews") saved = await handleCreateNews();

    if (saved || stepKey === "verifyWebsite") {
      await fetchStatus();
      if (currentStep < STEP_DEFINITIONS.length - 1) setCurrentStep((prev) => prev + 1);
    }
  };

  const goPrev = () => { if (currentStep > 0) setCurrentStep((prev) => prev - 1); };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader size={24} className="text-primary-600 animate-spin" />
        <span className="mr-3 text-sm text-slate-500">{"\u062f\u0631 \u062d\u0627\u0644 \u0628\u0627\u0631\u06af\u0630\u0627\u0631\u06cc..."}</span>
      </div>
    );
  }

  const current = STEP_DEFINITIONS[currentStep];
  const progress = status ? status.progress : 0;
  const isLastStep = currentStep === STEP_DEFINITIONS.length - 1;
  const stepComplete = status?.steps[current.key as keyof SetupSteps];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium mb-3">
          <Globe size={14} />
          {"\u0631\u0627\u0647\u200c\u0627\u0646\u062f\u0627\u0632\u06cc \u0627\u0648\u0644\u06cc\u0647"}
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">{"\u062c\u0627\u062f\u0648\u06cc \u0631\u0627\u0647\u200c\u0627\u0646\u062f\u0627\u0632\u06cc"}</h1>
        <p className="text-sm text-slate-500">{"\u0645\u0631\u0627\u062d\u0644 \u0632\u06cc\u0631 \u0631\u0627 \u0628\u0631\u0627\u06cc \u062a\u06a9\u0645\u06cc\u0644 \u0631\u0627\u0647\u200c\u0627\u0646\u062f\u0627\u0632\u06cc \u0633\u0627\u06cc\u062a \u062f\u0646\u0628\u0627\u0644 \u06a9\u0646\u06cc\u062f"}</p>
      </div>

      <div className="admin-card mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-700">{"\u067e\u06cc\u0634\u0631\u0641\u062a \u06a9\u0644\u06cc"}</span>
          <span className="text-sm font-bold text-primary-600">{status?.completedCount || 0} {"\u0627\u0632"} {status?.totalSteps || 11}</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-l from-primary-500 to-primary-600 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="admin-card mb-6 overflow-x-auto">
        <div className="flex gap-1.5 min-w-max pb-1">
          {STEP_DEFINITIONS.map((step, i) => {
            const StepIcon = step.icon;
            const isComplete = status?.steps[step.key as keyof SetupSteps];
            const isCurrent = i === currentStep;
            return (
              <button key={step.key} onClick={() => setCurrentStep(i)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap ${
                  isCurrent ? "bg-primary-600 text-white shadow-sm" : isComplete ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                }`}>
                {isComplete ? <CheckCircle size={14} /> : <StepIcon size={14} />}
                <span>{step.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="admin-card">
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
              {"\u062a\u06a9\u0645\u06cc\u0644 \u0634\u062f\u0647"}
            </span>
          )}
        </div>

        <div className="min-h-[280px]">
          {current.key === "changePassword" && (
            <div className="space-y-4 max-w-md">
              <p className="text-xs text-slate-500 mb-4">
                {"\u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u067e\u06cc\u0634\u200c\u062f\u0641\u0639 ("}
                <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">@hadiplmmlp</code>
                {") \u0631\u0627 \u0628\u0647 \u0631\u0645\u0632\u06cc \u0627\u0645\u0646 \u062a\u063a\u06cc\u06cc\u0631 \u062f\u0647\u06cc\u062f."}
              </p>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">{"\u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u0641\u0639\u0644\u06cc"}</label>
                <input type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} className="admin-input" placeholder="\u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u0641\u0639\u0644\u06cc" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">{"\u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u062c\u062f\u06cc\u062f"}</label>
                <input type="password" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} className="admin-input" placeholder="\u062d\u062f\u0627\u0642\u0644 \u06f8 \u06a9\u0627\u0631\u0627\u06a9\u062a\u0631" />
                {passwords.new && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[0, 1, 2, 3].map((i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full ${i < passwordStrength.score ? (passwordStrength.score <= 1 ? "bg-red-400" : passwordStrength.score <= 2 ? "bg-amber-400" : "bg-emerald-400") : "bg-slate-200"}`} />
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-500">{passwordStrength.feedback}</p>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">{"\u062a\u06a9\u0631\u0627\u0631 \u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u062c\u062f\u06cc\u062f"}</label>
                <input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} className="admin-input" placeholder="\u062a\u06a9\u0631\u0627\u0631 \u0631\u0645\u0632 \u0639\u0628\u0648\u0631" />
                {passwords.confirm && passwords.new !== passwords.confirm && (
                  <p className="text-[11px] text-red-500 mt-1">{"\u0631\u0645\u0632\u0647\u0627 \u0645\u0637\u0627\u0628\u0642\u062a \u0646\u06cc\u0633\u062a\u0646\u062f"}</p>
                )}
              </div>
            </div>
          )}

          {current.key === "uploadLogo" && (
            <div className="space-y-4 max-w-md">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  {settings.logo_url ? (
                    <div className="w-24 h-24 rounded-xl border-2 border-slate-200 overflow-hidden bg-white flex items-center justify-center">
                      <img src={settings.logo_url} alt="\u0644\u0648\u06af\u0648" className="max-w-full max-h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center">
                      <span className="text-2xl text-slate-400">{"\u0647"}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <label className={`admin-btn-secondary cursor-pointer flex items-center gap-2 ${uploading ? "opacity-50" : ""}`}>
                    <Upload size={16} />
                    {uploading ? "\u062f\u0631 \u062d\u0627\u0644 \u0622\u067e\u0644\u0648\u062f..." : "\u0627\u0646\u062a\u062e\u0627\u0628 \u0641\u0627\u06cc\u0644"}
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" disabled={uploading} />
                  </label>
                  <p className="text-[11px] text-slate-400 mt-2">{"\u0641\u0631\u0645\u062a\u200c\u0647\u0627\u06cc \u0645\u062c\u0627\u0632: PNG, JPG, SVG"}</p>
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">{"\u06cc\u0627 \u0648\u0627\u0631\u062f \u06a9\u0631\u062f\u0646 URL"}</label>
                    <input type="text" placeholder="https://example.com/logo.png" value={settings.logo_url || ""} onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })} className="admin-input" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {current.key === "schoolName" && (
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">{"\u0646\u0627\u0645 \u0645\u062f\u0631\u0633\u0647"}</label>
                <input type="text" placeholder="\u0647\u0646\u0631\u0633\u062a\u0627\u0646 \u0647\u0627\u062f\u06cc" value={settings.school_name || ""} onChange={(e) => setSettings({ ...settings, school_name: e.target.value })} className="admin-input" />
                <p className="text-[11px] text-slate-400 mt-1">{"\u0646\u0627\u0645\u06cc \u06a9\u0647 \u062f\u0631 \u0647\u062f\u0631 \u0648 \u0633\u0631\u062a\u06cc\u067e\u0631\u0647\u0627 \u0646\u0645\u0627\u06cc\u0634 \u062f\u0627\u062f\u0647 \u0645\u06cc\u200c\u0634\u0648\u062f"}</p>
              </div>
            </div>
          )}

          {current.key === "contactInfo" && (
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">{"\u0622\u062f\u0631\u0633"}</label>
                <input type="text" placeholder="\u062a\u0647\u0631\u0627\u0646\u060c \u062e\u06cc\u0627\u0628\u0627\u0646 \u0646\u0645\u0648\u0646\u0647" value={settings.address || ""} onChange={(e) => setSettings({ ...settings, address: e.target.value })} className="admin-input" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">{"\u062a\u0644\u0641\u0646"}</label>
                <input type="text" placeholder="\u0698\u0645\u0631\u0647 \u062a\u0644\u0641\u0646" value={settings.phone || ""} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} className="admin-input" dir="ltr" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">{"\u0627\u06cc\u0645\u06cc\u0644"}</label>
                <input type="email" placeholder="info@example.com" value={settings.email || ""} onChange={(e) => setSettings({ ...settings, email: e.target.value })} className="admin-input" dir="ltr" />
              </div>
            </div>
          )}

          {current.key === "homepage" && (
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">{"\u0639\u0646\u0648\u0627\u06cc\u0646 \u0628\u0646\u0631 \u0627\u0635\u0644\u06cc"}</label>
                <input type="text" placeholder="\u0647\u0646\u0631\u0633\u062a\u0627\u0646 \u0647\u0627\u062f\u06cc" value={settings.hero_title || ""} onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })} className="admin-input" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">{"\u0632\u06cc\u0631\u0639\u0646\u0648\u0627\u06cc\u06cc\u0646 \u0628\u0646\u0631 \u0627\u0635\u0644\u06cc"}</label>
                <input type="text" placeholder="\u0645\u0631\u06a9\u0632 \u0622\u0645\u0648\u0632\u0634 \u0647\u0646\u0631\u0647\u0627\u06cc \u0632\u06cc\u0628\u0627" value={settings.hero_subtitle || ""} onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })} className="admin-input" />
              </div>
            </div>
          )}

          {current.key === "principalProfile" && (
            <div className="space-y-4 max-w-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">{"\u0646\u0627\u0645"}</label>
                  <input type="text" value={principal.name} onChange={(e) => setPrincipal({ ...principal, name: e.target.value })} className="admin-input" placeholder="\u0646\u0627\u0645 \u0648 \u0646\u0627\u0645 \u062e\u0627\u0646\u0648\u0627\u062f\u06af\u06cc" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">{"\u0633\u0645\u062a"}</label>
                  <input type="text" value={principal.position} onChange={(e) => setPrincipal({ ...principal, position: e.target.value })} className="admin-input" placeholder="\u0645\u062f\u06cc\u0631 \u0647\u0646\u0631\u0633\u062a\u0627\u0646" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">{"\u067e\u06cc\u0627\u0645 \u062e\u0634\u0648\u0634"}</label>
                <textarea value={principal.welcomeMessage} onChange={(e) => setPrincipal({ ...principal, welcomeMessage: e.target.value })} className="admin-input resize-none" rows={3} placeholder="\u067e\u06cc\u0627\u0645 \u062e\u0634\u0648\u0634 \u0628\u0647 \u0647\u0646\u0631\u062c\u0648\u06cc\u0627\u0646" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">{"\u0632\u0646\u062f\u0646\u0627\u0645\u0647"}</label>
                <textarea value={principal.biography} onChange={(e) => setPrincipal({ ...principal, biography: e.target.value })} className="admin-input resize-none" rows={3} placeholder="\u0632\u0646\u062f\u0646\u0627\u0645\u0647 \u0645\u062f\u06cc\u0631" />
              </div>
            </div>
          )}

          {current.key === "schoolProfile" && (
            <div className="space-y-4 max-w-lg">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">{"\u0645\u0631\u062a\u0628\u0637 \u06a9\u0644\u06cc"}</label>
                <textarea value={schoolData.overview} onChange={(e) => setSchoolData({ ...schoolData, overview: e.target.value })} className="admin-input resize-none" rows={4} placeholder="\u0645\u0631\u062a\u0628\u0637 \u06a9\u0644\u06cc \u0647\u0646\u0631\u0633\u062a\u0627\u0646" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">{"\u062a\u0627\u0631\u06cc\u062e\u0634\u0647"}</label>
                <textarea value={schoolData.history} onChange={(e) => setSchoolData({ ...schoolData, history: e.target.value })} className="admin-input resize-none" rows={3} placeholder="\u062a\u0627\u0631\u06cc\u062e\u0634\u0647 \u0647\u0646\u0631\u0633\u062a\u0627\u0646" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">{"\u062f\u067e\u0627\u0631\u062a\u0645\u0627\u0646\u200c\u0647\u0627"}</label>
                <textarea value={schoolData.departments} onChange={(e) => setSchoolData({ ...schoolData, departments: e.target.value })} className="admin-input resize-none" rows={2} placeholder="\u0645\u062b\u0644: \u0646\u0642\u0627\u0634\u06cc, \u062e\u0648\u0634\u0646\u0648\u06cc\u0633\u06cc, ..." />
              </div>
            </div>
          )}

          {current.key === "firstTeacher" && (
            <div className="space-y-4 max-w-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">{"\u0646\u0627\u0645 *"} </label>
                  <input type="text" value={teacher.name} onChange={(e) => setTeacher({ ...teacher, name: e.target.value })} className="admin-input" placeholder="\u0646\u0627\u0645 \u0627\u0633\u062a\u0627\u062f" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">{"\u0633\u0645\u062a *"}</label>
                  <input type="text" value={teacher.title} onChange={(e) => setTeacher({ ...teacher, title: e.target.value })} className="admin-input" placeholder="\u0645\u062f\u06cc\u0631 \u0622\u0645\u0648\u0632\u0634\u06af\u0627\u0647" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">{"\u062a\u062e\u0635\u0635"}</label>
                <input type="text" value={teacher.specialty} onChange={(e) => setTeacher({ ...teacher, specialty: e.target.value })} className="admin-input" placeholder="\u0645\u062b\u0644: \u0646\u0642\u0627\u0634\u06cc" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">{"\u0628\u06cc\u0648\u06af\u0631\u0627\u0641\u06cc"}</label>
                <textarea value={teacher.bio} onChange={(e) => setTeacher({ ...teacher, bio: e.target.value })} className="admin-input resize-none" rows={3} placeholder="\u0628\u06cc\u0648\u06af\u0631\u0627\u0641\u06cc \u06a9\u0648\u062a\u0627\u0647" />
              </div>
            </div>
          )}

          {current.key === "firstCourse" && (
            <div className="space-y-4 max-w-lg">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">{"\u0639\u0646\u0648\u0627\u06cc\u06cc\u0646 *"}</label>
                <input type="text" value={course.title} onChange={(e) => setCourse({ ...course, title: e.target.value })} className="admin-input" placeholder="\u0646\u0642\u0627\u0634\u06cc \u0648 \u0637\u0631\u0627\u062d\u06cc" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">{"\u062a\u0634\u0631\u06cc\u062d *"}</label>
                <textarea value={course.description} onChange={(e) => setCourse({ ...course, description: e.target.value })} className="admin-input resize-none" rows={3} placeholder="\u062a\u0634\u0631\u06cc\u062d \u062f\u0648\u0631\u0647" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">{"\u0645\u062f\u062a"}</label>
                  <input type="text" value={course.duration} onChange={(e) => setCourse({ ...course, duration: e.target.value })} className="admin-input" placeholder="\u06f2 \u0633\u0627\u0644" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">{"\u0633\u0637\u062d"}</label>
                  <select value={course.level} onChange={(e) => setCourse({ ...course, level: e.target.value })} className="admin-input">
                    <option value="beginner">{"\u0645\u0628\u062a\u062f\u06cc"}</option>
                    <option value="intermediate">{"\u0645\u062a\u0648\u0633\u0637"}</option>
                    <option value="advanced">{"\u067e\u06cc\u0634\u0631\u0641\u062a\u0647"}</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {current.key === "firstNews" && (
            <div className="space-y-4 max-w-lg">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">{"\u0639\u0646\u0648\u0627\u06cc\u06cc\u0646 *"}</label>
                <input type="text" value={news.title} onChange={(e) => setNews({ ...news, title: e.target.value })} className="admin-input" placeholder="\u0639\u0646\u0648\u0627\u06cc\u06cc\u0646 \u062e\u0628\u0631" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">{"\u062e\u0644\u0635\u0647"}</label>
                <textarea value={news.excerpt} onChange={(e) => setNews({ ...news, excerpt: e.target.value })} className="admin-input resize-none" rows={2} placeholder="\u062e\u0644\u0635\u0647 \u06a9\u0648\u062a\u0627\u0647" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">{"\u0645\u062a\u0646 *"}</label>
                <textarea value={news.content} onChange={(e) => setNews({ ...news, content: e.target.value })} className="admin-input resize-none" rows={5} placeholder="\u0645\u062a\u0646 \u06a9\u0627\u0645\u0644 \u062e\u0628\u0631" />
              </div>
            </div>
          )}

          {current.key === "verifyWebsite" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-50 flex items-center justify-center">
                <CheckCircle size={32} className="text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{"\u0631\u0627\u0647\u200c\u0627\u0646\u062f\u0627\u0632\u06cc \u062a\u06a9\u0645\u06cc\u0644 \u0634\u062f!"}</h3>
              <p className="text-sm text-slate-500 mb-6">{"\u0627\u06a9\u0646\u0648\u0646 \u0633\u0627\u06cc\u062a \u0631\u0627 \u062f\u0631 \u062a\u0627\u0628\u0631\u0627\u0646\u0647 \u0628\u0631\u0631\u0633\u06cc \u06a9\u0646\u06cc\u062f"}</p>
              <a href="/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm">
                <Eye size={16} />
                {"\u0645\u0634\u0627\u0647\u062f\u0647 \u0633\u0627\u06cc\u062a \u0639\u0645\u0648\u0645\u06cc"}
              </a>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-3">
            {success && (
              <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
                <CheckCircle size={14} />
                {"\u0630\u062e\u06cc\u0631\u0647 \u0634\u062f"}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {currentStep > 0 && (
              <button onClick={goPrev} className="admin-btn-secondary flex items-center gap-2 text-xs">
                <ArrowRight size={14} />
                {"\u0642\u0628\u0644\u06cc"}
              </button>
            )}
            {isLastStep ? (
              <button onClick={handleCompleteSetup} disabled={saving} className="admin-btn-primary flex items-center gap-2 text-xs disabled:opacity-50">
                {saving ? <Loader size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                {"\u062a\u06a9\u0645\u06cc\u0644 \u0631\u0627\u0647\u200c\u0627\u0646\u062f\u0627\u0632\u06cc"}
              </button>
            ) : (
              <button onClick={goNext} disabled={saving} className="admin-btn-primary flex items-center gap-2 text-xs disabled:opacity-50">
                {saving ? <Loader size={14} className="animate-spin" /> : <ArrowLeft size={14} />}
                {stepComplete ? "\u0628\u0639\u062f\u06cc" : "\u0630\u062e\u06cc\u0631\u0647 \u0648 \u0628\u0639\u062f\u06cc"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
