import React from 'react';
import { Obstacle, Coords } from '../types';
import { Scissors, ShoppingBag, Award, Compass } from 'lucide-react';

interface GameGridProps {
  rows: number;
  cols: number;
  cellSize: number;
  obstacles: Obstacle[];
  // If a cat is currently being dragged and has a valid preview position, we pass it here
  previewPos: { r: number; c: number } | null;
  previewBlocks: Coords[] | null;
  previewIsValid: boolean;
  onGridRef: (el: HTMLDivElement | null) => void;
}

export const GameGrid: React.FC<GameGridProps> = ({
  rows,
  cols,
  cellSize,
  obstacles,
  previewPos,
  previewBlocks,
  previewIsValid,
  onGridRef,
}) => {
  // Check if a cell contains an obstacle
  const getObstacleAt = (r: number, c: number) => {
    return obstacles.find(obs => obs.r === r && obs.c === c);
  };

  // Check if a cell is part of the current active snap preview
  const isCellInPreview = (r: number, c: number) => {
    if (!previewPos || !previewBlocks) return false;
    return previewBlocks.some(b => {
      const targetR = previewPos.r + b.r;
      const targetC = previewPos.c + b.c;
      return targetR === r && targetC === c;
    });
  };

  const renderObstacleSVG = (type: Obstacle['type']) => {
    if (type === 'yarn') {
      return (
        <svg viewBox="0 0 40 40" className="w-10 h-10 animate-bounce" style={{ animationDuration: '3s' }}>
          {/* Yarn Ball */}
          <circle cx="20" cy="20" r="14" fill="#ef4444" stroke="#78350f" strokeWidth="2" />
          {/* Threads details */}
          <path d="M 12 10 Q 20 18 28 10 M 10 20 Q 20 20 30 20 M 12 30 Q 20 22 28 30 M 20 10 Q 15 20 20 30" fill="none" stroke="#fca5a5" strokeWidth="1.5" />
          {/* Wavy thread sticking out */}
          <path d="M 28 28 Q 34 32 32 38" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    }
    if (type === 'fishbone') {
      return (
        <svg viewBox="0 0 40 40" className="w-10 h-10 rotate-12">
          {/* Head */}
          <path d="M 32 15 L 32 25 L 26 20 Z" fill="#94a3b8" stroke="#334155" strokeWidth="2" strokeLinejoin="round" />
          {/* Spine */}
          <line x1="8" y1="20" x2="26" y2="20" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
          {/* Ribs */}
          <line x1="12" y1="12" x2="14" y2="28" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="17" y1="12" x2="19" y2="28" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="22" y1="12" x2="24" y2="28" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
          {/* Tail */}
          <path d="M 8 20 L 4 14 L 4 26 Z" fill="#94a3b8" stroke="#334155" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      );
    }
    if (type === 'toy-mouse') {
      return (
        <svg viewBox="0 0 40 40" className="w-10 h-10 -rotate-12">
          {/* Tail */}
          <path d="M 8 20 Q 2 24 4 34" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
          {/* Body */}
          <ellipse cx="22" cy="20" rx="10" ry="7" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
          {/* Ears */}
          <circle cx="16" cy="13" r="4.5" fill="#f87171" stroke="#475569" strokeWidth="1.5" />
          <circle cx="16" cy="13" r="2.5" fill="#fecdd3" />
          {/* Eye */}
          <circle cx="27" cy="18" r="1.2" fill="#1e293b" />
          {/* Nose */}
          <circle cx="32.5" cy="20" r="2" fill="#fda4af" />
        </svg>
      );
    }
    return null;
  };

  return (
    <div className="relative p-6 md:p-8 bg-art-beige rounded-3xl border-[12px] border-art-accent shadow-2xl overflow-visible max-w-full">
      {/* Visual cardboard folds and flaps for full carton box effect! */}
      {/* Top Flap */}
      <div
        className="absolute -top-12 left-8 right-8 h-12 bg-art-accent/80 rounded-t-xl border-t-2 border-x-2 border-art-accent origin-bottom transition-all duration-300 shadow-sm"
        style={{ transform: 'perspective(400px) rotateX(25deg)' }}
      />
      {/* Left Flap */}
      <div
        className="absolute top-8 bottom-8 -left-12 w-12 bg-art-accent/80 rounded-l-xl border-l-2 border-y-2 border-art-accent origin-right transition-all duration-300 shadow-sm"
        style={{ transform: 'perspective(400px) rotateY(-25deg)' }}
      />
      {/* Right Flap */}
      <div
        className="absolute top-8 bottom-8 -right-12 w-12 bg-art-accent/80 rounded-r-xl border-r-2 border-y-2 border-art-accent origin-left transition-all duration-300 shadow-sm"
        style={{ transform: 'perspective(400px) rotateY(25deg)' }}
      />
      {/* Bottom Flap */}
      <div
        className="absolute -bottom-12 left-8 right-8 h-12 bg-art-accent/80 rounded-b-xl border-b-2 border-x-2 border-art-accent origin-top transition-all duration-300 shadow-sm"
        style={{ transform: 'perspective(400px) rotateX(-25deg)' }}
      />

      {/* Slanted box badge */}
      <div className="absolute -top-5 left-8 bg-art-accent text-white px-4 py-1 text-xs uppercase tracking-widest font-sans rounded-full rotate-[-2deg] shadow-lg z-10">
        Caja de Cartón Estándar
      </div>

      {/* Box Inner (Darker, recessed container) */}
      <div className="relative bg-[#d3c2a5] p-4 rounded-2xl shadow-[inner_0px_6px_14px_rgba(0,0,0,0.15)] border-2 border-art-accent/30">
        
        {/* Playful box stamps and text */}
        <div className="absolute -top-3.5 right-6 bg-[#ba9470] text-white font-sans text-[9px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded shadow-md border border-[#a6825d] z-10 pointer-events-none select-none">
          ♥ Contiene Ternura
        </div>
        <div className="absolute -bottom-3.5 left-6 bg-[#2d241e] text-[#fdfaf6] font-sans text-[9px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded shadow border border-black z-10 pointer-events-none select-none">
          Manejar Con Cuidado
        </div>

        {/* Grid Container */}
        <div
          id="game-box-grid"
          ref={onGridRef}
          className="relative grid gap-1 select-none overflow-hidden rounded-xl"
          style={{
            gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
            gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
          }}
        >
          {/* Render individual cells */}
          {Array.from({ length: rows }).map((_, r) =>
            Array.from({ length: cols }).map((_, c) => {
              const obstacle = getObstacleAt(r, c);
              const inPreview = isCellInPreview(r, c);

              let cellBg = 'bg-[#eddcb8]/60';
              let cellBorder = 'border-[#d4c3a3]/40';

              if (inPreview) {
                cellBg = previewIsValid 
                  ? 'bg-emerald-500/25' 
                  : 'bg-rose-500/20';
                cellBorder = previewIsValid
                  ? 'border-emerald-400/60'
                  : 'border-rose-400/60';
              }

              return (
                <div
                  key={`cell-${r}-${c}`}
                  className={`relative w-full h-full border-2 rounded-lg transition-colors duration-150 flex items-center justify-center ${cellBg} ${cellBorder}`}
                  style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
                >
                  {/* Subtle alignment dot */}
                  {!obstacle && !inPreview && (
                    <div className="w-1.5 h-1.5 rounded-full bg-art-accent/40" />
                  )}

                  {/* Obstacle rendering */}
                  {obstacle && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                      {renderObstacleSVG(obstacle.type)}
                    </div>
                  )}

                  {/* Cell coordinates tooltips on hover (Optional, kept clean) */}
                  <span className="sr-only">Celda {r},{c}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
