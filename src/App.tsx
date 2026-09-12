import { useCallback, useEffect, useState } from 'react';
import { useLang } from './i18n';
import type { StringKey } from './i18n/strings';
import { useProfileContext } from './net/ProfileContext';
import { AiGame } from './ui/AiGame';
import { Codex } from './ui/Codex';
import { DeckBuilder } from './ui/DeckBuilder';
import { HowToPlay } from './ui/HowToPlay';
import { Leaderboard } from './ui/Leaderboard';
import { LocalGame } from './ui/LocalGame';
import { OnlineGame } from './ui/OnlineGame';
import { Settings } from './ui/Settings';
import { setMuted, useMuted } from './ui/sfx';
import { activateUpdate, subscribeToUpdate } from './pwa';

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
  { icon: '/art/icons/icon-sword.svg', label: 'menu_single', desc: 'menu_single_desc', screen: 'single' },
  { icon: '/art/icons/icon-scroll.svg', label: 'menu_rules', desc: 'menu_rules_desc', screen: 'rules' },
  { icon: '/art/icons/icon-globe-rune.svg', label: 'menu_multi', desc: 'menu_multi_desc', screen: 'multi' },
  { icon: '/art/icons/icon-cards.svg', label: 'menu_decks', desc: 'menu_decks_desc', screen: 'decks' },
  { icon: '/art/icons/icon-temple.svg', label: 'menu_codex', desc: 'menu_codex_desc', screen: 'codex' },
  { icon: '/art/icons/icon-trophy.svg', label: 'menu_ranking', desc: 'menu_ranking_desc', screen: 'ranking' },
  { icon: '/art/icons/icon-gear.svg', label: 'menu_settings', desc: 'menu_settings_desc', screen: 'settings' },
];

function MenuButton({ item, onClick }: { item: MenuItem; onClick: () => void }) {
  const { t } = useLang();
  return (
    <button
      onClick={onClick}
      className="menu-button group flex w-full items-center gap-4 px-5 py-3.5 text-left sm:py-4"
    >
      <img
        src={item.icon}
        alt=""
        aria-hidden="true"
        className="h-8 w-8 shrink-0 drop-shadow-lg transition-transform group-hover:scale-110 sm:h-9 sm:w-9"
      />
      <span className="min-w-0">
        <span className="block font-semibold tracking-wide text-amber-100 sm:text-lg">{t(item.label)}</span>
        <span className="block truncate text-xs text-slate-400 sm:text-sm">{t(item.desc)}</span>
      </span>
      <span
        aria-hidden="true"
        className="icon-mask icon-mask--chevron-right ml-auto h-4 w-4 shrink-0 bg-amber-700 transition-transform group-hover:translate-x-1"
      />
    </button>
  );
}

export default function App() {
  const { t } = useLang();
  // Opening an invite link (?room=XYZ) jumps straight into the online flow.
  const [screen, setScreen] = useState<Screen>(() =>
    new URLSearchParams(window.location.search).get('room') ? 'online' : 'menu',
  );
  const muted = useMuted();
  const { profile } = useProfileContext();
  const [onlineCleanup, setOnlineCleanup] = useState<(() => void) | null>(null);
  const [updateReady, setUpdateReady] = useState(false);
  useEffect(() => subscribeToUpdate(() => setUpdateReady(true)), []);
  const toggleMute = () => setMuted(!muted);
  const toMenu = () => {
    if (screen === 'online' && onlineCleanup) {
      onlineCleanup();
      return;
    }
    setScreen('menu');
  };
  const finishOnlineExit = useCallback(() => setScreen('menu'), []);
  const registerOnlineCleanup = useCallback((cleanup: (() => void) | null) => {
    setOnlineCleanup(cleanup ? () => cleanup : null);
  }, []);

  return (
    <div className="app-bg flex h-[100dvh] min-w-0 flex-col overflow-hidden text-slate-100">
      <header className="flex items-center justify-between border-b border-amber-900/40 bg-stone-950/85 px-4 py-1.5 shadow-md">
        <button onClick={toMenu} className="flex items-center gap-2 text-sm font-bold tracking-wide text-amber-200 hover:text-amber-100">
          <img src="/icons/icon-48.png" alt="" aria-hidden="true" className="h-6 w-6 rounded shadow" />
          Navia
        </button>
        <div className="flex items-center gap-2">
          {profile && (
            <span className="hidden text-xs text-amber-100/70 sm:inline">
              🧙 {profile.name} · <span className="font-bold text-amber-200">{profile.elo}</span> ELO ·{' '}
              <span className="text-emerald-400">{profile.wins}</span>/
              <span className="text-red-400">{profile.losses}</span>
            </span>
          )}
          <button
            onClick={toggleMute}
            title={t(muted ? 'mute_on' : 'mute_off')}
            aria-label={t(muted ? 'mute_on' : 'mute_off')}
            className="rounded border border-amber-900/30 bg-stone-900 p-1.5 hover:bg-stone-800"
          >
            <img
              src={muted ? '/art/icons/icon-speaker-off.svg' : '/art/icons/icon-speaker-on.svg'}
              alt=""
              aria-hidden="true"
              className="h-4 w-4"
            />
          </button>
          {screen !== 'menu' && (
            <button
              onClick={toMenu}
              className="navia-back-btn"
            >
              {t('header_menu')}
            </button>
          )}
        </div>
      </header>

      {screen === 'menu' && (
        <div className="relative flex flex-1 flex-col items-center gap-3 overflow-y-auto px-3 py-3 sm:gap-6 sm:px-6 sm:py-8">
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

          <div className="menu-panel my-auto flex w-full max-w-2xl flex-col items-center gap-3 px-5 py-6 sm:px-14 sm:py-12">
            <img src="/art/branding/navia-logo.webp" alt="Navia" className="w-full max-w-md sm:max-w-lg" />
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
            <h2 className="flex items-center gap-2 text-2xl font-bold text-amber-100 sm:text-3xl">
              <img src="/art/icons/icon-globe-rune.svg" alt="" aria-hidden="true" className="h-7 w-7 sm:h-8 sm:w-8" />
              {t('multi_title')}
            </h2>
            <div className="mt-4 flex w-full max-w-md flex-col gap-3">
              <MenuButton
                item={{ icon: '/art/icons/icon-lightning.svg', label: 'multi_online', desc: 'multi_online_desc', screen: 'online' }}
                onClick={() => setScreen('online')}
              />
              <MenuButton
                item={{ icon: '/art/icons/icon-handshake.svg', label: 'multi_local', desc: 'multi_local_desc', screen: 'local' }}
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
      {screen === 'online' && (
        <OnlineGame onExit={finishOnlineExit} registerCleanup={registerOnlineCleanup} />
      )}
      {screen === 'codex' && <Codex onBack={toMenu} />}
      {screen === 'decks' && <DeckBuilder onBack={toMenu} />}
      {screen === 'ranking' && <Leaderboard onBack={toMenu} />}
      {screen === 'settings' && <Settings onBack={toMenu} />}
      {screen === 'rules' && <HowToPlay onBack={toMenu} />}
      {updateReady && (
        <div role="status" className="fixed bottom-3 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-lg border border-amber-600 bg-stone-950 px-4 py-3 text-sm text-amber-100 shadow-2xl">
          <span>{t('update_ready')}</span>
          <button onClick={activateUpdate} className="rounded bg-amber-700 px-3 py-1.5 font-semibold hover:bg-amber-600">
            {t('update_apply')}
          </button>
        </div>
      )}
    </div>
  );
}
