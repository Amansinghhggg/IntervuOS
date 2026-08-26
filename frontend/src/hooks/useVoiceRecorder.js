import { useState, useRef, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { VoiceErrors } from "../utils/voiceErrors";
import { VOICE_CONFIG } from "../config/voice.config";
import { runtimeDiagnostics } from "../utils/diagnostics";

export const RECORDING_STATES = {
  IDLE: "IDLE",
  RECORDING: "RECORDING",
  RECORDED: "RECORDED",
  ERROR: "ERROR",
};

/**
 * Detects the best supported Opus MIME type supported by the browser
 */
const getSupportedMimeType = () => {
  const preferredTypes = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/mp4",
    "audio/aac",
  ];

  if (typeof window !== "undefined" && window.MediaRecorder && typeof MediaRecorder.isTypeSupported === "function") {
    for (const type of preferredTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
  }

  return "audio/webm";
};

export const useVoiceRecorder = () => {
  const [recordingState, setRecordingState] = useState(RECORDING_STATES.IDLE);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioSizeKB, setAudioSizeKB] = useState(0);
  const [duration, setDuration] = useState(0); // in milliseconds
  const [error, setError] = useState(null);
  const [isSilenceWarning, setIsSilenceWarning] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const activeMimeTypeRef = useRef("audio/webm");

  const startTimeRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // Web Audio API refs for Voice Activity Detection (VAD)
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const silenceStartRef = useRef(null);
  const animationFrameRef = useRef(null);
  const isRecordingRef = useRef(false);
  const hasSpokenRef = useRef(false);

  const cleanup = useCallback(() => {
    isRecordingRef.current = false;

    // 1. Clear timers and animation frames
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // 2. Stop Web Audio API
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(console.error);
    }
    audioContextRef.current = null;
    analyserRef.current = null;
    sourceRef.current = null;
    silenceStartRef.current = null;

    // 3. Stop media stream tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
        track.enabled = false;
      });
      streamRef.current = null;
    }

    // 4. Revoke Object URL to prevent memory leaks
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    setIsSilenceWarning(false);
    setIsSpeaking(false);
  }, [audioUrl]);

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  const stopRecording = useCallback((isAutoStop = false) => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      const elapsed = Date.now() - (startTimeRef.current || Date.now());

      if (!isAutoStop && elapsed < VOICE_CONFIG.MIN_RECORDING_DURATION_MS) {
        toast.error(`Recording must be at least ${VOICE_CONFIG.MIN_RECORDING_DURATION_MS / 1000} second.`);
        mediaRecorderRef.current.stop();
        cleanup();
        setRecordingState(RECORDING_STATES.IDLE);
        return;
      }

      mediaRecorderRef.current.stop();
    }
  }, [cleanup]);

  /**
   * Real-time Voice Activity Detection (VAD) loop
   */
  const detectSilence = useCallback(() => {
    if (!analyserRef.current || !isRecordingRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteTimeDomainData(dataArray);

    let isSilent = true;
    for (let i = 0; i < bufferLength; i++) {
      // Normalize waveform amplitude to 0.0 - 1.0
      const amplitude = Math.abs((dataArray[i] / 128.0) - 1.0);
      if (amplitude > VOICE_CONFIG.VOICE_SILENCE_THRESHOLD) {
        isSilent = false;
        break;
      }
    }

    const now = Date.now();

    if (!isSilent) {
      // Candidate is speaking
      hasSpokenRef.current = true;
      setIsSpeaking(true);
      silenceStartRef.current = now;
      if (isSilenceWarning) setIsSilenceWarning(false);
    } else {
      // Candidate is silent
      setIsSpeaking(false);
      if (!silenceStartRef.current) silenceStartRef.current = now;

      const silenceDuration = now - silenceStartRef.current;
      const timeout = hasSpokenRef.current
        ? VOICE_CONFIG.VOICE_AUTO_STOP_MS
        : VOICE_CONFIG.VOICE_INITIAL_SILENCE_MS;

      if (silenceDuration > timeout) {
        stopRecording(true);
        return; // Exit VAD loop
      } else if (hasSpokenRef.current && silenceDuration > VOICE_CONFIG.VOICE_SILENCE_WARNING_MS) {
        if (!isSilenceWarning) setIsSilenceWarning(true);
      }
    }

    if (isRecordingRef.current) {
      animationFrameRef.current = requestAnimationFrame(detectSilence);
    }
  }, [isSilenceWarning, stopRecording]);

  const startRecording = useCallback(async () => {
    setError(null);
    cleanup();
    setAudioBlob(null);
    setAudioUrl(null);
    setAudioSizeKB(0);
    setDuration(0);
    audioChunksRef.current = [];

    // Browser compatibility check
    if (!window.MediaRecorder || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError(VoiceErrors.UNSUPPORTED_BROWSER);
      setRecordingState(RECORDING_STATES.ERROR);
      return;
    }

    try {
      // 1. Microphone capture constraints (Mono channel, 16 kHz sample rate, echo/noise suppression)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: VOICE_CONFIG.CHANNEL_COUNT || 1,
          sampleRate: VOICE_CONFIG.SAMPLE_RATE || 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      streamRef.current = stream;

      // 2. Select optimal Opus codec with 32 kbps compression
      const mimeType = getSupportedMimeType();
      activeMimeTypeRef.current = mimeType;

      const mediaRecorderOptions = {
        mimeType,
        audioBitsPerSecond: VOICE_CONFIG.AUDIO_BITRATE || 32000, // 32 kbps
      };

      const mediaRecorder = new MediaRecorder(stream, mediaRecorderOptions);
      mediaRecorderRef.current = mediaRecorder;

      // 3. Audio chunk buffering - preserve all chunks so EBML container headers remain intact
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onerror = (event) => {
        runtimeDiagnostics("RecoveryStarted", { error: event.error?.message, context: "MEDIA_RECORDER_ERROR" });
        setError(VoiceErrors.UNKNOWN);
        stopRecording(true);
      };

      mediaRecorder.onstop = () => {
        if (audioChunksRef.current.length > 0) {
          // Normalize MIME type to base type without extra codec params for blob instantiation
          const blobType = activeMimeTypeRef.current ? activeMimeTypeRef.current.split(";")[0] : "audio/webm";
          const blob = new Blob(audioChunksRef.current, { type: blobType });
          const url = URL.createObjectURL(blob);
          const sizeKb = Number((blob.size / 1024).toFixed(1));

          setAudioBlob(blob);
          setAudioUrl(url);
          setAudioSizeKB(sizeKb);
          setRecordingState(RECORDING_STATES.RECORDED);
        } else {
          setRecordingState(RECORDING_STATES.IDLE);
        }

        isRecordingRef.current = false;
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }

        // Release microphone resources
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
        if (audioContextRef.current && audioContextRef.current.state !== "closed") {
          audioContextRef.current.close().catch(console.error);
        }
        setIsSilenceWarning(false);
        setIsSpeaking(false);
      };

      // 4. Initialize Web Audio API Analyser for VAD
      const initAudioContext = () => {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        const audioCtx = new AudioContextClass();
        audioContextRef.current = audioCtx;
        analyserRef.current = audioCtx.createAnalyser();
        analyserRef.current.fftSize = 2048;
        sourceRef.current = audioCtx.createMediaStreamSource(stream);
        sourceRef.current.connect(analyserRef.current);
      };

      try {
        initAudioContext();
      } catch (audioCtxError) {
        runtimeDiagnostics("RecoveryStarted", { context: "AUDIO_CONTEXT_FAILED", error: audioCtxError.message });
        try {
          initAudioContext();
          runtimeDiagnostics("RecoverySucceeded", { context: "AUDIO_CONTEXT_FAILED" });
        } catch (retryError) {
          runtimeDiagnostics("RecoveryFailed", { context: "AUDIO_CONTEXT_FAILED", error: retryError.message });
          toast.error("Silence detection failed. Please refresh the page.");
          setRecordingState(RECORDING_STATES.ERROR);
          return;
        }
      }

      // Start recorder with 250ms timeslices for smooth chunking
      mediaRecorder.start(250);
      isRecordingRef.current = true;
      hasSpokenRef.current = false;
      setRecordingState(RECORDING_STATES.RECORDING);
      startTimeRef.current = Date.now();
      silenceStartRef.current = Date.now();

      // Start VAD silence detection loop
      if (analyserRef.current) {
        detectSilence();
      }

      // Start duration ticker using timestamps to avoid timer drift
      timerIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        setDuration(elapsed);

        if (elapsed >= VOICE_CONFIG.MAX_RECORDING_DURATION_MS) {
          stopRecording(true);
        }
      }, 100);

    } catch (err) {
      runtimeDiagnostics("RecoveryFailed", { context: "MIC_PERMISSION_ERROR", error: err.name });
      setRecordingState(RECORDING_STATES.ERROR);

      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setError(VoiceErrors.PERMISSION_DENIED);
        toast.error("Microphone access denied. Please allow permissions in your browser.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setError(VoiceErrors.MIC_NOT_FOUND);
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        setError(VoiceErrors.MIC_IN_USE);
        toast.error("Microphone disconnected or in use by another app.");
      } else {
        setError(VoiceErrors.UNKNOWN);
      }
    }
  }, [cleanup, detectSilence, stopRecording]);

  const deleteRecording = useCallback(() => {
    cleanup();
    setAudioBlob(null);
    setAudioUrl(null);
    setAudioSizeKB(0);
    setDuration(0);
    setRecordingState(RECORDING_STATES.IDLE);
    setError(null);
    setIsSilenceWarning(false);
    setIsSpeaking(false);
  }, [cleanup]);

  // Handle visibility change to prevent background throttling issues
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isRecordingRef.current) {
        toast("Recording continues in background.", { icon: "ℹ️", id: "bg-record" });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return {
    recordingState,
    audioBlob,
    audioUrl,
    audioSizeKB,
    duration,
    error,
    isSilenceWarning,
    isSpeaking,
    startRecording,
    stopRecording,
    deleteRecording,
  };
};
