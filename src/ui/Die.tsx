/** A single D6 face rendered with pips. */
const PIP_LAYOUT: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

export function Die({ value, dim = false, animate = false }: { value: number; dim?: boolean; animate?: boolean }) {
  return (
    <div
      className={`grid h-12 w-12 shrink-0 grid-cols-3 grid-rows-3 place-items-center rounded-lg border p-1.5 shadow-lg ${
        dim ? 'border-slate-500 bg-slate-300 opacity-50' : 'border-slate-200 bg-slate-50'
      } ${animate ? 'animate-dice' : ''}`}
    >
      {Array.from({ length: 9 }, (_, i) => (
        <span
          key={i}
          className={`h-2 w-2 rounded-full ${PIP_LAYOUT[value]?.includes(i) ? (value === 6 ? 'bg-red-600' : 'bg-slate-900') : ''}`}
        />
      ))}
    </div>
  );
}
