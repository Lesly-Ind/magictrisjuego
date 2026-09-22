
import React, { useState } from 'react';
import { User } from '../types';
import { supabase, isSupabaseReady } from '../services/supabaseClient';
import { playPopSound } from './AudioUtils';

interface Props {
  mode: 'login' | 'register';
  onAuthSuccess: (u: User) => void;
  toggleMode: () => void;
}

const Auth: React.FC<Props> = ({ mode, onAuthSuccess, toggleMode }) => {
  const [formData, setFormData] = useState({ name: '', email: '', pass: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGuestEntry = () => {
    playPopSound();
    onAuthSuccess({
      id: 'guest',
      username: 'Invitado',
      email: '',
      nickname: 'Amigo Mágico',
      avatar: '🦄',
      score: 0,
      streak: 1,
      lastLogin: new Date().toISOString(),
      progressIndex: 0
    });
  };

  const handleToggle = () => {
    playPopSound();
    toggleMode();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playPopSound();
    
    if (!isSupabaseReady()) {
        setError("⚠️ ERROR DE CONEXIÓN: No se detectan las llaves de Supabase. Asegúrate de haber hecho un 'Redeploy' en Vercel después de guardar las variables.");
        return;
    }
    
    if (!formData.email || !formData.pass) {
        setError("Por favor, completa todos los campos.");
        return;
    }

    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        if (formData.pass !== formData.confirm) throw new Error('Las contraseñas no coinciden.');
        if (formData.pass.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres.');
        
        // Fix: Use type cast for Supabase V2 auth compatibility
        const { data: authData, error: authError } = await (supabase!.auth as any).signUp({
          email: formData.email,
          password: formData.pass,
          options: {
            data: {
              display_name: formData.name || 'Gumi Amigo'
            }
          }
        });

        if (authError) {
            if (authError.message.includes("Database error saving new user")) {
               throw new Error("Error de base de datos. Verifica el SQL Trigger en Supabase.");
            }
            throw authError;
        }

        if (authData.user) {
          if (!authData.session) {
            setError("¡Cuenta creada! Revisa tu email para confirmar o desactiva 'Confirm Email' en Supabase.");
            setLoading(false);
            return;
          }

          await new Promise(r => setTimeout(r, 1000));

          const { data: profile, error: pError } = await supabase!
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();

          if (pError || !profile) {
            const newProfile = {
              id: authData.user.id,
              username: formData.name || formData.email.split('@')[0],
              email: formData.email,
              nickname: formData.name || 'Gumi Amigo',
              avatar: '🌈',
              score: 0,
              streak: 0, // Empezará en 1 al ganar el primer juego
              progress_index: 0,
              last_login: new Date().toISOString()
            };
            await supabase!.from('profiles').insert(newProfile);
            onAuthSuccess({ 
              id: newProfile.id,
              username: newProfile.username,
              email: newProfile.email,
              nickname: newProfile.nickname,
              avatar: newProfile.avatar,
              score: 0,
              streak: 0,
              progressIndex: 0,
              lastLogin: newProfile.last_login
            });
          } else {
            onAuthSuccess({
                id: profile.id,
                username: profile.username || 'Gumi',
                email: profile.email || '',
                nickname: profile.nickname || profile.username || 'Amigo',
                avatar: profile.avatar || '🌈',
                score: Number(profile.score) || 0,
                streak: Number(profile.streak) || 0,
                progressIndex: Number(profile.progress_index) || 0,
                lastLogin: profile.last_login || new Date().toISOString()
            });
          }
        }
      } else {
        // Fix: Use type cast for Supabase V2 auth compatibility
        const { data: authData, error: authError } = await (supabase!.auth as any).signInWithPassword({
          email: formData.email,
          password: formData.pass,
        });
        
        if (authError) throw authError;
        
        if (authData.user) {
          const { data: profile, error: pError } = await supabase!
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();
            
          if (pError || !profile) throw new Error("Perfil no encontrado.");
          
          onAuthSuccess({
              id: profile.id,
              username: profile.username,
              email: profile.email,
              nickname: profile.nickname,
              avatar: profile.avatar,
              score: profile.score,
              streak: profile.streak,
              progressIndex: profile.progress_index,
              lastLogin: profile.last_login
          });
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión mágica.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full p-4 rounded-3xl border-2 border-indigo-200 text-black font-bold focus:ring-4 focus:ring-indigo-100 outline-none placeholder-indigo-300 bg-white/80 transition-all shadow-sm";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="bg-white/80 backdrop-blur-2xl p-6 sm:p-8 rounded-[2.5rem] sm:rounded-[3.5rem] shadow-2xl w-full max-w-md border-[6px] sm:border-[8px] border-white flex flex-col items-center animate-fade-in">
        <div className="mb-4 sm:mb-6 text-center">
            <h2 className="text-2xl sm:text-4xl font-magic text-indigo-700 uppercase tracking-tighter drop-shadow-sm">
              {mode === 'login' ? '¡HOLA DE NUEVO!' : '¡HOLA NUEVO AMIGO!'}
            </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="w-full space-y-3 sm:space-y-4">
          {mode === 'register' && (
            <input className={inputClass} placeholder="¿Cómo te llamas?" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          )}
          <input className={inputClass} placeholder="Correo electrónico" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          <input className={inputClass} placeholder="Tu contraseña" type="password" value={formData.pass} onChange={e => setFormData({...formData, pass: e.target.value})} />
          {mode === 'register' && (
            <input className={inputClass} placeholder="Repite tu contraseña" type="password" value={formData.confirm} onChange={e => setFormData({...formData, confirm: e.target.value})} />
          )}
          
          {error && (
            <div className="bg-red-50 p-3 sm:p-4 rounded-2xl border-2 border-red-100 animate-pulse">
                <p className="text-red-600 text-[10px] font-black text-center uppercase leading-tight">{error}</p>
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-indigo-600 text-white py-4 sm:py-5 rounded-[1.5rem] sm:rounded-[2rem] font-magic text-xl sm:text-2xl shadow-xl hover:bg-indigo-700 active:translate-y-1 transition-all border-b-6 sm:border-b-8 border-indigo-800"
          >
            {loading ? 'CARGANDO...' : 'ENTRAR'}
          </button>
        </form>

        <div className="mt-8 flex flex-col gap-4 w-full text-center">
            <button onClick={handleToggle} className="text-indigo-400 text-sm font-bold uppercase tracking-widest">
                {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Entra'}
            </button>
            <button onClick={handleGuestEntry} className="text-pink-500 font-magic text-xl uppercase">
                MODO INVITADO
            </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
