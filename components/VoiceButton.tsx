
import React, { useState, useRef, useEffect } from 'react';
import { textToSpeech } from '../services/gemini';
import { decode, decodeAudioData, playVoiceBuffer, stopCurrentVoice, playPopSound } from './AudioUtils';

interface Props {
  text: string;
  className?: string;
  autoPlay?: boolean;
  size?: 'default' | 'large';
  label?: string;
}

const VoiceButton: React.FC<Props> = ({ text, className, autoPlay = false, size = 'default', label }) => {
  const [isPlaying, setIsPlaying] = useState(false);
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
    if (autoPlay) {
      const timer = setTimeout(() => {
        if (isMounted.current && !hasAutoPlayed.current) {
          hasAutoPlayed.current = true;
          speak();
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [text, autoPlay]);

  const speak = async () => {
    if (isPlaying) {
      stopCurrentVoice();
      setIsPlaying(false);
      return;
    }

    const audioData = await textToSpeech(text);
    if (!isMounted.current) return;

    if (audioData) {
      const ctx = (await import('./AudioUtils')).getSharedAudioContext();
      if (ctx.state === 'suspended') await ctx.resume();
      const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
      if (!isMounted.current) return;

      setIsPlaying(true);
      await playVoiceBuffer(buffer);
      if (isMounted.current) setIsPlaying(false);
    }
  };

  const handlePlay = () => {
    playPopSound();
    speak();
  };

  const largeClass = size === 'large'
    ? '!px-12 !py-6 !text-2xl min-w-[5rem]'
    : '';
  const baseClass = "p-2 rounded-full bg-cyan-500 text-white shadow-lg hover:scale-110 transition-transform flex items-center justify-center min-w-[3rem] border-b-4 border-cyan-700";

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
