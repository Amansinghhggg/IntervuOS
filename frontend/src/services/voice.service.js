import api from "./api";

export const voiceService = {
  /**
   * Upload a compressed audio blob and get the transcription
   * @param {Blob} audioBlob 
   * @returns {Promise<{ transcript: string, metadata: object }>}
   */
  transcribe: async (audioBlob) => {
    const formData = new FormData();
    const mime = audioBlob.type || "audio/webm";
    const extension = mime.includes("ogg")
      ? "ogg"
      : mime.includes("mp4")
      ? "mp4"
      : mime.includes("aac")
      ? "aac"
      : "webm";

    formData.append("audio", audioBlob, `recording.${extension}`);

    try {
      const response = await api.post("/voice/transcribe", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Synthesize text to speech
   * @param {string} text 
   * @param {string} voice 
   * @returns {Promise<{blob: Blob, contentType: string}>}
   */
  speak: async (text, voice) => {
    try {
      const response = await api.post('/voice/speak', 
        { text, voice },
        { responseType: 'blob' }
      );
      
      const contentType = response.headers['content-type'] || 'audio/mpeg';
      
      // Ensure the Blob has the correct MIME type so the browser can play it
      const typedBlob = new Blob([response.data], { type: contentType });

      return {
        blob: typedBlob,
        contentType
      };
    } catch (error) {
      console.error('TTS Error:', error);
      throw error;
    }
  },

  /**
   * Check voice module health
   * @returns {Promise<any>}
   */
  health: async () => {
    const response = await api.get("/voice/health");
    return response.data;
  },
};
