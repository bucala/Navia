import { useState } from 'react';
import { useProfile } from './net/profile';
import { Codex } from './ui/Codex';
import { DeckBuilder } from './ui/DeckBuilder';
import { Leaderboard } from './ui/Leaderboard';
import { LocalGame } from './ui/LocalGame';
import { OnlineGame } from './ui/OnlineGame';
import { isMuted, setMuted } from './ui/sfx';

type Screen = 'menu' | 'local' | 'online' | 'codex' | 'decks' | 'ranking';

export default function App() {
  // Opening an invite link (?room=XYZ) jumps straight into the online flow.
  const [screen, setScreen] = useState<Screen>(() =>
    new URLSearchParams(window.location.search).get('room') ? 'online' : 'menu',
  );
  const [muted, setMutedState] = useState(isMuted);
  const { profile } = useProfile();
  const toggleMute = () => {
    setMuted(!muted);
    setMutedState(!muted);
  };

  return (
    <div className="flex h-screen flex-col text-slate-100">
      <header className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 py-1.5">
        <button onClick={() => setScreen('menu')} className="text-sm font-bold tracking-wide text-amber-200">
          ⚄ Pantheon: Dice of Destiny
        </button>
        <div className="flex items-center gap-2">
          {profile && (
            <span className="hidden text-xs text-slate-400 sm:inline">
              🧙 {profile.name} · <span className="font-bold text-amber-200">{profile.elo}</span> ELO ·{' '}
              <span className="text-emerald-400">{profile.wins}V</span>/
              <span className="text-red-400">{profile.losses}P</span>
            </span>
          )}
          <button
            onClick={toggleMute}
            title={muted ? 'Zapnúť zvuk' : 'Vypnúť zvuk'}
            className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700"
          >
            {muted ? '🔇' : '🔊'}
          </button>
          {screen !== 'menu' && (
            <button
              onClick={() => setScreen('menu')}
              className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700"
            >
              ← Menu
            </button>
          )}
        </div>
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
            onClick={() => setScreen('online')}
            className="w-64 rounded-xl bg-sky-800 px-6 py-3 font-semibold text-sky-50 shadow-lg hover:bg-sky-700"
          >
            🌐 Online hra
          </button>
          <button
            onClick={() => setScreen('decks')}
            className="w-64 rounded-xl bg-emerald-900 px-6 py-3 font-semibold text-emerald-50 shadow-lg hover:bg-emerald-800"
          >
            🃏 Balíčky
          </button>
          <button
            onClick={() => setScreen('ranking')}
            className="w-64 rounded-xl bg-slate-800 px-6 py-3 font-semibold text-slate-100 shadow-lg hover:bg-slate-700"
          >
            🏆 Rebríček
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
      {screen === 'online' && <OnlineGame onExit={() => setScreen('menu')} />}
      {screen === 'codex' && <Codex onBack={() => setScreen('menu')} />}
      {screen === 'decks' && <DeckBuilder onBack={() => setScreen('menu')} />}
      {screen === 'ranking' && <Leaderboard onBack={() => setScreen('menu')} />}
    </div>
  );
}
