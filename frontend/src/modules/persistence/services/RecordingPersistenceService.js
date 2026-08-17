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
        
        const totalBytes = recordingBlob.size || 0;
        
        // Convert to File
        const recordingFile = new File(
            [recordingBlob], 
            `recording-${Date.now()}.webm`, 
            { type: recordingBlob.type || "video/webm" }
        );

        const formData = new FormData();
        formData.append("recording", recordingFile);

        try {
            // Signal upload start with 0%
            if (onProgress) {
                onProgress(0, {
                    bytesLoaded: 0,
                    totalBytes,
                    isNetworkComplete: false
                });
            }

            const response = await api.post(`/interviews/${sessionId}/recording`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    const loaded = progressEvent.loaded || 0;
                    const total = progressEvent.total || totalBytes;
                    const percent = total > 0 ? Math.min(100, Math.max(0, Math.round((loaded * 100) / total))) : 0;
                    
                    if (onProgress) {
                        onProgress(percent, {
                            bytesLoaded: loaded,
                            totalBytes: total,
                            isNetworkComplete: loaded >= total && total > 0
                        });
                    }
                }
            });

            // Signal server processing complete
            if (onProgress) {
                onProgress(100, {
                    bytesLoaded: totalBytes,
                    totalBytes,
                    isNetworkComplete: true,
                    isServerComplete: true
                });
            }

            return { success: true, fileUrl: response.data?.recording?.url };
        } catch (error) {
            console.error("Recording upload failed:", error);
            throw new Error("Failed to upload recording: " + (error.response?.data?.message || error.message));
        }
    }
}
