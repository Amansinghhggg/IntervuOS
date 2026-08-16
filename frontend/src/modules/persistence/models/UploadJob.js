import { UPLOAD_STATES } from '../config/constants.js';

export class UploadJob {
    constructor({ type, payload }) {
        this.id = crypto.randomUUID();
        this.type = type;
        this.state = UPLOAD_STATES.QUEUED;
        this.progress = {
            overallProgress: 0,
            currentStage: null,
            stageProgress: 0,
            bytesLoaded: 0,
            totalBytes: 0
        };
        this.retries = 0;
        this.payload = payload;
        this.createdAt = Date.now();
    }

    updateState(newState) {
        this.state = newState;
    }

    updateProgress({ overallProgress, currentStage, stageProgress, bytesLoaded, totalBytes }) {
        if (overallProgress !== undefined) {
            this.progress.overallProgress = overallProgress;
        }
        if (currentStage !== undefined) {
            this.progress.currentStage = currentStage;
        }
        if (stageProgress !== undefined) {
            this.progress.stageProgress = stageProgress;
        }
        if (bytesLoaded !== undefined) {
            this.progress.bytesLoaded = bytesLoaded;
        }
        if (totalBytes !== undefined) {
            this.progress.totalBytes = totalBytes;
        }
    }

    incrementRetries() {
        this.retries += 1;
    }
}
