import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { ALL_REWARDS, getEarnedRewardIds } from '../services/rewardService';
import { playPopSound } from './AudioUtils';

interface Props {
  user: User;
  onBack: () => void;
}

const Album: React.FC<Props> = ({ user, onBack }) => {
  const [earnedIds, setEarnedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const ids = await getEarnedRewardIds(user.id);
      setEarnedIds(ids);
      setLoading(false);
    };
    load();
  }, [user.id]);

  const handleBack = () => {
    playPopSound();
    onBack();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-6xl animate-bounce mb-4">✨</div>
        <p className="font-magic text-cyan-600 text-xl uppercase">Cargando álbum...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pt-20 pb-10 px-4 max-w-4xl mx-auto w-full">
      <button
        onClick={handleBack}
        aria-label="Volver al inicio"
        className="self-start mb-6 bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-lg border-2 border-blue-200 text-xl active:scale-90 transition-transform focus:outline-none focus:ring-4 focus:ring-blue-200 min-h-[64px] flex items-center justify-center"
      >
        🏠
      </button>

      <div className="text-center mb-8">
        <h2 className="text-4xl sm:text-6xl font-magic text-white drop-shadow-lg uppercase tracking-tighter mb-2">
          Mi Álbum
        </h2>
        <p className="text-sm sm:text-base font-bold text-cyan-300 uppercase tracking-widest">
          Tus premios mágicos
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
        {ALL_REWARDS.map(reward => {
          const earned = earnedIds.includes(reward.id);
          return (
            <div
              key={reward.id}
              className={`rounded-[2rem] border-4 p-5 sm:p-6 text-center transition-all min-h-[160px] flex flex-col items-center justify-center gap-2 ${
                earned
                  ? 'bg-white/90 border-white shadow-xl'
                  : 'bg-white/20 border-white/20'
              }`}
            >
              <div className={`text-5xl sm:text-6xl ${earned ? '' : 'grayscale opacity-30'}`} aria-hidden="true">
                {earned ? reward.icon : '🔒'}
              </div>
              <h3 className={`text-base sm:text-lg font-magic uppercase tracking-tight ${
                earned ? 'text-indigo-800' : 'text-white/50'
              }`}>
                {earned ? reward.name : 'Próximamente'}
              </h3>
              {earned && (
                <p className="text-[10px] sm:text-xs text-indigo-500 font-bold leading-snug">
                  {reward.description}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-white/10 backdrop-blur-md p-4 rounded-[2rem] border-2 border-white/20 text-center">
        <p className="text-sm font-bold text-cyan-300 uppercase tracking-wide">
          {earnedIds.length} de {ALL_REWARDS.length} premios
        </p>
      </div>
    </div>
  );
};

export default Album;
