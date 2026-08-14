import * as React from "react";
import { Slot } from "@radix-ui/react-slot"; // We need to install this if we want asChild support, or we can just omit it for now
import { cva } from "class-variance-authority";
import { cn } from "../../utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/40 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--primary)] text-white shadow-sm hover:bg-[var(--primary-hover)]",
        glow:
          "bg-[var(--primary)] text-white shadow-[0_2px_10px_rgba(91,58,242,0.3)] hover:shadow-[0_4px_16px_rgba(91,58,242,0.45)] hover:bg-[var(--primary-hover)]",
        destructive:
          "bg-[var(--color-danger)] text-white shadow-sm hover:opacity-90",
        outline:
          "border border-[var(--border)] bg-transparent hover:bg-[var(--color-surface-hover,#1E1E2A)] hover:border-[var(--color-border-active,#6338F6)] text-[var(--text-primary)]",
        secondary:
          "bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--primary)]/30 hover:bg-[var(--primary-tint)]/80",
        ghost: "hover:bg-[var(--color-surface-hover,#1E1E2A)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
        link: "text-[var(--primary)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2 text-xs sm:text-sm",
        sm: "h-8.5 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-xl px-6 text-sm font-semibold",
        icon: "h-9 w-9 shrink-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(({ className, variant, size, ...props }, ref) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button, buttonVariants };
