import { useCallback, useRef, type CSSProperties, type PointerEvent, type ReactNode } from 'react';

/** Edge layers between the faces — enough for a solid edge at any angle. */
const SLICES = 8;

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** The unified card back shared by every card in the game. */
export function CardBack({ className = '' }: { className?: string }) {
  return (
    <img
      src="/art/frames/card-back.svg"
      alt=""
      aria-hidden="true"
      draggable={false}
      className={`h-full w-full rounded-[inherit] object-cover shadow-[0_4px_12px_rgba(0,0,0,0.7)] ${className}`}
    />
  );
}

interface Card3DProps {
  front: ReactNode;
  /** Defaults to the shared card back. */
  back?: ReactNode;
  /** Shows the back (rotated 180°). */
  flipped?: boolean;
  /** Edge thickness in px. */
  thickness?: number;
  /** Size + rounding classes; faces and edge inherit the border radius. */
  className?: string;
  style?: CSSProperties;
}

/**
 * A card with physical volume: front, back and a gilded edge in real 3D.
 * Tilt/spin are CSS variables on the root (see `.card3d` in styles.css), so
 * pointer tracking never re-renders React.
 */
export function Card3D({ front, back, flipped = false, thickness = 4, className = '', style }: Card3DProps) {
  return (
    <div
      className={`card3d ${className}`}
      style={{ ['--card-t' as string]: `${thickness}px`, ['--flip' as string]: flipped ? '180deg' : '0deg', ...style }}
    >
      <div className="card3d__body">
        {Array.from({ length: SLICES }, (_, i) => (
          <span
            key={i}
            aria-hidden="true"
            className="card3d__slice"
            style={{ ['--z' as string]: (i / (SLICES - 1) - 0.5).toFixed(3) }}
          />
        ))}
        <div className="card3d__face card3d__front">
          {front}
          <span className="card3d__glare" aria-hidden="true" />
        </div>
        <div className="card3d__face card3d__back">{back ?? <CardBack />}</div>
      </div>
    </div>
  );
}

/** Writes tilt variables onto the closest `.card3d` inside `el`. */
function setTilt(el: HTMLElement, rx: number, ry: number, glare: number) {
  const card = (el.classList.contains('card3d') ? el : el.querySelector('.card3d')) as HTMLElement | null;
  if (!card) return;
  card.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
  card.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
  card.style.setProperty('--rx-num', rx.toFixed(2));
  card.style.setProperty('--ry-num', ry.toFixed(2));
  card.style.setProperty('--glare', String(glare));
}

/**
 * Mouse/pen tilt that makes a card lean toward the pointer, showing its edge.
 * Touch is ignored (a finger on a card means "select" or "scroll").
 */
export function useCardTilt(maxDeg = 12) {
  const tracking = useRef(false);

  const onPointerMove = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      if (e.pointerType === 'touch' || prefersReducedMotion()) return;
      const el = e.currentTarget;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      if (!tracking.current) {
        tracking.current = true;
        el.querySelector('.card3d')?.classList.add('card3d--tracking');
      }
      setTilt(el, -y * maxDeg * 2, x * maxDeg * 2, 1);
    },
    [maxDeg],
  );

  const onPointerLeave = useCallback((e: PointerEvent<HTMLElement>) => {
    tracking.current = false;
    e.currentTarget.querySelector('.card3d')?.classList.remove('card3d--tracking');
    setTilt(e.currentTarget, 0, 0, 0);
  }, []);

  return { onPointerMove, onPointerLeave };
}
