import api from '../../../services/api.js';

export class RecordingPersistenceService {
    async uploadRecording(sessionId, recordingBlob, onProgress) {
        if (!sessionId) {
            throw new Error("sessionId is required for upload");
        }
        if (!recordingBlob) {
            return { success: true, skipped: true };
        }
        if (!(recordingBlob instanceof Blob)) {
            throw new Error("Recording input must be a Blob");
        }
        
        // Convert to File
        const recordingFile = new File([recordingBlob], `recording-${Date.now()}.webm`, { type: recordingBlob.type });

        const formData = new FormData();
        formData.append("recording", recordingFile);

        try {
            const response = await api.post(`/interviews/${sessionId}/recording`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    if (onProgress && progressEvent.total) {
                        const progress = Math.min(100, Math.max(0, Math.round((progressEvent.loaded * 100) / progressEvent.total)));
                        onProgress(progress, {
                            bytesLoaded: progressEvent.loaded,
                            totalBytes: progressEvent.total
                        });
                    }
                }
            });

            return { success: true, fileUrl: response.data.recording?.url };
        } catch (error) {
            console.error("Recording upload failed:", error);
            throw new Error("Failed to upload recording: " + (error.response?.data?.message || error.message));
        }
    }
}
