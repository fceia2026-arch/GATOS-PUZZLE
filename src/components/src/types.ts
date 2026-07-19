export interface Coords {
  r: number; // Row index
  c: number; // Col index
}

export type CatEyeType = 'sleepy' | 'happy' | 'alert' | 'dizzy' | 'wink';

export interface CatStyle {
  earsType: 'pointy' | 'round' | 'folded';
  tailType: 'curly' | 'straight' | 'fluffy';
  pattern: 'stripes' | 'spots' | 'solid' | 'calico';
  patternColor: string;
  baseColor: string;
  faceExpression: 'cute' | 'derp' | 'sleepy' | 'happy';
}

export interface CatPiece {
  id: string;
  name: string;
  // Shape defined by relative cell offsets from the "pivot" block (0,0)
  blocks: Coords[];
  rotation: number; // 0, 90, 180, 270 degrees
  // Snapped grid coordinates in the box, or null if in inventory / free-floating
  gridX: number | null; // row index in box
  gridY: number | null; // col index in box
  style: CatStyle;
}

export interface Obstacle {
  r: number;
  c: number;
  type: 'yarn' | 'fishbone' | 'toy-mouse';
}

export interface Level {
  id: number;
  name: string;
  difficulty: 'Principiante' | 'Intermedio' | 'Avanzado';
  boxRows: number;
  boxCols: number;
  cats: CatPiece[];
  obstacles: Obstacle[]; // Obstacles that occupy cells inside the box
  description: string;
}

export interface GameState {
  currentLevelIndex: number;
  placedCats: { [catId: string]: Coords }; // snapped row and col
  inventoryCats: string[]; // list of cat IDs currently in the inventory
  selectedCatId: string | null;
  isCompleted: boolean;
  score: number;
  soundEnabled: boolean;
}
