import React from 'react';

export type AgendaStep = 'greeting' | 'learn' | 'play' | 'reward' | 'rest';

interface Props {
  currentStep: AgendaStep;
}

const STEPS: { id: AgendaStep; icon: string; label: string }[] = [
  { id: 'greeting', icon: '👋', label: 'Saludo' },
  { id: 'learn', icon: '📚', label: 'Aprender' },
  { id: 'play', icon: '🎮', label: 'Jugar' },
  { id: 'reward', icon: '⭐', label: 'Premio' },
  { id: 'rest', icon: '🌙', label: 'Descanso' },
];

const VisualAgenda: React.FC<Props> = ({ currentStep }) => {
  const currentIndex = STEPS.findIndex(s => s.id === currentStep);

  return (
    <nav aria-label="Agenda de la sesión" className="w-full max-w-2xl mx-auto px-2">
      <div className="flex items-center justify-between gap-1 sm:gap-2">
        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isActive = idx === currentIndex;
          const isPending = idx > currentIndex;

          return (
            <React.Fragment key={step.id}>
              {idx > 0 && (
                <div
                  className={`flex-1 h-1 rounded-full transition-all ${
                    isCompleted || isActive ? 'bg-cyan-400' : 'bg-white/20'
                  }`}
                  aria-hidden="true"
                />
              )}
              <div
                className={`flex flex-col items-center gap-1 transition-all shrink-0 ${
                  isActive ? 'scale-110' : isPending ? 'opacity-40' : ''
                }`}
              >
                <div
                  className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border-3 transition-all ${
                    isActive
                      ? 'bg-yellow-400 border-yellow-500 shadow-lg ring-4 ring-yellow-200'
                      : isCompleted
                      ? 'bg-cyan-400 border-cyan-500'
                      : 'bg-white/20 border-white/30'
                  }`}
                  style={{ borderWidth: '3px' }}
                  aria-current={isActive ? 'step' : undefined}
                  aria-label={`${step.label} ${isActive ? '(actual)' : isCompleted ? '(completado)' : '(pendiente)'}`}
                  role="img"
                >
                  <span className="text-lg sm:text-2xl" aria-hidden="true">
                    {isPending ? '🔒' : step.icon}
                  </span>
                </div>
                <span
                  className={`text-[7px] sm:text-[10px] font-magic uppercase tracking-tight ${
                    isActive ? 'text-yellow-300 font-bold' : 'text-white/70'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
};

export default VisualAgenda;
