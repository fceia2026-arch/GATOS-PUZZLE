import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CatPiece as CatType, Coords } from '../types';
import { getRotatedBlocks, getBoundingBox } from '../utils/grid';
import { RotateCw, HelpCircle } from 'lucide-react';

interface CatPieceProps {
  cat: CatType;
  cellSize: number;
  isDragging?: boolean;
  isSelected?: boolean;
  isPlaced?: boolean;
  isValidPlacePreview?: boolean;
  isPreview?: boolean; // If rendered as a transparent preview shadow
  onPointerDown?: (e: React.PointerEvent<HTMLDivElement>, catId: string) => void;
  onRotate?: (catId: string) => void;
}

export const CatPiece: React.FC<CatPieceProps> = ({
  cat,
  cellSize,
  isDragging = false,
  isSelected = false,
  isPlaced = false,
  isValidPlacePreview = true,
  isPreview = false,
  onPointerDown,
  onRotate,
}) => {
  const [hovered, setHovered] = useState(false);
  const rotatedBlocks = getRotatedBlocks(cat.blocks, cat.rotation);
  const { rows, cols } = getBoundingBox(rotatedBlocks);

  // SVG Padding to avoid clipping ears and tails
  const padding = 18;
  const svgWidth = cols * cellSize + padding * 2;
  const svgHeight = rows * cellSize + padding * 2;

  // Colors
  const baseColor = cat.style.baseColor;
  const patternColor = cat.style.patternColor;

  // Determine which blocks are head, tail, and body
  // Head is the first block in our sorted list (top-most, left-most)
  // Tail is the last block in our sorted list (bottom-most, right-most)
  const headBlock = rotatedBlocks[0];
  const tailBlock = rotatedBlocks[rotatedBlocks.length - 1];

  // Identifiers for SVG patterns
  const patternId = `cat-pattern-${cat.id}-${cat.rotation}`;

  const renderPatterns = () => {
    if (cat.style.pattern === 'stripes') {
      return (
        <pattern id={patternId} width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="20" height="20" fill={baseColor} />
          <line x1="0" y1="0" x2="0" y2="20" stroke={patternColor} strokeWidth="5" />
        </pattern>
      );
    }
    if (cat.style.pattern === 'spots') {
      return (
        <pattern id={patternId} width="24" height="24" patternUnits="userSpaceOnUse">
          <rect width="24" height="24" fill={baseColor} />
          <circle cx="6" cy="6" r="4" fill={patternColor} />
          <circle cx="18" cy="18" r="3" fill={patternColor} />
        </pattern>
      );
    }
    if (cat.style.pattern === 'calico') {
      return (
        <pattern id={patternId} width="40" height="40" patternUnits="userSpaceOnUse">
          <rect width="40" height="40" fill={baseColor} />
          {/* Patch 1: Ginger orange */}
          <path d="M 0,10 Q 15,0 20,20 Q 10,35 0,30 Z" fill="#F97316" opacity="0.85" />
          {/* Patch 2: Charcoal grey */}
          <path d="M 25,25 Q 40,15 35,40 Q 20,40 25,25 Z" fill="#475569" opacity="0.9" />
          <circle cx="12" cy="32" r="5" fill="#475569" opacity="0.9" />
          <circle cx="30" cy="5" r="4" fill="#F97316" opacity="0.85" />
        </pattern>
      );
    }
    // Solid
    return null;
  };

  const getFill = () => {
    if (cat.style.pattern === 'solid') {
      return baseColor;
    }
    return `url(#${patternId})`;
  };

  // Helper to get coordinates for a block inside the padded SVG
  const getBlockCoords = (b: Coords) => {
    return {
      x: b.c * cellSize + padding,
      y: b.r * cellSize + padding,
    };
  };

  return (
    <div
      className={`relative select-none touch-none ${isPreview ? 'pointer-events-none opacity-40' : 'cursor-grab active:cursor-grabbing'}`}
      style={{
        width: `${cols * cellSize}px`,
        height: `${rows * cellSize}px`,
      }}
      onPointerDown={(e) => {
        if (!isPreview && onPointerDown) {
          onPointerDown(e, cat.id);
        }
      }}
      onMouseEnter={() => !isPreview && setHovered(true)}
      onMouseLeave={() => !isPreview && setHovered(false)}
    >
      {/* SVG rendering of the cat */}
      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        style={{
          position: 'absolute',
          top: `-${padding}px`,
          left: `-${padding}px`,
          overflow: 'visible',
        }}
      >
        <defs>
          {renderPatterns()}
          {/* Drop shadow for non-previews */}
          {!isPreview && (
            <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="1" dy="3" stdDeviation="3" floodOpacity="0.18" floodColor="#451a03" />
            </filter>
          )}
        </defs>

        <g filter={!isPreview ? "url(#shadow)" : undefined}>
          {/* 1. DRAW NON-HEAD BODY BLOCKS */}
          {rotatedBlocks.map((b, idx) => {
            const isHead = b.r === headBlock.r && b.c === headBlock.c;
            if (isHead) return null;
            const { x, y } = getBlockCoords(b);

            return (
              <g key={`body-${idx}`}>
                {/* Underlay shadow for depth */}
                <rect
                  x={x + 2}
                  y={y + 2}
                  width={cellSize - 4}
                  height={cellSize - 4}
                  rx={cellSize * 0.25}
                  fill="#78350f"
                  opacity={isPreview ? 0 : 0.08}
                />
                {/* Main block body */}
                <rect
                  x={x + 1}
                  y={y + 1}
                  width={cellSize - 2}
                  height={cellSize - 2}
                  rx={cellSize * 0.22}
                  fill={getFill()}
                  stroke={isPreview ? (isValidPlacePreview ? '#22c55e' : '#ef4444') : '#78350f'}
                  strokeWidth={isPreview ? 3 : 2}
                />
              </g>
            );
          })}

          {/* 2. DRAW CONNECTORS BETWEEN ADJACENT BLOCKS (To make it look like one seamless cat) */}
          {rotatedBlocks.map((b1, idx) => {
            // Find neighbors in rotated blocks
            return rotatedBlocks.map((b2, idx2) => {
              if (idx2 <= idx) return null;
              const isAdjacent =
                (Math.abs(b1.r - b2.r) === 1 && b1.c === b2.c) ||
                (Math.abs(b1.c - b2.c) === 1 && b1.r === b2.r);

              if (!isAdjacent) return null;

              const c1 = getBlockCoords(b1);
              const c2 = getBlockCoords(b2);

              const startX = Math.min(c1.x, c2.x) + 3;
              const endX = Math.max(c1.x, c2.x) + cellSize - 3;
              const startY = Math.min(c1.y, c2.y) + 3;
              const endY = Math.max(c1.y, c2.y) + cellSize - 3;

              const width = endX - startX;
              const height = endY - startY;

              return (
                <rect
                  key={`connector-${idx}-${idx2}`}
                  x={startX}
                  y={startY}
                  width={width}
                  height={height}
                  fill={getFill()}
                  stroke="none"
                />
              );
            });
          })}

          {/* 3. DRAW HEAD BODY BLOCK (On top of connectors to ensure no patterns on the face) */}
          {(() => {
            const { x, y } = getBlockCoords(headBlock);
            return (
              <g key="body-head">
                {/* Underlay shadow for depth */}
                <rect
                  x={x + 2}
                  y={y + 2}
                  width={cellSize - 4}
                  height={cellSize - 4}
                  rx={cellSize * 0.25}
                  fill="#78350f"
                  opacity={isPreview ? 0 : 0.08}
                />
                {/* Main block body */}
                <rect
                  x={x + 1}
                  y={y + 1}
                  width={cellSize - 2}
                  height={cellSize - 2}
                  rx={cellSize * 0.22}
                  fill={baseColor}
                  stroke={isPreview ? (isValidPlacePreview ? '#22c55e' : '#ef4444') : '#78350f'}
                  strokeWidth={isPreview ? 3 : 2}
                />
              </g>
            );
          })()}

          {/* 3. DRAW TAIL (Attached to the tail block) */}
          {(() => {
            const { x, y } = getBlockCoords(tailBlock);
            const tailCenterX = x + cellSize / 2;
            const tailCenterY = y + cellSize / 2;

            // Tail styling path
            let dPath = `M ${tailCenterX} ${tailCenterY} Q ${tailCenterX + 25} ${tailCenterY - 15} ${tailCenterX + 15} ${tailCenterY - 35}`;
            if (cat.style.tailType === 'curly') {
              dPath = `M ${tailCenterX} ${tailCenterY} C ${tailCenterX + 20} ${tailCenterY + 20} ${tailCenterX + 35} ${tailCenterY - 10} ${tailCenterX + 15} ${tailCenterY - 30}`;
            } else if (cat.style.tailType === 'fluffy') {
              dPath = `M ${tailCenterX} ${tailCenterY} Q ${tailCenterX + 15} ${tailCenterY - 20} ${tailCenterX + 20} ${tailCenterY - 30}`;
            }

            return (
              <motion.path
                d={dPath}
                fill="none"
                stroke={baseColor}
                strokeWidth={cat.style.tailType === 'fluffy' ? 14 : 9}
                strokeLinecap="round"
                animate={isPreview ? {} : {
                  rotate: [0, 8, -6, 8, 0],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{ originX: `${tailCenterX}px`, originY: `${tailCenterY}px` }}
              />
            );
          })()}

          {/* 4. DRAW HEAD PARTS (Attached to head block) */}
          {(() => {
            const { x, y } = getBlockCoords(headBlock);
            const headCenterX = x + cellSize / 2;
            const headCenterY = y + cellSize / 2;

            // Breathing scaling group for the head & face to look alive!
            return (
              <motion.g
                animate={isPreview ? {} : {
                  scale: [1, 1.02, 1],
                  y: [0, -0.5, 0]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{ originX: `${headCenterX}px`, originY: `${headCenterY}px` }}
              >
                {/* Ears */}
                {cat.style.earsType === 'pointy' && (
                  <>
                    {/* Left Ear */}
                    <path
                      d={`M ${x + 8} ${y + 12} L ${x - 4} ${y - 12} L ${x + 22} ${y + 4} Z`}
                      fill={baseColor}
                      stroke="#78350f"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                    <path
                      d={`M ${x + 11} ${y + 10} L ${x - 1} ${y - 6} L ${x + 20} ${y + 5} Z`}
                      fill="#FDA4AF" // Pink inner ear
                    />
                    {/* Right Ear */}
                    <path
                      d={`M ${x + cellSize - 8} ${y + 12} L ${x + cellSize + 4} ${y - 12} L ${x + cellSize - 22} ${y + 4} Z`}
                      fill={baseColor}
                      stroke="#78350f"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                    <path
                      d={`M ${x + cellSize - 11} ${y + 10} L ${x + cellSize + 1} ${y - 6} L ${x + cellSize - 20} ${y + 5} Z`}
                      fill="#FDA4AF"
                    />
                  </>
                )}

                {cat.style.earsType === 'round' && (
                  <>
                    {/* Left Round Ear */}
                    <circle cx={x + 10} cy={y + 6} r="10" fill={baseColor} stroke="#78350f" strokeWidth="2" />
                    <circle cx={x + 10} cy={y + 6} r="6" fill="#FDA4AF" />
                    {/* Right Round Ear */}
                    <circle cx={x + cellSize - 10} cy={y + 6} r="10" fill={baseColor} stroke="#78350f" strokeWidth="2" />
                    <circle cx={x + cellSize - 10} cy={y + 6} r="6" fill="#FDA4AF" />
                  </>
                )}

                {cat.style.earsType === 'folded' && (
                  <>
                    {/* Folded ears are folded forward */}
                    <path
                      d={`M ${x + 6} ${y + 14} L ${x + 2} ${y + 2} L ${x + 18} ${y + 8} Z`}
                      fill={baseColor}
                      stroke="#78350f"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                    <path
                      d={`M ${x + cellSize - 6} ${y + 14} L ${x + cellSize - 2} ${y + 2} L ${x + cellSize - 18} ${y + 8} Z`}
                      fill={baseColor}
                      stroke="#78350f"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                  </>
                )}

                {/* Face expressions details */}
                {/* Eyes */}
                {(() => {
                  const leftEyeX = headCenterX - 11;
                  const rightEyeX = headCenterX + 11;
                  const eyeY = headCenterY - 4;

                  const expression = isPlaced ? 'happy' : isDragging ? 'dizzy' : cat.style.faceExpression;

                  if (expression === 'sleepy') {
                    // Sleepy curves (n n)
                    return (
                      <>
                        <path d={`M ${leftEyeX - 4} ${eyeY} Q ${leftEyeX} ${eyeY + 3} ${leftEyeX + 4} ${eyeY}`} fill="none" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
                        <path d={`M ${rightEyeX - 4} ${eyeY} Q ${rightEyeX} ${eyeY + 3} ${rightEyeX + 4} ${eyeY}`} fill="none" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
                      </>
                    );
                  }
                  if (expression === 'happy') {
                    // Happy arches (^ ^)
                    return (
                      <>
                        <path d={`M ${leftEyeX - 4} ${eyeY + 1} Q ${leftEyeX} ${eyeY - 2} ${leftEyeX + 4} ${eyeY + 1}`} fill="none" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
                        <path d={`M ${rightEyeX - 4} ${eyeY + 1} Q ${rightEyeX} ${eyeY - 2} ${rightEyeX + 4} ${eyeY + 1}`} fill="none" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
                      </>
                    );
                  }
                  if (expression === 'dizzy') {
                    // Dizzy crosses (x x)
                    return (
                      <>
                        {/* Left X */}
                        <line x1={leftEyeX - 3} y1={eyeY - 3} x2={leftEyeX + 3} y2={eyeY + 3} stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
                        <line x1={leftEyeX + 3} y1={eyeY - 3} x2={leftEyeX - 3} y2={eyeY + 3} stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
                        {/* Right X */}
                        <line x1={rightEyeX - 3} y1={eyeY - 3} x2={rightEyeX + 3} y2={eyeY + 3} stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
                        <line x1={rightEyeX + 3} y1={eyeY - 3} x2={rightEyeX - 3} y2={eyeY + 3} stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
                      </>
                    );
                  }
                  if (expression === 'derp') {
                    // Derpy mismatching eyes
                    return (
                      <>
                        <circle cx={leftEyeX} cy={eyeY} r="4" fill="white" stroke="#78350f" strokeWidth="1.5" />
                        <circle cx={leftEyeX - 1} cy={eyeY - 1} r="1.5" fill="black" />
                        <circle cx={rightEyeX} cy={eyeY + 1} r="5.5" fill="white" stroke="#78350f" strokeWidth="1.5" />
                        <circle cx={rightEyeX + 1} cy={eyeY + 2} r="1.5" fill="black" />
                      </>
                    );
                  }
                  // Cute / default wide eyes
                  return (
                    <>
                      <circle cx={leftEyeX} cy={eyeY} r="3.5" fill="#78350f" />
                      <circle cx={leftEyeX - 1.2} cy={eyeY - 1.2} r="1" fill="white" /> {/* highlight */}
                      <circle cx={rightEyeX} cy={eyeY} r="3.5" fill="#78350f" />
                      <circle cx={rightEyeX - 1.2} cy={eyeY - 1.2} r="1" fill="white" /> {/* highlight */}
                    </>
                  );
                })()}

                {/* Nose */}
                <polygon
                  points={`${headCenterX - 2},${headCenterY + 1} ${headCenterX + 2},${headCenterY + 1} ${headCenterX},${headCenterY + 3}`}
                  fill="#FDA4AF"
                />

                {/* Mouth (w shape) */}
                <path
                  d={`M ${headCenterX - 4} ${headCenterY + 4} Q ${headCenterX - 2} ${headCenterY + 6.5} ${headCenterX} ${headCenterY + 4} Q ${headCenterX + 2} ${headCenterY + 6.5} ${headCenterX + 4} ${headCenterY + 4}`}
                  fill="none"
                  stroke="#78350f"
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                {/* Pink cheeks */}
                <circle cx={headCenterX - 15} cy={headCenterY + 1} r="3.5" fill="#FDA4AF" opacity="0.6" />
                <circle cx={headCenterX + 15} cy={headCenterY + 1} r="3.5" fill="#FDA4AF" opacity="0.6" />

                {/* Whiskers */}
                {/* Left side whiskers */}
                <line x1={x + 3} y1={headCenterY} x2={x - 6} y2={headCenterY - 1.5} stroke="#78350f" strokeWidth="1.5" strokeLinecap="round" opacity="0.75" />
                <line x1={x + 3} y1={headCenterY + 3} x2={x - 7} y2={headCenterY + 3} stroke="#78350f" strokeWidth="1.5" strokeLinecap="round" opacity="0.75" />
                <line x1={x + 3} y1={headCenterY + 6} x2={x - 5} y2={headCenterY + 7.5} stroke="#78350f" strokeWidth="1.5" strokeLinecap="round" opacity="0.75" />

                {/* Right side whiskers */}
                <line x1={x + cellSize - 3} y1={headCenterY} x2={x + cellSize + 6} y2={headCenterY - 1.5} stroke="#78350f" strokeWidth="1.5" strokeLinecap="round" opacity="0.75" />
                <line x1={x + cellSize - 3} y1={headCenterY + 3} x2={x + cellSize + 7} y2={headCenterY + 3} stroke="#78350f" strokeWidth="1.5" strokeLinecap="round" opacity="0.75" />
                <line x1={x + cellSize - 3} y1={headCenterY + 6} x2={x + cellSize + 5} y2={headCenterY + 7.5} stroke="#78350f" strokeWidth="1.5" strokeLinecap="round" opacity="0.75" />
              </motion.g>
            );
          })()}
        </g>
      </svg>

      {/* Floating Mini Action Toolbar on Hover or Selection */}
      {!isPreview && (hovered || isSelected) && !isDragging && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-amber-950/90 text-amber-50 py-1 px-2.5 rounded-full shadow-lg z-30 text-xs backdrop-blur-sm border border-amber-800/50 transition-all duration-200">
          <span className="font-medium mr-1">{cat.name.split(' ')[0]}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onRotate) onRotate(cat.id);
            }}
            className="p-1 hover:bg-amber-800 rounded-full transition-colors cursor-pointer text-amber-300"
            title="Rotar gato (90°)"
          >
            <RotateCw size={13} />
          </button>
        </div>
      )}
    </div>
  );
};
