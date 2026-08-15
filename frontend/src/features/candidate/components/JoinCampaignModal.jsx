import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Key, ArrowRight, Loader2, X, ShieldCheck, Sparkles, Building2 } from "lucide-react";
import api from "../../../services/api";
import toast from "react-hot-toast";

export const JoinCampaignModal = ({ isOpen, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleJoin = async (e) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      toast.error("Please enter an interview access code");
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await api.post("/interviews/join", {
        interviewCode: cleanCode,
      });

      if (data.success) {
        setCode("");
        if (data.interview?.status === "Requested") {
          toast.success(
            data.interview.message || "Join request sent! Awaiting employer approval."
          );
          if (onSuccess) onSuccess();
          onClose();
          navigate("/candidate/dashboard");
        } else {
          toast.success("Successfully joined the interview campaign!");
          if (onSuccess) onSuccess();
          onClose();
          navigate(`/candidate/interviews/${data.interview._id}`);
        }
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Invalid or expired interview code. Please check with your recruiter."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-['Inter']">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        className="w-full max-w-md bg-[var(--card,#16161E)] border border-[var(--border,#232330)] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-left relative overflow-hidden"
      >
        {/* Top Accent Line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-[var(--primary,#5B3AF2)]" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)]/30 flex items-center justify-center shrink-0">
              <Key className="w-5 h-5 text-[var(--color-text-accent,#C4B5FD)]" />
            </div>
            <div>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] uppercase tracking-wider">
                Employer Assessment
              </span>
              <h2 className="text-base sm:text-lg font-medium text-[var(--text-primary,#FFFFFF)] mt-0.5">
                Join with Access Code
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              setCode("");
              onClose();
            }}
            className="text-[var(--text-secondary,#94A3B8)] hover:text-[var(--text-primary,#FFFFFF)] p-1.5 rounded-xl hover:bg-[var(--surface-hover,#1E1E2A)] transition-colors shrink-0"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[var(--text-secondary,#94A3B8)] leading-relaxed font-normal">
          Enter the unique 6 to 8 character campaign key shared by your recruiter or employer invitation email.
        </p>

        {/* Form */}
        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-[var(--text-secondary,#94A3B8)] mb-1.5">
              Campaign Access Key
            </label>
            <div className="relative">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="E.G. ENG-789X"
                autoFocus
                autoComplete="off"
                spellCheck="false"
                maxLength={20}
                className="w-full px-4 py-3 bg-[var(--background,#0B0B0E)] border border-[var(--border,#232330)] rounded-xl text-center text-base sm:text-lg font-mono tracking-[0.2em] uppercase text-[var(--text-primary,#FFFFFF)] placeholder:text-[var(--text-muted,#6E7A8A)] focus:border-[var(--color-border-active,#6338F6)] focus:ring-2 focus:ring-[var(--color-border-active,#6338F6)] transition-all outline-none"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[var(--background,#0B0B0E)] border border-[var(--border,#232330)] flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-[11px] text-[var(--text-secondary,#94A3B8)] leading-snug">
              Verified sessions will link automatically to your Candidate Dashboard.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                setCode("");
                onClose();
              }}
              className="w-1/3 py-2.5 px-4 rounded-xl border border-[var(--border,#232330)] text-[var(--text-secondary,#94A3B8)] hover:text-[var(--text-primary,#FFFFFF)] hover:bg-[var(--surface-hover,#1E1E2A)] text-xs font-medium transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading || !code.trim()}
              className="w-2/3 py-2.5 px-4 rounded-xl bg-[var(--primary,#5B3AF2)] hover:bg-[var(--primary-hover,#472CD7)] text-white text-xs font-medium transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Key...</span>
                </>
              ) : (
                <>
                  <span>Join Campaign</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default JoinCampaignModal;
