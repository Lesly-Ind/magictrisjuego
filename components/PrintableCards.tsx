
import React from 'react';
import { MAGIC_PATH } from '../services/mockData';

interface Props {
  onBack: () => void;
}

const PrintableCards: React.FC<Props> = ({ onBack }) => {
  const handlePrint = () => {
    window.print();
  };

  const renderHighlightedWord = (word: string, syllable: string, color: string) => {
    const normalize = (str: string) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    const normalizedWord = normalize(word);
    const normalizedSyllable = normalize(syllable);
    
    const baseColor = 'text-white';

    const index = normalizedWord.indexOf(normalizedSyllable);

    if (index !== -1) {
      const before = word.substring(0, index);
      const target = word.substring(index, index + syllable.length);
      const after = word.substring(index + syllable.length);
      return (
        <span className={`font-magic uppercase tracking-tight leading-none ${baseColor} whitespace-nowrap`}>
          {before}<span style={{ color: color }} className="text-[1.25em] inline-block font-black">{target}</span>{after}
        </span>
      );
    }
    return <span className={`font-magic uppercase tracking-tight leading-none ${baseColor} whitespace-nowrap`}>{word}</span>;
  };

  return (
    <div className="min-h-screen bg-white md:bg-gray-100 p-4 sm:p-8 animate-fade-in pb-20">
      <div className="print:hidden flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <button 
          onClick={onBack}
          className="bg-indigo-600 text-white px-8 py-3 rounded-full font-magic text-xl shadow-lg active:scale-95 transition-all flex items-center gap-3"
        >
          <span>🏠</span> Volver
        </button>

        <div className="text-center">
            <h1 className="text-4xl font-magic text-indigo-900 uppercase">Álbum de Recortes</h1>
            <p className="text-sm font-bold text-indigo-400 uppercase tracking-widest">¡Imprime y juega fuera de línea!</p>
        </div>

        <button 
          onClick={handlePrint}
          className="bg-green-500 text-white px-10 py-4 rounded-[2rem] font-magic text-2xl shadow-xl hover:bg-green-600 active:translate-y-1 transition-all flex items-center justify-center min-w-[180px]"
        >
          IMPRIMIR
        </button>
      </div>

      <div className="print:hidden max-w-4xl mx-auto mb-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-[2.5rem] border-4 border-yellow-400 shadow-xl flex items-center gap-6">
              <span className="text-5xl"></span>
              <p className="text-indigo-900 font-bold leading-tight">
                 Recorta las tarjetas y pégalas en cartulina. ¡Ahora cada sílaba se ve mejor que nunca!
              </p>
          </div>
          <div className="bg-blue-600 text-white p-6 rounded-[2.5rem] border-4 border-white shadow-xl flex flex-col justify-center">
              <h3 className="font-magic text-xl mb-2">¿Cómo imprimir?</h3>
              <p className="text-sm font-bold opacity-90">1. Toca el botón verde "IMPRIMIR".</p>
              <p className="text-sm font-bold opacity-90">2. En las opciones de tu impresora, activa <b>"Gráficos de fondo"</b>.</p>
              <p className="text-sm font-bold opacity-90">3. El álbum se imprimirá a todo color.</p>
          </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 print:gap-4 print:grid-cols-3">
        {MAGIC_PATH.map((card) => (
          <div 
            key={card.id}
            className={`${card.color} border-4 border-white/40 rounded-[2.5rem] p-5 flex flex-col items-center justify-between aspect-[3/4] shadow-2xl print:shadow-none print:border-white print:rounded-[2rem] overflow-hidden`}
            style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' } as any}
          >
            <div className="w-full flex justify-between items-start">
                <span className="text-[10px] font-magic text-white/80 uppercase tracking-widest">
                    {card.type === 'vocal' ? 'Vocal' : card.type === 'silaba' ? 'Sílaba' : 'Letra'}
                </span>
                <span className={`font-magic text-white drop-shadow-md leading-none ${card.value.length > 2 ? 'text-2xl' : 'text-4xl'}`}>
                    {card.value}
                </span>
            </div>
            
            <div className="bg-white/20 backdrop-blur-md rounded-[2rem] w-full py-4 flex flex-col items-center border border-white/20 overflow-hidden">
                <div className="text-7xl leading-none mb-2 drop-shadow-xl">{card.icon}</div>
                <div className={`text-center px-2 w-full overflow-hidden ${card.pictogramWord.length > 8 ? 'text-lg' : 'text-xl'}`}>
                    {renderHighlightedWord(card.pictogramWord, card.value, card.highlightColor)}
                </div>
            </div>

            <div className="w-full h-1 bg-white/30 mt-4 rounded-full"></div>
            
            <div className="text-[8px] text-white/60 mt-1 uppercase font-magic text-center">
                MagicTris - El Mundo de Gumi
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @media print {
          body {
            background: white !important;
            padding: 0 !important;
          }
          .animate-fade-in {
            animation: none !important;
          }
          @page {
            margin: 1cm;
            size: auto;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
        .animate-fade-in { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default PrintableCards;
