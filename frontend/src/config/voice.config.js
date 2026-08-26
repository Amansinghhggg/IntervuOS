export const VOICE_CONFIG = {
  // Audio Encoding & Compression (32 kbps Opus mono = ~240 KB per minute)
  AUDIO_BITRATE: 32000,              // 32 kbps Opus audio bitrate
  SAMPLE_RATE: 16000,                // 16 kHz native sample rate for Whisper / Gemini STT
  CHANNEL_COUNT: 1,                  // Mono channel (cuts raw audio size by 50% vs stereo)
  TIMESLICE_MS: 200,                 // 200ms audio chunk slices for VAD pre-roll buffer
  PRE_ROLL_BUFFER_CHUNKS: 2,         // Keep ~400ms pre-roll so initial consonants are preserved

  // Recording Durations & Limits
  MAX_RECORDING_DURATION_MS: 120000, // 120 seconds max recording duration
  MIN_RECORDING_DURATION_MS: 1000,   // 1 second minimum recording duration

  // Voice Activity Detection (VAD) & Silence Trimming
  VOICE_SILENCE_THRESHOLD: 0.08,     // Normalized amplitude threshold for speech detection
  VOICE_SILENCE_WARNING_MS: 2000,    // Show silence warning after 2s of silence
  VOICE_AUTO_STOP_MS: 3000,          // Auto-stop after 3s of continuous trailing silence
  VOICE_INITIAL_SILENCE_MS: 15000,   // Wait up to 15s if candidate hasn't started speaking yet
};

export default VOICE_CONFIG;
