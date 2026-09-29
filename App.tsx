
import React, { useState, useEffect } from 'react';
import { User, Section, AudioSettings, DEFAULT_AUDIO_SETTINGS } from './types';
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
import WordLearning from './components/WordLearning';
import Greeting from './components/Greeting';
import BreakReminder from './components/BreakReminder';
import Album from './components/Album';
import { MAGIC_PATH } from './services/mockData';
import { supabase, isSupabaseReady } from './services/supabaseClient';
import { loadAudioSettings, subscribeToAudioSettings } from './services/audioSettings';
import { useSession } from './services/useSession';
import { earnReward } from './services/rewardService';

const GUEST_USER: User = {
  id: 'guest', username: '', email: '', nickname: 'Invitado',
  avatar: '🌈', score: 0, streak: 0, lastLogin: '', progressIndex: 0,
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [section, setSection] = useState<Section | 'chat' | 'voice' | 'generator'>('pre-login');
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [audioSettings, setAudioSettingsState] = useState<AudioSettings>({ ...DEFAULT_AUDIO_SETTINGS });
  const [greetingActive, setGreetingActive] = useState(false);
  const session = useSession(user || GUEST_USER);

  useEffect(() => {
    const unsub = subscribeToAudioSettings((s) => setAudioSettingsState(s));
    return unsub;
  }, []);

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
      let resolvedUser: User | null = null;
      const localData = localStorage.getItem('magic_user');
      if (localData) {
        const parsed = JSON.parse(localData);
        resolvedUser = mapProfileToUser(parsed);
        setUser(resolvedUser);
        setSection('hub');
      }

      if (isSupabaseReady()) {
        const { data: { session } } = await (supabase!.auth as any).getSession();
        if (session?.user) {
          const { data: profile } = await supabase!
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          if (profile) {
            const updatedUser = mapProfileToUser(profile);
            resolvedUser = updatedUser;
            setUser(updatedUser);
            localStorage.setItem('magic_user', JSON.stringify(updatedUser));
          }
        }
      }

      const userIdForAudio = resolvedUser?.id || 'guest';
      await loadAudioSettings(userIdForAudio);
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
      await supabase!.from('profiles').update({
        score: updatedUser.score,
        streak: updatedUser.streak,
        progress_index: updatedUser.progressIndex,
        last_login: updatedUser.lastLogin
      }).eq('id', user.id);
    }
    setSelectedCardIndex(null);
    setSection('hub');
    session.recordActivity();
    earnReward(user.id, 'butterfly');
  };

  const handleWordsComplete = (scoreGain: number) => {
    if (!user) return;
    const updatedUser = { ...user, score: user.score + scoreGain };
    setUser(updatedUser);
    localStorage.setItem('magic_user', JSON.stringify(updatedUser));
    if (isSupabaseReady() && user.id !== 'guest') {
      supabase!.from('profiles').update({ score: updatedUser.score }).eq('id', user.id);
    }
    session.recordActivity();
    earnReward(user.id, 'star_first');
    earnReward(user.id, 'flower');
  };

  if (initializing) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cyan-50">
       <div className="text-8xl animate-bounce mb-4">✨</div>
       <p className="font-magic text-cyan-600 animate-pulse text-xl uppercase">Cargando Magia...</p>
    </div>
  );

  const handleStartWordsWithGreeting = () => {
    setSection('words');
    setGreetingActive(true);
  };

  const handleStartPlayWithGreeting = (index: number) => {
    setSelectedCardIndex(index);
    setGreetingActive(true);
  };

  const handleGreetingStart = () => {
    setGreetingActive(false);
    session.startSession();
  };

  const handleBreakContinue = () => {
    session.dismissBreak();
  };

  const handleBreakEnd = () => {
    session.endCurrentSession();
    session.dismissBreak();
    setSelectedCardIndex(null);
    setSection('hub');
  };

  const renderSection = () => {
    if (selectedCardIndex !== null && user) {
        return <GameBoard user={user} card={MAGIC_PATH[selectedCardIndex]} onComplete={handleGameComplete} onBack={() => setSelectedCardIndex(null)} />;
    }
    switch (section) {
      case 'pre-login': return <PreLogin onStart={() => setSection('login')} />;
      case 'login': return <Auth mode="login" onAuthSuccess={(u) => { setUser(u); loadAudioSettings(u.id); setSection('hub'); }} toggleMode={() => setSection('register')} />;
      case 'register': return <Auth mode="register" onAuthSuccess={(u) => { setUser(u); loadAudioSettings(u.id); setSection('hub'); }} toggleMode={() => setSection('login')} />;
      case 'hub': return user ? <Hub user={user} setSection={setSection as any} onSelectCard={setSelectedCardIndex} onStartWordsWithGreeting={handleStartWordsWithGreeting} onStartPlayWithGreeting={handleStartPlayWithGreeting} /> : null;
      case 'profile': return user ? <Profile user={user} onBack={() => setSection('hub')} onLogout={() => { setUser(null); localStorage.removeItem('magic_user'); loadAudioSettings('guest'); setSection('pre-login'); }} onUpdate={(upd) => setUser({...user, ...upd})} onOpenAlbum={() => setSection('album')} /> : null;
      case 'info': return <Info onBack={() => setSection('hub')} />;
      case 'printable': return <PrintableCards onBack={() => setSection('hub')} />;
      case 'album': return user ? <Album user={user} onBack={() => setSection('hub')} /> : null;
      case 'words': return user ? <WordLearning user={user} onBack={() => setSection('hub')} onComplete={handleWordsComplete} /> : null;
      case 'chat': return <div className="p-4 pt-20 max-w-2xl mx-auto"><button onClick={() => setSection('hub')} className="mb-4 text-white bg-indigo-600 px-6 py-2 rounded-full font-magic uppercase">Volver</button><ChatBuddy /></div>;
      case 'voice': return <div className="p-4 pt-20 max-w-2xl mx-auto"><button onClick={() => setSection('hub')} className="mb-4 text-white bg-indigo-600 px-6 py-2 rounded-full font-magic uppercase">Volver</button><VoiceLive /></div>;
      case 'generator': return <div className="p-4 pt-20 max-w-2xl mx-auto"><button onClick={() => setSection('hub')} className="mb-4 text-white bg-indigo-600 px-6 py-2 rounded-full font-magic uppercase">Volver</button><MediaGenerator /></div>;
      default: return <PreLogin onStart={() => setSection('login')} />;
    }
  };

  const showGreeting = greetingActive && user;

  return (
    <div
      className="min-h-screen pb-10"
      data-high-contrast={audioSettings.highContrast ? 'true' : 'false'}
      data-reduce-motion={audioSettings.reduceMotion ? 'true' : 'false'}
    >
      {showGreeting ? (
        <Greeting
          user={user!}
          onStart={handleGreetingStart}
          onBack={() => { setGreetingActive(false); setSection('hub'); }}
        />
      ) : (
        <>
          {renderSection()}
          <BreakReminder
            breakLevel={session.breakLevel}
            onContinue={handleBreakContinue}
            onEndSession={handleBreakEnd}
          />
        </>
      )}
    </div>
  );
};

export default App;
