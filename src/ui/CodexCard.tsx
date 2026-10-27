import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { useLang } from '../i18n';
import { Card3D, prefersReducedMotion } from './Card3D';

/** Degrees of spin per pixel dragged. */
const DRAG_SPEED = 0.6;
/** Movement (px) below which a press counts as a tap → flip. */
const TAP_SLOP = 6;
const HOVER_TILT = 14;

/**
 * The large Codex card: lean it by moving the mouse over it, spin it by
 * dragging (finger or mouse) and tap / press the button to turn it over.
 * Spin and tilt are written straight to CSS variables — no React re-render
 * per pointer frame.
 */
export function CodexCard({ front, resetKey }: { front: ReactNode; resetKey: string }) {
  const { t } = useLang();
  const root = useRef<HTMLDivElement>(null);
  const angle = useRef(0);
  const drag = useRef<{ x: number; start: number; moved: boolean } | null>(null);
  const [showingBack, setShowingBack] = useState(false);

  const card = () => root.current?.querySelector<HTMLElement>('.card3d') ?? null;

  const apply = (ry: number, rx = 0, glare = 0) => {
    const el = card();
    if (!el) return;
    el.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
    el.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
    el.style.setProperty('--ry-num', String(Math.max(-30, Math.min(30, ry - angle.current))));
    el.style.setProperty('--rx-num', rx.toFixed(2));
    el.style.setProperty('--glare', String(glare));
  };

  const settle = (next: number) => {
    angle.current = next;
    card()?.classList.remove('card3d--dragging', 'card3d--tracking');
    apply(next);
    setShowingBack(Math.round(next / 180) % 2 !== 0);
  };

  // A new deity always starts face-up.
  useEffect(() => {
    angle.current = 0;
    setShowingBack(false);
    card()?.classList.remove('card3d--dragging', 'card3d--tracking');
    apply(0);
  }, [resetKey]);

  const flip = () => settle(angle.current + 180);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    drag.current = { x: e.clientX, start: angle.current, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (d) {
      const dx = e.clientX - d.x;
      if (!d.moved && Math.abs(dx) < TAP_SLOP) return;
      d.moved = true;
      card()?.classList.add('card3d--dragging');
      apply(d.start + dx * DRAG_SPEED, 0, 0.6);
      return;
    }
    if (e.pointerType === 'touch' || prefersReducedMotion()) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card()?.classList.add('card3d--tracking');
    apply(angle.current + x * HOVER_TILT * 2, -y * HOVER_TILT * 2, 1);
  };

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (!d.moved) {
      flip();
      return;
    }
    const current = d.start + (e.clientX - d.x) * DRAG_SPEED;
    settle(Math.round(current / 180) * 180);
  };

  const onPointerLeave = () => {
    if (drag.current) return;
    card()?.classList.remove('card3d--tracking');
    apply(angle.current);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        ref={root}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={onPointerLeave}
        className="cursor-grab touch-pan-y select-none active:cursor-grabbing"
        style={{ ['--card-persp' as string]: '1100px' }}
      >
        <Card3D front={front} thickness={7} className="h-[460px] w-72 rounded-2xl sm:w-80" />
      </div>
      <span className="sr-only" aria-live="polite">
        {showingBack ? t('codex_card_back') : t('codex_card_front')}
      </span>
      <button type="button" onClick={flip} className="navia-btn">
        <img src="/art/icons/icon-refresh.svg" alt="" aria-hidden="true" className="h-4 w-4" />
        {t('codex_flip')}
      </button>
      <p className="text-center text-[11px] font-medium text-stone-800">{t('codex_flip_hint')}</p>
    </div>
  );
}
