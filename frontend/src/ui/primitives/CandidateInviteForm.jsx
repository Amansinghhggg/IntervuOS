import React, { useState } from "react";
import {
  User,
  ListFilter,
  FileSpreadsheet,
  Plus,
  Upload,
  X,
  HelpCircle,
  Copy,
  Download,
  CheckCircle2,
  FileText,
  Info
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export const CandidateInviteForm = ({
  onAddCandidates,
  isSubmitting = false,
  submitButtonText = "Invite candidates",
  showSubmitButton = false,
  existingEmails = [],
}) => {
  const [candidateMode, setCandidateMode] = useState("single"); // 'single' | 'bulk' | 'csv'
  const [singleEmailInput, setSingleEmailInput] = useState("");
  const [bulkEmailInput, setBulkEmailInput] = useState("");
  const [csvFileName, setCsvFileName] = useState("");
  const [parsedCsvEmails, setParsedCsvEmails] = useState([]);
  const [isExampleModalOpen, setIsExampleModalOpen] = useState(false);
  const [copiedFormat, setCopiedFormat] = useState(false);

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSingleSubmit = (e) => {
    if (e) e.preventDefault();
    const trimmed = singleEmailInput.trim().toLowerCase();
    if (!trimmed) return;
    if (!isValidEmail(trimmed)) {
      return toast.error("Please enter a valid candidate email address.");
    }
    if (existingEmails.some((e) => e.toLowerCase() === trimmed)) {
      return toast.error("This candidate email is already assigned or added.");
    }

    onAddCandidates([trimmed]);
    setSingleEmailInput("");
  };

  const handleBulkSubmit = (e) => {
    if (e) e.preventDefault();
    const matches =
      bulkEmailInput.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
    if (matches.length === 0) {
      return toast.error("No valid email addresses found in the text.");
    }

    const existingSet = new Set(existingEmails.map((e) => e.toLowerCase()));
    const newEmails = [];
    matches.forEach((m) => {
      const email = m.toLowerCase();
      if (!existingSet.has(email) && !newEmails.includes(email)) {
        newEmails.push(email);
      }
    });

    if (newEmails.length === 0) {
      return toast.error("All found emails are already assigned or added.");
    }

    onAddCandidates(newEmails);
    setBulkEmailInput("");
  };

  const handleCsvUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result || "";
      const matches =
        content.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
      if (matches.length === 0) {
        toast.error("No valid email addresses found in file.");
        return;
      }

      const existingSet = new Set(existingEmails.map((e) => e.toLowerCase()));
      const newEmails = [];
      matches.forEach((m) => {
        const email = m.toLowerCase();
        if (!existingSet.has(email) && !newEmails.includes(email)) {
          newEmails.push(email);
        }
      });

      if (newEmails.length === 0) {
        toast.error(
          "All emails in the file are already assigned or in your candidate list."
        );
        return;
      }

      setParsedCsvEmails(newEmails);
      if (!showSubmitButton) {
        onAddCandidates(newEmails);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleTriggerCsvSubmit = () => {
    if (parsedCsvEmails.length === 0) {
      return toast.error("Please upload a valid CSV file first.");
    }
    onAddCandidates(parsedCsvEmails);
    setParsedCsvEmails([]);
    setCsvFileName("");
  };

  // Ultra-simple and standard email formats
  const sampleCsvContent = `Email
alex@acme.com
sarah@company.com
david@techcorp.io
elena@startup.ai`;

  const sampleCommaText = `alex@acme.com, sarah@company.com, david@techcorp.io, elena@startup.ai`;

  const handleCopyExample = () => {
    navigator.clipboard.writeText(sampleCommaText);
    setCopiedFormat(true);
    toast.success("Sample emails copied to clipboard!");
    setTimeout(() => setCopiedFormat(false), 2500);
  };

  const handleDownloadSampleCsv = () => {
    const blob = new Blob([sampleCsvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "candidate_emails_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Downloaded candidate_emails_sample.csv");
  };

  const inputClasses =
    "flex w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/50 focus:outline-none focus:border-[var(--color-border-active,#6338F6)] transition-colors";

  return (
    <div className="space-y-4">
      {/* Mode Selector Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)]">
        <button
          type="button"
          onClick={() => setCandidateMode("single")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium tracking-tight transition-all ${
            candidateMode === "single"
              ? "bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)]"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          <User className="w-3.5 h-3.5" /> Single candidate
        </button>

        <button
          type="button"
          onClick={() => setCandidateMode("bulk")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium tracking-tight transition-all ${
            candidateMode === "bulk"
              ? "bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)]"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          <ListFilter className="w-3.5 h-3.5" /> Bulk paste
        </button>

        <button
          type="button"
          onClick={() => setCandidateMode("csv")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium tracking-tight transition-all ${
            candidateMode === "csv"
              ? "bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)]"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" /> CSV / TXT upload
        </button>
      </div>

      {/* Mode 1: Single Candidate */}
      {candidateMode === "single" && (
        <div className="space-y-3 p-5 rounded-2xl bg-[var(--color-canvas)] border border-[var(--color-border)]">
          <label className="text-xs font-medium text-[var(--color-text-secondary)] block">
            Candidate email address
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              value={singleEmailInput}
              onChange={(e) => setSingleEmailInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSingleSubmit();
                }
              }}
              placeholder="candidate@company.com"
              className={inputClasses}
            />
            <button
              type="button"
              onClick={handleSingleSubmit}
              disabled={isSubmitting || !singleEmailInput.trim()}
              className="px-5 py-2.5 bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] hover:bg-[var(--color-primary-tint,rgba(99,56,246,0.25))] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)] rounded-xl text-xs font-medium tracking-tight transition-all flex items-center shrink-0 disabled:opacity-40"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Add</span>
            </button>
          </div>
        </div>
      )}

      {/* Mode 2: Bulk Paste */}
      {candidateMode === "bulk" && (
        <div className="space-y-3 p-5 rounded-2xl bg-[var(--color-canvas)] border border-[var(--color-border)]">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-[var(--color-text-secondary)] block">
              Paste multiple email addresses
            </label>
            <button
              type="button"
              onClick={() => setIsExampleModalOpen(true)}
              className="text-xs text-[var(--color-text-accent,#C4B5FD)] hover:underline inline-flex items-center gap-1 font-medium"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Format example</span>
            </button>
          </div>
          <textarea
            value={bulkEmailInput}
            onChange={(e) => setBulkEmailInput(e.target.value)}
            rows={4}
            placeholder="candidate1@example.com, candidate2@example.com, candidate3@example.com&#10;or one email per line..."
            className={`${inputClasses} resize-none`}
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleBulkSubmit}
              disabled={isSubmitting || !bulkEmailInput.trim()}
              className="px-5 py-2.5 bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] hover:bg-[var(--color-primary-tint,rgba(99,56,246,0.25))] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)] rounded-xl text-xs font-medium tracking-tight transition-all flex items-center disabled:opacity-40"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Parse & add emails</span>
            </button>
          </div>
        </div>
      )}

      {/* Mode 3: CSV Upload */}
      {candidateMode === "csv" && (
        <div className="space-y-3">
          <div className="p-6 border-2 border-dashed border-[var(--color-border)] rounded-2xl bg-[var(--color-canvas)] text-center relative hover:border-[var(--color-border-active,#6338F6)]/50 transition-colors space-y-3">
            <input
              type="file"
              accept=".csv, .txt"
              onChange={handleCsvUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="w-11 h-11 rounded-full bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] flex items-center justify-center mx-auto border border-[var(--color-border-active,#6338F6)]/30">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-[var(--color-text-primary)]">
                Drop CSV or TXT file here or click to browse
              </h4>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                Upload a spreadsheet (.csv) or plain text (.txt) file containing candidate emails.
              </p>
            </div>

            {csvFileName && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-success)]/10 border border-[var(--color-success)]/30 text-[var(--color-success)] text-xs font-medium">
                <FileSpreadsheet className="w-3.5 h-3.5" /> Uploaded: {csvFileName}{" "}
                ({parsedCsvEmails.length} detected)
              </div>
            )}

            {showSubmitButton && parsedCsvEmails.length > 0 && (
              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={handleTriggerCsvSubmit}
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] hover:bg-[var(--color-primary-tint,rgba(99,56,246,0.25))] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)] rounded-xl text-xs font-medium tracking-tight transition-all"
                >
                  <Plus className="w-3.5 h-3.5 mr-1 inline" />
                  <span>Add {parsedCsvEmails.length} parsed candidates</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Example Button Bar */}
          <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] text-xs">
            <span className="text-[var(--color-text-secondary)] flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5 text-[var(--color-text-accent,#C4B5FD)]" />
              <span>Need help with format?</span>
            </span>
            <button
              type="button"
              onClick={() => setIsExampleModalOpen(true)}
              className="text-xs text-[var(--color-text-accent,#C4B5FD)] hover:underline font-medium flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>View example format</span>
            </button>
          </div>
        </div>
      )}

      {/* CSV / TXT Format Example Modal */}
      <AnimatePresence>
        {isExampleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsExampleModalOpen(false)}
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-2xl space-y-5 text-[var(--color-text-primary)] font-['Inter']"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 border-b border-[var(--color-border)] pb-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)]/30 flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium tracking-tight text-[var(--color-text-primary)]">
                      Candidate email format
                    </h3>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      Simple .csv or .txt file format.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsExampleModalOpen(false)}
                  className="p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover,#1E1E2A)] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Short Explanation */}
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                You can upload a <strong>.csv</strong> or <strong>.txt</strong> file with candidate emails separated by commas or one per line:
              </p>

              {/* Format 1: Comma-separated (Minimal Effort) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
                  <span className="font-medium text-[var(--color-text-primary)]">
                    Option 1: Comma-separated
                  </span>
                  <span className="text-[11px]">.txt or .csv</span>
                </div>
                <div className="p-3 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] font-mono text-xs text-[var(--color-text-accent,#C4B5FD)] leading-relaxed break-all">
                  alex@acme.com, sarah@company.com, david@techcorp.io, elena@startup.ai
                </div>
              </div>

              {/* Format 2: One email per line / Column */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
                  <span className="font-medium text-[var(--color-text-primary)]">
                    Option 2: One email per line
                  </span>
                  <span className="text-[11px]">.txt or Excel column</span>
                </div>
                <div className="p-3 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] font-mono text-xs text-[var(--color-text-secondary)] leading-relaxed">
                  <div>alex@acme.com</div>
                  <div>sarah@company.com</div>
                  <div>david@techcorp.io</div>
                  <div>elena@startup.ai</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--color-border)]">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyExample}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium text-[var(--color-text-accent,#C4B5FD)] bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] hover:bg-[var(--color-primary-tint,rgba(99,56,246,0.25))] border border-[var(--color-border-active,#6338F6)]/40 transition-all flex items-center gap-1.5"
                  >
                    {copiedFormat ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-success)]" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy sample</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadSampleCsv}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-[var(--color-canvas)] border border-[var(--color-border)] hover:border-[var(--color-border-active,#6338F6)]/40 transition-all flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download sample .csv</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsExampleModalOpen(false)}
                  className="px-4 py-1.5 rounded-xl text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-[var(--color-canvas)] border border-[var(--color-border)] transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CandidateInviteForm;
