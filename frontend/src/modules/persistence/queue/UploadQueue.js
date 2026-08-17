import { UPLOAD_STATES } from '../config/constants.js';

export class UploadQueue {
    constructor() {
        this.jobs = [];
        this.isProcessing = false;
        this.processor = null;
        this.eventListeners = {
            jobQueued: [],
            jobStarted: [],
            jobProgress: [],
            jobCompleted: [],
            jobFailed: [],
            jobRetried: []
        };
    }

    setProcessor(processorFn) {
        this.processor = processorFn;
    }

    enqueue(job) {
        this.jobs.push(job);
        this.emit('jobQueued', job);
        this.processNext();
    }

    async processNext() {
        if (this.isProcessing || this.jobs.length === 0) {
            return;
        }

        const jobIndex = this.jobs.findIndex(
            j => j.state === UPLOAD_STATES.QUEUED || j.state === UPLOAD_STATES.RETRYING
        );

        if (jobIndex === -1) return;

        const job = this.jobs[jobIndex];
        this.isProcessing = true;

        if (job.state !== UPLOAD_STATES.RETRYING) {
            job.updateState(UPLOAD_STATES.UPLOADING);
            this.emit('jobStarted', job);
        } else {
            this.emit('jobRetried', job);
        }

        try {
            if (!this.processor) {
                throw new Error("No processor defined for UploadQueue");
            }

            await this.processor(job, (progressUpdate) => {
                job.updateProgress(progressUpdate);
                this.emit('jobProgress', job);
            });

            job.updateState(UPLOAD_STATES.COMPLETED);
            this.emit('jobCompleted', job);
        } catch (error) {
            job.updateState(UPLOAD_STATES.FAILED);
            job.error = error.message;
            this.emit('jobFailed', job);
        } finally {
            this.isProcessing = false;
            // Process the next job in the queue
            this.processNext();
        }
    }

    on(event, callback) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].push(callback);
        }
    }

    off(event, callback) {
        if (this.eventListeners[event]) {
            this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
        }
    }

    emit(event, data) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].forEach(cb => cb(data));
        }
    }

    getJobs() {
        return this.jobs.map(job => Object.assign(Object.create(Object.getPrototypeOf(job)), job, {
            progress: { ...job.progress }
        }));
    }
}
