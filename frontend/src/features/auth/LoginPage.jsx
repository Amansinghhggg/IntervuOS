import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Loader2,
  ArrowRight,
  GraduationCap,
  Building2,
  Bot
} from "lucide-react";

export default function LoginPage() {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const getRedirectRoute = (role) => {
    if (location.state?.from) return location.state.from;
    if (!role) return "/select-role";
    return role === "employer" ? "/employer/dashboard" : "/candidate/mock-interview";
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse.credential) return;
    setIsLoading(true);
    try {
      const data = await googleLogin(credentialResponse.credential);
      toast.success(`Welcome to IntervuOS, ${data.user.name || "User"}!`);
      navigate(getRedirectRoute(data.user.role), { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || "Google authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[var(--color-canvas)] text-[var(--color-text-primary)] font-['Inter'] flex flex-col justify-between p-4 sm:p-6 md:p-10">

      {/* Top Header */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-[var(--color-primary)] text-white flex items-center justify-center font-bold text-sm shadow-xs">
            IO
          </div>
          <span className="text-base font-medium tracking-tight text-[var(--color-text-primary)]">
            Intervu<span className="text-[var(--color-text-accent)]">OS</span>
          </span>
        </Link>

        <Link
          to="/"
          className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors flex items-center gap-1 font-medium"
        >
          <span>Back to Home</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Main Authentication Container */}
      <main className="w-full max-w-4xl mx-auto my-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 sm:p-10 shadow-xs">

          {/* Left Column: Product Value Points (7 cols) */}
          <div className="md:col-span-7 space-y-6 md:pr-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)]/30 text-xs font-medium">
                <Sparkles className="w-3 h-3" />
                <span>AI-Powered Autonomous Interview Platform</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--color-text-primary)] leading-snug">
                One unified account for candidate practice and employer hiring.
              </h1>
              <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed font-normal">
                Sign in with your Google account to access adaptive AI voice mock interviews, STAR competency diagnostic reports, or manage your organization's recruitment campaigns.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-3 pt-2 border-t border-[var(--color-border)] text-xs text-[var(--color-text-secondary)]">
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-3 h-3" />
                </div>
                <span><strong>Candidates:</strong> 15 free practice credits on first signup with instant STAR scoring.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-md bg-[var(--primary-tint)] text-[var(--color-text-accent)] border border-[var(--color-border-active)]/30 flex items-center justify-center shrink-0">
                  <Building2 className="w-3 h-3" />
                </div>
                <span><strong>Employers:</strong> Automated technical screenings, full video replays, and custom rubrics.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-3 h-3" />
                </div>
                <span><strong>Security:</strong> 256-bit encrypted data with strict candidate privacy protection.</span>
              </div>
            </div>
          </div>

          {/* Right Column: Google 1-Click Authentication Box (5 cols) */}
          <div className="md:col-span-5 bg-[var(--color-canvas)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 space-y-6 flex flex-col items-center justify-center text-center shadow-xs">
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[var(--primary-tint)] text-[var(--color-text-accent)] border border-[var(--color-border-active)]/30 flex items-center justify-center mx-auto shadow-xs">
                <Bot className="w-6 h-6" />
              </div>
              <h2 className="text-base sm:text-lg font-medium text-[var(--color-text-primary)] tracking-tight">
                Sign in to IntervuOS
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)] font-normal max-w-xs">
                Continue instantly with Google to get started in seconds.
              </p>
            </div>

            {/* Google Authentication Component */}
            <div className="w-full flex flex-col items-center justify-center pt-2">
              {isLoading ? (
                <div className="py-4 flex flex-col items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                  <Loader2 className="w-6 h-6 animate-spin text-[var(--color-primary)]" />
                  <span>Verifying Google account...</span>
                </div>
              ) : (
                <div className="w-full flex justify-center scale-105">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => toast.error("Google Sign-In was cancelled or encountered an error.")}
                    theme="filled_blue"
                    size="large"
                    shape="pill"
                    text="continue_with"
                    width="260"
                  />
                </div>
              )}
            </div>

            {/* Security Guarantee Note */}
            <div className="pt-4 border-t border-[var(--color-border)] text-[11px] text-[var(--color-text-muted)] space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-[var(--color-text-secondary)]">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>Fast, secure single sign-on</span>
              </div>
              <p>
                By signing in, you agree to IntervuOS's terms of service and privacy policy.
              </p>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto text-center text-[11px] text-[var(--color-text-muted)] pt-6">
        © 2026 IntervuOS. All rights reserved. • Protected with 256-bit SSL encryption.
      </footer>

    </div>
  );
}
