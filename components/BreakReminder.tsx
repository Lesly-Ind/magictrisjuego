import React from 'react';
import GumiGuide from './GumiGuide';
import { playPopSound } from './AudioUtils';

interface Props {
  breakLevel: 5 | 10 | null;
  onContinue: () => void;
  onEndSession: () => void;
}

const BreakReminder: React.FC<Props> = ({ breakLevel, onContinue, onEndSession }) => {
  if (!breakLevel) return null;

  const isFiveMin = breakLevel === 5;

  const handleContinue = () => {
    playPopSound();
    onContinue();
  };

  const handleEnd = () => {
    playPopSound();
    onEndSession();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-indigo-950/60 backdrop-blur-lg animate-fade-in">
      <div className="bg-white/95 backdrop-blur-2xl p-8 sm:p-10 rounded-[3rem] border-[8px] border-white shadow-2xl max-w-md w-full text-center space-y-6">
        <GumiGuide
          message={isFiveMin
            ? '¡Muy bien! Ya llevamos un ratito aprendiendo. ¿Quieres descansar un poquito?'
            : '¡Excelente trabajo! Ahora podemos descansar un poquito y volver después.'}
          size="medium"
          autoSpeak
        />

        <div className="space-y-3">
          <button
            onClick={handleEnd}
            aria-label={isFiveMin ? 'Descansar un poquito' : 'Terminar por ahora'}
            className="w-full bg-emerald-500 text-white py-5 rounded-[2rem] text-2xl font-magic shadow-xl hover:bg-emerald-600 border-b-[6px] border-emerald-800 transition-all active:translate-y-1 uppercase tracking-widest min-h-[64px] focus:outline-none focus:ring-4 focus:ring-emerald-200 flex items-center justify-center gap-3"
          >
            <span aria-hidden="true">{isFiveMin ? '🌙' : '🌟'}</span>
            {isFiveMin ? 'Descansar' : 'Terminar por ahora'}
          </button>

          <button
            onClick={handleContinue}
            aria-label={isFiveMin ? 'Seguir aprendiendo' : 'Seguir un poquito más'}
            className="w-full bg-indigo-500 text-white py-5 rounded-[2rem] text-2xl font-magic shadow-xl hover:bg-indigo-600 border-b-[6px] border-indigo-800 transition-all active:translate-y-1 uppercase tracking-widest min-h-[64px] focus:outline-none focus:ring-4 focus:ring-indigo-200 flex items-center justify-center gap-3"
          >
            <span aria-hidden="true">🎮</span>
            {isFiveMin ? 'Seguir' : 'Seguir un poquito más'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BreakReminder;
