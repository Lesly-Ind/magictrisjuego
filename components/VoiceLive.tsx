
import React, { useState, useEffect, useRef } from 'react';
import { getGeminiClient } from '../services/gemini';
import { Modality, LiveServerMessage } from '@google/genai';
import { decode, decodeAudioData, createPcmBlob } from './AudioUtils';

const VoiceLive: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const toggleSession = async () => {
    if (isActive) {
      sessionRef.current?.close();
      setIsActive(false);
      return;
    }

    try {
      const ai = getGeminiClient();
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            console.log('Voice session opened');
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createPcmBlob(inputData);
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob as any }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              setTranscript(prev => [...prev.slice(-10), `Gumi: ${message.serverContent?.outputTranscription?.text}`]);
            }
            if (message.serverContent?.inputTranscription) {
              setTranscript(prev => [...prev.slice(-10), `Tú: ${message.serverContent?.inputTranscription?.text}`]);
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outAudioContextRef.current) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outAudioContextRef.current.currentTime);
              const buffer = await decodeAudioData(decode(base64Audio), outAudioContextRef.current, 24000, 1);
              const source = outAudioContextRef.current.createBufferSource();
              source.buffer = buffer;
              source.connect(outAudioContextRef.current.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => setIsActive(false),
          onerror: (e) => console.error('Live error', e),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: 'Eres Gumi, un guía mágico en El Mundo de Gumi. Sé breve, juguetón y encantador.',
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        }
      });

      sessionRef.current = await sessionPromise;
      setIsActive(true);
    } catch (error) {
      console.error('Failed to start voice', error);
      alert('Asegúrate de permitir el micrófono.');
    }
  };

  useEffect(() => {
    return () => {
      sessionRef.current?.close();
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <div className={`w-48 h-48 rounded-full flex items-center justify-center transition-all duration-500 shadow-xl ${isActive ? 'bg-yellow-300 scale-110' : 'bg-blue-100'}`}>
        <span className={`text-8xl transition-all ${isActive ? 'floating-gumi' : ''}`}>✨</span>
      </div>
      
      <button 
        onClick={toggleSession}
        className={`px-8 py-4 rounded-full font-magic text-xl text-white btn-magic-pop uppercase tracking-widest ${isActive ? 'bg-red-500' : 'bg-blue-600'}`}
      >
        {isActive ? 'Detener' : 'Hablar'}
      </button>

      <div className="w-full max-w-md bg-white/50 rounded-2xl p-4 min-h-[100px] shadow-inner text-sm overflow-y-auto max-h-40">
        {transcript.length === 0 ? (
          <p className="text-blue-400 italic text-center">Di algo para empezar...</p>
        ) : (
          transcript.map((line, i) => (
            <p key={i} className={`mb-1 ${line.startsWith('Gumi') ? 'font-bold text-blue-800' : 'text-blue-600'}`}>
              {line}
            </p>
          ))
        )}
      </div>
    </div>
  );
};

export default VoiceLive;
