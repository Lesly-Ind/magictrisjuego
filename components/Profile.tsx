
import React, { useState, useEffect } from 'react';
import { User, AudioSettings, VoiceSpeed, EffectsVolume, DEFAULT_AUDIO_SETTINGS } from '../types';
import { playPopSound } from './AudioUtils';
import { getAudioSettings, saveAudioSettings, subscribeToAudioSettings } from '../services/audioSettings';

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

  const [audioSettings, setAudioSettings] = useState<AudioSettings>({ ...DEFAULT_AUDIO_SETTINGS });

  useEffect(() => {
    const unsub = subscribeToAudioSettings((s) => setAudioSettings(s));
    return unsub;
  }, []);

  const handleAudioChange = (partial: Partial<AudioSettings>) => {
    const updated = { ...audioSettings, ...partial };
    setAudioSettings(updated);
    saveAudioSettings(user.id, updated);
  };

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

          {/* Audio Settings Section */}
          <div className="bg-cyan-50/60 p-5 rounded-[2.5rem] border-2 border-cyan-200 space-y-5">
            <h3 className="text-sm font-magic text-cyan-700 text-center uppercase tracking-tighter flex items-center justify-center gap-2">
              <span aria-hidden="true">🔊</span> Configuración de Audio
            </h3>

            {/* Voice Speed */}
            <div className="space-y-2">
              <label className="text-[10px] font-magic text-cyan-600 uppercase tracking-widest ml-2 block">Velocidad de Voz</label>
              <div className="flex gap-2">
                {([
                  { value: 'slow', label: '🐢 Lenta' },
                  { value: 'normal', label: '🚶 Normal' },
                  { value: 'fast', label: '🐇 Rápida' },
                ] as { value: VoiceSpeed; label: string }[]).map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => handleAudioChange({ voiceSpeed: opt.value })}
                    className={`flex-1 py-3 px-2 rounded-2xl text-sm font-bold transition-all border-2 min-h-[64px] flex items-center justify-center ${
                      audioSettings.voiceSpeed === opt.value
                        ? 'bg-cyan-500 text-white border-cyan-600 shadow-md scale-105'
                        : 'bg-white text-cyan-600 border-cyan-100 hover:bg-cyan-50'
                    }`}
                    aria-pressed={audioSettings.voiceSpeed === opt.value}
                    aria-label={`Velocidad de voz ${opt.label}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Volume */}
            <div className="space-y-2">
              <label className="text-[10px] font-magic text-cyan-600 uppercase tracking-widest ml-2 block">Volumen de Voz</label>
              <div className="flex gap-2">
                {[0, 25, 50, 75, 100].map(vol => (
                  <button
                    key={vol}
                    onClick={() => handleAudioChange({ voiceVolume: vol })}
                    className={`flex-1 py-3 px-1 rounded-2xl text-sm font-bold transition-all border-2 min-h-[64px] flex items-center justify-center ${
                      audioSettings.voiceVolume === vol
                        ? 'bg-cyan-500 text-white border-cyan-600 shadow-md scale-105'
                        : 'bg-white text-cyan-600 border-cyan-100 hover:bg-cyan-50'
                    }`}
                    aria-pressed={audioSettings.voiceVolume === vol}
                    aria-label={`Volumen de voz ${vol} por ciento`}
                  >
                    {vol}%
                  </button>
                ))}
              </div>
            </div>

            {/* Effects Volume */}
            <div className="space-y-2">
              <label className="text-[10px] font-magic text-cyan-600 uppercase tracking-widest ml-2 block">Sonidos de Interfaz</label>
              <div className="flex gap-2">
                {([
                  { value: 'normal', label: '🔔 Normal' },
                  { value: 'soft', label: '🍃 Suave' },
                  { value: 'off', label: '🚫 Apagado' },
                ] as { value: EffectsVolume; label: string }[]).map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => handleAudioChange({ effectsVolume: opt.value })}
                    className={`flex-1 py-3 px-2 rounded-2xl text-sm font-bold transition-all border-2 min-h-[64px] flex items-center justify-center ${
                      audioSettings.effectsVolume === opt.value
                        ? 'bg-cyan-500 text-white border-cyan-600 shadow-md scale-105'
                        : 'bg-white text-cyan-600 border-cyan-100 hover:bg-cyan-50'
                    }`}
                    aria-pressed={audioSettings.effectsVolume === opt.value}
                    aria-label={`Sonidos de interfaz ${opt.label}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[10px] text-cyan-500 text-center italic">
              {user.id === 'guest' ? 'Se guardan en este dispositivo.' : 'Se guardan en tu cuenta.'}
            </p>
          </div>

          {/* Accessibility Section */}
          <div className="bg-emerald-50/60 p-5 rounded-[2.5rem] border-2 border-emerald-200 space-y-5">
            <h3 className="text-sm font-magic text-emerald-700 text-center uppercase tracking-tighter flex items-center justify-center gap-2">
              <span aria-hidden="true">♿</span> Accesibilidad
            </h3>

            {/* High Contrast Toggle */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-bold text-emerald-800 uppercase tracking-wide">Alto Contraste</p>
                <p className="text-[10px] text-emerald-600 mt-1">Aumenta el contraste de textos y botones.</p>
              </div>
              <button
                onClick={() => handleAudioChange({ highContrast: !audioSettings.highContrast })}
                className={`relative w-16 h-10 rounded-full transition-all border-2 min-h-[44px] ${
                  audioSettings.highContrast
                    ? 'bg-emerald-500 border-emerald-600'
                    : 'bg-gray-200 border-gray-300'
                }`}
                role="switch"
                aria-checked={audioSettings.highContrast}
                aria-label="Activar alto contraste"
              >
                <span
                  className={`absolute top-1 left-1 w-7 h-7 rounded-full bg-white shadow-md transition-transform ${
                    audioSettings.highContrast ? 'translate-x-6' : ''
                  }`}
                />
              </button>
            </div>

            {/* Reduce Motion Toggle */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-bold text-emerald-800 uppercase tracking-wide">Reducir Animaciones</p>
                <p className="text-[10px] text-emerald-600 mt-1">Reduce movimientos y efectos visuales.</p>
              </div>
              <button
                onClick={() => handleAudioChange({ reduceMotion: !audioSettings.reduceMotion })}
                className={`relative w-16 h-10 rounded-full transition-all border-2 min-h-[44px] ${
                  audioSettings.reduceMotion
                    ? 'bg-emerald-500 border-emerald-600'
                    : 'bg-gray-200 border-gray-300'
                }`}
                role="switch"
                aria-checked={audioSettings.reduceMotion}
                aria-label="Activar reducción de animaciones"
              >
                <span
                  className={`absolute top-1 left-1 w-7 h-7 rounded-full bg-white shadow-md transition-transform ${
                    audioSettings.reduceMotion ? 'translate-x-6' : ''
                  }`}
                />
              </button>
            </div>

            <p className="text-[10px] text-emerald-500 text-center italic">
              {user.id === 'guest' ? 'Se guardan en este dispositivo.' : 'Se guardan en tu cuenta.'}
            </p>
          </div>

          <button
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
