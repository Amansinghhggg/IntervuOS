import React, { useEffect, useState, useRef } from 'react';

export const MicVolumeMeter = () => {
  const [volume, setVolume] = useState(0);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function initMic() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!isMounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        streamRef.current = stream;

        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        audioCtxRef.current = audioCtx;

        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        analyserRef.current = analyser;

        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateVolume = () => {
          if (!isMounted || !analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);

          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const average = sum / dataArray.length;
          // Scale volume to 0 - 100 percentage
          const percent = Math.min(100, Math.round((average / 128) * 100));
          setVolume(percent);

          animFrameRef.current = requestAnimationFrame(updateVolume);
        };

        updateVolume();
      } catch (err) {
        console.warn("MicVolumeMeter initialization failed:", err);
      }
    }

    initMic();

    return () => {
      isMounted = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => { });
      }
    };
  }, []);

  const totalBars = 6;
  const activeBars = Math.ceil((volume / 100) * totalBars);

  return (
    <div className="flex items-center gap-1 mt-2 pl-10" title="Speak into your microphone to test volume">
      <span className="text-[9px] font-black uppercase text-slate-400 mr-1 tracking-wider">Test Mic:</span>
      <div className="flex items-center gap-0.5 h-3">
        {Array.from({ length: totalBars }).map((_, i) => {
          const isActive = i < activeBars;
          return (
            <div
              key={i}
              className={`w-1.5 h-3 rounded-full transition-all duration-75 ${isActive
                ? i >= 4
                  ? 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]'
                  : 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]'
                : 'bg-slate-700/50'
                }`}
            />
          );
        })}
      </div>
      <span className="text-[9px] font-bold text-slate-400 ml-1.5 font-mono">
        {volume > 5 ? `${volume}%` : 'Speak...'}
      </span>
    </div>
  );
};
