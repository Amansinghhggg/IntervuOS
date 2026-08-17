import React, { useEffect, useMemo } from "react";
import { 
  Loader2, 
  CheckCircle2, 
  AlertTriangle, 
  CloudOff, 
  Clock, 
  ArrowRight,
  RefreshCw,
  Lock
} from "lucide-react";
import { UPLOAD_STATES, UPLOAD_STAGES } from "../../modules/persistence/config/constants.js";

const formatBytes = (bytes) => {
  if (!bytes || bytes <= 0) return null;
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const UploadScreen = ({ 
  uploadState = UPLOAD_STATES.UPLOADING, 
  progress = null, 
  retries = 0, 
  error = null, 
  onRetry, 
  onContinue 
}) => {
  // Prevent accidental navigation during active upload
  useEffect(() => {
    const isUploading =
      uploadState === UPLOAD_STATES.QUEUED ||
      uploadState === UPLOAD_STATES.UPLOADING ||
      uploadState === UPLOAD_STATES.RETRYING ||
      uploadState === "PROCESSING";

    const handleBeforeUnload = (e) => {
      if (isUploading) {
        e.preventDefault();
        e.returnValue = "Your interview recording is still uploading. Closing this tab will result in data loss. Are you sure you want to leave?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [uploadState]);

  // Calculate percentage and stage details
  const { displayPercent, stageName, bytesString, currentStage, stageProgressVal } = useMemo(() => {
    if (uploadState === UPLOAD_STATES.COMPLETED) {
      return { 
        displayPercent: 100, 
        stageName: "Upload complete", 
        bytesString: null, 
        currentStage: UPLOAD_STAGES.FINALIZE,
        stageProgressVal: 100
      };
    }

    if (!progress) {
      const defaultPercent = uploadState === UPLOAD_STATES.QUEUED ? 4 : 10;
      return { 
        displayPercent: defaultPercent, 
        stageName: "Preparing upload...", 
        bytesString: null, 
        currentStage: UPLOAD_STAGES.RECORDING_UPLOAD,
        stageProgressVal: 0
      };
    }

    const overall = typeof progress.overallProgress === "number" ? progress.overallProgress : 0;
    const stage = progress.currentStage || UPLOAD_STAGES.RECORDING_UPLOAD;
    const stageProg = typeof progress.stageProgress === "number" ? progress.stageProgress : 0;
    const isNetworkDone = progress.isNetworkComplete;
    const isServerDone = progress.isServerComplete;

    let name = "Uploading recording...";
    if (stage === UPLOAD_STAGES.RECORDING_UPLOAD) {
      if (isServerDone) {
        name = "Video archived to cloud storage";
      } else if (isNetworkDone || stageProg >= 100) {
        name = "Archiving & securing video in cloud storage...";
      } else if (stageProg > 0) {
        name = `Uploading video & audio (${stageProg}%)`;
      } else {
        name = "Connecting to video storage...";
      }
    } else if (stage === UPLOAD_STAGES.SESSION_UPLOAD) {
      name = "Saving interview responses & telemetry...";
    } else if (stage === UPLOAD_STAGES.FINALIZE) {
      name = "Verifying session integrity...";
    }

    let bStr = null;
    if (progress.bytesLoaded !== undefined && progress.totalBytes > 0) {
      const loadedFmt = formatBytes(progress.bytesLoaded);
      const totalFmt = formatBytes(progress.totalBytes);
      if (isNetworkDone && !isServerDone) {
        bStr = `${totalFmt} / ${totalFmt} • Encrypting`;
      } else {
        bStr = `${loadedFmt} / ${totalFmt}`;
      }
    }

    return {
      displayPercent: Math.max(0, Math.min(100, overall)),
      stageName: name,
      bytesString: bStr,
      currentStage: stage,
      stageProgressVal: stageProg
    };
  }, [uploadState, progress]);

  // Stage 1 Status (Recording)
  const stage1Status = useMemo(() => {
    if (uploadState === UPLOAD_STATES.COMPLETED) return "done";
    if (currentStage === UPLOAD_STAGES.SESSION_UPLOAD || currentStage === UPLOAD_STAGES.FINALIZE) return "done";
    if (currentStage === UPLOAD_STAGES.RECORDING_UPLOAD) {
      return uploadState === UPLOAD_STATES.RETRYING ? "retrying" : "active";
    }
    return "pending";
  }, [uploadState, currentStage]);

  // Stage 2 Status (Session)
  const stage2Status = useMemo(() => {
    if (uploadState === UPLOAD_STATES.COMPLETED) return "done";
    if (currentStage === UPLOAD_STAGES.FINALIZE) return "done";
    if (currentStage === UPLOAD_STAGES.SESSION_UPLOAD) return "active";
    return "pending";
  }, [uploadState, currentStage]);

  // Stage 3 Status (Finalize)
  const stage3Status = useMemo(() => {
    if (uploadState === UPLOAD_STATES.COMPLETED) return "done";
    if (currentStage === UPLOAD_STAGES.FINALIZE) return "active";
    return "pending";
  }, [uploadState, currentStage]);

  return (
    <div className="min-h-screen bg-[var(--color-canvas,#0B0B0E)] text-[var(--color-text-primary,#FFFFFF)] flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 fixed inset-0 z-[100] select-none font-sans">
      <div className="w-full max-w-xl bg-[var(--color-surface,#16161E)] border border-[var(--color-border,#232330)] rounded-xl p-6 sm:p-8 flex flex-col shadow-2xl transition-all">
        
        {/* COMPLETED STATE */}
        {uploadState === UPLOAD_STATES.COMPLETED && (
          <div className="flex flex-col items-center text-center space-y-5 py-4">
            <div className="w-14 h-14 rounded-full bg-[var(--color-success,#10B981)]/10 border border-[var(--color-success,#10B981)]/30 flex items-center justify-center text-[var(--color-success,#10B981)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            
            <div className="space-y-1.5">
              <h2 className="text-xl font-medium tracking-tight text-[var(--color-text-primary,#FFFFFF)]">
                Interview submitted successfully
              </h2>
              <p className="text-sm text-[var(--color-text-secondary,#94A3B8)] max-w-md mx-auto">
                Your video recording and responses have been securely archived. Your evaluation results will be processed shortly.
              </p>
            </div>

            <div className="w-full bg-[var(--color-canvas,#0B0B0E)] border border-[var(--color-border,#232330)] rounded-lg p-3.5 flex items-center justify-between text-xs text-[var(--color-text-secondary,#94A3B8)]">
              <span className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-[var(--color-success,#10B981)]" />
                Encrypted & Stored
              </span>
              <span className="font-mono text-[var(--color-text-accent,#C4B5FD)]">Status: Ready</span>
            </div>

            <button
              onClick={onContinue}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--color-primary,#5B3AF2)] hover:bg-[var(--color-primary-hover,#472CD7)] text-white font-medium text-sm rounded-lg transition-colors shadow-sm"
            >
              Continue to dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* FAILED STATE */}
        {uploadState === UPLOAD_STATES.FAILED && (
          <div className="flex flex-col items-center text-center space-y-5 py-4">
            <div className="w-14 h-14 rounded-full bg-[var(--color-danger,#F43F5E)]/10 border border-[var(--color-danger,#F43F5E)]/30 flex items-center justify-center text-[var(--color-danger,#F43F5E)]">
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <div className="space-y-1.5">
              <h2 className="text-xl font-medium tracking-tight text-[var(--color-text-primary,#FFFFFF)]">
                Recording upload interrupted
              </h2>
              <p className="text-sm text-[var(--color-text-secondary,#94A3B8)] max-w-md mx-auto">
                We encountered an issue uploading your interview session. Please check your internet connection and try again.
              </p>
            </div>

            {error && (
              <div className="w-full bg-[var(--color-canvas,#0B0B0E)] border border-[var(--color-danger,#F43F5E)]/30 rounded-lg p-3 text-left">
                <p className="text-xs font-mono text-[var(--color-danger,#F43F5E)] break-words">
                  {error}
                </p>
              </div>
            )}

            <div className="w-full flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={onRetry}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--color-primary,#5B3AF2)] hover:bg-[var(--color-primary-hover,#472CD7)] text-white font-medium text-sm rounded-lg transition-colors shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Retry upload
              </button>
              <button
                onClick={onContinue}
                className="inline-flex items-center justify-center px-4 py-2.5 bg-transparent hover:bg-[var(--color-surface-hover,#1E1E2A)] border border-[var(--color-border,#232330)] text-[var(--color-text-secondary,#94A3B8)] hover:text-white text-sm font-medium rounded-lg transition-colors"
              >
                Skip to dashboard
              </button>
            </div>
          </div>
        )}

        {/* ACTIVE UPLOADING / QUEUED / RETRYING STATE */}
        {uploadState !== UPLOAD_STATES.COMPLETED && uploadState !== UPLOAD_STATES.FAILED && (
          <div className="flex flex-col space-y-6">
            
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-xl font-medium tracking-tight text-[var(--color-text-primary,#FFFFFF)]">
                  {uploadState === UPLOAD_STATES.RETRYING 
                    ? "Reconnecting to server..." 
                    : "Uploading interview recording"}
                </h2>
                <p className="text-xs sm:text-sm text-[var(--color-text-secondary,#94A3B8)]">
                  {stageName}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {uploadState === UPLOAD_STATES.RETRYING ? (
                  <CloudOff className="w-5 h-5 text-[var(--color-warning,#F59E0B)] animate-bounce" />
                ) : (
                  <Loader2 className="w-5 h-5 text-[var(--color-primary,#5B3AF2)] animate-spin" />
                )}
              </div>
            </div>

            {/* Accurate Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-[var(--color-text-secondary,#94A3B8)]">
                  {bytesString ? bytesString : "Transmitting payload..."}
                </span>
                <span className="font-mono text-sm font-semibold text-[var(--color-text-accent,#C4B5FD)]">
                  {displayPercent}%
                </span>
              </div>

              <div className="w-full bg-[var(--color-canvas,#0B0B0E)] border border-[var(--color-border,#232330)] rounded-full h-2.5 overflow-hidden p-0.5">
                <div 
                  className="h-full rounded-full bg-[var(--color-primary,#5B3AF2)] transition-all duration-300 ease-out"
                  style={{ width: `${Math.max(3, displayPercent)}%` }}
                />
              </div>
            </div>

            {/* Multi-Stage Step Tracker */}
            <div className="bg-[var(--color-canvas,#0B0B0E)] border border-[var(--color-border,#232330)] rounded-lg p-3 sm:p-4 space-y-3">
              
              {/* Step 1: Video recording */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                    {stage1Status === "done" ? (
                      <CheckCircle2 className="w-4 h-4 text-[var(--color-success,#10B981)]" />
                    ) : stage1Status === "active" ? (
                      <Loader2 className="w-4 h-4 text-[var(--color-primary,#5B3AF2)] animate-spin" />
                    ) : stage1Status === "retrying" ? (
                      <CloudOff className="w-4 h-4 text-[var(--color-warning,#F59E0B)]" />
                    ) : (
                      <Clock className="w-4 h-4 text-[var(--color-text-muted,#6E7A8A)]" />
                    )}
                  </div>
                  <span className={`font-medium ${
                    stage1Status === "active" ? "text-white" : 
                    stage1Status === "done" ? "text-[var(--color-text-secondary,#94A3B8)]" : 
                    "text-[var(--color-text-muted,#6E7A8A)]"
                  }`}>
                    Video & audio recording
                  </span>
                </div>
                
                <span className="font-mono text-[11px] text-[var(--color-text-muted,#6E7A8A)]">
                  {stage1Status === "done" 
                    ? "Uploaded" 
                    : stage1Status === "active" 
                      ? (progress?.isNetworkComplete && !progress?.isServerComplete ? "Archiving..." : `${stageProgressVal || 0}%`) 
                      : "Pending"}
                </span>
              </div>

              {/* Step 2: Session & Answers */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                    {stage2Status === "done" ? (
                      <CheckCircle2 className="w-4 h-4 text-[var(--color-success,#10B981)]" />
                    ) : stage2Status === "active" ? (
                      <Loader2 className="w-4 h-4 text-[var(--color-primary,#5B3AF2)] animate-spin" />
                    ) : (
                      <Clock className="w-4 h-4 text-[var(--color-text-muted,#6E7A8A)]" />
                    )}
                  </div>
                  <span className={`font-medium ${
                    stage2Status === "active" ? "text-white" : 
                    stage2Status === "done" ? "text-[var(--color-text-secondary,#94A3B8)]" : 
                    "text-[var(--color-text-muted,#6E7A8A)]"
                  }`}>
                    Interview responses & telemetry
                  </span>
                </div>

                <span className="font-mono text-[11px] text-[var(--color-text-muted,#6E7A8A)]">
                  {stage2Status === "done" ? "Synced" : stage2Status === "active" ? "Syncing..." : "Waiting"}
                </span>
              </div>

              {/* Step 3: Verification */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                    {stage3Status === "done" ? (
                      <CheckCircle2 className="w-4 h-4 text-[var(--color-success,#10B981)]" />
                    ) : stage3Status === "active" ? (
                      <Loader2 className="w-4 h-4 text-[var(--color-primary,#5B3AF2)] animate-spin" />
                    ) : (
                      <Clock className="w-4 h-4 text-[var(--color-text-muted,#6E7A8A)]" />
                    )}
                  </div>
                  <span className={`font-medium ${
                    stage3Status === "active" ? "text-white" : 
                    stage3Status === "done" ? "text-[var(--color-text-secondary,#94A3B8)]" : 
                    "text-[var(--color-text-muted,#6E7A8A)]"
                  }`}>
                    Finalizing & integrity check
                  </span>
                </div>

                <span className="font-mono text-[11px] text-[var(--color-text-muted,#6E7A8A)]">
                  {stage3Status === "done" ? "Verified" : stage3Status === "active" ? "Finalizing..." : "Waiting"}
                </span>
              </div>

            </div>

            {/* Connection Safety Notice */}
            <div className="flex items-start gap-2.5 bg-[var(--color-canvas,#0B0B0E)] border border-[var(--color-border,#232330)] rounded-lg p-3 text-xs text-[var(--color-text-secondary,#94A3B8)]">
              <Lock className="w-4 h-4 text-[var(--color-primary,#5B3AF2)] shrink-0 mt-0.5" />
              <span>
                Please keep this browser tab open until the upload is complete. Your connection is encrypted.
                {uploadState === UPLOAD_STATES.RETRYING && (
                  <span className="block mt-1 font-semibold text-[var(--color-warning,#F59E0B)]">
                    Attempt {retries} of 3 • Re-establishing connection...
                  </span>
                )}
              </span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default UploadScreen;
