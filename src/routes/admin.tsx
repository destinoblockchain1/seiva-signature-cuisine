import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo, TriadIcon } from "@/components/Logo";
import { toast, Toaster } from "sonner";
import type { Session } from "@supabase/supabase-js";
import { 
  LogOut, 
  Mail, 
  Lock, 
  Calendar, 
  MapPin, 
  Users, 
  Search, 
  Trash2, 
  ChevronRight, 
  FileText,
  RefreshCw,
  LayoutGrid,
  TableProperties,
  ArrowRight,
  Copy,
  Check
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Admin Portal | SEIVA" },
      { name: "description", content: "SEIVA Signature Cuisine Administration Panel" },
    ],
  }),
});

function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <TriadIcon size={32} className="animate-pulse text-foreground" />
          <span className="eyebrow text-xs text-muted-foreground">Loading Admin Portal</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" richColors />
      {!session ? (
        <LoginView />
      ) : (
        <DashboardView session={session} />
      )}
    </>
  );
}

function LoginView() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Welcome back!");
      }
    } catch (err: any) {
      toast.error("An unexpected error occurred.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      {/* Background Decorative Serif Symbol */}
      <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 select-none font-serif text-[32rem] leading-none text-secondary/30 md:text-[40rem]">
        S
      </div>

      <div className="w-full max-w-md border border-border bg-background/50 p-8 shadow-2xl backdrop-blur-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo subtext="SEIVA • ADMINISTRATION" size="md" align="center" />
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="eyebrow text-muted-foreground flex items-center gap-2">
              <Mail size={12} /> Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-0 border-b border-border bg-transparent py-3 text-base font-light text-foreground placeholder:text-muted-foreground/45 focus:border-foreground focus:outline-none focus:ring-0"
              placeholder="admin@seivacuisine.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="eyebrow text-muted-foreground flex items-center gap-2">
              <Lock size={12} /> Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-0 border-b border-border bg-transparent py-3 text-base font-light text-foreground placeholder:text-muted-foreground/45 focus:border-foreground focus:outline-none focus:ring-0"
              placeholder="••••••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="eyebrow w-full border border-foreground bg-foreground py-4 text-center text-background transition-all hover:bg-background hover:text-foreground disabled:opacity-40"
          >
            {submitting ? "Authenticating..." : "Sign In →"}
          </button>
        </form>
      </div>
    </div>
  );
}

const COLUMNS = [
  { id: "new", label: "New Leads", actionLabel: "Send Email", color: "border-t-accent" },
  { id: "contacted", label: "Contacted", actionLabel: "Invite to Call", color: "border-t-amber-700/60" },
  { id: "scheduled", label: "Scheduled", actionLabel: "Send Proposal", color: "border-t-blue-700/60" },
  { id: "proposal", label: "Proposal", actionLabel: "Confirm Booking", color: "border-t-purple-700/60" },
  { id: "confirmed", label: "Confirmed", actionLabel: "Archive Lead", color: "border-t-emerald-700/60" },
];

function DashboardView({ session }: { session: Session }) {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const [viewMode, setViewMode] = useState<"table" | "kanban">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("seiva_admin_view_mode") as "table" | "kanban") || "table";
    }
    return "table";
  });

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [draggedOverColumn, setDraggedOverColumn] = useState<string | null>(null);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem("seiva_admin_view_mode", viewMode);
  }, [viewMode]);

  const updateStatus = async (id: string, newStatus: string) => {
    // Optimistic UI update
    setInquiries(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
    
    try {
      const { error } = await supabase
        .from("inquiries")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) {
        toast.error(`Failed to update inquiry status to ${newStatus}`);
        fetchInquiries(); // rollback/refetch on failure
      } else {
        const col = COLUMNS.find(c => c.id === newStatus);
        toast.success(`Updated status to: ${col ? col.label : newStatus}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while updating status.");
      fetchInquiries();
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDraggedOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDraggedOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || draggedId;
    setDraggedOverColumn(null);
    setDraggedId(null);
    if (!id) return;
    
    const targetInquiry = inquiries.find(item => item.id === id);
    if (targetInquiry && (targetInquiry.status || "new") !== columnId) {
      await updateStatus(id, columnId);
    }
  };

  const triggerMailto = (email: string, subject: string, body: string) => {
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const link = document.createElement("a");
    link.href = mailtoUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyEmail = async (e: React.MouseEvent, email: string, id: string) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(email);
      setCopiedId(id);
      toast.success("Email copied to clipboard!");
      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    } catch (err) {
      console.error(err);
      toast.error("Failed to copy email.");
    }
  };

  const handleAction = async (inquiry: any, currentStatus: string) => {
    if (currentStatus === "new") {
      const subject = "SEIVA Signature Cuisine - Culinary Inquiry";
      const body = `Dear ${inquiry.name},\n\nThank you for reaching out to SEIVA. We received your culinary inquiry for your event on ${formatDate(inquiry.date)} with ${inquiry.guests} guests.\n\nWe would love to schedule a consultation call to discuss your menu vision in detail.\n\nWarm regards,\nSEIVA Culinary Team`;
      triggerMailto(inquiry.email, subject, body);
      setTimeout(() => {
        updateStatus(inquiry.id, "contacted");
      }, 500);
    } else if (currentStatus === "contacted") {
      const subject = "Meeting Invitation - SEIVA Signature Cuisine";
      const body = `Dear ${inquiry.name},\n\nFollowing up on our initial contact, let's schedule our menu consultation. Please let us know your preferred times.\n\nWarm regards,\nSEIVA Culinary Team`;
      triggerMailto(inquiry.email, subject, body);
      setTimeout(() => {
        updateStatus(inquiry.id, "scheduled");
      }, 500);
    } else if (currentStatus === "scheduled") {
      const subject = "Custom Menu Proposal - SEIVA Signature Cuisine";
      const body = `Dear ${inquiry.name},\n\nWe have drafted a custom menu proposal for your event. Let us know if you would like to review it together.\n\nWarm regards,\nSEIVA Culinary Team`;
      triggerMailto(inquiry.email, subject, body);
      setTimeout(() => {
        updateStatus(inquiry.id, "proposal");
      }, 500);
    } else if (currentStatus === "proposal") {
      if (confirm(`Confirm booking for ${inquiry.name}?`)) {
        await updateStatus(inquiry.id, "confirmed");
      }
    } else if (currentStatus === "confirmed") {
      if (confirm(`Archive lead for ${inquiry.name}? (This will remove the lead from the active inquiries board)`)) {
        try {
          const { error } = await supabase
            .from("inquiries")
            .delete()
            .eq("id", inquiry.id);

          if (error) {
            toast.error("Failed to archive inquiry.");
          } else {
            toast.success("Lead archived and deleted successfully.");
            setInquiries(prev => prev.filter(item => item.id !== inquiry.id));
            if (expandedId === inquiry.id) {
              setExpandedId(null);
            }
            if (expandedCardId === inquiry.id) {
              setExpandedCardId(null);
            }
          }
        } catch (err) {
          console.error(err);
          toast.error("An error occurred during archiving.");
        }
      }
    }
  };

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("inquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to load inquiries.");
        console.error(error);
      } else {
        setInquiries(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out.");
    } else {
      toast.success("Signed out successfully.");
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this inquiry?")) return;

    try {
      const { error } = await supabase
        .from("inquiries")
        .delete()
        .eq("id", id);

      if (error) {
        toast.error("Failed to delete inquiry.");
      } else {
        toast.success("Inquiry deleted successfully.");
        setInquiries(inquiries.filter((item) => item.id !== id));
        if (expandedId === id) {
          setExpandedId(null);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during deletion.");
    }
  };

  const filteredInquiries = inquiries.filter((inquiry) => {
    const searchString = `${inquiry.name} ${inquiry.email} ${inquiry.company || ""} ${inquiry.location || ""}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      const date = new Date(dateStr + "T00:00:00");
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateTimeStr: string) => {
    try {
      const date = new Date(dateTimeStr);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateTimeStr;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4 md:px-12">
          <Logo subtext="ADMIN PANEL" size="sm" align="start" />
          <div className="flex items-center gap-4">
            <span className="hidden text-xs text-muted-foreground md:inline-block">
              Authenticated as: <strong className="text-foreground">{session.user?.email}</strong>
            </span>
            <a
              href="/quotes"
              className="eyebrow flex items-center gap-2 border border-foreground bg-foreground px-4 py-2 text-[0.65rem] text-background transition-all hover:bg-background hover:text-foreground"
            >
              <FileText size={12} /> Criar Orçamento
            </a>
            <button
              onClick={handleSignOut}
              className="eyebrow flex items-center gap-2 border border-foreground/30 px-4 py-2 text-[0.65rem] transition-all hover:bg-foreground hover:text-background"
            >
              <LogOut size={12} /> Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-[1400px] px-6 py-10 md:px-12">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="editorial-display text-4xl md:text-5xl">Culinary Inquiries</h1>
            <p className="eyebrow mt-2 text-xs text-muted-foreground">
              {filteredInquiries.length} of {inquiries.length} Lead{inquiries.length !== 1 && "s"}
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex border border-border bg-background">
              <button
                onClick={() => setViewMode("table")}
                className={`flex h-10 w-10 items-center justify-center transition-colors ${
                  viewMode === "table"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-secondary/20 hover:text-foreground"
                }`}
                title="Table View"
              >
                <TableProperties size={16} />
              </button>
              <button
                onClick={() => setViewMode("kanban")}
                className={`flex h-10 w-10 items-center justify-center transition-colors ${
                  viewMode === "kanban"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-secondary/20 hover:text-foreground"
                }`}
                title="Kanban Board"
              >
                <LayoutGrid size={16} />
              </button>
            </div>

            <div className="relative flex-grow md:flex-grow-0">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-border bg-transparent py-2 pl-9 pr-4 text-sm font-light focus:border-foreground focus:outline-none focus:ring-0 md:w-64"
              />
            </div>
            <button
              onClick={fetchInquiries}
              disabled={loading}
              className="flex h-10 w-10 items-center justify-center border border-border transition-colors hover:border-foreground hover:bg-secondary/20"
              title="Refresh database"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="mt-8 grid grid-cols-1 gap-8">
          <div className="col-span-12">
            {loading && inquiries.length === 0 ? (
              <div className="flex h-64 items-center justify-center border border-dashed border-border">
                <span className="eyebrow text-xs text-muted-foreground animate-pulse">Fetching records...</span>
              </div>
            ) : filteredInquiries.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center border border-dashed border-border bg-secondary/10 p-8 text-center">
                <p className="font-serif text-lg italic text-muted-foreground">No inquiries found</p>
                <p className="mt-2 text-sm text-muted-foreground/80 font-light">
                  Submit a form on the homepage or adjust search parameters.
                </p>
              </div>
            ) : viewMode === "kanban" ? (
              <div className="flex gap-6 overflow-x-auto pb-6 -mx-6 px-6 md:-mx-12 md:px-12 scrollbar-thin select-none">
                {COLUMNS.map((column) => {
                  const columnInquiries = filteredInquiries.filter(
                    (item) => (item.status || "new") === column.id
                  );
                  const isOver = draggedOverColumn === column.id;
                  return (
                    <div
                      key={column.id}
                      onDragOver={(e) => handleDragOver(e, column.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, column.id)}
                      className={`flex flex-col flex-1 min-w-[230px] max-w-[270px] border-t-2 ${column.color} border border-border bg-secondary/5 p-3 transition-all duration-200 min-h-[550px] ${
                        isOver ? "bg-secondary/20 border-dashed border-foreground/40" : ""
                      }`}
                    >
                      {/* Column Header */}
                      <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/60">
                        <h3 className="eyebrow text-xs text-foreground font-semibold">
                          {column.label}
                        </h3>
                        <span className="text-[0.65rem] font-sans font-light bg-secondary/40 text-foreground px-2 py-0.5 border border-border/50">
                          {columnInquiries.length}
                        </span>
                      </div>

                      {/* Card List */}
                      <div className="flex flex-col gap-3 flex-grow overflow-y-auto">
                        {columnInquiries.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-border/30 bg-secondary/5">
                            <span className="font-serif italic text-xs text-muted-foreground/80">Empty stage</span>
                          </div>
                        ) : (
                          columnInquiries.map((inquiry) => {
                            const isExpanded = expandedCardId === inquiry.id;
                            return (
                              <div
                                key={inquiry.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, inquiry.id)}
                                onDragEnd={() => setDraggedId(null)}
                                onClick={() => setExpandedCardId(isExpanded ? null : inquiry.id)}
                                className={`group/card relative border border-border bg-background p-4 transition-all duration-200 hover:border-foreground/50 hover:shadow-sm cursor-grab active:cursor-grabbing select-none ${
                                  draggedId === inquiry.id ? "opacity-35 scale-95" : ""
                                }`}
                              >
                                <div className="flex justify-between items-start gap-2">
                                  <div>
                                    <h4 className="font-serif text-base text-foreground font-medium leading-tight group-hover/card:text-primary transition-colors">
                                      {inquiry.name}
                                    </h4>
                                    <div className="flex items-center gap-1 mt-0.5">
                                      <p className="text-[0.7rem] text-muted-foreground font-light truncate max-w-[110px]" title={inquiry.email}>
                                        {inquiry.email}
                                      </p>
                                      <button
                                        onClick={(e) => handleCopyEmail(e, inquiry.email, inquiry.id)}
                                        className="text-muted-foreground/50 hover:text-foreground transition-colors p-0.5"
                                        title="Copy email"
                                      >
                                        {copiedId === inquiry.id ? (
                                          <Check size={10} className="text-emerald-600" />
                                        ) : (
                                          <Copy size={10} />
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                  {inquiry.guests && (
                                    <span className="text-[0.65rem] bg-secondary/20 border border-border/40 px-1.5 py-0.5 text-muted-foreground font-light flex items-center gap-0.5 whitespace-nowrap">
                                      <Users size={8} /> {inquiry.guests}
                                    </span>
                                  )}
                                </div>

                                <div className="mt-3 space-y-1 text-[0.7rem] text-muted-foreground font-light">
                                  {inquiry.company && (
                                    <div className="text-[0.65rem] uppercase tracking-wider text-accent font-semibold mb-1">
                                      {inquiry.company}
                                    </div>
                                  )}
                                  {inquiry.date && (
                                    <div className="flex items-center gap-1.5">
                                      <Calendar size={10} className="text-muted-foreground/80" />
                                      <span>{formatDate(inquiry.date)}</span>
                                    </div>
                                  )}
                                  {inquiry.location && (
                                    <div className="flex items-center gap-1.5">
                                      <MapPin size={10} className="text-muted-foreground/80" />
                                      <span className="truncate max-w-[180px]">{inquiry.location}</span>
                                    </div>
                                  )}
                                </div>

                                {isExpanded && (
                                  <div className="mt-3 pt-3 border-t border-border/60 space-y-2 text-[0.75rem] transition-all duration-300">
                                    {inquiry.vision && (
                                      <div>
                                        <div className="eyebrow text-[0.55rem] text-muted-foreground">Vision & Message</div>
                                        <p className="mt-1 bg-secondary/15 p-2 border border-border/40 text-foreground font-sans font-light whitespace-pre-wrap max-h-32 overflow-y-auto">
                                          {inquiry.vision}
                                        </p>
                                      </div>
                                    )}
                                    <div className="flex justify-between items-center text-[0.65rem] text-muted-foreground font-light pt-1">
                                      <span>Submitted: {formatDateTime(inquiry.created_at)}</span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDelete(inquiry.id, e);
                                        }}
                                        className="text-muted-foreground hover:text-destructive p-1 transition-colors"
                                        title="Delete Lead"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  </div>
                                )}

                                <div className="mt-4 pt-3 border-t border-border/40 flex justify-end">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAction(inquiry, column.id);
                                    }}
                                    className="eyebrow w-full flex items-center justify-center gap-2 border border-foreground/30 py-2 text-[0.6rem] tracking-wider transition-all hover:bg-foreground hover:text-background active:scale-[0.98]"
                                  >
                                    {column.actionLabel}
                                    <ArrowRight size={10} />
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="overflow-x-auto border border-border">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-secondary/20">
                      <th className="eyebrow p-4 text-[0.6rem] text-muted-foreground">Submitted</th>
                      <th className="eyebrow p-4 text-[0.6rem] text-muted-foreground">Client</th>
                      <th className="eyebrow p-4 text-[0.6rem] text-muted-foreground">Event Date</th>
                      <th className="eyebrow p-4 text-[0.6rem] text-muted-foreground">Location</th>
                      <th className="eyebrow p-4 text-[0.6rem] text-muted-foreground">Guests</th>
                      <th className="p-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredInquiries.map((inquiry) => {
                      const isExpanded = expandedId === inquiry.id;
                      return (
                        <React.Fragment key={inquiry.id}>
                          <tr
                            onClick={() => setExpandedId(isExpanded ? null : inquiry.id)}
                            className={`group cursor-pointer transition-colors hover:bg-secondary/30 ${
                              isExpanded ? "bg-secondary/20" : ""
                            }`}
                          >
                            <td className="p-4 text-xs font-light text-muted-foreground whitespace-nowrap">
                              {formatDateTime(inquiry.created_at)}
                            </td>
                            <td className="p-4">
                              <div className="font-serif text-base text-foreground font-medium">{inquiry.name}</div>
                              <div className="text-xs text-muted-foreground font-light">{inquiry.email}</div>
                              {inquiry.company && (
                                <div className="mt-0.5 text-[0.65rem] uppercase tracking-wider text-accent font-semibold">{inquiry.company}</div>
                              )}
                            </td>
                            <td className="p-4 text-xs font-light whitespace-nowrap">
                              {formatDate(inquiry.date)}
                            </td>
                            <td className="p-4 text-xs font-light whitespace-nowrap">
                              {inquiry.location || "—"}
                            </td>
                            <td className="p-4 text-xs font-light">
                              {inquiry.guests || "—"}
                            </td>
                            <td className="p-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={(e) => handleDelete(inquiry.id, e)}
                                  className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-destructive transition-all"
                                  title="Delete record"
                                >
                                  <Trash2 size={14} />
                                </button>
                                <ChevronRight 
                                  size={16} 
                                  className={`text-muted-foreground/60 transition-transform duration-300 ${
                                    isExpanded ? "rotate-90" : ""
                                  }`} 
                                />
                              </div>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr className="bg-secondary/10 border-b border-border/80">
                              <td colSpan={6} className="p-6">
                                <div className="space-y-2">
                                  <div className="eyebrow text-[0.55rem] text-muted-foreground">Vision & Message</div>
                                  <div className="bg-background/60 p-4 border border-border text-sm font-light leading-relaxed text-foreground/90 whitespace-pre-wrap font-sans">
                                    {inquiry.vision || <span className="italic text-muted-foreground">No custom vision provided.</span>}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
