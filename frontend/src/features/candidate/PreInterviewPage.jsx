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
  ArrowLeft
} from "lucide-react";
import { motion } from "framer-motion";
import { GlassCard } from "../../ui/primitives/GlassCard";
import { StatusBadge } from "../../ui/primitives/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import ResumeUploadModal from "./components/ResumeUploadModal";
import { MicVolumeMeter } from "./components/MicVolumeMeter";

const PreInterviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const [checks, setChecks] = useState({
    camera: { status: "pending" }, // pending, success, error
    mic: { status: "pending" },
    browser: { status: "pending" },
    internet: { status: "pending" }
  });

  const performChecks = async () => {
    // 1. Check Internet / Backend Health
    let isOnline = false;
    try {
      const { data } = await api.get("/health");
      isOnline = data.success;
    } catch (error) {
      isOnline = navigator.onLine ? true : false;
      if (!navigator.onLine) console.warn("Backend health check failed and navigator is offline.");
    }
    setChecks(prev => ({ ...prev, internet: { status: isOnline ? "success" : "error" } }));

    // 2. Check Browser
    const isBrowserCompatible = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    setChecks(prev => ({ ...prev, browser: { status: isBrowserCompatible ? "success" : "error" } }));

    if (isBrowserCompatible) {
      // 3. Check Camera
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

      // 4. Check Mic
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
  const canStart = allChecksPassed && agreed;

  const { user } = useAuth();
  const [showResumeModal, setShowResumeModal] = useState(false);

  const startInterviewSession = async () => {
    setLoading(true);

    try {
      const { data } = await api.post(`/interviews/${id}/start`);
      if (data.success) {
        // Request Fullscreen
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
          elem.requestFullscreen().catch((err) => {
            console.warn("Fullscreen request failed:", err);
          });
        }

        toast.success("Interview Started!");
        navigate(`/candidate/interviews/${id}/live`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to start interview");
    } finally {
      setLoading(false);
    }
  };

  const handleStartInterview = async () => {
    if (!canStart) return;

    if (user?.role === "candidate" && !user?.resume?.url) {
      setShowResumeModal(true);
      return;
    }

    startInterviewSession();
  };

  const getStatusDisplay = (status, text) => {
    if (status === "pending") {
      return (
        <div className="flex items-center gap-2 text-[var(--color-on-surface-variant)]">
          <span className="text-[10px] font-bold uppercase tracking-widest">Checking</span>
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      );
    }
    if (status === "success") {
      return (
        <div className="flex items-center gap-2 text-[var(--color-success)]">
          <span className="text-[10px] font-bold uppercase tracking-widest">{text}</span>
          <CheckCircle2 className="w-4 h-4" />
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 text-[var(--color-error)]">
        <span className="text-[10px] font-bold uppercase tracking-widest">Failed</span>
        <XCircle className="w-4 h-4" />
      </div>
    );
  };

  return (
    <div className="bg-transparent min-h-screen w-full font-['Inter'] flex flex-col items-center justify-center p-4 text-[var(--color-on-surface,#dae2fd)]">
      <div className="w-full max-w-2xl space-y-4">

        <button
          onClick={() => navigate(`/candidate/interviews/${id}`)}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--color-surface-variant)]/50 hover:bg-[var(--color-surface-variant)] text-[var(--color-on-surface)] rounded-xl text-xs font-black uppercase tracking-wider transition-colors border border-[var(--color-outline-variant)]/30"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard padding="p-6 sm:p-8" glowEffect>
            <div className="mb-6 text-center">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center mx-auto mb-3 text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-black text-[var(--color-on-surface)] mb-1 tracking-tight uppercase">
                Hardware System Verification
              </h1>
              <p className="text-[var(--color-on-surface-variant)] text-xs font-medium max-w-md mx-auto leading-relaxed">
                Ensure your camera, microphone, and browser meet live interview requirements.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {/* Check Item 1 */}
              <div className="flex flex-col p-3 bg-[var(--color-surface-container-highest)]/25 rounded-2xl border border-[var(--color-outline-variant)]/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[var(--color-surface-variant)] flex items-center justify-center">
                      <Camera className="w-4 h-4 text-[var(--color-primary-md3)]" />
                    </div>
                    <span className="text-[var(--color-on-surface)] text-xs font-bold uppercase tracking-wider">Camera</span>
                  </div>
                  {getStatusDisplay(checks.camera.status, "Verified")}
                </div>
                {checks.camera.status === 'error' && checks.camera.error && (
                  <p className="mt-1.5 text-[10px] text-rose-400 font-bold uppercase tracking-widest pl-10 truncate">{checks.camera.error}</p>
                )}
              </div>

              {/* Check Item 2 */}
              <div className="flex flex-col p-3 bg-[var(--color-surface-container-highest)]/25 rounded-2xl border border-[var(--color-outline-variant)]/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[var(--color-surface-variant)] flex items-center justify-center">
                      <Mic className="w-4 h-4 text-[var(--color-primary-md3)]" />
                    </div>
                    <span className="text-[var(--color-on-surface)] text-xs font-bold uppercase tracking-wider">Microphone</span>
                  </div>
                  {getStatusDisplay(checks.mic.status, "Verified")}
                </div>
                {checks.mic.status === 'success' && <MicVolumeMeter />}
                {checks.mic.status === 'error' && checks.mic.error && (
                  <p className="mt-1.5 text-[10px] text-rose-400 font-bold uppercase tracking-widest pl-10 truncate">{checks.mic.error}</p>
                )}
              </div>

              {/* Check Item 3 */}
              <div className="flex flex-col p-3 bg-[var(--color-surface-container-highest)]/25 rounded-2xl border border-[var(--color-outline-variant)]/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[var(--color-surface-variant)] flex items-center justify-center">
                      <Globe className="w-4 h-4 text-[var(--color-secondary)]" />
                    </div>
                    <span className="text-[var(--color-on-surface)] text-xs font-bold uppercase tracking-wider">Connection</span>
                  </div>
                  {getStatusDisplay(checks.internet.status, "Online")}
                </div>
              </div>

              {/* Check Item 4 */}
              <div className="flex flex-col p-3 bg-[var(--color-surface-container-highest)]/25 rounded-2xl border border-[var(--color-outline-variant)]/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[var(--color-surface-variant)] flex items-center justify-center">
                      <Monitor className="w-4 h-4 text-[var(--color-secondary)]" />
                    </div>
                    <span className="text-[var(--color-on-surface)] text-xs font-bold uppercase tracking-wider">Browser</span>
                  </div>
                  {getStatusDisplay(checks.browser.status, "Compatible")}
                </div>
              </div>
            </div>

            {/* Requirement 1: Pre-Launch Disclosure Panel for Employer Campaign */}
            <div className="p-4 rounded-2xl bg-[var(--background,#0B0B0E)] border border-[var(--border,#232330)] space-y-3 mb-6 text-left">
              <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-primary)]">
                <CheckCircle2 className="w-4 h-4 text-[var(--color-text-accent,#C4B5FD)]" />
                <span>Candidate Assessment Disclosure & Recording Terms</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-[var(--text-secondary)]">
                <div className="p-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)]">
                  <p className="font-medium text-[var(--text-primary)] mb-0.5">Capture</p>
                  <p className="leading-tight">Audio & video response recording for structured interview scoring.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)]">
                  <p className="font-medium text-[var(--text-primary)] mb-0.5">Retention</p>
                  <p className="leading-tight">Encrypted evaluation records retained for the duration of this hiring cycle.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)]">
                  <p className="font-medium text-[var(--text-primary)] mb-0.5">Hiring Review</p>
                  <p className="leading-tight">Evaluated by IntervuOS AI and reviewed exclusively by the company hiring team.</p>
                </div>
              </div>
            </div>

            {!allChecksPassed && (
              <div className="mb-4 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 flex items-start gap-2.5 text-left text-xs">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
                <div>
                  <p className="font-medium text-rose-300">Device verification incomplete</p>
                  <p className="text-[11px] text-rose-300/80 mt-0.5">
                    Please allow camera and microphone access in your browser to proceed. Your evaluation has not begun and you have not been penalized.
                  </p>
                </div>
              </div>
            )}

            {!allChecksPassed ? (
              <button
                onClick={performChecks}
                className="w-full py-3.5 bg-[var(--color-surface-variant)] hover:bg-[var(--color-surface-variant)]/80 text-[var(--color-on-surface)] border border-[var(--color-outline-variant)]/30 rounded-xl text-xs font-medium transition-all focus-visible:ring-2 focus-visible:ring-[var(--color-border-active)] focus-visible:outline-none"
              >
                Retry Hardware Checks
              </button>
            ) : (
              <div className="space-y-4 pt-4 border-t border-[var(--color-outline-variant)]/30">
                <label className="flex items-start justify-start gap-3 cursor-pointer group p-2 rounded-xl bg-[var(--primary-tint,rgba(99,56,246,0.15))] border border-[var(--color-border-active,#6338F6)]/30 text-left select-none">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-[var(--border)] bg-[var(--card)] text-[var(--primary)] focus:ring-[var(--color-border-active)] cursor-pointer"
                  />
                  <span className="text-[var(--text-primary)] text-xs font-normal leading-relaxed">
                    I acknowledge audio/video recording for candidate evaluation, agree to session terms, and consent to authorized hiring team review.
                  </span>
                </label>

                <button
                  onClick={handleStartInterview}
                  disabled={!canStart || loading}
                  className="w-full py-3.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-xl text-xs font-medium transition-all shadow-sm flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed group focus-visible:ring-2 focus-visible:ring-[var(--color-border-active)] focus-visible:outline-none"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2 fill-current group-hover:scale-110 transition-transform" />}
                  {loading ? "Initializing..." : "Begin Candidate Interview Session"}
                </button>
              </div>
            )}
          </GlassCard>
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

export default PreInterviewPage;
