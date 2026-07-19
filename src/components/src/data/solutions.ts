export interface CatSolution {
  catId: string;
  gridX: number;
  gridY: number;
  rotation: number;
}

export const SOLUTIONS: { [levelId: number]: CatSolution[] } = {
  1: [
    { catId: "cat-1-1", gridX: 0, gridY: 0, rotation: 0 },
    { catId: "cat-1-2", gridX: 1, gridY: 0, rotation: 0 },
    { catId: "cat-1-3", gridX: 0, gridY: 2, rotation: 0 }
  ],
  2: [
    { catId: "cat-2-1", gridX: 3, gridY: 0, rotation: 0 },
    { catId: "cat-2-2", gridX: 0, gridY: 1, rotation: 180 },
    { catId: "cat-2-3", gridX: 0, gridY: 3, rotation: 90 },
    { catId: "cat-2-4", gridX: 1, gridY: 0, rotation: 0 }
  ],
  3: [
    { catId: "cat-3-1", gridX: 0, gridY: 2, rotation: 0 },
    { catId: "cat-3-2", gridX: 1, gridY: 3, rotation: 90 },
    { catId: "cat-3-3", gridX: 1, gridY: 0, rotation: 270 },
    { catId: "cat-3-4", gridX: 0, gridY: 0, rotation: 0 },
    { catId: "cat-3-5", gridX: 3, gridY: 0, rotation: 0 }
  ],
  4: [
    { catId: "cat-4-1", gridX: 0, gridY: 0, rotation: 0 },
    { catId: "cat-4-2", gridX: 1, gridY: 0, rotation: 0 },
    { catId: "cat-4-3", gridX: 0, gridY: 2, rotation: 270 },
    { catId: "cat-4-4", gridX: 1, gridY: 4, rotation: 90 },
    { catId: "cat-4-5", gridX: 3, gridY: 3, rotation: 0 },
    { catId: "cat-4-6", gridX: 2, gridY: 1, rotation: 0 }
  ],
  5: [
    { catId: "cat-5-1", gridX: 0, gridY: 0, rotation: 0 },
    { catId: "cat-5-2", gridX: 0, gridY: 2, rotation: 0 },
    { catId: "cat-5-3", gridX: 4, gridY: 0, rotation: 0 },
    { catId: "cat-5-4", gridX: 2, gridY: 0, rotation: 270 },
    { catId: "cat-5-5", gridX: 2, gridY: 2, rotation: 90 },
    { catId: "cat-5-6", gridX: 0, gridY: 0, rotation: 90 },
    { catId: "cat-5-7", gridX: 0, gridY: 4, rotation: 90 }
  ]
};
