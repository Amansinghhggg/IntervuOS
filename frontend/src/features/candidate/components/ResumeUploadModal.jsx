import React, { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import profileService from "../../../services/profile.service";
import toast from "react-hot-toast";
import {
  FileText,
  Upload,
  Loader2,
  X,
  FileCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import UploadProgress from "../../shared/components/UploadProgress";

const ResumeUploadModal = ({
  isOpen,
  onSuccess,
  onClose,
  onSkip,
  showSkip = false,
  skipText = "Skip for now (I'm only here for practice mocks)",
  title = "Resume upload required",
  description = "To participate in this employer assigned interview, please upload your PDF resume so the hiring team can review your qualifications."
}) => {
  const { checkAuth } = useAuth();
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        toast.error("Only PDF files are supported");
        e.target.value = "";
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("Resume size must be less than 5 MB");
        e.target.value = "";
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      return toast.error("Please select a PDF resume file to upload.");
    }

    setIsUploading(true);
    setUploadProgress(0);

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);

    try {
      const response = await profileService.uploadResume(file);
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success) {
        toast.success("Resume uploaded successfully!");
        // Refresh global user state so user.resume is updated in AuthContext
        await checkAuth();

        setTimeout(() => {
          setUploadProgress(null);
          setIsUploading(false);
          if (onSuccess) {
            onSuccess();
          }
        }, 400);
      }
    } catch (error) {
      clearInterval(progressInterval);
      toast.error(error.response?.data?.message || "Failed to upload resume. Please try again.");
      setUploadProgress(null);
      setIsUploading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-['Inter']">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-lg bg-[var(--color-surface,#16161E)] border border-[var(--color-border,#232330)] rounded-3xl p-6 sm:p-8 shadow-2xl relative text-[var(--color-text-primary,#FFFFFF)]"
        >
          {/* Close button if optional */}
          {onClose && (
            <button
              onClick={onClose}
              disabled={isUploading}
              className="absolute top-5 right-5 p-2 rounded-xl text-[var(--color-text-secondary,#94A3B8)] hover:text-white hover:bg-[var(--color-surface-hover,#1E1E2A)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Modal Header */}
          <div className="space-y-3 mb-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] border border-[var(--color-border-active,#6338F6)]/30 text-[var(--color-text-accent,#C4B5FD)] flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-medium tracking-tight text-[var(--color-text-primary,#FFFFFF)]">
              {title}
            </h3>
            <p className="text-xs text-[var(--color-text-secondary,#94A3B8)] leading-relaxed max-w-md mx-auto">
              {description}
            </p>
          </div>

          {/* Upload Drop Zone */}
          <div className="space-y-4">
            <div className="p-6 border-2 border-dashed border-[var(--color-border,#232330)] rounded-2xl bg-[var(--color-canvas,#0B0B0E)] text-center space-y-3 relative hover:border-[var(--color-border-active,#6338F6)]/50 transition-colors group">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                disabled={isUploading}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full disabled:cursor-not-allowed z-10"
              />

              <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                <Upload className="w-5 h-5" />
              </div>

              <div>
                <h4 className="text-xs font-medium text-[var(--color-text-primary,#FFFFFF)]">
                  {file ? file.name : "Drop your PDF resume here or click to browse"}
                </h4>
                <p className="text-[11px] text-[var(--color-text-muted,#6E7A8A)] mt-0.5">
                  {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB PDF Selected` : "PDF format, maximum file size 5MB"}
                </p>
              </div>

              {file && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-success,#10B981)]/15 border border-[var(--color-success,#10B981)]/30 text-[var(--color-success,#10B981)] text-xs font-medium">
                  <FileCheck className="w-3.5 h-3.5" /> Ready for upload
                </div>
              )}
            </div>

            {/* Progress Bar */}
            {uploadProgress !== null && (
              <UploadProgress progress={uploadProgress} fileName={file?.name} />
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isUploading}
                  className="w-1/3 py-2.5 px-4 rounded-xl border border-[var(--color-border,#232330)] text-xs font-medium text-[var(--color-text-secondary,#94A3B8)] hover:text-white hover:bg-[var(--color-surface-hover,#1E1E2A)] transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="w-full py-2.5 px-4 bg-[var(--color-primary,#5B3AF2)] hover:bg-[var(--color-primary-hover,#472CD7)] disabled:opacity-50 text-white rounded-xl text-xs font-medium transition-all shadow-sm flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading resume...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Upload & continue</span>
                  </>
                )}
              </button>
            </div>

            {/* Skip Option */}
            {showSkip && onSkip && (
              <div className="pt-2 text-center border-t border-[var(--color-border,#232330)]">
                <button
                  type="button"
                  onClick={onSkip}
                  disabled={isUploading}
                  className="text-xs text-[var(--color-text-secondary,#94A3B8)] hover:text-[var(--color-text-accent,#C4B5FD)] transition-colors py-1 font-normal underline"
                >
                  {skipText}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ResumeUploadModal;
