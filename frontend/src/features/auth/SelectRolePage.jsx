import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import {
  Building2,
  UserRound,
  BrainCircuit,
  Sparkles,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  BarChart3,
  Bot
} from "lucide-react";
import { motion } from "framer-motion";

const SelectRolePage = () => {
  const { user, selectRole } = useAuth();
  const navigate = useNavigate();
  const [loadingRole, setLoadingRole] = useState(null); // 'employer' | 'candidate' | null

  // If user is not logged in, send to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user already has a role assigned, redirect to their home page
  if (user.role) {
    const redirectPath =
      user.role === "employer" ? "/employer/dashboard" : "/candidate/mock-interview";
    return <Navigate to={redirectPath} replace />;
  }

  const handleChooseRole = async (chosenRole) => {
    setLoadingRole(chosenRole);
    try {
      const data = await selectRole(chosenRole);
      toast.success(`Welcome! Account set as ${chosenRole === "employer" ? "Employer" : "Candidate"}.`);
      if (chosenRole === "employer") {
        navigate("/employer/dashboard");
      } else {
        navigate("/candidate/mock-interview");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to set role. Please try again.");
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[var(--background)] font-['Inter'] p-4 md:p-8 text-[var(--text-primary)]">
      {/* Background radial effects */}
      <div
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[var(--primary)] rounded-full blur-[160px] opacity-20 pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[var(--primary)] rounded-full blur-[140px] opacity-15 pointer-events-none" />

      <div className="w-full max-w-[1000px] z-10 space-y-10">
        {/* Brand Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[var(--primary-tint,rgba(99,56,246,0.15))] border border-[var(--primary)]/30 text-[var(--color-text-accent,#C4B5FD)] text-xs font-black uppercase tracking-widest shadow-lg">
            <BrainCircuit className="w-4 h-4" />
            IntervuOS Account Setup
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight">
            Select Your Account Role
          </h1>
          <p className="text-sm md:text-base text-[var(--text-secondary)] max-w-xl mx-auto font-medium">
            Welcome, <span className="text-[var(--text-primary)] font-bold">{user.name || user.email}</span>! Please select how you intend to use IntervuOS to continue.
          </p>
        </div>

        {/* Role Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {/* Card 1: Employer */}
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-[var(--card)] backdrop-blur-xl border border-[var(--border)] hover:border-[var(--color-border-active,#6338F6)] rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden group shadow-2xl transition-all"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)]/10 rounded-full blur-[40px] group-hover:bg-[var(--primary)]/20 transition-all pointer-events-none" />

            <div className="space-y-6 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-[var(--primary)]/15 border border-[var(--primary)]/30 text-[var(--primary)] flex items-center justify-center shadow-lg">
                <Building2 className="w-8 h-8" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">Employer</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-[var(--primary)]/20 text-[var(--color-text-accent,#C4B5FD)] text-[10px] font-black uppercase tracking-widest border border-[var(--primary)]/30">
                    Recruiter
                  </span>
                </div>
                <p className="text-xs text-[var(--color-on-surface-variant)] mt-2 font-medium leading-relaxed">
                  Create automated AI recruitment campaigns, evaluate candidates, and export detailed PDF scorecards.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-xs text-[var(--color-on-surface-variant)] font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Create & publish AI technical interview campaigns</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-[var(--color-on-surface-variant)] font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Invite candidates via Single, Bulk, or CSV uploads</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-[var(--color-on-surface-variant)] font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Automated AI candidate scoring & PDF export reports</span>
                </div>
              </div>
            </div>

            <div className="pt-8 relative z-10">
              <button
                type="button"
                disabled={loadingRole !== null}
                onClick={() => handleChooseRole("employer")}
                className="w-full py-4 bg-[var(--color-primary-md3)] hover:bg-[var(--color-primary-md3)]/90 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-[var(--color-primary-md3)]/30 flex items-center justify-center gap-2 group-hover:scale-[1.01]"
              >
                {loadingRole === "employer" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Setting Up...
                  </>
                ) : (
                  <>
                    Continue as Employer
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* Card 2: Candidate */}
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-[var(--color-surface-container-low)]/80 backdrop-blur-xl border border-[var(--color-outline-variant)]/30 hover:border-emerald-500/60 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden group shadow-2xl transition-all"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] group-hover:bg-emerald-500/20 transition-all pointer-events-none" />

            <div className="space-y-6 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg">
                <UserRound className="w-8 h-8" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-black text-white tracking-tight">Candidate</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-widest border border-emerald-500/30">
                    Applicant
                  </span>
                </div>
                <p className="text-xs text-[var(--color-on-surface-variant)] mt-2 font-medium leading-relaxed">
                  Practice interactive AI mock interviews, sharpen technical knowledge, and track evaluation scores.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-xs text-[var(--color-on-surface-variant)] font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Take 24/7 AI voice & code mock interviews</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-[var(--color-on-surface-variant)] font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Get immediate feedback, rubrics & transcripts</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-[var(--color-on-surface-variant)] font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Join live employer recruitment campaigns</span>
                </div>
              </div>
            </div>

            <div className="pt-8 relative z-10">
              <button
                type="button"
                disabled={loadingRole !== null}
                onClick={() => handleChooseRole("candidate")}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 group-hover:scale-[1.01]"
              >
                {loadingRole === "candidate" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Setting Up...
                  </>
                ) : (
                  <>
                    Continue as Candidate
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SelectRolePage;
