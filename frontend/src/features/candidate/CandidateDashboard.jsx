import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import {
  FileText,
  Clock,
  Building2,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Award,
  Layers,
  UserCheck,
  Coins,
  XCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader } from "../../ui/primitives/PageHeader";
import { SectionHeader } from "../../ui/primitives/SectionHeader";
import { MetricCard } from "../../ui/primitives/MetricCard";
import { GlassCard } from "../../ui/primitives/GlassCard";
import { StatusBadge } from "../../ui/primitives/StatusBadge";
import { EmptyState } from "../../ui/primitives/EmptyState";
import { LoadingState } from "../../ui/primitives/StateViews";

const CandidateDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInterviews = async () => {
    try {
      const { data } = await api.get("/interviews/candidate/assigned");
      if (data.success) {
        setInterviews(data.interviews);

        const inProgress = data.interviews.filter(interview => {
          return interview.candidateStatus?.toLowerCase() === "in progress" || interview.candidateStatus?.toLowerCase() === "in-progress";
        });

        if (inProgress.length > 0) {
          navigate(`/candidate/interviews/${inProgress[0]._id}/live`);
        }
      }
    } catch (error) {
      toast.error("Failed to load assigned interviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const assignedInterviews = interviews.filter(interview => {
    return (interview.candidateStatus === "Pending" || interview.candidateStatus === "Requested") && interview.status !== "completed";
  });

  const inProgressInterviews = interviews.filter(interview => {
    const status = interview.candidateStatus?.toLowerCase();
    return (status === "in progress" || status === "in-progress") && interview.status !== "completed";
  });

  const completedInterviews = interviews.filter(interview => {
    const status = interview.candidateStatus?.toLowerCase();
    return status === "completed";
  });

  const missedInterviews = interviews.filter(interview => {
    const status = interview.candidateStatus?.toLowerCase();
    return interview.status === "completed" && status !== "completed";
  });

  const rejectedInterviews = interviews.filter(interview => {
    return interview.candidateStatus === "Rejected";
  });

  const handleStartInterview = (interviewId) => {
    if (inProgressInterviews.length > 0) {
      toast.error("You must complete your in-progress interview before starting a new one.");
      return;
    }
    navigate(`/candidate/interviews/${interviewId}`);
  };

  return (
    <div className="min-h-screen bg-transparent w-full font-['Inter'] pb-16 text-[var(--color-on-surface,#dae2fd)]">
      <div className="w-full max-w-[1440px] mx-auto p-4 md:p-8 space-y-8">

        {/* Page Header */}
        <PageHeader
          badgeIcon={UserCheck}
          badgeText="Candidate Workspace"
          title="Assigned Interviews"
          description={`Welcome back, ${user?.name || 'Candidate'}. Review your assigned interview campaigns and employer invitations.`}
        />

        {/* Metric Cards Overview */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
          >
            <MetricCard
              icon={FileText}
              label="Assigned Campaigns"
              value={assignedInterviews.length}
              subtext="Awaiting Start"
              glowColor="primary"
            />
            <MetricCard
              icon={AlertCircle}
              label="In Progress"
              value={inProgressInterviews.length}
              subtext="Active Sessions"
              glowColor="warning"
            />
            <MetricCard
              icon={CheckCircle2}
              label="Completed"
              value={completedInterviews.length}
              subtext="Evaluated"
              glowColor="success"
            />
            <MetricCard
              icon={Clock}
              label="Missed"
              value={missedInterviews.length}
              subtext="Closed"
              glowColor="secondary"
            />
          </motion.div>
        )}

        {loading ? (
          <LoadingState message="Loading assigned campaigns..." />
        ) : (
          <div className="space-y-10">

            {/* In-Progress Interviews */}
            {inProgressInterviews.length > 0 && (
              <motion.section initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                <SectionHeader
                  icon={AlertCircle}
                  title="Action Required"
                  subtitle="You have an active interview session in progress."
                />

                <div className="grid grid-cols-1 gap-6">
                  {inProgressInterviews.map((interview) => (
                    <GlassCard key={interview._id} padding="p-6 md:p-8" className="border-amber-500/40">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <StatusBadge status="In Progress" />
                          </div>
                          <h3 className="text-2xl font-black text-[var(--color-on-surface,#dae2fd)] mb-2 uppercase">{interview.title}</h3>
                          <div className="flex flex-wrap items-center gap-4 text-xs font-bold tracking-wider text-[var(--color-on-surface-variant)] uppercase mb-2">
                            <span className="flex items-center gap-1.5">
                              <Briefcase className="w-4 h-4 text-[var(--color-primary-md3)]" />
                              {interview.jobRole}
                            </span>
                            {interview.employer && (
                              <span className="flex items-center gap-1.5">
                                <Building2 className="w-4 h-4 text-[var(--color-secondary)]" />
                                {interview.employer.name}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => navigate(`/candidate/interviews/${interview._id}/live`)}
                          className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-amber-500/25 flex items-center whitespace-nowrap w-full md:w-auto justify-center"
                        >
                          Resume Interview <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Rejected Join Requests */}
            {rejectedInterviews.length > 0 && (
              <motion.section initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
                <GlassCard padding="p-0" className="border-rose-500/30">
                  <div className="p-6 border-b border-[var(--color-outline-variant)]/30 bg-rose-500/5">
                    <SectionHeader
                      icon={XCircle}
                      title="Rejected Join Requests"
                      subtitle="Campaign join requests that were not approved by the employer."
                      className="mb-0"
                    />
                  </div>

                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="border-b border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-highest)]/10">
                          <th className="py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">Organization</th>
                          <th className="py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">Role</th>
                          <th className="py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">Status & Note</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rejectedInterviews.map((interview) => (
                          <tr key={interview._id} className="border-b border-[var(--color-outline-variant)]/20 hover:bg-[var(--color-surface-container-highest)]/10 transition-colors">
                            <td className="py-4 px-6">
                              <div className="font-bold text-sm text-[var(--color-on-surface)] mb-0.5">{interview.title}</div>
                              {interview.employer && (
                                <div className="text-[10px] font-black tracking-widest text-[var(--color-on-surface-variant)] uppercase">Shared By: {interview.employer.name}</div>
                              )}
                            </td>
                            <td className="py-4 px-6">
                              <span className="flex items-center gap-2 text-xs text-[var(--color-on-surface-variant)] font-semibold">
                                <Briefcase className="w-3.5 h-3.5 text-[var(--color-primary-md3)]" />
                                {interview.jobRole}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex flex-col gap-1">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-rose-500/10 text-rose-400 border border-rose-500/20 w-fit">
                                  Request Declined
                                </span>
                                <p className="text-[11px] text-[var(--color-on-surface-variant)] font-medium">
                                  Your request to join this campaign was declined by the employer. Please contact the employer to request re-enrollment or access.
                                </p>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </GlassCard>
              </motion.section>
            )}

            {/* Assigned Interviews */}
            <motion.section initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <GlassCard padding="p-0">
                <div className="p-6 border-b border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-highest)]/20">
                  <SectionHeader
                    icon={FileText}
                    title="Assigned Campaigns"
                    subtitle="Campaign invitations awaiting your participation."
                    className="mb-0"
                  />
                </div>

                {assignedInterviews.length === 0 ? (
                  <EmptyState
                    icon={FileText}
                    title="No Assigned Interviews"
                    description="You are all caught up! Wait for your employer to assign new campaigns."
                  />
                ) : (
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="border-b border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-highest)]/10">
                          <th className="py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">Organization</th>
                          <th className="py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">Role</th>
                          <th className="py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">Experience</th>
                          <th className="py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">Duration</th>
                          <th className="py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)] text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assignedInterviews.map((interview) => (
                          <tr key={interview._id} className="border-b border-[var(--color-outline-variant)]/20 hover:bg-[var(--color-surface-container-highest)]/10 transition-colors group">
                            <td className="py-4 px-6">
                              <div className="font-bold text-sm text-[var(--color-on-surface)] mb-0.5">{interview.title}</div>
                              {interview.employer && (
                                <div className="text-[10px] font-black tracking-widest text-[var(--color-on-surface-variant)] uppercase">Shared By: {interview.employer.name}</div>
                              )}
                            </td>
                            <td className="py-4 px-6">
                              <span className="flex items-center gap-2 text-xs text-[var(--color-on-surface-variant)] font-semibold">
                                <Briefcase className="w-3.5 h-3.5 text-[var(--color-primary-md3)]" />
                                {interview.jobRole}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <StatusBadge status="pending" customLabel={interview.experienceLevel} size="sm" />
                            </td>
                            <td className="py-4 px-6">
                              <span className="flex items-center gap-2 text-xs text-[var(--color-on-surface-variant)] font-semibold">
                                <Clock className="w-3.5 h-3.5 text-[var(--color-secondary)]" />
                                {interview.duration} mins
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              {interview.candidateStatus === "Requested" ? (
                                <button
                                  disabled
                                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-[var(--color-surface-variant)] text-[var(--color-on-surface-variant)] opacity-70 cursor-not-allowed border border-[var(--color-outline-variant)]/30"
                                >
                                  Awaiting Approval
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleStartInterview(interview._id)}
                                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                    inProgressInterviews.length > 0
                                      ? 'bg-[var(--color-surface-variant)] text-[var(--color-on-surface-variant)] opacity-50 cursor-not-allowed'
                                      : 'bg-[var(--color-primary-md3)] text-white hover:bg-[var(--color-primary-md3)]/90 shadow-md shadow-[var(--color-primary-md3)]/20'
                                  }`}
                                >
                                  Start Interview
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </GlassCard>
            </motion.section>

            {/* Completed Interviews */}
            <motion.section initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <GlassCard padding="p-0">
                <div className="p-6 border-b border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-highest)]/20">
                  <SectionHeader
                    icon={CheckCircle2}
                    title="Completed Campaigns"
                    subtitle="Your past campaign submissions."
                    className="mb-0"
                  />
                </div>

                {completedInterviews.length === 0 ? (
                  <EmptyState
                    icon={CheckCircle2}
                    title="No Completed Interviews"
                    description="Finished campaign evaluations will appear here."
                  />
                ) : (
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="border-b border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-highest)]/10">
                          <th className="py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">Organization</th>
                          <th className="py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">Role</th>
                          <th className="py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">Status</th>
                          <th className="py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)] text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {completedInterviews.map((interview) => (
                          <tr key={interview._id} className="border-b border-[var(--color-outline-variant)]/20 hover:bg-[var(--color-surface-container-highest)]/10 transition-colors">
                            <td className="py-4 px-6">
                              <div className="font-bold text-sm text-[var(--color-on-surface)] mb-0.5">{interview.title}</div>
                              {interview.employer && (
                                <div className="text-[10px] font-black tracking-widest text-[var(--color-on-surface-variant)] uppercase">{interview.employer.name}</div>
                              )}
                            </td>
                            <td className="py-4 px-6">
                              <span className="flex items-center gap-2 text-xs text-[var(--color-on-surface-variant)] font-semibold">
                                <Briefcase className="w-3.5 h-3.5" />
                                {interview.jobRole}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <StatusBadge status="Completed" size="sm" />
                            </td>
                            <td className="py-4 px-6 text-right">
                              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest bg-[var(--color-surface-variant)] text-[var(--color-on-surface-variant)]">
                                Submitted
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </GlassCard>
            </motion.section>

            {/* Missed Interviews */}
            {missedInterviews.length > 0 && (
              <motion.section initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <GlassCard padding="p-0">
                  <div className="p-6 border-b border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-highest)]/20">
                    <SectionHeader
                      icon={Clock}
                      title="Closed Campaigns"
                      subtitle="Campaigns closed before submission."
                      className="mb-0"
                    />
                  </div>

                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="border-b border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-highest)]/10">
                          <th className="py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">Organization</th>
                          <th className="py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">Role</th>
                          <th className="py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)] text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {missedInterviews.map((interview) => (
                          <tr key={interview._id} className="border-b border-[var(--color-outline-variant)]/20 hover:bg-[var(--color-surface-container-highest)]/10 transition-colors">
                            <td className="py-4 px-6">
                              <div className="font-bold text-sm text-[var(--color-on-surface)] mb-0.5">{interview.title}</div>
                              {interview.employer && (
                                <div className="text-[10px] font-black tracking-widest text-[var(--color-on-surface-variant)] uppercase">{interview.employer.name}</div>
                              )}
                            </td>
                            <td className="py-4 px-6">
                              <span className="flex items-center gap-2 text-xs text-[var(--color-on-surface-variant)] font-semibold">
                                <Briefcase className="w-3.5 h-3.5" />
                                {interview.jobRole}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <StatusBadge status="failed" customLabel="Closed" size="sm" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </GlassCard>
              </motion.section>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default CandidateDashboard;
