
import React, { useState, useEffect } from 'react';
import { User, Section } from './types';
import PreLogin from './components/PreLogin';
import Auth from './components/Auth';
import Hub from './components/Hub';
import GameBoard from './components/GameBoard';
import Profile from './components/Profile';
import Info from './components/Info';
import PrintableCards from './components/PrintableCards';
import ChatBuddy from './components/ChatBuddy';
import VoiceLive from './components/VoiceLive';
import MediaGenerator from './components/MediaGenerator';
import { MAGIC_PATH } from './services/mockData';
import { supabase, isSupabaseReady } from './services/supabaseClient';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [section, setSection] = useState<Section | 'chat' | 'voice' | 'generator'>('pre-login');
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [initializing, setInitializing] = useState(true);

  const getDaysDiff = (date1: Date, date2: Date) => {
    const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
    return Math.floor((d2.getTime() - d1.getTime()) / 86400000);
  };

  const mapProfileToUser = (profile: any): User => {
    const lastLoginStr = profile.last_login || profile.lastLogin || new Date().toISOString();
    const lastDate = new Date(lastLoginStr);
    const today = new Date();
    const diff = getDaysDiff(lastDate, today);
    
    // Si ha pasado más de un día sin jugar, la racha se rompe (vuelve a 0)
    // Pero si juega hoy, la racha se mantendrá o subirá en handleGameComplete
    let currentStreak = Number(profile.streak) || 0;
    if (diff > 1) currentStreak = 0;

    return {
      id: profile.id,
      username: profile.username || 'Gumi',
      email: profile.email || '',
      nickname: profile.nickname || profile.username || 'Invitado',
      avatar: profile.avatar || '🌈',
      score: Number(profile.score) || 0,
      streak: currentStreak,
      progressIndex: Number(profile.progress_index || profile.progressIndex) || 0,
      lastLogin: lastLoginStr
    };
  };

  useEffect(() => {
    const initApp = async () => {
      try {
        const localData = localStorage.getItem('magic_user');
        if (localData) {
          const parsed = JSON.parse(localData);
          setUser(mapProfileToUser(parsed));
          setSection('hub');
        }

        if (isSupabaseReady()) {
          // Fix: Using cast to bypass potential type mismatches in Supabase library versions
          const { data: { session } } = await (supabase!.auth as any).getSession();
          if (session?.user) {
            const { data: profile } = await supabase!
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            if (profile) {
              const updatedUser = mapProfileToUser(profile);
              setUser(updatedUser);
              localStorage.setItem('magic_user', JSON.stringify(updatedUser));
            }
          }
        }
      } catch (err) {
        console.warn("Sincronización local:", err);
      } finally {
        setInitializing(false);
      }
    };
    initApp();
  }, []);

  const handleGameComplete = async (scoreGain: number) => {
    if (!user || selectedCardIndex === null) return;
    const today = new Date();
    const lastDate = new Date(user.lastLogin);
    const diff = getDaysDiff(lastDate, today);
    
    let newStreak = user.streak;
    
    // Lógica de racha:
    // Si es su primera vez o la racha estaba en 0, empieza en 1.
    // Si jugó ayer (diff === 1), aumenta la racha.
    // Si ya jugó hoy (diff === 0), la racha se mantiene igual.
    // Si pasó más de un día (diff > 1), se reinicia a 1 porque acaba de completar un juego.
    if (user.streak === 0 || diff > 1) {
      newStreak = 1;
    } else if (diff === 1) {
      newStreak = user.streak + 1;
    }

    const updatedUser: User = {
      ...user,
      score: user.score + scoreGain,
      streak: newStreak,
      progressIndex: Math.max(user.progressIndex, selectedCardIndex + 1),
      lastLogin: today.toISOString()
    };
    setUser(updatedUser);
    localStorage.setItem('magic_user', JSON.stringify(updatedUser));
    
    if (isSupabaseReady() && user.id !== 'guest') {
      console.log("Actualizando racha en Supabase:", newStreak);
      await supabase!.from('profiles').update({
        score: updatedUser.score,
        streak: updatedUser.streak,
        progress_index: updatedUser.progressIndex,
        last_login: updatedUser.lastLogin
      }).eq('id', user.id);
    }
    setSelectedCardIndex(null);
    setSection('hub');
  };

  if (initializing) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cyan-50">
       <div className="text-8xl animate-bounce mb-4">✨</div>
       <p className="font-magic text-cyan-600 animate-pulse text-xl uppercase">Cargando Magia...</p>
    </div>
  );

  const renderSection = () => {
    if (selectedCardIndex !== null && user) {
        return <GameBoard user={user} card={MAGIC_PATH[selectedCardIndex]} onComplete={handleGameComplete} onBack={() => setSelectedCardIndex(null)} />;
    }
    switch (section) {
      case 'pre-login': return <PreLogin onStart={() => setSection('login')} />;
      case 'login': return <Auth mode="login" onAuthSuccess={(u) => { setUser(u); setSection('hub'); }} toggleMode={() => setSection('register')} />;
      case 'register': return <Auth mode="register" onAuthSuccess={(u) => { setUser(u); setSection('hub'); }} toggleMode={() => setSection('login')} />;
      case 'hub': return user ? <Hub user={user} setSection={setSection as any} onSelectCard={setSelectedCardIndex} /> : null;
      case 'profile': return user ? <Profile user={user} onBack={() => setSection('hub')} onLogout={() => { setUser(null); localStorage.removeItem('magic_user'); setSection('pre-login'); }} onUpdate={(upd) => setUser({...user, ...upd})} /> : null;
      case 'info': return <Info onBack={() => setSection('hub')} />;
      case 'printable': return <PrintableCards onBack={() => setSection('hub')} />;
      case 'chat': return <div className="p-4 pt-20 max-w-2xl mx-auto"><button onClick={() => setSection('hub')} className="mb-4 text-white bg-indigo-600 px-6 py-2 rounded-full font-magic uppercase">Volver</button><ChatBuddy /></div>;
      case 'voice': return <div className="p-4 pt-20 max-w-2xl mx-auto"><button onClick={() => setSection('hub')} className="mb-4 text-white bg-indigo-600 px-6 py-2 rounded-full font-magic uppercase">Volver</button><VoiceLive /></div>;
      case 'generator': return <div className="p-4 pt-20 max-w-2xl mx-auto"><button onClick={() => setSection('hub')} className="mb-4 text-white bg-indigo-600 px-6 py-2 rounded-full font-magic uppercase">Volver</button><MediaGenerator /></div>;
      default: return <PreLogin onStart={() => setSection('login')} />;
    }
  };

  return <div className="min-h-screen pb-10">{renderSection()}</div>;
};

export default App;
