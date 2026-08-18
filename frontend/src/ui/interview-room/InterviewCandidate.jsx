import { useEffect } from 'react';
import { CONVERSATION_STATES } from '../../modules/interview/conversation/index';
import { InterviewCamera } from '../../modules/camera/index';
import { useAuth } from '../../context/AuthContext';
import { useVoiceRecorder, RECORDING_STATES } from '../../hooks/useVoiceRecorder';
import { Mic, ArrowRight, Loader2, Video, CheckCircle2, ShieldAlert } from 'lucide-react';

const InterviewCandidate = ({
  conversationState,
  candidateTranscript,
  transcriptState,
  cameraStream,
  cameraState,
  cameraWarnings = [],
  cameraError = null,
  deviceSnapshot = null,
  faceSnapshot = null,
  browserStatus = null,
  activeViolations = [],
  setVideoElement = null,
  isAutomaticMode,
  isTranscribing,
  onRecordingComplete,
  onClearAnswer,
  onAnswerReady
}) => {
  const isListening = conversationState === CONVERSATION_STATES.LISTENING;
  const { user } = useAuth();

  const {
    recordingState,
    audioBlob,
    startRecording,
    stopRecording,
    deleteRecording,
  } = useVoiceRecorder();

  // Auto-start recording when listening
  useEffect(() => {
    if (isAutomaticMode && isListening && recordingState === RECORDING_STATES.IDLE) {
      startRecording();
    }
  }, [isAutomaticMode, isListening, recordingState, startRecording]);

  // Handle completed recording blob (auto or manual)
  useEffect(() => {
    if (recordingState === RECORDING_STATES.RECORDED && audioBlob) {
      if (onRecordingComplete) {
        onRecordingComplete(audioBlob);
        deleteRecording();
      }
    }
  }, [recordingState, audioBlob, onRecordingComplete, deleteRecording]);

  const handleManualSubmit = () => {
    if (recordingState === RECORDING_STATES.RECORDING) {
      // Force stop recording immediately. The effect above will catch the blob.
      stopRecording(false);
    } else if (candidateTranscript?.length > 0) {
      // If already recorded and transcribed, just submit the text
      onAnswerReady();
    }
  };

  const isRecordingActive = recordingState === RECORDING_STATES.RECORDING || isListening;
  const isSubmitDisabled = (!isRecordingActive && (!candidateTranscript || candidateTranscript.length < 2)) || isTranscribing;

  return (
    <div className="flex flex-col justify-between w-full lg:h-full lg:p-6 xl:p-8 lg:gap-5 min-h-0">
      {/* Candidate Header (Desktop Only) */}
      <div className="hidden lg:flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-success,#10B981)] shadow-[0_0_10px_rgba(16,185,129,0.8)] shrink-0" />
          <div className="text-[var(--color-text-secondary,#94A3B8)] text-xs font-semibold tracking-wide truncate">
            You (Candidate) <span className="text-[var(--color-text-muted,#6E7A8A)]">•</span> Live Camera Feed
          </div>
        </div>

        <div className="px-3 py-1 rounded-full bg-[var(--color-surface,#16161E)] border border-[var(--color-border,#232330)] text-xs font-medium text-[var(--color-success,#10B981)] flex items-center gap-1.5 shadow-sm shrink-0">
          <Video className="w-3.5 h-3.5 text-[var(--color-success,#10B981)] shrink-0" />
          <span>Camera Connected</span>
        </div>
      </div>

      {/* Camera Viewport Stage: Floating Corner PiP on Mobile, Card Stage with Centered 16:9 Frame on Desktop */}
      <div className="absolute top-5 right-5 sm:top-6 sm:right-6 w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border border-[var(--color-border,#232330)] shadow-2xl ring-1 ring-white/10 bg-[var(--color-surface,#16161E)] overflow-hidden z-30 lg:static lg:w-full lg:flex-1 lg:min-h-0 lg:rounded-[32px] lg:shadow-lg lg:flex lg:items-center lg:justify-center lg:p-6 group">
        
        {/* Centered 16:9 Camera Box on Desktop */}
        <div className="w-full h-full lg:w-full lg:max-w-[540px] lg:aspect-video lg:max-h-[44vh] lg:rounded-2xl lg:overflow-hidden lg:border lg:border-[var(--color-border-active,#6338F6)]/40 lg:shadow-xl lg:ring-1 lg:ring-white/10 relative flex items-center justify-center bg-black/40">
          <InterviewCamera
            stream={cameraStream}
            state={cameraState}
            warnings={cameraWarnings}
            error={cameraError}
            isRecording={isListening}
            deviceSnapshot={deviceSnapshot}
            faceSnapshot={faceSnapshot}
            browserStatus={browserStatus}
            activeViolations={activeViolations}
            setVideoElement={setVideoElement}
            compact={false}
            className="w-full h-full object-cover"
          />

          {/* Ambient Top Vignette (Desktop Only) */}
          <div className="hidden lg:block absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-10" />

          {/* Mobile PiP Corner Indicator Overlay */}
          <div className="lg:hidden absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between pointer-events-none z-20">
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[9px] font-bold text-white shadow">
              <span className={`w-1.5 h-1.5 rounded-full ${isListening ? 'bg-[var(--color-success,#10B981)] animate-pulse' : 'bg-slate-400'}`} />
              <span>YOU</span>
            </div>

            {activeViolations && activeViolations.length > 0 && (
              <div className="p-0.5 rounded-md bg-[var(--color-danger,#F43F5E)]/90 text-white shadow">
                <ShieldAlert className="w-3 h-3" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Single Primary CTA: Submit Answer & Continue */}
      <div className="w-full shrink-0">
        <button
          onClick={handleManualSubmit}
          disabled={isSubmitDisabled}
          className={`w-full py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2.5 shadow-md active:scale-[0.99] cursor-pointer ${
            isSubmitDisabled
              ? 'bg-[var(--color-surface-hover,#1E1E2A)] border border-[var(--color-border,#232330)] text-[var(--color-text-muted,#6E7A8A)] cursor-not-allowed opacity-50'
              : 'bg-[var(--color-primary,#5B3AF2)] hover:bg-[var(--color-primary-hover,#472CD7)] text-white shadow-[0_0_25px_rgba(91,58,242,0.35)] hover:shadow-[0_0_35px_rgba(91,58,242,0.5)]'
          }`}
        >
          {isTranscribing ? (
            <>
              <Loader2 className="w-4 sm:w-5 h-4 sm:h-5 animate-spin text-white" />
              <span>Processing Response...</span>
            </>
          ) : (
            <>
              <span>Submit Answer & Continue</span>
              <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default InterviewCandidate;
