import React, { useState } from "react";
import {
  ShieldCheck,
  Video,
  Mic,
  Lock,
  Clock,
  Eye,
  CheckCircle2,
  X,
  Sparkles,
  Building2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const PreLaunchDisclosureModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLaunching = false,
  isMock = true,
  roleTitle = "Software Engineer",
  duration = 15,
  creditCost = 15
}) => {
  const [hasAcknowledged, setHasAcknowledged] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-['Inter']">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        className="w-full max-w-lg bg-[var(--card,#16161E)] border border-[var(--border,#232330)] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-left relative overflow-hidden"
      >
        {/* Top Accent Line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-[var(--primary,#5B3AF2)]" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)]/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-[var(--color-text-accent,#C4B5FD)]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] uppercase tracking-wider">
                  {isMock ? "Practice Session Disclosure" : "Official Candidate Assessment"}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-medium text-[var(--text-primary,#FFFFFF)] mt-0.5">
                Session Transparency & Privacy Terms
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[var(--text-secondary,#94A3B8)] hover:text-[var(--text-primary,#FFFFFF)] p-1.5 rounded-xl hover:bg-[var(--surface-hover,#1E1E2A)] transition-colors shrink-0"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Key Disclosures Grid */}
        <div className="space-y-2.5 text-xs">
          {/* Item 1: Audio/Video */}
          <div className="p-3 rounded-2xl bg-[var(--background,#0B0B0E)] border border-[var(--border,#232330)] flex items-start gap-3">
            <div className="p-2 rounded-xl bg-[var(--card,#16161E)] border border-[var(--border,#232330)] text-[var(--color-text-accent,#C4B5FD)] shrink-0 mt-0.5">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <p className="font-medium text-[var(--text-primary,#FFFFFF)]">
                Audio & Video Processing
              </p>
              <p className="text-[11px] text-[var(--text-secondary,#94A3B8)] font-normal mt-0.5 leading-relaxed">
                Microphone audio is transcribed in real time for STAR technical assessment. Camera feed is used locally for session presence.
              </p>
            </div>
          </div>

          {/* Item 2: Retention */}
          <div className="p-3 rounded-2xl bg-[var(--background,#0B0B0E)] border border-[var(--border,#232330)] flex items-start gap-3">
            <div className="p-2 rounded-xl bg-[var(--card,#16161E)] border border-[var(--border,#232330)] text-[var(--color-text-accent,#C4B5FD)] shrink-0 mt-0.5">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="font-medium text-[var(--text-primary,#FFFFFF)]">
                Storage & Retention (30 Days)
              </p>
              <p className="text-[11px] text-[var(--text-secondary,#94A3B8)] font-normal mt-0.5 leading-relaxed">
                Evaluations and transcripts are stored encrypted in your private account for 30 days. You can download PDF reports or delete records anytime.
              </p>
            </div>
          </div>

          {/* Item 3: Human Review vs AI-Only */}
          <div className="p-3 rounded-2xl bg-[var(--background,#0B0B0E)] border border-[var(--border,#232330)] flex items-start gap-3">
            <div className="p-2 rounded-xl bg-[var(--card,#16161E)] border border-[var(--border,#232330)] text-[var(--color-text-accent,#C4B5FD)] shrink-0 mt-0.5">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <p className="font-medium text-[var(--text-primary,#FFFFFF)]">
                {isMock ? "100% Private AI Evaluation" : "Hiring Team Evaluation Only"}
              </p>
              <p className="text-[11px] text-[var(--text-secondary,#94A3B8)] font-normal mt-0.5 leading-relaxed">
                {isMock
                  ? "Practice sessions are completely private. No recruiter or human reviewer has access to your mock interview results."
                  : "Results are submitted strictly to the authorized employer hiring committee managing this campaign."}
              </p>
            </div>
          </div>
        </div>

        {/* Explicit Checkbox Acknowledgment */}
        <label className="flex items-start gap-3 p-3 rounded-2xl bg-[var(--primary-tint,rgba(99,56,246,0.15))] border border-[var(--color-border-active,#6338F6)]/30 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={hasAcknowledged}
            onChange={(e) => setHasAcknowledged(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-[var(--border,#232330)] bg-[var(--card,#16161E)] text-[var(--primary,#5B3AF2)] focus:ring-[var(--color-border-active,#6338F6)] focus:ring-offset-0 cursor-pointer"
          />
          <span className="text-xs text-[var(--text-primary,#FFFFFF)] font-normal leading-relaxed">
            I acknowledge the audio transcription, 30-day retention policy, and {isMock ? "private AI-only evaluation" : "employer review terms"} for this {duration}-minute session.
          </span>
        </label>

        {/* Modal Action Buttons */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="w-1/3 py-2.5 px-4 rounded-xl border border-[var(--border,#232330)] text-[var(--text-secondary,#94A3B8)] hover:text-[var(--text-primary,#FFFFFF)] hover:bg-[var(--surface-hover,#1E1E2A)] text-xs font-medium transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={!hasAcknowledged || isLaunching}
            className="w-2/3 py-2.5 px-4 rounded-xl bg-[var(--primary,#5B3AF2)] hover:bg-[var(--primary-hover,#472CD7)] text-white text-xs font-medium transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isLaunching ? "Launching..." : `Agree & Start Session (${creditCost} Credits)`}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PreLaunchDisclosureModal;
