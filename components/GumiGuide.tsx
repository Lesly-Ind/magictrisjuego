import React, { useEffect, useRef, useState } from 'react';
import { textToSpeech } from '../services/gemini';
import { decode, decodeAudioData, getSharedAudioContext, playVoiceBuffer, stopCurrentVoice, playPopSound } from './AudioUtils';

interface Props {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  autoSpeak?: boolean;
}

const sizeMap = {
  small: 'text-4xl sm:text-5xl',
  medium: 'text-6xl sm:text-7xl',
  large: 'text-7xl sm:text-8xl',
};

const GumiGuide: React.FC<Props> = ({ message, size = 'medium', className = '', autoSpeak = false }) => {
  const isMounted = useRef(true);
  const hasSpoken = useRef(false);
  const [needsFallback, setNeedsFallback] = useState(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    hasSpoken.current = false;
    setNeedsFallback(false);
    if (autoSpeak && message) {
      const timer = setTimeout(async () => {
        if (isMounted.current && !hasSpoken.current) {
          hasSpoken.current = true;
          try {
            const ctx = getSharedAudioContext();
            if (ctx.state === 'suspended') {
              try {
                await ctx.resume();
              } catch {
                if (isMounted.current) setNeedsFallback(true);
                return;
              }
            }
            if (ctx.state !== 'running') {
              if (isMounted.current) setNeedsFallback(true);
              return;
            }
            const audioData = await textToSpeech(message);
            if (!isMounted.current) return;
            if (audioData) {
              if (ctx.state !== 'running') {
                if (isMounted.current) setNeedsFallback(true);
                return;
              }
              const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
              if (!isMounted.current) return;
              await playVoiceBuffer(buffer);
            }
          } catch (err) {
            console.warn('GumiGuide autoSpeak error:', err);
            if (isMounted.current) setNeedsFallback(true);
          }
        }
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [message, autoSpeak]);

  const handleFallbackSpeak = async () => {
    playPopSound();
    setNeedsFallback(false);
    if (!message) return;
    try {
      const ctx = getSharedAudioContext();
      if (ctx.state === 'suspended') await ctx.resume();
      const audioData = await textToSpeech(message);
      if (!isMounted.current || !audioData) return;
      const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
      if (!isMounted.current) return;
      await playVoiceBuffer(buffer);
    } catch (err) {
      console.warn('GumiGuide fallback speak error:', err);
    }
  };

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div className={`floating-gumi ${sizeMap[size]} select-none drop-shadow-lg`} aria-hidden="true">
        👾
      </div>
      {message && (
        <div className="bg-white/90 backdrop-blur-md px-5 py-3 rounded-[1.5rem] border-2 border-cyan-300 shadow-lg max-w-xs text-center relative">
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/90 border-l-2 border-t-2 border-cyan-300 rotate-45"></div>
          <p className="text-sm sm:text-base font-bold text-indigo-800 leading-snug" role="status" aria-live="polite">{message}</p>
        </div>
      )}
      {needsFallback && (
        <button
          onClick={handleFallbackSpeak}
          aria-label="Escuchar mensaje de Gumi"
          className="bg-cyan-500 text-white py-3 px-6 rounded-[1.5rem] text-base font-magic shadow-xl border-b-4 border-cyan-700 transition-all active:translate-y-1 hover:bg-cyan-600 flex items-center justify-center gap-2 min-h-[3rem] focus:outline-none focus:ring-4 focus:ring-cyan-200 animate-pulse"
        >
          <span className="text-xl" aria-hidden="true">🔊</span>
          <span>Toca para escucharme</span>
        </button>
      )}
    </div>
  );
};

export default GumiGuide;
