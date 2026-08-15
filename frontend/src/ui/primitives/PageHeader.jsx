import React from "react";
import { motion } from "framer-motion";

export const PageHeader = ({
  badgeIcon: BadgeIcon,
  badgeText,
  title,
  description,
  actions,
  className = "",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 pb-2 ${className}`}
    >
      <div className="space-y-1.5 min-w-0">
        {badgeText && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary-tint,rgba(99,56,246,0.15))] border border-[var(--primary)]/30 text-[var(--color-text-accent,#C4B5FD)] text-[10px] sm:text-[11px] font-black uppercase tracking-widest max-w-full truncate">
            {BadgeIcon && <BadgeIcon className="w-3.5 h-3.5 shrink-0" />}
            <span className="truncate">{badgeText}</span>
          </div>
        )}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight text-[var(--text-primary)] break-words">
          {title}
        </h1>
        {description && (
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3 shrink-0 w-full sm:w-auto">
          {actions}
        </div>
      )}
    </motion.div>
  );
};

export default PageHeader;
