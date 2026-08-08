import { useCallback, useRef, useState } from 'react';

export function useSound() {
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('sound-muted') === 'true';
  });
  const audioCtxRef = useRef<AudioContext | null>(null);

  function getAudioContext(): AudioContext {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    return audioCtxRef.current;
  }

  function playTone(frequency: number, duration: number, volume: number = 0.5) {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio context may not be available
    }
  }

  const playMessageSent = useCallback(() => {
    playTone(800, 0.05, 0.2); // softer for sent
  }, [isMuted]);

  const playMessageReceived = useCallback(() => {
    playTone(600, 0.1, 0.8); // much louder and slightly longer for received
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      localStorage.setItem('sound-muted', String(next));
      return next;
    });
  }, []);

  return { isMuted, toggleMute, playMessageSent, playMessageReceived };
}
