import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import {
  ArrowLeft,
  Loader2,
  FileText,
  Clock,
  Tag,
  AlignLeft,
  BookOpen,
  Plus,
  Sparkles,
  Briefcase,
  ShieldAlert,
  UserPlus,
  Upload,
  FileSpreadsheet,
  User,
  ListFilter,
  Mail,
  Trash2,
  X,
  Users,
  Bot,
  Target,
  Shuffle,
  FileCode,
  AlertCircle,
  Save,
  Edit,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  Check,
} from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader } from "../../ui/primitives/PageHeader";
import { SectionHeader } from "../../ui/primitives/SectionHeader";
import { GlassCard } from "../../ui/primitives/GlassCard";
import { Chip } from "../../ui/primitives/Chip";
import { CandidateInviteForm } from "../../ui/primitives/CandidateInviteForm";

const PRESET_ROLES = [
  "Full Stack Engineer",
  "Frontend Developer",
  "Backend Engineer",
  "Data Scientist",
  "DevOps Engineer",
  "System Architect",
];

const PRESET_TOPICS = [
  "React & Web Fundamentals",
  "Node.js & Express",
  "System Design",
  "Python & Data Structures",
  "SQL & Databases",
  "REST & GraphQL APIs",
];

const updateInterviewSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot exceed 100 characters"),
  jobRole: z
    .string()
    .min(2, "Job role must be at least 2 characters")
    .max(100, "Job role cannot exceed 100 characters"),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
  experienceLevel: z.enum(["Fresher", "1-2 Years", "3-5 Years", "5+ Years"]),
  duration: z.coerce
    .number()
    .min(1, "Duration must be at least 1 minute")
    .max(120, "Duration cannot exceed 120 minutes"),
  instructions: z
    .string()
    .max(1000, "Instructions cannot exceed 1000 characters")
    .optional(),
  requireApproval: z.boolean().default(true),
});

const EditInterviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Form Topics
  const [topics, setTopics] = useState([]);
  const [topicInput, setTopicInput] = useState("");
  const [topicError, setTopicError] = useState("");

  // Existing & New Candidate state
  const [existingCandidates, setExistingCandidates] = useState([]);
  const [newCandidateEmails, setNewCandidateEmails] = useState([]);

  // Question Mode & Custom Questions State
  const [questionMode, setQuestionMode] = useState("AI_GENERATED");
  const [customQuestions, setCustomQuestions] = useState([]);
  const [newQText, setNewQText] = useState("");
  const [newQTopic, setNewQTopic] = useState("");
  const [newQDiff, setNewQDiff] = useState("Medium");
  const [isQuestionImportModalOpen, setIsQuestionImportModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(updateInterviewSchema),
  });

  const selectedRole = watch("jobRole");

  const fetchInterview = async () => {
    try {
      const { data } = await api.get(`/interviews/${id}`);
      if (data.success) {
        const interview = data.interview;
        reset({
          title: interview.title || "",
          jobRole: interview.jobRole || "",
          description: interview.description || "",
          experienceLevel: interview.experienceLevel || "Fresher",
          duration: interview.duration || 30,
          instructions: interview.instructions || "",
          requireApproval:
            interview.requireApproval !== undefined
              ? interview.requireApproval
              : true,
        });
        setTopics(interview.topics || []);
        setQuestionMode(interview.questionMode || "AI_GENERATED");
        setCustomQuestions(interview.customQuestions || []);
        setExistingCandidates(interview.assignedCandidates || []);
      }
    } catch (error) {
      toast.error("Failed to load campaign details");
      navigate("/employer/dashboard");
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchInterview();
  }, [id]);

  // Topic Handlers
  const addTopic = (topicToAdd) => {
    const trimmed = (topicToAdd || topicInput).trim();
    if (trimmed && !topics.includes(trimmed)) {
      setTopics([...topics, trimmed]);
      setTopicError("");
      if (!topicToAdd) setTopicInput("");
    }
  };

  const removeTopic = (topicToRemove) => {
    const updated = topics.filter((t) => t !== topicToRemove);
    setTopics(updated);
    if (updated.length === 0) {
      setTopicError("Add at least one technical topic");
    }
  };

  const handleTopicKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTopic();
    }
  };

  // Custom Questions Handlers
  const addCustomQuestion = () => {
    if (!newQText.trim()) {
      toast.error("Please enter question text.");
      return;
    }
    setCustomQuestions([
      ...customQuestions,
      {
        question: newQText.trim(),
        topic: newQTopic.trim() || "General",
        difficulty: newQDiff,
      },
    ]);
    setNewQText("");
    setNewQTopic("");
    setNewQDiff("Medium");
  };

  const removeCustomQuestion = (index) => {
    setCustomQuestions(customQuestions.filter((_, i) => i !== index));
  };

  const handleQuestionCsvUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      if (!content) return;

      const parsedQuestions = [];

      if (file.name.endsWith(".json")) {
        try {
          const json = JSON.parse(content);
          const list = Array.isArray(json) ? json : json.questions || [];
          list.forEach((item) => {
            if (item.question || typeof item === "string") {
              parsedQuestions.push({
                question: (item.question || item).trim(),
                topic: (item.topic || "General").trim(),
                difficulty: ["Easy", "Medium", "Hard"].includes(item.difficulty)
                  ? item.difficulty
                  : "Medium",
              });
            }
          });
        } catch {
          toast.error("Failed to parse JSON file.");
          return;
        }
      } else {
        const lines = content.split(/\r?\n/);
        lines.forEach((line, index) => {
          const trimmed = line.trim();
          if (!trimmed) return;

          if (
            index === 0 &&
            (trimmed.toLowerCase().includes("question") ||
              trimmed.toLowerCase().includes("topic"))
          ) {
            return;
          }

          const parts = trimmed
            .split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/)
            .map((p) => p.replace(/^"|"$/g, "").trim());

          if (parts[0]) {
            parsedQuestions.push({
              question: parts[0],
              topic: parts[1] || "General",
              difficulty: ["Easy", "Medium", "Hard"].includes(parts[2])
                ? parts[2]
                : "Medium",
            });
          }
        });
      }

      if (parsedQuestions.length === 0) {
        toast.error("No valid questions found in file.");
        return;
      }

      setCustomQuestions((prev) => [...prev, ...parsedQuestions]);
      setIsQuestionImportModalOpen(false);
    };

    reader.readAsText(file);
    e.target.value = "";
  };

  // Candidate Invitation Handlers
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const removeNewCandidate = (emailToRemove) => {
    setNewCandidateEmails(newCandidateEmails.filter((e) => e !== emailToRemove));
  };

  const removeExistingCandidate = async (emailToRemove) => {
    try {
      const { data } = await api.patch(`/interviews/${id}`, {
        removeCandidateEmail: emailToRemove,
      });
      if (data.success) {
        setExistingCandidates((prev) =>
          prev.filter((c) => c.email.toLowerCase() !== emailToRemove.toLowerCase())
        );
        toast.success(`Removed ${emailToRemove} from campaign`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove candidate");
    }
  };

  const clearNewCandidates = () => {
    setNewCandidateEmails([]);
  };

  const onSubmit = async (formData) => {
    if (topics.length === 0) {
      setTopicError("Add at least one technical topic");
      return;
    }

    if (questionMode === "EMPLOYER_PRESET" && customQuestions.length === 0) {
      return toast.error(
        "Employer preset mode requires at least one custom question."
      );
    }

    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        topics,
        questionMode,
        customQuestions,
        candidateEmails: newCandidateEmails,
      };

      const { data } = await api.patch(`/interviews/${id}`, payload);
      if (data.success) {
        toast.success("Campaign updated successfully!");
        navigate("/employer/dashboard");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to update campaign. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses =
    "flex w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/50 focus:outline-none focus:border-[var(--color-border-active,#6338F6)] transition-colors";

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-text-primary)] font-['Inter'] w-full px-4 sm:px-6 md:px-8 xl:px-10 py-6 sm:py-8 space-y-8">
      {/* Top Header Row */}
      <div className="space-y-4">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors text-xs font-medium tracking-tight"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to dashboard
          </button>
        </motion.div>

        <PageHeader
          badgeIcon={Edit}
          badgeText="Campaign Editor"
          title="Edit interview campaign"
          description="Update campaign parameters, technical topics, question strategy, custom questions, and candidate access lists."
        />
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
            e.preventDefault();
          }
        }}
        className="space-y-8"
      >
        {/* ========================================================================= */}
        {/* SECTION 1: CAMPAIGN ESSENTIALS */}
        {/* ========================================================================= */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard padding="p-6 md:p-8" className="space-y-6">
            <SectionHeader
              icon={Briefcase}
              title="Campaign essentials"
              subtitle="Modify target job role, campaign title, and interview parameters."
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left: Basic Details */}
              <div className="lg:col-span-7 space-y-5">
                {/* Preset Roles */}
                <div>
                  <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-2 block">
                    Quick preset roles
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_ROLES.map((role) => (
                      <Chip
                        key={role}
                        label={role}
                        selected={selectedRole === role}
                        onClick={() =>
                          setValue("jobRole", role, { shouldValidate: true })
                        }
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Campaign Title */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
                      <FileText className="w-3.5 h-3.5 text-[var(--color-text-accent,#C4B5FD)]" />
                      Campaign title *
                    </label>
                    <input
                      {...register("title")}
                      placeholder="e.g. Q3 Senior React Developer"
                      className={inputClasses}
                    />
                    {errors.title && (
                      <p className="mt-1.5 text-xs text-[var(--color-danger)] font-medium">
                        • {errors.title.message}
                      </p>
                    )}
                  </div>

                  {/* Job Role */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-[var(--color-text-accent,#C4B5FD)]" />
                      Job role *
                    </label>
                    <input
                      {...register("jobRole")}
                      placeholder="e.g. Frontend Developer"
                      className={inputClasses}
                    />
                    {errors.jobRole && (
                      <p className="mt-1.5 text-xs text-[var(--color-danger)] font-medium">
                        • {errors.jobRole.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
                    <AlignLeft className="w-3.5 h-3.5 text-[var(--color-text-accent,#C4B5FD)]" />
                    Campaign description (optional)
                  </label>
                  <textarea
                    {...register("description")}
                    rows={3}
                    className={`${inputClasses} resize-none`}
                    placeholder="Brief description of this interview campaign..."
                  />
                  {errors.description && (
                    <p className="mt-1.5 text-xs text-[var(--color-danger)] font-medium">
                      • {errors.description.message}
                    </p>
                  )}
                </div>

                {/* Experience & Duration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-[var(--color-text-accent,#C4B5FD)]" />
                      Experience level *
                    </label>
                    <select
                      {...register("experienceLevel")}
                      className={`${inputClasses} cursor-pointer appearance-none`}
                    >
                      <option value="Fresher" className="bg-[var(--color-surface)]">
                        Fresher (Entry level)
                      </option>
                      <option value="1-2 Years" className="bg-[var(--color-surface)]">
                        1-2 Years (Junior)
                      </option>
                      <option value="3-5 Years" className="bg-[var(--color-surface)]">
                        3-5 Years (Mid-level)
                      </option>
                      <option value="5+ Years" className="bg-[var(--color-surface)]">
                        5+ Years (Senior / Lead)
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
                      <Clock className="w-3.5 h-3.5 text-[var(--color-text-accent,#C4B5FD)]" />
                      Duration (minutes) *
                    </label>
                    <input
                      type="number"
                      {...register("duration")}
                      min={1}
                      max={120}
                      className={inputClasses}
                    />
                    {errors.duration && (
                      <p className="mt-1.5 text-xs text-[var(--color-danger)] font-medium">
                        • {errors.duration.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Require Approval Toggle */}
                <div className="flex items-center justify-between p-4 bg-[var(--color-canvas)] border border-[var(--color-border)] rounded-xl">
                  <div>
                    <label className="text-sm font-medium text-[var(--color-text-primary)] flex items-center gap-2 mb-0.5">
                      <ShieldAlert className="w-4 h-4 text-[var(--color-text-accent,#C4B5FD)]" />
                      Require approval to join
                    </label>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      If enabled, candidates joining via code must be manually approved by you before they can start.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4 shrink-0">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      {...register("requireApproval")}
                    />
                    <div className="w-11 h-6 bg-[var(--color-surface)] border border-[var(--color-border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
                  </label>
                </div>
              </div>

              {/* Right: Technical Topics Manager */}
              <div className="lg:col-span-5 space-y-4 p-5 rounded-2xl bg-[var(--color-canvas)] border border-[var(--color-border)]">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-primary)] mb-1">
                    <Tag className="w-3.5 h-3.5 text-[var(--color-text-accent,#C4B5FD)]" />
                    Technical topics * (at least 1 required)
                  </label>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Select from common engineering domains or add custom topics.
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {PRESET_TOPICS.map((preset) => (
                    <Chip
                      key={preset}
                      label={preset}
                      selected={topics.includes(preset)}
                      onClick={() => {
                        if (topics.includes(preset)) removeTopic(preset);
                        else addTopic(preset);
                      }}
                    />
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    onKeyDown={handleTopicKeyDown}
                    placeholder="Add custom topic (e.g. Docker, GraphQL)"
                    className={inputClasses}
                  />
                  <button
                    type="button"
                    onClick={() => addTopic()}
                    className="px-4 py-2 bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] hover:bg-[var(--color-primary-tint,rgba(99,56,246,0.25))] border border-[var(--color-border-active,#6338F6)] rounded-xl text-xs font-medium tracking-tight transition-all flex items-center shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add
                  </button>
                </div>

                {topicError && (
                  <p className="text-xs text-[var(--color-danger)] font-medium">
                    • {topicError}
                  </p>
                )}

                <div className="pt-2 border-t border-[var(--color-border)]">
                  <span className="text-xs font-medium text-[var(--color-text-secondary)] block mb-2">
                    Active topics ({topics.length}):
                  </span>
                  {topics.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {topics.map((topic) => (
                        <Chip
                          key={topic}
                          label={topic}
                          selected
                          onRemove={() => removeTopic(topic)}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[var(--color-text-secondary)]/70 italic">
                      No topics added yet. Add at least one topic above.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* ========================================================================= */}
        {/* SECTION 2: QUESTION STRATEGY & CUSTOM QUESTIONS */}
        {/* ========================================================================= */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <GlassCard padding="p-6 md:p-8" className="space-y-6">
            <SectionHeader
              icon={Target}
              title="Question strategy & custom question bank"
              subtitle="Select question delivery mode: 100% AI generated, employer preset list, or a hybrid flow."
            />

            <div className="space-y-6">
              {/* 3-Way Mode Card Selector */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Mode 1: AI Generated */}
                <div
                  onClick={() => setQuestionMode("AI_GENERATED")}
                  className={`cursor-pointer p-5 rounded-2xl border transition-all relative ${
                    questionMode === "AI_GENERATED"
                      ? "bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] border-[var(--color-border-active,#6338F6)] ring-1 ring-[var(--color-border-active,#6338F6)]"
                      : "bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-border-active,#6338F6)]/50"
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] flex items-center justify-center mb-3 border border-[var(--color-border-active,#6338F6)]/30">
                    <Bot className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-medium text-[var(--color-text-primary)]">
                    AI-adaptive
                  </h4>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1 font-normal leading-relaxed">
                    Gemini AI dynamically generates all questions and adaptive follow-ups tailored to candidate responses.
                  </p>
                  {questionMode === "AI_GENERATED" && (
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-[var(--color-primary)] text-white text-[10px] font-medium">
                      Selected
                    </span>
                  )}
                </div>

                {/* Mode 2: Employer Preset */}
                <div
                  onClick={() => setQuestionMode("EMPLOYER_PRESET")}
                  className={`cursor-pointer p-5 rounded-2xl border transition-all relative ${
                    questionMode === "EMPLOYER_PRESET"
                      ? "bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] border-[var(--color-border-active,#6338F6)] ring-1 ring-[var(--color-border-active,#6338F6)]"
                      : "bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-border-active,#6338F6)]/50"
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] flex items-center justify-center mb-3 border border-[var(--color-border-active,#6338F6)]/30">
                    <Target className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-medium text-[var(--color-text-primary)]">
                    Employer preset
                  </h4>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1 font-normal leading-relaxed">
                    AI asks ONLY your exact pre-defined question bank in fixed order. Zero AI question generation.
                  </p>
                  {questionMode === "EMPLOYER_PRESET" && (
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-[var(--color-primary)] text-white text-[10px] font-medium">
                      Selected
                    </span>
                  )}
                </div>

                {/* Mode 3: Hybrid Campaign */}
                <div
                  onClick={() => setQuestionMode("HYBRID")}
                  className={`cursor-pointer p-5 rounded-2xl border transition-all relative ${
                    questionMode === "HYBRID"
                      ? "bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] border-[var(--color-border-active,#6338F6)] ring-1 ring-[var(--color-border-active,#6338F6)]"
                      : "bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-border-active,#6338F6)]/50"
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] flex items-center justify-center mb-3 border border-[var(--color-border-active,#6338F6)]/30">
                    <Shuffle className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-medium text-[var(--color-text-primary)]">
                    Hybrid campaign
                  </h4>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1 font-normal leading-relaxed">
                    AI asks your custom questions first, then smoothly transitions to adaptive AI follow-ups.
                  </p>
                  {questionMode === "HYBRID" && (
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-[var(--color-primary)] text-white text-[10px] font-medium">
                      Selected
                    </span>
                  )}
                </div>
              </div>

              {/* Custom Question Builder Form */}
              {(questionMode === "EMPLOYER_PRESET" || questionMode === "HYBRID") && (
                <div className="p-6 rounded-2xl bg-[var(--color-canvas)] border border-[var(--color-border)] space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[var(--color-border)] pb-4">
                    <div>
                      <h4 className="text-sm font-medium text-[var(--color-text-primary)] flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-[var(--color-text-accent,#C4B5FD)]" />
                        Custom questions ({customQuestions.length} configured)
                      </h4>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                        Add questions manually or import a batch file.
                      </p>
                    </div>

                    {/* Import CSV / JSON Button */}
                    <button
                      type="button"
                      onClick={() => setIsQuestionImportModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover,#1E1E2A)] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border)] text-xs font-medium tracking-tight transition-all"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Import CSV / JSON</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Add Question Form (Left) */}
                    <div className="lg:col-span-5 space-y-3">
                      <label className="text-xs font-medium text-[var(--color-text-secondary)] block">
                        Question prompt *
                      </label>
                      <textarea
                        value={newQText}
                        onChange={(e) => setNewQText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            addCustomQuestion();
                          }
                        }}
                        placeholder="e.g. Explain how Virtual DOM diffing works in React..."
                        rows={3}
                        className={`${inputClasses} resize-none`}
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-[var(--color-text-secondary)] block mb-1">
                            Topic tag
                          </label>
                          <input
                            type="text"
                            value={newQTopic}
                            onChange={(e) => setNewQTopic(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addCustomQuestion();
                              }
                            }}
                            placeholder="e.g. React"
                            className={inputClasses}
                          />
                        </div>

                        <div>
                          <label className="text-xs font-medium text-[var(--color-text-secondary)] block mb-1">
                            Difficulty
                          </label>
                          <select
                            value={newQDiff}
                            onChange={(e) => setNewQDiff(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addCustomQuestion();
                              }
                            }}
                            className={`${inputClasses} cursor-pointer appearance-none`}
                          >
                            <option value="Easy" className="bg-[var(--color-surface)]">
                              Easy
                            </option>
                            <option value="Medium" className="bg-[var(--color-surface)]">
                              Medium
                            </option>
                            <option value="Hard" className="bg-[var(--color-surface)]">
                              Hard
                            </option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={addCustomQuestion}
                        className="w-full py-2.5 px-4 bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] hover:bg-[var(--color-primary-tint,rgba(99,56,246,0.25))] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)] rounded-xl text-xs font-medium tracking-tight transition-all flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" /> Add to sequence
                      </button>
                    </div>

                    {/* Question Sequence List (Right) */}
                    <div className="lg:col-span-7 space-y-3">
                      <label className="text-xs font-medium text-[var(--color-text-secondary)] block">
                        Configured question sequence ({customQuestions.length}):
                      </label>

                      {customQuestions.length > 0 ? (
                        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                          {customQuestions.map((q, idx) => (
                            <div
                              key={idx}
                              className="p-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-start justify-between gap-3 text-xs"
                            >
                              <div className="space-y-1.5 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded-md bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] font-medium text-[10px]">
                                    Q{idx + 1}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-md bg-[var(--color-canvas)] text-[var(--color-text-secondary)] border border-[var(--color-border)] text-[10px]">
                                    {q.topic}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-md bg-[var(--color-warning)]/10 text-[var(--color-warning)] text-[10px] font-medium">
                                    {q.difficulty}
                                  </span>
                                </div>
                                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                                  {q.question}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeCustomQuestion(idx)}
                                className="p-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 rounded-xl border border-dashed border-[var(--color-border)] text-center text-xs text-[var(--color-text-secondary)]">
                          No custom questions configured yet. Add questions on the left or import a CSV/JSON file.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* ========================================================================= */}
        {/* SECTION 3: CANDIDATE MANAGEMENT & INVITATIONS */}
        {/* ========================================================================= */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <GlassCard padding="p-6 md:p-8" className="space-y-6">
            <SectionHeader
              icon={UserPlus}
              title="Candidate access & invitations"
              subtitle="View currently assigned candidates, invite new candidates using single email, bulk paste, or CSV upload."
            />

            <div className="space-y-6">
              {/* Existing Assigned Candidates */}
              {existingCandidates.length > 0 && (
                <div className="space-y-3 pb-6 border-b border-[var(--color-border)]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[var(--color-text-primary)] flex items-center gap-2">
                      <Users className="w-4 h-4 text-[var(--color-text-accent,#C4B5FD)]" />
                      Currently assigned candidates ({existingCandidates.length})
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-3 rounded-2xl bg-[var(--color-canvas)] border border-[var(--color-border)]">
                    {existingCandidates.map((cand) => (
                      <div
                        key={cand.email}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-primary)]"
                      >
                        <Mail className="w-3.5 h-3.5 text-[var(--color-text-accent,#C4B5FD)] shrink-0" />
                        <span className="font-mono text-xs">{cand.email}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                            cand.status === "Completed"
                              ? "bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/30"
                              : cand.status === "In Progress"
                              ? "bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/30"
                              : "bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border-[var(--color-border-active,#6338F6)]/30"
                          }`}
                        >
                          {cand.status}
                        </span>
                        {cand.status !== "Completed" && cand.status !== "In Progress" && (
                          <button
                            type="button"
                            onClick={() => removeExistingCandidate(cand.email)}
                            className="hover:text-[var(--color-danger)] transition-colors ml-1 p-0.5"
                            title="Remove candidate from campaign"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add New Candidates Box */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Shared Candidate Invite Form */}
                <div className="lg:col-span-6 space-y-4">
                  <CandidateInviteForm
                    onAddCandidates={(newEmails) => {
                      setNewCandidateEmails((prev) => [...prev, ...newEmails]);
                    }}
                    existingEmails={[
                      ...existingCandidates.map((c) => c.email),
                      ...newCandidateEmails,
                    ]}
                  />
                </div>

                {/* Right: Newly Added Candidates List */}
                <div className="lg:col-span-6 space-y-3 p-5 rounded-2xl bg-[var(--color-canvas)] border border-[var(--color-border)] flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                      <span className="text-xs font-medium text-[var(--color-text-primary)] flex items-center gap-1.5">
                        <UserPlus className="w-4 h-4 text-[var(--color-text-accent,#C4B5FD)]" />
                        Newly added candidates to save ({newCandidateEmails.length})
                      </span>
                      {newCandidateEmails.length > 0 && (
                        <button
                          type="button"
                          onClick={clearNewCandidates}
                          className="text-xs font-medium text-[var(--color-danger)] hover:underline transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Clear all
                        </button>
                      )}
                    </div>

                    {newCandidateEmails.length > 0 ? (
                      <div className="flex flex-wrap gap-2 max-h-72 overflow-y-auto p-1">
                        {newCandidateEmails.map((email) => (
                          <span
                            key={email}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-primary)]"
                          >
                            <Mail className="w-3 h-3 text-[var(--color-text-accent,#C4B5FD)] shrink-0" />
                            <span className="font-mono text-xs">{email}</span>
                            <button
                              type="button"
                              onClick={() => removeNewCandidate(email)}
                              className="hover:text-[var(--color-danger)] transition-colors ml-1"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center text-xs text-[var(--color-text-secondary)] space-y-1">
                        <p className="italic">No new candidate invites queued.</p>
                        <p className="text-[11px] text-[var(--color-text-secondary)]/70">
                          Add single, bulk, or CSV emails on the left to assign them upon saving.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-[var(--color-text-accent,#C4B5FD)] shrink-0" />
                    <span>Newly added candidates will be notified once campaign changes are saved.</span>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* ========================================================================= */}
        {/* SECTION 4: AI SYSTEM INSTRUCTIONS */}
        {/* ========================================================================= */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <GlassCard padding="p-6 md:p-8" className="space-y-6">
            <SectionHeader
              icon={Sparkles}
              title="AI system instructions (optional)"
              subtitle="Provide custom prompt focus areas, evaluation priorities, or rubric notes for the AI interviewer engine."
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Guidelines Textarea */}
              <div className="lg:col-span-7 space-y-2">
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                  Custom prompt & evaluation guidelines
                </label>
                <textarea
                  {...register("instructions")}
                  rows={8}
                  className={`${inputClasses} resize-none leading-relaxed`}
                  placeholder="Provide specific guidelines (e.g., 'Focus heavily on React performance optimization, custom hook design, and code readability. Ask 1 follow-up question if candidate answers vaguely...')"
                />
                {errors.instructions && (
                  <p className="mt-1.5 text-xs text-[var(--color-danger)] font-medium">
                    • {errors.instructions.message}
                  </p>
                )}
              </div>

              {/* Suggested Rubric Guidance */}
              <div className="lg:col-span-5 space-y-3 p-5 rounded-2xl bg-[var(--color-canvas)] border border-[var(--color-border)]">
                <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-text-accent,#C4B5FD)] border-b border-[var(--color-border)] pb-2.5">
                  <HelpCircle className="w-4 h-4" />
                  <span>Best practices for AI prompts</span>
                </div>

                <ul className="space-y-2.5 text-xs text-[var(--color-text-secondary)] leading-relaxed">
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-[var(--color-success)] mt-0.5 shrink-0" />
                    <span><strong>State evaluation depth:</strong> Specify whether you prefer conceptual depth or practical code implementation trade-offs.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-[var(--color-success)] mt-0.5 shrink-0" />
                    <span><strong>Follow-up behavior:</strong> Guide the AI on how aggressively to probe incomplete answers.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-[var(--color-success)] mt-0.5 shrink-0" />
                    <span><strong>Default fallback:</strong> If left empty, the engine uses our standard battle-tested hiring rubrics.</span>
                  </li>
                </ul>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* ========================================================================= */}
        {/* SECTION 5: ACTIONS FOOTER */}
        {/* ========================================================================= */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="flex items-center justify-between gap-4 p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-xl text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Cancel & return
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-3.5 rounded-xl text-sm font-medium tracking-tight transition-all flex items-center justify-center min-w-[220px] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white shadow-lg shadow-[var(--color-primary)]/30 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving changes...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save campaign changes
                </>
              )}
            </button>
          </div>
        </motion.div>
      </form>

      {/* QUESTION IMPORT FORMAT GUIDE MODAL */}
      {isQuestionImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-2xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden text-[var(--color-text-primary)]"
          >
            {/* Close Button */}
            <button
              onClick={() => setIsQuestionImportModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-[var(--color-canvas)] hover:bg-[var(--color-canvas)]/80 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all border border-[var(--color-border)]"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] border border-[var(--color-border-active,#6338F6)]/30 text-[var(--color-text-accent,#C4B5FD)]">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-[var(--color-text-primary)]">
                  Import custom question bank
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Ensure your CSV or JSON file follows the required format below before uploading.
                </p>
              </div>
            </div>

            {/* Format Instructions */}
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] border border-[var(--color-border-active,#6338F6)]/20 space-y-1.5">
                <div className="flex items-center gap-2 text-[var(--color-text-accent,#C4B5FD)] font-medium text-xs">
                  <AlertCircle className="w-4 h-4" />
                  <span>File format guidelines</span>
                </div>
                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                  Your CSV or TXT file should contain columns in this exact order: <b>Question Text</b>, <b>Topic</b>, <b>Difficulty</b> (Easy, Medium, Hard). Headers are optional and automatically detected.
                </p>
              </div>

              {/* Code Samples */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[var(--color-text-secondary)] text-xs">
                    Sample CSV file structure:
                  </span>
                </div>
                <pre className="p-4 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] text-[var(--color-text-primary)] font-mono text-xs overflow-x-auto whitespace-pre">
{`Question,Topic,Difficulty
"Explain how Virtual DOM works in React.",React,Easy
"What is the difference between useEffect and useMemo?",React,Medium
"How do you handle distributed locks in Redis?",Backend,Hard`}
                </pre>

                <div className="flex items-center justify-between pt-1">
                  <span className="font-medium text-[var(--color-text-secondary)] text-xs">
                    Sample JSON file structure:
                  </span>
                </div>
                <pre className="p-4 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] text-[var(--color-text-primary)] font-mono text-xs overflow-x-auto whitespace-pre">
{`[
  { "question": "What is debouncing in JS?", "topic": "JavaScript", "difficulty": "Easy" },
  { "question": "Explain REST vs GraphQL.", "topic": "APIs", "difficulty": "Medium" }
]`}
                </pre>
              </div>

              {/* Upload Drop Zone */}
              <div className="p-6 border-2 border-dashed border-[var(--color-border-active,#6338F6)]/40 hover:border-[var(--color-border-active,#6338F6)] rounded-2xl bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] text-center space-y-3 relative transition-all">
                <input
                  type="file"
                  accept=".csv, .txt, .json"
                  onChange={handleQuestionCsvUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary-tint,rgba(99,56,246,0.25))] text-[var(--color-text-accent,#C4B5FD)] flex items-center justify-center mx-auto border border-[var(--color-border-active,#6338F6)]/30">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-medium text-[var(--color-text-primary)]">
                    Click to select CSV / JSON file or drag here
                  </h4>
                  <p className="text-[11px] text-[var(--color-text-secondary)] mt-1">
                    Supports .csv, .txt, and .json question files
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default EditInterviewPage;
