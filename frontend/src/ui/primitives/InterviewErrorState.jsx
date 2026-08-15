import React from "react";
import {
  CameraOff,
  MicOff,
  WifiOff,
  Clock,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  ShieldCheck
} from "lucide-react";
import { motion } from "framer-motion";

export const ERROR_TYPES = {
  PERMISSION_DENIED: "PERMISSION_DENIED",
  AI_TIMEOUT: "AI_TIMEOUT",
  NETWORK_DROP: "NETWORK_DROP",
  SESSION_ERROR: "SESSION_ERROR"
};

export const InterviewErrorState = ({
  type = ERROR_TYPES.SESSION_ERROR,
  title,
  message,
  onRetry,
  onExit,
  isRetrying = false
}) => {
  const getErrorConfig = () => {
    switch (type) {
      case ERROR_TYPES.PERMISSION_DENIED:
        return {
          icon: CameraOff,
          iconBg: "bg-rose-500/10 text-rose-400 border-rose-500/20",
          defaultTitle: "Camera or Microphone Access Blocked",
          defaultMessage:
            "Your browser or operating system has blocked camera/microphone access. Please click the lock or camera icon in your browser address bar, set permissions to 'Allow', and click retry below.",
          reassurance: "No interview session was started or penalized. Your credits remain untouched."
        };
      case ERROR_TYPES.AI_TIMEOUT:
        return {
          icon: Clock,
          iconBg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
          defaultTitle: "AI Evaluation Engine Timed Out",
          defaultMessage:
            "We experienced a temporary delay communicating with the Gemini AI synthesis engine. This is usually temporary and resolves in a few seconds.",
          reassurance: "Your answer and progress were saved locally. No credits were deducted for failed turns."
        };
      case ERROR_TYPES.NETWORK_DROP:
        return {
          icon: WifiOff,
          iconBg: "bg-rose-500/10 text-rose-400 border-rose-500/20",
          defaultTitle: "Internet Connection Lost",
          defaultMessage:
            "We detected an interruption in your network connection during the live session. Please verify your Wi-Fi or mobile data connection.",
          reassurance: "Your session state is safely cached. You can resume as soon as connection is restored."
        };
      default:
        return {
          icon: AlertTriangle,
          iconBg: "bg-rose-500/10 text-rose-400 border-rose-500/20",
          defaultTitle: "Session Interrupted",
          defaultMessage:
            "An unexpected error occurred during the interview session. Please attempt to reconnect.",
          reassurance: "No penalty was recorded on your evaluation record."
        };
    }
  };

  const config = getErrorConfig();
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-['Inter']">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-lg bg-[var(--card,#16161E)] border border-[var(--border,#232330)] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center relative overflow-hidden"
      >
        {/* Top Accent Line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-indigo-500" />

        {/* Icon */}
        <div className={`w-14 h-14 rounded-2xl ${config.iconBg} border flex items-center justify-center mx-auto`}>
          <Icon className="w-7 h-7" />
        </div>

        {/* Title & Message */}
        <div className="space-y-2">
          <h2 className="text-lg sm:text-xl font-medium tracking-tight text-[var(--text-primary,#FFFFFF)]">
            {title || config.defaultTitle}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary,#94A3B8)] font-normal leading-relaxed">
            {message || config.defaultMessage}
          </p>
        </div>

        {/* Reassurance Callout */}
        <div className="p-3.5 rounded-xl bg-[var(--background,#0B0B0E)] border border-[var(--border,#232330)] flex items-center gap-2.5 text-left">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-[11px] text-[var(--text-secondary,#94A3B8)] font-normal">
            {config.reassurance}
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {onExit && (
            <button
              onClick={onExit}
              className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl border border-[var(--border,#232330)] text-[var(--text-secondary,#94A3B8)] hover:text-[var(--text-primary,#FFFFFF)] hover:bg-[var(--surface-hover,#1E1E2A)] text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Exit to Dashboard</span>
            </button>
          )}

          {onRetry && (
            <button
              onClick={onRetry}
              disabled={isRetrying}
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-[var(--primary,#5B3AF2)] hover:bg-[var(--primary-hover,#472CD7)] text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? "animate-spin" : ""}`} />
              <span>{isRetrying ? "Retrying..." : "Retry & Reconnect"}</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default InterviewErrorState;
