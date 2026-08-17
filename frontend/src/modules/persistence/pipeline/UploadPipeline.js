import { UPLOAD_STAGES } from '../config/constants.js';
import { SessionPersistenceService } from '../services/SessionPersistenceService.js';
import { RecordingPersistenceService } from '../services/RecordingPersistenceService.js';

export class UploadPipeline {
    constructor() {
        this.sessionService = new SessionPersistenceService();
        this.recordingService = new RecordingPersistenceService();
    }

    async processInterviewSessionJob(job, onProgress) {
        const { session, recordingBlob } = job.payload;
        
        // Stage 1: Recording Upload
        if (recordingBlob) {
            // Priority: _id (raw mongo session ID), interviewId, sessionId
            const sid = session._id || session.interviewId || session.sessionId;
            const totalBytes = recordingBlob.size || 0;
            
            onProgress({
                currentStage: UPLOAD_STAGES.RECORDING_UPLOAD,
                stageProgress: 0,
                overallProgress: 0,
                bytesLoaded: 0,
                totalBytes
            });

            await this.recordingService.uploadRecording(sid, recordingBlob, (stageProgress, byteInfo = {}) => {
                let overall = 0;
                if (byteInfo.isServerComplete) {
                    overall = 85;
                } else if (byteInfo.isNetworkComplete) {
                    overall = 78;
                } else {
                    overall = Math.min(75, Math.floor((stageProgress / 100) * 75));
                }

                onProgress({
                    currentStage: UPLOAD_STAGES.RECORDING_UPLOAD,
                    stageProgress,
                    overallProgress: overall,
                    bytesLoaded: byteInfo.bytesLoaded !== undefined ? byteInfo.bytesLoaded : Math.floor((stageProgress / 100) * totalBytes),
                    totalBytes: byteInfo.totalBytes || totalBytes,
                    isNetworkComplete: byteInfo.isNetworkComplete || false,
                    isServerComplete: byteInfo.isServerComplete || false
                });
            });
        }
        
        // Stage 2: Session Upload & Verification
        const baseProgress = recordingBlob ? 85 : 0;
        const scale = recordingBlob ? 0.12 : 0.90;
        
        onProgress({
            currentStage: UPLOAD_STAGES.SESSION_UPLOAD,
            stageProgress: 0,
            overallProgress: baseProgress,
            bytesLoaded: recordingBlob?.size || 0,
            totalBytes: recordingBlob?.size || 0
        });

        await this.sessionService.uploadSession(session, (stageProgress) => {
             onProgress({
                 currentStage: UPLOAD_STAGES.SESSION_UPLOAD,
                 stageProgress,
                 overallProgress: Math.min(97, baseProgress + Math.floor((stageProgress / 100) * 12)),
                 bytesLoaded: recordingBlob?.size || 0,
                 totalBytes: recordingBlob?.size || 0
             });
        });
        
        // Stage 3: Finalize
        onProgress({
            currentStage: UPLOAD_STAGES.FINALIZE,
            stageProgress: 100,
            overallProgress: 100,
            bytesLoaded: recordingBlob?.size || 0,
            totalBytes: recordingBlob?.size || 0
        });
    }
}
