import { useCallback, useState } from 'react';
import {
  useConversationState,
  createConversationTurn,
} from '../../modules/interview/conversation/index';
import { useInterviewRuntime, INTERVIEW_RUNTIME_STATES } from '../../modules/interview/runtime/index';
import { mergeTranscript } from '../../utils/mergeTranscript';
import InterviewAI from './InterviewAI';
import InterviewCandidate from './InterviewCandidate';
import { voiceService } from '../../services/voice.service';
import toast from 'react-hot-toast';
import { withRetry } from '../../utils/retryUtility';
import { runtimeDiagnostics } from '../../utils/diagnostics';

// Import modular styles
import './InterviewConversation.css';

const isInsufficientTranscript = (transcript) => {
  if (!transcript || typeof transcript !== 'string') return true;
  const cleaned = transcript.trim();
  // Filter out extremely short inputs that might just be noise
  return cleaned.length < 2;
};

/**
 * ConversationController
 *
 * Lightweight orchestration component responsible for coordinating:
 * - ConversationState (derived from interview + voice hooks)
 * - ConversationTurn (current turn model)
 * - AI section (InterviewAI)
 * - Candidate section (InterviewCandidate)
 *
 * Consumes the InterviewRuntime context for browser APIs (camera, recording)
 * rather than managing them directly.
 *
 * @param {object} props
 * @param {object} props.currentQuestion - Current question from useInterview
 * @param {object} props.answers - Answers map from useInterview
 * @param {boolean} props.isGenerating - From useInterview
 * @param {boolean} props.submitting - From useInterview
 * @param {boolean} props.isInterviewFinished - From useInterview
 * @param {object} props.voiceProps - From useQuestionVoice
 * @param {function} props.handleAnswerChange - From useInterview
 */
const ConversationController = ({
  currentQuestion,
  currentIndex,
  totalQuestions,
  answers,
  isGenerating,
  submitting,
  isInterviewFinished,
  voiceProps,
  handleAnswerChange,
  isAutomaticMode,
  onAnswerReady,
}) => {
  const [isTranscribing, setIsTranscribing] = useState(false);
  // ─── Consume Interview Runtime ────────────────────
  const { camera, runtime, device, face, browser, violations } = useInterviewRuntime();
  const { stream: cameraStream, cameraState, error: cameraError } = camera;
  const isRuntimeActive = runtime.state === INTERVIEW_RUNTIME_STATES.ACTIVE || runtime.state === INTERVIEW_RUNTIME_STATES.FINISHING;

  const { conversationState, statusMessage, transcriptState } = useConversationState({
    isGenerating,
    voiceState: voiceProps.voiceState,
    isInterviewFinished,
    submitting,
    isTranscribing,
  });

  // ─── Current Conversation Turn ────────────────────
  const currentTurn = createConversationTurn({
    question: currentQuestion,
    candidateAnswer: answers[currentQuestion?.id] || '',
    conversationState,
    transcriptState,
  });

  // Halt AI question until recording is fully active
  const aiTranscript = isRuntimeActive ? currentTurn.aiTranscript : 'Initializing interview...';


  // ─── Voice Transcript Handler ─────────────────────
  const handleRecordingComplete = useCallback(async (audioBlob) => {
    if (!currentQuestion || !audioBlob) return;

    setIsTranscribing(true);
    let transcriptionToastId = null;

    try {
      const response = await withRetry({
        operation: () => voiceService.transcribe(audioBlob),
        maxRetries: 3,
        retryDelay: 1000,
        shouldRetry: (error) => {
          // Retry on 5xx or network errors. Do not retry 400s (invalid audio)
          if (error.response && error.response.status < 500) return false;
          return true;
        },
        onRetry: (error, attempt) => {
          runtimeDiagnostics("RecoveryStarted", { context: "STT_RETRY", attempt, error });
          if (!transcriptionToastId) {
            transcriptionToastId = toast.loading(`Connection lost. Retrying (${attempt}/3)...`);
          } else {
            toast.loading(`Connection lost. Retrying (${attempt}/3)...`, { id: transcriptionToastId });
          }
        },
        onSuccess: (result, attempt) => {
          if (attempt > 0) {
            runtimeDiagnostics("RecoverySucceeded", { context: "STT_RETRY", attempt });
          }
        },
        onFailure: (error, attempt) => {
          runtimeDiagnostics("RecoveryFailed", { context: "STT_FAILED_FINAL", attempt, error });
        }
      });

      if (transcriptionToastId) {
        toast.dismiss(transcriptionToastId);
      }

      if (response.success && response.transcript !== undefined) {
        if (isInsufficientTranscript(response.transcript)) {
          runtimeDiagnostics("RecoveryStarted", { context: "STT_INSUFFICIENT_TRANSCRIPT", transcript: response.transcript });
          toast("I couldn't clearly understand your answer. Please answer the question again.", { icon: "⚠️" });

          // Wait 1.5s to let the user read before restarting listening
          setTimeout(() => {
            setIsTranscribing(false);
          }, 1500);
          return;
        }

        // Merge transcript with any existing answer
        const currentAnswer = answers[currentQuestion.id] || '';
        const newText = mergeTranscript(currentAnswer, response.transcript);

        handleAnswerChange(currentQuestion.id, newText);

        // Notify parent that the answer is completely ready
        if (onAnswerReady) {
          onAnswerReady(newText);
        }

        // Clear isTranscribing synchronously since we succeeded
        setIsTranscribing(false);
      } else {
        throw new Error("Failed to get transcript from response");
      }
    } catch (err) {
      if (transcriptionToastId) {
        toast.dismiss(transcriptionToastId);
      }
      toast.error("Transcription failed after multiple attempts. Please try speaking again.");
      setIsTranscribing(false);
    }
  }, [currentQuestion, answers, handleAnswerChange, onAnswerReady, setIsTranscribing]);

  const handleClearAnswer = useCallback(() => {
    if (!currentQuestion) return;
    handleAnswerChange(currentQuestion.id, '');
  }, [currentQuestion, handleAnswerChange]);

  // ─── Render ───────────────────────────────────────
  return (
    <div className="relative flex flex-col h-full w-full bg-[var(--color-canvas,#0B0B0E)] p-3 sm:p-4 gap-2.5 sm:gap-3 overflow-hidden lg:grid lg:grid-cols-2 lg:p-0 lg:gap-0 lg:divide-x lg:divide-[var(--color-border,#232330)]">
      {/* AI Section */}
      <section
        className="flex-1 min-h-0 flex flex-col justify-between lg:h-full overflow-hidden"
        aria-label="AI Section"
      >
        <InterviewAI
          currentQuestion={currentQuestion}
          currentIndex={currentIndex}
          totalQuestions={totalQuestions}
          conversationState={conversationState}
          statusMessage={statusMessage}
          aiTranscript={aiTranscript}
          onReplay={voiceProps?.replay}
          audioRef={voiceProps?.audioRef}
        />
      </section>

      {/* Candidate Section (Floating PiP & Bottom Submit on Mobile, Right Column on Desktop) */}
      <section
        className="shrink-0 w-full lg:flex-1 lg:h-full lg:min-h-0"
        aria-label="Candidate Section"
      >
        <InterviewCandidate
          conversationState={conversationState}
          candidateTranscript={currentTurn.candidateTranscript}
          transcriptState={transcriptState}
          cameraStream={cameraStream}
          cameraState={cameraState}
          cameraWarnings={camera.warnings}
          cameraError={cameraError}
          deviceSnapshot={device?.snapshot}
          faceSnapshot={face?.snapshot}
          browserStatus={browser?.status}
          activeViolations={violations?.active}
          setVideoElement={face?.setVideoElement}
          isAutomaticMode={isAutomaticMode}
          isTranscribing={isTranscribing}
          onRecordingComplete={handleRecordingComplete}
          onClearAnswer={handleClearAnswer}
          onAnswerReady={() => onAnswerReady(answers[currentQuestion?.id] || '')}
        />
      </section>
    </div>
  );
};

export default ConversationController;
