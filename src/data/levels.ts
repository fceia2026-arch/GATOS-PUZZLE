import { Level, CatPiece, Obstacle } from '../types';

// Helper to generate a unique cat piece
function createCat(
  id: string,
  name: string,
  blocks: { r: number; c: number }[],
  baseColor: string,
  patternColor: string,
  pattern: 'stripes' | 'spots' | 'solid' | 'calico',
  earsType: 'pointy' | 'round' | 'folded',
  tailType: 'curly' | 'straight' | 'fluffy',
  faceExpression: 'cute' | 'derp' | 'sleepy' | 'happy'
): CatPiece {
  return {
    id,
    name,
    blocks,
    rotation: 0,
    gridX: null,
    gridY: null,
    style: {
      earsType,
      tailType,
      pattern,
      patternColor,
      baseColor,
      faceExpression,
    },
  };
}

export const LEVELS: Level[] = [
  {
    id: 1,
    name: "La Cajita de Bienvenida",
    difficulty: "Principiante",
    boxRows: 3,
    boxCols: 3,
    description: "¡Acomoda a estos 3 pequeños amigos en su primera caja de cartón!",
    obstacles: [],
    cats: [
      createCat(
        "cat-1-1",
        "Mochi (Gato Salchicha)",
        [{ r: 0, c: 0 }, { r: 0, c: 1 }],
        "#FFFFFF", // white base
        "#E2E8F0", // soft light gray
        "solid",
        "pointy",
        "straight",
        "cute"
      ),
      createCat(
        "cat-1-2",
        "Simba (Gato Regordete)",
        [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 1, c: 0 }, { r: 1, c: 1 }],
        "#9CA3AF", // classy medium-light gray base
        "#4B5563", // elegant slate grey details
        "solid",
        "round",
        "fluffy",
        "happy"
      ),
      createCat(
        "cat-1-3",
        "Kiko (Gato Estirado)",
        [{ r: 0, c: 0 }, { r: 1, c: 0 }, { r: 2, c: 0 }],
        "#FFFFFF", // white base
        "#111827", // black spots
        "spots",
        "folded",
        "curly",
        "sleepy"
      )
    ]
  },
  {
    id: 2,
    name: "Rincón de Siesta",
    difficulty: "Principiante",
    boxRows: 4,
    boxCols: 4,
    description: "¡Cuidado! Hay una pelota de lana roja en la esquina. ¡A los gatos les encanta, pero ocupa espacio!",
    obstacles: [
      { r: 0, c: 0, type: "yarn" }
    ],
    cats: [
      createCat(
        "cat-2-1",
        "Fideo (Gato Largo)",
        [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 0, c: 3 }],
        "#93C5FD", // soft blue-gray
        "#1D4ED8", // deep blue
        "stripes",
        "pointy",
        "straight",
        "cute"
      ),
      createCat(
        "cat-2-2",
        "Botas (Gato Gancho)",
        [{ r: 0, c: 0 }, { r: 1, c: 0 }, { r: 2, c: 0 }, { r: 2, c: 1 }],
        "#FCA5A5", // soft pinky-peach
        "#DC2626", // dark red
        "calico",
        "pointy",
        "curly",
        "derp"
      ),
      createCat(
        "cat-2-3",
        "Waffles (Gato Baguette)",
        [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }],
        "#F9A8D4", // light pink
        "#BE185D", // dark pink
        "solid",
        "folded",
        "fluffy",
        "sleepy"
      ),
      createCat(
        "cat-2-4",
        "Boliche (Gato Copo)",
        [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 1, c: 0 }, { r: 1, c: 1 }],
        "#F8FAFC", // pure white
        "#CBD5E1", // light gray
        "spots",
        "round",
        "curly",
        "happy"
      )
    ]
  },
  {
    id: 3,
    name: "El Escondite Secreto",
    difficulty: "Intermedio",
    boxRows: 4,
    boxCols: 5,
    description: "Un espacio rectangular perfecto, excepto por un ratón de juguete. ¡Combina las formas astutamente!",
    obstacles: [
      { r: 3, c: 4, type: "toy-mouse" }
    ],
    cats: [
      createCat(
        "cat-3-1",
        "Esfinge (Gato Esfinge T)",
        [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 1, c: 1 }],
        "#C084FC", // soft lavender
        "#7E22CE", // deep purple
        "stripes",
        "pointy",
        "straight",
        "cute"
      ),
      createCat(
        "cat-3-2",
        "Rayo (Gato Zigzag)",
        [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 2 }],
        "#FDBA74", // peach-orange
        "#374151", // dark grey calico spots
        "calico",
        "folded",
        "curly",
        "happy"
      ),
      createCat(
        "cat-3-3",
        "Pirata (Gato L)",
        [{ r: 0, c: 0 }, { r: 1, c: 0 }, { r: 2, c: 0 }, { r: 2, c: 1 }],
        "#A7F3D0", // soft mint green
        "#047857", // forest green
        "stripes",
        "pointy",
        "fluffy",
        "derp"
      ),
      createCat(
        "cat-3-4",
        "Bizcocho (Gato Pelota)",
        [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 1, c: 0 }, { r: 1, c: 1 }],
        "#FCD34D", // golden cream
        "#D97706", // amber spots
        "spots",
        "round",
        "curly",
        "sleepy"
      ),
      createCat(
        "cat-3-5",
        "Rollito (Gato Salchicha)",
        [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }],
        "#DDD6FE", // light blue-violet
        "#6D28D9", // deep violet
        "solid",
        "round",
        "straight",
        "cute"
      )
    ]
  },
  {
    id: 4,
    name: "Mudanza Caótica",
    difficulty: "Intermedio",
    boxRows: 4,
    boxCols: 6,
    description: "¡Seis felinos en una caja mediana! Evita el esqueleto de pescado y el ovillo de lana.",
    obstacles: [
      { r: 0, c: 5, type: "fishbone" },
      { r: 3, c: 0, type: "yarn" }
    ],
    cats: [
      createCat(
        "cat-4-1",
        "Largo (Gato Fideo)",
        [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 0, c: 3 }],
        "#FCA5A5", // rose pink
        "#B91C1C", // rose stripes
        "stripes",
        "pointy",
        "straight",
        "cute"
      ),
      createCat(
        "cat-4-2",
        "Regordete (Gato Sumor)",
        [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 1, c: 0 }, { r: 1, c: 1 }],
        "#FDE047", // yellow
        "#CA8A04", // dark yellow spots
        "spots",
        "round",
        "fluffy",
        "happy"
      ),
      createCat(
        "cat-4-3",
        "Pitas (Gato Gancho L)",
        [{ r: 0, c: 0 }, { r: 1, c: 0 }, { r: 2, c: 0 }, { r: 2, c: 1 }],
        "#93C5FD", // light blue
        "#2563EB", // deep blue
        "solid",
        "folded",
        "curly",
        "derp"
      ),
      createCat(
        "cat-4-4",
        "Pirueta (Gato Esfinge T)",
        [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 1, c: 1 }],
        "#F9A8D4", // magenta/pink
        "#BE185D", // spots
        "calico",
        "pointy",
        "curly",
        "sleepy"
      ),
      createCat(
        "cat-4-5",
        "Mini (Gato Pelusa)",
        [{ r: 0, c: 0 }, { r: 0, c: 1 }],
        "#E2E8F0", // white
        "#475569", // grey stripes
        "stripes",
        "round",
        "straight",
        "cute"
      ),
      createCat(
        "cat-4-6",
        "Saltón (Gato Zigzag Z)",
        [{ r: 0, c: 1 }, { r: 0, c: 2 }, { r: 1, c: 0 }, { r: 1, c: 1 }],
        "#A7F3D0", // mint
        "#047857", // dark spots
        "spots",
        "folded",
        "fluffy",
        "happy"
      )
    ]
  },
  {
    id: 5,
    name: "Gatopocalipsis Cómodo",
    difficulty: "Avanzado",
    boxRows: 5,
    boxCols: 5,
    description: "¡Siete gatos de todos los tamaños posibles! Es el rompecabezas definitivo para los amantes de los felinos.",
    obstacles: [
      { r: 2, c: 2, type: "fishbone" },
      { r: 4, c: 4, type: "toy-mouse" }
    ],
    cats: [
      createCat(
        "cat-5-1",
        "Copito (Pelusa 1x1)",
        [{ r: 0, c: 0 }],
        "#F8FAFC", // white
        "#94A3B8", // gray
        "solid",
        "round",
        "fluffy",
        "happy"
      ),
      createCat(
        "cat-5-2",
        "Oreo (Gato Cuadrado)",
        [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 1, c: 0 }, { r: 1, c: 1 }],
        "#FDBA74", // peach
        "#1E293B", // black spots
        "calico",
        "pointy",
        "curly",
        "cute"
      ),
      createCat(
        "cat-5-3",
        "Canela (Rollito 1x3)",
        [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }],
        "#FCD34D", // amber-gold
        "#B45309", // dark brown stripes
        "stripes",
        "folded",
        "straight",
        "sleepy"
      ),
      createCat(
        "cat-5-4",
        "Milo (Esquinero L 3x)",
        [{ r: 0, c: 0 }, { r: 1, c: 0 }, { r: 1, c: 1 }],
        "#E9D5FF", // mauve
        "#701A75", // deep mauve
        "spots",
        "round",
        "curly",
        "derp"
      ),
      createCat(
        "cat-5-5",
        "Aero (Gato T 4x)",
        [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 1, c: 1 }],
        "#A5F3FC", // cyan soft
        "#0891B2", // dark cyan
        "stripes",
        "pointy",
        "fluffy",
        "happy"
      ),
      createCat(
        "cat-5-6",
        "Ziggy (Gato Z 4x)",
        [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 2 }],
        "#FCA5A5", // coral pink
        "#B91C1C", // crimson
        "solid",
        "folded",
        "straight",
        "cute"
      ),
      createCat(
        "cat-5-7",
        "Manolo (Gato Largo 1x4)",
        [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 0, c: 3 }],
        "#CBD5E1", // blue gray
        "#334155", // dark gray spots
        "spots",
        "pointy",
        "curly",
        "sleepy"
      )
    ]
  }
];
