/** Inline stat/combat glyphs — `fill="currentColor"` so they inherit the
 * Tailwind text-color class already applied by each call site. */

type IconProps = { className?: string };

export function AttackIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2 L14.5 6.5 L14.5 15 L9.5 15 L9.5 6.5 Z" />
      <rect x="4" y="14" width="16" height="2.6" rx="1" />
      <rect x="10.5" y="16.6" width="3" height="4.4" rx="1" />
    </svg>
  );
}

export function ArmorIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2 L20 5.5 V11 C20 16 16.6 19.8 12 22 C7.4 19.8 4 16 4 11 V5.5 Z" />
    </svg>
  );
}

export function HpIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 22 C6 17.5 3 13.6 3 9.6 C3 6.4 5.4 4 8.4 4 C10 4 11.3 4.8 12 6 C12.7 4.8 14 4 15.6 4 C18.6 4 21 6.4 21 9.6 C21 13.6 18 17.5 12 22 Z" />
    </svg>
  );
}

export function BurnIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2 C12 6 8 7.5 8 12 C8 15 10 17 12 17 C14.5 17 16.5 15 16.5 12.2 C16.5 15 15 16 13.7 16 C15 13.5 13 11.5 13 9 C13 11 11 12.5 11 15 C9.8 14.3 9.5 12.7 10 11.5 C8.8 12.5 8.5 14 9 15.5 C6.8 14 6 11.3 7 8.8 C7.6 7.2 9 6.5 9.3 4.8 C10.2 5.6 10.5 3.5 12 2 Z" />
      <path d="M12 22 C9 20 7.5 18 8 15.5 C9.5 17.3 12 18 12 18 C12 18 14.5 17.3 16 15.5 C16.5 18 15 20 12 22 Z" opacity="0.85" />
    </svg>
  );
}

export function ManaIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <rect x="6" y="6" width="12" height="12" rx="2" transform="rotate(45 12 12)" />
    </svg>
  );
}

export function NexusHeartIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 21 C6.5 16.9 3 13.2 3 9.3 C3 6.2 5.3 4 8.1 4 C9.9 4 11.3 4.9 12 6.2 C12.7 4.9 14.1 4 15.9 4 C18.7 4 21 6.2 21 9.3 C21 13.2 17.5 16.9 12 21 Z" />
    </svg>
  );
}
