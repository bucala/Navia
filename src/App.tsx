import { useState } from 'react';
import { Codex } from './ui/Codex';
import { LocalGame } from './ui/LocalGame';

type Screen = 'menu' | 'local' | 'codex';

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu');

  return (
    <div className="flex h-screen flex-col text-slate-100">
      <header className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 py-1.5">
        <button onClick={() => setScreen('menu')} className="text-sm font-bold tracking-wide text-amber-200">
          ⚄ Pantheon: Dice of Destiny
        </button>
        {screen !== 'menu' && (
          <button
            onClick={() => setScreen('menu')}
            className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700"
          >
            ← Menu
          </button>
        )}
      </header>

      {screen === 'menu' && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4">
          <p className="text-5xl">⚄</p>
          <h1 className="text-center text-3xl font-bold text-amber-100">Pantheon: Dice of Destiny</h1>
          <p className="mb-6 max-w-md text-center text-sm text-slate-400">
            Povolaj mýtické zvieracie božstvá, obsaď taktické línie a nechaj o osude útokov rozhodnúť Božský hod
            kockou.
          </p>
          <button
            onClick={() => setScreen('local')}
            className="w-64 rounded-xl bg-amber-700 px-6 py-3 font-semibold text-amber-50 shadow-lg hover:bg-amber-600"
          >
            🎲 Lokálna hra (Pass &amp; Play)
          </button>
          <button
            onClick={() => setScreen('codex')}
            className="w-64 rounded-xl bg-slate-800 px-6 py-3 font-semibold text-slate-100 shadow-lg hover:bg-slate-700"
          >
            📖 Sieň Božstiev
          </button>
        </div>
      )}

      {screen === 'local' && <LocalGame key="local" />}
      {screen === 'codex' && <Codex onBack={() => setScreen('menu')} />}
    </div>
  );
}
