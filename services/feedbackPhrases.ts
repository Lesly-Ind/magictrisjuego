const PRAISE_PHRASES = [
  '¡Muy bien!',
  '¡Excelente!',
  '¡Lo lograste!',
  '¡Genial!',
  '¡Fantástico!',
  '¡Sigue así!',
  '¡Qué bueno!',
  '¡Increíble!',
];

const GENTLE_GUIDE_PHRASES = [
  'Vamos a intentarlo juntos.',
  'Escucha otra vez.',
  'Probemos una vez más.',
  '¡Tú puedes! Intenta otra vez.',
  'Yo te ayudo. Vamos otra vez.',
  'No pasa nada. Probemos de nuevo.',
  'Mira con atención. Tú puedes.',
  'Tranquilo. Lo intentamos otra vez.',
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
