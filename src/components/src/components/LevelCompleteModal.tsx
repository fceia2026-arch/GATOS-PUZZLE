import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, Heart, Star, Smile, RefreshCw, Trophy } from 'lucide-react';

interface LevelCompleteModalProps {
  levelNumber: number;
  levelName: string;
  isLastLevel: boolean;
  onNextLevel: () => void;
  onRestartGame: () => void;
  onClose: () => void;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  levelNumber,
  levelName,
  isLastLevel,
  onNextLevel,
  onRestartGame,
  onClose,
}) => {
  // Array of cute cat-themed congratulations!
  const congratulationsMessages = [
    "¡Miau-ravilloso trabajo! Todos los gatitos están calientitos y cómodos.",
    "¡Un ajuste purr-fecto! Se escucha un coro de ronroneos felices.",
    "¡Es-pactacular! Ningún bigote quedó aplastado.",
    "¡Dominas el arte del Tetris Felino! Tienes un corazón de oro.",
    "¡Todos los gatos caben si los acomodas con amor! ¡Excelente!"
  ];

  const randomMessage = congratulationsMessages[levelNumber % congratulationsMessages.length];

  return (
    <div className="fixed inset-0 bg-[#2d241e]/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-art-bg rounded-[32px] border-4 border-art-accent max-w-md w-full p-6 text-center shadow-2xl relative overflow-visible"
        id="level-complete-modal"
      >
        {/* Cute Floating Sparkles and Stars */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 bg-art-accent text-white font-black font-sans uppercase tracking-widest text-[10px] px-5 py-2.5 rounded-full border-2 border-art-border shadow-md">
          <Sparkles className="text-amber-200 w-4 h-4 animate-spin" style={{ animationDuration: '3s' }} />
          <span>¡Nivel {levelNumber} Superado!</span>
        </div>

        {/* Big Heart Mascot Drawing in SVG */}
        <div className="my-6 flex justify-center">
          <svg viewBox="0 0 160 160" className="w-36 h-36">
            {/* Soft pink circle */}
            <circle cx="80" cy="80" r="64" fill="#fff9f0" stroke="#ba9470" strokeWidth="2" strokeDasharray="6,4" />
            
            {/* Double Heart behind */}
            <path d="M 60 70 A 15 15 0 0 1 90 70 A 15 15 0 0 1 120 70 Q 120 100 90 120 Q 60 100 60 70" fill="#fecdd3" />

            {/* Happy Sleeping Kitten Vector */}
            <g transform="translate(45, 45)">
              {/* Ears */}
              <polygon points="12,25 0,8 24,18" fill="#f59e0b" stroke="#78350f" strokeWidth="2" />
              <polygon points="15,22 5,11 20,17" fill="#fda4af" />
              <polygon points="58,25 70,8 46,18" fill="#f59e0b" stroke="#78350f" strokeWidth="2" />
              <polygon points="55,22 65,11 50,17" fill="#fda4af" />

              {/* Face/Body (Spherical) */}
              <circle cx="35" cy="40" r="24" fill="#fdbaf7" stroke="#78350f" strokeWidth="2" />
              {/* Back spot */}
              <ellipse cx="20" cy="45" rx="8" ry="12" fill="#d946ef" opacity="0.3" />

              {/* Eyes (Happy arcs) */}
              <path d="M 22 36 Q 26 33 30 36" fill="none" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 40 36 Q 44 33 48 36" fill="none" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />

              {/* Pink cheeks */}
              <circle cx="20" cy="41" r="3" fill="#fda4af" />
              <circle cx="50" cy="41" r="3" fill="#fda4af" />

              {/* Cute little mouth */}
              <path d="M 31 43 Q 33 45 35 43 Q 37 45 39 43" fill="none" stroke="#78350f" strokeWidth="2.2" strokeLinecap="round" />

              {/* Paws curled in front */}
              <ellipse cx="26" cy="54" rx="5" ry="4" fill="#ffedd5" stroke="#78350f" strokeWidth="1.5" />
              <ellipse cx="44" cy="54" rx="5" ry="4" fill="#ffedd5" stroke="#78350f" strokeWidth="1.5" />

              {/* Whiskers */}
              <line x1="8" y1="41" x2="1" y2="40" stroke="#78350f" strokeWidth="1.5" />
              <line x1="8" y1="44" x2="0" y2="44" stroke="#78350f" strokeWidth="1.5" />
              <line x1="62" y1="41" x2="69" y2="40" stroke="#78350f" strokeWidth="1.5" />
              <line x1="62" y1="44" x2="70" y2="44" stroke="#78350f" strokeWidth="1.5" />
            </g>

            {/* Glowing stars */}
            <Star className="text-amber-400 fill-amber-300 absolute top-4 right-10 w-6 h-6 animate-bounce" style={{ animationDelay: '0.2s' }} />
            <Heart className="text-rose-500 fill-rose-300 absolute bottom-6 left-12 w-6 h-6 animate-pulse" />
          </svg>
        </div>

        {/* Content */}
        <h3 className="text-2xl md:text-3xl font-serif font-black italic text-art-heading mt-2 mb-3">
          {isLastLevel ? "🎉 ¡CAMPEÓN FELINO! 🎉" : "¡Caja Organizada!"}
        </h3>
        
        <p className="text-[10px] uppercase tracking-wider font-sans font-black text-art-accent mb-2">
          {levelName}
        </p>

        <p className="text-xs text-art-text/90 leading-relaxed px-4 mb-6 font-sans">
          {isLastLevel 
            ? "¡Has completado todos los niveles de Gatitos en la Caja! Has demostrado una inteligencia espacial asombrosa y has hecho muy felices a todos nuestros amiguitos peludos."
            : randomMessage
          }
        </p>

        {/* Action Button */}
        <div className="flex flex-col gap-2.5">
          {!isLastLevel ? (
            <button
              onClick={onNextLevel}
              className="w-full flex items-center justify-center gap-2 bg-art-accent hover:bg-art-accent/90 text-white font-sans font-bold uppercase tracking-widest py-3.5 px-6 rounded-2xl shadow-lg border-b-4 border-[#9c7755] transition-all active:scale-[0.98] cursor-pointer"
              id="next-level-btn"
            >
              Siguiente Caja
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={onRestartGame}
              className="w-full flex items-center justify-center gap-2 bg-art-heading hover:bg-art-heading/90 text-white font-sans font-bold uppercase tracking-widest py-3.5 px-6 rounded-2xl shadow-lg border-b-4 border-black transition-all active:scale-[0.98] cursor-pointer"
              id="restart-game-btn"
            >
              <RefreshCw size={16} />
              Volver a Jugar
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full py-2 px-4 rounded-xl text-[10px] font-sans font-black uppercase tracking-wider text-art-accent/75 hover:text-art-accent hover:bg-art-accent/5 transition-colors cursor-pointer"
            id="review-box-btn"
          >
            Ver la Caja Terminada
          </button>
        </div>
      </motion.div>
    </div>
  );
};
