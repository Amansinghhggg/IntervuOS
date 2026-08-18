import React from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Coins,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  X,
  CreditCard,
  ShieldCheck
} from "lucide-react";

export const InsufficientCreditsModal = ({
  isOpen,
  onClose,
  requiredCredits = 15,
  availableCredits = 0,
  onSelectPlan
}) => {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  if (!isOpen) return null;

  const quickPacks = [
    {
      id: "bundle_starter",
      title: "Starter Pack",
      credits: 45,
      price: 99,
      rate: "₹2.20/cr"
    },
    {
      id: "bundle_pro",
      title: "Pro Pack (Recommended)",
      credits: 150,
      price: 259, // +30% from ₹199
      rate: "₹1.73/cr",
      popular: true
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-['Inter']">
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-lg bg-[var(--card,#16161E)] border border-[var(--border,#232330)] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-left relative overflow-hidden"
      >
        {/* Top Accent Line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-[var(--color-warning,#F59E0B)]" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                Insufficient Wallet Balance
              </span>
              <h2 className="text-base sm:text-lg font-medium text-[var(--text-primary,#FFFFFF)] mt-0.5">
                Top Up Practice Credits
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

        {/* Balance Comparison Bar */}
        <div className="p-3.5 rounded-2xl bg-[var(--background,#0B0B0E)] border border-[var(--border,#232330)] grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-[11px] text-[var(--text-secondary,#94A3B8)] block">Available in Wallet</span>
            <span className="text-base font-medium text-[var(--color-text-accent,#C4B5FD)]">
              {availableCredits} Credits
            </span>
          </div>
          <div>
            <span className="text-[11px] text-[var(--text-secondary,#94A3B8)] block">Required for Session</span>
            <span className="text-base font-medium text-amber-400">
              {requiredCredits} Credits
            </span>
          </div>
        </div>

        {/* Quick Top-Up Options */}
        <div className="space-y-2.5">
          <span className="text-[11px] font-medium text-[var(--text-secondary,#94A3B8)] block">
            Quick Top-Up Packs
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {quickPacks.map((pack) => (
              <div
                key={pack.id}
                className={`p-3.5 rounded-2xl bg-[var(--background,#0B0B0E)] border transition-all text-left flex flex-col justify-between space-y-2.5 ${
                  pack.popular
                    ? "border-[var(--color-border-active,#6338F6)] bg-[var(--primary-tint,rgba(99,56,246,0.08))]"
                    : "border-[var(--border,#232330)]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[var(--text-primary,#FFFFFF)]">{pack.title}</span>
                    {pack.popular && (
                      <span className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)]">
                        Best Value
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-lg font-medium text-[var(--text-primary,#FFFFFF)]">₹{pack.price}</span>
                    <span className="text-[11px] text-[var(--text-secondary,#94A3B8)]">for {pack.credits} cr</span>
                    <span className="text-[10px] text-[var(--color-text-accent,#C4B5FD)] ml-auto">{pack.rate}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    if (onSelectPlan) {
                      onSelectPlan(pack);
                    } else {
                      navigate("/candidate/subscriptions");
                    }
                  }}
                  className="w-full py-1.5 px-3 rounded-xl bg-[var(--primary-tint,rgba(99,56,246,0.15))] hover:bg-[var(--primary-tint)]/80 text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)]/40 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[var(--color-border-active,#6338F6)] focus-visible:outline-none"
                >
                  <span>Select Pack</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center gap-3 pt-2 border-t border-[var(--border,#232330)]">
          <button
            type="button"
            onClick={onClose}
            className="w-1/3 py-2.5 px-4 rounded-xl border border-[var(--border,#232330)] text-[var(--text-secondary,#94A3B8)] hover:text-[var(--text-primary,#FFFFFF)] hover:bg-[var(--surface-hover,#1E1E2A)] text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[var(--color-border-active,#6338F6)] focus-visible:outline-none"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              navigate("/candidate/subscriptions");
            }}
            className="w-2/3 py-2.5 px-4 rounded-xl bg-[var(--primary,#5B3AF2)] hover:bg-[var(--primary-hover,#472CD7)] text-white text-xs font-medium transition-all shadow-sm flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-[var(--color-border-active,#6338F6)] focus-visible:outline-none"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>View All Subscriptions & Slider</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default InsufficientCreditsModal;
