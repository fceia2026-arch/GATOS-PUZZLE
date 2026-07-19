import { Coords, CatPiece, Obstacle } from '../types';

/**
 * Rotates a single coordinate (r, c) by 90 degrees clockwise.
 * (r, c) -> (c, -r)
 */
export function rotatePoint90(point: Coords): Coords {
  return { r: point.c, c: -point.r };
}

/**
 * Rotates a set of blocks by a given angle (0, 90, 180, 270)
 * and normalizes them so the top-left corner is at (0, 0).
 */
export function getRotatedBlocks(blocks: Coords[], rotation: number): Coords[] {
  // Normalize rotation to 0, 90, 180, 270
  const normalizedRotation = ((rotation % 360) + 360) % 360;
  const steps = Math.floor(normalizedRotation / 90);

  let rotated = [...blocks];
  for (let i = 0; i < steps; i++) {
    rotated = rotated.map(rotatePoint90);
  }

  // Find min row and min col
  let minR = Infinity;
  let minC = Infinity;
  rotated.forEach(b => {
    if (b.r < minR) minR = b.r;
    if (b.c < minC) minC = b.c;
  });

  // Normalize so minR and minC are at (0, 0)
  return rotated.map(b => ({
    r: b.r - minR,
    c: b.c - minC
  })).sort((a, b) => {
    if (a.r !== b.r) return a.r - b.r;
    return a.c - b.c;
  });
}

/**
 * Calculates the bounding box of a list of blocks
 */
export function getBoundingBox(blocks: Coords[]): { rows: number; cols: number } {
  let maxR = 0;
  let maxC = 0;
  blocks.forEach(b => {
    if (b.r > maxR) maxR = b.r;
    if (b.c > maxC) maxC = b.c;
  });
  return {
    rows: maxR + 1,
    cols: maxC + 1
  };
}

/**
 * Checks if a specific cat placed at (gridRow, gridCol) overlaps
 * with any obstacles or any other ALREADY PLACED cats in the box.
 * Also checks if it exceeds box boundaries.
 */
export function canPlaceCat(
  cat: CatPiece,
  gridRow: number,
  gridCol: number,
  boxRows: number,
  boxCols: number,
  obstacles: Obstacle[],
  otherCats: CatPiece[]
): boolean {
  const rotatedBlocks = getRotatedBlocks(cat.blocks, cat.rotation);

  for (const block of rotatedBlocks) {
    const targetR = gridRow + block.r;
    const targetC = gridCol + block.c;

    // 1. Boundary check
    if (targetR < 0 || targetR >= boxRows || targetC < 0 || targetC >= boxCols) {
      return false;
    }

    // 2. Obstacle check
    const hitsObstacle = obstacles.some(obs => obs.r === targetR && obs.c === targetC);
    if (hitsObstacle) return false;

    // 3. Overlap check with other placed cats
    for (const other of otherCats) {
      if (other.id === cat.id || other.gridX === null || other.gridY === null) {
        continue;
      }
      const otherRotatedBlocks = getRotatedBlocks(other.blocks, other.rotation);
      const isOverlapping = otherRotatedBlocks.some(otherBlock => {
        const otherTargetR = other.gridX! + otherBlock.r;
        const otherTargetC = other.gridY! + otherBlock.c;
        return otherTargetR === targetR && otherTargetC === targetC;
      });

      if (isOverlapping) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Checks if all grid spots in the box are covered.
 * Since obstacles occupy some spaces, they are excluded.
 * Returns true if the box is perfectly filled by cats.
 */
export function isLevelSolved(
  boxRows: number,
  boxCols: number,
  obstacles: Obstacle[],
  cats: CatPiece[]
): boolean {
  const totalCells = boxRows * boxCols;
  const obstacleCount = obstacles.length;
  const expectedCatCells = totalCells - obstacleCount;

  // Count placed cats' cells that are validly inside
  let placedCellsCount = 0;
  const cellTracker = new Set<string>();

  for (const cat of cats) {
    if (cat.gridX === null || cat.gridY === null) {
      return false; // Not all cats are placed!
    }

    const rotatedBlocks = getRotatedBlocks(cat.blocks, cat.rotation);
    for (const block of rotatedBlocks) {
      const r = cat.gridX + block.r;
      const c = cat.gridY + block.c;

      // Ensure block is inside the box
      if (r < 0 || r >= boxRows || c < 0 || c >= boxCols) {
        return false;
      }

      const key = `${r},${c}`;
      if (cellTracker.has(key)) {
        return false; // Overlap error!
      }
      cellTracker.add(key);

      // Ensure it doesn't overlap with obstacles
      const hitsObstacle = obstacles.some(obs => obs.r === r && obs.c === c);
      if (hitsObstacle) return false;

      placedCellsCount++;
    }
  }

  return placedCellsCount === expectedCatCells;
}
