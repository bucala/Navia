import { useState } from 'react';
import { useLang } from './i18n';
import type { StringKey } from './i18n/strings';
import { useProfile } from './net/profile';
import { AiGame } from './ui/AiGame';
import { Codex } from './ui/Codex';
import { DeckBuilder } from './ui/DeckBuilder';
import { HowToPlay } from './ui/HowToPlay';
import { Leaderboard } from './ui/Leaderboard';
import { LocalGame } from './ui/LocalGame';
import { OnlineGame } from './ui/OnlineGame';
import { Settings } from './ui/Settings';
import { isMuted, setMuted } from './ui/sfx';

type Screen =
  | 'menu'
  | 'multi'
  | 'single'
  | 'local'
  | 'online'
  | 'codex'
  | 'decks'
  | 'ranking'
  | 'settings'
  | 'rules';

interface MenuItem {
  icon: string;
  label: StringKey;
  desc: StringKey;
  screen: Screen;
}

const MAIN_MENU: MenuItem[] = [
  { icon: '⚔️', label: 'menu_single', desc: 'menu_single_desc', screen: 'single' },
  { icon: '📜', label: 'menu_rules', desc: 'menu_rules_desc', screen: 'rules' },
  { icon: '🌐', label: 'menu_multi', desc: 'menu_multi_desc', screen: 'multi' },
  { icon: '🃏', label: 'menu_decks', desc: 'menu_decks_desc', screen: 'decks' },
  { icon: '🏛️', label: 'menu_codex', desc: 'menu_codex_desc', screen: 'codex' },
  { icon: '🏆', label: 'menu_ranking', desc: 'menu_ranking_desc', screen: 'ranking' },
  { icon: '⚙️', label: 'menu_settings', desc: 'menu_settings_desc', screen: 'settings' },
];

function MenuButton({ item, onClick }: { item: MenuItem; onClick: () => void }) {
  const { t } = useLang();
  return (
    <button
      onClick={onClick}
      className="menu-button group flex w-full items-center gap-4 px-5 py-3.5 text-left sm:py-4"
    >
      <span className="text-3xl drop-shadow-lg transition-transform group-hover:scale-110 sm:text-4xl">
        {item.icon}
      </span>
      <span className="min-w-0">
        <span className="block font-semibold tracking-wide text-amber-100 sm:text-lg">{t(item.label)}</span>
        <span className="block truncate text-xs text-slate-400 sm:text-sm">{t(item.desc)}</span>
      </span>
      <span className="ml-auto text-amber-700 transition-transform group-hover:translate-x-1">❯</span>
    </button>
  );
}

export default function App() {
  const { t } = useLang();
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
  const toMenu = () => setScreen('menu');

  return (
    <div className="app-bg flex h-[100dvh] flex-col text-slate-100">
      <header className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 py-1.5">
        <button onClick={toMenu} className="flex items-center gap-2 text-sm font-bold tracking-wide text-amber-200">
          <img src="/art/branding/navia-mark.svg" alt="" aria-hidden="true" className="h-6 w-6 rounded" />
          Navia
        </button>
        <div className="flex items-center gap-2">
          {profile && (
            <span className="hidden text-xs text-slate-400 sm:inline">
              🧙 {profile.name} · <span className="font-bold text-amber-200">{profile.elo}</span> ELO ·{' '}
              <span className="text-emerald-400">{profile.wins}</span>/
              <span className="text-red-400">{profile.losses}</span>
            </span>
          )}
          <button
            onClick={toggleMute}
            title={t(muted ? 'mute_on' : 'mute_off')}
            className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700"
          >
            {muted ? '🔇' : '🔊'}
          </button>
          {screen !== 'menu' && (
            <button
              onClick={toMenu}
              className="navia-back-btn"
            >
              ← {t('header_menu')}
            </button>
          )}
        </div>
      </header>

      {screen === 'menu' && (
        <div className="relative flex flex-1 flex-col items-center justify-center gap-4 overflow-y-auto px-3 py-4 sm:gap-6 sm:px-6 sm:py-8">
          <img
            src="/art/frames/ornament-corner.svg"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute left-2 top-2 h-16 w-16 opacity-70 sm:left-6 sm:top-6 sm:h-24 sm:w-24"
          />
          <img
            src="/art/frames/ornament-corner.svg"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute right-2 top-2 h-16 w-16 -scale-x-100 opacity-70 sm:right-6 sm:top-6 sm:h-24 sm:w-24"
          />
          <img
            src="/art/frames/ornament-corner.svg"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute bottom-2 left-2 h-16 w-16 -scale-y-100 opacity-70 sm:bottom-6 sm:left-6 sm:h-24 sm:w-24"
          />
          <img
            src="/art/frames/ornament-corner.svg"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute bottom-2 right-2 h-16 w-16 -scale-x-100 -scale-y-100 opacity-70 sm:bottom-6 sm:right-6 sm:h-24 sm:w-24"
          />

          <div className="menu-panel flex w-full max-w-2xl flex-col items-center gap-3 px-6 py-8 sm:px-14 sm:py-12">
            <img src="/art/branding/navia-logo.svg" alt="Navia" className="w-full max-w-md sm:max-w-lg" />
            <img src="/art/frames/ornament-divider.svg" alt="" aria-hidden="true" className="h-3 w-40" />
            <div className="mt-6 flex w-full max-w-md flex-col gap-3">
              {MAIN_MENU.map((item) => (
                <MenuButton key={item.screen} item={item} onClick={() => setScreen(item.screen)} />
              ))}
            </div>
          </div>
        </div>
      )}

      {screen === 'multi' && (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-3 sm:px-4">
          <div className="menu-panel flex w-full max-w-2xl flex-col items-center gap-3 px-6 py-8 sm:px-14 sm:py-12">
            <h2 className="text-2xl font-bold text-amber-100 sm:text-3xl">🌐 {t('multi_title')}</h2>
            <div className="mt-4 flex w-full max-w-md flex-col gap-3">
              <MenuButton
                item={{ icon: '⚡', label: 'multi_online', desc: 'multi_online_desc', screen: 'online' }}
                onClick={() => setScreen('online')}
              />
              <MenuButton
                item={{ icon: '🤝', label: 'multi_local', desc: 'multi_local_desc', screen: 'local' }}
                onClick={() => setScreen('local')}
              />
            </div>
            <button onClick={toMenu} className="mt-4 text-xs text-slate-400 hover:text-slate-200">
              {t('back_menu')}
            </button>
          </div>
        </div>
      )}

      {screen === 'single' && <AiGame key="single" />}
      {screen === 'local' && <LocalGame key="local" />}
      {screen === 'online' && <OnlineGame onExit={toMenu} />}
      {screen === 'codex' && <Codex onBack={toMenu} />}
      {screen === 'decks' && <DeckBuilder onBack={toMenu} />}
      {screen === 'ranking' && <Leaderboard onBack={toMenu} />}
      {screen === 'settings' && <Settings onBack={toMenu} />}
      {screen === 'rules' && <HowToPlay onBack={toMenu} />}
    </div>
  );
}
