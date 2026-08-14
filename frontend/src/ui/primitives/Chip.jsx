import React from "react";

export const Chip = ({
  label,
  selected = false,
  onClick,
  onRemove,
  icon: Icon,
  className = "",
}) => {
  const baseStyles =
    "inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all border";

  const stateStyles = selected
    ? "bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border-[var(--primary)]/40 shadow-sm"
    : "bg-[var(--background)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--color-border-active,#6338F6)] hover:text-[var(--text-primary)]";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseStyles} ${stateStyles} ${className}`}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      <span>{label}</span>
      {onRemove && (
        <span
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:text-rose-400 p-0.5 rounded-md"
        >
          ×
        </span>
      )}
    </button>
  );
};

export default Chip;
