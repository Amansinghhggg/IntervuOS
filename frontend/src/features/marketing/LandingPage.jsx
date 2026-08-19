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
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  X,
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
 * Reusable screenshot display box with zoom preview and lightbox trigger.
 */
function ScreenshotPlaceholder({
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
          {/* Hover overlay with Full View button */}
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
 * Reusable video player box supporting interactive playback, poster preview, and waveform simulation.
 */
function VideoPlaceholder({ audience = "candidate" }) {
  const isCandidate = audience === "candidate";
  const videoSrc = isCandidate
    ? "/assets/video/candidate-demo-placeholder.mp4"
    : "/assets/video/employer-demo-placeholder.mp4";
  const posterSrc = isCandidate
    ? "/assets/images/candidate-poster.png"
    : "/assets/images/employer-poster.png";

  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef(null);

  // When tab/audience or video source changes, reset state and load fresh video
  useEffect(() => {
    setIsPlaying(false);
    setHasError(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      videoRef.current.load();
    }
  }, [videoSrc]);

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
          toast("Click to play interactive video demo.", {
            icon: "🎬"
          });
        });
    }
  };

  return (
    <div className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2 sm:p-2.5 shadow-xs relative overflow-hidden">
      {/* Video Container */}
      <div
        onClick={togglePlay}
        className="relative w-full aspect-video rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] flex flex-col items-center justify-center overflow-hidden group cursor-pointer select-none"
      >
        {/* Real Video Element with key and direct src to force clean decoder reload */}
        <video
          key={videoSrc}
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

        {/* Dynamic UI Preview / Poster Inside Video Frame (Shown when paused/stopped) */}
        {!isPlaying && (
          <div className="w-full h-full flex flex-col justify-between p-4 sm:p-6 bg-gradient-to-b from-[var(--color-canvas)]/70 via-[var(--color-canvas)]/40 to-[var(--color-canvas)]/95 select-none relative z-20">
            {/* Background Poster Texture */}
            <img
              src={posterSrc}
              alt="Interview UI Preview"
              className="absolute inset-0 w-full h-full object-cover -z-10 opacity-35 group-hover:scale-105 transition-transform duration-700 ease-out"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />

            {/* Top Status Bar */}
            <div className="flex items-center justify-between w-full">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-surface)]/90 backdrop-blur-md border border-[var(--color-border)] text-[11px] font-medium text-[var(--color-text-primary)] shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{isCandidate ? "Meera • AI Technical Interviewer" : "Meera • AI Screening Engine"}</span>
              </div>
            </div>

            {/* Center Play Button & Meera Intro CTA */}
            <div className="flex flex-col items-center justify-center space-y-3 my-auto">
              <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-[var(--color-primary)] text-white flex items-center justify-center shadow-xl shadow-[var(--color-primary)]/35 transition-all group-hover:scale-110 hover:bg-[var(--color-primary-hover)] active:scale-95">
                <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-white ml-0.5" />
              </div>

              <div className="text-center space-y-1">
                <p className="text-sm sm:text-base font-medium text-[var(--color-text-primary)] tracking-tight">
                  {isCandidate ? "Say Hi to Meera" : "See How Meera Helps"}
                </p>
                <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
                  <span>{isCandidate ? "Live voice interview & unbiased STAR feedback" : "Autonomous screening & anti-cheating leaderboards"}</span>
                </div>
              </div>
            </div>

            {/* Bottom Audio Waveform Simulation */}
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

  // Lightbox Modal state for full-screen screenshot preview
  const [lightboxModal, setLightboxModal] = useState(null);

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
            {user ? (
              <Link
                to={user.role === "employer" ? "/employer/dashboard" : user.role === "admin" ? "/admin" : "/candidate/mock-interview"}
                className="px-4 py-2 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-medium transition-all shadow-xs"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <div className="flex items-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => toast.error("Google authentication encountered an issue.")}
                    theme="filled_blue"
                    size="medium"
                    shape="pill"
                    text="signin"
                  />
                </div>
                <button
                  onClick={() => scrollToSection("hero-auth")}
                  className="hidden sm:inline-flex px-4 py-2 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-medium transition-all shadow-xs"
                >
                  Get Started
                </button>
              </>
            )}
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
                  <VideoPlaceholder key="candidate-video-player" audience="candidate" />
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
                    </div>

                    {/* Right: Step UI Screenshot Placeholder & Controls */}
                    <div className="lg:col-span-6 space-y-4">
                      <ScreenshotPlaceholder
                        stepNumber={candidateSteps[activeCandidateStep].step}
                        imageSrc={candidateSteps[activeCandidateStep].image}
                        caption={candidateSteps[activeCandidateStep].placeholderTag}
                        alt={candidateSteps[activeCandidateStep].altText}
                        height="h-64 sm:h-80"
                        onOpenFullView={(src, caption, alt) => setLightboxModal({ src, title: caption, alt })}
                      />

                      {/* Previous / Next Controls */}
                      <div className="flex items-center gap-3 pt-1">
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
                            <button
                              key={dotIdx}
                              onClick={() => setActiveCandidateStep(dotIdx)}
                              className={`h-2 rounded-full transition-all ${activeCandidateStep === dotIdx ? "w-6 bg-[var(--color-text-accent)]" : "w-2 bg-[var(--color-border)] hover:bg-[var(--color-text-muted)]"
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
                  <VideoPlaceholder key="business-video-player" audience="business" />
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

                {/* Active Step Card */}
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 sm:p-10 space-y-8 shadow-xs relative overflow-hidden">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

                    {/* Left: Step Details */}
                    <div className="lg:col-span-6 space-y-5">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[var(--color-primary-tint)] text-[var(--color-text-accent)] border border-[var(--color-border-active)]/30 text-xs font-mono">
                        <span>STAGE {businessSteps[activeBusinessStep].step} OF 4 • {businessSteps[activeBusinessStep].stageBadge}</span>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-medium text-[var(--color-text-primary)] tracking-tight">
                        {businessSteps[activeBusinessStep].title}
                      </h3>

                      <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed font-normal">
                        {businessSteps[activeBusinessStep].description}
                      </p>

                      {/* Bullet Points */}
                      {businessSteps[activeBusinessStep].points && (
                        <ul className="space-y-2.5 text-xs text-[var(--color-text-secondary)] pt-1 border-t border-[var(--color-border)]">
                          {businessSteps[activeBusinessStep].points.map((pt, pIdx) => (
                            <li key={pIdx} className="flex items-start gap-2.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span><strong>{pt.title}:</strong> {pt.desc}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      <div className="p-3.5 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] flex items-start gap-2.5 text-xs text-[var(--color-text-accent)]">
                        <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                        <span><strong>Key capability:</strong> {businessSteps[activeBusinessStep].highlight}</span>
                      </div>
                    </div>

                    {/* Right: Step UI Screenshot Placeholder & Controls */}
                    <div className="lg:col-span-6 space-y-4">
                      <ScreenshotPlaceholder
                        stepNumber={businessSteps[activeBusinessStep].step}
                        imageSrc={businessSteps[activeBusinessStep].image}
                        caption={businessSteps[activeBusinessStep].placeholderTag}
                        alt={businessSteps[activeBusinessStep].altText || `Recruiter workflow step ${businessSteps[activeBusinessStep].step} preview`}
                        height="h-64 sm:h-80"
                        onOpenFullView={(src, caption, alt) => setLightboxModal({ src, title: caption, alt })}
                      />

                      {/* Previous / Next Controls */}
                      <div className="flex items-center gap-3 pt-1">
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
                            <button
                              key={dotIdx}
                              onClick={() => setActiveBusinessStep(dotIdx)}
                              className={`h-2 rounded-full transition-all ${activeBusinessStep === dotIdx ? "w-6 bg-[var(--color-text-accent)]" : "w-2 bg-[var(--color-border)] hover:bg-[var(--color-text-muted)]"
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
                  <span className="select-all">2468amansingh@gmail.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  {/* PLACEHOLDER: Contact Phone */}
                  <a href="tel:+918655021064" className="hover:text-[var(--color-text-primary)] select-all">+91 86550 21064</a>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[var(--color-text-accent)] shrink-0 mt-0.5" />
                  {/* PLACEHOLDER: Office Address */}
                  <span>Andheri ,Mumbai,India</span>
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

      {/* ─────────────────────────────────────────────────────────────
          8. LIGHTBOX FULL-VIEW SCREENSHOT MODAL
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
            {/* Lightbox Header */}
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

            {/* Lightbox Image Viewport */}
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
