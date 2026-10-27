import { useEffect, useState } from 'react';
import { getCard } from '../game/cards';
import { useLang } from '../i18n';

/**
 * A deity's head in a bronze medallion. Uses the pre-cut head crop from
 * public/art/portraits/ (see scripts/generate-portraits.mjs); cards without
 * art yet fall back to their emoji glyph.
 */
export function CardPortrait({ cardId, className = 'h-10 w-10', active = false }: {
  cardId: string;
  className?: string;
  active?: boolean;
}) {
  const { lx } = useLang();
  const card = getCard(cardId);
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [cardId]);

  return (
    <span
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-stone-900 shadow-[0_2px_8px_rgba(0,0,0,0.6)] ${
        active ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-stone-950' : ''
      } ${className}`}
    >
      {broken ? (
        <span className="text-lg drop-shadow" aria-hidden="true">{card.glyph}</span>
      ) : (
        <img
          src={`/art/portraits/${cardId}.webp`}
          alt={lx(card.name)}
          draggable={false}
          loading="lazy"
          onError={() => setBroken(true)}
          className="h-full w-full object-cover"
        />
      )}
      <img
        src="/art/frames/medallion.svg"
        alt=""
        aria-hidden="true"
        draggable={false}
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
    </span>
  );
}
