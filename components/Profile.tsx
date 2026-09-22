
import React, { useState } from 'react';
import { User } from '../types';
import { playPopSound } from './AudioUtils';

interface Props { 
    user: User; 
    onBack: () => void; 
    onLogout: () => void;
    onUpdate: (u: Partial<User>) => void;
}

const Profile: React.FC<Props> = ({ user, onBack, onLogout, onUpdate }) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [tempNickname, setTempNickname] = useState(user.nickname);
  const avatars = ['🐧', '👾', '🤖', '🦋', '🦁', '⭐', '🐻‍❄️', '🐥'];

  const handleBack = () => {
    playPopSound();
    onBack();
  };

  const handleAvatarSelect = (a: string) => {
    playPopSound();
    onUpdate({ avatar: a });
  };

  const handleLogoutClick = () => {
    playPopSound();
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = () => {
    playPopSound();
    onLogout();
  };

  const handleLogoutCancel = () => {
    playPopSound();
    setShowLogoutConfirm(false);
  };

  const handleNicknameBlur = () => {
    if (tempNickname.trim() !== user.nickname) {
        onUpdate({ nickname: tempNickname.trim() });
    }
  };

  return (
    <div className="p-4 pt-16 max-w-4xl mx-auto space-y-4 pb-12 relative">
      <button onClick={handleBack} className="fixed top-4 left-4 bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-lg border-2 border-blue-200 text-3xl z-[60] active:scale-90 transition-transform">🏠</button>
      
      <div className="bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-2xl overflow-hidden border-[8px] border-white ring-4 ring-blue-100/30">
        
        <div className="bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 p-6 flex flex-row items-center justify-center gap-6">
          <div className="relative">
            <span className="text-[70px] bg-white w-24 h-24 rounded-full border-[6px] border-white shadow-xl flex items-center justify-center animate-bounce-in">
              {user.avatar}
            </span>
            <div className="absolute -bottom-1 -right-1 bg-yellow-400 p-2 rounded-full border-2 border-white shadow-lg animate-pulse text-xs">✨</div>
          </div>
          <h2 className="text-3xl text-white font-magic drop-shadow-lg uppercase tracking-tight">¡Perfil de {user.nickname}!</h2>
        </div>

        <div className="p-6 sm:p-8 space-y-6 bg-white/50">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-magic text-blue-500 uppercase tracking-widest ml-4">Nombre Real</label>
              <div className="w-full bg-gray-50 px-6 py-3 rounded-full border-2 border-gray-100 text-lg font-bold text-gray-500 shadow-inner italic">
                {user.username}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-magic text-blue-500 uppercase tracking-widest ml-4">Correo Amigo</label>
              <div className="w-full bg-gray-50 px-6 py-3 rounded-full border-2 border-gray-100 text-base font-bold text-gray-400 shadow-inner overflow-hidden text-ellipsis">
                {user.email}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-magic text-pink-500 uppercase tracking-widest ml-4">Apodo Mágico (Toca para cambiar)</label>
            <input 
              type="text"
              value={tempNickname}
              onChange={(e) => setTempNickname(e.target.value)}
              onBlur={handleNicknameBlur}
              className="w-full bg-blue-50 px-6 py-4 rounded-full border-2 border-blue-200 text-2xl font-magic text-blue-600 outline-none focus:ring-4 focus:ring-blue-100 transition-all shadow-md placeholder-blue-200"
              placeholder="Escribe tu apodo..."
              spellCheck="false"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-yellow-100/50 p-4 rounded-[2rem] text-center border-2 border-yellow-200 shadow-sm">
                <p className="text-4xl mb-1">⭐</p>
                <p className="text-3xl font-magic text-yellow-700">{user.score}</p>
                <p className="text-[10px] uppercase font-magic text-yellow-600 tracking-widest">Estrellas</p>
              </div>
              <div className="bg-orange-100/50 p-4 rounded-[2rem] text-center border-2 border-orange-200 shadow-sm">
                <p className="text-4xl mb-1">🔥</p>
                <p className="text-3xl font-magic text-orange-700">{user.streak}</p>
                <p className="text-[10px] uppercase font-magic text-orange-600 tracking-widest">Racha</p>
              </div>
            </div>

            <div className="bg-indigo-50/50 p-4 rounded-[2.5rem] border-2 border-indigo-100">
              <h3 className="text-sm font-magic text-indigo-700 mb-3 text-center uppercase tracking-tighter">Cambia tu foto</h3>
              <div className="flex justify-center gap-2 flex-wrap">
                {avatars.map(a => (
                  <button 
                    key={a}
                    onClick={() => handleAvatarSelect(a)}
                    className={`text-3xl p-2 rounded-xl transition-all border-2 ${user.avatar === a ? 'bg-white border-blue-500 scale-110 shadow-md' : 'bg-white/40 border-transparent hover:bg-white hover:border-blue-200'}`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button 
            onClick={handleLogoutClick}
            className="w-full bg-red-50 text-red-500 py-4 rounded-full text-xl font-magic border-2 border-red-100 hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95 uppercase tracking-tighter"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-indigo-950/50 backdrop-blur-lg animate-fade-in">
          <div className="bg-white/95 backdrop-blur-2xl border-[10px] border-blue-400 p-8 rounded-[4rem] shadow-2xl w-full max-w-md flex flex-col items-center text-center transform animate-[bounceIn_0.6s_ease-out]">
            <div className="text-[80px] mb-2 floating-gumi">👾</div>
            <h3 className="text-3xl font-magic text-blue-800 mb-2 leading-tight uppercase">¿Quieres salir?</h3>
            <p className="text-lg font-bold text-gray-500 mb-6">¡Gumi y las letras te esperarán!</p>
            
            <div className="w-full space-y-3">
              <button 
                onClick={handleLogoutConfirm}
                className="btn-magic-pop w-full bg-red-500 text-white py-4 rounded-[2rem] text-2xl font-magic shadow-xl border-b-6 border-red-700 active:translate-y-1 uppercase tracking-widest"
              >
                CONFIRMAR
              </button>
              
              <button 
                onClick={handleLogoutCancel}
                className="w-full bg-blue-100 text-blue-600 py-4 rounded-[2rem] text-xl font-magic border-2 border-blue-200 hover:bg-blue-200 transition-all active:scale-95 uppercase tracking-widest"
              >
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounceIn {
          0% { opacity: 0; transform: scale(0.3); }
          50% { opacity: 1; transform: scale(1.1); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Profile;
