import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import {
  Building2,
  UserRound,
  Sparkles,
  CheckCircle2,
  Loader2,
  ArrowRight,
  LogOut,
  ShieldCheck
} from "lucide-react";
import { motion } from "framer-motion";

const SelectRolePage = () => {
  const { user, selectRole, logout } = useAuth();
  const navigate = useNavigate();
  const [loadingRole, setLoadingRole] = useState(null); // 'employer' | 'candidate' | null
  const [loggingOut, setLoggingOut] = useState(false);

  // If user is not logged in, send to landing home
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // If user already has a role assigned, redirect to their home page
  const getRoleRoute = (role) => {
    if (role === "admin") return "/admin";
    if (role === "employer") return "/employer/dashboard";
    return "/candidate/mock-interview";
  };

  if (user.role) {
    return <Navigate to={getRoleRoute(user.role)} replace />;
  }

  const handleChooseRole = async (chosenRole) => {
    setLoadingRole(chosenRole);
    try {
      await selectRole(chosenRole);
      toast.success(`Welcome! Account configured as ${chosenRole === "employer" ? "Employer" : "Candidate"}.`);
      navigate(getRoleRoute(chosenRole));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to set role. Please try again.");
    } finally {
      setLoadingRole(null);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Logout failed. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between relative bg-[var(--background)] font-['Inter'] p-4 sm:p-6 md:p-10 text-[var(--text-primary)]">

      {/* Top Navbar with Logout Action */}
      <div className="w-full max-w-5xl flex items-center justify-between py-2 border-b border-[var(--border)]/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--primary)] flex items-center justify-center font-bold text-sm">
            IV
          </div>
          <span className="font-medium text-sm tracking-tight text-[var(--text-primary)]">
            IntervuOS
          </span>
        </div>

        <button
          onClick={handleLogout}
          disabled={loggingOut || loadingRole !== null}
          className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:text-rose-400 hover:bg-rose-500/10 border border-[var(--border)] hover:border-rose-500/30 inline-flex items-center gap-1.5 transition-colors duration-150 disabled:opacity-50"
        >
          {loggingOut ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <LogOut className="w-3.5 h-3.5" />
          )}
          <span>Log out</span>
        </button>
      </div>

      {/* Main Role Selection Content */}
      <div className="w-full max-w-4xl py-10 space-y-8 my-auto">

        {/* Header */}
        <div className="text-center space-y-2.5 max-w-lg mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--primary-tint,rgba(99,56,246,0.15))] border border-[var(--primary)]/30 text-[var(--color-text-accent,#C4B5FD)] text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Account Onboarding</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--text-primary)]">
            Select your account type
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            Signed in as <strong className="text-[var(--text-primary)] font-medium">{user.email || user.name}</strong>. Choose how you intend to use IntervuOS.
          </p>
        </div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">

          {/* Card 1: Employer */}
          <div className="bg-[var(--card)] border border-[var(--border)] hover:border-[var(--color-border-active,#6338F6)] transition-all duration-150 rounded-2xl p-6 sm:p-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-11 h-11 rounded-xl bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--primary)] flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium text-[var(--text-primary)]">Employer & Recruiter</h3>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                  Hire technical talent with automated AI interviews, candidate evaluation pipelines, and scorecards.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-[var(--border)] text-xs text-[var(--text-secondary)]">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Create & publish AI technical interview campaigns</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Invite candidates via link, email, or bulk CSV</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Automated AI rubrics & detailed candidate rankings</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                disabled={loadingRole !== null || loggingOut}
                onClick={() => handleChooseRole("employer")}
                className="w-full py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] active:scale-[0.99] text-white rounded-xl text-xs font-medium transition-all duration-150 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {loadingRole === "employer" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Setting up workspace...</span>
                  </>
                ) : (
                  <>
                    <span>Continue as Employer</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Card 2: Candidate */}
          <div className="bg-[var(--card)] border border-[var(--border)] hover:border-emerald-500/50 transition-all duration-150 rounded-2xl p-6 sm:p-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <UserRound className="w-6 h-6" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium text-[var(--text-primary)]">Candidate & Job Seeker</h3>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                  Practice with adaptive 24/7 AI mock interviews, sharpen technical problem solving, and join campaigns.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-[var(--border)] text-xs text-[var(--text-secondary)]">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>24/7 real-time voice & coding mock interviews</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Instant question-by-question AI assessment reports</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Participate in employer recruitment campaigns</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                disabled={loadingRole !== null || loggingOut}
                onClick={() => handleChooseRole("candidate")}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white rounded-xl text-xs font-medium transition-all duration-150 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {loadingRole === "candidate" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Setting up workspace...</span>
                  </>
                ) : (
                  <>
                    <span>Continue as Candidate</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* Bottom helper text */}
        <div className="text-center">
          <p className="text-xs text-[var(--text-muted)]">
            Signed into the wrong account?{" "}
            <button
              onClick={handleLogout}
              disabled={loggingOut || loadingRole !== null}
              className="text-[var(--color-text-accent,#C4B5FD)] hover:underline font-medium ml-1"
            >
              Sign out and switch account
            </button>
          </p>
        </div>

      </div>

      {/* Footer */}
      <div className="w-full max-w-5xl text-center py-2 text-[11px] text-[var(--text-muted)]">
        IntervuOS AI Interviewing Platform
      </div>

    </div>
  );
};

export default SelectRolePage;
