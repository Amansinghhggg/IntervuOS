import React from "react";

export const SectionHeader = ({
  icon: Icon,
  title,
  subtitle,
  actions,
  className = "",
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-5 ${className}`}>
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        {Icon && (
          <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-xl bg-[var(--primary-tint,rgba(99,56,246,0.15))] border border-[var(--primary)]/30 flex items-center justify-center text-[var(--primary)] shrink-0">
            <Icon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
          </div>
        )}
        <div className="min-w-0">
          <h2 className="text-sm sm:text-base md:text-lg font-medium text-[var(--text-primary)] truncate">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[11px] sm:text-xs text-[var(--text-secondary)] font-normal leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {actions && (
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0 w-full sm:w-auto">
          {actions}
        </div>
      )}
    </div>
  );
};

export default SectionHeader;
