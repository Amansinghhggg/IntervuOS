import { useRef, useEffect } from 'react';
import { Camera, Loader2, AlertCircle } from 'lucide-react';
import { CAMERA_STATES } from '../utils/camera.states';
import { DeviceHealthIndicator } from '../../device-health/index';
import { FaceStatusIndicator } from '../../face-detection/index';
import { BrowserStatusIndicator } from '../../browser-monitoring/index';
import { ViolationIndicator } from '../../violation-engine/index';

/**
 * InterviewCamera
 *
 * Purely presentational camera component.
 * Receives stream, state, and warnings via props — does NOT access MediaDevices APIs.
 *
 * @param {object} props
 * @param {MediaStream|null} props.stream - The camera MediaStream
 * @param {string} props.state - CAMERA_STATES value
 * @param {Array<string>} [props.warnings] - Warning messages (reserved for future monitoring)
 * @param {{ code: string, message: string }|null} [props.error] - Camera error object
 * @param {object} [props.deviceSnapshot] - Device health snapshot
 * @param {object} [props.faceSnapshot] - Face detection snapshot
 * @param {string} [props.browserStatus] - Browser status string
 * @param {Array} [props.activeViolations] - Active violations
 * @param {function} [props.setVideoElement] - Callback to pass video element to detectors
 */
export const InterviewCamera = ({ 
  stream = null, 
  state = CAMERA_STATES.IDLE, 
  warnings = [], 
  error = null, 
  isRecording = false, 
  deviceSnapshot = null,
  faceSnapshot = null,
  browserStatus = null,
  activeViolations = [],
  setVideoElement = null,
  compact = false,
  className = ""
}) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    if (stream) {
      videoEl.srcObject = stream;
    } else {
      videoEl.srcObject = null;
    }

    if (setVideoElement) {
      setVideoElement(videoEl);
    }

    return () => {
      if (videoEl) {
        videoEl.srcObject = null;
      }
    };
  }, [stream, setVideoElement]);

  return (
    <div className={`camera-container relative overflow-hidden rounded-2xl bg-[var(--color-surface,#16161E)] w-full h-full transition-all duration-300 ${
      isRecording 
        ? 'border border-[var(--color-border-active,#6338F6)] shadow-lg' 
        : 'border border-[var(--color-border,#232330)]'
    } ${className}`}>
      {/* Violation Status Overlay (Top Center) - shown on desktop or when expanded */}
      {!compact && activeViolations && activeViolations.length > 0 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
          <ViolationIndicator activeViolations={activeViolations} />
        </div>
      )}

      {/* Browser Status Overlay (Top Center, pushed down if violations exist) */}
      {!compact && browserStatus && (
        <div className={`absolute left-1/2 -translate-x-1/2 z-10 transition-all duration-300 ${activeViolations?.length > 0 ? 'top-14' : 'top-4'}`}>
          <BrowserStatusIndicator status={browserStatus} />
        </div>
      )}

      {/* Device Health Overlay (Top Right) */}
      {!compact && deviceSnapshot && (
        <div className="absolute top-4 right-4 z-10">
          <DeviceHealthIndicator snapshot={deviceSnapshot} />
        </div>
      )}

      {/* Face Status Overlay (Top Left) */}
      {!compact && faceSnapshot && (
        <div className="absolute top-4 left-4 z-10">
          <FaceStatusIndicator snapshot={faceSnapshot} />
        </div>
      )}

      {/* Active Camera Stream */}
      {state === CAMERA_STATES.ACTIVE && stream && (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{ transform: 'scaleX(-1)' }}
          className="w-full h-full object-cover"
        />
      )}

      {/* Initializing State */}
      {state === CAMERA_STATES.INITIALIZING && (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[var(--color-text-muted)] p-2">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--color-primary)]" />
          <span className="text-xs">Starting camera...</span>
        </div>
      )}

      {/* Idle State — Camera Not Started */}
      {state === CAMERA_STATES.IDLE && (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[var(--color-text-muted)] p-2">
          <div className="w-10 h-10 rounded-full bg-[var(--color-surface-hover)] flex items-center justify-center">
            <Camera className="w-5 h-5" />
          </div>
          <span className="text-xs">Camera preview</span>
        </div>
      )}

      {/* Error State */}
      {state === CAMERA_STATES.ERROR && (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-3 text-center">
          <div className="w-10 h-10 rounded-full bg-[var(--color-danger)]/15 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-[var(--color-danger)]" />
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] max-w-[180px]">
            {error?.message || 'Camera unavailable'}
          </p>
        </div>
      )}

      {/* Warning Placeholder */}
      {!compact && warnings.length > 0 && (
        <div className="absolute bottom-3 left-3 right-3">
          {warnings.map((warning, i) => (
            <div key={i} className="text-xs text-[var(--color-warning)] bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-lg mb-1">
              {warning}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
