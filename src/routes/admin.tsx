import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
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
  X,
  FileText,
  RefreshCw
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

function DashboardView({ session }: { session: Session }) {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);

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
        if (selectedInquiry?.id === id) {
          setSelectedInquiry(null);
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
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Inquiries List */}
          <div className={`lg:col-span-${selectedInquiry ? "7" : "12"} transition-all duration-300`}>
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
                    {filteredInquiries.map((inquiry) => (
                      <tr
                        key={inquiry.id}
                        onClick={() => setSelectedInquiry(inquiry)}
                        className={`group cursor-pointer transition-colors hover:bg-secondary/30 ${
                          selectedInquiry?.id === inquiry.id ? "bg-secondary/40" : ""
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
                            <ChevronRight size={16} className="text-muted-foreground/60" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Details Sidebar */}
          {selectedInquiry && (
            <div className="lg:col-span-5 border border-border bg-secondary/10 p-6 flex flex-col h-fit sticky top-[90px] animate-fadeIn">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <span className="eyebrow text-accent font-semibold">Inquiry Details</span>
                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-6 space-y-6">
                <div>
                  <h3 className="font-serif text-2xl font-normal leading-tight text-foreground">{selectedInquiry.name}</h3>
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Mail size={12} />
                    <a href={`mailto:${selectedInquiry.email}`} className="hover:underline">{selectedInquiry.email}</a>
                  </div>
                  {selectedInquiry.company && (
                    <div className="mt-3 text-xs bg-foreground text-background py-1 px-2.5 inline-block tracking-wider uppercase font-semibold">
                      {selectedInquiry.company}
                    </div>
                  )}
                </div>

                <div className="hairline"></div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="eyebrow text-[0.6rem] text-muted-foreground flex items-center gap-1.5">
                      <Calendar size={10} /> Date
                    </span>
                    <span className="text-sm font-light text-foreground">{formatDate(selectedInquiry.date)}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="eyebrow text-[0.6rem] text-muted-foreground flex items-center gap-1.5">
                      <MapPin size={10} /> Location
                    </span>
                    <span className="text-sm font-light text-foreground">{selectedInquiry.location || "—"}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="eyebrow text-[0.6rem] text-muted-foreground flex items-center gap-1.5">
                      <Users size={10} /> Guests
                    </span>
                    <span className="text-sm font-light text-foreground">{selectedInquiry.guests || "—"}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="eyebrow text-[0.6rem] text-muted-foreground flex items-center gap-1.5">
                      <FileText size={10} /> Submitted
                    </span>
                    <span className="text-xs font-light text-muted-foreground">{formatDateTime(selectedInquiry.created_at)}</span>
                  </div>
                </div>

                <div className="hairline"></div>

                <div className="space-y-2">
                  <span className="eyebrow text-[0.6rem] text-muted-foreground">Vision & Message</span>
                  <div className="bg-background/60 p-4 border border-border text-sm font-light leading-relaxed text-foreground/90 whitespace-pre-wrap font-sans">
                    {selectedInquiry.vision || <span className="italic text-muted-foreground">No custom vision provided.</span>}
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={(e) => handleDelete(selectedInquiry.id, e)}
                    className="eyebrow flex items-center gap-2 border border-destructive/40 text-destructive px-4 py-2.5 text-[0.65rem] transition-all hover:bg-destructive hover:text-background w-full justify-center"
                  >
                    <Trash2 size={12} /> Delete Lead
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
