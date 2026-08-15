import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";
import {
  Camera,
  Mic,
  Globe,
  Monitor,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  Loader2,
  ArrowLeft,
  Clock,
  Briefcase,
  Brain,
  Tag,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import ResumeUploadModal from "./components/ResumeUploadModal";

const MockPreInterviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [loadingInterview, setLoadingInterview] = useState(true);
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [checks, setChecks] = useState({
    camera: { status: "pending" },
    mic: { status: "pending" },
    browser: { status: "pending" },
    internet: { status: "pending" }
  });

  // Fetch interview details
  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const { data } = await api.get(`/interviews/${id}`);
        if (data.success) {
          setInterview(data.interview);
        }
      } catch (error) {
        toast.error("Failed to load interview details");
        navigate("/candidate/mock-interview");
      } finally {
        setLoadingInterview(false);
      }
    };
    fetchInterview();
  }, [id]);

  // System checks
  const performChecks = async () => {
    let isOnline = false;
    try {
      const { data } = await api.get("/health");
      isOnline = data.success;
    } catch (error) {
      isOnline = navigator.onLine ? true : false;
    }
    setChecks(prev => ({ ...prev, internet: { status: isOnline ? "success" : "error" } }));

    const isBrowserCompatible = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    setChecks(prev => ({ ...prev, browser: { status: isBrowserCompatible ? "success" : "error" } }));

    if (isBrowserCompatible) {
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setChecks(prev => ({ ...prev, camera: { status: "success", error: null } }));
        videoStream.getTracks().forEach(track => track.stop());
      } catch (error) {
        setChecks(prev => ({
          ...prev,
          camera: { status: "error", error: error.name === 'NotFoundError' ? 'No camera found' : error.message }
        }));
      }

      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setChecks(prev => ({ ...prev, mic: { status: "success", error: null } }));
        audioStream.getTracks().forEach(track => track.stop());
      } catch (error) {
        setChecks(prev => ({
          ...prev,
          mic: { status: "error", error: error.name === 'NotFoundError' ? 'No microphone found' : error.message }
        }));
      }
    }
  };

  useEffect(() => {
    performChecks();

    const handleOnline = () => setChecks(prev => ({ ...prev, internet: { status: "success" } }));
    const handleOffline = () => setChecks(prev => ({ ...prev, internet: { status: "error" } }));

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const allChecksPassed = Object.values(checks).every(check => check.status === "success");

  const { user } = useAuth();
  const [showResumeModal, setShowResumeModal] = useState(false);

  const startInterviewSession = async () => {
    setLoading(true);

    try {
      const { data } = await api.post(`/interviews/${id}/start`);
      if (data.success) {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
          elem.requestFullscreen().catch((err) => {
            console.warn("Fullscreen request failed:", err);
          });
        }

        toast.success("Mock Interview Starting!");
        navigate(`/candidate/interviews/${id}/live`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to start interview");
    } finally {
      setLoading(false);
    }
  };

  const handleStartInterview = async () => {
    if (!allChecksPassed) return;

    if (user?.role === "candidate" && !user?.resume?.url) {
      setShowResumeModal(true);
      return;
    }

    startInterviewSession();
  };

  const getStatusIcon = (status) => {
    if (status === "pending") return <Loader2 className="w-4 h-4 animate-spin text-[var(--color-on-surface-variant)]" />;
    if (status === "success") return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    return <XCircle className="w-4 h-4 text-[var(--color-error)]" />;
  };

  if (loadingInterview) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary-md3)]" />
      </div>
    );
  }

  if (!interview) return null;

  return (
    <div className="bg-[var(--background)] min-h-screen w-full font-['Inter'] flex flex-col items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-2xl">

        <button
          onClick={() => navigate('/candidate/mock-interview')}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--color-surface-variant)]/50 hover:bg-[var(--color-surface-variant)] text-[var(--color-on-surface)] rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors border border-[var(--color-outline-variant)]/30 mb-4"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to Studio
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/30 rounded-3xl relative overflow-hidden shadow-2xl"
        >
          {/* Accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--color-primary-md3)] via-purple-500 to-[var(--color-tertiary)]" />

          <div className="p-5 sm:p-6">

            {/* Mock Interview Badge */}
            <div className="text-center mb-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-primary-md3)]/10 border border-[var(--color-primary-md3)]/30 text-[var(--color-primary-md3)] text-[9px] font-black uppercase tracking-widest mb-3">
                <Sparkles className="w-3 h-3" /> AI Mock Interview
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[var(--color-on-surface)] tracking-tight uppercase">
                {interview.title || interview.jobRole}
              </h1>
            </div>

            {/* Interview Details Grid */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              <div className="bg-[var(--color-surface-container-highest)]/20 rounded-xl p-3 flex flex-col items-center justify-center text-center border border-[var(--color-outline-variant)]/20">
                <Clock className="w-4 h-4 text-[var(--color-warning)] mb-1" />
                <p className="text-[8px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-0.5">Duration</p>
                <p className="text-sm font-black text-[var(--color-on-surface)]">{interview.duration} Min</p>
              </div>
              <div className="bg-[var(--color-surface-container-highest)]/20 rounded-xl p-3 flex flex-col items-center justify-center text-center border border-[var(--color-outline-variant)]/20">
                <Tag className="w-4 h-4 text-emerald-400 mb-1" />
                <p className="text-[8px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-0.5">Level</p>
                <p className="text-sm font-black text-[var(--color-on-surface)] uppercase">{interview.experienceLevel}</p>
              </div>
              <div className="bg-[var(--color-surface-container-highest)]/20 rounded-xl p-3 flex flex-col items-center justify-center text-center border border-[var(--color-outline-variant)]/20">
                <Briefcase className="w-4 h-4 text-[var(--color-primary-md3)] mb-1" />
                <p className="text-[8px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-0.5">Role</p>
                <p className="text-sm font-black text-[var(--color-on-surface)] truncate max-w-full">{interview.jobRole}</p>
              </div>
            </div>

            {/* Topics */}
            {interview.topics && interview.topics.length > 0 && (
              <div className="mb-5">
                <h3 className="text-[9px] font-black text-[var(--color-on-surface-variant)] uppercase tracking-widest mb-2">
                  Topics Covered
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {interview.topics.map((t, index) => (
                    <span key={index} className="px-2.5 py-1 bg-[var(--color-surface-container-highest)]/30 text-[var(--color-on-surface)] rounded-full text-[8px] font-black uppercase tracking-widest border border-[var(--color-outline-variant)]/20">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-[var(--color-outline-variant)]/30 my-4" />

            {/* System Checks */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center border border-[var(--primary)]/20">
                  <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-text-accent)]" />
                </div>
                <h2 className="text-sm font-medium text-[var(--color-on-surface)]">
                  Hardware & Network Verification
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  { key: "camera", icon: Camera, label: "Camera", successText: "Verified" },
                  { key: "mic", icon: Mic, label: "Microphone", successText: "Verified" },
                  { key: "internet", icon: Globe, label: "Internet", successText: "Connected" },
                  { key: "browser", icon: Monitor, label: "Browser", successText: "Compatible" },
                ].map(({ key, icon: Icon, label }) => (
                  <div
                    key={key}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors ${
                      checks[key].status === "success"
                        ? "bg-emerald-500/5 border-emerald-500/20"
                        : checks[key].status === "error"
                        ? "bg-[var(--color-error)]/5 border-[var(--color-error)]/20"
                        : "bg-[var(--color-surface-container-highest)]/20 border-[var(--color-outline-variant)]/30"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-[var(--color-surface-variant)] flex items-center justify-center">
                        <Icon className="w-3 h-3 text-[var(--color-on-surface-variant)]" />
                      </div>
                      <span className="text-[var(--color-on-surface)] text-[10px] font-medium">{label}</span>
                    </div>
                    {getStatusIcon(checks[key].status)}
                  </div>
                ))}
              </div>

              {/* Requirement 1: Pre-Launch Privacy & Transparency Disclosure Panel */}
              <div className="p-4 rounded-2xl bg-[var(--background)] border border-[var(--border)] space-y-3 mb-4 text-left">
                <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-primary)]">
                  <ShieldCheck className="w-4 h-4 text-[var(--color-text-accent)]" />
                  <span>Session Privacy & Recording Transparency</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-[var(--text-secondary)]">
                  <div className="p-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)]">
                    <p className="font-medium text-[var(--text-primary)] mb-0.5">Recorded</p>
                    <p className="leading-tight">Microphone audio for real-time STAR evaluation.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)]">
                    <p className="font-medium text-[var(--text-primary)] mb-0.5">Retention</p>
                    <p className="leading-tight">30-day encrypted storage in your private account.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)]">
                    <p className="font-medium text-[var(--text-primary)] mb-0.5">Human Review</p>
                    <p className="leading-tight">100% Private AI. No recruiter sees practice runs.</p>
                  </div>
                </div>

                <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-[var(--border)] bg-[var(--card)] text-[var(--primary)] focus:ring-[var(--color-border-active)] cursor-pointer"
                  />
                  <span className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    I acknowledge audio capture for AI evaluation, 30-day retention, and confirm device setup.
                  </span>
                </label>
              </div>
            </div>

            {/* Error message */}
            {!allChecksPassed && Object.values(checks).some(c => c.status === "error") && (
              <div className="mb-4 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 flex items-start gap-2.5 text-left text-xs">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
                <div>
                  <p className="font-medium text-rose-300">Device verification failed</p>
                  <p className="text-[11px] text-rose-300/80 mt-0.5">
                    Please allow camera/microphone access in your browser address bar and click Retry. No session has been started or penalized.
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            {!allChecksPassed ? (
              <button
                onClick={performChecks}
                className="w-full py-3 bg-[var(--color-surface-variant)] hover:bg-[var(--color-surface-variant)]/80 text-[var(--color-on-surface)] border border-[var(--color-outline-variant)]/30 rounded-xl text-xs font-medium transition-all focus-visible:ring-2 focus-visible:ring-[var(--color-border-active)] focus-visible:outline-none"
              >
                Retry Device Checks
              </button>
            ) : (
              <button
                onClick={handleStartInterview}
                disabled={loading || !agreedToTerms}
                className="w-full py-3.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-xl text-xs font-medium transition-all shadow-sm flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed group focus-visible:ring-2 focus-visible:ring-[var(--color-border-active)] focus-visible:outline-none"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2 fill-current group-hover:scale-110 transition-transform" />}
                {loading ? "Initializing..." : "Begin Mock Interview Session"}
              </button>
            )}
          </div>
        </motion.div>

        <ResumeUploadModal
          isOpen={showResumeModal}
          onSuccess={() => {
            setShowResumeModal(false);
            startInterviewSession();
          }}
          onClose={() => setShowResumeModal(false)}
        />
      </div>
    </div>
  );
};

export default MockPreInterviewPage;
