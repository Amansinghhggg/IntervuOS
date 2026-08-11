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
  Clock3,
} from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader } from "../../ui/primitives/PageHeader";
import { SectionHeader } from "../../ui/primitives/SectionHeader";
import { GlassCard } from "../../ui/primitives/GlassCard";
import { Chip } from "../../ui/primitives/Chip";

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

  // Existing & New Candidate state
  const [existingCandidates, setExistingCandidates] = useState([]);
  const [newCandidateEmails, setNewCandidateEmails] = useState([]);
  const [candidateMode, setCandidateMode] = useState("single"); // 'single' | 'bulk' | 'csv'
  const [singleEmailInput, setSingleEmailInput] = useState("");
  const [bulkEmailInput, setBulkEmailInput] = useState("");
  const [csvFileName, setCsvFileName] = useState("");

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
          requireApproval: interview.requireApproval !== undefined ? interview.requireApproval : true,
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
      if (!topicToAdd) setTopicInput("");
    }
  };

  const removeTopic = (topicToRemove) => {
    setTopics(topics.filter((t) => t !== topicToRemove));
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
    toast.success("Question added to campaign!");
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
                difficulty: ["Easy", "Medium", "Hard"].includes(item.difficulty) ? item.difficulty : "Medium",
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

          if (index === 0 && (trimmed.toLowerCase().includes("question") || trimmed.toLowerCase().includes("topic"))) {
            return;
          }

          const parts = trimmed.split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/).map((p) => p.replace(/^"|"$/g, "").trim());

          if (parts[0]) {
            parsedQuestions.push({
              question: parts[0],
              topic: parts[1] || "General",
              difficulty: ["Easy", "Medium", "Hard"].includes(parts[2]) ? parts[2] : "Medium",
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
      toast.success(`Successfully imported ${parsedQuestions.length} custom question(s) from ${file.name}`);
    };

    reader.readAsText(file);
    e.target.value = "";
  };

  // Candidate Invitation Handlers
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const addSingleCandidate = () => {
    const trimmed = singleEmailInput.trim().toLowerCase();
    if (!trimmed) return;
    if (!isValidEmail(trimmed)) {
      return toast.error("Please enter a valid candidate email address.");
    }
    const alreadyAssigned = existingCandidates.some((c) => c.email.toLowerCase() === trimmed);
    if (alreadyAssigned || newCandidateEmails.includes(trimmed)) {
      return toast.error("This candidate email is already assigned or added.");
    }
    setNewCandidateEmails([...newCandidateEmails, trimmed]);
    setSingleEmailInput("");
    toast.success(`Added ${trimmed}`);
  };

  const addBulkCandidates = () => {
    const matches = bulkEmailInput.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
    if (matches.length === 0) {
      return toast.error("No valid email addresses found in the text.");
    }
    const existingEmailSet = new Set(existingCandidates.map((c) => c.email.toLowerCase()));
    const newEmails = [];
    matches.forEach((m) => {
      const email = m.toLowerCase();
      if (!existingEmailSet.has(email) && !newCandidateEmails.includes(email) && !newEmails.includes(email)) {
        newEmails.push(email);
      }
    });

    if (newEmails.length === 0) {
      return toast.error("All found emails are already assigned or added.");
    }

    setNewCandidateEmails([...newCandidateEmails, ...newEmails]);
    setBulkEmailInput("");
    toast.success(`Added ${newEmails.length} unique candidate email(s).`);
  };

  const handleCsvUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result || "";
      const matches = content.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
      if (matches.length === 0) {
        toast.error("No valid email addresses found in file.");
        return;
      }
      const existingEmailSet = new Set(existingCandidates.map((c) => c.email.toLowerCase()));
      const newEmails = [];
      matches.forEach((m) => {
        const email = m.toLowerCase();
        if (!existingEmailSet.has(email) && !newCandidateEmails.includes(email) && !newEmails.includes(email)) {
          newEmails.push(email);
        }
      });

      if (newEmails.length === 0) {
        toast.error("All emails in the file are already assigned or in your candidate list.");
        return;
      }

      setNewCandidateEmails((prev) => [...prev, ...newEmails]);
      toast.success(`Extracted & added ${newEmails.length} candidate email(s) from ${file.name}`);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const removeExistingCandidate = async (emailToRemove) => {
    try {
      const { data } = await api.patch(`/interviews/${id}`, {
        removeCandidateEmail: emailToRemove,
      });
      if (data.success) {
        setExistingCandidates((prev) => prev.filter((c) => c.email.toLowerCase() !== emailToRemove.toLowerCase()));
        toast.success(`Removed ${emailToRemove} from campaign`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove candidate");
    }
  };

  const removeNewCandidate = (emailToRemove) => {
    setNewCandidateEmails(newCandidateEmails.filter((e) => e !== emailToRemove));
  };

  const clearNewCandidates = () => {
    setNewCandidateEmails([]);
    setCsvFileName("");
  };

  const onSubmit = async (formData) => {
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
    "flex w-full rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-highest)]/30 px-4 py-3 text-sm font-bold text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-variant)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-md3)]/50 focus:border-[var(--color-primary-md3)] transition-all duration-300";

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary-md3)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pt-6 pb-24 font-['Inter'] text-[var(--color-on-surface,#dae2fd)]">
      <div className="max-w-[900px] mx-auto px-4 md:px-6 space-y-8">
        {/* Back Link */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary-md3)] transition-colors text-xs font-black uppercase tracking-widest"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </motion.div>

        {/* Page Header */}
        <PageHeader
          badgeIcon={Edit}
          badgeText="Campaign Editor"
          title="Edit Interview Campaign"
          description="Update campaign parameters, technical topics, question strategy, custom questions, and candidate access lists."
        />

        {/* Account Verification Warning Banner */}
        {!user?.isVerified && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg"
          >
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-black uppercase tracking-wider text-amber-300">
                  Account Verification Required
                </h4>
                <p className="text-xs text-amber-200/80 mt-1 font-medium leading-relaxed">
                  Your employer account is currently unverified. Updates can be saved, but publishing requires admin verification.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate("/employer/verification-pending")}
              className="px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-wider rounded-xl border border-amber-500/40 transition-all shrink-0 whitespace-nowrap"
            >
              Check Status & Support
            </button>
          </motion.div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Campaign Essentials */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <GlassCard padding="p-6 md:p-8" glowEffect>
              <SectionHeader
                icon={Briefcase}
                title="Campaign Essentials"
                subtitle="Modify campaign title, target job role, and overview details."
              />

              <div className="space-y-6">
                {/* Preset Role Quick Select */}
                <div>
                  <label className="text-[11px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-2 block">
                    Quick Preset Roles
                  </label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {PRESET_ROLES.map((role) => (
                      <Chip
                        key={role}
                        label={role}
                        selected={selectedRole === role}
                        onClick={() => setValue("jobRole", role, { shouldValidate: true })}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--color-on-surface)] mb-2">
                      <FileText className="w-3.5 h-3.5 text-[var(--color-primary-md3)]" />
                      Campaign Title
                    </label>
                    <input
                      {...register("title")}
                      placeholder="e.g., Q3 Senior React Developer"
                      className={inputClasses}
                    />
                    {errors.title && (
                      <p className="mt-2 text-xs font-bold text-rose-400">
                        • {errors.title.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--color-on-surface)] mb-2">
                      <Briefcase className="w-3.5 h-3.5 text-[var(--color-primary-md3)]" />
                      Job Role
                    </label>
                    <input
                      {...register("jobRole")}
                      placeholder="e.g., Frontend Developer"
                      className={inputClasses}
                    />
                    {errors.jobRole && (
                      <p className="mt-2 text-xs font-bold text-rose-400">
                        • {errors.jobRole.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--color-on-surface)] mb-2">
                    <AlignLeft className="w-3.5 h-3.5 text-[var(--color-primary-md3)]" />
                    Description <span className="text-[var(--color-on-surface-variant)]/50">(optional)</span>
                  </label>
                  <textarea
                    {...register("description")}
                    rows={3}
                    className={`${inputClasses} resize-none`}
                    placeholder="Brief description of this interview campaign..."
                  />
                  {errors.description && (
                    <p className="mt-2 text-xs font-bold text-rose-400">
                      • {errors.description.message}
                    </p>
                  )}
                </div>

                {/* Technical Topics Section */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--color-on-surface)] mb-2">
                    <Tag className="w-3.5 h-3.5 text-[var(--color-primary-md3)]" />
                    Technical Topics
                  </label>

                  <div className="flex flex-wrap gap-2 mb-3">
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

                  <div className="flex gap-3 mb-3">
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
                      className="px-5 py-2.5 bg-[var(--color-primary-md3)]/15 text-[var(--color-primary-md3)] hover:bg-[var(--color-primary-md3)] hover:text-white border border-[var(--color-primary-md3)]/25 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center shrink-0"
                    >
                      <Plus className="w-4 h-4 mr-1.5" /> Add
                    </button>
                  </div>

                  {topics.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {topics.map((topic) => (
                        <Chip
                          key={topic}
                          label={topic}
                          selected
                          onRemove={() => removeTopic(topic)}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--color-on-surface)] mb-2">
                      <BookOpen className="w-3.5 h-3.5 text-[var(--color-primary-md3)]" />
                      Experience Level
                    </label>
                    <select
                      {...register("experienceLevel")}
                      className={`${inputClasses} cursor-pointer appearance-none`}
                    >
                      <option value="Fresher" className="bg-[var(--color-surface-container-low)]">Fresher</option>
                      <option value="1-2 Years" className="bg-[var(--color-surface-container-low)]">1-2 Years</option>
                      <option value="3-5 Years" className="bg-[var(--color-surface-container-low)]">3-5 Years</option>
                      <option value="5+ Years" className="bg-[var(--color-surface-container-low)]">5+ Years</option>
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--color-on-surface)] mb-2">
                      <Clock className="w-3.5 h-3.5 text-[var(--color-primary-md3)]" />
                      Duration (Minutes)
                    </label>
                    <input
                      type="number"
                      {...register("duration")}
                      min={1}
                      max={120}
                      className={inputClasses}
                    />
                    {errors.duration && (
                      <p className="mt-2 text-xs font-bold text-rose-400">
                        • {errors.duration.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Require Approval Toggle */}
                <div className="flex items-center justify-between p-4 bg-[var(--color-surface-container-highest)]/20 border border-[var(--color-outline-variant)]/30 rounded-xl">
                  <div>
                    <label className="text-sm font-bold text-[var(--color-on-surface)] flex items-center gap-2 mb-1">
                      <ShieldAlert className="w-4 h-4 text-[var(--color-primary-md3)]" />
                      Require Approval to Join
                    </label>
                    <p className="text-[11px] text-[var(--color-on-surface-variant)]">
                      If enabled, candidates joining via code must be manually approved by you before they can start.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4 shrink-0">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      {...register("requireApproval")}
                    />
                    <div className="w-11 h-6 bg-[var(--color-surface-variant)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary-md3)] shadow-inner"></div>
                  </label>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Question Strategy & Custom Question Bank Section */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.11 }}>
            <GlassCard padding="p-6 md:p-8">
              <SectionHeader
                icon={Target}
                title="Question Strategy & Custom Question Bank"
                subtitle="Select how questions will be delivered: 100% AI generated, Employer preset list, or a Hybrid campaign."
              />

              <div className="space-y-6">
                {/* 3-Way Mode Card Selector */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Mode 1: AI Generated */}
                  <div
                    onClick={() => setQuestionMode("AI_GENERATED")}
                    className={`cursor-pointer p-5 rounded-2xl border transition-all duration-300 relative ${
                      questionMode === "AI_GENERATED"
                        ? "bg-[var(--color-primary-md3)]/15 border-[var(--color-primary-md3)] shadow-lg shadow-[var(--color-primary-md3)]/20 ring-2 ring-[var(--color-primary-md3)]"
                        : "bg-[var(--color-surface-container-highest)]/30 border-[var(--color-outline-variant)]/30 hover:border-[var(--color-primary-md3)]/50"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3">
                      <Bot className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-extrabold text-[var(--color-on-surface)]">AI-Adaptive</h4>
                    <p className="text-xs text-[var(--color-on-surface-variant)] mt-1 font-medium">
                      Gemini AI dynamically generates all questions and adaptive follow-ups based on candidate responses.
                    </p>
                    {questionMode === "AI_GENERATED" && (
                      <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-[var(--color-primary-md3)] text-white text-[10px] font-black uppercase">
                        Selected
                      </span>
                    )}
                  </div>

                  {/* Mode 2: Employer Preset */}
                  <div
                    onClick={() => setQuestionMode("EMPLOYER_PRESET")}
                    className={`cursor-pointer p-5 rounded-2xl border transition-all duration-300 relative ${
                      questionMode === "EMPLOYER_PRESET"
                        ? "bg-[var(--color-primary-md3)]/15 border-[var(--color-primary-md3)] shadow-lg shadow-[var(--color-primary-md3)]/20 ring-2 ring-[var(--color-primary-md3)]"
                        : "bg-[var(--color-surface-container-highest)]/30 border-[var(--color-outline-variant)]/30 hover:border-[var(--color-primary-md3)]/50"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
                      <Target className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-extrabold text-[var(--color-on-surface)]">Employer Preset</h4>
                    <p className="text-xs text-[var(--color-on-surface-variant)] mt-1 font-medium">
                      AI asks ONLY your exact pre-defined question bank in fixed order. Zero AI question generation.
                    </p>
                    {questionMode === "EMPLOYER_PRESET" && (
                      <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-[var(--color-primary-md3)] text-white text-[10px] font-black uppercase">
                        Selected
                      </span>
                    )}
                  </div>

                  {/* Mode 3: Hybrid Campaign */}
                  <div
                    onClick={() => setQuestionMode("HYBRID")}
                    className={`cursor-pointer p-5 rounded-2xl border transition-all duration-300 relative ${
                      questionMode === "HYBRID"
                        ? "bg-[var(--color-primary-md3)]/15 border-[var(--color-primary-md3)] shadow-lg shadow-[var(--color-primary-md3)]/20 ring-2 ring-[var(--color-primary-md3)]"
                        : "bg-[var(--color-surface-container-highest)]/30 border-[var(--color-outline-variant)]/30 hover:border-[var(--color-primary-md3)]/50"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                      <Shuffle className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-extrabold text-[var(--color-on-surface)]">Hybrid Campaign</h4>
                    <p className="text-xs text-[var(--color-on-surface-variant)] mt-1 font-medium">
                      AI asks your custom questions first, then smoothly transitions to adaptive AI follow-ups.
                    </p>
                    {questionMode === "HYBRID" && (
                      <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-[var(--color-primary-md3)] text-white text-[10px] font-black uppercase">
                        Selected
                      </span>
                    )}
                  </div>
                </div>

                {/* Custom Question Builder Form (Shown for EMPLOYER_PRESET & HYBRID modes) */}
                {(questionMode === "EMPLOYER_PRESET" || questionMode === "HYBRID") && (
                  <div className="p-5 rounded-2xl bg-[var(--color-surface-container-highest)]/30 border border-[var(--color-outline-variant)]/30 space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-[var(--color-on-surface)] flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-[var(--color-primary-md3)]" />
                        Custom Question Bank ({customQuestions.length} questions)
                      </h4>

                      {/* CSV / JSON File Import Trigger Button */}
                      <button
                        type="button"
                        onClick={() => setIsQuestionImportModalOpen(true)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-primary-md3)]/15 hover:bg-[var(--color-primary-md3)]/25 text-[var(--color-primary-md3)] border border-[var(--color-primary-md3)]/30 text-[11px] font-black uppercase tracking-wider transition-all"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>Import CSV / JSON</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      <textarea
                        value={newQText}
                        onChange={(e) => setNewQText(e.target.value)}
                        placeholder="Enter question text (e.g. Explain how Virtual DOM diffing works in React)..."
                        rows={2}
                        className={`${inputClasses} resize-none`}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <input
                            type="text"
                            value={newQTopic}
                            onChange={(e) => setNewQTopic(e.target.value)}
                            placeholder="Topic (e.g. React)"
                            className={inputClasses}
                          />
                        </div>
                        <div>
                          <select
                            value={newQDiff}
                            onChange={(e) => setNewQDiff(e.target.value)}
                            className={`${inputClasses} cursor-pointer appearance-none`}
                          >
                            <option value="Easy" className="bg-[var(--color-surface-container-low)]">Easy</option>
                            <option value="Medium" className="bg-[var(--color-surface-container-low)]">Medium</option>
                            <option value="Hard" className="bg-[var(--color-surface-container-low)]">Hard</option>
                          </select>
                        </div>
                        <div>
                          <button
                            type="button"
                            onClick={addCustomQuestion}
                            className="w-full h-full py-2.5 px-4 bg-[var(--color-primary-md3)] text-white hover:bg-[var(--color-primary-md3)]/90 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md shadow-[var(--color-primary-md3)]/20"
                          >
                            <Plus className="w-4 h-4" /> Add Question
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Added Custom Questions List */}
                    {customQuestions.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-[var(--color-outline-variant)]/20">
                        <span className="text-[11px] font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider block">
                          Configured Question Sequence:
                        </span>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                          {customQuestions.map((q, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start justify-between gap-3 text-xs"
                            >
                              <div className="space-y-1 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-bold text-[10px]">
                                    Q{idx + 1}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-semibold text-[10px]">
                                    {q.topic}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                                    {q.difficulty}
                                  </span>
                                </div>
                                <p className="font-semibold text-slate-100">{q.question}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeCustomQuestion(idx)}
                                className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>

          {/* Candidate Management & Invitations Section */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }}>
            <GlassCard padding="p-6 md:p-8">
              <SectionHeader
                icon={UserPlus}
                title="Assigned Candidates & Invitations"
                subtitle="View existing candidates, invite new candidates using Single Email, Bulk Paste, or CSV Upload."
              />

              <div className="space-y-6">
                {/* Currently Assigned Candidates List */}
                {existingCandidates.length > 0 && (
                  <div className="space-y-3 pb-4 border-b border-[var(--color-outline-variant)]/20">
                    <span className="text-[11px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-[var(--color-primary-md3)]" />
                      Currently Assigned Candidates ({existingCandidates.length})
                    </span>

                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2.5 rounded-xl bg-[var(--color-surface-container-highest)]/20 border border-[var(--color-outline-variant)]/20">
                      {existingCandidates.map((cand) => (
                        <div
                          key={cand.email}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-surface-variant)]/60 border border-[var(--color-outline-variant)]/30 text-xs font-semibold text-[var(--color-on-surface)]"
                        >
                          <Mail className="w-3.5 h-3.5 text-[var(--color-primary-md3)] shrink-0" />
                          <span>{cand.email}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              cand.status === "Completed"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : cand.status === "In Progress"
                                ? "bg-amber-500/20 text-amber-300"
                                : "bg-indigo-500/20 text-indigo-300"
                            }`}
                          >
                            {cand.status}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeExistingCandidate(cand.email)}
                            className="hover:text-rose-400 transition-colors ml-1 p-0.5"
                            title="Remove candidate"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Entry Mode Selector Tabs for NEW candidates */}
                <div className="space-y-3">
                  <span className="text-[11px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] block">
                    Invite New Candidates
                  </span>

                  <div className="flex flex-wrap gap-2 p-1.5 rounded-xl bg-[var(--color-surface-container-highest)]/40 border border-[var(--color-outline-variant)]/30">
                    <button
                      type="button"
                      onClick={() => setCandidateMode("single")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                        candidateMode === "single"
                          ? "bg-[var(--color-primary-md3)] text-white shadow-md shadow-[var(--color-primary-md3)]/20"
                          : "text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]"
                      }`}
                    >
                      <User className="w-3.5 h-3.5" /> Single Candidate
                    </button>
                    <button
                      type="button"
                      onClick={() => setCandidateMode("bulk")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                        candidateMode === "bulk"
                          ? "bg-[var(--color-primary-md3)] text-white shadow-md shadow-[var(--color-primary-md3)]/20"
                          : "text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]"
                      }`}
                    >
                      <ListFilter className="w-3.5 h-3.5" /> Multiple / Bulk
                    </button>
                    <button
                      type="button"
                      onClick={() => setCandidateMode("csv")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                        candidateMode === "csv"
                          ? "bg-[var(--color-primary-md3)] text-white shadow-md shadow-[var(--color-primary-md3)]/20"
                          : "text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]"
                      }`}
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" /> CSV / TXT Upload
                    </button>
                  </div>

                  {/* Mode 1: Single Email */}
                  {candidateMode === "single" && (
                    <div className="flex gap-3">
                      <input
                        type="email"
                        value={singleEmailInput}
                        onChange={(e) => setSingleEmailInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addSingleCandidate();
                          }
                        }}
                        placeholder="candidate@company.com"
                        className={inputClasses}
                      />
                      <button
                        type="button"
                        onClick={addSingleCandidate}
                        className="px-5 py-2.5 bg-[var(--color-primary-md3)]/15 text-[var(--color-primary-md3)] hover:bg-[var(--color-primary-md3)] hover:text-white border border-[var(--color-primary-md3)]/25 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center shrink-0"
                      >
                        <Plus className="w-4 h-4 mr-1.5" /> Add Candidate
                      </button>
                    </div>
                  )}

                  {/* Mode 2: Bulk Text */}
                  {candidateMode === "bulk" && (
                    <div className="space-y-3">
                      <textarea
                        value={bulkEmailInput}
                        onChange={(e) => setBulkEmailInput(e.target.value)}
                        rows={3}
                        placeholder="Paste candidate emails separated by commas, spaces, or newlines (e.g. john@acme.com, sarah@acme.com)..."
                        className={`${inputClasses} resize-none`}
                      />
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={addBulkCandidates}
                          className="px-5 py-2.5 bg-[var(--color-primary-md3)]/15 text-[var(--color-primary-md3)] hover:bg-[var(--color-primary-md3)] hover:text-white border border-[var(--color-primary-md3)]/25 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center"
                        >
                          <Plus className="w-4 h-4 mr-1.5" /> Add Bulk Emails
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Mode 3: CSV Upload */}
                  {candidateMode === "csv" && (
                    <div className="p-6 border-2 border-dashed border-[var(--color-outline-variant)]/40 rounded-2xl bg-[var(--color-surface-container-highest)]/20 text-center space-y-3 relative hover:border-[var(--color-primary-md3)]/50 transition-colors">
                      <input
                        type="file"
                        accept=".csv, .txt"
                        onChange={handleCsvUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <div className="w-12 h-12 rounded-full bg-[var(--color-primary-md3)]/15 text-[var(--color-primary-md3)] flex items-center justify-center mx-auto border border-[var(--color-primary-md3)]/30">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-[var(--color-on-surface)]">
                          Drop CSV or TXT file here or click to browse
                        </h4>
                        <p className="text-[11px] text-[var(--color-on-surface-variant)] mt-1 font-medium">
                          Supports CSV files containing candidate emails in any column.
                        </p>
                      </div>
                      {csvFileName && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                          <FileSpreadsheet className="w-3.5 h-3.5" /> Last Uploaded: {csvFileName}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Newly Added Candidates Preview */}
                  {newCandidateEmails.length > 0 && (
                    <div className="space-y-3 pt-2 border-t border-[var(--color-outline-variant)]/20">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] flex items-center gap-2">
                          <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
                          Newly Added Candidates to Save ({newCandidateEmails.length})
                        </span>
                        <button
                          type="button"
                          onClick={clearNewCandidates}
                          className="text-[10px] font-black uppercase tracking-wider text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Clear All
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 rounded-xl bg-[var(--color-surface-container-highest)]/20 border border-[var(--color-outline-variant)]/20">
                        {newCandidateEmails.map((email) => (
                          <span
                            key={email}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-xs font-semibold text-emerald-300"
                          >
                            <Mail className="w-3 h-3 shrink-0" />
                            {email}
                            <button
                              type="button"
                              onClick={() => removeNewCandidate(email)}
                              className="hover:text-rose-400 transition-colors ml-1"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* AI System Instructions Section */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <GlassCard padding="p-6 md:p-8">
              <SectionHeader
                icon={Sparkles}
                title="AI System Instructions"
                subtitle="Provide custom prompt focus areas for the AI interviewer engine."
              />

              <div>
                <textarea
                  {...register("instructions")}
                  rows={4}
                  className={`${inputClasses} resize-none`}
                  placeholder="Provide specific guidelines for IntervuOS (e.g., 'Focus heavily on React performance optimization and custom hooks...')"
                />
                {errors.instructions && (
                  <p className="mt-2 text-xs font-bold text-rose-400">
                    • {errors.instructions.message}
                  </p>
                )}
              </div>
            </GlassCard>
          </motion.div>

          {/* Form Submit Action Buttons */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3.5 bg-transparent hover:bg-[var(--color-surface-variant)] text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] border border-[var(--color-outline-variant)]/30 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center min-w-[200px] bg-[var(--color-primary-md3)] hover:bg-[var(--color-primary-md3)]/90 text-white shadow-lg shadow-[var(--color-primary-md3)]/25"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Campaign Changes
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </form>
      </div>

      {/* QUESTION IMPORT FORMAT GUIDE MODAL */}
      {isQuestionImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={() => setIsQuestionImportModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-white">Import Custom Question Bank</h3>
                <p className="text-xs text-slate-400">Ensure your CSV or JSON file follows the required format below before uploading.</p>
              </div>
            </div>

            {/* Format Instructions */}
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 space-y-2">
                <div className="flex items-center gap-2 text-indigo-300 font-bold uppercase tracking-wider text-[11px]">
                  <AlertCircle className="w-4 h-4" />
                  <span>File Format Guidelines</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Your CSV or TXT file should contain columns in this exact order: <b>Question Text</b>, <b>Topic</b>, <b>Difficulty</b> (Easy, Medium, Hard). Headers are optional and automatically detected.
                </p>
              </div>

              {/* Code Samples */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Sample CSV File Structure:</span>
                </div>
                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px] overflow-x-auto whitespace-pre">
{`Question,Topic,Difficulty
"Explain how Virtual DOM works in React.",React,Easy
"What is the difference between useEffect and useMemo?",React,Medium
"How do you handle distributed locks in Redis?",Backend,Hard`}
                </pre>

                <div className="flex items-center justify-between pt-1">
                  <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Sample JSON File Structure:</span>
                </div>
                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px] overflow-x-auto whitespace-pre">
{`[
  { "question": "What is debouncing in JS?", "topic": "JavaScript", "difficulty": "Easy" },
  { "question": "Explain REST vs GraphQL.", "topic": "APIs", "difficulty": "Medium" }
]`}
                </pre>
              </div>

              {/* Upload Drop Zone */}
              <div className="p-6 border-2 border-dashed border-indigo-500/30 hover:border-indigo-500/60 rounded-2xl bg-indigo-500/5 text-center space-y-3 relative transition-all">
                <input
                  type="file"
                  accept=".csv, .txt, .json"
                  onChange={handleQuestionCsvUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/30">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-white">
                    Click to select CSV / JSON file or drag here
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 font-medium">
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
