import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, AlertCircle, CheckCircle2, HelpCircle, X, Loader2 } from "lucide-react";

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm action",
  description = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary", // 'primary' | 'danger' | 'warning' | 'success'
  isLoading = false,
  icon: CustomIcon,
}) => {
  if (!isOpen) return null;

  const variantConfig = {
    danger: {
      icon: CustomIcon || AlertTriangle,
      iconBg: "bg-[var(--color-danger)]/10 text-[var(--color-danger)] border-[var(--color-danger)]/30",
      buttonBg: "bg-[var(--color-danger)] hover:bg-[var(--color-danger)]/90 text-white shadow-lg shadow-[var(--color-danger)]/20",
    },
    warning: {
      icon: CustomIcon || AlertCircle,
      iconBg: "bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/30",
      buttonBg: "bg-[var(--color-warning)] hover:bg-[var(--color-warning)]/90 text-black shadow-lg shadow-[var(--color-warning)]/20",
    },
    success: {
      icon: CustomIcon || CheckCircle2,
      iconBg: "bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/30",
      buttonBg: "bg-[var(--color-success)] hover:bg-[var(--color-success)]/90 text-white shadow-lg shadow-[var(--color-success)]/20",
    },
    primary: {
      icon: CustomIcon || HelpCircle,
      iconBg: "bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border-[var(--color-border-active,#6338F6)]/30",
      buttonBg: "bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white shadow-lg shadow-[var(--color-primary)]/30",
    },
  };

  const currentVariant = variantConfig[variant] || variantConfig.primary;
  const IconComponent = currentVariant.icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={!isLoading ? onClose : undefined}
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-2xl space-y-5 text-[var(--color-text-primary)] font-['Inter']"
        >
          {/* Header row */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${currentVariant.iconBg}`}
              >
                <IconComponent className="w-5 h-5" />
              </div>
              <h3 className="text-base font-medium tracking-tight text-[var(--color-text-primary)]">
                {title}
              </h3>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover,#1E1E2A)] transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Description */}
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-normal">
            {description}
          </p>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-[var(--color-canvas)] border border-[var(--color-border)] transition-colors disabled:opacity-40"
            >
              {cancelText}
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-5 py-2 rounded-xl text-xs font-medium tracking-tight transition-all flex items-center justify-center gap-2 ${currentVariant.buttonBg} disabled:opacity-50`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>{confirmText}</span>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmationModal;
