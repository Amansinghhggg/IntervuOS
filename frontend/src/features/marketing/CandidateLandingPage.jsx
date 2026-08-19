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
  Star,
  ChevronRight,
  ChevronLeft,
  HelpCircle,
  Shield,
  Zap,
  Globe,
  Award,
  Maximize2,
  X,
  Mail,
  Phone,
  MapPin,
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
 * Candidate Video Player Box with dynamic audio waveforms & click-to-play toggle.
 */
function CandidateVideoPlayer() {
  const videoSrc = "/assets/video/candidate-demo-placeholder.mp4";
  const posterSrc = "/assets/images/candidate-poster.png";

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
          key="candidate-video-elem"
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
                <span>Meera • AI Technical Interviewer</span>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center space-y-3 my-auto">
              <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-[var(--color-primary)] text-white flex items-center justify-center shadow-xl shadow-[var(--color-primary)]/35 transition-all group-hover:scale-110 hover:bg-[var(--color-primary-hover)] active:scale-95">
                <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-white ml-0.5" />
              </div>

              <div className="text-center space-y-1">
                <p className="text-sm sm:text-base font-medium text-[var(--color-text-primary)] tracking-tight">
                  Say Hi to Meera
                </p>
                <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
                  <span>Live voice interview & unbiased STAR feedback</span>
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

export default function CandidateLandingPage() {
  const { user, googleLogin } = useAuth();
  const navigate = useNavigate();

  const [isStickyVisible, setIsStickyVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [lightboxModal, setLightboxModal] = useState(null);

  useEffect(() => {
    document.title = "ForkTalent — Practice AI Technical Interviews & Get Hired";

    const handleScroll = () => {
      if (window.scrollY > 380) {
        setIsStickyVisible(true);
      } else {
        setIsStickyVisible(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setLightboxModal(null);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("keydown", handleKeyDown);
    };
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

  // Candidate Testimonials
  const testimonials = [
    {
      name: "Aman Verma",
      role: "Full Stack Engineer",
      company: "Bengaluru",
      initials: "AV",
      stars: 5,
      quote:
        "Practiced 3 system design rounds before my interview at Swiggy. The follow-up questioning on caching strategies caught me off guard in the best way possible."
    },
    {
      name: "Pooja Hegde",
      role: "Senior Frontend Engineer",
      company: "Hyderabad",
      initials: "PH",
      stars: 5,
      quote:
        "The turn-by-turn STAR scorecard showed me exactly why my architectural answers were scoring low. I landed a senior frontend role within 2 weeks."
    },
    {
      name: "Rohan Mukherjee",
      role: "Backend Architect",
      company: "Pune",
      initials: "RM",
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
    }
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
      image: "/assets/images/screenshots/candidate-step1-calibration.png",
      placeholderTag: "Role, Seniority & Topic Calibration Studio",
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
      image: "/assets/images/screenshots/step2-live-screening.png",
      placeholderTag: "Live AI Voice Technical Interview Room",
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
      image: "/assets/images/screenshots/step3-diagnostic-scorecard.png",
      placeholderTag: "STAR Diagnostic Scorecard & Evaluation Matrix",
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
      image: "/assets/images/screenshots/candidate-step4-assigned-code.png",
      placeholderTag: "Campaign Code Entry & Direct Employer Gateway",
      altText: "Join campaign modal with 6-digit code input and employer interview launch"
    }
  ];

  // FAQs
  const candidateFaqs = [
    {
      q: "How realistic is the AI technical mock interview?",
      a: "ForkTalent utilizes ultra-low-latency voice synthesis and adaptive LLMs fine-tuned on thousands of real FAANG engineering interview rubrics. The AI actively probes your architecture trade-offs, challenges your edge cases, and provides instant turn-by-turn STAR scoring."
    },
    {
      q: "Do I get free starter credits when I sign up?",
      a: "Yes! Every candidate receives 15 free starter credits immediately upon 1-click Google authentication. No credit card or upfront billing information is ever required."
    },
    {
      q: "Can I choose my specific seniority and engineering topics?",
      a: "Absolutely. You can calibrate between Junior (0–2 yrs), Mid-Level (3–5 yrs), Senior (5+ yrs), or Lead, and pick specialized topics including React, Node.js, SQL optimization, Concurrency, and System Design."
    },
    {
      q: "How does the recruiter campaign code work?",
      a: "If an employer has invited you to complete a ForkTalent screening round, simply log in and paste their 6-character campaign code into your candidate dashboard. You will bypass generic mock questions and complete the employer's exact customized technical syllabus."
    },
    {
      q: "Is my practice data private from my current employer?",
      a: "100% private. Your candidate practice mock sessions, diagnostic transcripts, and scorecards are strictly confidential and encrypted under your personal account."
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-text-primary)] flex flex-col selection:bg-[var(--color-primary-tint)] selection:text-[var(--color-text-accent)] relative">

      {/* ─────────────────────────────────────────────────────────────
          1. STICKY TOP BANNER: EMPLOYER GATEWAY
      ───────────────────────────────────────────────────────────── */}
      <div className="w-full bg-[var(--color-surface)] border-b border-[var(--color-border)] py-2 px-4 sm:px-6 md:px-8 xl:px-10 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[var(--color-text-secondary)]">
            Looking to screen and hire Talented Candidates ?
          </span>
        </div>
        <Link
          to="/employers"
          className="text-[var(--color-text-accent)] hover:underline font-medium flex items-center gap-1.5 transition-colors"
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Explore ForkTalent for Employers →</span>
        </Link>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. GLOBAL NAVBAR
      ───────────────────────────────────────────────────────────── */}
      <header className="w-full border-b border-[var(--color-border)] bg-[var(--color-canvas)]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 md:px-8 xl:px-10 py-3.5 flex items-center justify-between">

          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-[var(--color-primary)] text-white flex items-center justify-center p-1.5 shadow-xs transition-transform group-hover:scale-105">
                <ForkLogo className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-medium tracking-tight text-[var(--color-text-primary)] leading-none">
                  Fork<span className="text-[var(--color-text-accent)]">Talent</span>
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)] font-mono">For Candidates</span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-5 text-xs text-[var(--color-text-secondary)]">
              <button onClick={() => scrollToSection("workflow-section")} className="hover:text-[var(--color-text-primary)] transition-colors">
                How It Works
              </button>
              <button onClick={() => scrollToSection("testimonials-section")} className="hover:text-[var(--color-text-primary)] transition-colors">
                Reviews
              </button>
              <button onClick={() => scrollToSection("pricing-section")} className="hover:text-[var(--color-text-primary)] transition-colors">
                Credit Packs
              </button>
              <button onClick={() => scrollToSection("faq-section")} className="hover:text-[var(--color-text-primary)] transition-colors">
                FAQ
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/employers"
              className="hidden sm:inline-flex px-3 py-1.5 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>For Employers</span>
            </Link>

            {user ? (
              <Link
                to="/candidate/mock-interview"
                className="px-4 py-2 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-medium transition-all shadow-xs inline-flex items-center gap-1.5"
              >
                <span>Candidate Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <div className="flex items-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error("Google authentication failed")}
                  useOneTap={false}
                  theme="filled_black"
                  shape="rectangular"
                  size="medium"
                  text="signin_with"
                />
              </div>
            )}
          </div>

        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          3. MAIN CONTENT
      ───────────────────────────────────────────────────────────── */}
      <main className="w-full">
        <div className="w-full space-y-16 sm:space-y-24 py-10 sm:py-16">

          {/* SECTION 1: HERO */}
          <section className="w-full px-4 sm:px-6 md:px-8 xl:px-10">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">

              {/* Left Column: Text & CTA */}
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

                {/* Primary CTA Box */}
                <div id="hero-auth" className="pt-2 space-y-4 max-w-md">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
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

              {/* Right Column: Video Demo */}
              <div className="lg:col-span-6">
                <CandidateVideoPlayer />
              </div>

            </div>
          </section>

          {/* SECTION 2: WORKFLOW & SCREENSHOTS */}
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
                  Step into an autonomous practice environment designed to transform your interview performance.
                </p>
              </div>

              {/* Interactive Step Card */}
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 sm:p-10 space-y-8 shadow-xs relative overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

                  {/* Left: Step Details */}
                  <div className="lg:col-span-6 space-y-5">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[var(--color-primary-tint)] text-[var(--color-text-accent)] border border-[var(--color-border-active)]/30 text-xs font-mono">
                      <span>STAGE {candidateSteps[activeStep].step} OF 4 • {candidateSteps[activeStep].stageBadge}</span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-medium text-[var(--color-text-primary)] tracking-tight">
                      {candidateSteps[activeStep].title}
                    </h3>

                    <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed font-normal">
                      {candidateSteps[activeStep].description}
                    </p>

                    {/* Bullet Points */}
                    <ul className="space-y-2.5 text-xs text-[var(--color-text-secondary)] pt-1 border-t border-[var(--color-border)]">
                      {candidateSteps[activeStep].points.map((pt, pIdx) => (
                        <li key={pIdx} className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span><strong>{pt.title}:</strong> {pt.desc}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="p-3.5 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] flex items-start gap-2.5 text-xs text-[var(--color-text-accent)]">
                      <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                      <span><strong>Key advantage:</strong> {candidateSteps[activeStep].highlight}</span>
                    </div>
                  </div>

                  {/* Right: Step UI Screenshot & Controls */}
                  <div className="lg:col-span-6 space-y-4">
                    <ScreenshotDisplay
                      stepNumber={candidateSteps[activeStep].step}
                      imageSrc={candidateSteps[activeStep].image}
                      caption={candidateSteps[activeStep].placeholderTag}
                      alt={candidateSteps[activeStep].altText}
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
                        disabled={activeStep === candidateSteps.length - 1}
                        onClick={() => setActiveStep((prev) => Math.min(candidateSteps.length - 1, prev + 1))}
                        className="px-4 py-2 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all inline-flex items-center gap-1.5 shadow-xs"
                      >
                        <span>Next Step</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-1.5 ml-auto">
                        {candidateSteps.map((_, dotIdx) => (
                          <button
                            key={dotIdx}
                            onClick={() => setActiveStep(dotIdx)}
                            className={`h-2 rounded-full transition-all ${activeStep === dotIdx ? "w-6 bg-[var(--color-text-accent)]" : "w-2 bg-[var(--color-border)] hover:bg-[var(--color-text-muted)]"
                              }`}
                            aria-label={`Go to candidate step ${dotIdx + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3: TESTIMONIAL MARQUEE */}
          <section id="testimonials-section" className="w-full py-12 border-y border-[var(--color-border)] bg-[var(--color-surface)]/40 overflow-hidden space-y-8">
            <div className="w-full px-4 sm:px-6 md:px-8 xl:px-10 text-center space-y-2 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
                <Star className="w-3 h-3 fill-emerald-400" />
                <span>Verified Candidate Success</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--color-text-primary)]">
                Engineers landing dream offers with ForkTalent
              </h2>
            </div>

            <div className="w-full overflow-x-auto no-scrollbar py-2">
              <div className="flex gap-4 px-4 sm:px-6 md:px-8 w-max">
                {testimonials.map((t, idx) => (
                  <div
                    key={idx}
                    className="w-80 sm:w-96 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-5 space-y-4 shadow-xs shrink-0 flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-1">
                        {[...Array(t.stars)].map((_, sIdx) => (
                          <Star key={sIdx} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        ))}
                      </div>
                      <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-normal">
                        "{t.quote}"
                      </p>
                    </div>

                    <div className="flex items-center gap-3 pt-3 border-t border-[var(--color-border)]">
                      <div className="w-8 h-8 rounded-full bg-[var(--color-primary-tint)] border border-[var(--color-border-active)]/40 text-[var(--color-text-accent)] text-xs font-medium flex items-center justify-center">
                        {t.initials}
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-medium text-[var(--color-text-primary)]">{t.name}</div>
                        <div className="text-[11px] text-[var(--color-text-muted)]">{t.role} • {t.company}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* SECTION 4: CREDIT PACKS & PRICING */}
          <section id="pricing-section" className="w-full px-4 sm:px-6 md:px-8 xl:px-10">
            <div className="max-w-4xl mx-auto text-center space-y-10">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-primary-tint)] text-[var(--color-text-accent)] border border-[var(--color-border-active)]/30 text-xs font-medium">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Simple Pay-As-You-Go Credits</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--color-text-primary)]">
                  Practice with full freedom. No recurring lock-ins.
                </h2>
                <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
                  Every 1 credit = 1 full minute of realistic live AI technical simulation.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                {/* Plan 1 */}
                <div className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-6 space-y-5 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="text-xs font-medium text-[var(--color-text-muted)]">Starter</div>
                    <div className="text-2xl sm:text-3xl font-medium text-[var(--color-text-primary)]">Free</div>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      15 free starter credits on Google 1-click registration. Perfect for your first mock loop.
                    </p>
                    <ul className="space-y-2 text-xs text-[var(--color-text-secondary)] pt-2 border-t border-[var(--color-border)]">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>15 Free practice minutes</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Full STAR diagnostic scorecard</span>
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() => scrollToSection("hero-auth")}
                    className="w-full py-2.5 rounded-xl bg-[var(--color-canvas)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-primary)] transition-all"
                  >
                    Claim 15 Free Credits
                  </button>
                </div>

                {/* Plan 2: Highlighted */}
                <div className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-active)] p-6 space-y-5 flex flex-col justify-between relative shadow-lg shadow-[var(--color-primary)]/10">
                  <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-[var(--color-primary)] text-white text-[10px] font-medium tracking-wide">
                    POPULAR
                  </div>
                  <div className="space-y-3">
                    <div className="text-xs font-medium text-[var(--color-text-accent)]">Pro Practice Pack</div>
                    <div className="text-2xl sm:text-3xl font-medium text-[var(--color-text-primary)]">
                      ₹499 <span className="text-xs text-[var(--color-text-muted)] font-normal">/ 120 mins</span>
                    </div>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      Sufficient for 4 full-length 30-minute deep-dive mock loops with turn-by-turn STAR analysis.
                    </p>
                    <ul className="space-y-2 text-xs text-[var(--color-text-secondary)] pt-2 border-t border-[var(--color-border)]">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>120 Practice minutes</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>FAANG benchmark model answers</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Permanent audio & transcript replay</span>
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() => scrollToSection("hero-auth")}
                    className="w-full py-2.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-medium transition-all shadow-xs"
                  >
                    Get Pro Pack
                  </button>
                </div>

                {/* Plan 3 */}
                <div className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-6 space-y-5 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="text-xs font-medium text-[var(--color-text-muted)]">Sprint Master</div>
                    <div className="text-2xl sm:text-3xl font-medium text-[var(--color-text-primary)]">
                      ₹999 <span className="text-xs text-[var(--color-text-muted)] font-normal">/ 300 mins</span>
                    </div>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      Designed for candidates actively in hiring loops. Master system design, coding, and behavioral.
                    </p>
                    <ul className="space-y-2 text-xs text-[var(--color-text-secondary)] pt-2 border-t border-[var(--color-border)]">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>300 Practice minutes</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Priority AI response latency</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Multi-axis competency tracking</span>
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() => scrollToSection("hero-auth")}
                    className="w-full py-2.5 rounded-xl bg-[var(--color-canvas)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-primary)] transition-all"
                  >
                    Get Sprint Master
                  </button>
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
                  Everything you need to know
                </h2>
              </div>

              <div className="space-y-3">
                {candidateFaqs.map((faq, idx) => {
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

          {/* SECTION 6: BOTTOM CALL TO ACTION */}
          <section className="w-full px-4 sm:px-6 md:px-8 xl:px-10">
            <div className="max-w-5xl mx-auto rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] p-8 sm:p-12 text-center space-y-6 relative overflow-hidden">
              <div className="space-y-2 max-w-xl mx-auto">
                <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--color-text-primary)]">
                  Ready to crack your next technical interview?
                </h2>
                <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
                  Claim your 15 free starter credits now. Start speaking with Meera in under 60 seconds.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => scrollToSection("hero-auth")}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-medium transition-all shadow-xs inline-flex items-center justify-center gap-2"
                >
                  <span>Start Free Mock Interview</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
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
              <div className="text-xs font-medium text-[var(--color-text-primary)]">For Candidates</div>
              <ul className="space-y-2 text-[11px] text-[var(--color-text-muted)]">
                <li>
                  <button onClick={() => scrollToSection("hero-auth")} className="hover:text-[var(--color-text-primary)] transition-colors">
                    Start Mock Loop
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection("pricing-section")} className="hover:text-[var(--color-text-primary)] transition-colors">
                    Credit Packs
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection("faq-section")} className="hover:text-[var(--color-text-primary)] transition-colors">
                    Candidate FAQ
                  </button>
                </li>
              </ul>
            </div>

            {/* Enterprise Link */}
            <div className="md:col-span-2 space-y-2.5">
              <div className="text-xs font-medium text-[var(--color-text-primary)]">For Employers</div>
              <ul className="space-y-2 text-[11px] text-[var(--color-text-muted)]">
                <li>
                  <Link to="/employers" className="text-[var(--color-text-accent)] hover:underline transition-colors font-medium">
                    Employer Platform →
                  </Link>
                </li>
                <li>
                  <Link to="/employers#automation-section" className="hover:text-[var(--color-text-primary)] transition-colors">
                    Screening Studio
                  </Link>
                </li>
                <li>
                  <Link to="/employers#contact-section" className="hover:text-[var(--color-text-primary)] transition-colors">
                    Book B2B Demo
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
