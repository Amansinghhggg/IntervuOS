import React from "react";
import { motion } from "framer-motion";

export const MetricCard = ({
  icon: Icon,
  label,
  value,
  subtext,
  badgeText,
  trend,
  className = "",
}) => {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={`bg-[var(--card,#16161E)] border border-[var(--border,#232330)] p-4 sm:p-5 rounded-2xl relative overflow-hidden transition-all hover:border-[var(--color-border-active,#6338F6)]/40 ${className}`}
    >
      <div className="flex items-start justify-between mb-3">
        {Icon && (
          <div className="w-8 h-8 rounded-xl bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] border border-[var(--color-border-active,#6338F6)]/30 flex items-center justify-center text-[var(--color-text-accent,#C4B5FD)] shrink-0">
            <Icon className="w-4 h-4" />
          </div>
        )}
        {badgeText && (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[var(--background-secondary,#101015)] text-[var(--text-secondary,#94A3B8)] border border-[var(--border,#232330)] truncate">
            {badgeText}
          </span>
        )}
      </div>

      <div className="min-w-0 space-y-1">
        <p className="text-xs font-medium text-[var(--text-secondary,#94A3B8)] truncate">
          {label}
        </p>
        <div className="flex flex-wrap items-baseline gap-2">
          <h3 className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--text-primary,#FFFFFF)] truncate">
            {value}
          </h3>
          {subtext && (
            <span className="text-xs font-normal text-[var(--text-secondary,#94A3B8)] truncate">
              {subtext}
            </span>
          )}
        </div>
        {trend && (
          <p
            className={`text-xs font-medium pt-0.5 flex items-center gap-1 ${
              typeof trend === "object" && trend !== null && trend.isPositive !== undefined
                ? trend.isPositive
                  ? "text-[var(--color-success,#10B981)]"
                  : "text-[var(--color-text-muted,#6E7A8A)]"
                : "text-[var(--color-text-muted,#6E7A8A)]"
            }`}
          >
            {typeof trend === "object" && trend !== null && trend.text !== undefined
              ? trend.text
              : typeof trend === "string" || typeof trend === "number"
              ? trend
              : null}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default MetricCard;
