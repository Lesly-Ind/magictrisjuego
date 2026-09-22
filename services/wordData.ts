import { WordItem } from '../types';

const MAMA_IMG = 'https://images.pexels.com/photos/21268301/pexels-photo-21268301.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
const PAPA_IMG = 'https://images.pexels.com/photos/19284179/pexels-photo-19284179.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
const AGUA_IMG = 'https://images.pexels.com/photos/9000378/pexels-photo-9000378.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
const CASA_IMG = 'https://images.pexels.com/photos/13645517/pexels-photo-13645517.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
const NINO_IMG = 'https://images.pexels.com/photos/29790577/pexels-photo-29790577.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

export const FIRST_WORDS: WordItem[] = [
  {
    id: 'word-mama',
    word: 'Mamá',
    imageUrl: MAMA_IMG,
    audioInstruction: 'Esta es mamá. Mamá.',
    celebrationPhrase: '¡Muy bien! Aprendiste MAMÁ.',
  },
  {
    id: 'word-papa',
    word: 'Papá',
    imageUrl: PAPA_IMG,
    audioInstruction: 'Este es papá. Papá.',
    celebrationPhrase: '¡Muy bien! Aprendiste PAPÁ.',
  },
  {
    id: 'word-mi-nombre',
    word: '',
    imageUrl: NINO_IMG,
    audioInstruction: '',
    celebrationPhrase: '',
    isDynamic: true,
  },
  {
    id: 'word-agua',
    word: 'Agua',
    imageUrl: AGUA_IMG,
    audioInstruction: 'Esto es agua. Agua.',
    celebrationPhrase: '¡Muy bien! Aprendiste AGUA.',
  },
  {
    id: 'word-casa',
    word: 'Casa',
    imageUrl: CASA_IMG,
    audioInstruction: 'Esta es una casa. Casa.',
    celebrationPhrase: '¡Muy bien! Aprendiste CASA.',
  },
];

export function resolveWordItem(item: WordItem, nickname: string): WordItem {
  if (!item.isDynamic) return item;
  const name = (nickname || 'Amigo').trim();
  const upper = name.toUpperCase();
  return {
    ...item,
    word: upper,
    audioInstruction: `Este es tu nombre. ${name}.`,
    celebrationPhrase: `¡Muy bien! Aprendiste ${upper}.`,
  };
}

export function getAllWordItems(nickname: string): WordItem[] {
  return FIRST_WORDS.map(w => resolveWordItem(w, nickname));
}

export function getWordById(id: string, nickname: string): WordItem | undefined {
  const item = FIRST_WORDS.find(w => w.id === id);
  if (!item) return undefined;
  return resolveWordItem(item, nickname);
}

export function getDistractorImages(correctId: string, count: number, nickname: string): string[] {
  const all = getAllWordItems(nickname).filter(w => w.id !== correctId);
  const shuffled = [...all].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(w => w.imageUrl);
}

export function getDistractorWords(correctId: string, correctWord: string, count: number, nickname: string): string[] {
  const all = getAllWordItems(nickname).filter(w => w.id !== correctId && w.word !== correctWord);
  const shuffled = [...all].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(w => w.word);
}
