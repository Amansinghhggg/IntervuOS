import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";
import ForkLogo from "../../ui/shared/ForkLogo";
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
  ChevronLeft,
  ChevronRight,
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
  Star,
  Play,
  Share2,
  Mail,
  Phone,
  MapPin,
  Briefcase
} from "lucide-react";

/**
 * Lightweight analytics hook stub for dropping in GA4/Segment without refactoring.
 */
function trackEvent(eventName, payload = {}) {
  // STUB: Replace with window.gtag or analytics.track in production
  if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
    // console.log(`[Analytics Track] ${eventName}:`, payload);
  }
}

/**
 * Reusable screenshot placeholder box with bordered container, icon, and descriptive caption.
 */
function ScreenshotPlaceholder({ caption, alt, height = "h-56 sm:h-72", stepNumber = null }) {
  return (
    <div className={`w-full ${height} rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface-hover)]/30 flex flex-col items-center justify-center p-6 text-center space-y-3 transition-colors relative overflow-hidden group`}>
      {stepNumber && (
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-[var(--color-canvas)] border border-[var(--color-border)] text-[10px] font-mono text-[var(--color-text-accent)] font-medium">
          Step 0{stepNumber}
        </div>
      )}
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
      <span className="text-[10px] font-mono text-[var(--color-text-muted)] opacity-60">
        {/* PLACEHOLDER: Real product screenshot asset will be inserted here */}
        [UI Screenshot Asset Placeholder]
      </span>
    </div>
  );
}

/**
 * Reusable video placeholder box with animated mock waveform and visible badge.
 */
function VideoPlaceholder({ audience = "candidate" }) {
  const isCandidate = audience === "candidate";
  const videoSrc = isCandidate
    ? "/assets/video/candidate-demo-placeholder.mp4"
    : "/assets/video/employer-demo-placeholder.mp4";

  return (
    <div className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-5 shadow-xs relative overflow-hidden space-y-3">
      {/* Video Container */}
      <div className="relative w-full aspect-video rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] flex flex-col items-center justify-center overflow-hidden group">
        {/* Hidden video element holding source for future asset swap */}
        <video
          className="absolute inset-0 w-full h-full object-cover opacity-0 pointer-events-none"
          poster={isCandidate ? "/assets/images/candidate-poster.png" : "/assets/images/employer-poster.png"}
          preload="none"
        >
          <source src={videoSrc} type="video/mp4" />
          {/* TODO: Replace with real demo video asset */}
        </video>

        {/* Dynamic UI Preview Inside Video Frame */}
        <div className="w-full h-full flex flex-col justify-between p-4 sm:p-6 bg-gradient-to-b from-[var(--color-canvas)]/40 via-transparent to-[var(--color-canvas)]/90 select-none">
          {/* Top Status Bar */}
          <div className="flex items-center justify-between w-full">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--color-surface)]/90 backdrop-blur-md border border-[var(--color-border)] text-[10px] font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{isCandidate ? "Live AI Technical Session" : "Candidate Evaluation Stream"}</span>
            </div>
            <span className="text-[10px] font-mono text-[var(--color-text-muted)] bg-[var(--color-surface)] px-2 py-0.5 rounded-md border border-[var(--color-border)]">
              {isCandidate ? "Turn 03/06 • 12:45" : "Rank #1 • SDE-2 Track"}
            </span>
          </div>

          {/* Center Play Button & Waveform preview */}
          <div className="flex flex-col items-center justify-center space-y-3 my-auto">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[var(--color-primary)] text-white flex items-center justify-center shadow-lg shadow-[var(--color-primary)]/40 transition-transform group-hover:scale-110 cursor-pointer">
              <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-white ml-0.5" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-xs sm:text-sm font-medium text-[var(--color-text-primary)]">
                {isCandidate ? "Watch 90s Candidate Mock Tour" : "Watch 2-Min Recruiter Workflow"}
              </p>
              <div className="flex items-center justify-center gap-1 text-[10px] text-[var(--color-text-muted)] font-mono">
                <span>Autonomous voice synthesis</span>
                <span>•</span>
                <span>Real-time feedback</span>
              </div>
            </div>
          </div>

          {/* Bottom Audio Waveform Simulation */}
          <div className="flex items-center justify-between gap-1 pt-2 border-t border-[var(--color-border)]/50">
            <div className="flex items-center gap-1">
              {[40, 70, 45, 90, 60, 30, 80, 50, 95, 65, 40, 85].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-[var(--color-text-accent)]/70 rounded-full transition-all"
                  style={{ height: `${h * 0.25}px` }}
                />
              ))}
            </div>
            <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
              1080p HD • Interactive Audio
            </span>
          </div>
        </div>
      </div>

      {/* Developer / Deployer Tag */}
      <div className="flex items-center justify-between text-[11px] text-[var(--color-text-muted)] px-1">
        <span className="font-mono">
          {/* TODO: Replace with real demo video */}
          [Placeholder Demo Video: {videoSrc}]
        </span>
        <span className="text-emerald-400 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" /> 60 FPS
        </span>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { user, googleLogin } = useAuth();
  const navigate = useNavigate();

  // Tab switcher state: "candidate" | "business" (Default: candidate)
  const [audience, setAudience] = useState("candidate");

  // Sticky mini-header visible on scroll
  const [isStickyVisible, setIsStickyVisible] = useState(false);

  // Step-based interactive workflows
  const [activeCandidateStep, setActiveCandidateStep] = useState(0);
  const [activeBusinessStep, setActiveBusinessStep] = useState(0);

  // Accordion FAQ active index
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // SEO & Head Scaffolding
  useEffect(() => {
    document.title =
      audience === "candidate"
        ? "ForkTalent — Practice AI Technical Interviews & Get Hired"
        : "ForkTalent for Business — Automated AI Screening & Candidate Evaluation";

    const handleScroll = () => {
      if (window.scrollY > 380) {
        setIsStickyVisible(true);
      } else {
        setIsStickyVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [audience]);

  const handleTabChange = (newTab) => {
    setAudience(newTab);
    setOpenFaqIndex(0);
    trackEvent("landing_tab_switched", { tab: newTab });
  };

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
    } catch (error) {
      toast.error(error.response?.data?.message || "Google authentication failed. Please try again.");
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // ─────────────────────────────────────────────────────────────
  // DATA SPECIFICATIONS
  // ─────────────────────────────────────────────────────────────

  // Candidate Testimonials (10 realistic Indian candidates with detailed context)
  const candidateTestimonials = [
    {
      name: "Priya Sharma",
      role: "Frontend Engineer",
      company: "Bangalore",
      initials: "PS",
      stars: 5,
      quote:
        "I used to freeze during system design and react architecture questions. ForkTalent's adaptive AI asked sharp follow-ups that pinpointed my exact gaps and helped me land an SDE-2 offer."
    },
    {
      name: "Arjun Mehta",
      role: "Backend Developer",
      company: "Pune",
      initials: "AM",
      stars: 5,
      quote:
        "The STAR methodology scoring changed everything. Instead of vague rambles, I learned how to structure metrics-driven answers for concurrency and database indexing questions."
    },
    {
      name: "Sneha Reddy",
      role: "Full Stack Engineer",
      company: "Hyderabad",
      initials: "SR",
      stars: 5,
      quote:
        "The voice latency is remarkably lifelike. Practicing 4 mock sessions here completely eliminated my interview nervousness before my final technical round."
    },
    {
      name: "Rohan Kulkarni",
      role: "DevOps / Cloud Specialist",
      company: "Mumbai",
      initials: "RK",
      stars: 5,
      quote:
        "The questions were not generic textbook trivia — the AI challenged me on production Kubernetes failovers and CI/CD bottlenecks."
    },
    {
      name: "Ananya Iyer",
      role: "Data Scientist",
      company: "Chennai",
      initials: "AI",
      stars: 5,
      quote:
        "The diagnostic report provided clear feedback on how to communicate statistical models and trade-offs. Got 2 competitive offers in 3 weeks!"
    },
    {
      name: "Vikram Nair",
      role: "Software Engineer",
      company: "Kochi",
      initials: "VN",
      stars: 5,
      quote:
        "Timestamped transcripts made it easy to review my pacing and eliminate filler phrases. Easily the most effective interview prep tool I've used."
    },
    {
      name: "Kavya Desai",
      role: "Product Engineer",
      company: "Ahmedabad",
      initials: "KD",
      stars: 5,
      quote:
        "The 15 free starter credits let me test the platform instantly without entering credit card details. Upgraded immediately for full FAANG interview prep."
    },
    {
      name: "Aditya Rao",
      role: "Java Backend Engineer",
      company: "Delhi NCR",
      initials: "AR",
      stars: 5,
      quote:
        "The AI dynamically increased difficulty based on my answers. It felt even more challenging than the actual hiring loop, making the real interview smooth."
    },
    {
      name: "Ishita Bansal",
      role: "Cloud Architect",
      company: "Gurgaon",
      initials: "IB",
      stars: 5,
      quote:
        "Practiced multi-region disaster recovery scenarios for 4 days straight. The benchmark answers highlighted key trade-offs I was previously overlooking."
    },
    {
      name: "Karan Malhotra",
      role: "Mobile App Developer",
      company: "Noida",
      initials: "KM",
      stars: 5,
      quote:
        "Coming back after a career gap, the instant scorecards rebuilt my technical confidence. Secured a 40% hike on my new lead engineer offer."
    }
  ];

  // Business Verified Fictional Client Logos
  const businessClients = [
    { name: "Kavira Softworks", tag: "Enterprise SaaS" },
    { name: "Nexlore Technologies", tag: "AI & Cloud Systems" },
    { name: "Cedarwave Industries", tag: "Fintech Platform" },
    { name: "Trionix Labs", tag: "High-Growth Scaleup" },
    { name: "Pinegrove Systems", tag: "Digital Infrastructure" },
    { name: "Northfield Analytics", tag: "Data Intelligence" }
  ];

  // Candidate Step-by-step Interactive Workflow
  const candidateSteps = [
    {
      step: 1,
      stageBadge: "Setup & Calibration",
      title: "Select your role, seniority & focus topics",
      description:
        "Customize your technical syllabus before starting. Pick your exact role track, seniority tier, and the deep-dive engineering topics you want to practice.",
      points: [
        {
          title: "Role & Tech Stack Selection",
          desc: "Frontend (React/Vue), Backend (Node/Java/Go/Python), Full Stack, DevOps, or System Design."
        },
        {
          title: "Seniority Calibration",
          desc: "Choose Junior (0–2 yrs), Mid-Level (3–5 yrs), Senior (5+ yrs), or Lead to tune question depth."
        },
        {
          title: "Topic & Duration Control",
          desc: "Select specific focus areas (Concurrency, SQL indexing, Microservices) and 15m/30m/45m duration."
        }
      ],
      highlight: "AI-calibrated role question banks & syllabus customization",
      placeholderTag: "Screenshot: Role, Seniority & Topic Calibration Studio",
      altText: "Candidate interview configuration screen with role and topic pills"
    },
    {
      step: 2,
      stageBadge: "Live Simulation",
      title: "Experience the live AI technical interview",
      description:
        "Step into a lifelike interview room with natural voice turn-taking, adaptive questioning, and real-time responsiveness.",
      points: [
        {
          title: "Ultra-Realistic Voice Latency",
          desc: "Natural speech synthesis delivers realistic conversation flow without awkward pauses."
        },
        {
          title: "Adaptive Follow-up Engine",
          desc: "The AI challenges your answers, probing architecture tradeoffs, edge cases, and real implementation decisions."
        },
        {
          title: "Pressure-Free Sandbox",
          desc: "Build genuine speaking confidence in a safe, private space designed to eliminate interview anxiety."
        }
      ],
      highlight: "Autonomous live voice interviewer with dynamic turn-taking",
      placeholderTag: "Screenshot: Live AI Voice Mock Interview Room",
      altText: "Voice synthesis waveform, countdown timer, and turn controller interface"
    },
    {
      step: 3,
      stageBadge: "Instant Feedback",
      title: "Get instant AI evaluation for every question",
      description:
        "Receive turn-by-turn feedback immediately after completing each question, along with a full diagnostic summary at the end.",
      points: [
        {
          title: "Turn-by-Turn STAR Analysis",
          desc: "Instant scoring breakdown for Situation, Task, Action, and Result formatting right as you finish each answer."
        },
        {
          title: "Benchmark Model Answers",
          desc: "Compare your responses with FAANG-calibrated model answers to learn high-impact phrasing."
        },
        {
          title: "Timestamped Audio & Transcripts",
          desc: "Review audio replays to identify filler words, pacing bottlenecks, and vocal clarity issues."
        }
      ],
      highlight: "Per-question STAR scoring & FAANG model answer comparison",
      placeholderTag: "Screenshot: STAR Diagnostic Scorecard & Feedback Report",
      altText: "Detailed score breakdown, radar charts, and question-by-question tips"
    },
    {
      step: 4,
      stageBadge: "Employer Gateway",
      title: "Have a campaign code? Just paste and join",
      description:
        "Already have an interview invite from a recruiter or hiring team? Simply paste the 6-character campaign code in your candidate dashboard to join the official hiring round immediately.",
      points: [
        {
          title: "Instant 1-Click Access",
          desc: "Paste your 6-character campaign code and jump straight into the employer's customized technical screening."
        },
        {
          title: "Skip the Resume Black Hole",
          desc: "Your verified scorecards and transcripts land directly on the hiring manager's shortlist, bypassing initial screening calls."
        },
        {
          title: "Real-Time Submission & Status",
          desc: "Get instant confirmation once submitted and monitor your application review status in real time."
        }
      ],
      highlight: "1-Click campaign join with code & direct recruiter shortlisting",
      placeholderTag: "Screenshot: Campaign Code Entry & Direct Employer Gateway",
      altText: "Join campaign modal with 6-digit code input and employer interview launch"
    }
  ];

  // Business Step-by-step Interactive Workflow
  const businessSteps = [
    {
      step: 1,
      title: "Post a role in minutes",
      description:
        "Define target job titles, required tech stacks, and seniority level. ForkTalent automatically generates comprehensive question banks, or you can import custom benchmark rubrics in 1 click.",
      highlight: "Custom question bank generation & rubric customization",
      placeholderTag: "Screenshot: Campaign Creation & Role Configuration"
    },
    {
      step: 2,
      title: "Let AI screen and rank candidates",
      description:
        "Candidates undergo realistic 30-minute autonomous voice technical interviews with adaptive follow-ups, strict proctoring verification, and real-time audio transcription.",
      highlight: "Autonomous voice interviews & anti-cheating monitoring",
      placeholderTag: "Screenshot: Autonomous AI Live Screening Room"
    },
    {
      step: 3,
      title: "Review structured interview scorecards",
      description:
        "Access ranked candidate leaderboards with multidimensional STAR ratings, radar competency charts, key strengths, weaknesses, and synchronized video playback.",
      highlight: "STAR competency scoring & candidate ranking matrices",
      placeholderTag: "Screenshot: Candidate Diagnostic Scorecard & Replay"
    },
    {
      step: 4,
      title: "Shortlist and hire — all in one dashboard",
      description:
        "Advance verified top performers with 1-click approvals, add collaborative team review notes, and export comprehensive applicant dossiers directly to your ATS.",
      highlight: "1-Click shortlisting, dossier PDF exports & ATS sync",
      placeholderTag: "Screenshot: Recruiter Dashboard & Decision Hub"
    }
  ];

  // FAQs
  const candidateFaqs = [
    {
      q: "How do interview credits work in ForkTalent?",
      a: "Credits correspond directly to session time: 1 minute of AI technical interview consumes exactly 1 Credit. All features — including speech synthesis, STAR response scoring, transcript logs, and PDF export — are included without hidden fees."
    },
    {
      q: "Are my mock interview recordings private?",
      a: "Yes, 100% private. Practice interviews you conduct in your mock interview studio are strictly confidential and visible only to you. They are never shared with any employer unless you explicitly participate in an employer hiring campaign."
    },
    {
      q: "What tech stacks and roles does ForkTalent support?",
      a: "ForkTalent covers Frontend (React, Vue, Angular), Backend (Node, Python, Java, Go), Full Stack, DevOps & Cloud (Kubernetes, AWS, Docker), Data Engineering, System Design, and Behavioral leadership rounds."
    },
    {
      q: "What happens if my connection drops during a live session?",
      a: "Our state coordinator saves your question turns automatically. Unused minutes from any interrupted session remain safely protected in your wallet balance."
    }
  ];

  const employerFaqs = [
    {
      q: "How does ForkTalent prevent bias and cheating?",
      a: "Every candidate receives standardized questions evaluated against fixed STAR rubrics. The system includes automated tab-switch detection, webcam proctoring checks, and audio integrity analysis to ensure authenticity."
    },
    {
      q: "Can we configure custom technical question banks?",
      a: "Yes. Employers can upload custom technical syllabi, specific scenario questions, and expected benchmark answers, or use our AI prompt generator to configure role-specific interview tracks in seconds."
    },
    {
      q: "How do we invite candidates to an interview campaign?",
      a: "You can invite candidates directly by entering emails, pasting a bulk list, uploading a CSV file, or sharing your campaign's unique code on job postings."
    },
    {
      q: "Do you support high-volume campus hiring drives?",
      a: "Yes! ForkTalent scales seamlessly for bulk hiring drives screening hundreds of candidates concurrently. Reach out to our team on WhatsApp for bespoke campaign setups."
    }
  ];

  const activeFaqs = audience === "candidate" ? candidateFaqs : employerFaqs;

  return (
    <div className="w-full min-h-screen bg-[var(--color-canvas)] text-[var(--color-text-primary)] font-['Inter'] selection:bg-[var(--color-primary-tint)] selection:text-[var(--color-text-accent)]">

      {/* ─────────────────────────────────────────────────────────────
          1. STICKY MINI-HEADER ON SCROLL
      ───────────────────────────────────────────────────────────── */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 bg-[var(--color-canvas)]/95 backdrop-blur-md border-b border-[var(--color-border)] transition-all duration-300 ${isStickyVisible ? "translate-y-0 opacity-100 shadow-md" : "-translate-y-full opacity-0 pointer-events-none"
          }`}
      >
        <div className="w-full px-4 sm:px-6 md:px-8 xl:px-10 h-14 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-xl bg-[var(--color-primary)] text-white flex items-center justify-center p-1.5 shadow-xs">
              <ForkLogo className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium tracking-tight text-[var(--color-text-primary)]">
              Fork<span className="text-[var(--color-text-accent)]">Talent</span>
            </span>
          </Link>

          {/* Sticky Tab Switcher Shortcut */}
          <div className="flex items-center bg-[var(--color-surface)] border border-[var(--color-border)] p-1 rounded-xl text-xs">
            <button
              onClick={() => handleTabChange("candidate")}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${audience === "candidate"
                ? "bg-[var(--color-primary-tint)] text-[var(--color-text-accent)] border border-[var(--color-border-active)]/40 shadow-xs"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
            >
              Candidates
            </button>
            <button
              onClick={() => handleTabChange("business")}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${audience === "business"
                ? "bg-[var(--color-primary-tint)] text-[var(--color-text-accent)] border border-[var(--color-border-active)]/40 shadow-xs"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
            >
              Business
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            {audience === "candidate" ? (
              <button
                onClick={() => scrollToSection("hero-auth")}
                className="px-3.5 py-1.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-medium transition-all shadow-xs"
              >
                Start Practicing Free
              </button>
            ) : (
              <a
                href="https://wa.me/8655021064?text=Hello%20ForkTalent%20Team,%20I%20would%20like%20to%20book%20an%20Employer%20Demo."
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium transition-all shadow-xs flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Contact for Demo</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN TOP HEADER (Navigation & Branding)
      ───────────────────────────────────────────────────────────── */}
      <header className="w-full bg-[var(--color-canvas)] border-b border-[var(--color-border)]">
        <div className="w-full px-4 sm:px-6 md:px-8 xl:px-10 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 rounded-xl bg-[var(--color-primary)] text-white flex items-center justify-center p-1.5 shadow-xs transition-transform group-hover:scale-105">
              <ForkLogo className="w-5 h-5 text-white" />
            </div>
            <span className="text-base font-medium tracking-tight text-[var(--color-text-primary)]">
              Fork<span className="text-[var(--color-text-accent)]">Talent</span>
            </span>
          </Link>

          {/* Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-[var(--color-text-secondary)]">
            <button
              onClick={() => scrollToSection("workflow-section")}
              className="hover:text-[var(--color-text-primary)] transition-colors"
            >
              Product
            </button>
            <button
              onClick={() => scrollToSection(audience === "candidate" ? "testimonials-section" : "metrics-section")}
              className="hover:text-[var(--color-text-primary)] transition-colors"
            >
              {audience === "candidate" ? "Reviews" : "Enterprise"}
            </button>
            <button
              onClick={() => scrollToSection("faq-section")}
              className="hover:text-[var(--color-text-primary)] transition-colors"
            >
              FAQs
            </button>
            <button
              onClick={() => scrollToSection("footer-contact")}
              className="hover:text-[var(--color-text-primary)] transition-colors"
            >
              Contact
            </button>
          </nav>

          {/* Right Action */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] px-3 py-1.5 rounded-xl transition-colors"
            >
              Sign In
            </Link>
            <button
              onClick={() => scrollToSection("hero-auth")}
              className="px-4 py-2 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-medium transition-all shadow-xs"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          3. PERSISTENT TAB SWITCHER (For Candidates / For Business)
      ───────────────────────────────────────────────────────────── */}
      <section className="w-full bg-[var(--color-canvas)] border-b border-[var(--color-border)] py-3 sticky top-0 z-40 backdrop-blur-md bg-[var(--color-canvas)]/90">
        <div className="w-full px-4 sm:px-6 md:px-8 xl:px-10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--color-text-muted)] font-medium">I am here as:</span>
            <div className="inline-flex p-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-xs">
              <button
                onClick={() => handleTabChange("candidate")}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${audience === "candidate"
                  ? "bg-[var(--color-primary-tint)] text-[var(--color-text-accent)] border border-[var(--color-border-active)] shadow-xs"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  }`}
                aria-pressed={audience === "candidate"}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>For Candidates</span>
              </button>

              <button
                onClick={() => handleTabChange("business")}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${audience === "business"
                  ? "bg-[var(--color-primary-tint)] text-[var(--color-text-accent)] border border-[var(--color-border-active)] shadow-xs"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  }`}
                aria-pressed={audience === "business"}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>For Business</span>
              </button>
            </div>
          </div>

          {/* Value Badge */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-[var(--color-text-muted)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>
              {audience === "candidate"
                ? "15 Free practice credits on signup"
                : "Automated candidate screening & proctoring"}
            </span>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. MAIN VIEWPORT (Renders dynamically based on active tab)
      ───────────────────────────────────────────────────────────── */}
      <main className="w-full">
        {audience === "candidate" ? (
          /* =========================================================
             TAB 1: FOR CANDIDATES
          ========================================================= */
          <div className="w-full space-y-16 sm:space-y-24 py-10 sm:py-16">

            {/* SECTION 1: HERO (Split Layout — Text Left / Video Right) */}
            <section className="w-full px-4 sm:px-6 md:px-8 xl:px-10">
              <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">

                {/* Left Column: Text & 1-Click Practice CTA */}
                <div className="lg:col-span-6 space-y-6">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-primary-tint)] text-[var(--color-text-accent)] border border-[var(--color-border-active)]/30 text-xs font-medium">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI-Powered Technical Interview Prep</span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-[var(--color-text-primary)] leading-[1.15]">
                    Practice interviews. <br />
                    <span className="text-[var(--color-text-accent)]">Get hired faster.</span>
                  </h1>

                  <p className="text-xs sm:text-sm md:text-base text-[var(--color-text-secondary)] leading-relaxed font-normal max-w-xl">
                    Master tough technical and behavioral loops with adaptive AI voice simulations. Get instant STAR competency scores, model answers, and direct visibility with top hiring employers.
                  </p>

                  {/* Primary CTA Box & Google 1-Click Auth */}
                  <div id="hero-auth" className="pt-2 space-y-4 max-w-md">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <div className="scale-100 flex justify-center sm:justify-start">
                        <GoogleLogin
                          onSuccess={handleGoogleSuccess}
                          onError={() => toast.error("Google authentication encountered an issue.")}
                          theme="filled_blue"
                          size="large"
                          shape="pill"
                          text="continue_with"
                          width="240"
                        />
                      </div>
                      <button
                        onClick={() => scrollToSection("workflow-section")}
                        className="px-4 py-2.5 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>See how it works</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4 text-[11px] text-[var(--color-text-muted)]">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>15 Free Starter Credits</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5 text-emerald-400" />
                        <span>100% Private Practice</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Candidate Demo Video Placeholder */}
                <div className="lg:col-span-6">
                  {/* PLACEHOLDER VIDEO: Candidate Demo */}
                  <VideoPlaceholder audience="candidate" />
                </div>

              </div>
            </section>

            {/* SECTION 2: WORKFLOW & SCREENSHOTS (Interactive Step-Based Flow) */}
            <section id="workflow-section" className="w-full px-4 sm:px-6 md:px-8 xl:px-10 border-t border-[var(--color-border)] pt-16">
              <div className="max-w-5xl mx-auto space-y-10">
                <div className="text-center space-y-3 max-w-2xl mx-auto">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-primary-tint)] text-[var(--color-text-accent)] border border-[var(--color-border-active)]/30 text-xs font-medium">
                    <Layers className="w-3.5 h-3.5" />
                    <span>How ForkTalent Works</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--color-text-primary)]">
                    How ForkTalent prepares you for your next Interview
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] font-normal">
                    Click through the 4 steps below to explore how ForkTalent turns interview preparation into verified job offers.
                  </p>
                </div>

                {/* Step Selector Pills (1-2-3-4) */}
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {candidateSteps.map((s, idx) => (
                    <button
                      key={s.step}
                      onClick={() => setActiveCandidateStep(idx)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${activeCandidateStep === idx
                        ? "bg-[var(--color-primary)] text-white shadow-xs"
                        : "bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]"
                        }`}
                    >
                      <span className="w-5 h-5 rounded-lg bg-black/20 flex items-center justify-center text-[11px] font-mono">
                        {s.step}
                      </span>
                      <span>{s.title}</span>
                    </button>
                  ))}
                </div>

                {/* Active Step Card */}
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 sm:p-10 space-y-8 shadow-xs relative overflow-hidden">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

                    {/* Left: Step Details */}
                    <div className="lg:col-span-6 space-y-5">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[var(--color-primary-tint)] text-[var(--color-text-accent)] border border-[var(--color-border-active)]/30 text-xs font-mono">
                        <span>STAGE {candidateSteps[activeCandidateStep].step} OF 4 • {candidateSteps[activeCandidateStep].stageBadge}</span>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-medium text-[var(--color-text-primary)] tracking-tight">
                        {candidateSteps[activeCandidateStep].title}
                      </h3>

                      <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed font-normal">
                        {candidateSteps[activeCandidateStep].description}
                      </p>

                      {/* Bullet Points */}
                      <ul className="space-y-2.5 text-xs text-[var(--color-text-secondary)] pt-1 border-t border-[var(--color-border)]">
                        {candidateSteps[activeCandidateStep].points.map((pt, pIdx) => (
                          <li key={pIdx} className="flex items-start gap-2.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span><strong>{pt.title}:</strong> {pt.desc}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="p-3.5 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] flex items-start gap-2.5 text-xs text-[var(--color-text-accent)]">
                        <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                        <span><strong>Key advantage:</strong> {candidateSteps[activeCandidateStep].highlight}</span>
                      </div>

                      {/* Previous / Next Controls */}
                      <div className="flex items-center gap-3 pt-2">
                        <button
                          disabled={activeCandidateStep === 0}
                          onClick={() => setActiveCandidateStep((prev) => Math.max(0, prev - 1))}
                          className="px-4 py-2 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1.5"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Previous</span>
                        </button>

                        <button
                          disabled={activeCandidateStep === candidateSteps.length - 1}
                          onClick={() => setActiveCandidateStep((prev) => Math.min(candidateSteps.length - 1, prev + 1))}
                          className="px-4 py-2 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all inline-flex items-center gap-1.5 shadow-xs"
                        >
                          <span>Next Step</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-1.5 ml-auto">
                          {candidateSteps.map((_, dotIdx) => (
                            <span
                              key={dotIdx}
                              className={`w-2 h-2 rounded-full transition-all ${activeCandidateStep === dotIdx ? "w-6 bg-[var(--color-text-accent)]" : "bg-[var(--color-border)]"
                                }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right: Step UI Screenshot Placeholder */}
                    <div className="lg:col-span-6">
                      <ScreenshotPlaceholder
                        stepNumber={candidateSteps[activeCandidateStep].step}
                        caption={candidateSteps[activeCandidateStep].placeholderTag}
                        alt={candidateSteps[activeCandidateStep].altText}
                        height="h-64 sm:h-80"
                      />
                    </div>

                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 3: INFINITE MOVING TESTIMONIAL MARQUEE */}
            <section id="testimonials-section" className="w-full py-12 border-y border-[var(--color-border)] bg-[var(--color-surface)]/40 overflow-hidden space-y-8">
              <div className="w-full px-4 sm:px-6 md:px-8 xl:px-10 text-center space-y-2 max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
                  <Star className="w-3 h-3 fill-emerald-400" />
                  <span>Candidate Success Stories</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-medium text-[var(--color-text-primary)] tracking-tight">
                  Loved by engineers who landed their dream offers
                </h2>
                <p className="text-xs text-[var(--color-text-secondary)] font-normal">
                  Authentic reviews from candidates across frontend, backend, DevOps, and cloud tracks.
                </p>
              </div>

              {/* Marquee Strip (Pauses on hover / respects reduced-motion) */}
              <div className="relative w-full overflow-hidden">
                {/* Left & Right gradient fades */}
                <div className="absolute top-0 bottom-0 left-0 w-16 sm:w-24 bg-gradient-to-r from-[var(--color-canvas)] to-transparent z-10 pointer-events-none" />
                <div className="absolute top-0 bottom-0 right-0 w-16 sm:w-24 bg-gradient-to-l from-[var(--color-canvas)] to-transparent z-10 pointer-events-none" />

                <div className="ft-animate-marquee gap-5 px-4">
                  {/* Render testimonials twice for continuous loop */}
                  {[...candidateTestimonials, ...candidateTestimonials].map((t, idx) => (
                    <div
                      key={idx}
                      className="w-[320px] sm:w-[360px] p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3 shrink-0 shadow-xs transition-colors hover:border-[var(--color-border-active)]/40 select-none"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-[var(--color-primary-tint)] border border-[var(--color-border-active)]/30 text-[var(--color-text-accent)] font-medium text-xs flex items-center justify-center">
                            {t.initials}
                          </div>
                          <div>
                            <div className="text-xs font-medium text-[var(--color-text-primary)]">{t.name}</div>
                            <div className="text-[10px] text-[var(--color-text-muted)]">{t.role} • {t.company}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {[...Array(t.stars)].map((_, s) => (
                            <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-normal italic">
                        "{t.quote}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

          </div>
        ) : (
          /* =========================================================
             TAB 2: FOR BUSINESS / EMPLOYERS
          ========================================================= */
          <div className="w-full space-y-16 sm:space-y-24 py-10 sm:py-16">

            {/* SECTION 1: HERO (Split Layout — Text Left / Video Right) */}
            <section className="w-full px-4 sm:px-6 md:px-8 xl:px-10">
              <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">

                {/* Left Column: Text & Recruiter CTAs */}
                <div className="lg:col-span-6 space-y-6">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Autonomous AI Technical Screening Platform</span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-[var(--color-text-primary)] leading-[1.15]">
                    Screen candidates faster. <br />
                    <span className="text-[var(--color-text-accent)]">Hire with confidence.</span>
                  </h1>

                  <p className="text-xs sm:text-sm md:text-base text-[var(--color-text-secondary)] leading-relaxed font-normal max-w-xl">
                    Replace manual screening calls with structured, unbiased AI voice interviews. Evaluate hundreds of technical applicants in hours, inspect deep STAR scorecards, and make data-driven hiring decisions.
                  </p>

                  <div id="hero-auth" className="pt-2 space-y-4 max-w-md">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <a
                        href="https://wa.me/8655021064?text=Hello%20ForkTalent%20Team,%20I'm%20interested%20in%20setting%20up%20an%20Employer%20Custom%20Hiring%20Campaign."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium transition-all shadow-xs flex items-center justify-center gap-2"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Contact for Demo</span>
                        <ExternalLink className="w-3 h-3 opacity-80" />
                      </a>

                      <button
                        onClick={() => scrollToSection("workflow-section")}
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

                {/* Right Column: Employer Demo Video Placeholder */}
                <div className="lg:col-span-6">
                  {/* PLACEHOLDER VIDEO: Employer Demo */}
                  <VideoPlaceholder audience="business" />
                </div>

              </div>
            </section>

            {/* SECTION 2: WORKFLOW & SCREENSHOTS (Step-Based "Next" Flow) */}
            <section id="workflow-section" className="w-full px-4 sm:px-6 md:px-8 xl:px-10 border-t border-[var(--color-border)] pt-16">
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
                    Click through the 4 steps below to explore how ForkTalent streamlines technical hiring from creation to decision.
                  </p>
                </div>

                {/* Step Selector Pills (1-2-3-4) */}
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {businessSteps.map((s, idx) => (
                    <button
                      key={s.step}
                      onClick={() => setActiveBusinessStep(idx)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${activeBusinessStep === idx
                        ? "bg-[var(--color-primary)] text-white shadow-xs"
                        : "bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]"
                        }`}
                    >
                      <span className="w-5 h-5 rounded-lg bg-black/20 flex items-center justify-center text-[11px] font-mono">
                        {s.step}
                      </span>
                      <span>{s.title}</span>
                    </button>
                  ))}
                </div>

                {/* Active Step Card */}
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 sm:p-10 space-y-8 shadow-xs relative overflow-hidden">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

                    {/* Left: Step Details */}
                    <div className="lg:col-span-6 space-y-5">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[var(--color-primary-tint)] text-[var(--color-text-accent)] border border-[var(--color-border-active)]/30 text-xs font-mono">
                        <span>STAGE {businessSteps[activeBusinessStep].step} OF 4</span>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-medium text-[var(--color-text-primary)] tracking-tight">
                        {businessSteps[activeBusinessStep].title}
                      </h3>

                      <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed font-normal">
                        {businessSteps[activeBusinessStep].description}
                      </p>

                      <div className="p-3.5 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] flex items-start gap-2.5 text-xs text-[var(--color-text-accent)]">
                        <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                        <span><strong>Key capability:</strong> {businessSteps[activeBusinessStep].highlight}</span>
                      </div>

                      {/* Previous / Next Controls */}
                      <div className="flex items-center gap-3 pt-2">
                        <button
                          disabled={activeBusinessStep === 0}
                          onClick={() => setActiveBusinessStep((prev) => Math.max(0, prev - 1))}
                          className="px-4 py-2 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1.5"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Previous</span>
                        </button>

                        <button
                          disabled={activeBusinessStep === businessSteps.length - 1}
                          onClick={() => setActiveBusinessStep((prev) => Math.min(businessSteps.length - 1, prev + 1))}
                          className="px-4 py-2 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all inline-flex items-center gap-1.5 shadow-xs"
                        >
                          <span>Next Step</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-1.5 ml-auto">
                          {businessSteps.map((_, dotIdx) => (
                            <span
                              key={dotIdx}
                              className={`w-2 h-2 rounded-full transition-all ${activeBusinessStep === dotIdx ? "w-6 bg-[var(--color-text-accent)]" : "bg-[var(--color-border)]"
                                }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right: Step UI Screenshot Placeholder */}
                    <div className="lg:col-span-6">
                      <ScreenshotPlaceholder
                        stepNumber={businessSteps[activeBusinessStep].step}
                        caption={businessSteps[activeBusinessStep].placeholderTag}
                        alt={`Recruiter workflow step ${businessSteps[activeBusinessStep].step} preview`}
                        height="h-64 sm:h-80"
                      />
                    </div>

                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 3: "TRUSTED BY" CLIENT LOGOS & STATS */}
            <section id="metrics-section" className="w-full px-4 sm:px-6 md:px-8 xl:px-10 border-t border-[var(--color-border)] pt-16 space-y-12">
              <div className="max-w-6xl mx-auto space-y-8">

                {/* Metrics Bar */}
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center shadow-xs">
                  <div className="space-y-1">
                    <div className="text-2xl sm:text-3xl font-medium text-[var(--color-text-primary)] tracking-tight">500+</div>
                    <div className="text-xs text-[var(--color-text-secondary)]">Technical Roles Filled</div>
                    {/* TODO: Replace with real metrics before launch */}
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl sm:text-3xl font-medium text-emerald-400 tracking-tight">40%</div>
                    <div className="text-xs text-[var(--color-text-secondary)]">Faster Hiring Cycles</div>
                    {/* TODO: Replace with real metrics before launch */}
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl sm:text-3xl font-medium text-[var(--color-text-accent)] tracking-tight">92%</div>
                    <div className="text-xs text-[var(--color-text-secondary)]">Candidate Completion Rate</div>
                    {/* TODO: Replace with real metrics before launch */}
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl sm:text-3xl font-medium text-white tracking-tight">100%</div>
                    <div className="text-xs text-[var(--color-text-secondary)]">Standardized STAR Rubrics</div>
                    {/* TODO: Replace with real metrics before launch */}
                  </div>
                </div>

                {/* Verified Fictional Client Logos */}
                <div className="space-y-4 text-center">
                  <p className="text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-wider">
                    Trusted by engineering teams and scale-ups
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {businessClients.map((client, cIdx) => (
                      <div
                        key={cIdx}
                        className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col items-center justify-center text-center space-y-1 shadow-xs transition-colors hover:border-[var(--color-border-active)]/40"
                      >
                        <Building2 className="w-5 h-5 text-[var(--color-text-accent)] opacity-80" />
                        <span className="text-xs font-medium text-[var(--color-text-primary)]">{client.name}</span>
                        <span className="text-[9px] text-[var(--color-text-muted)] font-mono">{client.tag}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Custom Hiring Drives Banner */}
                <div className="p-6 rounded-2xl bg-gradient-to-r from-[var(--color-surface)] via-[var(--color-surface)] to-[var(--color-primary-tint)] border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-1 text-center md:text-left">
                    <h3 className="text-sm sm:text-base font-medium text-[var(--color-text-primary)]">
                      Running a campus hiring drive or high-volume technical screening?
                    </h3>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      Our operations desk configures bespoke question tracks, custom benchmark rubrics, and high-concurrency access.
                    </p>
                  </div>
                  <a
                    href="https://wa.me/8655021064?text=Hello%20ForkTalent%20Team,%20I'm%20interested%20in%20a%20Custom%20Hiring%20Drive."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium transition-all shadow-xs flex items-center gap-2 shrink-0"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp Priority Desk</span>
                  </a>
                </div>

              </div>
            </section>

          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            5. SHARED FAQ ACCORDION SECTION (Content tailored per tab)
        ───────────────────────────────────────────────────────────── */}
        <section id="faq-section" className="w-full px-4 sm:px-6 md:px-8 xl:px-10 border-t border-[var(--color-border)] py-16">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[var(--color-primary-tint)] text-[var(--color-text-accent)] border border-[var(--color-border-active)]/30 text-xs font-medium">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Frequently Asked Questions</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--color-text-primary)]">
                {audience === "candidate" ? "Candidate Questions & Answers" : "Employer Platform Questions"}
              </h2>
            </div>

            <div className="space-y-3">
              {activeFaqs.map((faq, fIdx) => {
                const isOpen = openFaqIndex === fIdx;
                return (
                  <div
                    key={fIdx}
                    className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden transition-colors"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : fIdx)}
                      className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-[var(--color-surface-hover)] transition-colors"
                    >
                      <span className="text-xs sm:text-sm font-medium text-[var(--color-text-primary)]">
                        {faq.q}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-[var(--color-text-muted)] shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-[var(--color-text-accent)]" : ""
                          }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed border-t border-[var(--color-border)]/50 pt-3 bg-[var(--color-canvas)]/30">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            6. CONVERSION CTA BANNER (Before Footer)
        ───────────────────────────────────────────────────────────── */}
        <section className="w-full px-4 sm:px-6 md:px-8 xl:px-10 pb-16">
          <div className="max-w-5xl mx-auto rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border-active)]/30 p-8 sm:p-12 text-center space-y-6 shadow-md relative overflow-hidden">
            <div className="space-y-2 max-w-xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--color-text-primary)]">
                {audience === "candidate"
                  ? "Ready to crack your upcoming technical interview?"
                  : "Ready to cut recruitment screening time by 75%?"}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] font-normal">
                {audience === "candidate"
                  ? "Get started with 15 free practice credits in less than 30 seconds."
                  : "Launch your first custom campaign or test our autonomous voice screening platform."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  trackEvent("banner_get_started_click");
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-medium transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <span>{audience === "candidate" ? "Start Free Practice Now" : "Launch Employer Campaign"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="https://wa.me/8655021064"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[var(--color-canvas)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Talk to Support</span>
              </a>
            </div>
          </div>
        </section>

      </main>

      {/* ─────────────────────────────────────────────────────────────
          7. GLOBAL SHARED FOOTER (Same on both tabs)
      ───────────────────────────────────────────────────────────── */}
      <footer id="footer-contact" className="w-full px-4 sm:px-6 md:px-8 xl:px-10 py-12 border-t border-[var(--color-border)] bg-[var(--color-canvas)] text-xs text-[var(--color-text-secondary)]">
        <div className="max-w-6xl mx-auto space-y-10">

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 border-b border-[var(--color-border)] pb-10">
            {/* Column 1: Brand & Tagline */}
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-[var(--color-primary)] text-white flex items-center justify-center p-1 shadow-xs">
                  <ForkLogo className="w-4 h-4 text-white" />
                </div>
                <span className="text-base font-medium tracking-tight text-[var(--color-text-primary)]">
                  Fork<span className="text-[var(--color-text-accent)]">Talent</span>
                </span>
              </div>
              <p className="text-[11px] text-[var(--color-text-muted)] max-w-sm leading-relaxed">
                Autonomous voice & technical interview platform for candidate practice and structured employer recruitment screening.
              </p>

              {/* Social Icons Placeholder */}
              <div className="flex items-center gap-3 pt-2 text-[var(--color-text-muted)]">
                <a href="#" className="hover:text-[var(--color-text-primary)] transition-colors" title="LinkedIn">
                  <Share2 className="w-4 h-4" />
                </a>
                <a href="#" className="hover:text-[var(--color-text-primary)] transition-colors" title="Twitter / X">
                  <ExternalLink className="w-4 h-4" />
                </a>
                <a href="#" className="hover:text-[var(--color-text-primary)] transition-colors" title="GitHub">
                  <FileText className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Column 2: Product Links */}
            <div className="md:col-span-2 space-y-2.5">
              <div className="text-xs font-medium text-[var(--color-text-primary)]">Product</div>
              <ul className="space-y-2 text-[11px] text-[var(--color-text-muted)]">
                <li>
                  <button onClick={() => handleTabChange("candidate")} className="hover:text-[var(--color-text-primary)] transition-colors">
                    For Candidates
                  </button>
                </li>
                <li>
                  <button onClick={() => handleTabChange("business")} className="hover:text-[var(--color-text-primary)] transition-colors">
                    For Business
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection("testimonials-section")} className="hover:text-[var(--color-text-primary)] transition-colors">
                    Candidate Reviews
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection("workflow-section")} className="hover:text-[var(--color-text-primary)] transition-colors">
                    Workflow Tour
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Company */}
            <div className="md:col-span-2 space-y-2.5">
              <div className="text-xs font-medium text-[var(--color-text-primary)]">Company</div>
              <ul className="space-y-2 text-[11px] text-[var(--color-text-muted)]">
                <li>
                  <Link to="/employer/how-it-works" className="hover:text-[var(--color-text-primary)] transition-colors">
                    About Platform
                  </Link>
                </li>
                <li>
                  <Link to="/employer/contact" className="hover:text-[var(--color-text-primary)] transition-colors">
                    Support Desk
                  </Link>
                </li>
                <li>
                  <a href="https://wa.me/8655021064" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-text-primary)] transition-colors">
                    WhatsApp Desk
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: Contact Details Block (Clearly Marked Placeholders) */}
            <div className="md:col-span-3 space-y-2.5">
              <div className="text-xs font-medium text-[var(--color-text-primary)]">Contact Info</div>
              <div className="space-y-2 text-[11px] text-[var(--color-text-muted)]">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[var(--color-text-accent)] shrink-0" />
                  {/* PLACEHOLDER: Contact Email */}
                  <span className="select-all">hello@forktalent.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  {/* PLACEHOLDER: Contact Phone */}
                  <a href="tel:+918655021064" className="hover:text-[var(--color-text-primary)] select-all">+91 86550 21064</a>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[var(--color-text-accent)] shrink-0 mt-0.5" />
                  {/* PLACEHOLDER: Office Address */}
                  <span>402 Apex Towers, Cyber City, Bangalore, India</span>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Copyright & Security note */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[var(--color-text-muted)]">
            <div>
              © 2026 ForkTalent. All rights reserved.
            </div>
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

    </div>
  );
}
