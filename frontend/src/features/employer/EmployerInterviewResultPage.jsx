import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api";
import { ArrowLeft, Loader2, AlertCircle, RefreshCw, Clock, FileQuestion, Sparkles, CheckCircle2, Brain, Activity } from "lucide-react";

import { CandidateWorkspace } from "../../modules/candidate-workspace/index";
import PDFPreviewModal from "../shared/components/PDFPreviewModal";
import profileService from "../../services/profile.service";

const EVALUATION_STAGES = [
  { id: 1, label: "Ingesting audio transcripts & question responses", icon: Brain },
  { id: 2, label: "Evaluating technical depth & architectural accuracy", icon: Sparkles },
  { id: 3, label: "Scoring communication, problem solving & confidence", icon: Activity },
  { id: 4, label: "Synthesizing executive recommendation & strengths", icon: CheckCircle2 },
];

export default function EmployerInterviewResultPage() {
  const { id: interviewId, resultId } = useParams();
  const navigate = useNavigate();
  const [resultData, setResultData] = useState(null);
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorStatus, setErrorStatus] = useState(null);

  const [showReEnrollModal, setShowReEnrollModal] = useState(false);
  const [isReEnrolling, setIsReEnrolling] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeStage, setActiveStage] = useState(0);

  const pollIntervalRef = useRef(null);

  const fetchResult = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError(null);
      setErrorStatus(null);
    }

    try {
      const { data } = await api.get(
        `/interviews/${interviewId}/results/${resultId}`
      );
      setResultData(data.result);

      if (data.result?.candidate?.id && !resume) {
        try {
          const res = await profileService.getCandidateResume(interviewId, data.result.candidate.id);
          setResume(res.data);
        } catch (err) {
          console.error("Failed to fetch candidate resume:", err);
        }
      }
    } catch (err) {
      const status = err.response?.status;
      setErrorStatus(status);
      if (status === 404) {
        setError("Evaluation not available yet.");
      } else {
        setError("Unable to load evaluation. Please try again.");
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [interviewId, resultId, resume]);

  // Initial fetch
  useEffect(() => {
    fetchResult(false);
  }, [fetchResult]);

  // Real-time automatic polling when evaluation is in progress
  useEffect(() => {
    const status = resultData?.evaluation?.status;
    const isProcessing = status === "PENDING" || status === "PROCESSING" || status === "RETRYING";

    if (isProcessing) {
      // Auto-poll backend every 3 seconds until completed or failed
      pollIntervalRef.current = setInterval(() => {
        fetchResult(true);
      }, 3000);

      // Cycle animated progress stages for engaging visual feedback
      const stageTimer = setInterval(() => {
        setActiveStage((prev) => (prev + 1) % EVALUATION_STAGES.length);
      }, 2500);

      return () => {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        clearInterval(stageTimer);
      };
    } else {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    }
  }, [resultData?.evaluation?.status, fetchResult]);

  const handleReEnrollConfirm = async () => {
    setIsReEnrolling(true);
    try {
      const candidateId = resultData?.candidate?.id;
      if (!candidateId) throw new Error("Candidate ID not found");

      await api.post(`/interviews/${interviewId}/candidates/${candidateId}/re-enroll`);
      toast.success("Candidate re-enrolled successfully");
      setShowReEnrollModal(false);
      navigate(`/employer/interviews/${interviewId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to re-enroll candidate");
    } finally {
      setIsReEnrolling(false);
    }
  };

  const handleErrorReEnroll = async () => {
    setIsReEnrolling(true);
    try {
      await api.post(`/interviews/${interviewId}/results/${resultId}/re-enroll`);
      toast.success("Candidate re-enrolled successfully");
      navigate(`/employer/interviews/${interviewId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to re-enroll candidate");
    } finally {
      setIsReEnrolling(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-transparent relative font-sans pb-16 text-[var(--color-text-primary)]">
      {/* Background Noise */}
      <div className="absolute inset-0 noise pointer-events-none z-0"></div>

      {loading && (
        <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4 relative z-10">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
          <p className="text-[var(--color-text-secondary)] font-medium text-xs">Loading evaluation dashboard...</p>
        </div>
      )}

      {error && !loading && (
        <div className="w-full px-4 sm:px-6 md:px-8 xl:px-10 py-6 sm:py-8 relative z-10 animate-fade-in-up space-y-6">
          <div>
            <Link
              to={`/employer/interviews/${interviewId}`}
              className="inline-flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors text-xs font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to interview
            </Link>
          </div>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-12 flex flex-col items-center text-center shadow-sm">
            {errorStatus === 404 ? (
              <>
                <FileQuestion className="w-14 h-14 text-[var(--color-text-muted)] opacity-50 mb-6" />
                <h2 className="text-xl font-medium text-[var(--color-text-primary)] mb-2 tracking-tight">No result found</h2>
                <p className="text-[var(--color-text-secondary)] max-w-md text-xs">{error}</p>
              </>
            ) : (
              <>
                <AlertCircle className="w-14 h-14 text-[var(--color-danger)] mb-6" />
                <h2 className="text-xl font-medium text-[var(--color-text-primary)] mb-2 tracking-tight">Evaluation error</h2>
                <p className="text-[var(--color-danger)] max-w-md text-xs opacity-80 mb-6">{error}</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleErrorReEnroll}
                    disabled={isReEnrolling}
                    className="px-5 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-medium rounded-xl transition-all shadow-sm text-xs flex items-center gap-2 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isReEnrolling ? 'animate-spin' : ''}`} />
                    {isReEnrolling ? "Re-enrolling..." : "Re-enroll candidate"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {!loading && !error && resultData && resultData.evaluation.status !== "COMPLETED" && (
        <div className="w-full px-4 sm:px-6 md:px-8 xl:px-10 py-6 sm:py-8 relative z-10 animate-fade-in-up space-y-6">
          <div>
            <Link
              to={`/employer/interviews/${interviewId}`}
              className="inline-flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors text-xs font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to interview
            </Link>
          </div>

          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-8 sm:p-12 flex flex-col items-center text-center shadow-sm relative overflow-hidden max-w-2xl mx-auto">
            <div className="relative z-10 flex flex-col items-center w-full">
              {resultData.evaluation.status === "PENDING" && (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary-tint)] border border-[var(--color-border-active)] flex items-center justify-center mb-5">
                    <Clock className="w-7 h-7 text-[var(--color-text-accent)]" />
                  </div>
                  <h2 className="text-xl font-medium text-[var(--color-text-primary)] mb-2 tracking-tight">Evaluation queued in BullMQ</h2>
                  <p className="text-[var(--color-text-secondary)] text-xs max-w-md mb-8">
                    The interview analysis job has been dispatched to background AI workers and will process shortly.
                  </p>
                </>
              )}

              {(resultData.evaluation.status === "PROCESSING" || resultData.evaluation.status === "RETRYING") && (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary-tint)] border border-[var(--color-border-active)] flex items-center justify-center mb-5">
                    <Loader2 className="w-7 h-7 text-[var(--color-text-accent)] animate-spin" />
                  </div>
                  <h2 className="text-xl font-medium text-[var(--color-text-primary)] mb-2 tracking-tight">AI evaluation in progress</h2>
                  <p className="text-[var(--color-text-secondary)] text-xs max-w-md mb-8">
                    Our AI models are performing multidimensional scoring across technical depth, communication, and topic mastery.
                  </p>
                </>
              )}

              {resultData.evaluation.status === "FAILED" && (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30 flex items-center justify-center mb-5">
                    <AlertCircle className="w-7 h-7 text-[var(--color-danger)]" />
                  </div>
                  <h2 className="text-xl font-medium text-[var(--color-text-primary)] mb-2 tracking-tight">Evaluation failed</h2>
                  <p className="text-[var(--color-danger)] opacity-80 text-xs max-w-md mb-6">
                    We encountered an issue generating the automated evaluation report.
                  </p>
                  <button
                    onClick={() => setShowReEnrollModal(true)}
                    className="px-5 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-medium rounded-xl transition-all shadow-sm text-xs flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" /> Re-enroll candidate
                  </button>
                </>
              )}

              {/* Animated Evaluation Stages Indicator */}
              {(resultData.evaluation.status === "PROCESSING" || resultData.evaluation.status === "PENDING" || resultData.evaluation.status === "RETRYING") && (
                <div className="w-full bg-[var(--color-canvas)] border border-[var(--color-border)] rounded-xl p-4 sm:p-5 text-left space-y-3">
                  <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] font-medium mb-1">
                    <span>Analysis Pipeline</span>
                    <span className="text-[var(--color-text-accent)] font-mono">Live auto-polling...</span>
                  </div>

                  <div className="space-y-2.5">
                    {EVALUATION_STAGES.map((stage, idx) => {
                      const isCurrent = activeStage === idx;
                      const isDone = activeStage > idx;
                      const StageIcon = stage.icon;

                      return (
                        <div
                          key={stage.id}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all duration-300 ${
                            isCurrent
                              ? "bg-[var(--color-primary-tint)] text-[var(--color-text-accent)] border border-[var(--color-border-active)]"
                              : isDone
                              ? "text-[var(--color-text-secondary)] opacity-70"
                              : "text-[var(--color-text-muted)] opacity-40"
                          }`}
                        >
                          {isCurrent ? (
                            <Loader2 className="w-4 h-4 animate-spin text-[var(--color-text-accent)] shrink-0" />
                          ) : isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-[var(--color-success)] shrink-0" />
                          ) : (
                            <StageIcon className="w-4 h-4 shrink-0" />
                          )}
                          <span className="truncate">{stage.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!loading && !error && resultData && resultData.evaluation.status === "COMPLETED" && (
        <div className="relative z-10 w-full px-4 sm:px-6 md:px-8 xl:px-10 py-6 sm:py-8">
          <CandidateWorkspace
            resultData={resultData}
            onReEnroll={() => setShowReEnrollModal(true)}
            onViewResume={resume ? () => setIsPreviewOpen(true) : null}
          />
        </div>
      )}

      {/* Re-Enroll Confirmation Modal */}
      {showReEnrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden animate-fade-in-up">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[var(--color-danger)]/10 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-[var(--color-danger)]" />
              </div>
              <div>
                <h3 className="text-base font-medium text-[var(--color-text-primary)]">Re-enroll Candidate?</h3>
                <p className="text-xs text-[var(--color-danger)]">This action will reset the candidate's session.</p>
              </div>
            </div>

            <p className="text-xs text-[var(--color-text-secondary)] mb-6 leading-relaxed">
              Are you sure you want to re-enroll this candidate? This will clear the current evaluation results and video recording. The candidate's status will be reset to Pending so they can take the interview again.
            </p>

            <div className="flex gap-2.5 justify-end">
              <button
                onClick={() => setShowReEnrollModal(false)}
                disabled={isReEnrolling}
                className="px-4 py-2 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] rounded-xl transition-colors border border-transparent cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReEnrollConfirm}
                disabled={isReEnrolling}
                className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[var(--color-danger)] hover:bg-[var(--color-danger)]/90 rounded-xl transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {isReEnrolling ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm Re-enroll"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {resume && resultData && (
        <PDFPreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          resumeUrl={`/api/interviews/${interviewId}/candidates/${resultData.candidate.id}/resume/download`}
          fileName={resume.fileName}
          onDownload={() => profileService.downloadResume(`/interviews/${interviewId}/candidates/${resultData.candidate.id}/resume/download`, resume.fileName)}
        />
      )}
    </div>
  );
}
