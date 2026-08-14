import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Check,
  Plus,
  Brain,
  MessageSquare,
  Zap,
  PlayCircle,
  Loader2,
  Coins,
  ShieldCheck,
  ChevronRight,
  AlertTriangle,
  FileText
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

const EXPERIENCE_LEVELS = ["Fresher", "1-2 Years", "3-5 Years", "5+ Years"];

const DURATION_PRESETS = [
  { mins: 5, label: "5 Mins", desc: "Quick Diagnostic" },
  { mins: 15, label: "15 Mins", desc: "Standard Tech" },
  { mins: 30, label: "30 Mins", desc: "Deep Dive" }
];

export default function MockInterviewPage() {
  const { user, checkAuth } = useAuth();
  const navigate = useNavigate();

  // Creation Form State
  const [selectedRole, setSelectedRole] = useState(PRESET_ROLES[0]);
  const [customRole, setCustomRole] = useState("");
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState([PRESET_TOPICS[0], PRESET_TOPICS[2]]);
  const [customTopicInput, setCustomTopicInput] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("1-2 Years");
  const [duration, setDuration] = useState(15);
  const [isCustomDuration, setIsCustomDuration] = useState(false);
  const [instructions, setInstructions] = useState("");
  const [isLaunching, setIsLaunching] = useState(false);

  // Insufficient Credits Modal State
  const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);
  const [requiredCreditsNeeded, setRequiredCreditsNeeded] = useState(15);

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
    const roleToUse = isCustomRole ? customRole : selectedRole;

    if (!roleToUse.trim()) {
      toast.error("Please enter or select a target job role");
      return;
    }

    if (!selectedTopics || selectedTopics.length === 0) {
      toast.error("Please select or add at least one technical topic");
      return;
    }

    if (duration < 5 || duration > 30) {
      toast.error("Interview duration must be between 5 and 30 minutes");
      return;
    }

    // Upfront Frontend Credit Check
    const availableCredits = user?.credits?.availableCredits ?? user?.credits?.availableMinutes ?? 15;
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

  const currentAvailableCredits = user?.credits?.availableCredits ?? user?.credits?.availableMinutes ?? 15;
  const currentRoleName = isCustomRole ? (customRole || "Custom Position") : selectedRole;

  return (
    <div className="w-full min-h-screen bg-[var(--background)] font-['Inter'] pb-20 text-[var(--text-primary)]">
      <div className="w-full px-4 sm:px-6 md:px-8 xl:px-10 py-6 sm:py-8 space-y-6">

        {/* Top Header Bar with Integrated Wallet and Link to Reports */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border)]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] text-[11px] font-medium">
                <Bot className="w-3 h-3" /> Practice Studio
              </span>
              <span className="text-xs text-[var(--text-muted)]">•</span>
              <span className="text-xs text-[var(--text-secondary)] font-normal">Adaptive AI Evaluation</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-medium tracking-tight text-[var(--text-primary)]">
              AI Mock Interview Studio
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">

            {/* Compact Credit Pill */}
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs">
              <Coins className="w-4 h-4 text-[var(--color-text-accent,#C4B5FD)]" />
              <div className="flex items-baseline gap-1">
                <span className="font-medium text-[var(--text-primary)]">{currentAvailableCredits}</span>
                <span className="text-[11px] text-[var(--text-secondary)]">credits</span>
              </div>
              <button
                onClick={() => navigate("/candidate/subscriptions")}
                className="ml-1 text-[11px] font-medium text-[var(--color-text-accent,#C4B5FD)] hover:underline flex items-center gap-0.5"
              >
                Top up <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Studio Creation Console */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left 8 Columns: Structured Form Setup */}
          <div className="lg:col-span-8 space-y-6">

            {/* Section 1: Target Position & Role */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm sm:text-base font-medium text-[var(--text-primary)]">1. Target Job Role</h2>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Select a predefined standard role or specify your exact target job title.
                  </p>
                </div>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[var(--background)] border border-[var(--border)] text-[var(--text-secondary)]">
                  Required
                </span>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {PRESET_ROLES.map((role) => {
                  const isSelected = !isCustomRole && selectedRole === role;
                  return (
                    <button
                      key={role}
                      onClick={() => {
                        setIsCustomRole(false);
                        setSelectedRole(role);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 border ${isSelected
                        ? "bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border-[var(--color-border-active,#6338F6)]"
                        : "bg-[var(--background)] text-[var(--text-secondary)] border-[var(--border)] hover:text-[var(--text-primary)] hover:border-[var(--border)]/80"
                        }`}
                    >
                      {role}
                    </button>
                  );
                })}
                <button
                  onClick={() => setIsCustomRole(true)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 border ${isCustomRole
                    ? "bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border-[var(--color-border-active,#6338F6)]"
                    : "bg-[var(--background)] text-[var(--text-secondary)] border-[var(--border)] hover:text-[var(--text-primary)] hover:border-[var(--border)]/80"
                    }`}
                >
                  + Custom Position
                </button>
              </div>

              {isCustomRole && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="pt-2"
                >
                  <input
                    type="text"
                    placeholder="Enter custom role title (e.g. Lead Platform Engineer, iOS Architect)..."
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    className="w-full bg-[var(--background)] border border-[var(--border)] px-3.5 py-2.5 rounded-xl text-xs font-medium text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-border-active,#6338F6)] transition-colors duration-150"
                    autoFocus
                  />
                </motion.div>
              )}
            </div>

            {/* Section 2: Technical Topics & Skills Focus */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm sm:text-base font-medium text-[var(--text-primary)]">2. Topics & Technical Focus</h2>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Choose at least one key topic for the AI interviewer to probe with scenario and code questions.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {selectedTopics.length === 0 ? (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
                      Required (Min 1)
                    </span>
                  ) : (
                    <span className="text-[11px] text-[var(--text-secondary)]">
                      {selectedTopics.length} selected
                    </span>
                  )}
                </div>
              </div>

              {selectedTopics.length === 0 && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Please select at least one preset topic or add a custom skill below.</span>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-1">
                {PRESET_TOPICS.map((topic) => {
                  const isSelected = selectedTopics.includes(topic);
                  return (
                    <button
                      key={topic}
                      onClick={() => toggleTopic(topic)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 border flex items-center gap-1.5 ${isSelected
                        ? "bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border-[var(--color-border-active,#6338F6)]"
                        : "bg-[var(--background)] text-[var(--text-secondary)] border-[var(--border)] hover:text-[var(--text-primary)] hover:border-[var(--border)]/80"
                        }`}
                    >
                      {isSelected ? (
                        <Check className="w-3 h-3 text-[var(--color-text-accent,#C4B5FD)]" />
                      ) : (
                        <Plus className="w-3 h-3 text-[var(--text-muted)]" />
                      )}
                      <span>{topic}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Topic Input */}
              <form onSubmit={handleAddCustomTopic} className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Add custom topic (e.g. Next.js App Router, Kafka, Terraform)..."
                  value={customTopicInput}
                  onChange={(e) => setCustomTopicInput(e.target.value)}
                  className="flex-1 bg-[var(--background)] border border-[var(--border)] px-3.5 py-2 rounded-xl text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-border-active,#6338F6)] transition-colors duration-150"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-[var(--background)] hover:bg-[var(--surface-hover,#1E1E2A)] border border-[var(--border)] rounded-xl text-xs font-medium text-[var(--text-primary)] transition-colors duration-150"
                >
                  Add Topic
                </button>
              </form>
            </div>

            {/* Section 3: Level & Session Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Experience Level */}
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 sm:p-6 space-y-3">
                <div>
                  <h2 className="text-sm sm:text-base font-medium text-[var(--text-primary)]">3. Experience Level</h2>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Sets question difficulty & depth.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {EXPERIENCE_LEVELS.map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setExperienceLevel(lvl)}
                      className={`py-2 px-3 rounded-xl text-xs font-medium transition-all duration-150 border text-center ${experienceLevel === lvl
                        ? "bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border-[var(--color-border-active,#6338F6)]"
                        : "bg-[var(--background)] text-[var(--text-secondary)] border-[var(--border)] hover:text-[var(--text-primary)]"
                        }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Session Duration */}
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 sm:p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm sm:text-base font-medium text-[var(--text-primary)]">4. Duration & Pace</h2>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                      {duration} mins = {duration} credits.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  {DURATION_PRESETS.map((d) => (
                    <button
                      key={d.mins}
                      onClick={() => {
                        setIsCustomDuration(false);
                        setDuration(d.mins);
                      }}
                      className={`py-2 px-2 rounded-xl text-xs font-medium transition-all duration-150 border text-center ${!isCustomDuration && duration === d.mins
                        ? "bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border-[var(--color-border-active,#6338F6)]"
                        : "bg-[var(--background)] text-[var(--text-secondary)] border-[var(--border)] hover:text-[var(--text-primary)]"
                        }`}
                    >
                      <div>{d.label}</div>
                      <div className="text-[10px] text-[var(--text-muted)] font-normal">{d.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 4: Specific Interviewer Focus / Custom Prompt */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 sm:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm sm:text-base font-medium text-[var(--text-primary)]">5. Custom Directives & Focus (Optional)</h2>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Guide the AI evaluator to focus on specific frameworks, architectural patterns, or behavioral aspects.
                  </p>
                </div>
              </div>

              <textarea
                rows={2}
                placeholder="e.g., Focus heavily on asynchronous bottlenecks, concurrency tradeoffs in distributed databases, and clean code principles..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full bg-[var(--background)] border border-[var(--border)] p-3.5 rounded-xl text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-border-active,#6338F6)] transition-colors duration-150 resize-none font-normal"
              />
            </div>

          </div>

          {/* Right 4 Columns: Sticky Summary & Primary Launch Console */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 sm:p-6 sticky top-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <h3 className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[var(--primary)]" /> Session Overview
                </h3>
                <span className="text-[11px] font-medium text-emerald-400">Ready</span>
              </div>

              {/* Key Attributes */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-1">
                  <span className="text-[var(--text-secondary)] font-normal">Position:</span>
                  <span className="font-medium text-[var(--text-primary)] truncate max-w-[180px]">{currentRoleName}</span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-[var(--text-secondary)] font-normal">Level:</span>
                  <span className="font-medium text-[var(--text-primary)]">{experienceLevel}</span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-[var(--text-secondary)] font-normal">Duration:</span>
                  <span className="font-medium text-[var(--text-primary)]">{duration} Minutes</span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-[var(--text-secondary)] font-normal">Credit Cost:</span>
                  <span className="font-medium text-[var(--color-text-accent,#C4B5FD)]">{duration} Credits</span>
                </div>

                <div className="pt-2 border-t border-[var(--border)]">
                  <span className="text-[11px] text-[var(--text-secondary)] font-normal block mb-1.5">Focus Areas:</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedTopics.length > 0 ? (
                      selectedTopics.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-md bg-[var(--background)] border border-[var(--border)] text-[10px] text-[var(--text-secondary)]"
                        >
                          {t}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-amber-400 font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Min 1 topic required
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Single Primary Action Button */}
              <div className="pt-2 space-y-2.5">
                <button
                  onClick={handleCreateMockInterview}
                  disabled={isLaunching || selectedTopics.length === 0 || (isCustomRole && !customRole.trim())}
                  className="w-full py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] active:scale-[0.99] text-white font-medium text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLaunching ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Initializing Session...</span>
                    </>
                  ) : (
                    <>
                      <PlayCircle className="w-4 h-4" />
                      <span>Launch Mock Interview</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-[var(--text-secondary)]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Real-time voice synthesis & STAR feedback</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* Insufficient Credits Modal Popup */}
      <AnimatePresence>
        {showInsufficientCreditsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              className="bg-[var(--card)] border border-amber-500/30 p-6 rounded-2xl max-w-sm w-full relative text-center space-y-4"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
                <Coins className="w-5 h-5" />
              </div>

              <div>
                <h3 className="text-base font-medium text-[var(--text-primary)]">
                  Insufficient Practice Credits
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1 font-normal">
                  You need <strong className="text-amber-400">{requiredCreditsNeeded} Credits</strong> for this session, but have <strong className="text-[var(--color-text-accent,#C4B5FD)]">{currentAvailableCredits} Credits</strong>.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 bg-[var(--background)] p-3 rounded-xl border border-[var(--border)] text-left">
                <div>
                  <span className="text-[10px] text-[var(--text-secondary)] block">Available</span>
                  <span className="text-sm font-medium text-[var(--color-text-accent,#C4B5FD)]">{currentAvailableCredits} Credits</span>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--text-secondary)] block">Required</span>
                  <span className="text-sm font-medium text-amber-400">{requiredCreditsNeeded} Credits</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setShowInsufficientCreditsModal(false)}
                  className="w-1/2 py-2 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] text-xs font-medium hover:bg-[var(--surface-hover,#1E1E2A)] transition-colors duration-150"
                >
                  Cancel
                </button>

                <button
                  onClick={() => {
                    setShowInsufficientCreditsModal(false);
                    navigate("/candidate/subscriptions");
                  }}
                  className="w-1/2 py-2 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium text-xs transition-colors duration-150 flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>Top-up</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
