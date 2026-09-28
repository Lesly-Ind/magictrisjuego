
import React, { useState, useRef, useEffect } from 'react';
import { textToSpeech } from '../services/gemini';
import { decode, decodeAudioData, getSharedAudioContext, playVoiceBuffer, stopCurrentVoice, playPopSound } from './AudioUtils';

interface Props {
  text: string;
  className?: string;
  autoPlay?: boolean;
  size?: 'default' | 'large';
  label?: string;
}

const VoiceButton: React.FC<Props> = ({ text, className, autoPlay = false, size = 'default', label }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [needsFallback, setNeedsFallback] = useState(false);
  const isMounted = useRef(true);
  const hasAutoPlayed = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    hasAutoPlayed.current = false;
    setNeedsFallback(false);
    if (autoPlay) {
      const timer = setTimeout(() => {
        if (isMounted.current && !hasAutoPlayed.current) {
          hasAutoPlayed.current = true;
          speak(true);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [text, autoPlay]);

  const speak = async (isAutoAttempt = false) => {
    if (isPlaying) {
      stopCurrentVoice();
      setIsPlaying(false);
      return;
    }

    const ctx = getSharedAudioContext();
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch {
        if (isAutoAttempt && isMounted.current) {
          setNeedsFallback(true);
        }
        return;
      }
    }
    if (ctx.state !== 'running') {
      if (isAutoAttempt && isMounted.current) {
        setNeedsFallback(true);
      }
      return;
    }

    const audioData = await textToSpeech(text);
    if (!isMounted.current) return;

    if (audioData) {
      if (ctx.state !== 'running') {
        if (isAutoAttempt && isMounted.current) {
          setNeedsFallback(true);
        }
        return;
      }
      const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
      if (!isMounted.current) return;

      setNeedsFallback(false);
      setIsPlaying(true);
      await playVoiceBuffer(buffer);
      if (isMounted.current) setIsPlaying(false);
    }
  };

  const handlePlay = () => {
    playPopSound();
    speak(false);
  };

  const largeClass = size === 'large'
    ? '!px-12 !py-6 !text-2xl min-w-[5rem]'
    : '';
  const baseClass = "p-2 rounded-full bg-cyan-500 text-white shadow-lg hover:scale-110 transition-transform flex items-center justify-center min-w-[3rem] border-b-4 border-cyan-700 focus:outline-none focus:ring-4 focus:ring-cyan-200";

  if (needsFallback && autoPlay) {
    return (
      <button
        onClick={handlePlay}
        aria-label={label || "Escuchar instrucción"}
        className="bg-cyan-500 text-white py-5 px-8 rounded-[2rem] text-xl font-magic shadow-2xl border-b-[6px] border-cyan-800 transition-all active:translate-y-1 hover:bg-cyan-600 uppercase tracking-wider flex items-center justify-center gap-3 min-h-[4rem] focus:outline-none focus:ring-4 focus:ring-cyan-200 animate-pulse"
      >
        <span className="text-3xl" aria-hidden="true">🔊</span>
        <span>Escucha la instrucción</span>
      </button>
    );
  }

  return (
    <button
      onClick={handlePlay}
      aria-label={label || `Escuchar: ${text}`}
      className={`${baseClass} ${largeClass} ${className || ''}`}
    >
      {isPlaying ? (
        <span className="flex gap-1 items-center px-2" aria-label="Reproduciendo audio">
            <span className="w-1.5 h-4 bg-white animate-pulse rounded-full"></span>
            <span className="w-1.5 h-6 bg-white animate-pulse rounded-full" style={{ animationDelay: '0.1s' }}></span>
            <span className="w-1.5 h-4 bg-white animate-pulse rounded-full" style={{ animationDelay: '0.2s' }}></span>
        </span>
      ) : (
        <span className="text-2xl" aria-hidden="true">🔊</span>
      )}
    </button>
  );
};

export default VoiceButton;
