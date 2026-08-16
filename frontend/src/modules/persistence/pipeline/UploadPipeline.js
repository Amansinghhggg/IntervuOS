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
            // Priority: _id (raw obj), interviewId (mapped from runtime provider), sessionId (fallback)
            const sid = session._id || session.interviewId || session.sessionId;
            onProgress({
                currentStage: UPLOAD_STAGES.RECORDING_UPLOAD,
                stageProgress: 0,
                overallProgress: 0,
                bytesLoaded: 0,
                totalBytes: recordingBlob.size || 0
            });
            await this.recordingService.uploadRecording(sid, recordingBlob, (stageProgress, byteInfo = {}) => {
                 onProgress({
                     currentStage: UPLOAD_STAGES.RECORDING_UPLOAD,
                     stageProgress,
                     overallProgress: Math.floor(stageProgress * 0.85),
                     bytesLoaded: byteInfo.bytesLoaded,
                     totalBytes: byteInfo.totalBytes || recordingBlob.size
                 });
            });
        }
        
        // Stage 2: Session Upload & Verification
        const baseProgress = recordingBlob ? 85 : 0;
        const scale = recordingBlob ? 0.14 : 0.95;
        onProgress({
            currentStage: UPLOAD_STAGES.SESSION_UPLOAD,
            stageProgress: 0,
            overallProgress: baseProgress
        });
        await this.sessionService.uploadSession(session, (stageProgress) => {
             onProgress({
                 currentStage: UPLOAD_STAGES.SESSION_UPLOAD,
                 stageProgress,
                 overallProgress: Math.min(99, baseProgress + Math.floor(stageProgress * scale))
             });
        });
        
        // Stage 3: Finalize
        onProgress({
            currentStage: UPLOAD_STAGES.FINALIZE,
            stageProgress: 100,
            overallProgress: 100
        });
    }
}
