import React from 'react';
import { CatPiece as CatType } from '../types';
import { CatPiece } from './CatPiece';
import { HelpCircle, RefreshCw, Layers } from 'lucide-react';

interface InventoryProps {
  cats: CatType[];
  cellSize: number;
  selectedCatId: string | null;
  draggedCatId: string | null;
  onPointerDownCat: (e: React.PointerEvent<HTMLDivElement>, catId: string) => void;
  onRotateCat: (catId: string) => void;
}

export const Inventory: React.FC<InventoryProps> = ({
  cats,
  cellSize,
  selectedCatId,
  draggedCatId,
  onPointerDownCat,
  onRotateCat,
}) => {
  const inventoryCats = cats.filter(cat => cat.gridX === null || cat.gridY === null);

  return (
    <div className="relative p-6 bg-white rounded-[32px] border-2 border-art-border flex-1 max-w-full shadow-sm">
      {/* Knit Blanket Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none rounded-[32px]"
        style={{
          backgroundImage: `radial-gradient(#2d241e 20%, transparent 20%), radial-gradient(#2d241e 20%, transparent 20%)`,
          backgroundPosition: '0 0, 8px 8px',
          backgroundSize: '16px 16px'
        }}
      />

      {/* Decorative Blanket Label */}
      <div className="absolute -top-3.5 left-6 bg-art-accent text-white font-sans text-[10px] uppercase tracking-widest font-black px-4 py-1 rounded-full shadow-md flex items-center gap-1.5 z-10 pointer-events-none select-none">
        <Layers size={12} />
        <span>Inventario de Michis</span>
      </div>

      <div className="flex flex-col h-full min-h-[160px]">
        {inventoryCats.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-art-text/60">
            <svg viewBox="0 0 40 40" className="w-12 h-12 fill-art-accent/40 mb-2">
              <path d="M20 2a18 18 0 1 0 18 18A18 18 0 0 0 20 2zm0 32a14 14 0 1 1 14-14 14 14 0 0 1-14 14z" />
              <path d="M24 16a2 2 0 1 1-2-2 2 2 0 0 1 2 2zm-8 0a2 2 0 1 1-2-2 2 2 0 0 1 2 2zm11.24 9.42a1 1 0 0 1-1.35.34 7 7 0 0 0-7.78 0 1 1 0 0 1-1-.16 1 1 0 0 1-.35-1.18 9 9 0 0 1 11.48 1 1 0 0 1 0 1z" />
            </svg>
            <p className="font-sans font-bold text-sm text-art-heading">¡Todos los gatitos están en la caja!</p>
            <p className="text-xs leading-relaxed max-w-xs mt-0.5">Mira qué cómodos están durmiendo juntos.</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-wrap items-center justify-center gap-10 p-4">
            {inventoryCats.map((cat) => {
              const isBeingDragged = cat.id === draggedCatId;
              const isSelected = cat.id === selectedCatId;

              return (
                <div
                  key={cat.id}
                  className={`transition-all duration-300 relative flex items-center justify-center ${
                    isBeingDragged ? 'opacity-25' : 'hover:scale-105'
                  }`}
                  id={`inventory-cat-slot-${cat.id}`}
                >
                  <CatPiece
                    cat={cat}
                    cellSize={cellSize}
                    isDragging={false} // Only visual representation in list
                    isSelected={isSelected}
                    isPlaced={false}
                    onPointerDown={onPointerDownCat}
                    onRotate={onRotateCat}
                  />

                  {/* Tiny instruction text for touch-devices */}
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-sans font-bold uppercase tracking-wide text-art-text/40 select-none pointer-events-none whitespace-nowrap">
                    Arrástrame a la caja
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
