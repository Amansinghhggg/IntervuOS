import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Clock,
  Video,
  FileText,
  BarChart3,
  Users,
  ChevronDown,
  Layers,
  Sliders,
  Cpu,
  Target,
  FileDown,
  RotateCcw,
  Zap,
  HelpCircle,
  Camera,
  MessageSquare,
  Building2,
  GraduationCap,
  ExternalLink,
  Shield,
  EyeOff,
  Check,
  LayoutDashboard,
  UserCheck
} from "lucide-react";

/**
 * Reusable screenshot placeholder box with bordered container, icon, and descriptive caption.
 */
function ScreenshotPlaceholder({ caption, alt, height = "h-48 sm:h-64" }) {
  return (
    <div className={`w-full ${height} rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface-hover)]/30 flex flex-col items-center justify-center p-6 text-center space-y-2 transition-colors`}>
      <div className="w-10 h-10 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] shadow-xs">
        <Camera className="w-5 h-5 text-[var(--color-text-accent)]" />
      </div>
      <div className="space-y-0.5 max-w-sm">
        <p className="text-xs font-medium text-[var(--color-text-primary)]">
          {caption || "Product Interface Preview"}
        </p>
        <p className="text-[11px] text-[var(--color-text-muted)]">
          {alt || "Actual workspace visualization"}
        </p>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { user, googleLogin } = useAuth();
  const navigate = useNavigate();

  // Audience Tab: 'candidate' | 'employer' (defaults to candidate)
  const [audience, setAudience] = useState("candidate");
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const getDashboardRoute = (currentUser) => {
    const u = currentUser || user;
    if (!u) return "/";
    if (!u.role) return "/select-role";
    if (u.role === "admin") return "/admin";
    if (u.role === "employer") return "/employer/dashboard";
    return "/candidate/mock-interview";
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) return;
    try {
      const data = await googleLogin(credentialResponse.credential);
      toast.success(`Welcome to IntervuOS, ${data.user.name || "User"}!`);
      if (!data.user.role) {
        navigate("/select-role");
      } else if (data.user.role === "employer") {
        navigate("/employer/dashboard");
      } else if (data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/candidate/mock-interview");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Google authentication failed. Please try again.");
    }
  };

  // Candidate pricing bundles
  const candidateBundles = [
    {
      id: "starter",
      title: "Starter Practice",
      price: 99,
      credits: 45,
      rate: "₹2.20 / credit",
      description: "Ideal for rapid diagnostic checks & 2-3 standard mock interviews.",
      features: [
        "45 AI interview credits",
        "Real-time voice follow-ups",
        "STAR-method competency scoring",
        "Credits never expire"
      ],
      recommended: false
    },
    {
      id: "pro",
      title: "Pro Placement",
      price: 199,
      credits: 150,
      rate: "₹1.33 / credit",
      description: "Our most popular pack for comprehensive multi-topic preparation.",
      features: [
        "150 AI interview credits",
        "Adaptive sub-question probing",
        "Detailed STAR rubric breakdown",
        "Downloadable PDF candidate reports",
        "Credits never expire"
      ],
      recommended: true
    },
    {
      id: "master",
      title: "Master Placement",
      price: 399,
      credits: 400,
      rate: "₹1.00 / credit",
      description: "Maximum volume value for company-specific interview mastery.",
      features: [
        "400 AI interview credits",
        "Unlimited practice sessions",
        "Behavioral & coding question sandbox",
        "Full transcript & audio review",
        "Credits never expire"
      ],
      recommended: false
    }
  ];

  // Shared FAQs (Mixed candidate & employer)
  const faqs = [
    {
      question: "Are my candidate practice interviews private?",
      audienceTag: "Candidate",
      answer:
        "Yes, 100% private. Practice interviews you conduct in your mock interview studio are strictly confidential and visible only to you. They are never shared with any employer unless you explicitly participate in a verified employer campaign."
    },
    {
      question: "How do interview credits work in IntervuOS?",
      audienceTag: "Candidate",
      answer:
        "Credits correspond directly to session time: 1 minute of AI technical interview consumes exactly 1 Credit. All features — including speech synthesis, STAR response scoring, transcript logs, and PDF export — are included."
    },
    {
      question: "Do candidate credits ever expire?",
      audienceTag: "Candidate",
      answer:
        "No. All purchased credits and your 15 starter signup bonus credits remain in your wallet indefinitely until you use them."
    },
    {
      question: "How does employer company verification work?",
      audienceTag: "Employer",
      answer:
        "To protect candidate trust and privacy, employer accounts undergo a brief review (company name & official website). Once approved, your Verified badge activates immediately and candidate campaign publishing is enabled."
    },
    {
      question: "Can employers configure custom questions and target answers?",
      audienceTag: "Employer",
      answer:
        "Yes. Employers can choose from three question generation modes: AI-Adaptive (real-time dynamic follow-ups), Employer Preset (exact custom questions & benchmark answer keys), or Hybrid."
    },
    {
      question: "Can an employer re-enroll a candidate if their session is interrupted?",
      audienceTag: "Employer",
      answer:
        "Yes. From your campaign evaluation dashboard, you can 1-click re-enroll any candidate who experienced a connection or hardware drop, resetting their attempt cleanly."
    }
  ];

  return (
    <div className="w-full min-h-screen bg-[var(--color-canvas)] text-[var(--color-text-primary)] font-['Inter'] selection:bg-[var(--color-primary-tint)] selection:text-[var(--color-text-accent)]">

      {/* 1. STICKY NAV BAR (Shared) */}
      <nav className="sticky top-0 z-50 w-full bg-[var(--color-canvas)]/90 backdrop-blur-md border-b border-[var(--color-border)] transition-colors">
        <div className="w-full px-4 sm:px-6 md:px-8 xl:px-10 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 rounded-xl bg-[var(--color-primary)] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              IO
            </div>
            <span className="text-base font-medium tracking-tight text-[var(--color-text-primary)]">
              Intervu<span className="text-[var(--color-text-accent)]">OS</span>
            </span>
          </Link>

          {/* Nav Links (Desktop) */}
          <div className="hidden md:flex items-center gap-6 text-xs font-medium text-[var(--color-text-secondary)]">
            <button
              onClick={() => {
                setAudience("candidate");
                scrollToSection("how-it-works");
              }}
              className="hover:text-[var(--color-text-primary)] transition-colors"
            >
              For Candidates
            </button>
            <button
              onClick={() => {
                setAudience("employer");
                scrollToSection("how-it-works");
              }}
              className="hover:text-[var(--color-text-primary)] transition-colors"
            >
              For Employers
            </button>
            <button
              onClick={() => scrollToSection("features")}
              className="hover:text-[var(--color-text-primary)] transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("security")}
              className="hover:text-[var(--color-text-primary)] transition-colors"
            >
              Trust & Security
            </button>
            <button
              onClick={() => scrollToSection("pricing")}
              className="hover:text-[var(--color-text-primary)] transition-colors"
            >
              Pricing
            </button>
            <button
              onClick={() => scrollToSection("faq")}
              className="hover:text-[var(--color-text-primary)] transition-colors"
            >
              FAQ
            </button>
          </div>

          {/* Auth Action Area (Google Single Sign-On / Go to Dashboard) */}
          <div className="flex items-center gap-3 shrink-0">
            {user ? (
              <button
                onClick={() => navigate(getDashboardRoute())}
                className="px-4 py-2 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-xs font-medium text-white transition-all shadow-xs flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Go to Dashboard</span>
              </button>
            ) : (
              <div className="flex items-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error("Google authentication failed")}
                  theme="filled_blue"
                  size="medium"
                  shape="pill"
                  text="continue_with"
                />
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* 2. AUDIENCE SWITCHER CONTROL (Persistent Toggle) */}
      <div className="w-full px-4 sm:px-6 md:px-8 xl:px-10 pt-8 sm:pt-12 flex justify-center">
        <div className="p-1 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] inline-flex items-center gap-1 shadow-xs">
          <button
            onClick={() => setAudience("candidate")}
            className={`px-4 sm:px-6 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${audience === "candidate"
                ? "bg-[var(--color-primary)] text-white shadow-xs"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>For Candidates</span>
          </button>
          <button
            onClick={() => setAudience("employer")}
            className={`px-4 sm:px-6 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${audience === "employer"
                ? "bg-[var(--color-primary)] text-white shadow-xs"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>For Employers</span>
          </button>
        </div>
      </div>

      {/* 3. HERO SECTION (Audience-dependent) */}
      <section className="w-full px-4 sm:px-6 md:px-8 xl:px-10 py-10 sm:py-16">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          {audience === "candidate" ? (
            <>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-primary-tint)] text-[var(--color-text-accent)] border border-[var(--color-border-active)]/30 text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>15 free practice credits on signup • No credit card needed</span>
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-[var(--color-text-primary)] leading-[1.15]">
                Walk into your next interview already knowing what to expect.
              </h1>
              <p className="text-sm sm:text-lg text-[var(--color-text-secondary)] max-w-3xl mx-auto leading-relaxed font-normal">
                Practice with an adaptive AI voice interviewer that asks follow-ups, analyzes your answers in real time, and delivers instant STAR-method performance scoring.
              </p>

              {/* Hero Action Button Area */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                {user ? (
                  <button
                    onClick={() => navigate(getDashboardRoute())}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs sm:text-sm font-medium transition-all shadow-xs inline-flex items-center justify-center gap-2"
                  >
                    <span>Go to Candidate Studio</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="flex justify-center scale-105">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => toast.error("Google authentication failed")}
                      theme="filled_blue"
                      size="large"
                      shape="pill"
                      text="continue_with"
                    />
                  </div>
                )}
                <button
                  onClick={() => scrollToSection("how-it-works")}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-xs sm:text-sm font-medium text-[var(--color-text-primary)] transition-all"
                >
                  See how it works
                </button>
              </div>

              {/* Hero Screenshot Placeholder (Candidate Mock Interview Studio) */}
              <div className="pt-6 max-w-4xl mx-auto">
                <ScreenshotPlaceholder
                  caption="Mock Interview Studio: Real-time voice synthesis, adaptive question stream, and timer"
                  alt="Candidate mock interview studio preview"
                  height="h-64 sm:h-80"
                />
              </div>
            </>
          ) : (
            <>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-primary-tint)] text-[var(--color-text-accent)] border border-[var(--color-border-active)]/30 text-xs font-medium">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>100% Autonomous screening • Zero recruiter scheduling overhead</span>
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-[var(--color-text-primary)] leading-[1.15]">
                Screen more candidates without more interviewing hours.
              </h1>
              <p className="text-sm sm:text-lg text-[var(--color-text-secondary)] max-w-3xl mx-auto leading-relaxed font-normal">
                Automate technical voice screenings with an adaptive AI interviewer that evaluates competence against your exact job standard and generates structured candidate scorecards.
              </p>

              {/* Hero Action Button Area */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                {user ? (
                  <button
                    onClick={() => navigate(getDashboardRoute())}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs sm:text-sm font-medium transition-all shadow-xs inline-flex items-center justify-center gap-2"
                  >
                    <span>Go to Employer Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="flex justify-center scale-105">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => toast.error("Google authentication failed")}
                      theme="filled_blue"
                      size="large"
                      shape="pill"
                      text="continue_with"
                    />
                  </div>
                )}
                <button
                  onClick={() => scrollToSection("how-it-works")}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-xs sm:text-sm font-medium text-[var(--color-text-primary)] transition-all"
                >
                  See how it works
                </button>
              </div>

              {/* Hero Screenshot Placeholder (Employer Evaluation Scorecard) */}
              <div className="pt-6 max-w-4xl mx-auto">
                <ScreenshotPlaceholder
                  caption="Employer Evaluation Workspace: Per-metric competence breakdown, full video replay, and question markers"
                  alt="Employer candidate scorecard preview"
                  height="h-64 sm:h-80"
                />
              </div>
            </>
          )}
        </div>
      </section>

      {/* 4. HOW IT WORKS (Audience-dependent Horizontal Sequence) */}
      <section id="how-it-works" className="w-full px-4 sm:px-6 md:px-8 xl:px-10 py-12 sm:py-16 border-t border-[var(--color-border)] bg-[var(--color-surface)]/30">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--color-primary-tint)] text-[var(--color-text-accent)] border border-[var(--color-border-active)]/30 text-xs font-medium inline-block">
              {audience === "candidate" ? "Candidate Workflow" : "Employer Workflow"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--color-text-primary)]">
              How IntervuOS works
            </h2>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] font-normal">
              {audience === "candidate"
                ? "From selecting technical topics to receiving your full diagnostic scorecard in minutes."
                : "From configuring your campaign rubric to reviewing verified candidate scorecards."}
            </p>
          </div>

          {audience === "candidate" ? (
            /* Candidate 3-Step Sequence */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 space-y-4 shadow-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-8 h-8 rounded-xl bg-[var(--color-primary-tint)] text-[var(--color-text-accent)] border border-[var(--color-border-active)]/30 flex items-center justify-center text-xs font-medium">
                    1
                  </div>
                  <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                    Pick role & syllabus topics
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-normal">
                    Select your target job title, seniority level, and specific technical focus areas (React, Node, System Design, SQL, etc.).
                  </p>
                </div>
                <ScreenshotPlaceholder
                  caption="Topic & syllabus selector"
                  alt="Role selection screenshot"
                  height="h-36"
                />
              </div>

              {/* Step 2 */}
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 space-y-4 shadow-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-8 h-8 rounded-xl bg-[var(--color-primary-tint)] text-[var(--color-text-accent)] border border-[var(--color-border-active)]/30 flex items-center justify-center text-xs font-medium">
                    2
                  </div>
                  <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                    Take timed AI voice interview
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-normal">
                    The voice-enabled AI interviewer asks realistic technical questions, clarifies answers, and probes technical depth in real time.
                  </p>
                </div>
                <ScreenshotPlaceholder
                  caption="Live voice interview studio"
                  alt="Voice interview studio preview"
                  height="h-36"
                />
              </div>

              {/* Step 3 */}
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 space-y-4 shadow-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-8 h-8 rounded-xl bg-[var(--color-primary-tint)] text-[var(--color-text-accent)] border border-[var(--color-border-active)]/30 flex items-center justify-center text-xs font-medium">
                    3
                  </div>
                  <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                    Get instant STAR score & report
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-normal">
                    Receive actionable competency radar charts, audio playback with synchronized transcript, and a 1-click downloadable PDF.
                  </p>
                </div>
                <ScreenshotPlaceholder
                  caption="STAR score & radar analysis report"
                  alt="Diagnostic report preview"
                  height="h-36"
                />
              </div>
            </div>
          ) : (
            /* Employer 4-Step Sequence */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Step 1 */}
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 space-y-4 shadow-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-8 h-8 rounded-xl bg-[var(--color-primary-tint)] text-[var(--color-text-accent)] border border-[var(--color-border-active)]/30 flex items-center justify-center text-xs font-medium">
                    1
                  </div>
                  <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                    Create a campaign
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-normal">
                    Configure the job role, syllabus topics, duration per question, and question generation strategy.
                  </p>
                </div>
                <ScreenshotPlaceholder
                  caption="Campaign creation wizard"
                  alt="Campaign setup preview"
                  height="h-32"
                />
              </div>

              {/* Step 2 */}
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 space-y-4 shadow-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-8 h-8 rounded-xl bg-[var(--color-primary-tint)] text-[var(--color-text-accent)] border border-[var(--color-border-active)]/30 flex items-center justify-center text-xs font-medium">
                    2
                  </div>
                  <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                    Invite candidates
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-normal">
                    Enroll candidates via automated email invites or distribute your campaign's unique 6-character code.
                  </p>
                </div>
                <ScreenshotPlaceholder
                  caption="Candidate invitations & roster"
                  alt="Candidate invitation preview"
                  height="h-32"
                />
              </div>

              {/* Step 3 */}
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 space-y-4 shadow-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-8 h-8 rounded-xl bg-[var(--color-primary-tint)] text-[var(--color-text-accent)] border border-[var(--color-border-active)]/30 flex items-center justify-center text-xs font-medium">
                    3
                  </div>
                  <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                    Candidates interview with AI
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-normal">
                    Applicants complete their voice and technical evaluation 24/7 with built-in presence monitoring.
                  </p>
                </div>
                <ScreenshotPlaceholder
                  caption="Candidate interview room"
                  alt="AI interview room preview"
                  height="h-32"
                />
              </div>

              {/* Step 4 */}
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 space-y-4 shadow-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-8 h-8 rounded-xl bg-[var(--color-primary-tint)] text-[var(--color-text-accent)] border border-[var(--color-border-active)]/30 flex items-center justify-center text-xs font-medium">
                    4
                  </div>
                  <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                    Review scored reports
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-normal">
                    Inspect quantitative skill scores, audio/video replay with question scrub markers, and shareable team links.
                  </p>
                </div>
                <ScreenshotPlaceholder
                  caption="Candidate evaluation scorecard"
                  alt="Evaluation report preview"
                  height="h-32"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5. FEATURES GRID (Audience-dependent) */}
      <section id="features" className="w-full px-4 sm:px-6 md:px-8 xl:px-10 py-12 sm:py-16 border-t border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--color-primary-tint)] text-[var(--color-text-accent)] border border-[var(--color-border-active)]/30 text-xs font-medium inline-block">
              Core Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--color-text-primary)]">
              {audience === "candidate"
                ? "Designed to build technical interview mastery"
                : "Engineered for high-signal technical recruitment"}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] font-normal">
              {audience === "candidate"
                ? "Everything you need to benchmark and elevate your communication and technical responses."
                : "Streamline your preliminary technical screen with zero manual interviewer fatigue."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {audience === "candidate" ? (
              /* Candidate 6 Features */
              <>
                <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3 shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-tint)] text-[var(--color-text-accent)] border border-[var(--color-border-active)]/30 flex items-center justify-center">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                    Adaptive AI questioning
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-normal">
                    Dynamically generates context-aware follow-ups tailored to your previous responses to probe depth.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3 shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-tint)] text-[var(--color-text-accent)] border border-[var(--color-border-active)]/30 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                    STAR-method evaluation
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-normal">
                    Scores answers against Situation, Task, Action, and Result rubrics for structured feedback.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3 shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-tint)] text-[var(--color-text-accent)] border border-[var(--color-border-active)]/30 flex items-center justify-center">
                    <FileDown className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                    Downloadable PDF reports
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-normal">
                    Export polished diagnostic reports with skill breakdowns and improvement recommendations in 1 click.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3 shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-tint)] text-[var(--color-text-accent)] border border-[var(--color-border-active)]/30 flex items-center justify-center">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                    Session replay & transcripts
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-normal">
                    Review your complete audio answers with interactive timeline markers to pinpoint hesitation spots.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3 shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-tint)] text-[var(--color-text-accent)] border border-[var(--color-border-active)]/30 flex items-center justify-center">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                    Role-specific topic selection
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-normal">
                    Configure custom syllabus tracks across frontend, backend, system architecture, database, and devops.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3 shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-tint)] text-[var(--color-text-accent)] border border-[var(--color-border-active)]/30 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                    Credits that never expire
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-normal">
                    All purchased credits stay safely in your account indefinitely, giving you total prep flexibility.
                  </p>
                </div>
              </>
            ) : (
              /* Employer 6 Features */
              <>
                <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3 shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-tint)] text-[var(--color-text-accent)] border border-[var(--color-border-active)]/30 flex items-center justify-center">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                    Three question modes
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-normal">
                    Choose between AI-Adaptive follow-ups, Employer Preset questions with benchmark answers, or Hybrid.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3 shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-tint)] text-[var(--color-text-accent)] border border-[var(--color-border-active)]/30 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                    Bulk candidate invites
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-normal">
                    Enroll cohorts via automated email invitations, shareable 6-digit campaign codes, or CSV uploads.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3 shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-tint)] text-[var(--color-text-accent)] border border-[var(--color-border-active)]/30 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                    Structured per-metric scoring
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-normal">
                    Calibrated rubrics score technical depth, problem-solving structure, and communication clarity.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3 shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-tint)] text-[var(--color-text-accent)] border border-[var(--color-border-active)]/30 flex items-center justify-center">
                    <Video className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                    Full video replay & markers
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-normal">
                    Review candidate recordings with interactive question scrub points on the player progress bar.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3 shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-tint)] text-[var(--color-text-accent)] border border-[var(--color-border-active)]/30 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                    Verified employer trust badge
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-normal">
                    Assures candidates that invitations originate from legitimate hiring organizations.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3 shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-tint)] text-[var(--color-text-accent)] border border-[var(--color-border-active)]/30 flex items-center justify-center">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                    Campaign management & re-enroll
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-normal">
                    Complete administrative control to close campaigns, edit syllabi, or re-enroll disconnected applicants.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 6. TRUST & SECURITY (SHARED — Fact-based, calm, flat) */}
      <section id="security" className="w-full px-4 sm:px-6 md:px-8 xl:px-10 py-12 sm:py-16 border-t border-[var(--color-border)] bg-[var(--color-surface)]/20">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--color-primary-tint)] text-[var(--color-text-accent)] border border-[var(--color-border-active)]/30 text-xs font-medium inline-block">
              Data Privacy & Security
            </span>
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--color-text-primary)]">
              Built on transparent, encrypted infrastructure
            </h2>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] font-normal">
              Candidate and employer data is safeguarded with strict access boundaries, retention limits, and encryption.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Trust Point 1 */}
            <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3 shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <Check className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                What is recorded and why
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-normal">
                Audio is transcribed strictly for technical response evaluation and feedback. Video presence verification is captured only when required for formal employer recruitment campaigns.
              </p>
            </div>

            {/* Trust Point 2 */}
            <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3 shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                30-day retention & encryption
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-normal">
                All session recordings, transcripts, and evaluation scorecards are secured with 256-bit encryption in transit and at rest. Data is automatically pruned after 30 days or immediately upon user request.
              </p>
            </div>

            {/* Trust Point 3 */}
            <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3 shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <EyeOff className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                Strict access control
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-normal">
                Candidate practice mock interviews are 100% private to the candidate. Formal campaign evaluations are accessible only to verified hiring team administrators from that specific organization.
              </p>
            </div>
          </div>

          {/* Disclosure Modal Screenshot Placeholder */}
          <div className="max-w-3xl mx-auto pt-2">
            <ScreenshotPlaceholder
              caption="Pre-Session Disclosure & Permissions Modal: Explicit candidate consent before recording begins"
              alt="Pre-session transparency modal preview"
              height="h-44 sm:h-56"
            />
          </div>
        </div>
      </section>

      {/* 7. PRICING SECTION (Audience-dependent) */}
      <section id="pricing" className="w-full px-4 sm:px-6 md:px-8 xl:px-10 py-12 sm:py-16 border-t border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--color-primary-tint)] text-[var(--color-text-accent)] border border-[var(--color-border-active)]/30 text-xs font-medium inline-block">
              {audience === "candidate" ? "Candidate Pricing" : "Employer Plans"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--color-text-primary)]">
              {audience === "candidate"
                ? "Simple, pay-as-you-go credit packs"
                : "Custom recruitment drives & enterprise screening"}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] font-normal">
              {audience === "candidate"
                ? "1 Credit = 1 Minute of AI technical interview practice. No recurring monthly subscriptions."
                : "Bespoke campaign setup, high-volume applicant screening, and dedicated prompt engineering."}
            </p>
          </div>

          {audience === "candidate" ? (
            /* Candidate Pricing Tiers */
            <div className="space-y-6">
              {/* 15 Free Credits Banner */}
              <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-medium text-[var(--color-text-primary)]">15 Free Credits on Signup</span>
                    <p className="text-[11px] text-[var(--color-text-secondary)]">Take your first full diagnostic interview with zero upfront commitment.</p>
                  </div>
                </div>
                {user ? (
                  <button
                    onClick={() => navigate(getDashboardRoute())}
                    className="px-3.5 py-1.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-medium transition-colors shrink-0 shadow-xs"
                  >
                    Start Free
                  </button>
                ) : (
                  <div className="shrink-0">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => toast.error("Google authentication failed")}
                      theme="filled_blue"
                      size="medium"
                      shape="pill"
                      text="continue_with"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {candidateBundles.map((bundle) => {
                  const isRec = bundle.recommended;
                  return (
                    <div
                      key={bundle.id}
                      className={`rounded-2xl p-6 sm:p-8 bg-[var(--color-surface)] flex flex-col justify-between space-y-6 transition-all shadow-xs relative ${isRec
                          ? "border border-[var(--color-border-active)]"
                          : "border border-[var(--color-border)]"
                        }`}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                            {bundle.title}
                          </span>
                          {isRec && (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--color-primary-tint)] text-[var(--color-text-accent)] border border-[var(--color-border-active)]/40">
                              Recommended
                            </span>
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl sm:text-4xl font-medium text-[var(--color-text-primary)]">
                              ₹{bundle.price}
                            </span>
                            <span className="text-xs text-[var(--color-text-secondary)]">
                              for {bundle.credits} credits
                            </span>
                          </div>
                          <div className="text-[11px] text-[var(--color-text-accent)] font-medium">
                            {bundle.rate}
                          </div>
                        </div>

                        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-normal">
                          {bundle.description}
                        </p>

                        <div className="pt-2 border-t border-[var(--color-border)] space-y-2.5">
                          {bundle.features.map((f, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span>{f}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2">
                        {user ? (
                          <button
                            onClick={() => navigate("/candidate/subscriptions")}
                            className="w-full py-2.5 rounded-xl bg-[var(--color-primary-tint)] hover:bg-[var(--color-primary-tint)]/80 text-[var(--color-text-accent)] border border-[var(--color-border-active)]/40 text-xs font-medium transition-all flex items-center justify-center gap-1.5"
                          >
                            <span>Buy {bundle.credits} Credits</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <div className="w-full flex justify-center">
                            <GoogleLogin
                              onSuccess={handleGoogleSuccess}
                              onError={() => toast.error("Google authentication failed")}
                              theme="filled_blue"
                              size="medium"
                              shape="pill"
                              text="continue_with"
                              width="240"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Employer Pricing Placeholder */
            /* NOTE: Employer volume pricing placeholder. Contact sales / demo actions connect with recruitment operations team. */
            <div className="max-w-4xl mx-auto bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-10 space-y-6 shadow-xs">
              <div className="space-y-2 text-center max-w-xl mx-auto">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
                  <Building2 className="w-3 h-3" />
                  <span>Custom Enterprise & Volume Drives</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-medium text-[var(--color-text-primary)] tracking-tight">
                  Tailored plans for hiring teams of all sizes
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                  Whether you're screening 20 candidates for a specialized engineering role or running a 1,000+ candidate campus hiring drive, we configure bespoke campaign packages with dedicated SLA support.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] space-y-1.5">
                  <span className="text-xs font-medium text-[var(--color-text-primary)] block">Standard Campaigns</span>
                  <p className="text-[11px] text-[var(--color-text-secondary)]">Self-serve campaign builder with automated candidate evaluation and video replays.</p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] space-y-1.5">
                  <span className="text-xs font-medium text-[var(--color-text-primary)] block">Volume Hiring Drives</span>
                  <p className="text-[11px] text-[var(--color-text-secondary)]">Campus screening, automated applicant ranking, and multi-track evaluations.</p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] space-y-1.5">
                  <span className="text-xs font-medium text-[var(--color-text-primary)] block">Bespoke Rubrics</span>
                  <p className="text-[11px] text-[var(--color-text-secondary)]">Dedicated AI prompt calibration against your internal engineering standards.</p>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href="https://wa.me/8655021064?text=Hello%20IntervuOS%20Team,%20I'm%20interested%20in%20an%20Employer%20Custom%20Hiring%20Drive."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium transition-colors inline-flex items-center justify-center gap-2 shadow-xs"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat on WhatsApp</span>
                </a>
                <Link
                  to="/employer/contact"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-hover)]/80 text-[var(--color-text-primary)] border border-[var(--color-border)] text-xs font-medium transition-colors inline-flex items-center justify-center gap-2"
                >
                  <HelpCircle className="w-4 h-4 text-[var(--color-text-accent)]" />
                  <span>Contact sales & support</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 8. FAQ (SHARED — Accordion pattern with audience tags) */}
      <section id="faq" className="w-full px-4 sm:px-6 md:px-8 xl:px-10 py-12 sm:py-16 border-t border-[var(--color-border)] bg-[var(--color-surface)]/20">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--color-primary-tint)] text-[var(--color-text-accent)] border border-[var(--color-border-active)]/30 text-xs font-medium inline-block">
              Frequently Asked Questions
            </span>
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--color-text-primary)]">
              Got questions? We've got answers
            </h2>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] font-normal">
              Common questions from job-seekers and hiring managers.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden transition-colors shadow-xs"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 transition-colors hover:bg-[var(--color-surface-hover)]/40"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${faq.audienceTag === "Candidate"
                          ? "bg-[var(--color-primary-tint)] text-[var(--color-text-accent)] border-[var(--color-border-active)]/30"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        }`}>
                        {faq.audienceTag}
                      </span>
                      <span className="text-xs sm:text-sm font-medium text-[var(--color-text-primary)]">
                        {faq.question}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-[var(--color-text-secondary)] shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-[var(--color-text-accent)]" : ""
                        }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-[var(--color-text-secondary)] leading-relaxed font-normal border-t border-[var(--color-border)]/50">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. FINAL CTA BAND (Audience-dependent, Google Auth Single Primary CTA) */}
      <section className="w-full px-4 sm:px-6 md:px-8 xl:px-10 py-14 sm:py-20 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          {audience === "candidate" ? (
            <>
              <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--color-text-primary)]">
                Ready to walk into your next interview with complete confidence?
              </h2>
              <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] max-w-xl mx-auto font-normal leading-relaxed">
                Join thousands of candidates who practice technical communication and get instant diagnostic scoring.
              </p>
              <div className="pt-2 flex justify-center">
                {user ? (
                  <button
                    onClick={() => navigate(getDashboardRoute())}
                    className="px-6 py-3 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs sm:text-sm font-medium transition-all shadow-xs inline-flex items-center gap-2"
                  >
                    <span>Go to Candidate Studio</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="scale-110">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => toast.error("Google authentication failed")}
                      theme="filled_blue"
                      size="large"
                      shape="pill"
                      text="continue_with"
                    />
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--color-text-primary)]">
                Ready to streamline your technical interview pipeline?
              </h2>
              <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] max-w-xl mx-auto font-normal leading-relaxed">
                Automate your first-round evaluations with calibrated AI scoring and full video replays.
              </p>
              <div className="pt-2 flex justify-center">
                {user ? (
                  <button
                    onClick={() => navigate(getDashboardRoute())}
                    className="px-6 py-3 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs sm:text-sm font-medium transition-all shadow-xs inline-flex items-center gap-2"
                  >
                    <span>Go to Employer Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="scale-110">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => toast.error("Google authentication failed")}
                      theme="filled_blue"
                      size="large"
                      shape="pill"
                      text="continue_with"
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* 10. FOOTER (SHARED) */}
      <footer className="w-full px-4 sm:px-6 md:px-8 xl:px-10 py-12 border-t border-[var(--color-border)] bg-[var(--color-canvas)] text-xs text-[var(--color-text-secondary)]">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[var(--color-border)] pb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-[var(--color-primary)] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  IO
                </div>
                <span className="text-base font-medium tracking-tight text-[var(--color-text-primary)]">
                  Intervu<span className="text-[var(--color-text-accent)]">OS</span>
                </span>
              </div>
              <p className="text-[11px] text-[var(--color-text-muted)] max-w-sm">
                Autonomous voice & technical interview platform for candidate preparation and employer hiring.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 font-medium">
              <button
                onClick={() => {
                  setAudience("candidate");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="hover:text-[var(--color-text-primary)] transition-colors"
              >
                Candidates
              </button>
              <button
                onClick={() => {
                  setAudience("employer");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="hover:text-[var(--color-text-primary)] transition-colors"
              >
                Employers
              </button>
              <button
                onClick={() => scrollToSection("security")}
                className="hover:text-[var(--color-text-primary)] transition-colors"
              >
                Security & Privacy
              </button>
              <Link to="/employer/contact" className="hover:text-[var(--color-text-primary)] transition-colors">
                Support Desk
              </Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[var(--color-text-muted)]">
            <div>
              © 2026 IntervuOS. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <span className="select-all">Support: intervuos@gmail.com</span>
              <span>•</span>
              <a
                href="https://wa.me/8655021064"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--color-text-primary)] transition-colors"
              >
                WhatsApp: +91 86550 21064
              </a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
