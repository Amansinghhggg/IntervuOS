import React from 'react';
import { CONVERSATION_STATES } from '../../modules/interview/conversation/index';
import AIAvatar from '../../features/interview/components/AIAvatar/AIAvatar';
import { AvatarState } from '../../features/interview/components/AIAvatar/types';
import { Volume2, Loader2, HelpCircle } from 'lucide-react';

const InterviewAI = ({
  currentQuestion,
  currentIndex = 0,
  totalQuestions = 1,
  conversationState,
  statusMessage,
  aiTranscript,
  onReplay,
  audioRef
}) => {
  const isSpeaking = conversationState === CONVERSATION_STATES.SPEAKING;
  const isThinking = conversationState === CONVERSATION_STATES.THINKING || conversationState === CONVERSATION_STATES.ANALYZING;
  const isError = conversationState === CONVERSATION_STATES.ERROR;
  const isActive = isSpeaking || conversationState === CONVERSATION_STATES.LISTENING;

  const getAvatarState = () => {
    if (conversationState === CONVERSATION_STATES.SPEAKING) return AvatarState.SPEAKING;
    if (conversationState === CONVERSATION_STATES.THINKING || conversationState === CONVERSATION_STATES.ANALYZING) return AvatarState.THINKING;
    if (conversationState === CONVERSATION_STATES.LISTENING) return AvatarState.LISTENING;
    return AvatarState.IDLE;
  };

  return (
    <div className="flex flex-col relative w-full h-full p-3 sm:p-4 lg:p-6 xl:p-8 justify-between gap-2.5 sm:gap-4 lg:gap-5 min-h-0">

      {/* AI Header (Hidden on small mobile to maximize avatar space, visible on tablet/desktop) */}
      <div className="hidden sm:flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary,#5B3AF2)] shadow-[0_0_10px_rgba(91,58,242,0.8)]" />
          <div className="text-[var(--color-text-secondary,#94A3B8)] text-xs font-semibold tracking-wide">
            AI Interviewer <span className="text-[var(--color-text-muted,#6E7A8A)]">•</span> IntervuOS
          </div>
        </div>
      </div>

      {/* Avatar Container */}
      <div className="relative flex-1 min-h-0 w-full rounded-2xl sm:rounded-3xl lg:rounded-[32px] overflow-hidden border border-[var(--color-border,#232330)] bg-[var(--color-surface,#16161E)] shadow-lg flex items-center justify-center group">
        <AIAvatar state={getAvatarState()} audioElement={audioRef} />

        {/* Status Badge Overlay */}
        <div className="absolute bottom-2.5 sm:bottom-4 left-2.5 right-2.5 sm:left-4 sm:right-4 bg-[var(--color-canvas,#0B0B0E)]/90 backdrop-blur-md p-2.5 sm:p-3 rounded-xl sm:rounded-2xl flex items-center justify-between border border-[var(--color-border,#232330)] shadow-lg z-20">
          <div className="flex items-center gap-2">
            <span className="text-[var(--color-text-secondary,#94A3B8)] text-xs font-medium hidden sm:inline">
              Interviewer
            </span>
            <span className="text-[var(--color-text-primary,#FFFFFF)] text-xs font-semibold sm:hidden">
              AI
            </span>
          </div>

          <div className={`px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium flex items-center gap-1.5 border ${
            isError
              ? 'bg-[var(--color-danger)]/15 text-[var(--color-danger)] border-[var(--color-danger)]/30' :
              isSpeaking
                ? 'bg-[var(--color-success)]/15 text-[var(--color-success)] border-[var(--color-success)]/30' :
                isThinking
                  ? 'bg-[var(--color-primary-tint)] text-[var(--color-text-accent)] border-[var(--color-border-active)]' :
                  'bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] border-[var(--color-border)]'
          }`}>
            {isSpeaking && <span className="w-2 h-2 rounded-full bg-[var(--color-success)] animate-pulse" />}
            {isThinking && <Loader2 className="w-3 h-3 animate-spin text-[var(--color-text-accent)]" />}
            <span>{statusMessage || (isSpeaking ? 'AI Speaking' : isThinking ? 'Processing...' : 'AI Listening')}</span>
          </div>
        </div>
      </div>

      {/* Bottom - Question Prompt Card */}
      <div className="bg-[var(--color-surface,#16161E)] border border-[var(--color-border,#232330)] rounded-2xl p-4 sm:p-5 shadow-lg backdrop-blur-xl relative group w-full shrink-0">
        {onReplay && (
          <button
            onClick={onReplay}
            className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 px-2.5 py-1.5 rounded-xl bg-[var(--color-surface-hover,#1E1E2A)] hover:bg-[var(--color-primary,#5B3AF2)] text-[var(--color-text-primary,#FFFFFF)] border border-[var(--color-border,#232330)] hover:border-[var(--color-border-active,#6338F6)] transition-all duration-200 shadow-sm flex items-center gap-1.5 group/btn cursor-pointer active:scale-95 shrink-0 z-10"
            title="Repeat question audio"
            aria-label="Repeat question audio"
          >
            <Volume2 className="w-3.5 h-3.5 text-[var(--color-text-accent,#C4B5FD)] group-hover/btn:text-white transition-colors" />
            <span className="text-xs font-medium">Repeat</span>
          </button>
        )}

        <p className="text-[var(--color-text-primary,#FFFFFF)] text-xs sm:text-sm md:text-base leading-relaxed font-medium max-h-[16vh] sm:max-h-[20vh] overflow-y-auto pr-18 sm:pr-20">
          "{currentQuestion?.question || "Initializing question..."}"
        </p>
      </div>
    </div>
  );
};

export default InterviewAI;
