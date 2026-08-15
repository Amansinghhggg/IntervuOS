import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import {
  Briefcase,
  Building2,
  Clock,
  ArrowRight,
  PlayCircle,
  AlertCircle,
  Hourglass,
  XCircle,
  Search,
  Key,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Layers,
  FileText
} from "lucide-react";
import { JoinCampaignModal } from "./components/JoinCampaignModal";

export default function CandidateDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL | READY | IN_PROGRESS | REQUESTED
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const fetchAssignedInterviews = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/interviews/candidate/assigned");
      if (data.success && Array.isArray(data.interviews)) {
        setInterviews(data.interviews);

        // Auto-redirect if an active session is in progress
        const inProgress = data.interviews.filter((interview) => {
          const status = interview.candidateStatus?.toLowerCase();
          return (status === "in progress" || status === "in-progress") && interview.status !== "completed";
        });

        if (inProgress.length > 0) {
          // Optional toast to notify candidate
          // toast("You have an active interview session in progress", { icon: "⏳" });
        }
      } else {
        setInterviews([]);
      }
    } catch (error) {
      toast.error("Failed to load assigned interviews");
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedInterviews();
  }, []);

  // Filter ONLY active assigned, in-progress, requested, and declined items (NO completed / closed history here)
  const activeInterviews = useMemo(() => {
    return interviews.filter((interview) => {
      const cStatus = interview.candidateStatus?.toLowerCase();
      // Exclude completed or expired interviews (those belong in Past Interviews page)
      if (cStatus === "completed" || (interview.status === "completed" && cStatus !== "completed")) {
        return false;
      }
      return true;
    });
  }, [interviews]);

  // Specific Categorization
  const inProgressList = useMemo(() => {
    return activeInterviews.filter((i) => {
      const s = i.candidateStatus?.toLowerCase();
      return (s === "in progress" || s === "in-progress") && i.status !== "completed";
    });
  }, [activeInterviews]);

  const readyToStartList = useMemo(() => {
    return activeInterviews.filter((i) => {
      return i.candidateStatus === "Pending" && i.status !== "completed";
    });
  }, [activeInterviews]);

  const requestedList = useMemo(() => {
    return activeInterviews.filter((i) => {
      return i.candidateStatus === "Requested" && i.status !== "completed";
    });
  }, [activeInterviews]);

  const declinedList = useMemo(() => {
    return activeInterviews.filter((i) => {
      return i.candidateStatus === "Rejected";
    });
  }, [activeInterviews]);

  // Search and Tab Filtering
  const filteredList = useMemo(() => {
    return activeInterviews.filter((item) => {
      const matchesSearch =
        (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.jobRole && item.jobRole.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.employer?.name && item.employer.name.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      const s = item.candidateStatus?.toLowerCase();
      if (statusFilter === "ALL") return item.candidateStatus !== "Rejected";
      if (statusFilter === "READY") return item.candidateStatus === "Pending";
      if (statusFilter === "IN_PROGRESS") return s === "in progress" || s === "in-progress";
      if (statusFilter === "REQUESTED") return item.candidateStatus === "Requested";
      if (statusFilter === "DECLINED") return item.candidateStatus === "Rejected";
      return true;
    });
  }, [activeInterviews, searchQuery, statusFilter]);

  const handleStartInterview = (interviewId) => {
    if (inProgressList.length > 0 && inProgressList[0]._id !== interviewId) {
      toast.error("You must complete your in-progress interview before starting a new one.");
      return;
    }
    navigate(`/candidate/interviews/${interviewId}`);
  };

  return (
    <div className="w-full min-h-screen bg-[var(--background)] font-['Inter'] pb-20 text-[var(--text-primary)]">
      <div className="w-full px-4 sm:px-6 md:px-8 xl:px-10 py-6 sm:py-8 space-y-6">

        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border)]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] text-[11px] font-medium">
                <Briefcase className="w-3 h-3" /> Candidate Workspace
              </span>
              <span className="text-xs text-[var(--text-muted)]">•</span>
              <span className="text-xs text-[var(--text-secondary)] font-normal">Active Invitations & Assignments</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-medium tracking-tight text-[var(--text-primary)]">
              Assigned Interviews
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsJoinModalOpen(true)}
              className="px-4 py-2 bg-[var(--card)] hover:bg-[var(--surface-hover,#1E1E2A)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-medium rounded-xl inline-flex items-center gap-1.5 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[var(--color-border-active)] focus-visible:outline-none"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Join with Access Key</span>
            </button>

            <button
              onClick={() => navigate("/candidate/mock-interview")}
              className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium text-xs rounded-xl inline-flex items-center gap-1.5 transition-colors duration-150 shadow-sm shrink-0 focus-visible:ring-2 focus-visible:ring-[var(--color-border-active)] focus-visible:outline-none"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Practice AI Mock</span>
            </button>
          </div>
        </div>

        {/* Summary Metric Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[var(--card)] border border-[var(--border)] p-4 sm:p-5 rounded-2xl space-y-1">
            <div className="text-xs text-[var(--text-secondary)] flex items-center justify-between">
              <span>Ready to Start</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <div className="text-2xl font-medium text-[var(--text-primary)]">{readyToStartList.length}</div>
            <p className="text-[11px] text-[var(--text-muted)]">Awaiting your participation</p>
          </div>

          <div className="bg-[var(--card)] border border-[var(--border)] p-4 sm:p-5 rounded-2xl space-y-1">
            <div className="text-xs text-[var(--text-secondary)] flex items-center justify-between">
              <span>In Progress</span>
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            </div>
            <div className="text-2xl font-medium text-amber-400">{inProgressList.length}</div>
            <p className="text-[11px] text-[var(--text-muted)]">Active session ongoing</p>
          </div>

          <div className="bg-[var(--card)] border border-[var(--border)] p-4 sm:p-5 rounded-2xl space-y-1">
            <div className="text-xs text-[var(--text-secondary)] flex items-center justify-between">
              <span>Awaiting Approval</span>
              <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />
            </div>
            <div className="text-2xl font-medium text-[var(--color-text-accent,#C4B5FD)]">{requestedList.length}</div>
            <p className="text-[11px] text-[var(--text-muted)]">Pending employer review</p>
          </div>
        </div>

        {/* Critical In-Progress Alert Banner */}
        {inProgressList.length > 0 && (
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-[var(--text-primary)]">
                  Action Required: Active Session In Progress
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  You have an open interview session for <strong className="text-[var(--text-primary)]">{inProgressList[0].title}</strong>. Please resume and complete it.
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate(`/candidate/interviews/${inProgressList[0]._id}/live`)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-medium text-xs rounded-xl flex items-center gap-1.5 transition-colors duration-150 shrink-0 shadow-sm"
            >
              <span>Resume Live Session</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search by campaign title, role, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--card)] border border-[var(--border)] pl-9 pr-4 py-2 rounded-xl text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-border-active,#6338F6)] transition-colors duration-150"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { key: "ALL", label: `All Active (${activeInterviews.filter(i => i.candidateStatus !== "Rejected").length})` },
              { key: "READY", label: `Ready to Start (${readyToStartList.length})` },
              { key: "IN_PROGRESS", label: `In Progress (${inProgressList.length})` },
              { key: "REQUESTED", label: `Awaiting (${requestedList.length})` },
              { key: "DECLINED", label: `Declined (${declinedList.length})` }
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors duration-150 border whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[var(--color-border-active)] focus-visible:outline-none ${
                  statusFilter === f.key
                    ? "bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border-[var(--color-border-active,#6338F6)]"
                    : "bg-[var(--card)] text-[var(--text-secondary)] border-[var(--border)] hover:text-[var(--text-primary)]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Assigned Interviews List */}
        <div className="space-y-3">
          {loading ? (
            <div className="bg-[var(--card)] border border-[var(--border)] p-12 rounded-2xl text-center text-xs text-[var(--text-secondary)]">
              Loading assigned interviews...
            </div>
          ) : filteredList.length === 0 ? (
            <div className="bg-[var(--card)] border border-[var(--border)] p-12 rounded-2xl text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--primary-tint,rgba(99,56,246,0.15))] flex items-center justify-center text-[var(--primary)] mx-auto">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="text-base font-medium text-[var(--text-primary)]">
                {statusFilter === "DECLINED" ? "No declined interviews" : "No assigned interviews"}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                {searchQuery || statusFilter !== "ALL"
                  ? "No assigned interviews match your current search filters."
                  : "You're all caught up! When an employer assigns a campaign or accepts your access key, it will appear here."}
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setIsJoinModalOpen(true)}
                  className="px-4 py-2 bg-[var(--card)] hover:bg-[var(--surface-hover,#1E1E2A)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-medium rounded-xl transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[var(--color-border-active)] focus-visible:outline-none"
                >
                  Join Campaign with Code
                </button>
                <button
                  onClick={() => navigate("/candidate/mock-interview")}
                  className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium text-xs rounded-xl transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[var(--color-border-active)] focus-visible:outline-none"
                >
                  Launch AI Mock
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredList.map((interview) => {
                const isDeclined = interview.candidateStatus === "Rejected";
                const isRequested = interview.candidateStatus === "Requested";
                const isInProgress =
                  interview.candidateStatus?.toLowerCase() === "in progress" ||
                  interview.candidateStatus?.toLowerCase() === "in-progress";

                return (
                  <div
                    key={interview._id}
                    className={`bg-[var(--card)] border transition-colors duration-150 rounded-2xl p-5 ${
                      isDeclined
                        ? "border-rose-500/20 opacity-80"
                        : "border-[var(--border)] hover:border-[var(--color-border-active,#6338F6)]/60"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      
                      {/* Left Details */}
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          {isDeclined ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
                              <XCircle className="w-3 h-3" /> Declined
                            </span>
                          ) : isRequested ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--primary)]/30">
                              Awaiting Approval
                            </span>
                          ) : isInProgress ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              In Progress
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Ready to Start
                            </span>
                          )}

                          {interview.employer?.name && (
                            <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1 font-normal">
                              <Building2 className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                              {interview.employer.name}
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-medium text-[var(--text-primary)]">
                          {interview.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)]">
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3.5 h-3.5 text-[var(--primary)]" />
                            {interview.jobRole}
                          </span>
                          <span>•</span>
                          <span>{interview.experienceLevel || "All Levels"}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            {interview.duration || 15} Mins
                          </span>
                        </div>
                      </div>

                      {/* Right Action CTA Button */}
                      <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border)]">
                        {isDeclined ? (
                          <div className="flex items-center gap-1.5 text-xs text-rose-400/90 px-3 py-2 rounded-xl bg-rose-500/5 border border-rose-500/20">
                            <XCircle className="w-3.5 h-3.5 text-rose-400" />
                            <span>Request Declined by Recruiter</span>
                          </div>
                        ) : isRequested ? (
                          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--border)]">
                            <Hourglass className="w-3.5 h-3.5 text-[var(--color-text-accent,#C4B5FD)] animate-pulse" />
                            <span>Employer Review Pending</span>
                          </div>
                        ) : isInProgress ? (
                          <button
                            onClick={() => navigate(`/candidate/interviews/${interview._id}/live`)}
                            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-medium text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors duration-150 shadow-sm w-full sm:w-auto"
                          >
                            <span>Resume Live Session</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStartInterview(interview._id)}
                            className="px-4 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] active:scale-[0.99] text-white font-medium text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all duration-150 shadow-sm w-full sm:w-auto focus-visible:ring-2 focus-visible:ring-[var(--color-border-active)] focus-visible:outline-none"
                          >
                            <PlayCircle className="w-3.5 h-3.5" />
                            <span>Start Interview</span>
                          </button>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Join Campaign Modal */}
      <JoinCampaignModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onSuccess={fetchAssignedInterviews}
      />
    </div>
  );
}
