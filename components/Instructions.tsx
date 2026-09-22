
import React from 'react';

interface Props { onBack: () => void; }

const Instructions: React.FC<Props> = ({ onBack }) => {
  const steps = [
    { icon: '🗺️', title: 'Elige un mundo', text: 'Toca los módulos para empezar a aprender.' },
    { icon: '🎴', title: 'Toca las cartas', text: 'Haz clic en las cartas para ver qué hay detrás.' },
    { icon: '🔊', title: 'Escucha y mira', text: 'Pipo te dirá cómo se dice y verás videos divertidos.' },
    { icon: '🔥', title: 'Juega cada día', text: '¡Mantén tu racha para que tu llama cambie de color!' },
  ];

  return (
    <div className="flex flex-col h-full animate-fade-in p-2">
      <header className="flex items-center mb-8">
        <button 
          onClick={onBack} 
          className="bg-white/40 hover:bg-white/60 p-3 rounded-2xl text-blue-900 font-bold transition-all flex items-center gap-2 shadow-sm"
        >
          <span>←</span> Volver
        </button>
      </header>
      
      <div className="flex-1 flex flex-col items-center">
        <h2 className="text-4xl md:text-5xl text-blue-700 font-magic text-center mb-10 drop-shadow-sm uppercase">Cómo Jugar</h2>
        
        <div className="w-full max-w-2xl space-y-6 mb-12">
          {steps.map((step, i) => (
            <div 
              key={i} 
              className="bg-white/80 backdrop-blur-md p-6 rounded-[2.5rem] shadow-xl border-l-[12px] border-blue-500 flex gap-6 items-center transform transition-transform hover:scale-[1.02]"
            >
              <div className="bg-blue-100 p-4 rounded-full shadow-inner">
                <span className="text-5xl sm:text-6xl">{step.icon}</span>
              </div>
              <div>
                <h3 className="text-2xl font-magic text-blue-600 mb-1">{step.title}</h3>
                <p className="text-lg text-blue-900/80 font-bold leading-tight">{step.text}</p>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={onBack} 
          className="w-full max-w-md bg-blue-600 text-white py-6 rounded-[2.5rem] text-3xl font-magic shadow-2xl btn-magic-pop mb-10 uppercase tracking-widest"
        >
          ENTENDIDO
        </button>
      </div>
    </div>
  );
};

export default Instructions;
