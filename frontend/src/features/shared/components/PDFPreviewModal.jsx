import React, { useEffect, useRef } from "react";
import { X, Download, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PDFPreviewModal({ isOpen, onClose, resumeUrl, fileName, onDownload }) {
  const modalRef = useRef(null);

  // Focus trapping and Esc key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Prevent background scrolling
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDownload = async () => {
    if (onDownload) {
      await onDownload();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 font-['Inter']">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="pdf-modal-title"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-5xl h-full max-h-[90vh] bg-[var(--color-surface,#16161E)] rounded-2xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-[var(--color-border,#232330)] text-[var(--color-text-primary,#FFFFFF)]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border,#232330)] bg-[var(--color-canvas,#0B0B0E)]">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] flex items-center justify-center shrink-0 border border-[var(--color-border-active,#6338F6)]/30">
                <FileText className="w-5 h-5" />
              </div>
              <h2 id="pdf-modal-title" className="text-base font-medium text-[var(--color-text-primary,#FFFFFF)] truncate">
                {fileName || "Resume"}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-[var(--color-text-secondary,#94A3B8)] hover:bg-[var(--color-surface-hover,#1E1E2A)] hover:text-[var(--color-text-primary,#FFFFFF)] rounded-xl transition-colors"
                title="Close"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* PDF Viewer Body */}
          <div className="flex-1 bg-black/20 relative overflow-hidden flex flex-col items-center justify-center">
            {resumeUrl ? (
              <object
                data={resumeUrl}
                type="application/pdf"
                className="w-full h-full"
                aria-label="PDF Preview"
              >
                {/* Fallback if browser doesn't support PDF viewing natively */}
                <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                  <FileText className="w-12 h-12 text-[var(--color-text-muted,#6E7A8A)]" />
                  <p className="text-sm font-medium text-[var(--color-text-primary,#FFFFFF)]">
                    This browser cannot preview PDF files natively.
                  </p>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="px-5 py-2.5 bg-[var(--primary,#5B3AF2)] hover:bg-[var(--primary-hover,#472CD7)] text-white rounded-xl text-xs font-medium transition-all shadow-sm flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </object>
            ) : (
              <div className="text-[var(--color-danger,#F43F5E)] text-sm font-medium">Failed to load resume URL.</div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
