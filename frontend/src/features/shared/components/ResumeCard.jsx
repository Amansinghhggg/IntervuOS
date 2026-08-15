import React, { useState } from "react";
import { FileText, Download, Eye, RefreshCw } from "lucide-react";
import PDFPreviewModal from "./PDFPreviewModal";

export default function ResumeCard({ resume, onReplace, onDownload, viewUrl, readOnly = true }) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateStr) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(dateStr));
  };

  const handleDownload = async () => {
    if (onDownload) {
      await onDownload(resume.fileName);
    }
  };

  if (!resume || !resume.url) {
    return (
      <div className="w-full bg-[var(--color-surface,#16161E)] border border-[var(--color-border,#232330)] rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-xl">
        <FileText className="w-12 h-12 text-[var(--color-text-muted,#6E7A8A)] mb-3" />
        <h3 className="text-base font-medium text-[var(--color-text-primary,#FFFFFF)]">
          Resume required
        </h3>
        <p className="text-xs text-[var(--color-text-secondary,#94A3B8)] mt-1.5 mb-6">
          Upload your resume to complete your candidate profile.
        </p>
        {!readOnly && onReplace && (
          <button 
            type="button"
            onClick={onReplace}
            className="px-5 py-2.5 bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)]/40 rounded-xl text-xs font-medium hover:bg-[var(--primary-tint)]/80 transition-all flex items-center gap-2 shadow-sm"
          >
            <FileText className="w-4 h-4" />
            <span>Upload resume</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="bg-[var(--color-canvas,#0B0B0E)] border border-[var(--color-border,#232330)] p-5 sm:p-6 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 group hover:border-[var(--color-border-active,#6338F6)]/40 transition-colors w-full">
        
        {/* File Info */}
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-[var(--color-surface,#16161E)] rounded-xl border border-[var(--color-border,#232330)] text-[var(--color-text-accent,#C4B5FD)] shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h4 className="font-medium text-sm text-[var(--color-text-primary,#FFFFFF)] truncate max-w-[200px] sm:max-w-[320px]">
              {resume.fileName || "Resume.pdf"}
            </h4>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-[var(--color-text-secondary,#94A3B8)]">
              <span className="px-2 py-0.5 rounded bg-[var(--color-surface,#16161E)] border border-[var(--color-border,#232330)] text-[11px] font-medium">
                {formatFileSize(resume.fileSize)}
              </span>
              <span className="text-[11px] text-[var(--color-text-muted,#6E7A8A)]">
                Uploaded {formatDate(resume.uploadedAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto justify-start md:justify-end">
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="px-3.5 py-1.5 border border-[var(--color-border,#232330)] bg-[var(--color-surface,#16161E)] rounded-xl text-xs font-medium text-[var(--color-text-secondary,#94A3B8)] hover:text-[var(--color-text-primary,#FFFFFF)] hover:border-[var(--color-border-active,#6338F6)]/40 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View</span>
          </button>
          
          <button
            type="button"
            onClick={handleDownload}
            className="px-3.5 py-1.5 border border-[var(--color-border,#232330)] bg-[var(--color-surface,#16161E)] rounded-xl text-xs font-medium text-[var(--color-text-secondary,#94A3B8)] hover:text-[var(--color-text-primary,#FFFFFF)] hover:border-[var(--color-border-active,#6338F6)]/40 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>

          {!readOnly && onReplace && (
            <button
              type="button"
              onClick={onReplace}
              className="px-3.5 py-1.5 bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)]/40 rounded-xl text-xs font-medium hover:bg-[var(--primary-tint)]/80 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Replace</span>
            </button>
          )}
        </div>
      </div>

      <PDFPreviewModal 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
        resumeUrl={viewUrl || resume.url} 
        fileName={resume.fileName}
        onDownload={handleDownload}
      />
    </>
  );
}
