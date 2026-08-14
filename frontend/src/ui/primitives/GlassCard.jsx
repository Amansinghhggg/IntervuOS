import React from "react";
import { motion } from "framer-motion";

export const GlassCard = ({
  children,
  className = "",
  padding = "p-4 sm:p-6 md:p-8",
  hoverEffect = false,
  glowEffect = false,
  onClick,
}) => {
  const Component = onClick ? motion.div : "div";
  const motionProps = onClick
    ? {
        whileHover: { y: hoverEffect ? -2 : 0 },
        onClick,
        role: "button",
        tabIndex: 0,
      }
    : {};

  return (
    <Component
      {...motionProps}
      className={`bg-[var(--card)] border border-[var(--border)]/80 text-[var(--text-primary)] ${padding} rounded-2xl shadow-sm relative overflow-hidden transition-all duration-150 ${
        onClick ? "cursor-pointer hover:border-[var(--color-border-active,#6338F6)]" : ""
      } ${className}`}
    >
      {glowEffect && (
        <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--primary)]/5 rounded-full blur-[40px] pointer-events-none" />
      )}
      <div className="relative z-10">{children}</div>
    </Component>
  );
};

export default GlassCard;
