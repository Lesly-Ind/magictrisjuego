
export type Section = 'pre-login' | 'login' | 'register' | 'hub' | 'play' | 'profile' | 'info' | 'printable';

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
