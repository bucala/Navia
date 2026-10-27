import { useEffect, useRef, useState, type PointerEvent, type MouseEvent } from 'react';
import { getUnitCard } from '../game/cards';
import type { GameViewState, PlayerId, PlayerViewState, UnitState } from '../game/types';
import { useLang } from '../i18n';
import { CardBack } from './Card3D';
import { CardFace } from './CardFace';
import { ArmorIcon, BurnIcon, HpIcon } from './icons';
import { sfxTurnStart } from './sfx';
import type { SpellFx } from './useCombatFx';

/** Cards left to draw — local games keep the deck, online views only its size. */
export function deckSize(player: PlayerViewState): number {
  const view = player as PlayerViewState & { deck?: string[]; deckCount?: number };
  return view.deckCount ?? view.deck?.length ?? 0;
}

/** A face-down draw pile whose height shows how many cards remain. */
export function DrawPile({ count, label }: { count: number; label: string }) {
  const layers = count === 0 ? 0 : Math.min(6, Math.ceil(count / 4));
  return (
    <span className="relative flex h-9 w-7 shrink-0 items-end" title={label} aria-label={label} role="img">
      {count === 0 ? (
        <span className="h-8 w-6 rounded-[3px] border border-dashed border-amber-900/70" />
      ) : (
        Array.from({ length: layers }, (_, i) => (
          <span
            key={i}
            aria-hidden="true"
            className="absolute bottom-0 left-0 h-8 w-6 overflow-hidden rounded-[3px] shadow-[0_1px_0_#5a3c1a]"
            style={{ transform: `translate(${i * 0.6}px, ${-i * 1.6}px)` }}
          >
            <CardBack />
          </span>
        ))
      )}
      <span className="absolute -bottom-1 -right-1.5 z-10 min-w-4 rounded-full border border-amber-700 bg-stone-950 px-1 text-center text-[9px] font-bold leading-4 text-amber-200">
        {count}
      </span>
    </span>
  );
}

/** Fire bolt from the caster's side to every slot the spell damaged. */
export function SpellBolt({ spell, viewpoint }: { spell: SpellFx | null; viewpoint: PlayerId }) {
  const [shots, setShots] = useState<{ x: number; y: number; dx: number; dy: number; tail: number }[]>([]);

  useEffect(() => {
    if (!spell) {
      setShots([]);
      return;
    }
    const fromX = window.innerWidth / 2;
    const fromY = spell.caster === viewpoint ? window.innerHeight - 140 : 110;
    setShots(
      spell.targets.flatMap((key) => {
        const el = document.querySelector(`[data-slot="${key}"]`);
        if (!el) return [];
        const r = el.getBoundingClientRect();
        const dx = r.left + r.width / 2 - fromX;
        const dy = r.top + r.height / 2 - fromY;
        // The tail trails back toward the caster.
        const tail = (Math.atan2(-dy, -dx) * 180) / Math.PI;
        return [{ x: fromX, y: fromY, dx, dy, tail }];
      }),
    );
  }, [spell, viewpoint]);

  return (
    <>
      {shots.map((s, i) => (
        <span key={`${spell?.id}-${i}`} aria-hidden="true">
          <span
            className="spell-bolt"
            style={{
              left: s.x,
              top: s.y,
              ['--dx' as string]: `${s.dx}px`,
              ['--dy' as string]: `${s.dy}px`,
              ['--tail' as string]: `${s.tail}deg`,
            }}
          />
          <span className="spell-burst" style={{ left: s.x + s.dx, top: s.y + s.dy }} />
        </span>
      ))}
    </>
  );
}

const BANNER_MS = 1500;

/**
 * Ribbon sweeping across the arena whenever the turn passes — who is up and
 * which turn it is. Waits while `enabled` is false (the hot-seat hand-off
 * screen covers the board), then announces the turn it missed.
 */
export function TurnBanner({ state, viewpoint, enabled }: { state: GameViewState; viewpoint: PlayerId; enabled: boolean }) {
  const { t } = useLang();
  const [banner, setBanner] = useState<{ id: number; mine: boolean; name: string; turn: number } | null>(null);
  const announced = useRef<string | null>(null);
  const activeName = state.players[state.active].name;

  useEffect(() => {
    if (!enabled || state.winner) return;
    const key = `${state.turn}:${state.active}`;
    if (announced.current === key) return;
    announced.current = key;
    const mine = state.active === viewpoint;
    setBanner({ id: Date.now(), mine, name: activeName, turn: state.turn });
    if (mine) sfxTurnStart();
  }, [enabled, state.turn, state.active, state.winner, viewpoint, activeName]);

  useEffect(() => {
    if (!banner) return;
    const timer = setTimeout(() => setBanner(null), BANNER_MS);
    return () => clearTimeout(timer);
  }, [banner]);

  if (!banner) return null;
  return (
    <div key={banner.id} className="turn-banner" role="status" aria-live="polite">
      <div className={`turn-banner__ribbon ${banner.mine ? '' : 'turn-banner__ribbon--foe'}`}>
        <p className="turn-banner__title">{t(banner.mine ? 'banner_your_turn' : 'banner_foe_turn')}</p>
        <p className="turn-banner__sub">{t('banner_sub', { n: banner.turn, name: banner.name })}</p>
      </div>
    </div>
  );
}

export interface PreviewTarget {
  cardId: string;
  unit?: UnitState;
}

/**
 * Large read-only card shown while a card or unit is held (touch) or hovered
 * (mouse) — the small in-play text is hard to read on phones.
 */
export function CardPreview({ target }: { target: PreviewTarget | null }) {
  const { t } = useLang();
  if (!target) return null;
  const unit = target.unit;
  const card = unit ? getUnitCard(target.cardId) : null;
  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-black/45 backdrop-blur-[1px]">
      <div className="flex flex-col items-center gap-2" aria-hidden="true">
        <div className="h-[min(60dvh,26rem)]">
          <CardFace cardId={target.cardId} interactive={false} />
        </div>
        {unit && card && (
          <div className="flex items-center gap-3 rounded-full border border-amber-800 bg-stone-950/95 px-4 py-1.5 text-sm font-bold shadow-xl">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-amber-200/80">{t('preview_now')}</span>
            <span className="flex items-center gap-1 text-red-400"><HpIcon className="h-3.5 w-3.5" /> {unit.hp}/{unit.maxHp}</span>
            <span className="flex items-center gap-1 text-slate-300"><ArmorIcon className="h-3.5 w-3.5" /> {unit.armor}</span>
            {unit.burn > 0 && <span className="flex items-center gap-1 text-orange-300"><BurnIcon className="h-3.5 w-3.5" /> {unit.burn}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

const HOLD_MS = 380;
const HOVER_MS = 550;
const MOVE_CANCEL_PX = 8;

/**
 * Touch: press and hold to preview (the tap that ends a hold is swallowed so
 * it doesn't also select the card). Mouse: hover briefly to preview; clicks
 * keep working normally. One instance serves every card: `bind(target)`
 * returns the pointer handlers for one card or unit.
 */
export function usePreviewGesture(setPreview: (target: PreviewTarget | null) => void) {
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const start = useRef<{ x: number; y: number } | null>(null);
  const firedByTouch = useRef(false);

  useEffect(() => () => clearTimeout(timer.current), []);

  const cancel = () => {
    clearTimeout(timer.current);
    start.current = null;
    setPreview(null);
  };

  return (target: PreviewTarget, { hover = true }: { hover?: boolean } = {}) => ({
    onPointerEnter: (e: PointerEvent<HTMLElement>) => {
      if (!hover || e.pointerType !== 'mouse') return;
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setPreview(target), HOVER_MS);
    },
    onPointerDown: (e: PointerEvent<HTMLElement>) => {
      if (e.pointerType === 'mouse') {
        // Clicking acts on the card — drop a hover preview instead of covering it.
        cancel();
        return;
      }
      firedByTouch.current = false;
      start.current = { x: e.clientX, y: e.clientY };
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        firedByTouch.current = true;
        setPreview(target);
      }, HOLD_MS);
    },
    onPointerMove: (e: PointerEvent<HTMLElement>) => {
      const s = start.current;
      if (s && Math.hypot(e.clientX - s.x, e.clientY - s.y) > MOVE_CANCEL_PX) cancel();
    },
    onPointerUp: (e: PointerEvent<HTMLElement>) => {
      if (e.pointerType !== 'mouse') cancel();
    },
    onPointerCancel: cancel,
    onPointerLeave: cancel,
    onClickCapture: (e: MouseEvent<HTMLElement>) => {
      if (!firedByTouch.current) return;
      firedByTouch.current = false;
      e.preventDefault();
      e.stopPropagation();
    },
    onContextMenu: (e: MouseEvent<HTMLElement>) => {
      // Long-press would otherwise open the browser's context menu on phones.
      if (firedByTouch.current || start.current) e.preventDefault();
    },
  });
}
