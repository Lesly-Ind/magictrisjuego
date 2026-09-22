
import React from 'react';
import { User, Section } from '../types';
import { MAGIC_PATH, MAGIC_LEVELS } from '../services/mockData';
import { playPopSound } from './AudioUtils';

interface Props {
  user: User;
  setSection: (s: Section) => void;
  onSelectCard: (index: number) => void;
}

const Hub: React.FC<Props> = ({ user, setSection, onSelectCard }) => {
  let globalCardIndex = 0;

  const handleSectionChange = (s: Section) => {
    playPopSound();
    setSection(s);
  };

  const handleCardSelect = (index: number) => {
    playPopSound();
    onSelectCard(index);
  };

  const getStreakData = (s: number) => {
    if (s === 0) return { color: 'from-gray-400 to-gray-500', icon: '❄️' };
    if (s < 4) return { color: 'from-orange-400 to-red-500', icon: '🔥' };
    if (s < 7) return { color: 'from-fuchsia-500 to-purple-600', icon: '💜' };
    return { color: 'from-yellow-400 via-orange-500 to-red-600 animate-pulse', icon: '👑' };
  };

  const streak = getStreakData(user.streak);
  const progressPercent = Math.round((user.progressIndex / MAGIC_PATH.length) * 100);

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* HEADER PREMIUM: LOGO IZQUIERDA + ESTADOS Y BOTONES DERECHA */}
      <header className="fixed top-0 left-0 right-0 h-20 sm:h-24 bg-indigo-900/80 backdrop-blur-xl shadow-2xl z-[60] px-3 sm:px-8 flex items-center justify-between border-b-4 border-white/10">
        
        {/* LOGOTIPO MAGIC TRIS */}
        <div className="flex items-center">
            <h1 className="text-xl sm:text-3xl md:text-4xl font-magic text-white tracking-tighter drop-shadow-[0_4px_0_rgba(0,0,0,0.3)] select-none">
                MAGIC<span className="text-cyan-400">TRIS</span>
            </h1>
        </div>

        {/* ELEMENTOS DE ESTADO Y BOTONES */}
        <div className="flex items-center gap-1.5 sm:gap-3 md:gap-4">
            
            {/* PUNTOS */}
            <div className="bg-white/10 px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl sm:rounded-2xl border-2 border-yellow-400/50 flex items-center gap-1 sm:gap-2 shadow-lg backdrop-blur-md">
                <span className="text-lg sm:text-2xl drop-shadow-md">⭐</span>
                <div className="flex flex-col items-start leading-none">
                    <span className="text-sm sm:text-xl font-magic text-white">{user.score}</span>
                    <span className="text-[5px] sm:text-[7px] font-magic text-yellow-300 font-bold uppercase tracking-widest">Puntos</span>
                </div>
            </div>
            
            {/* RACHA */}
            <div className={`bg-gradient-to-br ${streak.color} px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl sm:rounded-2xl border-2 border-white shadow-xl flex items-center gap-1 sm:gap-2 transform hover:scale-105 transition-all relative`}>
                <span className={`text-lg sm:text-2xl drop-shadow-md ${user.streak > 0 ? 'animate-bounce' : 'grayscale opacity-50'}`}>
                    {streak.icon}
                </span>
                <div className="flex flex-col items-start leading-none">
                    <span className="text-sm sm:text-xl font-magic text-white">{user.streak}</span>
                    <span className="text-[5px] sm:text-[7px] font-magic text-white/90 font-bold uppercase tracking-widest text-center w-full">Días</span>
                </div>
            </div>

            {/* BOTÓN INFORMACIÓN */}
            <button 
                onClick={() => handleSectionChange('info')}
                className="bg-cyan-500 text-white w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl shadow-lg border-2 border-white flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                title="¿Qué es MagicTris?"
            >
                <span className="text-sm sm:text-xl font-bold">❓</span>
            </button>

            {/* BOTÓN ÁLBUM */}
            <button 
                onClick={() => handleSectionChange('printable')}
                className="bg-white text-indigo-700 hover:bg-blue-50 px-2 py-1.5 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl border-2 border-indigo-200 text-[8px] sm:text-xs font-magic uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center gap-1 sm:gap-2 font-bold"
            >
                <span className="hidden sm:inline">🎴</span> Álbum
            </button>

            {/* PERFIL */}
            <button onClick={() => handleSectionChange('profile')} className="flex items-center gap-1 sm:gap-2 bg-white/10 p-0.5 sm:p-1 rounded-full border-2 border-white/20 hover:bg-white/30 shadow-lg pr-2 sm:pr-4">
                <span className="text-xl sm:text-3xl bg-white p-0.5 sm:p-1 rounded-full shadow-inner flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 overflow-hidden">{user.avatar}</span>
                <span className="text-[10px] sm:text-sm font-magic text-white hidden lg:block tracking-tight">{user.nickname}</span>
            </button>
        </div>
      </header>

      <main className="flex-1 pt-24 sm:pt-28 pb-32 px-4 max-w-6xl mx-auto w-full">
        <div className="flex flex-col items-center mb-10 sm:mb-16 text-center">
            <h2 className="text-4xl sm:text-7xl font-magic text-white drop-shadow-[0_8px_20px_rgba(0,0,0,0.6)] mb-2 uppercase tracking-tighter">Camino Mágico</h2>
        </div>

        {MAGIC_LEVELS.map((level, levelIdx) => (
          <div key={levelIdx} className="mb-24">
            <div className="flex items-center gap-6 mb-12">
              <div className="flex-1 h-1 bg-white/20 rounded-full"></div>
              <h3 className="text-2xl sm:text-3xl font-magic uppercase tracking-widest text-white drop-shadow-lg text-center">{level.name}</h3>
              <div className="flex-1 h-1 bg-white/20 rounded-full"></div>
            </div>
            <div className="flex flex-wrap justify-center gap-8 px-2">
              {level.items.map((item) => {
                const currentIndex = globalCardIndex++;
                const card = MAGIC_PATH[currentIndex];
                const isUnlocked = currentIndex <= user.progressIndex;
                const isNext = currentIndex === user.progressIndex;
                return (
                  <button
                    key={card.id}
                    disabled={!isUnlocked}
                    onClick={() => handleCardSelect(currentIndex)}
                    className={`group relative w-24 sm:w-32 aspect-[4/5] p-2 rounded-[2rem] flex flex-col items-center justify-around transition-all duration-300 shadow-xl border-4 ${
                      isUnlocked ? `${card.color} border-white/30 ${isNext ? 'ring-4 ring-yellow-400 scale-110 z-10' : 'hover:scale-105'}` : 'bg-indigo-950/40 opacity-40 grayscale border-transparent cursor-not-allowed'
                    }`}
                  >
                    <div className="text-4xl sm:text-5xl">{isUnlocked ? card.icon : '🔒'}</div>
                    <h4 className="font-magic text-white text-2xl sm:text-3xl uppercase">{isUnlocked ? card.value : ''}</h4>
                    {isNext && <div className="absolute -top-3 -right-3 bg-yellow-400 w-8 h-8 rounded-full border-2 border-white animate-bounce flex items-center justify-center text-xs shadow-lg z-20">⭐</div>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 z-40 flex justify-center pointer-events-none">
         <div className="bg-indigo-900/90 backdrop-blur-xl p-3 sm:p-4 rounded-[2rem] sm:rounded-[2.5rem] border-2 border-cyan-400/30 shadow-2xl flex items-center gap-3 sm:gap-4 w-full max-w-md pointer-events-auto transform hover:scale-102 transition-transform">
            <div className="text-3xl sm:text-4xl floating-gumi select-none">👾</div>
            <div className="flex-1">
                <div className="w-full bg-black/40 h-2.5 sm:h-3 rounded-full overflow-hidden border border-white/10">
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 shadow-[0_0_15px_rgba(34,211,238,0.6)] transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
                </div>
                <div className="flex justify-between mt-1.5 px-1">
                    <p className="text-[8px] sm:text-[10px] font-magic text-cyan-300 uppercase tracking-widest">Progreso Mágico</p>
                    <p className="text-[8px] sm:text-[10px] font-bold text-white/70 uppercase tracking-tighter">{progressPercent}% Completado</p>
                </div>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default Hub;
