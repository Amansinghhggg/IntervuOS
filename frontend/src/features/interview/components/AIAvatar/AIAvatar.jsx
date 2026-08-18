import React from 'react';
import { useMotionValue } from 'framer-motion';
import { AvatarState } from './types';
import { useAudioEngine } from './useAudioEngine';
import { useAnimationEngine } from './useAnimationEngine';
import AvatarPlayer from '../../../../components/AvatarPlayer';
import AvatarWaveform from './renderers/components/AvatarWaveform';
import { cn } from "../../../../utils/cn";
import { Mic, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AIAvatar({ 
  state = AvatarState.IDLE, 
  audioElement, 
  className 
}) {
  // Initialize highly performant MotionValues
  const mouthOpen = useMotionValue(0);     // 0 to 1
  const eyeBlink = useMotionValue(1);      // 1 (open) to 0.1 (closed)
  const headRotation = useMotionValue(0);  // degrees (-x to +x)
  const breathScale = useMotionValue(1);   // 1 to 1.01
  const eyeLookX = useMotionValue(0);      // pixels offset for pupils

  // Start internal engines decoupled from UI rendering
  useAudioEngine(audioElement, mouthOpen, state);
  useAnimationEngine(state, { eyeBlink, headRotation, breathScale, eyeLookX });

  const getMode = () => {
    if (state === AvatarState.SPEAKING || state === 'speaking') return 'speaking';
    if (state === AvatarState.THINKING || state === 'thinking') return 'thinking';
    if (state === AvatarState.LISTENING || state === 'listening') return 'listening';
    return 'idle';
  };

  return (
    <div
      className={cn(
        "relative w-40 h-40 sm:w-52 sm:h-52 md:w-72 md:h-72 lg:w-88 lg:h-88 xl:w-96 xl:h-96 max-h-[36vh] max-w-[36vh] sm:max-h-none sm:max-w-none aspect-square rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-xl bg-gradient-to-b from-[#1c1c24] to-[#0a0a0f] border border-[var(--color-border,#232330)] flex items-center justify-center group transition-all duration-300",
        state === AvatarState.SPEAKING && "ring-2 ring-[var(--color-primary,#5B3AF2)] ring-offset-2 ring-offset-[var(--color-canvas,#0B0B0E)] shadow-lg shadow-[var(--color-primary)]/20",
        state === AvatarState.THINKING && "ring-1 ring-[var(--color-primary,#5B3AF2)] ring-offset-2 ring-offset-[var(--color-canvas,#0B0B0E)]",
        className
      )}
    >
      {/* 3-State Avatar Player (talking.mp4 / idle.mp4 / still.jpg) */}
      <AvatarPlayer 
        mode={getMode()}
        aspectRatio="1 / 1"
        className="w-full h-full rounded-none"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 z-20 pointer-events-none" />

      {/* State Indicators (Waveform / Status Badges) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center w-full px-8 z-30">
        
        <AnimatePresence mode="wait">
          {state === AvatarState.SPEAKING && (
            <motion.div
              key="waveform"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4"
            >
               <AvatarWaveform mouthOpen={mouthOpen} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {state === AvatarState.LISTENING && (
            <motion.div
              key="listening"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white shadow-xl"
            >
              <div className="relative flex items-center justify-center w-5 h-5">
                <div className="absolute w-full h-full bg-[var(--color-success)] rounded-full animate-ping opacity-20" />
                <Mic className="w-4 h-4 text-[var(--color-success)]" />
              </div>
              <span className="text-sm font-medium tracking-wide">Listening...</span>
            </motion.div>
          )}

          {state === AvatarState.THINKING && (
            <motion.div
              key="thinking"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white shadow-xl"
            >
              <Loader2 className="w-4 h-4 text-[var(--primary)] animate-spin" />
              <span className="text-sm font-medium tracking-wide">Processing...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
