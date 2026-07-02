import { useState } from 'react';
import { getCard } from '../game/cards';
import { useLang } from '../i18n';

/** Art files that already 404-ed this session — avoids re-requesting per render. */
const missingArt = new Set<string>();

interface Props {
  cardId: string;
  className?: string;
  /** Tailwind text size class for the glyph fallback. */
  glyphClass?: string;
}

/** Card artwork with a graceful emoji fallback while the file is missing. */
export function CardArt({ cardId, className = '', glyphClass = 'text-3xl' }: Props) {
  const { lx } = useLang();
  const card = getCard(cardId);
  const [broken, setBroken] = useState(() => missingArt.has(card.art));

  if (broken) {
    return (
      <span className={`flex items-center justify-center ${className}`}>
        <span className={`${glyphClass} drop-shadow`}>{card.glyph}</span>
      </span>
    );
  }
  return (
    <img
      src={card.art}
      alt={lx(card.name)}
      draggable={false}
      className={`object-cover ${className}`}
      onError={() => {
        missingArt.add(card.art);
        setBroken(true);
      }}
    />
  );
}
