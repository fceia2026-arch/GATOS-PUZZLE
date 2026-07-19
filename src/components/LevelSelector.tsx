import React from 'react';
import { Level } from '../types';
import { Sparkles, Trophy, CheckCircle, ArrowRight, X } from 'lucide-react';

interface LevelSelectorProps {
  levels: Level[];
  currentLevelIndex: number;
  completedLevels: number[]; // Array of completed level IDs
  onSelectLevel: (index: number) => void;
  onClose: () => void;
}

export const LevelSelector: React.FC<LevelSelectorProps> = ({
  levels,
  currentLevelIndex,
  completedLevels,
  onSelectLevel,
  onClose,
}) => {
  const getDifficultyColor = (diff: Level['difficulty']) => {
    switch (diff) {
      case 'Principiante':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Intermedio':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Avanzado':
        return 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-[#2d241e]/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div 
        className="bg-art-bg rounded-[32px] border-4 border-art-accent max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        id="level-selector-modal"
      >
        {/* Header */}
        <div className="p-6 bg-art-accent text-white flex items-center justify-between border-b-2 border-art-border">
          <div className="flex items-center gap-2.5">
            <Trophy className="text-amber-200 w-6 h-6 animate-pulse" />
            <h2 className="text-xl md:text-2xl font-serif italic font-bold tracking-tight">Elige un Desafío</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-art-accent/80 rounded-full transition-colors cursor-pointer text-white/80 hover:text-white"
            id="close-level-selector-btn"
          >
            <X size={20} />
          </button>
        </div>

        {/* Level List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-art-light">
          {levels.map((level, idx) => {
            const isCurrent = idx === currentLevelIndex;
            const isCompleted = completedLevels.includes(level.id);

            return (
              <div
                key={level.id}
                onClick={() => {
                  onSelectLevel(idx);
                  onClose();
                }}
                className={`group relative p-5 rounded-3xl border-2 transition-all duration-200 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isCurrent
                    ? 'bg-white border-art-accent shadow-md ring-2 ring-art-accent/20'
                    : 'bg-white border-art-border hover:border-art-accent hover:shadow-lg hover:-translate-y-0.5'
                }`}
              >
                {/* Left side details */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-art-accent/10 text-art-accent">
                      NIVEL {level.id}
                    </span>
                    <span className={`text-[10px] uppercase font-sans font-black tracking-wider px-2 py-0.5 rounded-full border ${getDifficultyColor(level.difficulty)}`}>
                      {level.difficulty}
                    </span>
                    {isCompleted && (
                      <span className="flex items-center gap-1 text-emerald-600 font-bold text-xs font-sans uppercase tracking-wider">
                        <CheckCircle size={14} className="fill-emerald-100" /> Completado
                      </span>
                    )}
                  </div>

                  <h3 className="text-base md:text-lg font-serif font-black italic text-art-heading flex items-center gap-1.5 group-hover:text-art-accent transition-colors">
                    {level.name}
                    {isCurrent && <Sparkles size={16} className="text-art-accent animate-spin" style={{ animationDuration: '4s' }} />}
                  </h3>

                  <p className="text-xs text-art-text opacity-90 leading-relaxed max-w-md font-sans">
                    {level.description}
                  </p>

                  <div className="flex gap-4 text-[10px] uppercase tracking-wider text-art-text/50 font-sans font-bold">
                    <span>Caja: {level.boxCols}x{level.boxRows}</span>
                    <span>•</span>
                    <span>Gatitos: {level.cats.length}</span>
                    {level.obstacles.length > 0 && (
                      <>
                        <span>•</span>
                        <span>Obstáculos: {level.obstacles.length}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Action button on right */}
                <div className="flex items-center justify-end">
                  <span className={`flex items-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-widest font-sans transition-all duration-200 ${
                    isCurrent
                      ? 'bg-art-accent text-white shadow'
                      : 'bg-[#fff9f0] text-[#ba9470] border border-art-border group-hover:bg-art-accent group-hover:text-white'
                  }`}>
                    {isCurrent ? 'Jugando Ahora' : 'Comenzar'}
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-art-border text-center text-[10px] uppercase tracking-widest text-art-accent font-sans font-black">
          ¡Acomoda a todos los gatitos para que estén cómodos y ronroneen!
        </div>
      </div>
    </div>
  );
};
