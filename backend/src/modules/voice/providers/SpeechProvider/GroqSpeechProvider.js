import Groq from "groq-sdk";
import { BaseSpeechProvider } from "./BaseSpeechProvider.js";
import { VoiceConfig } from "../../config/voice.config.js";
import { ProviderError } from "../../errors/VoiceErrors.js";
import { toFile } from "groq-sdk";

export class GroqSpeechProvider extends BaseSpeechProvider {
  constructor() {
    super();
    if (!VoiceConfig.groqApiKey) {
      throw new ProviderError("GROQ_API_KEY is not configured", "GroqSpeechProvider");
    }
    this.groq = new Groq({ apiKey: VoiceConfig.groqApiKey });
    this.model = VoiceConfig.groqModel;
  }

  async transcribe(audio) {
    try {
      let filename = audio.originalname || "recording.webm";
      if (!filename.includes(".")) {
        const ext = audio.mimetype?.includes("ogg")
          ? "ogg"
          : audio.mimetype?.includes("mp4")
          ? "mp4"
          : audio.mimetype?.includes("wav")
          ? "wav"
          : "webm";
        filename = `${filename}.${ext}`;
      }

      const mimeType = audio.mimetype ? audio.mimetype.split(";")[0].trim() : "audio/webm";

      // groq-sdk needs a File-like object. toFile converts a buffer.
      const file = await toFile(audio.buffer, filename, { type: mimeType });

      const transcription = await this.groq.audio.transcriptions.create(
        {
          file,
          model: this.model,
        },
        { timeout: VoiceConfig.timeout }
      );

      return transcription.text;
    } catch (error) {
      this.handleError(error);
    }
  }
}
