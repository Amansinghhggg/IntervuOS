import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Loader2,
  Clock,
  Tag,
  Play,
  Briefcase,
  Building2,
  AlertCircle,
  FileText,
  ShieldCheck
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { PreSessionCheckModal } from "../../ui/shared/PreSessionCheckModal";

const InterviewInstructionsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const shouldReduceMotion = useReducedMotion();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCheckModal, setShowCheckModal] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);

  const fetchInterview = async () => {
    try {
      const { data } = await api.get(`/interviews/${id}`);
      if (data.success) {
        setInterview(data.interview);
      }
    } catch (error) {
      toast.error("Failed to load interview details");
      navigate("/candidate/dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterview();
  }, [id]);

  const handleStartInterviewSession = async () => {
    setIsLaunching(true);
    try {
      const { data } = await api.post(`/interviews/${id}/start`);
      if (data.success) {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
          elem.requestFullscreen().catch(() => {});
        }
        toast.success("Starting interview session...");
        setShowCheckModal(false);
        navigate(`/candidate/interviews/${id}/live`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to start interview");
    } finally {
      setIsLaunching(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center font-['Inter']">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary,#5B3AF2)]" />
          <p className="text-xs text-[var(--text-secondary)]">Loading interview details...</p>
        </div>
      </div>
    );
  }

  if (!interview) return null;

  const activeStatuses = ["active", "CREATED", "IN_PROGRESS", "draft"];
  const isInactive = !activeStatuses.includes(interview.status);
  const hasAttempted = interview.assignedCandidates?.find(
    (c) => c.email === user?.email
  )?.status === "Completed";

  return (
    <div className="bg-[var(--background)] min-h-screen w-full font-['Inter'] flex flex-col items-center justify-center p-4 sm:p-6 text-[var(--text-primary)]">
      <div className="w-full max-w-3xl space-y-4">

        {/* Back Navigation */}
        <button
          onClick={() => navigate('/candidate/dashboard')}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[var(--card)] hover:bg-[var(--surface-hover,#1E1E2A)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-xl text-xs font-medium transition-colors border border-[var(--border)] focus-visible:ring-2 focus-visible:ring-[var(--color-border-active,#6338F6)] focus-visible:outline-none"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Assigned Interviews</span>
        </button>

        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--card)] border border-[var(--border)] rounded-3xl relative overflow-hidden shadow-xl"
        >
          {/* Solid Top Accent Bar */}
          <div className="absolute top-0 inset-x-0 h-1 bg-[var(--primary,#5B3AF2)]" />

          <div className="p-6 sm:p-8 space-y-6">

            {/* Header & Role Information */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)]/30 text-[11px] font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Official Candidate Assessment</span>
              </div>

              <h1 className="text-xl sm:text-2xl font-medium tracking-tight text-[var(--text-primary)]">
                {interview.title || "Technical Interview Assessment"}
              </h1>

              {interview.employer?.name && (
                <p className="text-xs text-[var(--text-secondary)] flex items-center justify-center gap-1.5 font-normal">
                  <Building2 className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  <span>Organized by {interview.employer.name}</span>
                </p>
              )}
            </div>

            {/* Neutral Overview Cards (Plain Borders) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-[var(--background)] rounded-2xl p-4 border border-[var(--border)] flex flex-col items-center justify-center text-center space-y-1">
                <Briefcase className="w-4 h-4 text-[var(--color-text-accent,#C4B5FD)]" />
                <span className="text-[11px] text-[var(--text-secondary)] font-normal">Target position</span>
                <span className="text-sm font-medium text-[var(--text-primary)] truncate max-w-full">
                  {interview.jobRole || "Software Engineer"}
                </span>
              </div>

              <div className="bg-[var(--background)] rounded-2xl p-4 border border-[var(--border)] flex flex-col items-center justify-center text-center space-y-1">
                <Clock className="w-4 h-4 text-[var(--color-text-accent,#C4B5FD)]" />
                <span className="text-[11px] text-[var(--text-secondary)] font-normal">Session duration</span>
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  {interview.duration || 15} Minutes
                </span>
              </div>

              <div className="bg-[var(--background)] rounded-2xl p-4 border border-[var(--border)] flex flex-col items-center justify-center text-center space-y-1">
                <Tag className="w-4 h-4 text-[var(--color-text-accent,#C4B5FD)]" />
                <span className="text-[11px] text-[var(--text-secondary)] font-normal">Experience tier</span>
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  {interview.experienceLevel || "All Levels"}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {/* Description */}
              {interview.description && (
                <div className="space-y-1.5">
                  <h2 className="text-xs font-medium text-[var(--text-primary)]">
                    About this interview
                  </h2>
                  <div className="bg-[var(--background)] rounded-2xl p-4 border border-[var(--border)] text-xs text-[var(--text-secondary)] font-normal leading-relaxed">
                    {interview.description}
                  </div>
                </div>
              )}

              {/* Topics Covered */}
              {interview.topics && interview.topics.length > 0 && (
                <div className="space-y-1.5">
                  <h2 className="text-xs font-medium text-[var(--text-primary)]">
                    Topics covered
                  </h2>
                  <div className="flex flex-wrap gap-1.5">
                    {interview.topics.map((t, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-[var(--background)] text-[var(--text-primary)] rounded-full text-xs font-normal border border-[var(--border)]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Instructions List with Semantic Bullets */}
              <div className="space-y-1.5">
                <h2 className="text-xs font-medium text-[var(--text-primary)] flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[var(--color-text-accent,#C4B5FD)]" />
                  <span>Important instructions</span>
                </h2>
                <div className="bg-[var(--background)] rounded-2xl p-4 border border-[var(--border)] space-y-2 text-xs text-[var(--text-secondary)] font-normal">
                  {/* Neutral Setup Guidance: Muted Bullet */}
                  <div className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] mt-1.5 shrink-0" />
                    <p className="leading-relaxed">
                      Ensure a stable internet connection, functional webcam, and clear microphone.
                    </p>
                  </div>
                  {/* Consequence Constraint: Warning-toned Bullet */}
                  <div className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <p className="leading-relaxed text-amber-200/90">
                      You cannot pause or restart the interview once it begins. Responses are scored in real time.
                    </p>
                  </div>
                </div>
              </div>

              {/* Start Action */}
              <div className="pt-3">
                {isInactive ? (
                  <div className="p-3 mb-3 text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl text-center">
                    This interview is no longer active.
                  </div>
                ) : hasAttempted ? (
                  <div className="p-3 mb-3 text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl text-center">
                    You have already completed this interview assessment.
                  </div>
                ) : null}

                <button
                  onClick={() => setShowCheckModal(true)}
                  disabled={isInactive || hasAttempted}
                  className="w-full py-3 px-6 bg-[var(--primary,#5B3AF2)] hover:bg-[var(--primary-hover,#472CD7)] text-white rounded-xl text-xs font-medium transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-[var(--color-border-active,#6338F6)] focus-visible:outline-none"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Continue to System Checks</span>
                </button>
              </div>

            </div>
          </div>
        </motion.div>
      </div>

      {/* Unified PreSessionCheckModal with isMock={false} */}
      <PreSessionCheckModal
        isOpen={showCheckModal}
        onClose={() => setShowCheckModal(false)}
        onConfirm={handleStartInterviewSession}
        isLaunching={isLaunching}
        isMock={false}
        roleTitle={interview.jobRole || interview.title}
        experienceLevel={interview.experienceLevel}
        duration={interview.duration || 15}
        creditCost={0}
        topics={interview.topics || []}
      />
    </div>
  );
};

export default InterviewInstructionsPage;
