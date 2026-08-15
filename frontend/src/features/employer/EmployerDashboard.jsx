import { useState, useEffect } from "react";
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
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader } from "../../ui/primitives/PageHeader";
import { SectionHeader } from "../../ui/primitives/SectionHeader";
import { MetricCard } from "../../ui/primitives/MetricCard";
import { GlassCard } from "../../ui/primitives/GlassCard";
import { StatusBadge } from "../../ui/primitives/StatusBadge";
import { EmptyState } from "../../ui/primitives/EmptyState";
import { LoadingState } from "../../ui/primitives/StateViews";

const EmployerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInterviews = async () => {
    try {
      const { data } = await api.get("/interviews");
      if (data.success) {
        setInterviews(data.interviews);
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

  const totalCampaigns = interviews.length;
  const activeCampaigns = interviews.filter(i => i.status === 'active').length;
  const totalCandidates = interviews.reduce((acc, curr) => acc + (curr.assignedCandidates?.length || 0), 0);
  const activeCandidates = interviews.filter(i => i.status === 'active').reduce((acc, curr) => acc + (curr.assignedCandidates?.length || 0), 0);

  const handleCreateCampaignClick = (e) => {
    if (!user?.isVerified) {
      e.preventDefault();
      toast.error("Verification is required for campaign creation.");
      navigate("/employer/verification-pending");
    }
  };

  return (
    <div className="bg-transparent min-h-screen text-[var(--color-on-surface,#dae2fd)] font-['Inter'] pb-16">
      <div className="flex-1 w-full max-w-[1440px] mx-auto p-4 md:p-8 space-y-8">

        {/* Page Header */}
        <PageHeader
          badgeIcon={Building2}
          badgeText="Employer Console"
          title="Employer Dashboard"
          description={`Welcome back, ${user?.name || 'Recruiter'}. Monitor campaigns, candidate progress, and interview evaluation metrics.`}
          actions={
            <Link to="/employer/create-interview">
              <button
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                  user?.isVerified
                    ? "bg-[var(--color-primary-md3)] hover:bg-[var(--color-primary-md3)]/90 text-white shadow-md shadow-[var(--color-primary-md3)]/20"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
                }`}
              >
                {user?.isVerified ? <Plus className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4 text-amber-400" />}
                Create Campaign
              </button>
            </Link>
          }
        />

        {/* Verification Status Warning Banner */}
        {!user?.isVerified && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 md:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-300">
                  Account Pending Verification
                </h4>
                <p className="text-xs text-amber-200/80 mt-0.5 font-medium">
                  Your employer account is currently unverified. Admin approval is required before you can create recruitment campaigns.
                </p>
              </div>
            </div>
            <Link to="/employer/verification-pending">
              <button className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-wider rounded-xl border border-amber-500/40 transition-all flex items-center gap-1.5 whitespace-nowrap">
                View Status & Support <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </motion.div>
        )}

        {/* Core Metrics Grid */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
          >
            <MetricCard
              icon={FileText}
              label="Total Campaigns"
              value={totalCampaigns}
              subtext="Created"
              glowColor="primary"
            />
            <MetricCard
              icon={Activity}
              label="Active Campaigns"
              value={activeCampaigns}
              subtext="Open for candidates"
              glowColor="success"
            />
            <MetricCard
              icon={Users}
              label="Total Candidates"
              value={totalCandidates}
              subtext="Invited"
              glowColor="secondary"
            />
            <MetricCard
              icon={Eye}
              label="Active Candidates"
              value={activeCandidates}
              subtext="In active campaigns"
              glowColor="warning"
            />
          </motion.div>
        )}

        {/* Campaigns List */}
        {loading ? (
          <LoadingState message="Loading campaign dashboard..." />
        ) : (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <GlassCard padding="p-0">
              <div className="p-6 border-b border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-highest)]/20">
                <SectionHeader
                  icon={FileText}
                  title="Your Campaigns"
                  subtitle="Manage active and historical recruitment campaigns."
                  className="mb-0"
                />
              </div>

              {interviews.length === 0 ? (
                <EmptyState
                  icon={Briefcase}
                  title="No Recruitment Campaigns Created Yet"
                  description="Launch a structured candidate assessment campaign with customized technical questions, real-time proctoring, and automated STAR candidate scoring."
                  action={
                    <Link to="/employer/create-interview">
                      <button className="px-6 py-3 bg-[var(--primary,#5B3AF2)] hover:bg-[var(--primary-hover,#472CD7)] text-white rounded-xl text-xs font-medium transition-all shadow-sm flex items-center gap-2 mx-auto focus-visible:ring-2 focus-visible:ring-[var(--color-border-active)] focus-visible:outline-none">
                        <Plus className="w-4 h-4" /> Create First Campaign
                      </button>
                    </Link>
                  }
                />
              ) : (
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse min-w-[650px]">
                    <thead>
                      <tr className="border-b border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-highest)]/10">
                        <th className="py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">Campaign Title</th>
                        <th className="py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">Role</th>
                        <th className="py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">Verification</th>
                        <th className="py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">Status</th>
                        <th className="py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)] text-center">Candidates / Cap</th>
                        <th className="py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)] text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {interviews.map((interview) => (
                        <tr key={interview._id} className="border-b border-[var(--color-outline-variant)]/20 hover:bg-[var(--color-surface-container-highest)]/10 transition-colors group">
                          <td className="py-4 px-6">
                            <div className="font-bold text-sm text-[var(--color-on-surface)] mb-0.5">{interview.title}</div>
                            <div className="text-[10px] font-black tracking-widest text-[var(--color-on-surface-variant)] uppercase">Code: {interview.interviewCode}</div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="flex items-center gap-2 text-xs text-[var(--color-on-surface-variant)] font-semibold">
                              <Briefcase className="w-3.5 h-3.5 text-[var(--color-primary-md3)]" />
                              {interview.jobRole}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            {interview.isVerified ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" title="Verified — Accessible to candidates">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Verified & Visible
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20" title="Pending Admin Review — Hidden from candidates">
                                <ShieldAlert className="w-3.5 h-3.5" />
                                Pending Verification
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <StatusBadge status={interview.status} size="sm" />
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1 bg-[var(--color-surface-variant)]/50 rounded-full text-xs font-bold text-[var(--color-on-surface)]">
                              <Users className="w-3 h-3 text-[var(--color-on-surface-variant)]" />
                              {interview.assignedCandidates?.length || 0} / {interview.maxCandidates || 10}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <Link to={`/employer/interviews/${interview._id}`}>
                              <button className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-transparent hover:bg-[var(--color-primary-md3)]/10 text-[var(--color-primary-md3)] rounded-xl text-xs font-black uppercase tracking-wider transition-colors border border-[var(--color-primary-md3)]/20">
                                View Details
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </GlassCard>
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default EmployerDashboard;
