"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ChatBubble, Clock, Search, Loader, Send, ArrowLeft,
  CheckCircle, RefreshCw, XCircle, Filter,
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

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [replyMessage, setReplyMessage] = useState("");
  const [replyStatus, setReplyStatus] = useState<"idle" | "loading" | "error">("idle");

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (searchQuery) params.set("search", searchQuery);

      const res = await fetch(`/api/admin/tickets?${params}`);
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery]);

  const fetchTicketDetail = useCallback(async (ticketId: string) => {
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedTicket(data);
      }
    } catch {
      // Silent fail
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleReply = async (ticketId: string) => {
    if (!replyMessage.trim()) return;
    setReplyStatus("loading");

    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyMessage }),
      });

      if (res.ok) {
        setReplyMessage("");
        setReplyStatus("idle");
        fetchTicketDetail(ticketId);
        fetchTickets();
      } else {
        setReplyStatus("error");
      }
    } catch {
      setReplyStatus("error");
    }
  };

  const handleStatusChange = async (ticketId: string, action: "close" | "reopen") => {
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        fetchTicketDetail(ticketId);
        fetchTickets();
      }
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
      <h1 className="text-xl font-bold mb-6 text-slate-900">مدیریت تیکت‌ها</h1>

      {/* Filters */}
      <div className="admin-card mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="جستجو در موضوع، نام یا ایمیل..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-input pr-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            {["all", "open", "answered", "closed"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  statusFilter === status
                    ? "bg-primary-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {status === "all" ? "همه" : status === "open" ? "باز" : status === "answered" ? "پاسخ داده شده" : "بسته"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket List */}
        <div className="lg:col-span-1 space-y-3 max-h-[600px] overflow-y-auto">
          {loading ? (
            <div className="text-center py-12">
              <Loader size={32} className="mx-auto mb-4 text-slate-400 animate-spin" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="admin-card text-center py-12">
              <ChatBubble size={48} className="mx-auto mb-4 text-slate-300" />
              <p className="text-slate-500 text-sm">تیکتی یافت نشد</p>
            </div>
          ) : (
            tickets.map((ticket) => {
              const statusInfo = getStatusLabel(ticket.status);
              const lastMessage = ticket.messages[0];
              const isSelected = selectedTicket?.id === ticket.id;

              return (
                <div
                  key={ticket.id}
                  className={`admin-card cursor-pointer transition-all ${
                    isSelected ? "ring-2 ring-primary-500" : "hover:shadow-md"
                  }`}
                  onClick={() => fetchTicketDetail(ticket.id)}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-sm text-slate-900 truncate">{ticket.subject}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${statusInfo.color}`}>
                      {statusInfo.text}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs mb-2">{ticket.userName} - {ticket.userEmail}</p>
                  <p className="text-slate-400 text-xs line-clamp-1">{lastMessage?.message}</p>
                  <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
                    <Clock size={10} />
                    {formatDate(ticket.updatedAt)}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Ticket Detail */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <div className="space-y-4">
              {/* Header */}
              <div className="admin-card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <button
                        onClick={() => setSelectedTicket(null)}
                        className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer lg:hidden"
                      >
                        <ArrowLeft size={18} className="text-slate-600" />
                      </button>
                      <h2 className="font-bold text-lg text-slate-900">{selectedTicket.subject}</h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className={`px-2.5 py-1 rounded-full font-medium ${getStatusLabel(selectedTicket.status).color}`}>
                        {getStatusLabel(selectedTicket.status).text}
                      </span>
                      <span>{selectedTicket.userName}</span>
                      <span dir="ltr">{selectedTicket.userEmail}</span>
                      {selectedTicket.messages[0] && (
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {formatDate(selectedTicket.createdAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {selectedTicket.status === "closed" ? (
                      <button
                        onClick={() => handleStatusChange(selectedTicket.id, "reopen")}
                        className="px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw size={14} />
                        بازگشایی
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusChange(selectedTicket.id, "close")}
                        className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <XCircle size={14} />
                        بستن تیکت
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="admin-card max-h-[400px] overflow-y-auto space-y-4">
                {selectedTicket.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderType === "admin" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[85%] ${
                      msg.senderType === "admin"
                        ? "bg-primary-50 border-primary-100"
                        : "bg-slate-50 border-slate-200"
                    } border rounded-xl p-4`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs font-medium ${
                          msg.senderType === "admin" ? "text-primary-600" : "text-slate-600"
                        }`}>
                          {msg.senderType === "admin" ? `پاسخ ادمین (${msg.senderName})` : msg.senderName}
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
              {selectedTicket.status !== "closed" && (
                <div className="admin-card">
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="پاسخ ادمین را بنویسید..."
                    rows={3}
                    className="admin-input resize-none mb-3"
                  />
                  <div className="flex items-center justify-between">
                    {replyStatus === "error" && (
                      <span className="text-red-600 text-xs">خطا در ارسال پاسخ</span>
                    )}
                    <div className="flex gap-2 mr-auto">
                      <button
                        onClick={() => handleStatusChange(selectedTicket.id, "close")}
                        className="admin-btn-secondary flex items-center gap-1.5"
                      >
                        <XCircle size={14} />
                        بستن
                      </button>
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
                </div>
              )}
            </div>
          ) : (
            <div className="admin-card text-center py-20">
              <ChatBubble size={64} className="mx-auto mb-4 text-slate-200" />
              <p className="text-slate-400">یک تیکت انتخاب کنید</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
