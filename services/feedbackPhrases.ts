const PRAISE_PHRASES = [
  '¡Muy bien!',
  '¡Excelente!',
  '¡Lo lograste!',
  '¡Genial!',
  '¡Fantástico!',
  '¡Sigue así!',
];

const GENTLE_GUIDE_PHRASES = [
  'Vamos a intentarlo juntos.',
  'Escucha otra vez.',
  'Probemos de nuevo.',
  '¡Tú puedes! Intenta otra vez.',
];

export function getRandomPraise(word?: string): string {
  const base = PRAISE_PHRASES[Math.floor(Math.random() * PRAISE_PHRASES.length)];
  if (word) {
    return `${base} La palabra es ${word}.`;
  }
  return base;
}

export function getRandomGentleGuide(): string {
  return GENTLE_GUIDE_PHRASES[Math.floor(Math.random() * GENTLE_GUIDE_PHRASES.length)];
}
