
import { MagicCard } from '../types';

const LEVEL_GROUPS = [
  { name: 'NIVEL 1 – VOCALES', items: ['A', 'E', 'I', 'O', 'U'] },
  { name: 'NIVEL 2 – LETRA B', items: ['B', 'BA', 'BE', 'BI', 'BO', 'BU'] },
  { name: 'NIVEL 3 – LETRA C', items: ['C', 'CA', 'CE', 'CI', 'CO', 'CU'] },
  { name: 'NIVEL 4 – LETRA D', items: ['D', 'DA', 'DE', 'DI', 'DO', 'DU'] },
  { name: 'NIVEL 5 – LETRA F', items: ['F', 'FA', 'FE', 'FI', 'FO', 'FU'] },
  { name: 'NIVEL 6 – LETRA G', items: ['G', 'GA', 'GE', 'GI', 'GO', 'GU'] },
  { name: 'NIVEL 7 – LETRA H', items: ['H', 'HA', 'HE', 'HI', 'HO', 'HU'] },
  { name: 'NIVEL 8 – LETRA J', items: ['J', 'JA', 'JE', 'JI', 'JO', 'JU'] },
  { name: 'NIVEL 9 – LETRA K', items: ['K', 'KA', 'KE', 'KI', 'KO', 'KU'] },
  { name: 'NIVEL 10 – LETRA L', items: ['L', 'LA', 'LE', 'LI', 'LO', 'LU'] },
  { name: 'NIVEL 11 – LETRA M', items: ['M', 'MA', 'ME', 'MI', 'MO', 'MU'] },
  { name: 'NIVEL 12 – LETRA N', items: ['N', 'NA', 'NE', 'NI', 'NO', 'NU'] },
  { name: 'NIVEL 13 – LETRA Ñ', items: ['Ñ', 'ÑA', 'ÑE', 'ÑI', 'ÑO', 'ÑU'] },
  { name: 'NIVEL 14 – LETRA P', items: ['P', 'PA', 'PE', 'PI', 'PO', 'PU'] },
  { name: 'NIVEL 15 – LETRA Q', items: ['Q', 'QUE', 'QUI'] },
  { name: 'NIVEL 16 – LETRA R', items: ['R', 'RA', 'RE', 'RI', 'RO', 'RU'] },
  { name: 'NIVEL 17 – LETRA S', items: ['S', 'SA', 'SE', 'SI', 'SO', 'SU'] },
  { name: 'NIVEL 18 – LETRA T', items: ['T', 'TA', 'TE', 'TI', 'TO', 'TU'] },
  { name: 'NIVEL 19 – LETRA V', items: ['V', 'VA', 'VE', 'VI', 'VO', 'VU'] },
  { name: 'NIVEL 20 – LETRA W', items: ['W', 'WA', 'WE', 'WI', 'WO', 'WU'] },
  { name: 'NIVEL 21 – LETRA X', items: ['X', 'XA', 'XE', 'XI', 'XO', 'XU'] },
  { name: 'NIVEL 22 – LETRA Y', items: ['Y', 'YA', 'YE', 'YI', 'YO', 'YU'] },
  { name: 'NIVEL 23 – LETRA Z', items: ['Z', 'ZA', 'ZE', 'ZI', 'ZO', 'ZU'] },
];

const BRIGHT_COLORS = [
    { bg: 'bg-red-500', hex: '#ef4444' },
    { bg: 'bg-orange-500', hex: '#f97316' },
    { bg: 'bg-amber-500', hex: '#f59e0b' },
    { bg: 'bg-yellow-500', hex: '#eab308' },
    { bg: 'bg-lime-500', hex: '#84cc16' },
    { bg: 'bg-green-500', hex: '#22c55e' },
    { bg: 'bg-emerald-500', hex: '#10b981' },
    { bg: 'bg-teal-500', hex: '#14b8a6' },
    { bg: 'bg-cyan-500', hex: '#06b6d4' },
    { bg: 'bg-sky-500', hex: '#0ea5e9' },
    { bg: 'bg-blue-500', hex: '#3b82f6' },
    { bg: 'bg-indigo-500', hex: '#6366f1' },
    { bg: 'bg-violet-500', hex: '#8b5cf6' },
    { bg: 'bg-purple-500', hex: '#a855f7' },
    { bg: 'bg-fuchsia-500', hex: '#d946ef' },
    { bg: 'bg-pink-500', hex: '#ec4899' },
    { bg: 'bg-rose-500', hex: '#f43f5e' },
];

const PICTOGRAM_DATA: Record<string, { icon: string, word: string }> = {
  'A': { icon: '🐝', word: 'Abeja' }, 'E': { icon: '🐘', word: 'Elefante' }, 'I': { icon: '🏝️', word: 'Isla' }, 'O': { icon: '🐻', word: 'Oso' }, 'U': { icon: '🍇', word: 'Uva' },
  'B': { icon: '⛵', word: 'Barco' }, 'BA': { icon: '🐳', word: 'Ballena' }, 'BE': { icon: '👶', word: 'Bebé' }, 'BI': { icon: '🚲', word: 'Bici' }, 'BO': { icon: 'BOOT', word: 'Bota' }, 'BU': { icon: '🦉', word: 'Búho' },
  'C': { icon: '🏠', word: 'Casa' }, 'CA': { icon: '🛌', word: 'Cama' }, 'CE': { icon: '🦓', word: 'Cebra' }, 'CI': { icon: '🦢', word: 'Cisne' }, 'CO': { icon: '🐰', word: 'Conejo' }, 'CU': { icon: '🥄', word: 'Cuchara' },
  'D': { icon: '🎲', word: 'Dado' }, 'DA': { icon: '💃', word: 'Dama' }, 'DE': { icon: '☝️', word: 'Dedo' }, 'DI': { icon: '🦖', word: 'Dino' }, 'DO': { icon: '🍩', word: 'Dona' }, 'DU': { icon: '🧚', word: 'Duende' },
  'F': { icon: '🍓', word: 'Fresa' }, 'FA': { icon: '🔦', word: 'Faro' }, 'FE': { icon: '😊', word: 'Feliz' }, 'FI': { icon: '🎫', word: 'Ficha' }, 'FO': { icon: '🦭', word: 'Foca' }, 'FU': { icon: '🔥', word: 'Fuego' },
  'G': { icon: '🐱', word: 'Gato' }, 'GA': { icon: '🍪', word: 'Galleta' }, 'GE': { icon: '🍮', word: 'Gelatina' }, 'GI': { icon: '🌻', word: 'Girasol' }, 'GO': { icon: '🍬', word: 'Goma' }, 'GU': { icon: '🐛', word: 'Gusano' },
  'H': { icon: '🦛', word: 'Hipo' }, 'HA': { icon: '🧚‍♀️', word: 'Hada' }, 'HE': { icon: '🍦', word: 'Helado' }, 'HI': { icon: '🧊', word: 'Hielo' }, 'HO': { icon: '🍂', word: 'Hoja' }, 'HU': { icon: '🥚', word: 'Huevo' },
  'J': { icon: '🦒', word: 'Jirafa' }, 'JA': { icon: '🧼', word: 'Jabón' }, 'JE': { icon: '💉', word: 'Jeringa' }, 'JI': { icon: '🏇', word: 'Jinete' }, 'JO': { icon: '💍', word: 'Joya' }, 'JU': { icon: '🧃', word: 'Jugo' },
  'K': { icon: '🐨', word: 'Koala' }, 'KA': { icon: '🛶', word: 'Kayak' }, 'KE': { icon: '🥫', word: 'Kétchup' }, 'KI': { icon: '🥝', word: 'Kiwi' }, 'KO': { icon: '🐨', word: 'Koala' }, 'KU': { icon: '🥋', word: 'Kung-fu' },
  'L': { icon: '🦁', word: 'León' }, 'LA': { icon: '✏️', word: 'Lápiz' }, 'LE': { icon: '🥛', word: 'Leche' }, 'LI': { icon: '🍋', word: 'Limón' }, 'LO': { icon: '🐺', word: 'Lobo' }, 'LU': { icon: '🌙', word: 'Luna' },
  'M': { icon: '🐒', word: 'Mono' }, 'MA': { icon: '✋', word: 'Mano' }, 'ME': { icon: '🪑', word: 'Mesa' }, 'MI': { icon: '🍯', word: 'Miel' }, 'MO': { icon: '🐒', word: 'Mono' }, 'MU': { icon: '🦷', word: 'Muela' },
  'N': { icon: '🍊', word: 'Naranja' }, 'NA': { icon: '👃', word: 'Nariz' }, 'NE': { icon: '🌨️', word: 'Nevar' }, 'NI': { icon: '🪹', word: 'Nido' }, 'NO': { icon: '🎵', word: 'Nota' }, 'NU': { icon: '☁️', word: 'Nube' },
  'Ñ': { icon: '🐦', word: 'Ñandú' }, 'ÑA': { icon: '🕷️', word: 'Araña' }, 'ÑE': { icon: '🪆', word: 'Muñeca' }, 'ÑI': { icon: '🤙', word: 'Meñique' }, 'ÑO': { icon: '🍝', word: 'Ñoquis' }, 'ÑU': { icon: '🐃', word: 'Ñu' },
  'P': { icon: '🦆', word: 'Pato' }, 'PA': { icon: '🐼', word: 'Panda' }, 'PE': { icon: '⚽', word: 'Pelota' }, 'PI': { icon: '🍍', word: 'Piña' }, 'PO': { icon: '🐥', word: 'Pollito' }, 'PU': { icon: '🚪', word: 'Puerta' },
  'Q': { icon: '🧀', word: 'Queso' }, 'QUE': { icon: '🧀', word: 'Queso' }, 'QUI': { icon: '📅', word: 'Quince' },
  'R': { icon: '🐭', word: 'Ratón' }, 'RA': { icon: '🌿', word: 'Rama' }, 'RE': { icon: '⌚', word: 'Reloj' }, 'RI': { icon: '🏞️', word: 'Río' }, 'RO': { icon: '🤖', word: 'Robot' }, 'RU': { icon: '🎡', word: 'Rueda' },
  'S': { icon: '☀️', word: 'Sol' }, 'SA': { icon: '🐸', word: 'Sapo' }, 'SE': { icon: '🌱', word: 'Semilla' }, 'SI': { icon: '🪑', word: 'Silla' }, 'SO': { icon: '🥣', word: 'Sopa' }, 'SU': { icon: '🆙', word: 'Subir' },
  'T': { icon: '🐢', word: 'Tortuga' }, 'TA': { icon: '🥁', word: 'Tambor' }, 'TE': { icon: '📺', word: 'Tele' }, 'TI': { icon: '✂️', word: 'Tijera' }, 'TO': { icon: '🍅', word: 'Tomate' }, 'TU': { icon: '🦜', word: 'Tucán' },
  'V': { icon: '🐄', word: 'Vaca' }, 'VA': { icon: '🥛', word: 'Vaso' }, 'VE': { icon: '👗', word: 'Vestido' }, 'VI': { icon: '🎻', word: 'Violín' }, 'VO': { icon: '🌋', word: 'Volcán' }, 'VU': { icon: '✈️', word: 'Vuelo' },
  'W': { icon: ' waffle ', word: 'Waffle' }, 'WA': { icon: '🤽', word: 'Waterpolo' }, 'WE': { icon: '🌐', word: 'Web' }, 'WI': { icon: '📶', word: 'Wi-fi' }, 'WO': { icon: '🍳', word: 'Wok' }, 'WU': { icon: '🥋', word: 'Wushu' },
  'X': { icon: '🎻', word: 'Xilófono' }, 'XA': { icon: '📝', word: 'Examen' }, 'XE': { icon: '🥊', word: 'Boxeo' }, 'XI': { icon: '🎻', word: 'Xilófono' }, 'XO': { icon: '🎷', word: 'Saxofón' }, 'XU': { icon: '💦', word: 'Exudar' },
  'Y': { icon: '🪀', word: 'Yoyo' }, 'YA': { icon: '🚤', word: 'Yate' }, 'YE': { icon: '🐎', word: 'Yegua' }, 'YI': { icon: '⚡', word: 'Rayito' }, 'YO': { icon: '🪀', word: 'Yoyo' }, 'YU': { icon: '🍠', word: 'Yuca' },
  'Z': { icon: '🥕', word: 'Zanahoria' }, 'ZA': { icon: '👟', word: 'Zapato' }, 'ZE': { icon: '🎈', word: 'Zepelín' }, 'ZI': { icon: '📉', word: 'Zigzag' }, 'ZO': { icon: '🦊', word: 'Zorro' }, 'ZU': { icon: '🍹', word: 'Zumo' },
};

const flattenPath = (): MagicCard[] => {
  const path: MagicCard[] = [];
  let colorCounter = 0;

  LEVEL_GROUPS.forEach((group, groupIdx) => {
    group.items.forEach((item) => {
      const pictInfo = PICTOGRAM_DATA[item] || { icon: '✨', word: 'Magia' };
      
      const colorSet = BRIGHT_COLORS[colorCounter % BRIGHT_COLORS.length];
      colorCounter++;

      const isVocal = groupIdx === 0;
      const isSilaba = item.length > 1;
      
      const description = `${item} de ${pictInfo.word.toLowerCase()}`;

      path.push({
        id: `card-${item}`,
        title: isSilaba ? `Sílaba ${item}` : `Letra ${item}`,
        value: item,
        type: isVocal ? 'vocal' : (isSilaba ? 'silaba' : 'consonante'),
        color: colorSet.bg,
        highlightColor: '#000000',
        icon: pictInfo.icon,
        pictogramName: pictInfo.word,
        pictogramWord: pictInfo.word,
        monster: '👾',
        description: description,
        audioInstruction: `Aprendamos la ${isSilaba ? 'sílaba' : 'letra'} ${item}. ${item} de ${pictInfo.word}`
      });
    });
  });
  return path;
};

export const MAGIC_PATH: MagicCard[] = flattenPath();
export const MAGIC_LEVELS = LEVEL_GROUPS;
