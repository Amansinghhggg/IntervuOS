import React from "react";

export const StatusBadge = ({
  status,
  size = "md", // 'sm' | 'md' | 'lg'
  customLabel,
  className = "",
}) => {
  const getStatusConfig = (val) => {
    const s = String(val || "").toLowerCase();

    if (
      s === "completed" ||
      s === "strong_hire" ||
      s === "strong hire" ||
      s === "ready" ||
      s === "pass" ||
      s === "verified"
    ) {
      return {
        label: customLabel || "Completed",
        styles:
          "bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/30",
      };
    }
    if (
      s === "in-progress" ||
      s === "in progress" ||
      s === "hire" ||
      s === "active" ||
      s === "requested"
    ) {
      return {
        label:
          customLabel ||
          (s === "active"
            ? "Active"
            : s === "requested"
            ? "Requested"
            : "In progress"),
        styles:
          "bg-[var(--color-info-tint,rgba(59,130,246,0.15))] text-[var(--color-info,#3B82F6)] border-[var(--color-info,#3B82F6)]/30",
      };
    }
    if (
      s === "failed" ||
      s === "expired" ||
      s === "no_hire" ||
      s === "no hire" ||
      s === "missed" ||
      s === "rejected" ||
      s === "inactive"
    ) {
      return {
        label:
          customLabel ||
          (s === "inactive"
            ? "Inactive"
            : s === "rejected"
            ? "Rejected"
            : "Failed"),
        styles:
          "bg-[var(--color-danger)]/10 text-[var(--color-danger)] border-[var(--color-danger)]/30",
      };
    }
    if (s === "pending" || s === "waiting" || s === "borderline") {
      return {
        label: customLabel || "Pending",
        styles:
          "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)]",
      };
    }
    return {
      label: customLabel || val || "Unknown",
      styles:
        "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)]",
    };
  };

  const config = getStatusConfig(status);

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-xs",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium tracking-tight rounded-full border ${
        sizeStyles[size] || sizeStyles.md
      } ${config.styles} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 shrink-0" />
      <span>{config.label}</span>
    </span>
  );
};

export default StatusBadge;
