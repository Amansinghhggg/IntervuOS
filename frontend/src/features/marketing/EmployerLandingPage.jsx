import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import ForkLogo from "../../ui/shared/ForkLogo";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Play,
  Camera,
  Layers,
  ChevronRight,
  ChevronLeft,
  HelpCircle,
  Shield,
  ShieldCheck,
  Zap,
  Globe,
  Award,
  Maximize2,
  X,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  MessageSquare,
  ExternalLink,
  Sliders,
  Users,
  Clock,
  Lock,
  FileCheck,
  Building2
} from "lucide-react";

/**
 * Safe client-side analytics event helper
 */
function trackEvent(eventName, payload = {}) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, payload);
  }
}

/**
 * Screenshot display container with zoom preview and full-view lightbox trigger.
 */
function ScreenshotDisplay({
  imageSrc,
  caption,
  alt,
  height = "h-64 sm:h-80",
  stepNumber = null,
  onOpenFullView = null
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      onClick={() => {
        if (imageSrc && !imgError && onOpenFullView) {
          onOpenFullView(imageSrc, caption, alt);
        }
      }}
      className={`w-full ${height} rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col items-center justify-center relative overflow-hidden group ${imageSrc && !imgError ? "cursor-pointer" : ""
        }`}
    >
      {stepNumber && (
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-[var(--color-canvas)]/90 backdrop-blur-md border border-[var(--color-border)] text-[10px] font-mono text-[var(--color-text-accent)] font-medium z-10 shadow-xs">
          Stage 0{stepNumber}
        </div>
      )}

      {imageSrc && !imgError ? (
        <>
          <img
            src={imageSrc}
            alt={alt || caption || "Product Interface"}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-canvas)]/90 via-[var(--color-canvas)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-4 z-10">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium text-[var(--color-text-primary)] truncate max-w-[70%]">
                {caption}
              </p>
              <button
                type="button"
                className="px-3 py-1.5 rounded-xl bg-[var(--color-primary)] text-white text-[11px] font-medium flex items-center gap-1.5 shadow-lg shadow-[var(--color-primary)]/40 hover:bg-[var(--color-primary-hover)] transition-colors shrink-0"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Full View</span>
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-accent)] shadow-xs transition-transform group-hover:scale-105">
            <Camera className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-sm">
            <p className="text-xs sm:text-sm font-medium text-[var(--color-text-primary)]">
              {caption || "Product Interface Preview"}
            </p>
            <p className="text-[11px] text-[var(--color-text-muted)]">
              {alt || "Actual workspace visualization"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Employer Video Player Box with dynamic audio waveforms & click-to-play toggle.
 */
function EmployerVideoPlayer() {
  const videoSrc = "/assets/video/employer-demo-placeholder.mp4";
  const posterSrc = "/assets/images/employer-poster.png";

  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    setIsPlaying(false);
    setHasError(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      videoRef.current.load();
    }
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setHasError(false);
        })
        .catch(() => {
          setHasError(true);
          setIsPlaying(false);
          toast("Click to play interactive video demo.", { icon: "🎬" });
        });
    }
  };

  return (
    <div className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2 sm:p-2.5 shadow-xs relative overflow-hidden">
      <div
        onClick={togglePlay}
        className="relative w-full aspect-video rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] flex flex-col items-center justify-center overflow-hidden group cursor-pointer select-none"
      >
        <video
          key="employer-video-elem"
          ref={videoRef}
          src={videoSrc}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isPlaying ? "opacity-100 z-10" : "opacity-0 pointer-events-none"
            }`}
          poster={posterSrc}
          preload="metadata"
          playsInline
          onEnded={() => setIsPlaying(false)}
          onError={() => setHasError(true)}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>

        {!isPlaying && (
          <div className="w-full h-full flex flex-col justify-between p-4 sm:p-6 bg-gradient-to-b from-[var(--color-canvas)]/70 via-[var(--color-canvas)]/40 to-[var(--color-canvas)]/95 select-none relative z-20">
            <img
              src={posterSrc}
              alt="Interview UI Preview"
              className="absolute inset-0 w-full h-full object-cover -z-10 opacity-35 group-hover:scale-105 transition-transform duration-700 ease-out"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />

            <div className="flex items-center justify-between w-full">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-surface)]/90 backdrop-blur-md border border-[var(--color-border)] text-[11px] font-medium text-[var(--color-text-primary)] shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Meera • AI Screening Engine</span>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center space-y-3 my-auto">
              <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-[var(--color-primary)] text-white flex items-center justify-center shadow-xl shadow-[var(--color-primary)]/35 transition-all group-hover:scale-110 hover:bg-[var(--color-primary-hover)] active:scale-95">
                <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-white ml-0.5" />
              </div>

              <div className="text-center space-y-1">
                <p className="text-sm sm:text-base font-medium text-[var(--color-text-primary)] tracking-tight">
                  See How Meera Helps
                </p>
                <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
                  <span>Autonomous screening & anti-cheating leaderboards</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--color-border)]/60">
              <div className="flex items-center gap-1">
                {[35, 65, 45, 85, 55, 30, 90, 60, 95, 70, 40, 80, 50, 75, 40].map((h, i) => (
                  <div
                    key={i}
                    className="w-1 bg-[var(--color-text-accent)]/70 rounded-full transition-all"
                    style={{ height: `${h * 0.22}px` }}
                  />
                ))}
              </div>
              <span className="text-[11px] text-[var(--color-text-accent)] font-medium flex items-center gap-1">
                <Play className="w-3 h-3 fill-current" /> Watch Intro
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EmployerLandingPage() {
  const { user, googleLogin } = useAuth();
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [lightboxModal, setLightboxModal] = useState(null);

  useEffect(() => {
    document.title = "ForkTalent for Business — Automated AI Screening & Candidate Evaluation";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setLightboxModal(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) return;
    try {
      const data = await googleLogin(credentialResponse.credential);
      toast.success(`Welcome to ForkTalent, ${data.user.name || "User"}!`);
      trackEvent("google_login_success", { role: data.user.role || "unassigned" });
      if (!data.user.role) {
        navigate("/select-role");
      } else if (data.user.role === "employer") {
        navigate("/employer/dashboard");
      } else if (data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/candidate/mock-interview");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Google sign-in failed. Please try again.");
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Verified B2B Client Logos
  const businessClients = [
    { name: "Kavira Softworks", tag: "Enterprise SaaS" },
    { name: "Nexlore Technologies", tag: "AI & Cloud Systems" },
    { name: "Cedarwave Industries", tag: "Fintech Platform" },
    { name: "Trionix Labs", tag: "High-Growth Scaleup" },
    { name: "Pinegrove Systems", tag: "Digital Infrastructure" },
    { name: "Northfield Analytics", tag: "Data Intelligence" }
  ];

  // Business Step-by-step Interactive Workflow
  const businessSteps = [
    {
      step: 1,
      stageBadge: "Role Setup",
      title: "Post a role & calibrate benchmarks in minutes",
      description:
        "Define target job titles, required tech stacks, and seniority level. ForkTalent automatically generates comprehensive technical question banks, or you can import custom benchmark rubrics in 1 click.",
      points: [
        {
          title: "Role & Seniority Calibration",
          desc: "Configure exact engineering tracks from Junior to Principal with customized evaluation criteria."
        },
        {
          title: "Custom Rubrics & Question Banks",
          desc: "Import company benchmark questions or let AI generate adaptive role-specific syllabi."
        },
        {
          title: "Instant 6-Digit Campaign Code",
          desc: "Distribute via bulk email, CSV upload, or share directly on LinkedIn and ATS job postings."
        }
      ],
      highlight: "Custom question bank generation & rubric customization",
      image: "/assets/images/screenshots/step1-campaign-creation.jpg",
      placeholderTag: "Campaign Creation & Role Configuration",
      altText: "Recruiter campaign setup screen with tech stack and rubric options"
    },
    {
      step: 2,
      stageBadge: "AI Screening",
      title: "Autonomous live voice screening at scale",
      description:
        "Candidates undergo realistic autonomous voice technical interviews with adaptive follow-ups, strict proctoring verification, and real-time audio transcription.",
      points: [
        {
          title: "Concurrent 24/7 Screening",
          desc: "Screen hundreds of applicants simultaneously without bottlenecking your engineering team."
        },
        {
          title: "Dynamic Follow-up Probing",
          desc: "The AI tests real technical depth by probing system architecture tradeoffs and edge cases."
        },
        {
          title: "Anti-Cheating Integrity",
          desc: "Automated tab-switch detection, speaker continuity tracking, and webcam verification."
        }
      ],
      highlight: "Autonomous voice interviews & anti-cheating monitoring",
      image: "/assets/images/screenshots/step2-live-screening.png",
      placeholderTag: "Autonomous AI Live Screening Room",
      altText: "Live AI interview room with audio waveform and proctoring badges"
    },
    {
      step: 3,
      stageBadge: "Evaluation",
      title: "Review multidimensional STAR diagnostic scorecards",
      description:
        "Access structured candidate evaluations with multi-axis STAR ratings, competency radar charts, key strengths, weaknesses, and synchronized answer breakdowns.",
      points: [
        {
          title: "STAR Methodology Scoring",
          desc: "Objective scoring across Situation, Task, Action, and Result for every technical question."
        },
        {
          title: "Competency Radar Charts",
          desc: "Visualize architecture depth, problem-solving, code correctness, and communication."
        },
        {
          title: "Ranked Candidate Leaderboards",
          desc: "Instant candidate ranking matrices to identify top 5% engineering talent effortlessly."
        }
      ],
      highlight: "STAR competency scoring & candidate ranking matrices",
      image: "/assets/images/screenshots/step3-diagnostic-scorecard.png",
      placeholderTag: "Candidate Diagnostic Scorecard & Radar Matrix",
      altText: "Diagnostic scorecard with competency radar chart and STAR breakdown"
    },
    {
      step: 4,
      stageBadge: "Session Replay",
      title: "Watch synchronized session replays & question breakdowns",
      description:
        "Deep-dive into full candidate interview replays with synchronized audio playback, live code editor diffs, timestamped question transcripts, and turn-by-turn AI feedback.",
      points: [
        {
          title: "Timestamped Audio & Video Replay",
          desc: "Jump straight to specific technical questions or architectural tradeoffs without watching the entire recording."
        },
        {
          title: "Synchronized Transcript & Code Playback",
          desc: "Inspect candidate-written code, compiler output, and speech transcription in real time."
        },
        {
          title: "Anti-Cheating Logs & Integrity",
          desc: "Review tab switches, audio continuity logs, and facial verification timestamps."
        },
        {
          title: "1-Click Shortlist & ATS Sync",
          desc: "Advance verified top performers with 1-click approvals and export dossiers directly to your ATS."
        }
      ],
      highlight: "Question-by-question session replay, code playback & 1-click ATS shortlisting",
      image: "/assets/images/screenshots/step4-session-replay.png",
      placeholderTag: "Candidate Session Replay & Detailed Insights",
      altText: "Full interview session replay with synchronized video, audio waveform and code editor"
    }
  ];

  // B2B FAQs
  const employerFaqs = [
    {
      q: "How does ForkTalent prevent cheating during autonomous AI screening?",
      a: "Our multi-layered proctoring engine monitors browser tab switching, background speech overlap, window unfocus events, and facial presence. Any irregularities are logged and flagged with exact timestamps on the recruiter's diagnostic scorecard."
    },
    {
      q: "Can we import our engineering team's existing question bank and rubrics?",
      a: "Yes. You can import custom evaluation rubrics, specific coding problems, and benchmark answers, or allow ForkTalent's AI to generate role-calibrated syllabi across Junior to Staff engineering tiers."
    },
    {
      q: "How are candidates invited to an interview campaign?",
      a: "Every campaign generates a unique 6-character campaign code and a direct invite link. You can distribute the code via automated email, embed it on job boards, or paste it directly into your ATS workflow."
    },
    {
      q: "Does ForkTalent integrate with our existing Applicant Tracking System (ATS)?",
      a: "ForkTalent supports 1-click PDF dossier exports, candidate scorecard sharing links, and webhooks to synchronize ranked leaderboards with popular ATS systems like Greenhouse, Lever, and Ashby."
    },
    {
      q: "Is candidate data encrypted and GDPR/SOC2 compliant?",
      a: "All candidate audio, video, transcripts, and evaluation scorecards are encrypted in transit via TLS 1.3 and at rest with AES-256 bit encryption in dedicated isolated data environments."
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-text-primary)] flex flex-col selection:bg-[var(--color-primary-tint)] selection:text-[var(--color-text-accent)] relative">

      {/* ─────────────────────────────────────────────────────────────
          1. STICKY TOP BANNER: CANDIDATE GATEWAY
      ───────────────────────────────────────────────────────────── */}
      <div className="w-full bg-[var(--color-surface)] border-b border-[var(--color-border)] py-2 px-4 sm:px-6 md:px-8 xl:px-10 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--color-text-accent)]" />
          <span className="text-[var(--color-text-secondary)]">
            Are you an candidate preparing for interviews?
          </span>
        </div>
        <Link
          to="/"
          className="text-[var(--color-text-accent)] hover:underline font-medium flex items-center gap-1.5 transition-colors"
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Switch to Candidate Mock Studio →</span>
        </Link>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. B2B ENTERPRISE NAVBAR
      ───────────────────────────────────────────────────────────── */}
      <header className="w-full border-b border-[var(--color-border)] bg-[var(--color-canvas)]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 md:px-8 xl:px-10 py-3.5 flex items-center justify-between">

          <div className="flex items-center gap-6">
            <Link to="/employers" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-[var(--color-primary)] text-white flex items-center justify-center p-1.5 shadow-xs transition-transform group-hover:scale-105">
                <ForkLogo className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-medium tracking-tight text-[var(--color-text-primary)] leading-none">
                  Fork<span className="text-[var(--color-text-accent)]">Talent</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-mono font-medium">For Business</span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-5 text-xs text-[var(--color-text-secondary)]">
              <button onClick={() => scrollToSection("automation-section")} className="hover:text-[var(--color-text-primary)] transition-colors">
                Recruitment Automation
              </button>
              <button onClick={() => scrollToSection("metrics-section")} className="hover:text-[var(--color-text-primary)] transition-colors">
                Enterprise ROI
              </button>
              <button onClick={() => scrollToSection("security-section")} className="hover:text-[var(--color-text-primary)] transition-colors">
                Security & Proctoring
              </button>
              <button onClick={() => scrollToSection("faq-section")} className="hover:text-[var(--color-text-primary)] transition-colors">
                FAQ
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="hidden sm:inline-flex px-3 py-1.5 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all items-center gap-1.5"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>For Candidates</span>
            </Link>

            {user ? (
              <Link
                to="/employer/dashboard"
                className="px-4 py-2 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-medium transition-all shadow-xs inline-flex items-center gap-1.5"
              >
                <span>Recruiter Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <a
                href="https://wa.me/8655021064"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-medium transition-all shadow-xs inline-flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Contact for Demo</span>
              </a>
            )}
          </div>

        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          3. MAIN B2B CONTENT
      ───────────────────────────────────────────────────────────── */}
      <main className="w-full">
        <div className="w-full space-y-16 sm:space-y-24 py-10 sm:py-16">

          {/* SECTION 1: B2B HERO */}
          <section className="w-full px-4 sm:px-6 md:px-8 xl:px-10">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">

              {/* Left Column: B2B Pitch */}
              <div className="lg:col-span-6 space-y-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Enterprise AI Technical Screening Platform</span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-[var(--color-text-primary)] leading-[1.15]">
                  Screen 500+ Engineers in Hours. <br />
                  <span className="text-[var(--color-text-accent)]">Zero Dev Bottlenecks.</span>
                </h1>

                <p className="text-xs sm:text-sm md:text-base text-[var(--color-text-secondary)] leading-relaxed font-normal max-w-xl">
                  Replace slow, subjective 1st-round screening calls with autonomous voice AI interviews. Get standardized STAR candidate scorecards, synchronized video replays, and proctoring integrity.
                </p>

                {/* Primary CTA Block */}
                <div className="pt-2 space-y-4 max-w-md">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <a
                      href="https://wa.me/8655021064"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-3 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-medium transition-all shadow-xs flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Contact for Demo</span>
                      <ExternalLink className="w-3 h-3 opacity-80" />
                    </a>

                    <button
                      onClick={() => scrollToSection("automation-section")}
                      className="px-4 py-3 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>Watch product tour</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-[var(--color-text-muted)]">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>75% Time Saved Per Hire</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Zero Bias Standardized Rubrics</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Employer Demo Video */}
              <div className="lg:col-span-6">
                <EmployerVideoPlayer />
              </div>

            </div>
          </section>

          {/* SECTION 2: 4-STEP RECRUITMENT AUTOMATION */}
          <section id="automation-section" className="w-full px-4 sm:px-6 md:px-8 xl:px-10 border-t border-[var(--color-border)] pt-16">
            <div className="max-w-5xl mx-auto space-y-10">
              <div className="text-center space-y-3 max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-primary-tint)] text-[var(--color-text-accent)] border border-[var(--color-border-active)]/30 text-xs font-medium">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Interactive Employer Workflow</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--color-text-primary)]">
                  Step-by-step recruitment automation
                </h2>
                <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] font-normal">
                  Click through the 4 stages below to explore how ForkTalent streamlines technical hiring from campaign setup to final offer.
                </p>
              </div>

              {/* Active Step Card */}
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 sm:p-10 space-y-8 shadow-xs relative overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

                  {/* Left: Step Details */}
                  <div className="lg:col-span-6 space-y-5">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[var(--color-primary-tint)] text-[var(--color-text-accent)] border border-[var(--color-border-active)]/30 text-xs font-mono">
                      <span>STAGE {businessSteps[activeStep].step} OF 4 • {businessSteps[activeStep].stageBadge}</span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-medium text-[var(--color-text-primary)] tracking-tight">
                      {businessSteps[activeStep].title}
                    </h3>

                    <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed font-normal">
                      {businessSteps[activeStep].description}
                    </p>

                    {/* Bullet Points */}
                    {businessSteps[activeStep].points && (
                      <ul className="space-y-2.5 text-xs text-[var(--color-text-secondary)] pt-1 border-t border-[var(--color-border)]">
                        {businessSteps[activeStep].points.map((pt, pIdx) => (
                          <li key={pIdx} className="flex items-start gap-2.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span><strong>{pt.title}:</strong> {pt.desc}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="p-3.5 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] flex items-start gap-2.5 text-xs text-[var(--color-text-accent)]">
                      <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                      <span><strong>Key capability:</strong> {businessSteps[activeStep].highlight}</span>
                    </div>
                  </div>

                  {/* Right: Step UI Screenshot & Controls */}
                  <div className="lg:col-span-6 space-y-4">
                    <ScreenshotDisplay
                      stepNumber={businessSteps[activeStep].step}
                      imageSrc={businessSteps[activeStep].image}
                      caption={businessSteps[activeStep].placeholderTag}
                      alt={businessSteps[activeStep].altText}
                      height="h-64 sm:h-80"
                      onOpenFullView={(src, caption, alt) => setLightboxModal({ src, title: caption, alt })}
                    />

                    {/* Controls */}
                    <div className="flex items-center gap-3 pt-1">
                      <button
                        disabled={activeStep === 0}
                        onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
                        className="px-4 py-2 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1.5"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Previous</span>
                      </button>

                      <button
                        disabled={activeStep === businessSteps.length - 1}
                        onClick={() => setActiveStep((prev) => Math.min(businessSteps.length - 1, prev + 1))}
                        className="px-4 py-2 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all inline-flex items-center gap-1.5 shadow-xs"
                      >
                        <span>Next Step</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-1.5 ml-auto">
                        {businessSteps.map((_, dotIdx) => (
                          <button
                            key={dotIdx}
                            onClick={() => setActiveStep(dotIdx)}
                            className={`h-2 rounded-full transition-all ${activeStep === dotIdx ? "w-6 bg-[var(--color-text-accent)]" : "w-2 bg-[var(--color-border)] hover:bg-[var(--color-text-muted)]"
                              }`}
                            aria-label={`Go to employer step ${dotIdx + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3: ENTERPRISE ROI & CLIENT LOGOS */}
          <section id="metrics-section" className="w-full px-4 sm:px-6 md:px-8 xl:px-10 border-t border-[var(--color-border)] pt-16 space-y-12">
            <div className="max-w-6xl mx-auto space-y-8">

              {/* Metrics Bar */}
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center shadow-xs">
                <div className="space-y-1">
                  <div className="text-2xl sm:text-3xl font-medium text-[var(--color-text-primary)] tracking-tight">500+</div>
                  <div className="text-xs text-[var(--color-text-muted)] font-normal">Candidate Interviews Run</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl sm:text-3xl font-medium text-emerald-400 tracking-tight">75%</div>
                  <div className="text-xs text-[var(--color-text-muted)] font-normal">Reduction in Dev Hours</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl sm:text-3xl font-medium text-[var(--color-text-accent)] tracking-tight">4.2x</div>
                  <div className="text-xs text-[var(--color-text-muted)] font-normal">Faster Time-to-Offer</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl sm:text-3xl font-medium text-amber-400 tracking-tight">99.4%</div>
                  <div className="text-xs text-[var(--color-text-muted)] font-normal">Proctoring Accuracy</div>
                </div>
              </div>

              {/* Client Logo Grid */}
              <div className="space-y-4 text-center">
                <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-mono">
                  Trusted by Engineering Teams & High-Growth Startups
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {businessClients.map((client, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col items-center justify-center space-y-1 shadow-xs hover:border-[var(--color-border-active)]/40 transition-colors"
                    >
                      <span className="text-xs font-medium text-[var(--color-text-primary)]">{client.name}</span>
                      <span className="text-[10px] text-[var(--color-text-muted)]">{client.tag}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </section>

          {/* SECTION 4: SECURITY & PROCTORING INTEGRITY */}
          <section id="security-section" className="w-full px-4 sm:px-6 md:px-8 xl:px-10 border-t border-[var(--color-border)] pt-16">
            <div className="max-w-6xl mx-auto space-y-10">
              <div className="text-center space-y-3 max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Enterprise Security & Compliance</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--color-text-primary)]">
                  Enterprise-grade data isolation & proctoring
                </h2>
                <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] font-normal">
                  Rest easy knowing your proprietary question banks and candidate evaluation dossiers are protected by industry-standard security.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] flex items-center justify-center text-emerald-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-medium text-[var(--color-text-primary)]">Anti-Cheating Integrity</h3>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                    Automated tab switch detection, webcam presence monitoring, and speech continuity tracking.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-accent)]">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-medium text-[var(--color-text-primary)]">256-Bit SSL Encryption</h3>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                    All candidate video, audio recordings, and scoring metadata are encrypted in transit and at rest.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] flex items-center justify-center text-amber-400">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-medium text-[var(--color-text-primary)]">ATS 1-Click Dossier Sync</h3>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                    Export structured candidate scorecards and benchmark comparison reports directly to your ATS.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 5: ACCORDION FAQ */}
          <section id="faq-section" className="w-full px-4 sm:px-6 md:px-8 xl:px-10 border-t border-[var(--color-border)] pt-16">
            <div className="max-w-3xl mx-auto space-y-8">
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-primary-tint)] text-[var(--color-text-accent)] border border-[var(--color-border-active)]/30 text-xs font-medium">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Frequently Asked Questions</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--color-text-primary)]">
                  Recruiter & hiring team FAQs
                </h2>
              </div>

              <div className="space-y-3">
                {employerFaqs.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden transition-colors"
                    >
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                        className="w-full p-5 text-left flex items-center justify-between gap-4"
                        aria-expanded={isOpen}
                      >
                        <span className="text-xs sm:text-sm font-medium text-[var(--color-text-primary)]">
                          {faq.q}
                        </span>
                        <span className="text-[var(--color-text-muted)] text-sm shrink-0">
                          {isOpen ? "−" : "+"}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="px-5 pb-5 text-xs text-[var(--color-text-secondary)] leading-relaxed border-t border-[var(--color-border)]/50 pt-3">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* SECTION 6: BOTTOM B2B CALL TO ACTION */}
          <section id="contact-section" className="w-full px-4 sm:px-6 md:px-8 xl:px-10">
            <div className="max-w-5xl mx-auto rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] p-8 sm:p-12 text-center space-y-6 relative overflow-hidden">
              <div className="space-y-2 max-w-xl mx-auto">
                <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--color-text-primary)]">
                  Ready to automate your engineering screening?
                </h2>
                <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
                  Schedule a 15-minute product walkthrough or launch your first candidate screening campaign today.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href="https://wa.me/8655021064"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-medium transition-all shadow-xs flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Contact for Demo on WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>

                <a
                  href="mailto:2468amansingh@gmail.com"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[var(--color-canvas)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4 text-[var(--color-text-accent)]" />
                  <span>Email Sales Team</span>
                </a>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* ─────────────────────────────────────────────────────────────
          4. GLOBAL SHARED FOOTER
      ───────────────────────────────────────────────────────────── */}
      <footer id="footer-contact" className="w-full px-4 sm:px-6 md:px-8 xl:px-10 py-12 border-t border-[var(--color-border)] bg-[var(--color-canvas)] text-xs text-[var(--color-text-secondary)]">
        <div className="max-w-6xl mx-auto space-y-10">

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 border-b border-[var(--color-border)] pb-10">
            {/* Brand */}
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-[var(--color-primary)] text-white flex items-center justify-center p-1 shadow-xs">
                  <ForkLogo className="w-4 h-4 text-white" />
                </div>
                <span className="text-base font-medium tracking-tight text-[var(--color-text-primary)]">
                  Fork<span className="text-[var(--color-text-accent)]">Talent</span>
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed max-w-sm">
                Next-generation autonomous AI technical interview simulation and competency assessment platform.
              </p>
            </div>

            {/* Platform Navigation */}
            <div className="md:col-span-2 space-y-2.5">
              <div className="text-xs font-medium text-[var(--color-text-primary)]">For Employers</div>
              <ul className="space-y-2 text-[11px] text-[var(--color-text-muted)]">
                <li>
                  <button onClick={() => scrollToSection("automation-section")} className="hover:text-[var(--color-text-primary)] transition-colors">
                    Recruitment Automation
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection("metrics-section")} className="hover:text-[var(--color-text-primary)] transition-colors">
                    Enterprise ROI
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection("faq-section")} className="hover:text-[var(--color-text-primary)] transition-colors">
                    Employer FAQ
                  </button>
                </li>
              </ul>
            </div>

            {/* Candidate Link */}
            <div className="md:col-span-2 space-y-2.5">
              <div className="text-xs font-medium text-[var(--color-text-primary)]">For Candidates</div>
              <ul className="space-y-2 text-[11px] text-[var(--color-text-muted)]">
                <li>
                  <Link to="/" className="text-[var(--color-text-accent)] hover:underline transition-colors font-medium">
                    Candidate Mock Studio →
                  </Link>
                </li>
                <li>
                  <Link to="/#workflow-section" className="hover:text-[var(--color-text-primary)] transition-colors">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link to="/#pricing-section" className="hover:text-[var(--color-text-primary)] transition-colors">
                    Credit Packs
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Details */}
            <div className="md:col-span-3 space-y-2.5">
              <div className="text-xs font-medium text-[var(--color-text-primary)]">Contact Info</div>
              <div className="space-y-2 text-[11px] text-[var(--color-text-muted)]">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[var(--color-text-accent)] shrink-0" />
                  <span className="select-all">2468amansingh@gmail.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <a href="tel:+918655021064" className="hover:text-[var(--color-text-primary)] select-all">+91 86550 21064</a>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[var(--color-text-accent)] shrink-0 mt-0.5" />
                  <span>Andheri ,Mumbai,India</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[var(--color-text-muted)]">
            <div>© 2026 ForkTalent. All rights reserved.</div>
            <div className="flex items-center gap-4">
              <span>Privacy Policy</span>
              <span>•</span>
              <span>Terms of Service</span>
              <span>•</span>
              <span>256-Bit SSL Encrypted</span>
            </div>
          </div>

        </div>
      </footer>

      {/* ─────────────────────────────────────────────────────────────
          5. LIGHTBOX FULL-VIEW SCREENSHOT MODAL
      ───────────────────────────────────────────────────────────── */}
      {lightboxModal && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 md:p-10 animate-fade-in"
          onClick={() => setLightboxModal(null)}
        >
          <div
            className="relative max-w-6xl w-full max-h-[92vh] flex flex-col bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--color-border)] bg-[var(--color-canvas)]/90 backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <p className="text-xs sm:text-sm font-medium text-[var(--color-text-primary)]">
                  {lightboxModal.title || "Interface Screenshot Preview"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLightboxModal(null)}
                className="p-1.5 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-white transition-colors"
                aria-label="Close full view preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-2 sm:p-4 flex items-center justify-center bg-[var(--color-canvas)]">
              <img
                src={lightboxModal.src}
                alt={lightboxModal.alt || lightboxModal.title || "Interface full view"}
                className="max-h-[78vh] w-auto object-contain rounded-xl border border-[var(--color-border)] shadow-md"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
