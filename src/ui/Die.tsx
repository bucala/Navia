import type { CSSProperties } from 'react';

const PIP_LAYOUT: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

function Pips({ value }: { value: number }) {
  return (
    <>
      {Array.from({ length: 9 }, (_, i) => (
        <span
          key={i}
          className={`h-2 w-2 rounded-full ${
            PIP_LAYOUT[value]?.includes(i) ? (value === 6 ? 'bg-red-600' : 'bg-slate-900') : ''
          }`}
        />
      ))}
    </>
  );
}

/** Cube-face placement (half the die size = 1.75rem). */
const FACE_TRANSFORM: Record<number, string> = {
  1: 'rotateY(0deg) translateZ(1.75rem)',
  2: 'rotateY(90deg) translateZ(1.75rem)',
  3: 'rotateX(90deg) translateZ(1.75rem)',
  4: 'rotateX(-90deg) translateZ(1.75rem)',
  5: 'rotateY(-90deg) translateZ(1.75rem)',
  6: 'rotateY(180deg) translateZ(1.75rem)',
};

/** Cube rotation that brings the rolled face to the front. */
const SHOW_ROTATION: Record<number, { x: number; y: number }> = {
  1: { x: 0, y: 0 },
  2: { x: 0, y: -90 },
  3: { x: -90, y: 0 },
  4: { x: 90, y: 0 },
  5: { x: 0, y: 90 },
  6: { x: 0, y: 180 },
};

interface Props {
  value: number;
  /** Seconds to wait before tumbling (staggers chains). */
  delay?: number;
  /** Dim the discarded die of an advantage pair. */
  dim?: boolean;
}

/** A 3D D6 that tumbles in, bounces, and settles on `value` (GDD §6). */
export function Die3D({ value, delay = 0, dim = false }: Props) {
  const { x, y } = SHOW_ROTATION[value] ?? SHOW_ROTATION[1];
  return (
    <div className={`die-scene ${dim ? 'opacity-40' : ''}`}>
      <div
        className="die-cube"
        style={{ '--rx': `${x}deg`, '--ry': `${y}deg`, animationDelay: `${delay}s` } as CSSProperties}
      >
        {([1, 2, 3, 4, 5, 6] as const).map((face) => (
          <div key={face} className="die-face" style={{ transform: FACE_TRANSFORM[face] }}>
            <Pips value={face} />
          </div>
        ))}
      </div>
    </div>
  );
}
