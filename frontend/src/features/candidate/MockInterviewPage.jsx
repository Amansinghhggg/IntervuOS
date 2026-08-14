import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import mockInterviewService from "../../services/mockInterview.service";
import {
  Bot,
  Sparkles,
  Clock,
  Briefcase,
  Layers,
  Award,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Plus,
  X,
  Brain,
  MessageSquare,
  Zap,
  TrendingUp,
  FileText,
  History,
  PlayCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Coins
} from "lucide-react";

// Preset Role Options
const PRESET_ROLES = [
  "Full Stack Engineer",
  "Frontend Developer",
  "Backend Engineer",
  "Data Scientist",
  "DevOps / Cloud Engineer",
  "System Architect",
  "Product Manager"
];

// Preset Topic Options
const PRESET_TOPICS = [
  "React & Web Fundamentals",
  "Node.js & Express",
  "System Design & Scalability",
  "Python & Data Structures",
  "SQL & Database Indexing",
  "REST & GraphQL APIs",
  "Microservices Architecture",
  "Git & CI/CD Pipelines"
];

export default function MockInterviewPage() {
  const { user, checkAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.tab || "create"); // 'create' or 'history'

  // Creation Form State
  const [selectedRole, setSelectedRole] = useState(PRESET_ROLES[0]);
  const [customRole, setCustomRole] = useState("");
  const [selectedTopics, setSelectedTopics] = useState([PRESET_TOPICS[0], PRESET_TOPICS[2]]);
  const [customTopicInput, setCustomTopicInput] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("1-2 Years");
  const [duration, setDuration] = useState(15);
  const [instructions, setInstructions] = useState("");
  const [isLaunching, setIsLaunching] = useState(false);

  // Insufficient Credits Modal State
  const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);
  const [requiredCreditsNeeded, setRequiredCreditsNeeded] = useState(15);

  // History & Pagination State
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [evaluations, setEvaluations] = useState([]);
  const [resumeableMocks, setResumeableMocks] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);

  // Fetch History API (Fetches all candidate mock evaluations for accurate overall metrics)
  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await mockInterviewService.getHistory({ page: 1, limit: 100 });
      if (data.success && Array.isArray(data.evaluations)) {
        setEvaluations(data.evaluations);
        setTotalCount(data.total || data.evaluations.length);
      } else {
        setEvaluations([]);
        setTotalCount(0);
      }
    } catch (err) {
      console.warn("Could not fetch mock evaluation history:", err.message);
      setEvaluations([]);
      setTotalCount(0);
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchResumeable = async () => {
    try {
      const data = await mockInterviewService.getResumeableMocks();
      if (data.success && Array.isArray(data.resumeable)) {
        setResumeableMocks(data.resumeable);
      }
    } catch (err) {
      console.warn("Could not fetch resumeable mocks:", err.message);
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabFromQuery = searchParams.get("tab");
    if (tabFromQuery) {
      setActiveTab(tabFromQuery);
    } else if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.search, location.state]);

  useEffect(() => {
    if (activeTab === "history") {
      fetchHistory();
      fetchResumeable();
    }
  }, [activeTab]);

  // Toggle Topic Selection
  const toggleTopic = (topic) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter((t) => t !== topic));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  // Add Custom Topic
  const handleAddCustomTopic = (e) => {
    e.preventDefault();
    if (customTopicInput.trim() && !selectedTopics.includes(customTopicInput.trim())) {
      setSelectedTopics([...selectedTopics, customTopicInput.trim()]);
      setCustomTopicInput("");
    }
  };

  // Handle Real API Mock Creation Launch
  const handleCreateMockInterview = async () => {
    const roleToUse = selectedRole === "Custom Role" ? customRole : selectedRole;

    if (!roleToUse.trim()) {
      toast.error("Please enter or select a target job role");
      return;
    }

    if (duration < 5 || duration > 30) {
      toast.error("Interview duration must be between 5 and 30 minutes");
      return;
    }

    // Upfront Frontend Credit Check
    const availableCredits = user?.credits?.availableCredits ?? 15;
    if (availableCredits < duration) {
      setRequiredCreditsNeeded(duration);
      setShowInsufficientCreditsModal(true);
      return;
    }

    setIsLaunching(true);
    const toastId = toast.loading("Initializing AI Mock Interview...");

    try {
      const data = await mockInterviewService.createMockInterview({
        jobRole: roleToUse,
        topics: selectedTopics,
        experienceLevel,
        duration,
        instructions,
      });

      if (data.success && data.interview?._id) {
        if (checkAuth) await checkAuth();
        toast.success(`Deducted ${duration} Credits! Launching session...`, { id: toastId });
        navigate(`/candidate/mock-interview/${data.interview._id}/prepare`);
      } else {
        toast.error("Failed to create mock interview", { id: toastId });
      }
    } catch (error) {
      toast.dismiss(toastId);
      if (error.response?.status === 402 || error.response?.data?.code === "INSUFFICIENT_CREDITS") {
        setRequiredCreditsNeeded(duration);
        setShowInsufficientCreditsModal(true);
      } else {
        toast.error(error.response?.data?.message || "Error launching mock interview");
      }
    } finally {
      setIsLaunching(false);
    }
  };

  // Recommendation Badge Color Helper
  const getRecommendationBadge = (recommendation) => {
    switch (recommendation) {
      case "STRONG_HIRE":
        return {
          label: "Strong Hire",
          bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
        };
      case "HIRE":
        return {
          label: "Hire",
          bg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
        };
      case "BORDERLINE":
        return {
          label: "Borderline",
          bg: "bg-amber-500/10 text-amber-400 border-amber-500/30"
        };
      case "NOT_EVALUATED":
        return {
          label: "Not Evaluated",
          bg: "bg-slate-500/10 text-slate-400 border-slate-500/30"
        };
      default:
        return {
          label: "Needs Work",
          bg: "bg-rose-500/10 text-rose-400 border-rose-500/30"
        };
    }
  };

  return (
    <div className="w-full min-h-screen bg-transparent font-['Inter'] pb-24 text-[var(--color-on-surface,#dae2fd)]">
      <div className="w-full max-w-[1440px] mx-auto p-4 md:p-8 space-y-8">

        {/* Top Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] text-xs font-medium mb-2.5">
              <Bot className="w-3.5 h-3.5" /> AI Practice Studio
            </div>
            <h1 className="text-2xl md:text-3xl font-medium tracking-tight text-[var(--text-primary)]">
              Mock Interview Studio
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 font-normal">
              Train with adaptive AI questions, test your role readiness, and view detailed evaluation reports.
            </p>
          </div>

          {/* Tab Switcher Buttons */}
          <div className="flex items-center bg-[var(--card)] p-1 rounded-xl border border-[var(--border)]/70 shrink-0">
            <button
              onClick={() => setActiveTab("create")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${activeTab === "create"
                ? "bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] font-medium"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> Create Mock
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${activeTab === "history"
                ? "bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] font-medium"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
            >
              <History className="w-3.5 h-3.5" /> Past Mocks
            </button>
          </div>
        </motion.div>

        {/* AI Interview Wallet Credit Banner & Information */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl border border-[var(--border)]/70 border-l-2 border-l-[var(--color-border-active,#6338F6)] bg-[var(--card)] relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[var(--primary-tint,rgba(99,56,246,0.15))] flex items-center justify-center text-[var(--color-text-accent,#C4B5FD)] shrink-0">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[var(--color-text-accent,#C4B5FD)]">AI Interview Wallet</span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                    Active Balance
                  </span>
                </div>
                <h4 className="text-lg font-medium tracking-tight text-[var(--text-primary)] flex items-baseline gap-2 mt-0.5">
                  <span>{user?.credits?.availableMinutes ?? user?.credits?.availableCredits ?? 15}</span>
                  <span className="text-xs font-normal text-[var(--text-secondary)]">Available Credits</span>
                </h4>
              </div>
            </div>

            <button
              onClick={() => navigate('/candidate/subscriptions')}
              className="px-4 py-2 rounded-xl bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)]/60 hover:bg-[var(--primary-tint)]/80 text-xs font-medium transition-all duration-150 flex items-center gap-2 shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Top-up Credits</span>
            </button>
          </div>
        </motion.div>

        {/* Tab 1: Create Mock Interview */}
        {activeTab === "create" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Left Column: Interactive Form */}
            <div className="lg:col-span-8 space-y-6">

              {/* Card 1: Target Role */}
              <div className="bg-[var(--card)] border border-[var(--border)]/70 p-6 rounded-2xl">
                <div className="mb-5">
                  <h3 className="text-base font-medium text-[var(--text-primary)]">
                    Target Role
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-normal">
                    Select a role or specify a custom position you are interviewing for.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {PRESET_ROLES.map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        setSelectedRole(role);
                        if (role !== "Custom Role") setCustomRole("");
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-150 border ${selectedRole === role
                        ? "bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border-[var(--primary)]/40"
                        : "bg-[var(--background)] text-[var(--text-secondary)] border-[var(--border)]/60 hover:border-[var(--color-border-active,#6338F6)]/60 hover:text-[var(--text-primary)]"
                        }`}
                    >
                      {role}
                    </button>
                  ))}
                  <button
                    onClick={() => setSelectedRole("Custom Role")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-150 border ${selectedRole === "Custom Role"
                      ? "bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border-[var(--primary)]/40"
                      : "bg-[var(--background)] text-[var(--text-secondary)] border-[var(--border)]/60 hover:border-[var(--color-border-active,#6338F6)]/60 hover:text-[var(--text-primary)]"
                      }`}
                  >
                    + Custom Role
                  </button>
                </div>

                {selectedRole === "Custom Role" && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                    <input
                      type="text"
                      placeholder="e.g. AI Engineer, Mobile Lead, Solutions Architect..."
                      value={customRole}
                      onChange={(e) => setCustomRole(e.target.value)}
                      className="w-full bg-[var(--background)] border border-[var(--border)]/70 px-3.5 py-2.5 rounded-xl text-xs font-medium focus:outline-none focus:border-[var(--color-border-active,#6338F6)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                    />
                  </motion.div>
                )}
              </div>

              {/* Card 2: Key Skills & Topics */}
              <div className="bg-[var(--card)] border border-[var(--border)]/70 p-6 rounded-2xl">
                <div className="mb-5">
                  <h3 className="text-base font-medium text-[var(--text-primary)]">
                    Key Topics & Tech Stack
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-normal">
                    Choose the tech stack topics the AI interviewer will evaluate you on.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 mb-5">
                  {PRESET_TOPICS.map((topic) => {
                    const isSelected = selectedTopics.includes(topic);
                    return (
                      <button
                        key={topic}
                        onClick={() => toggleTopic(topic)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 border flex items-center gap-1.5 ${isSelected
                          ? "bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border-[var(--primary)]/40"
                          : "bg-[var(--background)] text-[var(--text-secondary)] border-[var(--border)]/60 hover:border-[var(--color-border-active,#6338F6)]/60 hover:text-[var(--text-primary)]"
                          }`}
                      >
                        {isSelected ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        {topic}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Topic Tag Creator */}
                <form onSubmit={handleAddCustomTopic} className="flex gap-2.5">
                  <input
                    type="text"
                    placeholder="Add custom topic (e.g. GraphQL, AWS Lambda)..."
                    value={customTopicInput}
                    onChange={(e) => setCustomTopicInput(e.target.value)}
                    className="flex-1 bg-[var(--background)] border border-[var(--border)]/70 px-3.5 py-2 rounded-xl text-xs font-medium focus:outline-none focus:border-[var(--color-border-active,#6338F6)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-[var(--background)] hover:bg-[var(--color-surface-hover,#1E1E2A)] border border-[var(--border)]/70 rounded-xl text-xs font-medium text-[var(--text-primary)] transition-all duration-150"
                  >
                    Add
                  </button>
                </form>
              </div>

              {/* Card 3: Experience Level & Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Experience Level */}
                <div className="bg-[var(--card)] border border-[var(--border)]/70 p-6 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                    <Brain className="w-4 h-4 text-emerald-400" /> Experience Level
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {["Fresher", "1-2 Years", "3-5 Years", "5+ Years"].map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setExperienceLevel(lvl)}
                        className={`py-2 px-3 rounded-xl text-xs font-medium transition-all duration-150 border ${experienceLevel === lvl
                          ? "bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border-[var(--primary)]/40"
                          : "bg-[var(--background)] text-[var(--text-secondary)] border-[var(--border)]/60 hover:border-[var(--color-border-active,#6338F6)]/60"
                          }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div className="bg-[var(--card)] border border-[var(--border)]/70 p-6 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                    <Clock className="w-4 h-4 text-amber-400" /> Interview Duration
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { mins: 5, label: "5 Mins" },
                      { mins: 15, label: "15 Mins" },
                      { mins: 30, label: "30 Mins" }
                    ].map((d) => (
                      <button
                        key={d.mins}
                        onClick={() => {
                          setDuration(d.mins);
                        }}
                        className={`py-2 px-2 rounded-xl text-xs font-medium transition-all duration-150 border ${duration === d.mins
                          ? "bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border-[var(--primary)]/40"
                          : "bg-[var(--background)] text-[var(--text-secondary)] border-[var(--border)]/60 hover:border-[var(--color-border-active,#6338F6)]/60"
                          }`}
                      >
                        {d.label}
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        if (duration === 5 || duration === 15 || duration === 30) setDuration(10);
                      }}
                      className={`py-2 px-2 rounded-xl text-xs font-medium transition-all duration-150 border ${duration !== 5 && duration !== 15 && duration !== 30
                        ? "bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border-[var(--primary)]/40"
                        : "bg-[var(--background)] text-[var(--text-secondary)] border-[var(--border)]/60 hover:border-[var(--color-border-active,#6338F6)]/60"
                        }`}
                    >
                      Custom
                    </button>
                  </div>

                  {duration !== 5 && duration !== 15 && duration !== 30 && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                      <div className="flex items-center gap-3 pt-2">
                        <input
                          type="number"
                          min={5}
                          max={30}
                          value={duration}
                          onChange={(e) => setDuration(Number(e.target.value))}
                          placeholder="Enter minutes (5-30)..."
                          className="w-full bg-[var(--background)] border border-[var(--border)]/70 px-3.5 py-2 rounded-xl text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-border-active,#6338F6)]"
                        />
                        <span className="text-xs font-normal text-[var(--text-secondary)] shrink-0">Minutes (5-30)</span>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Card 4: Custom Instructions */}
              <div className="bg-[var(--card)] border border-[var(--border)]/70 p-6 rounded-2xl space-y-3">
                <label className="text-xs font-medium text-[var(--text-primary)] flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[var(--primary)]" /> Focus / Instructions (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g., Focus heavily on system architecture tradeoffs, React rendering bottlenecks..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full bg-[var(--background)] border border-[var(--border)]/70 p-3.5 rounded-xl text-xs font-normal focus:outline-none focus:border-[var(--color-border-active,#6338F6)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none"
                />
              </div>

            </div>

            {/* Right Column: Summary Card & Launch Action */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-[var(--card)] border border-[var(--border)]/70 p-6 rounded-2xl sticky top-8 space-y-5">
                <div className="space-y-4">
                  <h3 className="text-base font-medium text-[var(--text-primary)] flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[var(--primary)]" /> Interview Summary
                  </h3>

                  <div className="space-y-2.5 pt-2 text-xs border-t border-[var(--border)]/50">
                    <div className="flex justify-between py-1">
                      <span className="text-[var(--text-secondary)] font-normal">Target Role:</span>
                      <span className="font-medium text-[var(--text-primary)]">
                        {selectedRole === "Custom Role" ? customRole || "Custom Position" : selectedRole}
                      </span>
                    </div>

                    <div className="flex justify-between py-1">
                      <span className="text-[var(--text-secondary)] font-normal">Experience:</span>
                      <span className="font-medium text-emerald-400">{experienceLevel}</span>
                    </div>

                    <div className="flex justify-between py-1">
                      <span className="text-[var(--text-secondary)] font-normal">Duration:</span>
                      <span className="font-medium text-amber-400">{duration} Mins</span>
                    </div>

                    <div className="py-1">
                      <span className="text-[var(--text-secondary)] font-normal block mb-1.5">Topics:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedTopics.length > 0 ? (
                          selectedTopics.map((t) => (
                            <span key={t} className="px-2 py-0.5 rounded-md bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[10px] font-medium text-[var(--color-text-accent,#C4B5FD)]">
                              {t}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-[var(--text-secondary)] italic">General Evaluation</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[var(--border)]/50 space-y-2">
                    <button
                      onClick={handleCreateMockInterview}
                      disabled={isLaunching}
                      className="w-full py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] active:scale-[0.98] text-white font-medium text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-50"
                    >
                      {isLaunching ? (
                        <>Setting Up AI Interview...</>
                      ) : (
                        <>
                          <PlayCircle className="w-4 h-4" /> Launch Mock Interview
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-center text-[var(--text-muted)] font-normal">
                      Simulates a live voice AI evaluation.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </motion.div>
        )}

        {/* Tab 2: Evaluation History & Past Results */}
        {activeTab === "history" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Functional Metrics & Visual Performance Chart Bar */}
            {(() => {
              const totalMocksCount = totalCount || evaluations.length || 0;
              const avgScore = evaluations.length > 0
                ? (evaluations.reduce((sum, e) => sum + (Number(e.scores?.overall) || 0), 0) / evaluations.length).toFixed(1)
                : "0.0";

              const evaluatedList = evaluations.filter((e) => e.recommendation !== "NOT_EVALUATED");
              const baseCount = evaluatedList.length || 1;

              const recCounts = evaluatedList.reduce((acc, e) => {
                const rec = e.recommendation || "BORDERLINE";
                if (rec === "STRONG_HIRE") acc.strong++;
                else if (rec === "HIRE") acc.hire++;
                else if (rec === "BORDERLINE") acc.borderline++;
                else acc.needsWork++;
                return acc;
              }, { strong: 0, hire: 0, borderline: 0, needsWork: 0 });

              const strongPct = evaluatedList.length > 0 ? Math.round((recCounts.strong / baseCount) * 100) : 0;
              const hirePct = evaluatedList.length > 0 ? Math.round((recCounts.hire / baseCount) * 100) : 0;
              const borderlinePct = evaluatedList.length > 0 ? Math.round((recCounts.borderline / baseCount) * 100) : 0;
              const needsWorkPct = evaluatedList.length > 0 ? Math.round((recCounts.needsWork / baseCount) * 100) : 0;

              return (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  {/* Metric 1: Completed Mocks */}
                  <div className="lg:col-span-3 bg-[var(--color-surface-container-low)] border border-[var(--color-surface-variant)] p-5 rounded-2xl flex items-center gap-4 shadow-lg">
                    <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-md3)]/20 border border-[var(--color-primary-md3)]/30 flex items-center justify-center text-[var(--color-primary-md3)]">
                      <BarChart3 className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-[var(--color-on-surface)]">{totalMocksCount}</div>
                      <div className="text-[10px] font-black uppercase tracking-wider text-[var(--color-on-surface-variant)]">Completed Mocks</div>
                    </div>
                  </div>

                  {/* Metric 2: Average Overall Score */}
                  <div className="lg:col-span-3 bg-[var(--color-surface-container-low)] border border-[var(--color-surface-variant)] p-5 rounded-2xl flex items-center gap-4 shadow-lg">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-emerald-400">{avgScore} <span className="text-xs text-[var(--color-on-surface-variant)] font-normal">/ 10</span></div>
                      <div className="text-[10px] font-black uppercase tracking-wider text-[var(--color-on-surface-variant)]">Average Score</div>
                    </div>
                  </div>

                  {/* Visual Graph: Recommendation Distribution Bar Chart */}
                  <div className="lg:col-span-6 bg-[var(--color-surface-container-low)] border border-[var(--color-surface-variant)] p-5 rounded-2xl shadow-lg space-y-2.5">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-[var(--color-on-surface-variant)]">
                      <span className="flex items-center gap-1.5 text-[var(--color-on-surface)]"><TrendingUp className="w-3.5 h-3.5 text-[var(--color-secondary)]" /> Performance Breakdown</span>
                      <span>{evaluations.length} Reports</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      {/* Strong Hire Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-emerald-400">
                          <span>Strong Hire</span>
                          <span>{recCounts.strong} ({strongPct}%)</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[var(--color-surface-container-highest)] overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${strongPct}%` }} className="h-full bg-emerald-400 rounded-full" />
                        </div>
                      </div>

                      {/* Hire Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-[var(--color-primary-md3)]">
                          <span>Hire</span>
                          <span>{recCounts.hire} ({hirePct}%)</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[var(--color-surface-container-highest)] overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${hirePct}%` }} className="h-full bg-[var(--color-primary-md3)] rounded-full" />
                        </div>
                      </div>

                      {/* Borderline Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-[var(--color-warning)]">
                          <span>Borderline</span>
                          <span>{recCounts.borderline} ({borderlinePct}%)</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[var(--color-surface-container-highest)] overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${borderlinePct}%` }} className="h-full bg-[var(--color-warning)] rounded-full" />
                        </div>
                      </div>

                      {/* Needs Work Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-rose-400">
                          <span>Needs Work</span>
                          <span>{recCounts.needsWork} ({needsWorkPct}%)</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[var(--color-surface-container-highest)] overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${needsWorkPct}%` }} className="h-full bg-rose-400 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Section: Resume Incomplete Mock Interviews (if any exist) */}
            {resumeableMocks.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-warning)] animate-pulse" />
                  <h2 className="text-lg font-black uppercase tracking-wider text-[var(--color-on-surface)]">
                    Resume Incomplete / Pending Mocks ({resumeableMocks.length})
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resumeableMocks.map((item) => (
                    <div
                      key={item.id}
                      className="bg-[var(--color-surface-container-low)] border border-[var(--color-warning)]/40 hover:border-[var(--color-warning)] transition-all rounded-2xl p-5 shadow-xl space-y-4 relative overflow-hidden"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest bg-[var(--color-warning)]/10 text-[var(--color-warning)] border border-[var(--color-warning)]/20">
                            {item.status || "In Progress"}
                          </span>
                          <h3 className="text-lg font-black uppercase tracking-tight text-[var(--color-on-surface)] mt-2">
                            {item.jobRole || item.title}
                          </h3>
                        </div>
                        <span className="text-[10px] text-[var(--color-on-surface-variant)] font-bold">
                          {new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--color-on-surface-variant)] font-semibold">
                        <span className="flex items-center gap-1">
                          <Brain className="w-3.5 h-3.5 text-[var(--color-tertiary)]" /> {item.experienceLevel}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[var(--color-warning)]" /> {item.duration} Mins
                        </span>
                      </div>

                      {item.topics && item.topics.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.topics.map((t, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-[var(--color-surface-container-high)] text-[9px] font-bold text-[var(--color-secondary)]">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}

                      <button
                        onClick={() => navigate(`/candidate/mock-interview/${item.id}/prepare`)}
                        className="w-full py-2.5 bg-[var(--color-warning)] hover:brightness-110 active:scale-95 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
                      >
                        <PlayCircle className="w-4 h-4" /> Resume Mock Interview
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* List of Evaluation Cards */}
            <div className="space-y-6">
              <h2 className="text-lg font-black uppercase tracking-wider text-[var(--color-on-surface)]">
                Evaluation History & Reports
              </h2>

              {evaluations.length === 0 ? (
                <div className="bg-gradient-to-b from-[var(--color-surface-container-low)] to-[var(--color-surface-container-lowest)] border border-[var(--color-primary-md3)]/30 p-10 md:p-14 rounded-3xl text-center space-y-6 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--color-primary-md3)]/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary-md3)]/20 border border-[var(--color-primary-md3)]/40 flex items-center justify-center text-[var(--color-primary-md3)] mx-auto shadow-inner">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div className="max-w-md mx-auto space-y-2 relative z-10">
                    <h3 className="text-xl font-black uppercase tracking-tight text-[var(--color-on-surface)]">
                      No Mock Evaluations Attempted Yet
                    </h3>
                    <p className="text-xs text-[var(--color-on-surface-variant)] leading-relaxed font-semibold">
                      Boost your interview readiness! Practice live voice AI interviews tailored to your target role, receive instant question-by-question feedback, and land your dream job with confidence.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("create")}
                    className="px-8 py-3.5 bg-[var(--color-primary-md3)] hover:brightness-110 active:scale-95 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-[var(--color-primary-md3)]/30 inline-flex items-center gap-2 transition-all relative z-10"
                  >
                    <PlayCircle className="w-4.5 h-4.5" /> Start Your First Mock Interview
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {evaluations.map((item) => {
                    const badge = getRecommendationBadge(item.recommendation);
                    return (
                      <div
                        key={item.id}
                        className="bg-[var(--color-surface-container-low)] border border-[var(--color-surface-variant)] hover:border-[var(--color-primary-md3)]/40 transition-all rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden group"
                      >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">

                          {/* Role & Date Info */}
                          <div className="space-y-3 flex-1">
                            <div className="flex flex-wrap items-center gap-3">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${badge.bg}`}>
                                {badge.label}
                              </span>
                              <span className="text-xs text-[var(--color-on-surface-variant)] font-bold uppercase tracking-wider">
                                {new Date(item.evaluatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              </span>
                            </div>

                            <h3 className="text-2xl font-black uppercase tracking-tight text-[var(--color-on-surface)]">
                              {item.title}
                            </h3>

                            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-[var(--color-on-surface-variant)]">
                              <span className="flex items-center gap-1.5">
                                <Briefcase className="w-4 h-4 text-[var(--color-primary-md3)]" /> {item.jobRole}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Brain className="w-4 h-4 text-[var(--color-tertiary)]" /> {item.experienceLevel}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-[var(--color-warning)]" /> {item.duration} Mins
                              </span>
                            </div>

                            {/* Topics Covered Chips */}
                            {item.topics && item.topics.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {item.topics.map((t, tIdx) => (
                                  <span key={tIdx} className="px-2.5 py-0.5 rounded-lg bg-[var(--color-surface-container-high)] border border-[var(--color-outline-variant)]/20 text-[10px] font-bold text-[var(--color-secondary)]">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Overall Score Badge / Action */}
                          <div className="flex items-center gap-6 shrink-0 w-full md:w-auto justify-between border-t md:border-t-0 border-[var(--color-outline-variant)]/20 pt-4 md:pt-0">
                            {item.recommendation === "NOT_EVALUATED" ? (
                              <div className="px-4 py-2.5 rounded-xl bg-slate-500/10 border border-slate-500/30 text-slate-400 text-xs font-black uppercase tracking-wider flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-slate-400" />
                                Not Evaluated
                              </div>
                            ) : (
                              <>
                                <div className="text-center">
                                  <div className="text-3xl font-black text-[var(--color-primary-md3)]">
                                    {item.scores?.overall || "0"}
                                    <span className="text-xs text-[var(--color-on-surface-variant)] font-normal"> / 10</span>
                                  </div>
                                  <div className="text-[9px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)]">Overall Score</div>
                                </div>

                                <button
                                  onClick={() => setSelectedEvaluation(item)}
                                  className="px-5 py-3 bg-[var(--color-primary-md3)]/10 hover:bg-[var(--color-primary-md3)] text-[var(--color-primary-md3)] hover:text-white border border-[var(--color-primary-md3)]/30 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all"
                                >
                                  <FileText className="w-4 h-4" /> View Report
                                </button>
                              </>
                            )}
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              )}


            </div>

          </motion.div>
        )}

      </div>

      {/* Detailed Evaluation Report Modal */}
      <AnimatePresence>
        {selectedEvaluation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[var(--color-surface-container-low,#131b2e)] border border-[var(--color-surface-variant,#2d3449)] rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shadow-2xl p-6 md:p-8 space-y-8 relative text-[var(--color-on-surface,#dae2fd)]"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-6 border-b border-[var(--color-outline-variant)]/30">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getRecommendationBadge(selectedEvaluation.recommendation).bg}`}>
                      {getRecommendationBadge(selectedEvaluation.recommendation).label}
                    </span>
                    <span className="text-xs text-[var(--color-on-surface-variant)] font-bold">
                      {new Date(selectedEvaluation.evaluatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black uppercase tracking-tight text-[var(--color-on-surface)]">
                    {selectedEvaluation.title}
                  </h2>
                  <p className="text-xs text-[var(--color-on-surface-variant)] mt-1 font-semibold">
                    {selectedEvaluation.jobRole} • {selectedEvaluation.experienceLevel}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedEvaluation(null)}
                  className="p-2 rounded-xl bg-[var(--color-surface-container-high)] text-[var(--color-on-surface-variant)] hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scores Overview Radar / Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                <div className="bg-[var(--color-surface-container-lowest)] p-4 rounded-2xl border border-[var(--color-outline-variant)]/20">
                  <div className="text-xl font-black text-[var(--color-primary-md3)]">{selectedEvaluation.scores.overall}</div>
                  <div className="text-[9px] font-black uppercase tracking-wider text-[var(--color-on-surface-variant)] mt-1">Overall</div>
                </div>
                <div className="bg-[var(--color-surface-container-lowest)] p-4 rounded-2xl border border-[var(--color-outline-variant)]/20">
                  <div className="text-xl font-black text-[var(--color-secondary)]">{selectedEvaluation.scores.technical}</div>
                  <div className="text-[9px] font-black uppercase tracking-wider text-[var(--color-on-surface-variant)] mt-1">Technical</div>
                </div>
                <div className="bg-[var(--color-surface-container-lowest)] p-4 rounded-2xl border border-[var(--color-outline-variant)]/20">
                  <div className="text-xl font-black text-[var(--color-tertiary)]">{selectedEvaluation.scores.communication}</div>
                  <div className="text-[9px] font-black uppercase tracking-wider text-[var(--color-on-surface-variant)] mt-1">Communication</div>
                </div>
                <div className="bg-[var(--color-surface-container-lowest)] p-4 rounded-2xl border border-[var(--color-outline-variant)]/20">
                  <div className="text-xl font-black text-[var(--color-warning)]">{selectedEvaluation.scores.problemSolving}</div>
                  <div className="text-[9px] font-black uppercase tracking-wider text-[var(--color-on-surface-variant)] mt-1">Problem Solving</div>
                </div>
                <div className="bg-[var(--color-surface-container-lowest)] p-4 rounded-2xl border border-[var(--color-outline-variant)]/20 col-span-2 sm:col-span-1">
                  <div className="text-xl font-black text-indigo-400">{selectedEvaluation.scores.confidence}</div>
                  <div className="text-[9px] font-black uppercase tracking-wider text-[var(--color-on-surface-variant)] mt-1">Confidence</div>
                </div>
              </div>

              {/* Executive AI Reasoning */}
              <div className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/30 p-6 rounded-2xl space-y-2">
                <h4 className="text-xs font-black uppercase tracking-widest text-[var(--color-primary-md3)] flex items-center gap-2">
                  <Brain className="w-4 h-4" /> AI Evaluator Assessment
                </h4>
                <p className="text-xs font-medium leading-relaxed text-[var(--color-on-surface-variant)]">
                  {selectedEvaluation.reasoning}
                </p>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[var(--color-surface-container-lowest)] border border-emerald-500/20 p-6 rounded-2xl space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Key Strengths
                  </h4>
                  <ul className="space-y-2">
                    {(selectedEvaluation?.strengths || []).map((s, idx) => (
                      <li key={idx} className="text-xs text-[var(--color-on-surface-variant)] font-semibold flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[var(--color-surface-container-lowest)] border border-amber-500/20 p-6 rounded-2xl space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-amber-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Areas to Polish
                  </h4>
                  <ul className="space-y-2">
                    {(selectedEvaluation?.weaknesses || []).map((w, idx) => (
                      <li key={idx} className="text-xs text-[var(--color-on-surface-variant)] font-semibold flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Question Breakdown */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-[var(--color-on-surface)]">
                  Question-by-Question AI Analysis
                </h4>

                <div className="space-y-4">
                  {(selectedEvaluation?.questionBreakdown || []).map((q, idx) => (
                    <div key={q.questionId || idx} className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/20 p-5 rounded-2xl space-y-3">
                      <div className="flex justify-between items-start gap-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-secondary)] bg-[var(--color-secondary)]/10 border border-[var(--color-secondary)]/20 px-2.5 py-1 rounded-md">
                          Q{idx + 1} • {q.topic || "General"}
                        </span>
                        <div className="text-xs font-black text-[var(--color-primary-md3)]">
                          Score: {q.scores?.technical || q.score || 0} / 10
                        </div>
                      </div>

                      <p className="text-xs font-bold text-[var(--color-on-surface)]">
                        {q.question}
                      </p>

                      {q.answer && (
                        <div className="bg-[var(--color-surface-container-high)]/30 p-3 rounded-xl text-xs text-[var(--color-on-surface-variant)] italic">
                          "{q.answer}"
                        </div>
                      )}

                      <p className="text-xs font-medium text-emerald-400/90 pt-1">
                        <span className="font-bold uppercase tracking-wider text-[10px] text-[var(--color-on-surface-variant)] block">AI Feedback:</span>
                        {q.feedback}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Insufficient Credits Modal Popup */}
      <AnimatePresence>
        {showInsufficientCreditsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[var(--color-surface-container-low)] border border-amber-500/40 p-6 md:p-8 rounded-3xl shadow-2xl max-w-md w-full relative overflow-hidden text-center space-y-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                <Coins className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-black text-[var(--color-on-surface)] uppercase tracking-tight">
                  Insufficient Practice Credits
                </h3>
                <p className="text-xs text-[var(--color-on-surface-variant)] mt-2">
                  You need <strong className="text-amber-400">{requiredCreditsNeeded} Credits</strong> to start this {duration}-minute session, but your wallet balance is <strong className="text-indigo-400">{user?.credits?.availableCredits ?? 0} Credits</strong>.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-[var(--color-surface-container-lowest)] p-4 rounded-2xl border border-[var(--color-outline-variant)]/30 text-left">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-on-surface-variant)] block">Available</span>
                  <span className="text-lg font-black text-indigo-400">{user?.credits?.availableCredits ?? 0} Credits</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-on-surface-variant)] block">Required</span>
                  <span className="text-lg font-black text-amber-400">{requiredCreditsNeeded} Credits</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowInsufficientCreditsModal(false)}
                  className="w-1/2 py-3 rounded-xl border border-[var(--color-outline-variant)]/40 text-[var(--color-on-surface-variant)] text-xs font-bold uppercase tracking-wider hover:bg-[var(--color-surface-container-high)] transition-all"
                >
                  Cancel
                </button>

                <button
                  onClick={() => {
                    setShowInsufficientCreditsModal(false);
                    navigate("/candidate/subscriptions");
                  }}
                  className="w-1/2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25"
                >
                  <Coins className="w-4 h-4" />
                  <span>Top-up Credits</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
