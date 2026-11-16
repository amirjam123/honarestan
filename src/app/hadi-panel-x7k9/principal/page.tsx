"use client";

import { useState, useEffect, useCallback } from "react";
import { Save, CheckCircle, Loader } from "@/components/icons";
import ImageUpload from "@/components/admin/ImageUpload";

interface PrincipalProfile {
  name: string;
  photo: string;
  position: string;
  biography: string;
  welcomeMessage: string;
  resume: string;
  achievements: string;
  contactInfo: string;
  published: boolean;
}

const emptyProfile: PrincipalProfile = {
  name: "",
  photo: "",
  position: "",
  biography: "",
  welcomeMessage: "",
  resume: "",
  achievements: "[]",
  contactInfo: "",
  published: true,
};

export default function AdminPrincipalPage() {
  const [profile, setProfile] = useState<PrincipalProfile>(emptyProfile);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/principal");
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setProfile({
            name: data.name || "",
            photo: data.photo || "",
            position: data.position || "",
            biography: data.biography || "",
            welcomeMessage: data.welcomeMessage || "",
            resume: data.resume || "",
            achievements: data.achievements || "[]",
            contactInfo: data.contactInfo || "",
            published: data.published ?? true,
          });
        }
      }
    } catch {
      setError("Ø®Ø·Ø§ Ø¯Ø± Ø¯Ø±ÛŒØ§ÙØª Ø§Ø·Ù„Ø§Ø¹Ø§Øª");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      if (profile.achievements) {
        JSON.parse(profile.achievements);
      }
    } catch {
      setError("ÙØ±Ù…Øª Ø¯Ø³ØªØ§ÙˆØ±Ø¯Ù‡Ø§ Ù†Ø§Ù…Ø¹ØªØ¨Ø± Ø§Ø³Øª. Ù„Ø·ÙØ§Ù‹ JSON Ù…Ø¹ØªØ¨Ø± ÙˆØ§Ø±Ø¯ Ú©Ù†ÛŒØ¯.");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/principal", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError("Ø®Ø·Ø§ Ø¯Ø± Ø°Ø®ÛŒØ±Ù‡ Ø§Ø·Ù„Ø§Ø¹Ø§Øª");
      }
    } catch {
      setError("Ø®Ø·Ø§ Ø¯Ø± Ø§Ø±ØªØ¨Ø§Ø· Ø¨Ø§ Ø³Ø±ÙˆØ±");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader size={24} className="text-slate-400" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-6 text-slate-900">Ù¾Ø±ÙˆÙØ§ÛŒÙ„ Ù…Ø¯ÛŒØ±</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="admin-card">
          <h2 className="text-sm font-bold mb-4 text-slate-800">Ø§Ø·Ù„Ø§Ø¹Ø§Øª Ø´Ø®ØµÛŒ</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Ù†Ø§Ù… Ùˆ Ù†Ø§Ù… Ø®Ø§Ù†ÙˆØ§Ø¯Ú¯ÛŒ
              </label>
              <input
                type="text"
                placeholder="Ù†Ø§Ù… Ù…Ø¯ÛŒØ± Ù‡Ù†Ø±Ø³ØªØ§Ù†..."
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="admin-input"
              />
            </div>
            <ImageUpload
              label="ØªØµÙˆÛŒØ± Ù…Ø¯ÛŒØ± Ù‡Ù†Ø±Ø³ØªØ§Ù†"
              value={profile.photo || ""}
              onChange={(url) => setProfile({ ...profile, photo: url })}
            />
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Ø³Ù…Øª
              </label>
              <input
                type="text"
                placeholder="Ù…Ø¯ÛŒØ± Ù‡Ù†Ø±Ø³ØªØ§Ù†..."
                value={profile.position}
                onChange={(e) => setProfile({ ...profile, position: e.target.value })}
                className="admin-input"
              />
            </div>
          </div>
        </div>

        <div className="admin-card">
          <h2 className="text-sm font-bold mb-4 text-slate-800">Ù…Ø­ØªÙˆØ§ÛŒ Ù…ØªÙ†ÛŒ</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Ø¨ÛŒÙˆÚ¯Ø±Ø§ÙÛŒ
              </label>
              <textarea
                rows={4}
                placeholder="Ø¨ÛŒÙˆÚ¯Ø±Ø§ÙÛŒ Ù…Ø¯ÛŒØ± Ù‡Ù†Ø±Ø³ØªØ§Ù†..."
                value={profile.biography}
                onChange={(e) => setProfile({ ...profile, biography: e.target.value })}
                className="admin-input resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Ù¾ÛŒØ§Ù… Ø®ÙˆØ´â€ŒØ¢Ù…Ø¯Ú¯ÙˆÛŒÛŒ
              </label>
              <textarea
                rows={4}
                placeholder="Ù¾ÛŒØ§Ù… Ø®ÙˆØ´â€ŒØ¢Ù…Ø¯Ú¯ÙˆÛŒÛŒ Ø¨Ù‡ Ø¯Ø§Ù†Ø´â€ŒØ¢Ù…ÙˆØ²Ø§Ù† Ùˆ ÙˆØ§Ù„Ø¯ÛŒÙ†..."
                value={profile.welcomeMessage}
                onChange={(e) => setProfile({ ...profile, welcomeMessage: e.target.value })}
                className="admin-input resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Ø±Ø²ÙˆÙ…Ù‡
              </label>
              <textarea
                rows={4}
                placeholder="Ø³ÙˆØ§Ø¨Ù‚ ØªØ­ØµÛŒÙ„ÛŒ Ùˆ Ø­Ø±ÙÙ‡â€ŒØ§ÛŒ..."
                value={profile.resume}
                onChange={(e) => setProfile({ ...profile, resume: e.target.value })}
                className="admin-input resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Ø¯Ø³ØªØ§ÙˆØ±Ø¯Ù‡Ø§ (JSON)
              </label>
              <textarea
                rows={3}
                placeholder='["Ú©Ø³Ø¨ Ø±ØªØ¨Ù‡ Ø§ÙˆÙ„ Ø§Ø³ØªØ§Ù†", "Ø±Ø§Ù‡â€ŒØ§Ù†Ø¯Ø§Ø²ÛŒ Ø±Ø´ØªÙ‡ Ø¬Ø¯ÛŒØ¯"]'
                value={profile.achievements}
                onChange={(e) => setProfile({ ...profile, achievements: e.target.value })}
                className="admin-input resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Ø§Ø·Ù„Ø§Ø¹Ø§Øª ØªÙ…Ø§Ø³ (Ø§Ø®ØªÛŒØ§Ø±ÛŒ)
              </label>
              <textarea
                rows={2}
                placeholder="Ø´Ù…Ø§Ø±Ù‡ ØªÙ…Ø§Ø³ØŒ Ø§ÛŒÙ…ÛŒÙ„ Ùˆ..."
                value={profile.contactInfo}
                onChange={(e) => setProfile({ ...profile, contactInfo: e.target.value })}
                className="admin-input resize-none"
              />
            </div>
          </div>
        </div>

        <div className="admin-card">
          <h2 className="text-sm font-bold mb-4 text-slate-800">ØªÙ†Ø¸ÛŒÙ…Ø§Øª Ø§Ù†ØªØ´Ø§Ø±</h2>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              checked={profile.published}
              onChange={(e) => setProfile({ ...profile, published: e.target.checked })}
              className="w-4 h-4 rounded"
            />
            <label htmlFor="published" className="text-xs text-slate-600">
              Ù…Ù†ØªØ´Ø± Ø´Ø¯Ù‡
            </label>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="admin-btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader size={16} />
                Ø¯Ø± Ø­Ø§Ù„ Ø°Ø®ÛŒØ±Ù‡...
              </>
            ) : (
              <>
                <Save size={16} />
                Ø°Ø®ÛŒØ±Ù‡ ØªØºÛŒÛŒØ±Ø§Øª
              </>
            )}
          </button>

          {success && (
            <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
              <CheckCircle size={14} />
              Ø§Ø·Ù„Ø§Ø¹Ø§Øª Ø¨Ø§ Ù…ÙˆÙÙ‚ÛŒØª Ø°Ø®ÛŒØ±Ù‡ Ø´Ø¯
            </span>
          )}

          {error && (
            <span className="text-red-600 text-xs font-medium">
              {error}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

