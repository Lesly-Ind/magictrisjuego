import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { User, WordItem, ContentProgress, ContentType } from '../types';
import { getAllWordItems, getDistractorImages, getDistractorWords } from '../services/wordData';
import {
  fetchAllProgress,
  recordAttempt,
  getChoiceCount,
  getRecommendedContent,
} from '../services/masteryService';
import VoiceButton from './VoiceButton';
import GumiGuide from './GumiGuide';
import { playPopSound, playSuccessSound } from './AudioUtils';

interface Props {
  user: User;
  onBack: () => void;
  onComplete: (scoreGain: number) => void;
}

type Step = 'select' | 'know' | 'relate' | 'recognize' | 'celebrate';

const CONTENT_TYPE: ContentType = 'word';

const WordLearning: React.FC<Props> = ({ user, onBack, onComplete }) => {
  const [step, setStep] = useState<Step>('select');
  const [progressMap, setProgressMap] = useState<Record<string, ContentProgress>>({});
  const [currentWord, setCurrentWord] = useState<WordItem | null>(null);
  const [wrongPick, setWrongPick] = useState<string | null>(null);
  const [hintActive, setHintActive] = useState(false);
  const [loading, setLoading] = useState(true);

  const allWords = useMemo(() => getAllWordItems(user.nickname), [user.nickname]);
  const allWordIds = useMemo(() => allWords.map(w => w.id), [allWords]);

  const loadProgress = useCallback(async () => {
    setLoading(true);
    const map = await fetchAllProgress(user.id, CONTENT_TYPE);
    setProgressMap(map);
    setLoading(false);
  }, [user.id]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const handleBack = () => {
    playPopSound();
    if (step === 'select') {
      onBack();
    } else {
      setStep('select');
      setCurrentWord(null);
      setWrongPick(null);
      setHintActive(false);
    }
  };

  const handleSelectWord = (wordId: string) => {
    playPopSound();
    const word = allWords.find(w => w.id === wordId);
    if (!word) return;
    setCurrentWord(word);
    setStep('know');
    setWrongPick(null);
    setHintActive(false);
  };

  const handleStartRelate = () => {
    playPopSound();
    setStep('relate');
  };

  const handleStartRecognize = () => {
    playPopSound();
    setStep('recognize');
  };

  const handleWrongAnswer = (pickedId: string) => {
    setWrongPick(pickedId);
    setHintActive(true);
  };

  const relateChoices = useMemo(() => {
    if (!currentWord || step !== 'relate') return [];
    const choiceCount = getChoiceCount(progressMap[currentWord.id]?.mastery_level ?? 0);
    const distractorCount = choiceCount - 1;
    const distractors = getDistractorImages(currentWord.id, distractorCount, user.nickname);
    const choices = [
      { id: currentWord.id, imageUrl: currentWord.imageUrl, isCorrect: true },
      ...distractors.map((url, i) => ({ id: `distractor-${i}`, imageUrl: url, isCorrect: false })),
    ];
    return [...choices].sort(() => Math.random() - 0.5);
  }, [currentWord, step, progressMap, user.nickname]);

  const handleRelatePick = async (pickedId: string, isCorrect: boolean) => {
    if (isCorrect) {
      playSuccessSound();
      if (currentWord) {
        await recordAttempt(user.id, currentWord.id, CONTENT_TYPE, true);
        await loadProgress();
      }
      setStep('recognize');
      setWrongPick(null);
      setHintActive(false);
    } else {
      handleWrongAnswer(pickedId);
    }
  };

  const recognizeChoices = useMemo(() => {
    if (!currentWord || step !== 'recognize') return [];
    const choiceCount = getChoiceCount(progressMap[currentWord.id]?.mastery_level ?? 0);
    const distractorCount = choiceCount - 1;
    const distractors = getDistractorWords(currentWord.id, currentWord.word, distractorCount, user.nickname);
    const choices = [
      { id: currentWord.id, word: currentWord.word, isCorrect: true },
      ...distractors.map((w, i) => ({ id: `dword-${i}`, word: w, isCorrect: false })),
    ];
    return [...choices].sort(() => Math.random() - 0.5);
  }, [currentWord, step, progressMap, user.nickname]);

  const handleRecognizePick = async (pickedId: string, isCorrect: boolean) => {
    if (isCorrect) {
      playSuccessSound();
      if (currentWord) {
        await recordAttempt(user.id, currentWord.id, CONTENT_TYPE, true);
        await loadProgress();
      }
      setStep('celebrate');
      setWrongPick(null);
      setHintActive(false);
    } else {
      handleWrongAnswer(pickedId);
    }
  };

  const handleCelebrateContinue = () => {
    playPopSound();
    onComplete(50);
    setStep('select');
    setCurrentWord(null);
    setWrongPick(null);
    setHintActive(false);
  };

  const getMasteryInfo = (wordId: string) => {
    const p = progressMap[wordId];
    if (!p || p.mastery_level === 0) return { label: 'Nueva', color: 'bg-cyan-100 text-cyan-700', icon: '🌱' };
    if (p.mastery_level === 1) return { label: 'Empezando', color: 'bg-yellow-100 text-yellow-700', icon: '⭐' };
    if (p.mastery_level === 2) return { label: 'Practicando', color: 'bg-orange-100 text-orange-700', icon: '🔥' };
    return { label: 'Dominada', color: 'bg-green-100 text-green-700', icon: '✅' };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-6xl animate-bounce mb-4">✨</div>
        <p className="font-magic text-cyan-600 text-xl uppercase">Cargando palabras...</p>
      </div>
    );
  }

  // ---- Step: Select word ----
  if (step === 'select') {
    return (
      <div className="min-h-screen flex flex-col pt-20 pb-10 px-4 max-w-4xl mx-auto w-full">
        <button
          onClick={handleBack}
          className="self-start mb-6 bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-lg border-2 border-blue-200 text-xl active:scale-90 transition-transform"
        >
          🏠
        </button>

        <div className="text-center mb-8">
          <GumiGuide
            message="¡Vamos a aprender tus primeras palabras! Toca una para empezar."
            size="medium"
          />
        </div>

        <h2 className="text-3xl sm:text-5xl font-magic text-white drop-shadow-lg text-center mb-8 uppercase tracking-tighter">
          Mis Primeras Palabras
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {allWords.map((word) => {
            const mastery = getMasteryInfo(word.id);
            return (
              <button
                key={word.id}
                onClick={() => handleSelectWord(word.id)}
                className="group bg-white/90 backdrop-blur-md rounded-[2rem] shadow-xl border-4 border-white overflow-hidden transition-all hover:scale-[1.03] active:scale-95 flex flex-col"
              >
                <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100">
                  <img
                    src={word.imageUrl}
                    alt={word.word}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-bold shadow-md ${mastery.color}`}>
                    {mastery.icon} {mastery.label}
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <span className="text-2xl sm:text-3xl font-magic text-indigo-800 uppercase tracking-tight">
                    {word.word}
                  </span>
                  <span className="text-2xl">👆</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ---- Step: Know ----
  if (step === 'know' && currentWord) {
    return (
      <div className="fixed inset-0 bg-indigo-950 z-[100] flex flex-col p-4 sm:p-6 overflow-y-auto">
        <header className="relative z-10 flex justify-between items-center mb-4 shrink-0">
          <button onClick={handleBack} className="bg-white/10 p-3 rounded-2xl border-2 border-white/20 text-2xl hover:bg-white/30 transition-all active:scale-90 shadow-lg">🏠</button>
          <div className="bg-white/10 px-6 py-2 rounded-full border-2 border-cyan-400 backdrop-blur-md">
            <h2 className="text-sm sm:text-lg font-magic text-white uppercase tracking-tighter">Conocer la palabra</h2>
          </div>
          <div className="w-12"></div>
        </header>

        <main className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
          <div className="bg-white/10 backdrop-blur-2xl p-6 sm:p-10 rounded-[3rem] border-2 border-white/30 w-full space-y-6 shadow-2xl">
            <div className="bg-white rounded-[2rem] overflow-hidden shadow-xl border-4 border-white">
              <img src={currentWord.imageUrl} alt={currentWord.word} className="w-full aspect-square object-cover" />
            </div>

            <h3 className="text-5xl sm:text-7xl font-magic text-white text-center uppercase tracking-tighter drop-shadow-lg">
              {currentWord.word}
            </h3>

            <div className="flex flex-col items-center gap-4">
              <VoiceButton
                text={currentWord.audioInstruction}
                className="!px-12 !py-6 !text-2xl bg-cyan-500 rounded-full border-b-[6px] border-cyan-800"
              />
              <span className="text-sm font-bold text-cyan-300 uppercase tracking-widest">Toca para escuchar</span>
            </div>

            <div className="flex justify-center">
              <GumiGuide message="¡Mira y escucha! Esta es tu palabra." size="small" />
            </div>

            <button
              onClick={handleStartRelate}
              className="w-full bg-pink-500 text-white py-5 rounded-[2rem] text-2xl font-magic shadow-2xl hover:bg-pink-600 border-b-[6px] border-pink-800 transition-all active:translate-y-1 uppercase tracking-widest"
            >
              SIGUIENTE
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ---- Step: Relate (pick the image) ----
  if (step === 'relate' && currentWord) {
    return (
      <div className="fixed inset-0 bg-indigo-950 z-[100] flex flex-col p-4 sm:p-6 overflow-y-auto">
        <header className="relative z-10 flex justify-between items-center mb-4 shrink-0">
          <button onClick={handleBack} className="bg-white/10 p-3 rounded-2xl border-2 border-white/20 text-2xl hover:bg-white/30 transition-all active:scale-90 shadow-lg">🏠</button>
          <div className="bg-white/10 px-6 py-2 rounded-full border-2 border-cyan-400 backdrop-blur-md">
            <h2 className="text-sm sm:text-lg font-magic text-white uppercase tracking-tighter">Elegir la imagen</h2>
          </div>
          <div className="w-12"></div>
        </header>

        <main className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto w-full">
          <div className="bg-indigo-900/60 backdrop-blur-xl p-5 sm:p-6 rounded-[2rem] border-2 border-white/20 mb-6 text-center">
            <h3 className="text-2xl sm:text-4xl font-magic text-white uppercase leading-tight">
              ¿Cuál es <span className="text-cyan-300">{currentWord.word}</span>?
            </h3>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 w-full">
            {relateChoices.map((choice) => {
              const isWrong = wrongPick === choice.id;
              const showHint = hintActive && choice.isCorrect;
              return (
                <button
                  key={choice.id}
                  onClick={() => handleRelatePick(choice.id, choice.isCorrect)}
                  className={`relative bg-white rounded-[2rem] overflow-hidden shadow-2xl border-4 transition-all active:scale-95 ${
                    isWrong
                      ? 'border-gray-300 opacity-40 scale-95'
                      : showHint
                      ? 'border-yellow-400 ring-4 ring-yellow-300 animate-pulse scale-105'
                      : 'border-white hover:scale-105'
                  }`}
                  style={{ width: '45%', maxWidth: '280px' }}
                >
                  <div className="w-full aspect-square overflow-hidden bg-gray-100">
                    <img src={choice.imageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                  {showHint && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-yellow-400 px-4 py-1 rounded-full text-xs font-bold text-yellow-900 shadow-lg whitespace-nowrap">
                      👆 ¡Aquí!
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {wrongPick && (
            <div className="mt-6">
              <GumiGuide message="¡Vamos a intentarlo juntos! Toca la correcta." size="small" />
            </div>
          )}

          {!wrongPick && (
            <div className="mt-6">
              <VoiceButton
                text={currentWord.audioInstruction}
                className="!px-8 !py-4 !text-xl bg-cyan-500 rounded-full border-b-[4px] border-cyan-800"
              />
            </div>
          )}
        </main>
      </div>
    );
  }

  // ---- Step: Recognize (pick the word) ----
  if (step === 'recognize' && currentWord) {
    return (
      <div className="fixed inset-0 bg-indigo-950 z-[100] flex flex-col p-4 sm:p-6 overflow-y-auto">
        <header className="relative z-10 flex justify-between items-center mb-4 shrink-0">
          <button onClick={handleBack} className="bg-white/10 p-3 rounded-2xl border-2 border-white/20 text-2xl hover:bg-white/30 transition-all active:scale-90 shadow-lg">🏠</button>
          <div className="bg-white/10 px-6 py-2 rounded-full border-2 border-cyan-400 backdrop-blur-md">
            <h2 className="text-sm sm:text-lg font-magic text-white uppercase tracking-tighter">Elegir la palabra</h2>
          </div>
          <div className="w-12"></div>
        </header>

        <main className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto w-full">
          <div className="bg-indigo-900/60 backdrop-blur-xl p-5 sm:p-6 rounded-[2rem] border-2 border-white/20 mb-6 text-center">
            <h3 className="text-xl sm:text-3xl font-magic text-white uppercase leading-tight">
              Escucha y toca la palabra
            </h3>
          </div>

          <div className="mb-8">
            <VoiceButton
              text={currentWord.audioInstruction}
              className="!px-12 !py-6 !text-3xl bg-cyan-500 rounded-full border-b-[6px] border-cyan-800"
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 w-full">
            {recognizeChoices.map((choice) => {
              const isWrong = wrongPick === choice.id;
              const showHint = hintActive && choice.isCorrect;
              return (
                <button
                  key={choice.id}
                  onClick={() => handleRecognizePick(choice.id, choice.isCorrect)}
                  className={`relative bg-white rounded-[2rem] shadow-2xl border-4 transition-all active:scale-95 flex items-center justify-center p-6 sm:p-8 ${
                    isWrong
                      ? 'border-gray-300 opacity-40 scale-95'
                      : showHint
                      ? 'border-yellow-400 ring-4 ring-yellow-300 animate-pulse scale-105'
                      : 'border-white hover:scale-105'
                  }`}
                  style={{ width: '45%', maxWidth: '260px', minHeight: '120px' }}
                >
                  <span className="text-3xl sm:text-5xl font-magic text-indigo-800 uppercase tracking-tight text-center leading-tight">
                    {choice.word}
                  </span>
                  {showHint && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-yellow-400 px-4 py-1 rounded-full text-xs font-bold text-yellow-900 shadow-lg whitespace-nowrap">
                      👆 ¡Aquí!
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {wrongPick && (
            <div className="mt-6">
              <GumiGuide message="¡Casi! Escucha otra vez y toca la correcta." size="small" />
            </div>
          )}
        </main>
      </div>
    );
  }

  // ---- Step: Celebrate ----
  if (step === 'celebrate' && currentWord) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 z-[100] flex flex-col items-center justify-center p-6 overflow-y-auto">
        <div className="bg-white/90 backdrop-blur-xl p-8 sm:p-12 rounded-[3rem] border-[8px] border-white shadow-2xl max-w-lg w-full text-center space-y-6">
          <div className="text-[100px] sm:text-[140px] drop-shadow-2xl animate-bounce">🌟</div>

          <h3 className="text-4xl sm:text-6xl font-magic text-orange-600 drop-shadow-lg tracking-tighter uppercase">
            ¡Muy Bien!
          </h3>

          <div className="bg-indigo-50 rounded-[2rem] p-4 border-2 border-indigo-100">
            <p className="text-lg sm:text-xl font-bold text-indigo-700 uppercase tracking-wide">
              Aprendiste
            </p>
            <p className="text-4xl sm:text-6xl font-magic text-indigo-800 uppercase tracking-tight mt-2">
              {currentWord.word}
            </p>
          </div>

          <GumiGuide message={currentWord.celebrationPhrase} size="medium" />

          <button
            onClick={handleCelebrateContinue}
            className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] text-2xl font-magic shadow-2xl hover:bg-indigo-700 border-b-[6px] border-indigo-800 transition-all active:translate-y-1 uppercase tracking-widest"
          >
            CONTINUAR
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default WordLearning;
