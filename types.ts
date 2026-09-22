
export type Section = 'pre-login' | 'login' | 'register' | 'hub' | 'play' | 'profile' | 'info' | 'printable' | 'words';

export interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
  nickname: string;
  avatar: string;
  score: number;
  streak: number;
  lastLogin: string;
  progressIndex: number;
}

export interface MagicCard {
  id: string;
  title: string;
  value: string;
  type: 'vocal' | 'consonante' | 'silaba';
  color: string;
  highlightColor: string; // Color para resaltar la sílaba en la palabra
  icon: string;
  pictogramName: string; // Nombre amigable (ej: "Abeja")
  pictogramWord: string; // Palabra completa para mostrar (ej: "Abeja", "Ballena")
  monster: string;
  description: string;
  audioInstruction: string;
}

export interface GameState {
  card: MagicCard;
  step: 'intro' | 'identify' | 'findLetter' | 'success';
  score: number;
}

export interface Flashcard {
  id: number;
  word: string;
  image: string;
  category: string;
}

export interface Emotion {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description: string;
}

export interface ImageGenerationOptions {
  aspectRatio: '1:1' | '3:4' | '4:3' | '9:16' | '16:9' | '2:3' | '3:2' | '21:9';
  imageSize: '1K' | '2K' | '4K';
}

export interface VideoGenerationOptions {
  aspectRatio: '16:9' | '9:16';
  resolution: '720p' | '1080p';
}

// ====== New: First Words learning system ======

export interface WordItem {
  id: string;
  word: string;
  imageUrl: string;
  audioInstruction: string;
  celebrationPhrase: string;
  isDynamic?: boolean;
}

export type ContentType = 'word' | 'syllable' | 'letter';
export type MasteryLevel = 0 | 1 | 2 | 3;

export interface ContentProgress {
  content_id: string;
  content_type: ContentType;
  attempts: number;
  correct_attempts: number;
  incorrect_attempts: number;
  mastery_level: MasteryLevel;
  consecutive_correct: number;
  completed: boolean;
  last_seen_at: string | null;
  next_review_at: string;
}
