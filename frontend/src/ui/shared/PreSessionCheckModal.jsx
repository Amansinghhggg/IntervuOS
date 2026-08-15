import React, { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Camera,
  Mic,
  Globe,
  Monitor,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  X,
  ShieldCheck,
  Clock,
  Briefcase,
  Layers,
  Sparkles,
  Play,
  RotateCcw
} from "lucide-react";
import api from "../../services/api";

export const PreSessionCheckModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLaunching = false,
  isMock = true,
  roleTitle = "Full Stack Engineer",
  experienceLevel = "Mid-Level",
  duration = 15,
  creditCost = 15,
  topics = []
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [agreed, setAgreed] = useState(false);

  // Live Hardware & Network Checks State
  const [checks, setChecks] = useState({
    camera: { status: "pending", error: null },
    mic: { status: "pending", error: null },
    browser: { status: "pending", error: null },
    internet: { status: "pending", error: null }
  });

  const performChecks = async () => {
    setChecks({
      camera: { status: "pending", error: null },
      mic: { status: "pending", error: null },
      browser: { status: "pending", error: null },
      internet: { status: "pending", error: null }
    });

    // 1. Internet Connection Check
    let isOnline = false;
    try {
      const { data } = await api.get("/health");
      isOnline = Boolean(data?.success);
    } catch {
      isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
    }
    setChecks((prev) => ({
      ...prev,
      internet: { status: isOnline ? "success" : "error", error: isOnline ? null : "No internet connection" }
    }));

    // 2. WebRTC & MediaDevices Browser Compatibility
    const isBrowserCompatible = typeof navigator !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia);
    setChecks((prev) => ({
      ...prev,
      browser: {
        status: isBrowserCompatible ? "success" : "error",
        error: isBrowserCompatible ? null : "WebRTC not supported in this browser"
      }
    }));

    // 3. Camera & Microphone Permission Checks
    if (isBrowserCompatible) {
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setChecks((prev) => ({ ...prev, camera: { status: "success", error: null } }));
        videoStream.getTracks().forEach((track) => track.stop());
      } catch (error) {
        setChecks((prev) => ({
          ...prev,
          camera: {
            status: "error",
            error: error.name === "NotFoundError" ? "No camera detected" : "Camera permission denied"
          }
        }));
      }

      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setChecks((prev) => ({ ...prev, mic: { status: "success", error: null } }));
        audioStream.getTracks().forEach((track) => track.stop());
      } catch (error) {
        setChecks((prev) => ({
          ...prev,
          mic: {
            status: "error",
            error: error.name === "NotFoundError" ? "No microphone detected" : "Microphone permission denied"
          }
        }));
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      performChecks();
      setAgreed(false);
    }
  }, [isOpen]);

  const allChecksPassed = Object.values(checks).every((c) => c.status === "success");
  const canStart = allChecksPassed && agreed && !isLaunching;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-['Inter'] overflow-y-auto">
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="w-full max-w-2xl bg-[var(--card,#16161E)] border border-[var(--border,#232330)] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 text-left relative my-auto max-h-[92vh] overflow-y-auto"
      >
        {/* Solid Single Primary Accent Bar (No Gradients) */}
        <div className="absolute top-0 inset-x-0 h-1 bg-[var(--primary,#5B3AF2)]" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)]/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)]/30 uppercase tracking-wider">
                {isMock ? "AI Mock Practice Studio" : "Official Candidate Assessment"}
              </span>
              <h2 className="text-base sm:text-lg font-medium text-[var(--text-primary,#FFFFFF)] mt-0.5">
                Hardware & Session Verification
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLaunching}
            className="text-[var(--text-secondary,#94A3B8)] hover:text-[var(--text-primary,#FFFFFF)] p-1.5 rounded-xl hover:bg-[var(--surface-hover,#1E1E2A)] transition-colors shrink-0 disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section 1: Explicit Role, Duration, Level & Cost Summary */}
        <div className="p-4 rounded-2xl bg-[var(--background,#0B0B0E)] border border-[var(--border,#232330)] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-[11px] text-[var(--text-secondary,#94A3B8)] block font-normal">Target role</span>
            <span className="font-medium text-[var(--text-primary,#FFFFFF)] truncate block mt-0.5">
              {roleTitle || "Software Engineer"}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-[var(--text-secondary,#94A3B8)] block font-normal">Experience level</span>
            <span className="font-medium text-[var(--text-primary,#FFFFFF)] block mt-0.5">
              {experienceLevel || "All Levels"}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-[var(--text-secondary,#94A3B8)] block font-normal">Session duration</span>
            <span className="font-medium text-[var(--text-primary,#FFFFFF)] block mt-0.5">
              {duration} Minutes
            </span>
          </div>

          <div>
            <span className="text-[11px] text-[var(--text-secondary,#94A3B8)] block font-normal">{isMock ? "Wallet credit cost" : "Access authorization"}</span>
            <span className="font-medium text-[var(--color-text-accent,#C4B5FD)] block mt-0.5">
              {isMock ? `${creditCost} Credits` : "Employer Sponsored"}
            </span>
          </div>
        </div>

        {/* Section 2: Real Hardware & Network Verification Grid */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--text-primary,#FFFFFF)]">
              Device & Network Readiness
            </span>
            <button
              type="button"
              onClick={performChecks}
              className="text-[11px] text-[var(--color-text-accent,#C4B5FD)] hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Re-check devices</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Camera */}
            <div className={`p-3 rounded-2xl border transition-all ${
              checks.camera.status === "success"
                ? "bg-[var(--background,#0B0B0E)] border-emerald-500/30"
                : checks.camera.status === "error"
                ? "bg-rose-500/10 border-rose-500/30"
                : "bg-[var(--background,#0B0B0E)] border-[var(--border,#232330)]"
            }`}>
              <div className="flex items-center justify-between mb-1.5">
                <Camera className={`w-4 h-4 ${checks.camera.status === "success" ? "text-emerald-400" : checks.camera.status === "error" ? "text-rose-400" : "text-[var(--text-secondary)]"}`} />
                {checks.camera.status === "success" ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : checks.camera.status === "error" ? (
                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                ) : (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--text-muted)]" />
                )}
              </div>
              <span className="text-xs font-medium text-[var(--text-primary)] block">Camera</span>
              <span className="text-[10px] text-[var(--text-secondary)] block truncate">
                {checks.camera.status === "success" ? "Ready" : checks.camera.status === "error" ? (checks.camera.error || "Blocked") : "Testing..."}
              </span>
            </div>

            {/* Microphone */}
            <div className={`p-3 rounded-2xl border transition-all ${
              checks.mic.status === "success"
                ? "bg-[var(--background,#0B0B0E)] border-emerald-500/30"
                : checks.mic.status === "error"
                ? "bg-rose-500/10 border-rose-500/30"
                : "bg-[var(--background,#0B0B0E)] border-[var(--border,#232330)]"
            }`}>
              <div className="flex items-center justify-between mb-1.5">
                <Mic className={`w-4 h-4 ${checks.mic.status === "success" ? "text-emerald-400" : checks.mic.status === "error" ? "text-rose-400" : "text-[var(--text-secondary)]"}`} />
                {checks.mic.status === "success" ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : checks.mic.status === "error" ? (
                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                ) : (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--text-muted)]" />
                )}
              </div>
              <span className="text-xs font-medium text-[var(--text-primary)] block">Microphone</span>
              <span className="text-[10px] text-[var(--text-secondary)] block truncate">
                {checks.mic.status === "success" ? "Ready" : checks.mic.status === "error" ? (checks.mic.error || "Blocked") : "Testing..."}
              </span>
            </div>

            {/* Internet */}
            <div className={`p-3 rounded-2xl border transition-all ${
              checks.internet.status === "success"
                ? "bg-[var(--background,#0B0B0E)] border-emerald-500/30"
                : checks.internet.status === "error"
                ? "bg-rose-500/10 border-rose-500/30"
                : "bg-[var(--background,#0B0B0E)] border-[var(--border,#232330)]"
            }`}>
              <div className="flex items-center justify-between mb-1.5">
                <Globe className={`w-4 h-4 ${checks.internet.status === "success" ? "text-emerald-400" : checks.internet.status === "error" ? "text-rose-400" : "text-[var(--text-secondary)]"}`} />
                {checks.internet.status === "success" ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : checks.internet.status === "error" ? (
                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                ) : (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--text-muted)]" />
                )}
              </div>
              <span className="text-xs font-medium text-[var(--text-primary)] block">Network</span>
              <span className="text-[10px] text-[var(--text-secondary)] block truncate">
                {checks.internet.status === "success" ? "Connected" : "Offline"}
              </span>
            </div>

            {/* Browser WebRTC */}
            <div className={`p-3 rounded-2xl border transition-all ${
              checks.browser.status === "success"
                ? "bg-[var(--background,#0B0B0E)] border-emerald-500/30"
                : checks.browser.status === "error"
                ? "bg-rose-500/10 border-rose-500/30"
                : "bg-[var(--background,#0B0B0E)] border-[var(--border,#232330)]"
            }`}>
              <div className="flex items-center justify-between mb-1.5">
                <Monitor className={`w-4 h-4 ${checks.browser.status === "success" ? "text-emerald-400" : checks.browser.status === "error" ? "text-rose-400" : "text-[var(--text-secondary)]"}`} />
                {checks.browser.status === "success" ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : checks.browser.status === "error" ? (
                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                ) : (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--text-muted)]" />
                )}
              </div>
              <span className="text-xs font-medium text-[var(--text-primary)] block">Browser</span>
              <span className="text-[10px] text-[var(--text-secondary)] block truncate">
                {checks.browser.status === "success" ? "Compatible" : "Unsupported"}
              </span>
            </div>
          </div>

          {!allChecksPassed && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Please grant browser camera & mic permissions. The launch button will unlock once devices are verified.
              </p>
            </div>
          )}
        </div>

        {/* Section 3: Consolidated Privacy & Recording Disclosure */}
        <div className="space-y-2.5">
          <span className="text-xs font-medium text-[var(--text-primary,#FFFFFF)]">
            Privacy & Evaluation Terms
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-3 rounded-2xl bg-[var(--background,#0B0B0E)] border border-[var(--border,#232330)] space-y-1">
              <span className="font-medium text-[var(--text-primary,#FFFFFF)] block">Audio & video capture</span>
              <p className="text-[11px] text-[var(--text-secondary,#94A3B8)] leading-tight font-normal">
                Audio and camera feed are processed in real time for STAR response scoring and transcript generation.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[var(--background,#0B0B0E)] border border-[var(--border,#232330)] space-y-1">
              <span className="font-medium text-[var(--text-primary,#FFFFFF)] block">Storage & retention</span>
              <p className="text-[11px] text-[var(--text-secondary,#94A3B8)] leading-tight font-normal">
                Encrypted transcripts and scores are retained for 30 days. You may delete session records anytime from your reports.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[var(--background,#0B0B0E)] border border-[var(--border,#232330)] space-y-1">
              <span className="font-medium text-[var(--text-primary,#FFFFFF)] block">
                {isMock ? "100% private AI review" : "Recruiter evaluation"}
              </span>
              <p className="text-[11px] text-[var(--text-secondary,#94A3B8)] leading-tight font-normal">
                {isMock
                  ? "Mock interviews are strictly private. No employer or third party has access to your practice responses."
                  : "Assigned interviews are reviewed only by the authorized hiring team managing this specific job campaign."}
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Single Consent Checkbox */}
        <div className="p-3.5 rounded-2xl bg-[var(--primary-tint,rgba(99,56,246,0.08))] border border-[var(--color-border-active,#6338F6)]/30">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              disabled={isLaunching}
              className="mt-0.5 w-4 h-4 rounded border-[var(--border)] bg-[var(--card)] text-[var(--primary,#5B3AF2)] focus:ring-[var(--color-border-active,#6338F6)] cursor-pointer"
            />
            <span className="text-xs text-[var(--text-primary,#FFFFFF)] leading-relaxed font-normal">
              I acknowledge that this session will record my audio and webcam responses for AI evaluation, and I agree to the session terms.
            </span>
          </label>
        </div>

        {/* Section 5: Modal Actions (Single Solid Primary CTA) */}
        <div className="flex items-center gap-3 pt-2 border-t border-[var(--border,#232330)]">
          <button
            type="button"
            onClick={onClose}
            disabled={isLaunching}
            className="w-1/3 py-3 px-4 rounded-xl border border-[var(--border,#232330)] text-[var(--text-secondary,#94A3B8)] hover:text-[var(--text-primary,#FFFFFF)] hover:bg-[var(--surface-hover,#1E1E2A)] text-xs font-medium transition-colors disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[var(--color-border-active,#6338F6)] focus-visible:outline-none"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={!canStart}
            className="w-2/3 py-3 px-4 rounded-xl bg-[var(--primary,#5B3AF2)] hover:bg-[var(--primary-hover,#472CD7)] active:scale-[0.99] text-white text-xs font-medium transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-[var(--color-border-active,#6338F6)] focus-visible:outline-none"
          >
            {isLaunching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Initializing Interview...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>
                  {isMock
                    ? `Begin Interview Session (${duration} Mins)`
                    : "Begin Candidate Interview Session"}
                </span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PreSessionCheckModal;
