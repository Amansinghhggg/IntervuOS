import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import {
  FileText,
  Users,
  Eye,
  Briefcase,
  Activity,
  Plus,
  Building2,
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  Search,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  X,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "../../ui/primitives/PageHeader";
import { SectionHeader } from "../../ui/primitives/SectionHeader";
import { MetricCard } from "../../ui/primitives/MetricCard";
import { GlassCard } from "../../ui/primitives/GlassCard";
import { StatusBadge } from "../../ui/primitives/StatusBadge";
import { EmptyState } from "../../ui/primitives/EmptyState";
import { LoadingState } from "../../ui/primitives/StateViews";

const ITEMS_PER_PAGE = 10;

const EmployerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Table filtering, search, sorting & pagination state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // 'ALL' | 'ACTIVE' | 'PENDING_VERIFICATION' | 'COMPLETED'
  const [sortField, setSortField] = useState("createdAt"); // 'title' | 'jobRole' | 'status' | 'candidates' | 'createdAt'
  const [sortOrder, setSortOrder] = useState("desc"); // 'asc' | 'desc'
  const [currentPage, setCurrentPage] = useState(1);

  const fetchInterviews = async () => {
    try {
      const { data } = await api.get("/interviews");
      if (data.success) {
        setInterviews(data.interviews || []);
      }
    } catch (error) {
      toast.error("Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  // Safe Display Name Resolution (Fixes raw username / internal handle leak)
  const displayName = useMemo(() => {
    if (user?.fullName?.trim()) return user.fullName.trim();
    if (user?.name?.trim() && !user.name.startsWith("user_")) return user.name.trim();
    if (user?.companyName?.trim()) return user.companyName.trim();
    return null;
  }, [user]);

  const greetingSubtitle = displayName
    ? `Welcome back, ${displayName}. Monitor recruitment campaigns, candidate evaluations, and assessment metrics.`
    : "Welcome back. Monitor recruitment campaigns, candidate evaluations, and assessment metrics.";

  // High-level statistics
  const totalCampaigns = interviews.length;
  const activeCampaigns = interviews.filter((i) => i.status === "active").length;
  const totalCandidates = interviews.reduce(
    (acc, curr) => acc + (curr.assignedCandidates?.length || 0),
    0
  );
  const activeCandidates = interviews
    .filter((i) => i.status === "active")
    .reduce((acc, curr) => acc + (curr.assignedCandidates?.length || 0), 0);

  const activeRate =
    totalCampaigns > 0 ? Math.round((activeCampaigns / totalCampaigns) * 100) : 0;

  // Filtered and Sorted Campaigns
  const filteredAndSortedCampaigns = useMemo(() => {
    let result = [...interviews];

    // 1. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.title?.toLowerCase().includes(q) ||
          item.jobRole?.toLowerCase().includes(q) ||
          item.interviewCode?.toLowerCase().includes(q) ||
          item.topics?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // 2. Status Pill Filter
    if (statusFilter === "ACTIVE") {
      result = result.filter((item) => item.status === "active" && item.isVerified);
    } else if (statusFilter === "PENDING_VERIFICATION") {
      result = result.filter((item) => !item.isVerified);
    } else if (statusFilter === "COMPLETED") {
      result = result.filter((item) => item.status === "completed");
    }

    // 3. Sorting
    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === "candidates") {
        aVal = a.assignedCandidates?.length || 0;
        bVal = b.assignedCandidates?.length || 0;
      } else if (sortField === "title" || sortField === "jobRole" || sortField === "status") {
        aVal = String(aVal || "").toLowerCase();
        bVal = String(bVal || "").toLowerCase();
      } else if (sortField === "createdAt") {
        aVal = new Date(a.createdAt || 0).getTime();
        bVal = new Date(b.createdAt || 0).getTime();
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [interviews, searchQuery, statusFilter, sortField, sortOrder]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredAndSortedCampaigns.length / ITEMS_PER_PAGE) || 1;
  const paginatedCampaigns = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedCampaigns.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAndSortedCampaigns, currentPage]);

  // Handle Sort Toggle
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const renderSortIndicator = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-[var(--color-text-muted)] opacity-50" />;
    }
    return sortOrder === "asc" ? (
      <ChevronUp className="w-3.5 h-3.5 text-[var(--color-primary)]" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-[var(--color-primary)]" />
    );
  };

  // Status Filter Pill Counts
  const counts = useMemo(() => {
    return {
      all: interviews.length,
      active: interviews.filter((i) => i.status === "active" && i.isVerified).length,
      pending: interviews.filter((i) => !i.isVerified).length,
      completed: interviews.filter((i) => i.status === "completed").length,
    };
  }, [interviews]);

  return (
    <div className="bg-[var(--color-canvas)] min-h-screen text-[var(--color-text-primary)] font-['Inter'] w-full px-4 sm:px-6 md:px-8 xl:px-10 py-6 sm:py-8 space-y-8">
      {/* Top Header Row with Single Primary CTA */}
      <div className="space-y-4">
        <PageHeader
          badgeIcon={Building2}
          badgeText="Employer console"
          title="Employer dashboard"
          description={greetingSubtitle}
          actions={
            <Link to="/employer/create-interview">
              <button
                type="button"
                className="px-5 py-2.5 rounded-xl text-xs font-medium tracking-tight transition-all flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white shadow-lg shadow-[var(--color-primary)]/30"
              >
                <Plus className="w-4 h-4" />
                <span>Create campaign</span>
              </button>
            </Link>
          }
        />
      </div>

      {/* Core Metrics Grid */}
      {!loading && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
        >
          <MetricCard
            icon={FileText}
            label="Total campaigns"
            value={totalCampaigns}
            trend="All-time created"
          />
          <MetricCard
            icon={Activity}
            label="Active campaigns"
            value={activeCampaigns}
            trend={`${activeRate}% active rate`}
          />
          <MetricCard
            icon={Users}
            label="Total candidates"
            value={totalCandidates}
            trend="Invited across campaigns"
          />
          <MetricCard
            icon={Eye}
            label="Active candidates"
            value={activeCandidates}
            trend="In live assessment pipelines"
          />
        </motion.div>
      )}

      {/* Campaigns Section */}
      {loading ? (
        <LoadingState message="Loading campaign dashboard..." />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard padding="p-0" className="overflow-hidden space-y-0">
            {/* Header & Controls Bar */}
            <div className="p-5 md:p-6 border-b border-[var(--color-border)] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <SectionHeader
                  icon={FileText}
                  title="Your campaigns"
                  subtitle="Manage active, pending, and completed candidate assessment campaigns."
                  className="mb-0"
                />

                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter("ALL");
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      statusFilter === "ALL"
                        ? "bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)]"
                        : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                    }`}
                  >
                    All ({counts.all})
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter("ACTIVE");
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      statusFilter === "ACTIVE"
                        ? "bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)]"
                        : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                    }`}
                  >
                    Active ({counts.active})
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter("PENDING_VERIFICATION");
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      statusFilter === "PENDING_VERIFICATION"
                        ? "bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)]"
                        : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                    }`}
                  >
                    Pending verification ({counts.pending})
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter("COMPLETED");
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      statusFilter === "COMPLETED"
                        ? "bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)]"
                        : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                    }`}
                  >
                    Completed ({counts.completed})
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative w-full">
                <Search className="w-4 h-4 text-[var(--color-text-secondary)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search campaigns by title, job role, topics, or code..."
                  className="w-full pl-10 pr-10 py-2.5 bg-[var(--color-canvas)] border border-[var(--color-border)] rounded-xl text-xs font-medium text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/50 focus:outline-none focus:border-[var(--color-border-active,#6338F6)] transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setCurrentPage(1);
                    }}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Campaign Table View */}
            {interviews.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title="No recruitment campaigns created yet"
                description="Launch a structured candidate assessment campaign with customized technical topics, AI-proctored sessions, and automated evaluations."
                action={
                  <Link to="/employer/create-interview">
                    <button
                      type="button"
                      className="px-6 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-xl text-xs font-medium transition-all shadow-lg shadow-[var(--color-primary)]/30 flex items-center gap-2 mx-auto"
                    >
                      <Plus className="w-4 h-4" /> Create first campaign
                    </button>
                  </Link>
                }
              />
            ) : filteredAndSortedCampaigns.length === 0 ? (
              <div className="p-12 text-center text-xs text-[var(--color-text-secondary)] space-y-2">
                <p className="font-medium text-sm text-[var(--color-text-primary)]">
                  No campaigns match your search or filter
                </p>
                <p>Try resetting the search query or changing the status filter.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("ALL");
                  }}
                  className="mt-2 px-4 py-2 bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)] rounded-xl text-xs font-medium"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div>
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse min-w-[760px]">
                    <thead>
                      <tr className="border-b border-[var(--color-border)] bg-[var(--color-canvas)]/60 text-xs font-medium text-[var(--color-text-secondary)]">
                        <th
                          onClick={() => handleSort("title")}
                          className="py-3.5 px-6 cursor-pointer select-none hover:text-[var(--color-text-primary)] transition-colors"
                        >
                          <div className="flex items-center gap-1.5">
                            <span>Campaign title</span>
                            {renderSortIndicator("title")}
                          </div>
                        </th>

                        <th
                          onClick={() => handleSort("jobRole")}
                          className="py-3.5 px-6 cursor-pointer select-none hover:text-[var(--color-text-primary)] transition-colors"
                        >
                          <div className="flex items-center gap-1.5">
                            <span>Job role</span>
                            {renderSortIndicator("jobRole")}
                          </div>
                        </th>

                        <th className="py-3.5 px-6">Verification</th>

                        <th
                          onClick={() => handleSort("status")}
                          className="py-3.5 px-6 cursor-pointer select-none hover:text-[var(--color-text-primary)] transition-colors"
                        >
                          <div className="flex items-center gap-1.5">
                            <span>Status</span>
                            {renderSortIndicator("status")}
                          </div>
                        </th>

                        <th
                          onClick={() => handleSort("candidates")}
                          className="py-3.5 px-6 text-center cursor-pointer select-none hover:text-[var(--color-text-primary)] transition-colors"
                        >
                          <div className="flex items-center justify-center gap-1.5">
                            <span>Candidates / cap</span>
                            {renderSortIndicator("candidates")}
                          </div>
                        </th>

                        <th className="py-3.5 px-6 text-right pr-8">Actions</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[var(--color-border)] text-xs">
                      {paginatedCampaigns.map((interview) => (
                        <tr
                          key={interview._id}
                          className="hover:bg-[var(--color-surface-hover,#1E1E2A)] transition-colors group"
                        >
                          {/* Title & Code */}
                          <td className="py-4 px-6">
                            <div className="font-medium text-sm text-[var(--color-text-primary)] mb-0.5">
                              {interview.title}
                            </div>
                            <div className="text-[11px] font-mono text-[var(--color-text-secondary)]">
                              Code: <span className="text-[var(--color-text-accent,#C4B5FD)]">{interview.interviewCode}</span>
                            </div>
                          </td>

                          {/* Role */}
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)] font-medium">
                              <Briefcase className="w-3.5 h-3.5 text-[var(--color-text-accent,#C4B5FD)]" />
                              {interview.jobRole}
                            </span>
                          </td>

                          {/* Verification */}
                          <td className="py-4 px-6">
                            {interview.isVerified ? (
                              <span
                                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/30"
                                title="Verified — Accessible to candidates"
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Verified
                              </span>
                            ) : (
                              <span
                                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[var(--color-warning)]/10 text-[var(--color-warning)] border border-[var(--color-warning)]/30"
                                title="Pending Admin Review — Hidden from candidates"
                              >
                                <ShieldAlert className="w-3.5 h-3.5" />
                                Pending verification
                              </span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-4 px-6">
                            <StatusBadge status={interview.status} size="sm" />
                          </td>

                          {/* Candidates Count */}
                          <td className="py-4 px-6 text-center">
                            <span className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 bg-[var(--color-canvas)] border border-[var(--color-border)] rounded-full text-xs font-medium text-[var(--color-text-primary)]">
                              <Users className="w-3 h-3 text-[var(--color-text-secondary)]" />
                              {interview.assignedCandidates?.length || 0} / {interview.maxCandidates || 10}
                            </span>
                          </td>

                          {/* Actions (Tint / Outline styling) */}
                          <td className="py-4 px-6 text-right pr-8">
                            <Link to={`/employer/interviews/${interview._id}`}>
                              <button
                                type="button"
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] hover:bg-[var(--color-primary-tint,rgba(99,56,246,0.25))] text-[var(--color-text-accent,#C4B5FD)] rounded-xl text-xs font-medium transition-colors border border-[var(--color-border-active,#6338F6)]/40"
                              >
                                <span>View details</span>
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="p-4 md:px-6 border-t border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--color-text-secondary)]">
                  <div>
                    {totalPages <= 1 ? (
                      <span>
                        Showing all{" "}
                        <span className="font-medium text-[var(--color-text-primary)]">
                          {filteredAndSortedCampaigns.length}
                        </span>{" "}
                        {filteredAndSortedCampaigns.length === 1 ? "campaign" : "campaigns"}
                      </span>
                    ) : (
                      <span>
                        Showing{" "}
                        <span className="font-medium text-[var(--color-text-primary)]">
                          {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                        </span>
                        –
                        <span className="font-medium text-[var(--color-text-primary)]">
                          {Math.min(
                            currentPage * ITEMS_PER_PAGE,
                            filteredAndSortedCampaigns.length
                          )}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium text-[var(--color-text-primary)]">
                          {filteredAndSortedCampaigns.length}
                        </span>{" "}
                        campaigns
                      </span>
                    )}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        className="p-2 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 rounded-xl text-xs font-medium transition-all ${
                            currentPage === page
                              ? "bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)]"
                              : "bg-[var(--color-canvas)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                          }`}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        type="button"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        className="p-2 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
};

export default EmployerDashboard;
