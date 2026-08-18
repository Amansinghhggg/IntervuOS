import { useRef, useState, useCallback } from 'react';
import { InterviewSessionBuilder } from '../builders/InterviewSessionBuilder';

export const useInterviewSession = () => {
  const builderRef = useRef(new InterviewSessionBuilder());
  const [session, setSession] = useState(null);
  const [isFinalized, setIsFinalized] = useState(false);
  const [error, setError] = useState(null);

  const initialize = useCallback((params) => {
    try {
      builderRef.current.initialize(params);
    } catch (err) {
      setError(err);
    }
  }, []);

  const attachBackendSession = useCallback((backendSession) => {
    try {
      builderRef.current.attachBackendSession(backendSession);
    } catch (err) {
      setError(err);
    }
  }, []);

  const attachRecording = useCallback((recordingSession) => {
    try {
      builderRef.current.attachRecording(recordingSession);
    } catch (err) {
      setError(err);
    }
  }, []);

  const attachConversation = useCallback((conversation) => {
    try {
      builderRef.current.attachConversation(conversation);
    } catch (err) {
      setError(err);
    }
  }, []);

  const attachViolations = useCallback((violations) => {
    try {
      builderRef.current.attachViolations(violations);
    } catch (err) {
      setError(err);
    }
  }, []);

  const attachMonitoring = useCallback((monitoring) => {
    try {
      builderRef.current.attachMonitoring(monitoring);
    } catch (err) {
      setError(err);
    }
  }, []);

  const finalizeAndBuild = useCallback(() => {
    try {
      builderRef.current.finalize();
      const finalSession = builderRef.current.build();
      setSession(finalSession);
      setIsFinalized(true);
      return finalSession;
    } catch (err) {
      setError(err);
      return null;
    }
  }, []);

  return {
    session,
    isFinalized,
    error,
    initialize,
    attachBackendSession,
    attachRecording,
    attachConversation,
    attachViolations,
    attachMonitoring,
    finalizeAndBuild
  };
};
