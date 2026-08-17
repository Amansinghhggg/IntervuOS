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
            totalBytes: payload?.recordingBlob?.size || 0
        };
        this.retries = 0;
        this.payload = payload;
        this.createdAt = Date.now();
        this.error = null;
    }

    updateState(newState) {
        this.state = newState;
    }

    updateProgress(update = {}) {
        this.progress = {
            ...this.progress,
            ...update
        };
    }

    incrementRetries() {
        this.retries += 1;
    }
}
