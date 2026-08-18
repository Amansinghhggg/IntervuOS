import { useEffect } from 'react';
import { useInterviewRuntimeManager } from './InterviewRuntimeManager';
import { InterviewRuntimeContext } from './InterviewRuntimeContext';
import { useDeviceHealth } from '../../device-health/index';
import { useFaceDetection } from '../../face-detection/index';
import { useBrowserMonitoring } from '../../browser-monitoring/index';
import { useViolationEngine } from '../../violation-engine/index';
import { useInterviewSession } from '../../interview-session/index';

export const InterviewRuntimeProvider = ({ children, sessionId, candidateId }) => {
  const {
    cameraRuntime,
    recordingRuntime,
    runtimeState,
    runtimeError,
    actions
  } = useInterviewRuntimeManager();

  const deviceRuntime = useDeviceHealth(cameraRuntime);
  const faceRuntime = useFaceDetection(cameraRuntime.stream);
  const browserRuntime = useBrowserMonitoring();
  const violationRuntime = useViolationEngine(deviceRuntime, faceRuntime, browserRuntime);
  const sessionBuilder = useInterviewSession();

  // Initialize session once
  useEffect(() => {
    sessionBuilder.initialize({
      interviewId: sessionId || 'inter_' + Math.random().toString(36).substr(2, 9),
      candidateId: candidateId || 'cand_' + Math.random().toString(36).substr(2, 9),
      metadata: {
        userAgent: navigator.userAgent
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Provide a specialized action to attach monitoring facts and finalize
  const finalizeInterviewSession = (conversation, finalizedRecordingSession, backendSession) => {
    try {
      if (backendSession && sessionBuilder.attachBackendSession) {
        sessionBuilder.attachBackendSession(backendSession);
      }
      if (sessionBuilder.attachRecording) {
        sessionBuilder.attachRecording(finalizedRecordingSession || recordingRuntime?.session);
      }

      // Prefer the backend session's questions but normalize their timestamps to the frontend timeline
      // This eliminates clock drift between the candidate's machine and the server.
      const backendStart = backendSession?.startedAt ? new Date(backendSession.startedAt).getTime() : 0;
      const recSession = finalizedRecordingSession || recordingRuntime?.session;
      const frontendStart = (recSession && recSession.startedAt) ? new Date(recSession.startedAt).getTime() : Date.now();

      const questionsWithTimestamps = backendSession?.questions?.length
        ? backendSession.questions.map((q) => {
            // Calculate relative time from backend start, and apply to frontend start
            const normalizeTime = (backendTime) => {
              if (!backendTime || !backendStart) return null;
              const offset = new Date(backendTime).getTime() - backendStart;
              return Math.max(frontendStart, frontendStart + offset);
            };

            return {
              question: q.question,
              answer: q.answer || null,
              startedAt: normalizeTime(q.askedAt) || null,
              endedAt: normalizeTime(q.answeredAt) || null,
              topic: q.topic,
              difficulty: q.difficulty,
              type: q.type,
            };
          })
        : conversation?.questions || [];

      sessionBuilder.attachConversation({
        questions: questionsWithTimestamps,
        answers: conversation?.answers || [],
      });
      sessionBuilder.attachViolations({
        active: violationRuntime?.active || [],
        history: violationRuntime?.history || [],
        timeline: violationRuntime?.timeline || [],
        statistics: violationRuntime?.statistics || {}
      });
      sessionBuilder.attachMonitoring({
        device: deviceRuntime?.history || [],
        browser: browserRuntime?.history || [],
        face: faceRuntime?.history || []
      });
      
      return sessionBuilder.finalizeAndBuild();
    } catch (err) {
      console.warn("[InterviewRuntimeProvider] Error during finalization, using fallback session:", err);
      return sessionBuilder.session || {
        sessionId: backendSession?._id || sessionId || Date.now().toString(),
        interviewId: backendSession?.interviewId || sessionId || 'default',
        candidateId: candidateId || backendSession?.candidateId || 'candidate',
        endedAt: Date.now(),
        conversation: conversation || { questions: [] }
      };
    }
  };

  // Grouped context shape exposing runtime modules safely
  const contextValue = {
    camera: cameraRuntime,
    recording: recordingRuntime,
    device: deviceRuntime,
    face: faceRuntime,
    browser: browserRuntime,
    violations: violationRuntime,
    session: sessionBuilder.session,
    runtime: {
      state: runtimeState,
      error: runtimeError,
      session: recordingRuntime.session
    },
    actions: {
      ...actions,
      finalizeInterviewSession
    },
    
    // Reserved for future extensions to avoid refactoring
    voice: {},
    monitoring: {},
    network: {},
    health: {},
    capabilities: {},
    devices: {},
    status: {},
    headPose: {},
    eyeTracking: {},
    lighting: {},
    pose: {},
    clipboard: {},
    developerTools: {},
    screenShare: {},
    permissions: {}
  };

  return (
    <InterviewRuntimeContext.Provider value={contextValue}>
      {children}
    </InterviewRuntimeContext.Provider>
  );
};

