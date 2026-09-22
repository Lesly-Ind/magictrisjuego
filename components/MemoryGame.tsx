
import React, { useState, useEffect } from 'react';

interface Card {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const symbols = ['🐶', '🍎', '⚽', '🚗', '🏠', '🌈'];

const MemoryGame: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);

  const initGame = () => {
    const deck = [...symbols, ...symbols]
      .sort(() => Math.random() - 0.5)
      .map((symbol, idx) => ({
        id: idx,
        symbol,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(deck);
    setFlipped([]);
    setMatches(0);
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleCardClick = (id: number) => {
    if (flipped.length === 2 || cards[id].isFlipped || cards[id].isMatched) return;

    const newCards = [...cards];
    newCards[id].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      if (cards[first].symbol === cards[second].symbol) {
        setTimeout(() => {
          const matchCards = [...cards];
          matchCards[first].isMatched = true;
          matchCards[second].isMatched = true;
          setCards(matchCards);
          setFlipped([]);
          setMatches(m => m + 1);
        }, 600);
      } else {
        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[first].isFlipped = false;
          resetCards[second].isFlipped = false;
          setCards(resetCards);
          setFlipped([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-3xl font-magic text-yellow-600 mb-6 uppercase tracking-wider">Juego de Memoria</h2>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl text-4xl flex items-center justify-center transition-all duration-300 transform border-b-4 active:scale-95 ${
              card.isFlipped || card.isMatched 
                ? 'bg-white border-yellow-200 rotate-y-180 shadow-inner' 
                : 'bg-yellow-400 border-yellow-600 shadow-lg'
            }`}
          >
            {card.isFlipped || card.isMatched ? card.symbol : '❓'}
          </button>
        ))}
      </div>

      {matches === symbols.length && (
        <div className="text-center animate-bounce">
          <h3 className="text-4xl text-green-500 font-bold mb-4 font-magic">¡Ganaste! 🎉</h3>
          <button 
            onClick={initGame}
            className="bg-green-500 text-white px-8 py-3 rounded-full shadow-lg font-bold text-xl btn-magic-pop"
          >
            Jugar otra vez
          </button>
        </div>
      )}
      
      <div className="mt-8 flex gap-8">
        <div className="text-center">
          <p className="text-blue-400 uppercase text-xs font-bold">Parejas</p>
          <p className="text-3xl font-bold text-blue-600">{matches}</p>
        </div>
        <button onClick={initGame} className="text-blue-400 hover:text-red-500 font-bold transition-colors">
          Reiniciar
        </button>
      </div>
    </div>
  );
};

export default MemoryGame;
