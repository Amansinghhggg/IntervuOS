import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  Loader2,
  Users,
  Briefcase,
  Clock,
  Tag,
  Key,
  CheckCircle2,
  Calendar,
  Plus,
  Edit,
  Trash2,
  X,
  Search,
  Sparkles,
  AlignLeft,
  Play,
  ShieldCheck,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  ExternalLink,
  Check,
  FileSpreadsheet
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "../../ui/primitives/PageHeader";
import { GlassCard } from "../../ui/primitives/GlassCard";
import { ConfirmationModal } from "../../ui/primitives/ConfirmationModal";
import { CandidateInviteForm } from "../../ui/primitives/CandidateInviteForm";

const ITEMS_PER_PAGE = 10;

const InterviewDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchCandidate, setSearchCandidate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Invite candidate modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addingCandidate, setAddingCandidate] = useState(false);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    description: "",
    confirmText: "",
    variant: "primary",
    onConfirm: null,
    isLoading: false,
  });

  const fetchInterview = async () => {
    try {
      const { data } = await api.get(`/interviews/${id}`);
      if (data.success) {
        setInterview(data.interview);
      }
    } catch (error) {
      toast.error("Failed to load interview details");
      navigate("/employer/dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterview();
  }, [id]);

  // Handle Delete Campaign
  const handleDeleteCampaign = () => {
    setConfirmModal({
      isOpen: true,
      title: "Delete interview campaign",
      description:
        "Are you sure you want to permanently delete this interview campaign? All candidate invites, session history, and evaluation records will be permanently removed. This action cannot be undone.",
      confirmText: "Delete campaign",
      variant: "danger",
      isLoading: false,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isLoading: true }));
        try {
          const { data } = await api.delete(`/interviews/${id}`);
          if (data.success) {
            toast.success("Campaign deleted successfully.");
            navigate("/employer/dashboard");
          }
        } catch (error) {
          toast.error(error.response?.data?.message || "Failed to delete campaign");
          setConfirmModal((prev) => ({ ...prev, isLoading: false, isOpen: false }));
        }
      },
    });
  };

  // Handle Complete Campaign
  const handleCompleteCampaign = () => {
    setConfirmModal({
      isOpen: true,
      title: "Mark campaign as completed",
      description:
        "Are you sure you want to mark this interview as completed? Candidates will no longer be able to launch new assessment sessions for this campaign.",
      confirmText: "Mark completed",
      variant: "warning",
      isLoading: false,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isLoading: true }));
        try {
          const { data } = await api.patch(`/interviews/${id}`, { status: "completed" });
          if (data.success) {
            toast.success("Campaign marked as completed.");
            setInterview(data.interview);
            setConfirmModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
          }
        } catch (error) {
          toast.error(error.response?.data?.message || "Failed to complete interview");
          setConfirmModal((prev) => ({ ...prev, isLoading: false }));
        }
      },
    });
  };

  // Handle Reactivate Campaign
  const handleActivateCampaign = () => {
    setConfirmModal({
      isOpen: true,
      title: "Activate interview campaign",
      description:
        "Are you sure you want to reactivate this campaign? Candidates will be able to take assessments again.",
      confirmText: "Activate campaign",
      variant: "primary",
      isLoading: false,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isLoading: true }));
        try {
          const { data } = await api.patch(`/interviews/${id}`, { status: "active" });
          if (data.success) {
            toast.success("Campaign activated successfully.");
            setInterview(data.interview);
            setConfirmModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
          }
        } catch (error) {
          toast.error(error.response?.data?.message || "Failed to activate interview");
          setConfirmModal((prev) => ({ ...prev, isLoading: false }));
        }
      },
    });
  };

  // Handle Remove Candidate
  const handleRemoveCandidate = (email) => {
    setConfirmModal({
      isOpen: true,
      title: "Remove candidate",
      description: `Are you sure you want to remove ${email} from this campaign roster? They will lose access to launch or re-take this interview.`,
      confirmText: "Remove candidate",
      variant: "danger",
      isLoading: false,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isLoading: true }));
        try {
          const { data } = await api.patch(`/interviews/${id}`, {
            removeCandidateEmail: email,
          });
          if (data.success) {
            toast.success("Candidate removed from campaign.");
            setInterview(data.interview);
            setConfirmModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
          }
        } catch (error) {
          toast.error(error.response?.data?.message || "Failed to remove candidate");
          setConfirmModal((prev) => ({ ...prev, isLoading: false }));
        }
      },
    });
  };

  // Handle Add Candidate Submit
  const handleAddCandidatesSubmit = async (emailsArray) => {
    if (!emailsArray || emailsArray.length === 0) return;

    setAddingCandidate(true);
    try {
      const { data } = await api.patch(`/interviews/${id}`, {
        candidateEmails: emailsArray,
      });
      if (data.success) {
        toast.success(
          emailsArray.length === 1
            ? "Candidate invited successfully."
            : `${emailsArray.length} candidates invited successfully.`
        );
        setInterview(data.interview);
        setIsAddModalOpen(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to invite candidates");
    } finally {
      setAddingCandidate(false);
    }
  };

  // Handle Candidate Join Request (Approve / Reject)
  const handleJoinRequest = async (email, action) => {
    try {
      const { data } = await api.patch(`/interviews/${id}/requests`, {
        email,
        action,
      });
      if (data.success) {
        toast.success(`Request ${action}d successfully.`);
        setInterview(data.interview);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${action} request`);
    }
  };

  // Canonical status -> color token mapping
  const getStatusBadgeStyle = (status) => {
    const s = (status || "").toLowerCase();
    switch (s) {
      case "completed":
        return "bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/30";
      case "in progress":
        return "bg-[var(--color-info-tint,rgba(59,130,246,0.15))] text-[var(--color-info,#3B82F6)] border-[var(--color-info,#3B82F6)]/30";
      case "requested":
        return "bg-[var(--color-info-tint,rgba(59,130,246,0.15))] text-[var(--color-info,#3B82F6)] border-[var(--color-info,#3B82F6)]/30";
      case "rejected":
        return "bg-[var(--color-danger)]/10 text-[var(--color-danger)] border-[var(--color-danger)]/30";
      case "pending":
      default:
        return "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)]";
    }
  };

  // Format date helper
  const formatDateTime = (dateStr) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }) + " • " + d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  // Filtered & Paginated Candidates
  const filteredCandidates = useMemo(() => {
    if (!interview?.assignedCandidates) return [];
    if (!searchCandidate.trim()) return interview.assignedCandidates;
    const q = searchCandidate.toLowerCase();
    return interview.assignedCandidates.filter(
      (c) =>
        c.email?.toLowerCase().includes(q) ||
        c.status?.toLowerCase().includes(q)
    );
  }, [interview?.assignedCandidates, searchCandidate]);

  const totalPages = Math.ceil(filteredCandidates.length / ITEMS_PER_PAGE) || 1;
  const paginatedCandidates = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCandidates.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCandidates, currentPage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-canvas)] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  if (!interview) return null;

  return (
    <div className="bg-[var(--color-canvas)] min-h-screen text-[var(--color-text-primary)] font-['Inter'] w-full px-4 sm:px-6 md:px-8 xl:px-10 py-6 sm:py-8 space-y-8">
      {/* Top Back Navigation Link */}
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
        <Link
          to="/employer/dashboard"
          className="inline-flex items-center gap-2 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to campaigns</span>
        </Link>
      </motion.div>

      {/* Main Campaign Header */}
      <div className="space-y-4">
        <PageHeader
          badgeIcon={Briefcase}
          badgeText="Campaign details"
          title={interview.title}
          description={
            <span className="flex items-center gap-3 flex-wrap mt-1">
              <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                {interview.jobRole}
              </span>
              <span className="text-[var(--color-border)]">•</span>
              {/* Flat tint code badge without glow shadow */}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)]/30 text-xs font-medium font-mono">
                <Key className="w-3 h-3" />
                <span>Code: {interview.interviewCode}</span>
              </span>
              <span className="text-[var(--color-border)]">•</span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border ${interview.status === "active"
                    ? "bg-[var(--color-info-tint,rgba(59,130,246,0.15))] text-[var(--color-info,#3B82F6)] border-[var(--color-info,#3B82F6)]/30"
                    : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)]"
                  }`}
              >
                {interview.status === "active" ? "Active campaign" : "Completed"}
              </span>
            </span>
          }
          actions={
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Status Toggle CTA: Outline / Tint */}
              {interview.status !== "completed" ? (
                <button
                  type="button"
                  onClick={handleCompleteCampaign}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover,#1E1E2A)] border border-[var(--color-border)] transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-warning)]" />
                  <span>Mark completed</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleActivateCampaign}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover,#1E1E2A)] border border-[var(--color-border)] transition-all flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 text-[var(--color-success)]" />
                  <span>Activate campaign</span>
                </button>
              )}

              {/* Edit CTA: Outline / Tint */}
              <Link to={`/employer/interviews/${interview._id}/edit`}>
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover,#1E1E2A)] border border-[var(--color-border)] transition-all flex items-center gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5 text-[var(--color-text-accent,#C4B5FD)]" />
                  <span>Edit</span>
                </button>
              </Link>

              {/* Delete CTA: Outline Danger */}
              <button
                type="button"
                onClick={handleDeleteCampaign}
                className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-danger)]/30 transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          }
        />
      </div>

      {/* Campaign Verification & Visibility Banner (Flat surface with accent left border) */}
      <div
        className={`p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] border-l-4 ${interview.isVerified
            ? "border-l-[var(--color-success)]"
            : "border-l-[var(--color-warning)]"
          } flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}
      >
        <div className="flex items-start gap-3.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border mt-0.5 ${interview.isVerified
                ? "bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/30"
                : "bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/30"
              }`}
          >
            {interview.isVerified ? (
              <ShieldCheck className="w-4 h-4" />
            ) : (
              <ShieldAlert className="w-4 h-4" />
            )}
          </div>
          <div>
            <h4
              className={`text-sm font-medium ${interview.isVerified
                  ? "text-[var(--color-success)]"
                  : "text-[var(--color-warning)]"
                }`}
            >
              {interview.isVerified
                ? "Campaign verified & candidate visible"
                : "Pending administrator verification"}
            </h4>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1 leading-relaxed max-w-3xl">
              {interview.isVerified
                ? "This campaign is approved by administrators. Invited candidates can view, join, and take this assessment."
                : "This campaign is awaiting administrator approval. Candidates cannot launch assessment sessions until verified."}
            </p>
          </div>
        </div>

        <div className="shrink-0 self-start sm:self-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-primary)]">
            <Users className="w-3.5 h-3.5 text-[var(--color-text-accent,#C4B5FD)]" />
            <span>
              Capacity: {interview.assignedCandidates?.length || 0} /{" "}
              {interview.maxCandidates || 10} candidates
            </span>
          </span>
        </div>
      </div>

      {/* Unified 4 Stat Cards (duration, experience, created on, candidates) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Duration */}
        <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--color-text-secondary)]">
              Duration
            </span>
            <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)]/30 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-medium tracking-tight text-[var(--color-text-primary)]">
            {interview.duration}{" "}
            <span className="text-xs font-normal text-[var(--color-text-secondary)]">
              mins
            </span>
          </div>
        </div>

        {/* Experience Level */}
        <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--color-text-secondary)]">
              Experience level
            </span>
            <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)]/30 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-medium tracking-tight text-[var(--color-text-primary)] capitalize">
            {interview.experienceLevel || "All levels"}
          </div>
        </div>

        {/* Created On */}
        <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--color-text-secondary)]">
              Created on
            </span>
            <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)]/30 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-medium tracking-tight text-[var(--color-text-primary)]">
            {new Date(interview.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        </div>

        {/* Candidates */}
        <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--color-text-secondary)]">
              Total candidates
            </span>
            <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)]/30 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-medium tracking-tight text-[var(--color-text-primary)]">
            {interview.assignedCandidates?.length || 0}
          </div>
        </div>
      </div>

      {/* Campaign Details & AI Instructions Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Description & Technical Topics */}
        <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-[var(--color-text-primary)] flex items-center gap-2">
              <AlignLeft className="w-4 h-4 text-[var(--color-text-accent,#C4B5FD)]" />
              <span>Description</span>
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed bg-[var(--color-canvas)] p-4 rounded-xl border border-[var(--color-border)]">
              {interview.description || "No description provided."}
            </p>
          </div>

          {interview.topics && interview.topics.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-sm font-medium text-[var(--color-text-primary)] flex items-center gap-2">
                <Tag className="w-4 h-4 text-[var(--color-text-accent,#C4B5FD)]" />
                <span>Technical topics</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {interview.topics.map((t) => (
                  <span
                    key={t}
                    className="px-3 py-1 bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)]/30 rounded-lg text-xs font-medium"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI System Instructions */}
        <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-[var(--color-text-primary)] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--color-text-accent,#C4B5FD)]" />
              <span>AI system instructions</span>
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed bg-[var(--color-canvas)] p-4 rounded-xl border border-[var(--color-border)] min-h-[120px]">
              {interview.instructions ||
                "No custom instructions provided. The AI will apply standard interview protocol for this role and experience level."}
            </p>
          </div>
        </div>
      </div>

      {/* Assigned Candidates Section */}
      <div className="space-y-4">
        {/* Section Header with Search and Single Primary Action */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <div>
            <h2 className="text-base font-medium tracking-tight text-[var(--color-text-primary)]">
              Assigned candidates
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Manage invites, evaluate status, and review completed interview results.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
              <input
                type="text"
                value={searchCandidate}
                onChange={(e) => {
                  setSearchCandidate(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search candidate email..."
                className="w-full sm:w-64 pl-9 pr-4 py-2 rounded-xl text-xs font-medium bg-[var(--color-canvas)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/50 focus:outline-none focus:border-[var(--color-border-active,#6338F6)] transition-colors"
              />
            </div>

            {/* Single Solid Primary CTA: Add Candidate */}
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-medium tracking-tight bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white shadow-lg shadow-[var(--color-primary)]/30 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add candidate</span>
            </button>
          </div>
        </div>

        {/* Candidate Table or Empty State */}
        {filteredCandidates.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] border border-[var(--color-border-active,#6338F6)]/30 flex items-center justify-center mx-auto text-[var(--color-text-accent,#C4B5FD)]">
              <Users className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                {searchCandidate
                  ? "No candidates found matching search"
                  : "No candidates invited yet"}
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] max-w-md mx-auto">
                {searchCandidate
                  ? "Try searching for a different candidate email address or clear your search term."
                  : "Invite candidates via single email, bulk paste, or CSV upload. Candidates can also join directly using your interview code."}
              </p>
            </div>
            {!searchCandidate && (
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="px-5 py-2.5 rounded-xl text-xs font-medium bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white shadow-lg shadow-[var(--color-primary)]/30 transition-all inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Invite candidates now</span>
              </button>
            )}
          </div>
        ) : (
          <div className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[var(--color-text-secondary)] border-collapse">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-canvas)]/60 text-[var(--color-text-secondary)] font-medium">
                    <th className="py-3.5 px-6 font-medium">Candidate email</th>
                    <th className="py-3.5 px-6 font-medium">Status</th>
                    <th className="py-3.5 px-6 font-medium">Joined at</th>
                    <th className="py-3.5 px-6 font-medium">Submitted at</th>
                    <th className="py-3.5 px-6 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {paginatedCandidates.map((candidate, idx) => (
                    <tr
                      key={candidate.email || idx}
                      className="hover:bg-[var(--color-surface-hover,#1E1E2A)] transition-colors group"
                    >
                      <td className="py-4 px-6 font-medium text-[var(--color-text-primary)]">
                        {candidate.email}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${getStatusBadgeStyle(
                            candidate.status
                          )}`}
                        >
                          {candidate.status || "Pending"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-[var(--color-text-secondary)] font-normal">
                        {formatDateTime(candidate.joinedAt)}
                      </td>
                      <td className="py-4 px-6 text-xs text-[var(--color-text-secondary)] font-normal">
                        {formatDateTime(candidate.submittedAt)}
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-2">
                          {candidate.status === "Requested" ? (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  handleJoinRequest(candidate.email, "approve")
                                }
                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--color-success)]/15 text-[var(--color-success)] hover:bg-[var(--color-success)]/25 border border-[var(--color-success)]/30 transition-all opacity-70 group-hover:opacity-100 hover:opacity-100"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleJoinRequest(candidate.email, "reject")
                                }
                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--color-danger)]/15 text-[var(--color-danger)] hover:bg-[var(--color-danger)]/25 border border-[var(--color-danger)]/30 transition-all opacity-70 group-hover:opacity-100 hover:opacity-100"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <>
                              {candidate.status === "Completed" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    navigate(
                                      `/employer/interviews/${id}/results/${candidate.resultId}`
                                    )
                                  }
                                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] hover:bg-[var(--color-primary-tint,rgba(99,56,246,0.25))] border border-[var(--color-border-active,#6338F6)]/30 transition-all opacity-70 group-hover:opacity-100 hover:opacity-100 inline-flex items-center gap-1"
                                >
                                  <span>View result</span>
                                  <ExternalLink className="w-3 h-3" />
                                </button>
                              )}
                              {candidate.status !== "Completed" &&
                                candidate.status !== "In Progress" && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveCandidate(candidate.email)
                                    }
                                    className="p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 transition-colors opacity-70 group-hover:opacity-100 hover:opacity-100"
                                    title="Remove candidate"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-canvas)]/30 text-xs text-[var(--color-text-secondary)] font-medium">
              <div>
                {filteredCandidates.length <= ITEMS_PER_PAGE
                  ? `Showing all ${filteredCandidates.length} candidate${filteredCandidates.length === 1 ? "" : "s"
                  }`
                  : `Showing ${(currentPage - 1) * ITEMS_PER_PAGE + 1
                  } to ${Math.min(
                    currentPage * ITEMS_PER_PAGE,
                    filteredCandidates.length
                  )} of ${filteredCandidates.length} candidates`}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover,#1E1E2A)] disabled:opacity-40 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${currentPage === pageNum
                          ? "bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)]"
                          : "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                        }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover,#1E1E2A)] disabled:opacity-40 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Candidate Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => !addingCandidate && setIsAddModalOpen(false)}
            />

            {/* Modal Body without Blur Blobs */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-2xl space-y-5 text-[var(--color-text-primary)] font-['Inter']"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-4 border-b border-[var(--color-border)] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)]/30 flex items-center justify-center shrink-0">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-medium tracking-tight text-[var(--color-text-primary)]">
                      Invite candidates to campaign
                    </h3>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      Add candidates individually, paste bulk lists, or upload a CSV.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={addingCandidate}
                  className="p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover,#1E1E2A)] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Shared Candidate Invite Form */}
              <CandidateInviteForm
                onAddCandidates={handleAddCandidatesSubmit}
                isSubmitting={addingCandidate}
                existingEmails={
                  interview.assignedCandidates?.map((c) => c.email) || []
                }
              />

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--color-border)]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={addingCandidate}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-[var(--color-canvas)] border border-[var(--color-border)] transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Generic Styled Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        description={confirmModal.description}
        confirmText={confirmModal.confirmText}
        variant={confirmModal.variant}
        isLoading={confirmModal.isLoading}
      />
    </div>
  );
};

export default InterviewDetailsPage;
