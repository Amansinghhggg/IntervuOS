import React from "react";
import { Loader2 } from "lucide-react";

export default function UploadProgress({ progress, fileName }) {
  if (progress === null || progress === undefined) return null;

  return (
    <div className="w-full bg-[var(--color-canvas,#0B0B0E)] border border-[var(--color-border,#232330)] rounded-xl p-4 my-4 shadow-sm font-['Inter']">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 text-[var(--color-text-accent,#C4B5FD)] animate-spin" />
          <span className="text-xs font-medium text-[var(--color-text-primary,#FFFFFF)] truncate max-w-[200px]">
            Uploading {fileName || "Resume"}...
          </span>
        </div>
        <span className="text-xs font-medium text-[var(--color-text-accent,#C4B5FD)]">{progress}%</span>
      </div>
      <div className="w-full bg-[var(--color-surface,#16161E)] rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-[var(--primary,#5B3AF2)] h-1.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-[11px] text-[var(--color-text-muted,#6E7A8A)] mt-2">
        Please wait while your document is being uploaded.
      </p>
    </div>
  );
}
