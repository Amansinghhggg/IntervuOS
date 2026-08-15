import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import { SUPPORT_CONFIG } from "../../config/constants";
import {
  HelpCircle,
  Mic,
  Camera,
  Wifi,
  Key,
  FileText,
  MessageSquare,
  Mail,
  Send,
  Loader2,
  ChevronDown,
  Search,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldAlert,
  Headphones,
  RefreshCw,
  PhoneCall,
  History,
  Clock,
  MessageCircleQuestion,
  ShieldCheck,
  Lock,
  ArrowRight,
  BookOpen,
  LifeBuoy,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "../../ui/primitives/PageHeader";
import { GlassCard } from "../../ui/primitives/GlassCard";
import { SectionHeader } from "../../ui/primitives/SectionHeader";

const FAQ_DATA = [
  {
    id: "mic-permissions",
    category: "audio",
    icon: Mic,
    question: "How do I fix microphone permissions denied in my browser?",
    answer:
      "Click the lock/settings icon next to the URL address bar in Chrome or Edge, find 'Microphone', and toggle it to 'Allow'. Then refresh the tab. Ensure background calling apps (like Zoom or Teams) are fully closed so they do not hold exclusive access to the microphone.",
  },
  {
    id: "mic-no-sound",
    category: "audio",
    icon: Headphones,
    question: "The AI interviewer cannot hear me or volume meter is not moving.",
    answer:
      "Verify in your operating system sound settings that the intended microphone is set as the active default input device. We recommend using wired or low-latency Bluetooth headphones with a dedicated microphone to prevent audio feedback and room echo.",
  },
  {
    id: "camera-black-screen",
    category: "camera",
    icon: Camera,
    question: "Camera screen is black or showing 'No camera found' error.",
    answer:
      "1. Grant camera permissions in your browser bar.\n2. Verify your webcam privacy shutter is open.\n3. Close any background apps using the camera (Zoom, Meet, FaceTime).\n4. If using an external USB camera, reconnect it and refresh your browser.",
  },
  {
    id: "proctoring-warning",
    category: "camera",
    icon: ShieldAlert,
    question: "Why am I getting 'No face detected' or 'Multiple faces detected' alerts?",
    answer:
      "Our automated proctoring verifies candidate presence for interview validity. Keep your face centered in the camera feed with balanced frontal lighting. Avoid strong backlight sources (e.g., sitting directly in front of a bright window).",
  },
  {
    id: "disconnection-resume",
    category: "network",
    icon: RefreshCw,
    question: "What happens if my internet disconnects or browser closes during an interview?",
    answer:
      "Your session progress is automatically preserved question-by-question on our servers. Simply reopen your invitation link or re-enter your code on the Candidate Dashboard to continue where you left off without losing previous answers.",
  },
  {
    id: "network-lag",
    category: "network",
    icon: Wifi,
    question: "Audio/video is lagging or question loading is slow.",
    answer:
      "A stable internet connection with at least 3-5 Mbps bandwidth is recommended. Close bandwidth-intensive background downloads or streaming tabs. Connecting via a 5GHz Wi-Fi network or Ethernet provides the smoothest session experience.",
  },
  {
    id: "access-code-invalid",
    category: "access",
    icon: Key,
    question: "My interview invitation code or link says 'Expired' or 'Invalid'.",
    answer:
      "Double-check that the code was copied completely without trailing spaces. If the employer's campaign window has concluded, reach out to your recruiter or submit a support ticket below to request an extension.",
  },
  {
    id: "resume-update",
    category: "profile",
    icon: FileText,
    question: "How do I update my resume or candidate profile details?",
    answer:
      "Navigate to the Profile page from the sidebar menu to upload a new PDF resume or refresh your experience summary. Employers reviewing your interview evaluation will always see your most recent profile data.",
  },
];

const CATEGORIES = [
  { id: "all", label: "All topics" },
  { id: "audio", label: "Microphone & audio" },
  { id: "camera", label: "Camera & proctoring" },
  { id: "network", label: "Network & connection" },
  { id: "access", label: "Interview codes & access" },
  { id: "profile", label: "Resume & profile" },
];

export default function CandidateHelpSupportPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("faq"); // 'faq' | 'ticket' | 'history'

  // Search & Filter State for FAQs
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openFaqId, setOpenFaqId] = useState("mic-permissions");

  // Support Form State
  const [category, setCategory] = useState("audio");
  const [interviewCode, setInterviewCode] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tickets History State
  const [myTickets, setMyTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  const fetchMyTickets = async () => {
    setLoadingTickets(true);
    try {
      const { data } = await api.get("/complaints/my-tickets");
      if (data.success && Array.isArray(data.tickets)) {
        setMyTickets(data.tickets);
      }
    } catch (err) {
      console.warn("Failed to load tickets history:", err.message);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    fetchMyTickets();
  }, []);

  const filteredFaqs = FAQ_DATA.filter((faq) => {
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      return toast.error("Please provide a description of the issue.");
    }

    setIsSubmitting(true);
    try {
      const { data } = await api.post("/complaints", {
        category,
        interviewCode: interviewCode.trim() || undefined,
        message: message.trim(),
      });

      if (data.success) {
        toast.success(`Support ticket #${data.ticket?.ticketId || "created"} submitted!`);
        setMessage("");
        setInterviewCode("");
        await fetchMyTickets();
        setActiveTab("history");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit support request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="px-3 py-1 rounded-full bg-[var(--color-warning)]/10 text-[var(--color-warning)] border border-[var(--color-warning)]/30 text-xs font-medium flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Pending review
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="px-3 py-1 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/30 text-xs font-medium flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> In investigation
          </span>
        );
      case "RESOLVED":
        return (
          <span className="px-3 py-1 rounded-full bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/30 text-xs font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-success)]" /> Resolved
          </span>
        );
      case "CLOSED":
        return (
          <span className="px-3 py-1 rounded-full bg-[var(--color-text-muted)]/10 text-[var(--color-text-muted)] border border-[var(--color-text-muted)]/30 text-xs font-medium">
            Closed
          </span>
        );
      default:
        return null;
    }
  };

  const adminEmail = SUPPORT_CONFIG.ADMIN_EMAIL;
  const whatsappNumber = SUPPORT_CONFIG.WHATSAPP_NUMBER;
  const whatsappCleanNumber = SUPPORT_CONFIG.WHATSAPP_CLEAN_NUMBER;

  return (
    <div className="bg-[var(--color-canvas)] min-h-screen text-[var(--color-text-primary)] font-['Inter'] w-full px-4 sm:px-6 md:px-8 xl:px-10 py-6 sm:py-8 space-y-8">
      {/* Header */}
      <PageHeader
        badgeIcon={LifeBuoy}
        badgeText="Help & Support Desk"
        title="Candidate support center"
        description="Troubleshoot audio and video issues, submit a technical support ticket, or connect with our assistance team."
      />

      {/* Quick Contact & Channel Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* WhatsApp Card */}
        <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-success)]/10 border border-[var(--color-success)]/20 text-[var(--color-success)] flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-[var(--color-text-secondary)]">WhatsApp live desk</div>
              <div className="text-sm font-medium text-[var(--color-text-primary)]">{whatsappNumber}</div>
            </div>
          </div>
          <a
            href={`https://wa.me/${whatsappCleanNumber}?text=Hi%20IntervuOS%20Support,%20I%20am%20a%20candidate%20facing%20an%20issue%20with%20my%20interview.`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl text-xs font-medium text-[var(--color-success)] bg-[var(--color-success)]/10 hover:bg-[var(--color-success)]/20 border border-[var(--color-success)]/30 transition-all flex items-center gap-1.5"
          >
            Chat
          </a>
        </div>

        {/* Email Support Card */}
        <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] border border-[var(--color-border-active,#6338F6)]/30 text-[var(--color-text-accent,#C4B5FD)] flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-[var(--color-text-secondary)]">Direct support email</div>
              <div className="text-sm font-medium text-[var(--color-text-primary)] truncate">{adminEmail}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(adminEmail);
              toast.success("Support email copied to clipboard!");
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-medium text-[var(--color-text-accent,#C4B5FD)] bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] hover:bg-[var(--color-primary-tint,rgba(99,56,246,0.25))] border border-[var(--color-border-active,#6338F6)] transition-all shrink-0"
          >
            Copy
          </button>
        </div>

        {/* Emergency Recovery Tip */}
        <div className="p-5 rounded-2xl bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/30 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-warning)]/20 text-[var(--color-warning)] flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-[var(--color-warning)]">Session recovery tip</div>
            <div className="text-xs text-[var(--color-warning)]/80 leading-relaxed">
              If disconnected mid-interview, refresh your page or re-enter your code to resume your session automatically.
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-4 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("faq")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium tracking-tight transition-all ${activeTab === "faq"
              ? "bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)]"
              : "text-[var(--color-text-secondary)] border border-transparent hover:border-[var(--color-border)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)]"
            }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Frequently asked questions</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ticket")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium tracking-tight transition-all ${activeTab === "ticket"
              ? "bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)]"
              : "text-[var(--color-text-secondary)] border border-transparent hover:border-[var(--color-border)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)]"
            }`}
        >
          <Send className="w-4 h-4" />
          <span>Submit a support ticket</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium tracking-tight transition-all ${activeTab === "history"
              ? "bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)]"
              : "text-[var(--color-text-secondary)] border border-transparent hover:border-[var(--color-border)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)]"
            }`}
        >
          <History className="w-4 h-4" />
          <span>My ticket history</span>
          {myTickets.length > 0 && (
            <span className="ml-1 px-2 py-0.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-primary)]">
              {myTickets.length}
            </span>
          )}
        </button>
      </div>

      {/* VIEW 1: FAQ KNOWLEDGE BASE */}
      {activeTab === "faq" && (
        <div className="space-y-6">
          {/* Search and Category Filters */}
          <div className="space-y-4 max-w-3xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search troubleshooting guides (e.g. microphone, camera black screen, network disconnect)..."
                className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl pl-11 pr-4 py-3.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/60 focus:outline-none focus:border-[var(--color-primary)] transition-all"
              />
            </div>

            <div className="flex items-center justify-center gap-2 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium tracking-tight transition-all border ${activeCategory === cat.id
                      ? "bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border-[var(--color-border-active,#6338F6)]"
                      : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-border-active,#6338F6)]/50 hover:text-[var(--color-text-primary)]"
                    }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Accordion FAQ List */}
          <div className="max-w-4xl mx-auto space-y-3">
            {filteredFaqs.length === 0 ? (
              <GlassCard padding="p-8" className="text-center space-y-3">
                <AlertTriangle className="w-8 h-8 text-[var(--color-warning)] mx-auto opacity-80" />
                <h3 className="text-sm font-medium text-[var(--color-text-primary)]">No matching guides found</h3>
                <p className="text-xs text-[var(--color-text-secondary)] max-w-md mx-auto">
                  Try searching with different terms or submit a direct ticket to our support team.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("ticket")}
                  className="mt-2 px-4 py-2 rounded-xl text-xs font-medium text-[var(--color-text-accent,#C4B5FD)] bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] border border-[var(--color-border-active,#6338F6)] inline-flex items-center gap-1.5"
                >
                  Submit a ticket <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </GlassCard>
            ) : (
              filteredFaqs.map((faq) => {
                const isOpen = openFaqId === faq.id;
                const IconComponent = faq.icon;
                return (
                  <div
                    key={faq.id}
                    className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden transition-all hover:border-[var(--color-border-active,#6338F6)]/40"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                      className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left transition-colors hover:bg-[var(--color-surface-hover)]"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-8 h-8 rounded-xl bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] flex items-center justify-center shrink-0 border border-[var(--color-border-active,#6338F6)]/20">
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-[var(--color-text-primary)] tracking-tight">
                          {faq.question}
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-[var(--color-text-secondary)] shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-[var(--color-text-accent,#C4B5FD)]" : ""
                          }`}
                      />
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="px-5 pb-5 pt-1 text-sm text-[var(--color-text-secondary)] leading-relaxed font-normal whitespace-pre-line border-t border-[var(--color-border)]/50 bg-[var(--color-canvas)]/40 pl-16"
                        >
                          {faq.answer}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: SUBMIT SUPPORT TICKET */}
      {activeTab === "ticket" && (
        <div className="max-w-3xl mx-auto">
          <GlassCard padding="p-6 md:p-8" className="space-y-6">
            <SectionHeader
              icon={Send}
              title="Submit a technical issue or inquiry"
              subtitle="Our engineering and proctoring support desk typically responds within a few minutes."
            />

            <form onSubmit={handleSubmitTicket} className="space-y-5">
              {/* Account Information Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium tracking-tight mb-1.5 text-[var(--color-text-secondary)] flex items-center gap-1.5">
                    <Lock className="w-3 h-3 text-[var(--color-success)]" /> Account name
                  </label>
                  <input
                    type="text"
                    disabled
                    readOnly
                    value={user?.name || "Candidate User"}
                    className="w-full bg-[var(--color-canvas)]/60 border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-primary)] cursor-not-allowed opacity-80 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium tracking-tight mb-1.5 text-[var(--color-text-secondary)] flex items-center gap-1.5">
                    <Lock className="w-3 h-3 text-[var(--color-success)]" /> Account email
                  </label>
                  <input
                    type="email"
                    disabled
                    readOnly
                    value={user?.email || "candidate@example.com"}
                    className="w-full bg-[var(--color-canvas)]/60 border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-primary)] cursor-not-allowed opacity-80 font-medium"
                  />
                </div>
              </div>

              {/* Category and Code Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium tracking-tight mb-1.5 text-[var(--color-text-secondary)]">
                    Issue category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-border-active,#6338F6)] transition-colors"
                  >
                    <option value="audio">Microphone / Audio issue</option>
                    <option value="camera">Camera / Proctoring alert</option>
                    <option value="network">Network / Connection issue</option>
                    <option value="access">Invitation code / Link expired</option>
                    <option value="other">General inquiry / Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium tracking-tight mb-1.5 text-[var(--color-text-secondary)]">
                    Interview code (optional)
                  </label>
                  <input
                    type="text"
                    value={interviewCode}
                    onChange={(e) => setInterviewCode(e.target.value)}
                    placeholder="e.g. INT-928310"
                    className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-border-active,#6338F6)] transition-colors font-mono"
                  />
                </div>
              </div>

              {/* Message Description */}
              <div>
                <label className="block text-xs font-medium tracking-tight mb-1.5 text-[var(--color-text-secondary)]">
                  Describe the issue or error experienced *
                </label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please describe what happened (e.g. Mic input stopped working after answering Question 2)..."
                  className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-border-active,#6338F6)] transition-colors resize-none leading-relaxed"
                />
              </div>

              {/* Single Primary Action */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-sm font-medium tracking-tight rounded-xl transition-all shadow-lg shadow-[var(--color-primary)]/25 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting ticket...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit ticket
                  </>
                )}
              </button>
            </form>
          </GlassCard>
        </div>
      )}

      {/* VIEW 3: MY TICKET HISTORY */}
      {activeTab === "history" && (
        <div className="max-w-4xl mx-auto space-y-6">
          <SectionHeader
            icon={History}
            title="Ticket history & administrator replies"
            subtitle="Track live status and official responses from our support team."
          />

          {loadingTickets ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-7 h-7 animate-spin text-[var(--color-primary)]" />
            </div>
          ) : myTickets.length === 0 ? (
            <GlassCard padding="p-12" className="text-center space-y-4">
              <MessageCircleQuestion className="w-10 h-10 text-[var(--color-text-secondary)] mx-auto opacity-40" />
              <h3 className="text-base font-medium text-[var(--color-text-primary)]">No support tickets found</h3>
              <p className="text-xs text-[var(--color-text-secondary)] max-w-sm mx-auto">
                You haven't submitted any complaints or support tickets yet.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("ticket")}
                className="px-4 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-medium tracking-tight rounded-xl transition-all shadow-md shadow-[var(--color-primary)]/20"
              >
                Submit a support ticket
              </button>
            </GlassCard>
          ) : (
            <div className="space-y-4">
              {myTickets.map((ticket) => (
                <div
                  key={ticket._id || ticket.ticketId}
                  className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 sm:p-6 space-y-4"
                >
                  {/* Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--color-border)] pb-3">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="px-2.5 py-1 rounded-lg bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)]/30 text-xs font-mono font-medium">
                        {ticket.ticketId}
                      </span>
                      {getStatusBadge(ticket.status)}
                      <span className="px-2.5 py-1 rounded-lg bg-[var(--color-canvas)] text-[var(--color-text-secondary)] border border-[var(--color-border)] text-xs font-medium">
                        Category: {ticket.category}
                      </span>
                    </div>

                    <span className="text-xs font-medium text-[var(--color-text-secondary)] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(ticket.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {/* Candidate Message */}
                  <div className="space-y-1.5">
                    <div className="text-xs font-medium text-[var(--color-text-secondary)]">
                      Your submitted description:
                    </div>
                    <p className="text-sm text-[var(--color-text-primary)] leading-relaxed bg-[var(--color-canvas)]/60 p-4 rounded-xl border border-[var(--color-border)]/50">
                      {ticket.message}
                    </p>
                  </div>

                  {/* Admin Response Box */}
                  {ticket.adminNotes || ticket.adminNote ? (
                    <div className="p-4 rounded-xl bg-[var(--color-success)]/10 border border-[var(--color-success)]/30 space-y-2">
                      <div className="flex items-center gap-2 text-[var(--color-success)] text-xs font-medium">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Official administrator response</span>
                      </div>
                      <p className="text-sm text-[var(--color-success)]/90 leading-relaxed pl-6">
                        {ticket.adminNotes || ticket.adminNote}
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/20 text-[var(--color-warning)] text-xs font-medium flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>Review in progress. An administrator reply will appear here once updated.</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
