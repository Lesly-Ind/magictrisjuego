import React, { useState } from 'react';
import { User } from '../types';
import GumiGuide from './GumiGuide';
import VisualAgenda, { AgendaStep } from './VisualAgenda';
import { playPopSound } from './AudioUtils';

interface Props {
  user: User;
  onStart: () => void;
  onBack: () => void;
}

const Greeting: React.FC<Props> = ({ user, onStart, onBack }) => {
  const [agendaStep] = useState<AgendaStep>('greeting');
  const greetingMessage = `¡Hola, ${user.nickname}! ¿Listos para aprender juntos?`;

  const handleStart = () => {
    playPopSound();
    onStart();
  };

  const handleBack = () => {
    playPopSound();
    onBack();
  };

  return (
    <div className="fixed inset-0 bg-indigo-950 z-[100] flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <button
        onClick={handleBack}
        aria-label="Volver al inicio"
        className="absolute top-4 left-4 bg-white/10 p-3 rounded-2xl border-2 border-white/20 text-2xl hover:bg-white/30 transition-all active:scale-90 shadow-lg focus:outline-none focus:ring-4 focus:ring-cyan-200 min-h-[64px] flex items-center justify-center"
      >
        🏠
      </button>

      <div className="bg-white/10 backdrop-blur-2xl p-6 sm:p-10 rounded-[3rem] border-2 border-white/30 w-full max-w-lg space-y-8 shadow-2xl text-center">
        <div className="mb-6">
          <VisualAgenda currentStep={agendaStep} />
        </div>

        <GumiGuide message={greetingMessage} size="large" autoSpeak />

        <div className="bg-indigo-900/60 rounded-[2rem] p-4 border-2 border-cyan-400/30">
          <p className="text-lg sm:text-2xl font-magic text-cyan-300 uppercase tracking-wide">
            ¿Listos para aprender?
          </p>
        </div>

        <button
          onClick={handleStart}
          aria-label="Empezar a aprender"
          className="w-full bg-pink-500 text-white py-5 rounded-[2rem] text-2xl font-magic shadow-2xl hover:bg-pink-600 border-b-[6px] border-pink-800 transition-all active:translate-y-1 uppercase tracking-widest min-h-[64px] focus:outline-none focus:ring-4 focus:ring-pink-200 flex items-center justify-center gap-3"
        >
          <span aria-hidden="true">🎯</span> ¡EMPEZAR!
        </button>
      </div>
    </div>
  );
};

export default Greeting;
