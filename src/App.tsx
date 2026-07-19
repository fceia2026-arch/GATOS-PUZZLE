/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LEVELS } from './data/levels';
import { CatPiece as CatType, Coords, Level } from './types';
import { CatPiece } from './components/CatPiece';
import { GameGrid } from './components/GameGrid';
import { LevelSelector } from './components/LevelSelector';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { Inventory } from './components/Inventory';
import { canPlaceCat, getRotatedBlocks, isLevelSolved } from './utils/grid';
import { SOLUTIONS } from './data/solutions';
import {
  playSnap,
  playClick,
  playBump,
  playFanfare,
  setSoundEnabled,
  isSoundEnabled,
} from './utils/sound';
import {
  getSupabase,
  getOrCreatePlayerLocal,
  updatePlayerNicknameLocal,
  syncProgressWithSupabase,
  loadProgressFromSupabase,
  fetchLeaderboard,
  LeaderboardEntry,
} from './utils/supabase';
import {
  HelpCircle,
  RefreshCw,
  Volume2,
  VolumeX,
  Map,
  ChevronLeft,
  ChevronRight,
  Info,
  Award,
  Heart,
  Sparkles,
  BookOpen,
  Cloud,
  CloudOff,
  Trophy,
  User,
  Check,
  Edit2,
  Loader2,
} from 'lucide-react';

export default function App() {
  // Game state
  const [currentLevelIdx, setCurrentLevelIdx] = useState<number>(0);
  const [cats, setCats] = useState<CatType[]>([]);
  const [completedLevelIds, setCompletedLevelIds] = useState<number[]>([]);
  
  // UI Controls
  const [showLevelSelector, setShowLevelSelector] = useState<boolean>(false);
  const [showCompleteModal, setShowCompleteModal] = useState<boolean>(false);
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);
  const [showSolutionModal, setShowSolutionModal] = useState<boolean>(false);
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'juego' | 'instrucciones'>('juego');

  // Dragging states
  const [activeDrag, setActiveDrag] = useState<{
    catId: string;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    offsetX: number; // point where grabbed relative to cat bounding box
    offsetY: number;
    origGridX: number | null;
    origGridY: number | null;
  } | null>(null);

  // Grid element state for collision checking, snapping, and layout sync
  const [gridElement, setGridElement] = useState<HTMLDivElement | null>(null);

  // Supabase & Cloud Save state
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(false);
  const [playerNickname, setPlayerNickname] = useState<string>('');
  const [isEditingNickname, setIsEditingNickname] = useState<boolean>(false);
  const [tempNickname, setTempNickname] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState<boolean>(false);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState<boolean>(false);

  // Dynamic responsive window size state for auto-layout on mobile landscape
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentLevel = LEVELS[currentLevelIdx];
  
  const CELL_SIZE = useMemo(() => {
    const isMobileLandscape = windowSize.width > windowSize.height && windowSize.height < 540;
    const isSmallScreen = windowSize.width < 640;
    
    if (isMobileLandscape) {
      return 44; // Compact size for horizontal mobile viewports to prevent vertical scroll
    }
    if (isSmallScreen) {
      return 52; // Slightly smaller for standard mobile portrait
    }
    return 60; // Standard desktop size
  }, [windowSize]);

  // 1. Load completed levels, settings, and sync with Supabase on mount
  useEffect(() => {
    // Check if Supabase keys are configured
    const supabase = getSupabase();
    if (supabase) {
      setIsSupabaseConnected(true);
    }

    // Get or create local player nickname & ID
    const localPlayer = getOrCreatePlayerLocal();
    setPlayerNickname(localPlayer.nickname);
    setTempNickname(localPlayer.nickname);

    let localCompletions: number[] = [];
    try {
      const savedCompleted = localStorage.getItem('gatitos_completed_levels');
      if (savedCompleted) {
        localCompletions = JSON.parse(savedCompleted);
        setCompletedLevelIds(localCompletions);
      }

      const savedSound = localStorage.getItem('gatitos_sound_enabled');
      if (savedSound !== null) {
        const soundVal = savedSound === 'true';
        setSoundOn(soundVal);
        setSoundEnabled(soundVal);
      }
    } catch (e) {
      console.error('Failed to load local storage state:', e);
    }

    // If Supabase is connected, load from cloud and merge
    if (supabase) {
      setIsSyncing(true);
      loadProgressFromSupabase()
        .then((cloudProgress) => {
          if (cloudProgress) {
            // Merge local and cloud progress
            const mergedCompletions = Array.from(
              new Set([...localCompletions, ...(cloudProgress.completed_levels || [])])
            );
            setCompletedLevelIds(mergedCompletions);
            localStorage.setItem(
              'gatitos_completed_levels',
              JSON.stringify(mergedCompletions)
            );
            // Sync merged progress back to Supabase
            syncProgressWithSupabase(mergedCompletions).catch(console.error);
          } else {
            // New user, push local progress to cloud
            syncProgressWithSupabase(localCompletions).catch(console.error);
          }
        })
        .catch((err) => console.error('Error syncing Supabase on load:', err))
        .finally(() => setIsSyncing(false));
    }
  }, []);

  // Update nickname function
  const handleSaveNickname = async () => {
    if (!tempNickname.trim()) return;
    const finalNickname = tempNickname.trim();
    updatePlayerNicknameLocal(finalNickname);
    setPlayerNickname(finalNickname);
    setIsEditingNickname(false);
    playClick();

    if (isSupabaseConnected) {
      setIsSyncing(true);
      try {
        await syncProgressWithSupabase(completedLevelIds);
      } catch (err) {
        console.error('Error saving nickname to Supabase:', err);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  // Open leaderboard function
  const handleOpenLeaderboard = async () => {
    playClick();
    setShowLeaderboardModal(true);
    if (isSupabaseConnected) {
      setLoadingLeaderboard(true);
      try {
        const data = await fetchLeaderboard();
        setLeaderboard(data);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLoadingLeaderboard(false);
      }
    }
  };


  // 2. Load level cats whenever level index changes
  useEffect(() => {
    // Clone cats to avoid direct mutation
    const levelCats = currentLevel.cats.map((cat) => ({
      ...cat,
      rotation: 0,
      gridX: null,
      gridY: null,
    }));
    setCats(levelCats);
    setShowCompleteModal(false);
  }, [currentLevelIdx]);

  // 3. Sound toggle handler
  const handleToggleSound = () => {
    const nextVal = !soundOn;
    setSoundOn(nextVal);
    setSoundEnabled(nextVal);
    localStorage.setItem('gatitos_sound_enabled', String(nextVal));
    playClick();
  };

  // 4. Level Navigation
  const handleNextLevel = () => {
    if (currentLevelIdx < LEVELS.length - 1) {
      setCurrentLevelIdx(currentLevelIdx + 1);
      playClick();
    }
  };

  const handlePrevLevel = () => {
    if (currentLevelIdx > 0) {
      setCurrentLevelIdx(currentLevelIdx - 1);
      playClick();
    }
  };

  const handleSelectLevel = (idx: number) => {
    setCurrentLevelIdx(idx);
    playClick();
  };

  // 5. Reset Current Level
  const handleResetLevel = () => {
    const resetCats = cats.map((cat) => ({
      ...cat,
      gridX: null,
      gridY: null,
      rotation: 0,
    }));
    setCats(resetCats);
    playClick();
  };

  // 6. Reset ALL Game Progress
  const handleRestartGame = () => {
    localStorage.removeItem('gatitos_completed_levels');
    setCompletedLevelIds([]);
    setCurrentLevelIdx(0);
    setShowCompleteModal(false);
    playClick();
    if (isSupabaseConnected) {
      syncProgressWithSupabase([]).catch(console.error);
    }
  };

  // 6.5. Apply solution directly to board
  const handleApplySolution = () => {
    const solution = SOLUTIONS[currentLevel.id];
    if (!solution) return;

    const solvedCats = cats.map((cat) => {
      const sol = solution.find((s) => s.catId === cat.id);
      if (sol) {
        return {
          ...cat,
          gridX: sol.gridX,
          gridY: sol.gridY,
          rotation: sol.rotation,
        };
      }
      return cat;
    });

    setCats(solvedCats);
    playSnap();
    setShowSolutionModal(false);

    // Trigger completion slightly delayed for a clean transition
    setTimeout(() => {
      setShowCompleteModal(true);
      playFanfare();

      if (!completedLevelIds.includes(currentLevel.id)) {
        const updatedCompletions = [...completedLevelIds, currentLevel.id];
        setCompletedLevelIds(updatedCompletions);
        localStorage.setItem(
          'gatitos_completed_levels',
          JSON.stringify(updatedCompletions)
        );
        if (isSupabaseConnected) {
          syncProgressWithSupabase(updatedCompletions).catch(console.error);
        }
      }
    }, 400);
  };

  // 7. Rotating a cat
  const handleRotateCat = (catId: string) => {
    playClick();
    setCats((prevCats) => {
      let isCorrectTransition = false;
      let rotatedCatFace: 'cute' | 'derp' | 'sleepy' | 'happy' = 'happy';

      const nextCats = prevCats.map((cat) => {
        if (cat.id !== catId) return cat;

        const nextRotation = (cat.rotation + 90) % 360;
        const tempRotatedCat = { ...cat, rotation: nextRotation };

        // If the cat is currently placed in the box, verify if it still fits after rotation!
        if (cat.gridX !== null && cat.gridY !== null) {
          const fits = canPlaceCat(
            tempRotatedCat,
            cat.gridX,
            cat.gridY,
            currentLevel.boxRows,
            currentLevel.boxCols,
            currentLevel.obstacles,
            prevCats.filter((c) => c.id !== catId)
          );

          if (fits) {
            // Fits perfectly after rotation, let it stay!
            const solution = SOLUTIONS[currentLevel.id];
            const sol = solution?.find((s) => s.catId === catId);
            const wasCorrect = sol && sol.gridX === cat.gridX && sol.gridY === cat.gridY && (cat.rotation % 360) === (sol.rotation % 360);
            const isNowCorrect = sol && sol.gridX === cat.gridX && sol.gridY === cat.gridY && (nextRotation % 360) === (sol.rotation % 360);
            
            if (isNowCorrect && !wasCorrect) {
              isCorrectTransition = true;
              rotatedCatFace = cat.style.faceExpression || 'happy';
            }
            return tempRotatedCat;
          } else {
            // Does not fit! Try to find a nearby cell shift, or pop it back to inventory
            // Returning to inventory is a highly consistent and clean feedback
            playBump();
            return { ...tempRotatedCat, gridX: null, gridY: null };
          }
        }

        // Cat is in the inventory, just rotate it
        return tempRotatedCat;
      });

      // Check if this solves the level!
      const solved = isLevelSolved(
        currentLevel.boxRows,
        currentLevel.boxCols,
        currentLevel.obstacles,
        nextCats
      );

      if (solved) {
        setTimeout(() => {
          setShowCompleteModal(true);
          playFanfare();

          if (!completedLevelIds.includes(currentLevel.id)) {
            const updatedCompletions = [...completedLevelIds, currentLevel.id];
            setCompletedLevelIds(updatedCompletions);
            localStorage.setItem(
              'gatitos_completed_levels',
              JSON.stringify(updatedCompletions)
            );
            if (isSupabaseConnected) {
              syncProgressWithSupabase(updatedCompletions).catch(console.error);
            }
          }
        }, 300);
      }

      return nextCats;
    });
  };

  // 8. Grab / Pointer Down
  const handlePointerDownCat = (
    e: React.PointerEvent<HTMLDivElement>,
    catId: string
  ) => {
    const cat = cats.find((c) => c.id === catId);
    if (!cat) return;

    e.preventDefault();

    // Use page coords or client coords
    const clientX = e.clientX;
    const clientY = e.clientY;

    // Get cat element bounding box to compute offset
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const offsetY = clientY - rect.top;

    // Activate drag state
    setActiveDrag({
      catId,
      startX: clientX,
      startY: clientY,
      currentX: clientX,
      currentY: clientY,
      offsetX,
      offsetY,
      origGridX: cat.gridX,
      origGridY: cat.gridY,
    });

    // Clear its grid position immediately so it doesn't collide with its own ghost
    setCats((prev) =>
      prev.map((c) =>
        c.id === catId ? { ...c, gridX: null, gridY: null } : c
      )
    );
  };

  // 9. Pointer Move (Global)
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!activeDrag) return;

    const clientX = e.clientX;
    const clientY = e.clientY;

    setActiveDrag((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        currentX: clientX,
        currentY: clientY,
      };
    });
  };

  // 10. Pointer Up (Global drop)
  const handlePointerUp = () => {
    if (!activeDrag) return;

    const {
      catId,
      startX,
      startY,
      currentX,
      currentY,
      offsetX,
      offsetY,
      origGridX,
      origGridY,
    } = activeDrag;

    const draggedCat = cats.find((c) => c.id === catId);
    if (!draggedCat) {
      setActiveDrag(null);
      return;
    }

    const dist = Math.hypot(currentX - startX, currentY - startY);

    // CASE A: Tiny drag (less than 5px) = Click / Tap to Rotate!
    if (dist < 5) {
      // Revert the ghost clearing (put it back to original)
      setCats((prev) =>
        prev.map((c) =>
          c.id === catId
            ? { ...c, gridX: origGridX, gridY: origGridY }
            : c
        )
      );
      // Trigger rotation
      handleRotateCat(catId);
      setActiveDrag(null);
      return;
    }

    // CASE B: Proper Drag drop
    let snapped = false;
    let targetRow = null;
    let targetCol = null;

    if (gridElement) {
      const gridRect = gridElement.getBoundingClientRect();

      // Find top-left coordinates of the cat relative to viewport
      const catLeft = currentX - offsetX;
      const catTop = currentY - offsetY;

      // Distance relative to grid
      const relX = catLeft - gridRect.left;
      const relY = catTop - gridRect.top;

      // Grid index computation accounting for 4px gap
      targetCol = Math.round(relX / (CELL_SIZE + 4));
      targetRow = Math.round(relY / (CELL_SIZE + 4));

      // Verify fit
      const fits = canPlaceCat(
        draggedCat,
        targetRow,
        targetCol,
        currentLevel.boxRows,
        currentLevel.boxCols,
        currentLevel.obstacles,
        cats.filter((c) => c.id !== catId)
      );

      if (fits) {
        snapped = true;
      }
    }

    if (snapped && targetRow !== null && targetCol !== null) {
      // Snap successfully to grid!
      const updatedCats = cats.map((c) =>
        c.id === catId
          ? { ...c, gridX: targetRow, gridY: targetCol }
          : c
      );

      setCats(updatedCats);
      playSnap();

      // Check if this solves the level!
      const solved = isLevelSolved(
        currentLevel.boxRows,
        currentLevel.boxCols,
        currentLevel.obstacles,
        updatedCats
      );

      if (solved) {
        // Complete Level!
        setShowCompleteModal(true);
        playFanfare();

        // Persist completion
        if (!completedLevelIds.includes(currentLevel.id)) {
          const updatedCompletions = [...completedLevelIds, currentLevel.id];
          setCompletedLevelIds(updatedCompletions);
          localStorage.setItem(
            'gatitos_completed_levels',
            JSON.stringify(updatedCompletions)
          );
          if (isSupabaseConnected) {
            syncProgressWithSupabase(updatedCompletions).catch(console.error);
          }
        }
      }
    } else {
      // Failed to drop in a valid slot, return to original position (grid or inventory)
      setCats((prev) =>
        prev.map((c) =>
          c.id === catId
            ? { ...c, gridX: origGridX, gridY: origGridY }
            : c
        )
      );
      playBump();
    }

    setActiveDrag(null);
  };

  // Compute live preview state for rendering inside GameGrid
  let previewPos: { r: number; c: number } | null = null;
  let previewBlocks: Coords[] | null = null;
  let previewIsValid = false;

  if (activeDrag && gridElement) {
    const draggedCat = cats.find((c) => c.id === activeDrag.catId);
    if (draggedCat) {
      const gridRect = gridElement.getBoundingClientRect();
      const catLeft = activeDrag.currentX - activeDrag.offsetX;
      const catTop = activeDrag.currentY - activeDrag.offsetY;

      const relX = catLeft - gridRect.left;
      const relY = catTop - gridRect.top;

      const targetCol = Math.round(relX / (CELL_SIZE + 4));
      const targetRow = Math.round(relY / (CELL_SIZE + 4));

      // Only show preview if some parts of the cat are overlapping or close to the box
      const rotated = getRotatedBlocks(draggedCat.blocks, draggedCat.rotation);
      
      // Determine if within reasonable distance of the grid
      const inGridProximity = 
        targetCol >= -2 && 
        targetCol < currentLevel.boxCols + 2 && 
        targetRow >= -2 && 
        targetRow < currentLevel.boxRows + 2;

      if (inGridProximity) {
        previewPos = { r: targetRow, c: targetCol };
        previewBlocks = rotated;
        previewIsValid = canPlaceCat(
          draggedCat,
          targetRow,
          targetCol,
          currentLevel.boxRows,
          currentLevel.boxCols,
          currentLevel.obstacles,
          cats.filter((c) => c.id !== activeDrag.catId)
        );
      }
    }
  }

  // Calculate stats
  const totalCatsCount = currentLevel.cats.length;
  const placedCatsCount = cats.filter(
    (c) => c.gridX !== null && c.gridY !== null
  ).length;

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="min-h-screen bg-art-bg text-art-text font-sans relative overflow-x-hidden flex flex-col selection:bg-art-accent/10"
    >
      {/* Decorative background paw prints */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden select-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <svg
            key={`paw-${i}`}
            viewBox="0 0 100 100"
            className="absolute w-24 h-24 text-art-accent"
            style={{
              top: `${Math.random() * 90}%`,
              left: `${Math.random() * 90}%`,
              transform: `rotate(${Math.random() * 360}deg) scale(${0.6 + Math.random() * 0.8})`,
            }}
          >
            <circle cx="50" cy="65" r="18" fill="currentColor" />
            <circle cx="28" cy="38" r="10" fill="currentColor" />
            <circle cx="43" cy="25" r="10" fill="currentColor" />
            <circle cx="58" cy="25" r="10" fill="currentColor" />
            <circle cx="72" cy="38" r="10" fill="currentColor" />
          </svg>
        ))}
      </div>

      {/* HEADER BAR */}
      <header className="py-4 md:py-6 px-4 md:px-10 border-b border-art-border relative z-40 bg-white shadow-sm landscape:py-2.5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-end justify-between gap-4 md:gap-6 landscape:flex-row landscape:justify-between landscape:items-center">
          
          {/* Title Area */}
          <div className="space-y-1 text-center md:text-left landscape:text-left landscape:space-y-0.5">
            <h1 className="text-3xl md:text-5xl font-serif font-black tracking-tighter text-art-heading italic leading-none landscape:text-2xl">
              Gatitos en la Caja
            </h1>
            <p className="text-sm font-sans font-semibold text-art-accent/90 italic tracking-wide landscape:text-xs">
              Para Laura
            </p>
            <p className="text-xs uppercase tracking-[0.2em] font-sans font-black text-art-accent/60 pt-0.5 landscape:hidden md:landscape:block">
              Nivel {currentLevel.id}: {currentLevel.name}
            </p>
          </div>

          {/* Right side stats & Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-8 landscape:flex-row landscape:gap-4">
            <div className="flex gap-6 md:gap-8 text-center sm:text-right landscape:hidden md:landscape:flex">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-sans font-black opacity-50 tracking-wider">Dificultad</span>
                <span className="text-lg md:text-2xl font-serif font-bold italic text-art-heading">{currentLevel.difficulty}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-sans font-black opacity-50 tracking-wider">Comodidad</span>
                <span className="text-lg md:text-2xl font-serif font-bold italic text-art-heading">
                  {Math.round((placedCatsCount / totalCatsCount) * 100)}%
                </span>
              </div>
            </div>

            {/* Interactive buttons */}
            <div className="flex items-center gap-1.5 md:gap-2">
              <button
                onClick={handleOpenLeaderboard}
                className="flex items-center gap-1 py-1.5 px-2.5 bg-white hover:bg-art-light text-art-text rounded-xl border border-art-border shadow-sm transition-colors cursor-pointer text-[11px] font-bold"
                title="Clasificación global de michis"
                id="leaderboard-btn"
              >
                <Trophy size={13} className="text-amber-500 fill-amber-100" />
                <span className="landscape:hidden sm:landscape:inline">Clasificación</span>
              </button>

              <button
                onClick={() => { playClick(); setShowLevelSelector(true); }}
                className="flex items-center gap-1 py-1.5 px-3 bg-art-accent hover:bg-art-accent/90 text-white rounded-xl font-sans text-[11px] font-bold shadow-sm transition-colors cursor-pointer border border-[#a6825d]"
                id="map-levels-btn"
              >
                <Map size={13} />
                <span>Cajas</span>
              </button>

              <button
                onClick={() => { playClick(); setShowSolutionModal(true); }}
                className="flex items-center gap-1 py-1.5 px-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl border border-amber-200 shadow-sm transition-colors cursor-pointer text-[11px] font-bold"
                title="Ver la solución de esta caja"
                id="solution-btn"
              >
                <Sparkles size={13} className="text-amber-500 fill-amber-100 animate-pulse" />
                <span>Solución</span>
              </button>

              <button
                onClick={() => { playClick(); setShowHowToPlay(!showHowToPlay); }}
                className="p-1.5 bg-white hover:bg-art-light text-art-text rounded-xl border border-art-border shadow-sm transition-colors cursor-pointer"
                title="Cómo jugar"
                id="instructions-btn"
              >
                <HelpCircle size={15} />
              </button>

              <button
                onClick={handleToggleSound}
                className="p-1.5 bg-white hover:bg-art-light text-art-text rounded-xl border border-art-border shadow-sm transition-colors cursor-pointer"
                title={soundOn ? 'Silenciar' : 'Activar sonido'}
                id="sound-toggle-btn"
              >
                {soundOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
              </button>

              <button
                onClick={handleResetLevel}
                className="p-1.5 bg-white hover:bg-art-light text-art-text rounded-xl border border-art-border shadow-sm transition-colors cursor-pointer"
                title="Reiniciar caja"
                id="reset-level-btn"
              >
                <RefreshCw size={15} />
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* LEVEL SWITCHER BAR */}
      <div className="bg-art-light border-b border-art-border py-2 px-4 md:py-3 md:px-10 text-xs font-bold text-art-text/80 shadow-sm relative z-20 landscape:py-1.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevLevel}
              disabled={currentLevelIdx === 0}
              className="p-1 hover:bg-white border border-transparent hover:border-art-border rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer text-art-accent"
              title="Caja anterior"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-mono bg-art-accent/10 text-art-accent py-0.5 px-2.5 rounded font-bold uppercase tracking-wider text-[10px]">
              Caja {currentLevel.id} de {LEVELS.length}
            </span>
            <button
              onClick={handleNextLevel}
              disabled={currentLevelIdx === LEVELS.length - 1}
              className="p-1 hover:bg-white border border-transparent hover:border-art-border rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer text-art-accent"
              title="Siguiente caja"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {completedLevelIds.includes(currentLevel.id) && (
            <span className="flex items-center gap-1 text-emerald-600 font-sans font-black uppercase tracking-wider text-[10px]">
              <Award size={13} /> ¡Completado!
            </span>
          )}
        </div>
      </div>

      {/* MAIN GAME CONTAINER */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 flex flex-col landscape:flex-row lg:flex-row gap-4 md:gap-8 items-center landscape:items-start relative z-10 landscape:p-3">
        
        {/* LEFT COLUMN: GAMEPLAY ZONE (GRID & HOW-TO CARD) */}
        <div className="flex-1 flex flex-col gap-6 landscape:gap-3 justify-start items-center w-full">
          
          {/* Level Info Header inside board */}
          <div className="text-center max-w-lg mb-1 landscape:hidden md:landscape:block">
            <p className="text-sm font-serif font-medium text-art-text/95 leading-relaxed italic landscape:text-xs">
              &ldquo;{currentLevel.description}&rdquo;
            </p>
          </div>

          {/* Active board area */}
          <div className="relative">
            <GameGrid
              rows={currentLevel.boxRows}
              cols={currentLevel.boxCols}
              cellSize={CELL_SIZE}
              obstacles={currentLevel.obstacles}
              previewPos={previewPos}
              previewBlocks={previewBlocks}
              previewIsValid={previewIsValid}
              onGridRef={setGridElement}
            />

            {/* Draggable Snapped Cats inside the Grid overlay */}
            {gridElement && cats.map((cat) => {
              if (cat.gridX === null || cat.gridY === null) return null;

              // Compute absolute pixel offset inside grid ref
              const gridRect = gridElement.getBoundingClientRect();
              
              // Find the closest relative positioned parent wrapper (.relative) to align the overlay
              const parentRect = gridElement.parentElement?.parentElement?.parentElement?.getBoundingClientRect();
              const offsetX = parentRect ? (gridRect.left - parentRect.left) : 0;
              const offsetY = parentRect ? (gridRect.top - parentRect.top) : 0;

              // Account for CELL_SIZE plus the 4px (gap-1) grid gap
              const leftPos = cat.gridY * (CELL_SIZE + 4) + offsetX;
              const topPos = cat.gridX * (CELL_SIZE + 4) + offsetY;

              return (
                <div
                  key={`snapped-${cat.id}`}
                  className="absolute z-20 pointer-events-auto"
                  style={{
                    left: `${leftPos}px`,
                    top: `${topPos}px`,
                  }}
                >
                  <CatPiece
                    cat={cat}
                    cellSize={CELL_SIZE}
                    isDragging={false}
                    isSelected={false}
                    isPlaced={true}
                    onPointerDown={handlePointerDownCat}
                    onRotate={handleRotateCat}
                  />
                </div>
              );
            })}
          </div>

          {/* Mini Hint / Help bar */}
          <div className="text-[11px] text-art-text/60 flex items-center gap-1.5 font-sans font-bold uppercase tracking-wider max-w-md text-center landscape:hidden">
            <Info size={12} className="flex-shrink-0" />
            <span>Haz un toque/clic rápido sobre un gatito para rotarlo 90° en cualquier momento.</span>
          </div>
        </div>

        {/* RIGHT COLUMN: INVENTORY & DETAILED HOW-TO PLAY */}
        <div className="w-full landscape:w-[310px] lg:w-[380px] flex flex-col gap-6 landscape:gap-3 landscape:max-h-[calc(100vh-120px)] landscape:overflow-y-auto landscape:pr-1.5">
          
          {/* Mobile Tabs if space is tight */}
          <div className="lg:hidden flex border-b border-art-border landscape:mb-1">
            <button
              onClick={() => setActiveTab('juego')}
              className={`flex-1 py-2.5 text-center font-sans font-black text-xs uppercase tracking-wider ${
                activeTab === 'juego'
                  ? 'text-art-accent border-b-2 border-art-accent'
                  : 'text-art-text/50'
              }`}
            >
              Gatitos
            </button>
            <button
              onClick={() => setActiveTab('instrucciones')}
              className={`flex-1 py-2.5 text-center font-sans font-black text-xs uppercase tracking-wider ${
                activeTab === 'instrucciones'
                  ? 'text-art-accent border-b-2 border-art-accent'
                  : 'text-art-text/50'
              }`}
            >
              Guía
            </button>
          </div>

          {/* Tab Content A: Inventory (Cozy Blanket) */}
          <div className={`${activeTab === 'juego' ? 'block' : 'hidden'} lg:block flex-1 flex flex-col`}>
            <Inventory
              cats={cats}
              cellSize={CELL_SIZE}
              selectedCatId={activeDrag ? activeDrag.catId : null}
              draggedCatId={activeDrag ? activeDrag.catId : null}
              onPointerDownCat={handlePointerDownCat}
              onRotateCat={handleRotateCat}
            />
          </div>

          {/* Tab Content B / Persistent instructions card on desktop */}
          <div className={`${activeTab === 'instrucciones' || showHowToPlay ? 'block' : 'hidden lg:block'}`}>
            {/* Objective & Instructions Card */}
            <div className="bg-[#fff9f0] p-6 rounded-[32px] border border-[#f0e6d2] shadow-sm space-y-5 landscape:p-4 landscape:space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-sans font-black opacity-50 tracking-wider">Objetivo</span>
                  <span className="text-xs font-bold text-art-heading font-sans uppercase tracking-wider">
                    {placedCatsCount} / {totalCatsCount} Michis
                  </span>
                </div>
                <div className="w-full bg-[#f0e6d2] h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#ba9470] h-full rounded-full transition-all duration-500" 
                    style={{ width: `${(placedCatsCount / totalCatsCount) * 100}%` }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#f0e6d2]">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen size={15} className="text-art-accent" />
                  <h4 className="text-[10px] uppercase tracking-wider font-sans font-black text-art-heading">
                    Guía de Juego
                  </h4>
                </div>
                <ul className="space-y-2.5 text-xs text-art-text/90 font-medium leading-relaxed font-sans">
                  <li className="flex gap-2">
                    <span className="font-bold text-art-accent bg-art-accent/10 rounded-full w-4.5 h-4.5 flex items-center justify-center flex-shrink-0 text-[10px]">1</span>
                    <p><strong>Arrastra</strong> michis a la caja de cartón beige.</p>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-art-accent bg-art-accent/10 rounded-full w-4.5 h-4.5 flex items-center justify-center flex-shrink-0 text-[10px]">2</span>
                    <p><strong>Toque / Clic</strong> rápido sobre un michi para rotarlo 90°.</p>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-art-accent bg-art-accent/10 rounded-full w-4.5 h-4.5 flex items-center justify-center flex-shrink-0 text-[10px]">3</span>
                    <p>No encimes gatos, ni los coloques sobre los juguetes/obstáculos.</p>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-[#f0e6d2] flex flex-col gap-3">
                <button
                  onClick={handleResetLevel}
                  className="w-full py-3 bg-art-accent text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-[#a27b58] transition-colors cursor-pointer shadow-sm border border-[#a6825d]"
                >
                  Reiniciar Caja
                </button>

                <button
                  onClick={() => { playClick(); setShowSolutionModal(true); }}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer shadow-sm border border-amber-600 flex items-center justify-center gap-1.5"
                >
                  <Sparkles size={14} className="fill-amber-100" />
                  <span>Ver Solución</span>
                </button>

                <button
                  onClick={handleRestartGame}
                  className="text-[9px] font-sans font-black uppercase tracking-wider text-red-700/60 hover:text-red-800 flex items-center justify-center gap-1 cursor-pointer mt-1"
                  id="reset-game-data-btn"
                  title="Borrar todo el historial de juego"
                >
                  <RefreshCw size={10} /> Borrar Todo el Progreso
                </button>
              </div>
            </div>

            {/* Supabase Profile Card */}
            <div className="bg-[#fefaf4] p-4 rounded-[32px] border-2 border-dashed border-art-accent/20 space-y-3 shadow-sm mt-4 landscape:mt-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Cloud size={14} className={isSupabaseConnected ? "text-emerald-500 animate-pulse" : "text-art-accent/50"} />
                  <span className="text-[10px] uppercase font-sans font-black text-art-accent tracking-wider">
                    {isSupabaseConnected ? 'Progreso en la Nube' : 'Guardado Local (Offline)'}
                  </span>
                </div>
                {isSyncing && (
                  <Loader2 size={12} className="text-art-accent animate-spin" />
                )}
              </div>

              {/* Player Profile Details */}
              <div className="bg-white p-3.5 rounded-2xl border border-art-border flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-full bg-art-light border border-art-border flex items-center justify-center text-art-accent flex-shrink-0">
                    <User size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] uppercase font-sans font-black opacity-40 block">Jugador</span>
                    {isEditingNickname ? (
                      <div className="flex items-center gap-1 mt-0.5">
                        <input
                          type="text"
                          value={tempNickname}
                          onChange={(e) => setTempNickname(e.target.value)}
                          maxLength={30}
                          className="w-full bg-art-light border border-art-border rounded px-1.5 py-0.5 text-xs font-bold text-art-heading focus:outline-none focus:ring-1 focus:ring-art-accent"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveNickname();
                            if (e.key === 'Escape') setIsEditingNickname(false);
                          }}
                        />
                        <button
                          onClick={handleSaveNickname}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                          title="Guardar"
                        >
                          <Check size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-art-heading truncate block">
                          {playerNickname || 'Michi Explorador'}
                        </span>
                        <button
                          onClick={() => {
                            setTempNickname(playerNickname);
                            setIsEditingNickname(true);
                            playClick();
                          }}
                          className="p-1 text-art-accent/70 hover:text-art-accent rounded hover:bg-art-light"
                          title="Editar nombre"
                        >
                          <Edit2 size={11} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Status / Call to Action */}
              {!isSupabaseConnected ? (
                <div className="text-[10px] text-art-text/60 leading-relaxed bg-[#f0e6d2]/30 p-2.5 rounded-xl border border-[#f0e6d2] font-sans">
                  🔌 Conecta <strong>Supabase</strong> para guardar en la nube y competir con otros michis en la clasificación. Sigue las instrucciones en <code>README.md</code>.
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-[9px] text-emerald-600 font-sans font-black uppercase tracking-wider pl-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>Sincronizado automáticamente</span>
                </div>
              )}
            </div>

          </div>

        </div>
      </main>

      {/* GLOBAL PERSISTENT FOOTER */}
      <footer className="h-12 bg-[#2d241e] flex items-center px-8 justify-between text-[10px] uppercase tracking-[0.2em] text-[#d4c3a3] font-sans font-bold mt-auto">
        <span>&copy; 2026 El Refugio de Michis</span>
        <span className="hidden sm:inline">{currentLevel.difficulty} - Nivel {currentLevel.id}</span>
        <span>Puzzle Espacial #{400 + currentLevel.id}</span>
      </footer>

      {/* ABSOLUTE FLOATING ACTIVE DRAG LAYER */}
      <AnimatePresence>
        {activeDrag && (() => {
          const draggedCat = cats.find((c) => c.id === activeDrag.catId);
          if (!draggedCat) return null;

          const catLeft = activeDrag.currentX - activeDrag.offsetX;
          const catTop = activeDrag.currentY - activeDrag.offsetY;

          return (
            <div
              className="fixed pointer-events-none z-50 transition-transform duration-75 select-none"
              style={{
                left: `${catLeft}px`,
                top: `${catTop}px`,
                transform: 'scale(1.05) rotate(1deg)',
                filter: 'drop-shadow(0 15px 15px rgba(69, 26, 3, 0.35))',
              }}
            >
              <CatPiece
                cat={draggedCat}
                cellSize={CELL_SIZE}
                isDragging={true}
                isSelected={true}
                isPlaced={false}
              />
            </div>
          );
        })()}
      </AnimatePresence>

      {/* LEVEL SELECTOR MODAL PORTAL */}
      <AnimatePresence>
        {showLevelSelector && (
          <LevelSelector
            levels={LEVELS}
            currentLevelIndex={currentLevelIdx}
            completedLevels={completedLevelIds}
            onSelectLevel={handleSelectLevel}
            onClose={() => { playClick(); setShowLevelSelector(false); }}
          />
        )}
      </AnimatePresence>

      {/* LEVEL COMPLETE MODAL PORTAL */}
      <AnimatePresence>
        {showCompleteModal && (
          <LevelCompleteModal
            levelNumber={currentLevel.id}
            levelName={currentLevel.name}
            isLastLevel={currentLevelIdx === LEVELS.length - 1}
            onNextLevel={handleNextLevel}
            onRestartGame={handleRestartGame}
            onClose={() => { playClick(); setShowCompleteModal(false); }}
          />
        )}
      </AnimatePresence>

      {/* CLOUD LEADERBOARD MODAL PORTAL */}
      <AnimatePresence>
        {showLeaderboardModal && (
          <div className="fixed inset-0 bg-[#2d241e]/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-art-bg rounded-[32px] border-4 border-art-accent max-w-md w-full p-6 text-center shadow-2xl relative overflow-visible flex flex-col max-h-[90vh]"
              id="leaderboard-modal"
            >
              {/* Header Trophy Emblem */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 bg-art-accent text-white font-black font-sans uppercase tracking-widest text-[10px] px-5 py-2.5 rounded-full border-2 border-art-border shadow-md">
                <Trophy className="text-amber-300 w-4 h-4" />
                <span>Salón de la Fama Felina</span>
              </div>

              <div className="mt-4 mb-2">
                <h3 className="text-2xl font-serif font-black italic text-art-heading">
                  Clasificación Global
                </h3>
                <p className="text-[10px] uppercase tracking-wider font-sans font-black text-art-accent">
                  Los Michis con más cajas resueltas
                </p>
              </div>

              {/* Leaderboard content */}
              <div className="flex-1 overflow-y-auto my-4 pr-1 min-h-[220px] max-h-[350px]">
                {!isSupabaseConnected ? (
                  // Offline explanation / mock
                  <div className="space-y-4 py-2 text-center">
                    <div className="w-12 h-12 rounded-full bg-amber-500/10 border-2 border-dashed border-amber-500/30 flex items-center justify-center mx-auto text-amber-600">
                      <CloudOff size={22} />
                    </div>
                    <div className="space-y-2 px-2">
                      <h4 className="text-xs font-bold text-art-heading">Modo Desconectado</h4>
                      <p className="text-[11px] text-art-text/80 leading-relaxed font-sans">
                        La clasificación utiliza <strong>Supabase</strong> para guardar los puntajes de jugadores de todo el mundo en tiempo real.
                      </p>
                      <p className="text-[10px] text-art-accent leading-relaxed font-sans bg-[#fff9f0] p-2.5 rounded-2xl border border-[#f0e6d2]">
                        Para activarlo, conecta tu proyecto de Supabase configurando las variables de entorno <code>VITE_SUPABASE_URL</code> y <code>VITE_SUPABASE_ANON_KEY</code>.
                      </p>
                    </div>
                    
                    {/* Visual Preview / Mock Leaderboard entries to look gorgeous */}
                    <div className="mt-4 border-t border-art-border/60 pt-4 px-2 space-y-2 opacity-50 select-none text-left">
                      <span className="text-[9px] uppercase font-sans font-black tracking-wider text-art-accent/60 block text-center">Ejemplo de Clasificación:</span>
                      <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-art-border text-xs">
                        <span className="font-bold flex items-center gap-1">🥇 {playerNickname} <span className="text-[10px] text-art-accent">(Tú)</span></span>
                        <span className="font-mono font-bold text-art-accent">{completedLevelIds.length} / {LEVELS.length} Cajas</span>
                      </div>
                      <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-art-border text-xs">
                        <span className="font-bold">🥈 Pelusa Cazador #481</span>
                        <span className="font-mono font-bold text-art-accent">7 / {LEVELS.length} Cajas</span>
                      </div>
                    </div>
                  </div>
                ) : loadingLeaderboard ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <Loader2 size={32} className="text-art-accent animate-spin" />
                    <span className="text-xs text-art-accent font-bold uppercase tracking-wider">Cargando clasificación...</span>
                  </div>
                ) : leaderboard.length === 0 ? (
                  <div className="py-12 text-center text-xs text-art-text/60">
                    🐾 No hay ningún registro todavía. ¡Sincroniza tu primer nivel completado para aparecer aquí!
                  </div>
                ) : (
                  <div className="space-y-2 text-left">
                    {leaderboard.map((entry, index) => {
                      const isCurrent = entry.nickname === playerNickname;
                      let rankBadge = '';
                      if (index === 0) rankBadge = '🥇';
                      else if (index === 1) rankBadge = '🥈';
                      else if (index === 2) rankBadge = '🥉';
                      else rankBadge = `🐾 #${index + 1}`;

                      return (
                        <div
                          key={`rank-${index}`}
                          className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                            isCurrent
                              ? 'bg-art-accent/10 border-art-accent text-art-heading scale-[1.01] font-bold'
                              : 'bg-white border-art-border text-art-text hover:bg-art-light'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-sm font-sans flex-shrink-0 w-8 text-left">{rankBadge}</span>
                            <span className="text-xs font-bold truncate">
                              {entry.nickname} {isCurrent && <span className="text-[9px] bg-art-accent text-white font-black uppercase px-1.5 py-0.5 rounded-full ml-1">Tú</span>}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono font-black text-art-accent bg-[#fefaf4] px-2 py-1 rounded-lg border border-art-accent/10">
                              {entry.completed_count} / {LEVELS.length} Cajas
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={() => { playClick(); setShowLeaderboardModal(false); }}
                className="w-full bg-art-accent hover:bg-art-accent/90 text-white font-sans font-bold uppercase tracking-widest py-3 px-6 rounded-2xl shadow-md border-b-4 border-[#9c7755] transition-all active:scale-[0.98] cursor-pointer mt-2"
                id="close-leaderboard-btn"
              >
                Cerrar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SOLUTION MODAL PORTAL */}
      <AnimatePresence>
        {showSolutionModal && (() => {
          // Precompute the solution grid
          const boxRows = currentLevel.boxRows;
          const boxCols = currentLevel.boxCols;
          const solutionGrid = Array(boxRows)
            .fill(null)
            .map(() => Array(boxCols).fill(null));

          // Place obstacles
          currentLevel.obstacles.forEach((o) => {
            solutionGrid[o.r][o.c] = { type: 'obstacle', detail: o.type };
          });

          // Place solved cats
          const solution = SOLUTIONS[currentLevel.id];
          if (solution) {
            solution.forEach((sol) => {
              const cat = currentLevel.cats.find((c) => c.id === sol.catId);
              if (cat) {
                const rotatedBlocks = getRotatedBlocks(cat.blocks, sol.rotation);
                // We'll mark the first block in the rotated list as the head
                const headBlock = rotatedBlocks[0];
                rotatedBlocks.forEach((b) => {
                  const r = sol.gridX + b.r;
                  const c = sol.gridY + b.c;
                  if (r >= 0 && r < boxRows && c >= 0 && c < boxCols) {
                    const isHead = b.r === headBlock.r && b.c === headBlock.c;
                    solutionGrid[r][c] = {
                      type: 'cat',
                      cat,
                      isHead,
                    };
                  }
                });
              }
            });
          }

          // Face mapping
          const faceEmoticons = {
            cute: "◕‿◕",
            derp: "⊙ܫ⊙",
            sleepy: "◡ܫ◡",
            happy: "≽ܫ≼"
          };

          return (
            <div className="fixed inset-0 bg-[#2d241e]/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-art-bg rounded-[32px] border-4 border-art-accent max-w-md w-full p-6 text-center shadow-2xl relative overflow-visible flex flex-col max-h-[90vh]"
                id="solution-modal"
              >
                {/* Header Sparkle Emblem */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 bg-amber-500 text-white font-black font-sans uppercase tracking-widest text-[10px] px-5 py-2.5 rounded-full border-2 border-art-border shadow-md">
                  <Sparkles className="text-amber-200 w-4 h-4" />
                  <span>Plano de Acomodación</span>
                </div>

                <div className="mt-4 mb-3">
                  <h3 className="text-2xl font-serif font-black italic text-art-heading">
                    Solución de la Caja
                  </h3>
                  <p className="text-[10px] uppercase tracking-wider font-sans font-black text-art-accent">
                    Coloca los gatos en estas posiciones exactas
                  </p>
                </div>

                {/* Main mini-map view */}
                <div className="bg-[#ebdcb8]/40 p-4 rounded-3xl border-2 border-art-accent/20 my-4 flex items-center justify-center">
                  <div
                    className="grid gap-1 rounded-xl overflow-hidden p-2 bg-[#d3c2a5] shadow-[inner_0px_3px_8px_rgba(0,0,0,0.1)]"
                    style={{
                      gridTemplateRows: `repeat(${boxRows}, 42px)`,
                      gridTemplateColumns: `repeat(${boxCols}, 42px)`,
                    }}
                  >
                    {solutionGrid.map((rowArr, r) =>
                      rowArr.map((cell, c) => {
                        if (!cell) {
                          // Empty
                          return (
                            <div
                              key={`sol-empty-${r}-${c}`}
                              className="w-[42px] h-[42px] bg-[#eddcb8]/60 border border-[#d4c3a3]/40 rounded-lg"
                            />
                          );
                        }

                        if (cell.type === 'obstacle') {
                          // Obstacle
                          return (
                            <div
                              key={`sol-obs-${r}-${c}`}
                              className="w-[42px] h-[42px] bg-[#eddcb8]/30 border border-[#d4c3a3]/30 rounded-lg flex items-center justify-center opacity-60"
                            >
                              <span className="text-sm">🐾</span>
                            </div>
                          );
                        }

                        // Cat block
                        const { cat, isHead } = cell;
                        return (
                          <div
                            key={`sol-cat-${r}-${c}`}
                            className="w-[42px] h-[42px] rounded-lg border-2 border-[#78350f] flex flex-col items-center justify-center text-center font-bold font-mono transition-transform duration-200"
                            style={{
                              backgroundColor: cat.style.baseColor,
                              color: '#78350f',
                            }}
                          >
                            {isHead ? (
                              <span className="text-[10px] tracking-tighter select-none font-bold">
                                {faceEmoticons[cat.style.faceExpression as 'cute' | 'derp' | 'sleepy' | 'happy'] || "◕‿◕"}
                              </span>
                            ) : (
                              <span className="text-[8px] opacity-40 uppercase">
                                {cat.name[0]}
                              </span>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Legend list of cats */}
                <div className="bg-white p-3 rounded-2xl border border-art-border text-left space-y-2 mb-4 overflow-y-auto max-h-[150px]">
                  <p className="text-[9px] uppercase tracking-wider font-sans font-black text-art-accent/70 text-center mb-1">
                    Gatitos Participantes
                  </p>
                  {currentLevel.cats.map((cat) => (
                    <div key={`legend-${cat.id}`} className="flex items-center gap-2 text-xs">
                      <div
                        className="w-4 h-4 rounded-full border border-[#78350f]"
                        style={{ backgroundColor: cat.style.baseColor }}
                      />
                      <span className="font-bold text-art-text/90">
                        {cat.name}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-2 mt-auto">
                  <button
                    onClick={handleApplySolution}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-sans font-bold uppercase tracking-widest py-3 px-6 rounded-2xl shadow-md border-b-4 border-amber-700 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
                    id="apply-solution-btn"
                  >
                    <Sparkles size={14} className="fill-amber-100" />
                    <span>Resolver Automáticamente</span>
                  </button>

                  <button
                    onClick={() => { playClick(); setShowSolutionModal(false); }}
                    className="w-full bg-art-light hover:bg-white text-art-text font-sans font-bold uppercase tracking-widest py-2.5 px-6 rounded-2xl border border-art-border transition-all active:scale-[0.98] cursor-pointer text-xs"
                    id="close-solution-btn"
                  >
                    Cerrar
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </div>

  );
}
