import { useState, useEffect, useCallback } from 'react';
import { persistenceCoordinator } from '../PersistenceCoordinator.js';

export function usePersistence() {
    const [jobs, setJobs] = useState([]);
    const [activeJobId, setActiveJobId] = useState(null);

    useEffect(() => {
        const queue = persistenceCoordinator.getQueue();
        // Initialize state
        setJobs(queue.getJobs());
        
        const handleUpdate = () => {
            setJobs(queue.getJobs());
        };

        const handleJobStarted = (job) => {
             setActiveJobId(job.id);
             handleUpdate();
        };

        queue.on('jobQueued', handleUpdate);
        queue.on('jobStarted', handleJobStarted);
        queue.on('jobProgress', handleUpdate);
        queue.on('jobCompleted', handleUpdate);
        queue.on('jobFailed', handleUpdate);
        queue.on('jobRetried', handleUpdate);

        return () => {
            queue.off('jobQueued', handleUpdate);
            queue.off('jobStarted', handleJobStarted);
            queue.off('jobProgress', handleUpdate);
            queue.off('jobCompleted', handleUpdate);
            queue.off('jobFailed', handleUpdate);
            queue.off('jobRetried', handleUpdate);
        };
    }, []);

    const save = useCallback((session, recordingBlob = null) => {
        const job = persistenceCoordinator.saveSession(session, recordingBlob);
        setActiveJobId(job.id);
        return job;
    }, []);

    const retry = useCallback(() => {
        const queue = persistenceCoordinator.getQueue();
        const jobs = queue.getJobs();
        const activeJob = jobs.find(j => j.id === activeJobId) || (jobs.length > 0 ? jobs[jobs.length - 1] : null);
        
        if (activeJob && activeJob.state === 'FAILED') {
            activeJob.updateState('RETRYING');
            activeJob.retries = 0;
            queue.processNext();
        }
    }, [activeJobId]);

    const activeJob = (activeJobId ? jobs.find(j => j.id === activeJobId) : null) || 
                      jobs.find(j => ['QUEUED', 'UPLOADING', 'PROCESSING', 'RETRYING'].includes(j.state)) || 
                      (jobs.length > 0 ? jobs[jobs.length - 1] : null);

    const clear = useCallback(() => {
        setActiveJobId(null);
    }, []);

    return {
        save,
        retry,
        clear,
        state: activeJob ? activeJob.state : null,
        progress: activeJob ? activeJob.progress : null,
        retries: activeJob ? activeJob.retries : 0,
        error: activeJob ? activeJob.error : null,
        jobs,
        queue: persistenceCoordinator.getQueue()
    };
}
