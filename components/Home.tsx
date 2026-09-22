
import React from 'react';
import VoiceButton from './VoiceButton';
import { User } from '../types';

interface Props {
  user: User;
}

const Home: React.FC<Props> = ({ user }) => {
  const welcomeText = `¡Hola ${user.username}! Qué alegría verte hoy. Vamos a aprender y jugar juntos en este mundo mágico.`;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4 md:p-6 animate-fade-in">
      <div className="relative mb-8">
        <div className="w-64 h-48 md:w-80 md:h-60 rounded-[3rem] border-[10px] border-white shadow-2xl overflow-hidden rotate-2 hover:rotate-0 transition-transform duration-500 bg-blue-100 flex items-center justify-center">
          <span className="text-8xl floating-gumi">🌈</span>
        </div>
        <div className="absolute -top-6 -right-6 bg-yellow-400 p-4 rounded-full text-4xl shadow-lg animate-bounce border-4 border-white">
          🌟
        </div>
      </div>
      
      <h1 className="text-4xl md:text-6xl magic-title mb-4">¡Hola {user.username}!</h1>
      <p className="text-xl md:text-2xl text-blue-900/70 font-bold mb-8 max-w-md leading-relaxed">
        ¡Qué alegría verte hoy! Vamos a aprender y jugar juntos en este mundo mágico.
      </p>

      <div className="flex flex-col items-center gap-4">
        <VoiceButton 
          text={welcomeText} 
          className="!px-10 !py-5 !text-2xl btn-magic-pop bg-blue-600 shadow-[0_8px_0_#1e3a8a]" 
        />
        <span className="text-sm font-bold text-blue-400 uppercase tracking-widest">Escuchar saludo</span>
      </div>
      
      <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
        {[
          { icon: '📚', label: 'Lee', color: 'border-blue-300 text-blue-500' },
          { icon: '🎨', label: 'Crea', color: 'border-green-300 text-green-500' },
          { icon: '🧸', label: 'Juega', color: 'border-yellow-300 text-yellow-600' },
          { icon: '💖', label: 'Siente', color: 'border-pink-300 text-pink-500' },
        ].map((item, i) => (
          <div key={i} className={`bg-white p-4 rounded-[2rem] shadow-md border-b-8 transition-transform hover:scale-105 ${item.color}`}>
            <span className="text-4xl block mb-2">{item.icon}</span>
            <p className="font-magic text-xl">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
