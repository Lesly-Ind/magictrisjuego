
import React, { useState, useRef, useEffect } from 'react';
import { textToSpeech } from '../services/gemini';
import { decode, decodeAudioData, getSharedAudioContext, playPopSound } from './AudioUtils';

interface Props {
  text: string;
  className?: string;
}

const VoiceButton: React.FC<Props> = ({ text, className }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (sourceRef.current) {
        sourceRef.current.stop();
        sourceRef.current = null;
      }
    };
  }, []);

  const handlePlay = async () => {
    playPopSound(); // Sonido inmediato al tocar
    if (isPlaying) {
      if (sourceRef.current) {
        sourceRef.current.stop();
        sourceRef.current = null;
      }
      setIsPlaying(false);
      return;
    }

    const audioCtx = getSharedAudioContext();
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }

    setIsPlaying(true);
    try {
      const audioData = await textToSpeech(text);
      
      // Si el componente se desmontó mientras cargaba la API, no reproducir
      if (!isMounted.current) return;

      if (audioData) {
        const buffer = await decodeAudioData(decode(audioData), audioCtx, 24000, 1);
        
        if (!isMounted.current) return;

        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        sourceRef.current = source;
        
        source.onended = () => {
          if (isMounted.current) setIsPlaying(false);
          sourceRef.current = null;
        };
        
        source.start();
      } else {
        setIsPlaying(false);
        alert("⚠️ Gumi no devolvió audio. Esto suele pasar si la VITE_GEMINI_API_KEY no está bien configurada en Vercel.");
      }
    } catch (err: any) {
      console.error("Error de voz:", err);
      if (isMounted.current) {
        setIsPlaying(false);
        // Alertamos al usuario para que sepa qué está fallando
        if (err.message?.includes("API key not valid")) {
          alert("❌ La Llave Mágica no es válida. Revisa que la hayas copiado bien en Vercel.");
        } else if (err.message?.includes("quota")) {
          alert("❌ Se ha agotado el límite gratuito de tu Llave Mágica.");
        } else {
          alert("❌ Gumi no pudo hablar. Revisa que hayas puesto la VITE_GEMINI_API_KEY en Vercel y hayas hecho Redeploy.");
        }
      }
    }
  };

  return (
    <button 
      onClick={handlePlay} 
      className={`p-2 rounded-full bg-blue-400 text-white shadow hover:scale-110 transition-transform flex items-center justify-center min-w-[3rem] ${className}`}
    >
      {isPlaying ? (
        <span className="flex gap-1 items-center px-2">
            <span className="w-1.5 h-4 bg-white animate-pulse rounded-full"></span>
            <span className="w-1.5 h-6 bg-white animate-pulse rounded-full delay-75"></span>
            <span className="w-1.5 h-4 bg-white animate-pulse rounded-full delay-150"></span>
        </span>
      ) : (
        <span className="text-2xl">📢</span>
      )}
    </button>
  );
};

export default VoiceButton;
