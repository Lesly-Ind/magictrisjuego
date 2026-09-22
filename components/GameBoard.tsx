
import React, { useState, useMemo } from 'react';
import { User, MagicCard, GameState } from '../types';
import VoiceButton from './VoiceButton';
import { playPopSound, playSuccessSound } from './AudioUtils';
import { MAGIC_PATH } from '../services/mockData';

interface Props {
  user: User;
  card: MagicCard;
  onComplete: (scoreGain: number) => void;
  onBack: () => void;
}

const GameBoard: React.FC<Props> = ({ user, card, onComplete, onBack }) => {
  const [gameState, setGameState] = useState<GameState['step']>('intro');
  const [feedback, setFeedback] = useState<'success' | 'error' | null>(null);

  // Generar distractores de letras/sílabas de forma más inteligente
  const letterChoices = useMemo(() => {
    const others = MAGIC_PATH
      .filter(c => c.value !== card.value && c.type === card.type)
      .map(c => c.value);
    
    // Si no hay suficientes del mismo tipo, usar cualquiera
    const fallback = MAGIC_PATH.filter(c => c.value !== card.value).map(c => c.value);
    const source = others.length >= 2 ? others : fallback;
    
    const shuffled = [...source].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 2);
    return [...selected, card.value].sort(() => Math.random() - 0.5);
  }, [card.value, card.type]);

  // Generar distractores de pictogramas (emojis)
  const emojiChoices = useMemo(() => {
    const otherEmojis = MAGIC_PATH
      .filter(c => c.icon !== card.icon)
      .map(c => c.icon);
    
    const shuffled = [...otherEmojis].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 2);
    return [...selected, card.icon].sort(() => Math.random() - 0.5);
  }, [card.icon]);

  const handleCorrectIdentify = () => {
    playSuccessSound();
    setFeedback('success');
    setTimeout(() => {
      setFeedback(null);
      setGameState('findLetter');
    }, 1200);
  };

  const handleCorrectFindLetter = () => {
    playSuccessSound();
    setFeedback('success');
    setTimeout(() => {
      setFeedback(null);
      setGameState('success');
    }, 1200);
  };

  const handleError = () => {
    playPopSound();
    setFeedback('error');
    setTimeout(() => setFeedback(null), 1200);
  };

  const handleBack = () => {
    playPopSound();
    onBack();
  };

  const handleStartGame = () => {
    playPopSound();
    setGameState('identify');
  };

  const handleComplete = () => {
    playPopSound();
    onComplete(100);
  };

  const getTypeName = () => {
    if (card.type === 'vocal') return 'vocal';
    if (card.type === 'silaba') return 'sílaba';
    return 'letra';
  };

  const typeName = getTypeName();

  const renderHighlightedWord = (word: string, syllable: string, color: string) => {
    // Normalizamos para quitar acentos solo para la búsqueda del índice
    const normalize = (str: string) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    const normalizedWord = normalize(word);
    const normalizedSyllable = normalize(syllable);
    
    const wordSizeClass = word.length > 8 ? 'text-xl sm:text-3xl' : (word.length > 5 ? 'text-2xl sm:text-4xl' : 'text-3xl sm:text-5xl');

    const index = normalizedWord.indexOf(normalizedSyllable);

    if (index !== -1) {
      // Usamos los strings originales para mostrar los caracteres con acento
      const before = word.substring(0, index);
      const target = word.substring(index, index + syllable.length);
      const after = word.substring(index + syllable.length);
      return (
        <span className={`font-magic uppercase tracking-tight text-indigo-900 drop-shadow-sm whitespace-nowrap ${wordSizeClass}`}>
          {before}<span style={{ color: color }} className="text-[1.25em] inline-block font-black">{target}</span>{after}
        </span>
      );
    }
    return <span className={`font-magic uppercase tracking-tight text-indigo-900 whitespace-nowrap ${wordSizeClass}`}>{word}</span>;
  };

  const bubbleClass = "w-32 h-32 sm:w-44 md:w-56 sm:h-44 md:h-56 rounded-full bg-indigo-800/60 border-[6px] sm:border-[8px] border-white/40 shadow-2xl flex flex-col items-center justify-center transition-all transform hover:scale-105 active:scale-95 overflow-hidden p-3 sm:p-4";
  const letterCardClass = "w-28 h-40 sm:w-36 md:w-48 sm:h-52 md:h-64 rounded-[2rem] sm:rounded-[2.5rem] bg-white border-[6px] sm:border-[10px] border-indigo-200 flex items-center justify-center shadow-2xl transition-all transform hover:scale-105 active:scale-95 text-center overflow-hidden p-2 sm:p-3";

  return (
    <div className="fixed inset-0 bg-indigo-950 z-[100] flex flex-col p-3 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute left-[15%] top-[-10%] opacity-20 animate-bounce text-4xl sm:text-6xl">🫧</div>
          <div className="absolute left-[45%] top-[-20%] opacity-20 animate-pulse text-2xl sm:text-4xl">⭐</div>
          <div className="absolute left-[75%] top-[-5%] opacity-20 animate-bounce text-5xl sm:text-7xl">🫧</div>
      </div>

      <header className="relative z-10 flex justify-between items-center mb-4 sm:mb-6 shrink-0">
        <button onClick={handleBack} className="bg-white/10 p-3 sm:p-4 rounded-[1.5rem] sm:rounded-[2rem] border-2 sm:border-4 border-white/20 text-2xl sm:text-3xl hover:bg-white/30 transition-all active:scale-90 shadow-lg">🏠</button>
        <div className="bg-white/10 px-4 sm:px-12 py-2 sm:py-3 rounded-full border-2 sm:border-4 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.4)] backdrop-blur-md">
            <h2 className="text-sm sm:text-xl md:text-3xl font-magic text-white uppercase tracking-tighter">Aprendiendo: {card.value}</h2>
        </div>
        <div className="w-10 sm:w-16"></div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto w-full pb-8 sm:pb-10">
        
        {gameState === 'intro' && (
          <div className="flex flex-col items-center space-y-4 sm:space-y-6 text-center w-full">
            <div className="bg-white/10 backdrop-blur-2xl p-6 sm:p-12 rounded-[3rem] sm:rounded-[4rem] border-2 sm:border-4 border-white/30 w-full max-w-lg space-y-6 sm:space-y-8 shadow-2xl">
                <div className="flex flex-col items-center justify-center bg-indigo-900/40 py-6 sm:py-8 rounded-[2rem] sm:rounded-[3rem] border-2 border-white/10 shadow-inner overflow-hidden">
                    <h3 className={`font-magic drop-shadow-[0_8px_0_rgba(0,0,0,0.15)] mb-4 sm:mb-6 leading-none tracking-tighter ${card.value.length > 2 ? 'text-[60px] sm:text-[110px]' : 'text-[80px] sm:text-[160px]'}`} style={{ color: '#000000' }}>
                        {card.value}
                    </h3>
                    <div className="bg-white p-4 sm:p-8 rounded-[2rem] sm:rounded-full border-2 sm:border-4 border-indigo-100 shadow-xl flex flex-col items-center w-[90%] mx-auto min-h-[140px] sm:min-h-[180px] justify-center">
                        <span className="text-6xl sm:text-9xl mb-2 sm:text-9xl leading-none">{card.icon}</span>
                        <div className="w-full overflow-hidden">
                            {renderHighlightedWord(card.pictogramWord, card.value, '#000000')}
                        </div>
                    </div>
                </div>

                <div className="space-y-4 sm:space-y-6">
                    <p className="text-xl sm:text-4xl font-bold text-cyan-300 uppercase tracking-widest leading-tight">{card.description}</p>
                    <div className="flex flex-col gap-3 sm:gap-4">
                        <VoiceButton text={card.audioInstruction} className="py-3 sm:py-4 bg-indigo-500 rounded-full border-b-[6px] sm:border-b-[8px] border-indigo-800" />
                        <button 
                            onClick={handleStartGame}
                            className="bg-pink-500 text-white py-4 sm:py-6 rounded-[2rem] sm:rounded-[2.5rem] text-2xl sm:text-3xl font-magic shadow-2xl hover:bg-pink-600 border-b-[6px] sm:border-b-[8px] border-pink-800 transition-all active:translate-y-1 uppercase tracking-widest"
                        >
                            JUGAR
                        </button>
                    </div>
                </div>
            </div>
          </div>
        )}

        {gameState === 'identify' && (
          <div className="w-full flex flex-col items-center justify-center space-y-6 sm:space-y-8 py-6 sm:py-10">
            <div className="bg-indigo-900/60 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border-2 sm:border-4 border-white/20 shadow-2xl">
                 <h3 className="text-xl sm:text-4xl font-magic text-white leading-tight uppercase text-center">
                   {card.type === 'silaba' 
                     ? `Toca el dibujo que inicia con la sílaba ${card.value}` 
                     : `Toca el dibujo que empieza con la letra ${card.value}`}
                 </h3>
            </div>
            
            <div className="flex-1 w-full flex flex-wrap items-center justify-center gap-4 sm:gap-10 px-2 sm:px-4">
                {emojiChoices.map((emoji, idx) => (
                  <button 
                    key={idx} 
                    onClick={emoji === card.icon ? handleCorrectIdentify : handleError} 
                    className={bubbleClass}
                  >
                    <span className="text-5xl sm:text-9xl leading-none">{emoji}</span>
                  </button>
                ))}
            </div>
          </div>
        )}

        {gameState === 'findLetter' && (
          <div className="w-full flex flex-col items-center justify-center space-y-6 sm:space-y-8 py-6 sm:py-10">
            <div className="bg-gradient-to-r from-cyan-400 to-blue-600 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border-2 sm:border-4 border-white shadow-[0_10px_40px_rgba(0,0,0,0.3)]">
                 <h3 className="text-2xl sm:text-5xl font-magic text-white leading-tight uppercase text-center drop-shadow-lg">
                   ¿Qué {typeName} aprendimos?
                 </h3>
            </div>
            
            <div className="flex-1 w-full flex flex-wrap items-center justify-center gap-4 sm:gap-10 px-2 sm:px-4">
                {letterChoices.map((choice, idx) => (
                    <button
                        key={idx}
                        onClick={choice === card.value ? handleCorrectFindLetter : handleError}
                        className={letterCardClass}
                    >
                        <span className={`font-magic leading-none text-center block text-black tracking-tighter ${choice.length > 2 ? 'text-[50px] sm:text-[90px]' : 'text-[70px] sm:text-[130px]'}`}>
                            {choice}
                        </span>
                    </button>
                ))}
            </div>
          </div>
        )}

        {gameState === 'success' && (
          <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 p-8 sm:p-16 rounded-[3rem] sm:rounded-[5rem] border-[6px] sm:border-[10px] border-white shadow-[0_0_80px_rgba(251,191,36,0.6)] text-center space-y-6 sm:space-y-10 max-w-lg w-full">
             <div className="text-[100px] sm:text-[180px] drop-shadow-2xl">🌟</div>
             <div className="space-y-2">
                <h3 className="text-4xl sm:text-7xl font-magic text-white drop-shadow-lg tracking-tighter uppercase">EXCELENTE</h3>
                <p className="text-lg sm:text-2xl font-bold text-white uppercase tracking-[0.2em] opacity-90">¡Has completado esta letra!</p>
             </div>
             <button 
                onClick={handleComplete}
                className="bg-white text-orange-600 py-4 sm:py-6 px-10 sm:px-16 rounded-full text-2xl sm:text-3xl font-magic shadow-2xl hover:scale-110 active:scale-95 transition-all border-b-[6px] sm:border-b-[8px] border-orange-200 uppercase tracking-widest"
             >
                SIGUIENTE
             </button>
          </div>
        )}

        {feedback === 'success' && (
            <div className="fixed inset-0 flex items-center justify-center bg-green-500/30 z-[150] backdrop-blur-lg">
                <span className="text-[120px] sm:text-[200px] animate-bounce">✨</span>
            </div>
        )}
        
        {feedback === 'error' && (
            <div className="fixed inset-0 flex items-center justify-center bg-red-500/20 z-[150] backdrop-blur-md">
                <div className="bg-white p-10 rounded-[3rem] border-8 border-red-500 shadow-2xl">
                    <span className="text-3xl font-magic text-red-600 uppercase tracking-widest">Intenta de nuevo</span>
                </div>
            </div>
        )}
      </main>
    </div>
  );
};

export default GameBoard;
