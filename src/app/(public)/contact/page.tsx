"use client";

import { useState, useEffect, useCallback } from "react";
import Hero from "@/components/ui/Hero";
import {
  LocationMarker, Phone, Envelope, CheckCircle, XCircle, Loader, Send,
  ChatBubble, Clock, ArrowLeft, Document,
} from "@/components/icons";

interface TicketMessage {
  id: string;
  message: string;
  senderType: string;
  senderName: string;
  createdAt: string;
}

interface Ticket {
  id: string;
  subject: string;
  userName: string;
  userEmail: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
}

export default function ContactPage() {
  const [view, setView] = useState<"form" | "list" | "detail">("form");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "duplicate">("idle");
  const [duplicateTicketId, setDuplicateTicketId] = useState<string | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyStatus, setReplyStatus] = useState<"idle" | "loading" | "error">("idle");
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    address: "تهران، خیابان نمونه، کوچه نمونه، پلاک ۱۲۳",
    phone: "۰۲۱-۱۲۳۴۵۶۷۸",
    email: "info@honarestan-hadi.ir",
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.ok ? res.json() : {})
      .then((data: Record<string, string>) => {
        if (data["address"]) setContactInfo(prev => ({ ...prev, address: data["address"] }));
        if (data["phone"]) setContactInfo(prev => ({ ...prev, phone: data["phone"] }));
        if (data["email"]) setContactInfo(prev => ({ ...prev, email: data["email"] }));
      })
      .catch(() => {});

    // Restore saved email
    const savedEmail = localStorage.getItem("ticket_email");
    const savedName = localStorage.getItem("ticket_name");
    if (savedEmail) setFormData(prev => ({ ...prev, email: savedEmail }));
    if (savedName) setFormData(prev => ({ ...prev, name: savedName }));
  }, []);

  const fetchTickets = useCallback(async (email: string) => {
    setLoadingTickets(true);
    try {
      const res = await fetch(`/api/tickets?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      }
    } catch {
      // Silent fail
    } finally {
      setLoadingTickets(false);
    }
  }, []);

  const fetchTicketDetail = useCallback(async (ticketId: string) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}?email=${encodeURIComponent(formData.email)}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedTicket(data);
        setView("detail");
      }
    } catch {
      // Silent fail
    }
  }, [formData.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    // Save email and name for future use
    localStorage.setItem("ticket_email", formData.email);
    localStorage.setItem("ticket_name", formData.name);

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.duplicate) {
          setStatus("duplicate");
          setDuplicateTicketId(data.ticketId);
        } else {
          setStatus("success");
          setFormData({ name: formData.name, email: formData.email, phone: "", subject: "", message: "" });
        }
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const handleReply = async (ticketId: string) => {
    if (!replyMessage.trim()) return;
    setReplyStatus("loading");

    try {
      const res = await fetch(`/api/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: replyMessage,
          senderType: "user",
          senderName: formData.name || "کاربر",
          email: formData.email,
        }),
      });

      if (res.ok) {
        setReplyMessage("");
        setReplyStatus("idle");
        fetchTicketDetail(ticketId);
      } else {
        setReplyStatus("error");
      }
    } catch {
      setReplyStatus("error");
    }
  };

  const handleHideTicket = async (ticketId: string) => {
    try {
      await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "hide", email: formData.email }),
      });
      fetchTickets(formData.email);
      setView("list");
    } catch {
      // Silent fail
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "open": return { text: "در انتظار پاسخ", color: "text-amber-600 bg-amber-50" };
      case "answered": return { text: "پاسخ داده شده", color: "text-emerald-600 bg-emerald-50" };
      case "closed": return { text: "بسته شده", color: "text-slate-600 bg-slate-100" };
      default: return { text: status, color: "text-slate-600 bg-slate-100" };
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      <Hero title="پشتیبانی و ارتباط با ما" subtitle="ثبت درخواست و پیگیری تیکت‌های پشتیبانی" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Sidebar */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-6 text-slate-900">اطلاعات تماس</h2>
            <div className="space-y-5 mb-8">
              {[
                { icon: LocationMarker, title: "آدرس", value: contactInfo.address },
                { icon: Phone, title: "تلفن", value: contactInfo.phone, ltr: true },
                { icon: Envelope, title: "ایمیل", value: contactInfo.email, ltr: true },
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

            {/* Navigation */}
            {formData.email && (
              <div className="space-y-2">
                <button
                  onClick={() => { setView("form"); setStatus("idle"); }}
                  className={`w-full text-right px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    view === "form" ? "bg-primary-600 text-white" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Send size={16} className="inline ml-2" />
                  ثبت تیکت جدید
                </button>
                <button
                  onClick={() => { setView("list"); fetchTickets(formData.email); }}
                  className={`w-full text-right px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    view === "list" || view === "detail" ? "bg-primary-600 text-white" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Document size={16} className="inline ml-2" />
                  تیکت‌های من
                </button>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* New Ticket Form */}
            {view === "form" && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 lg:p-8">
                <h2 className="text-xl font-bold mb-5 text-slate-900">ثبت تیکت جدید</h2>
                {status === "success" ? (
                  <div className="text-center py-12">
                    <CheckCircle size={48} className="mx-auto mb-4 text-emerald-500" />
                    <p className="text-lg font-bold text-emerald-600">تیکت شما با موفقیت ثبت شد</p>
                    <p className="text-slate-500 text-sm mt-2">به زودی پاسخ شما ارسال خواهد شد</p>
                    <button
                      onClick={() => { setView("list"); fetchTickets(formData.email); }}
                      className="mt-4 admin-btn-primary"
                    >
                      مشاهده تیکت‌ها
                    </button>
                  </div>
                ) : status === "duplicate" ? (
                  <div className="text-center py-12">
                    <ChatBubble size={48} className="mx-auto mb-4 text-amber-500" />
                    <p className="text-lg font-bold text-amber-600">تیکت فعال موجود است</p>
                    <p className="text-slate-500 text-sm mt-2">شما یک تیکت فعال دارید. آیا می‌خواهید به همان تیکت پاسخ دهید؟</p>
                    <div className="flex justify-center gap-3 mt-4">
                      <button
                        onClick={() => { if (duplicateTicketId) fetchTicketDetail(duplicateTicketId); }}
                        className="admin-btn-primary"
                      >
                        بله، ادامه تیکت
                      </button>
                      <button
                        onClick={() => setStatus("idle")}
                        className="admin-btn-secondary"
                      >
                        خیر، تیکت جدید
                      </button>
                    </div>
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
                        <label htmlFor="subject" className="block text-xs font-medium text-slate-600 mb-1.5">موضوع *</label>
                        <input
                          id="subject"
                          type="text"
                          required
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
                          ثبت تیکت
                        </>
                      )}
                    </button>
                    {status === "error" && (
                      <div className="flex items-center gap-2 text-red-600 text-sm justify-center">
                        <XCircle size={16} />
                        <span>خطا در ارسال. لطفاً دوباره تلاش کنید.</span>
                      </div>
                    )}
                  </form>
                )}
              </div>
            )}

            {/* Ticket List */}
            {view === "list" && (
              <div className="space-y-4">
                {loadingTickets ? (
                  <div className="text-center py-12">
                    <Loader size={32} className="mx-auto mb-4 text-slate-400 animate-spin" />
                    <p className="text-slate-500">در حال بارگذاری...</p>
                  </div>
                ) : tickets.length === 0 ? (
                  <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                    <ChatBubble size={48} className="mx-auto mb-4 text-slate-300" />
                    <p className="text-slate-500">هنوز تیکتی ثبت نکرده‌اید</p>
                    <button
                      onClick={() => setView("form")}
                      className="mt-4 admin-btn-primary"
                    >
                      ثبت تیکت جدید
                    </button>
                  </div>
                ) : (
                  tickets.map((ticket) => {
                    const statusInfo = getStatusLabel(ticket.status);
                    const lastMessage = ticket.messages[0];
                    return (
                      <div
                        key={ticket.id}
                        className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => fetchTicketDetail(ticket.id)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-sm text-slate-900 truncate">{ticket.subject}</h3>
                            <p className="text-slate-500 text-xs mt-1 line-clamp-2">
                              {lastMessage?.message}
                            </p>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap ${statusInfo.color}`}>
                            {statusInfo.text}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {formatDate(ticket.createdAt)}
                          </span>
                          <span>{ticket.messages.length} پیام</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Ticket Detail */}
            {view === "detail" && selectedTicket && (
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <button
                    onClick={() => setView("list")}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={20} className="text-slate-600" />
                  </button>
                  <div className="flex-1">
                    <h2 className="font-bold text-lg text-slate-900">{selectedTicket.subject}</h2>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${getStatusLabel(selectedTicket.status).color}`}>
                        {getStatusLabel(selectedTicket.status).text}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {formatDate(selectedTicket.createdAt)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleHideTicket(selectedTicket.id)}
                    className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    حذف از لیست
                  </button>
                </div>

                {/* Messages */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 max-h-[500px] overflow-y-auto">
                  {selectedTicket.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderType === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[80%] ${
                        msg.senderType === "user"
                          ? "bg-primary-50 border-primary-100"
                          : "bg-slate-50 border-slate-200"
                      } border rounded-xl p-4`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs font-medium ${
                            msg.senderType === "admin" ? "text-amber-600" : "text-primary-600"
                          }`}>
                            {msg.senderType === "admin" ? "پاسخ ادمین" : msg.senderName}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {formatDate(msg.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 leading-6 whitespace-pre-wrap">{msg.message}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reply Form */}
                {selectedTicket.status !== "closed" ? (
                  <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="پاسخ خود را بنویسید..."
                      rows={3}
                      className="admin-input resize-none mb-3"
                    />
                    <div className="flex items-center justify-between">
                      {replyStatus === "error" && (
                        <span className="text-red-600 text-xs">خطا در ارسال پاسخ</span>
                      )}
                      <button
                        onClick={() => handleReply(selectedTicket.id)}
                        disabled={!replyMessage.trim() || replyStatus === "loading"}
                        className="admin-btn-primary flex items-center gap-2 disabled:opacity-50"
                      >
                        {replyStatus === "loading" ? (
                          <Loader size={14} className="animate-spin" />
                        ) : (
                          <Send size={14} />
                        )}
                        ارسال پاسخ
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 text-center">
                    <p className="text-slate-500 text-sm">این تیکت بسته شده و امکان ارسال پیام وجود ندارد.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
