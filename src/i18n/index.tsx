/**
 * Lightweight i18n: Slovak is the default, English fully parallel.
 * The language lives in localStorage and a React context; `translate`
 * also works outside React (server error mapping, non-hook helpers).
 */
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { CARDS } from '../game/cards';
import type { LocalizedText, LogEvent } from '../game/types';
import { STRINGS, type StringKey } from './strings';

export type Lang = 'sk' | 'en';

const LANG_KEY = 'pantheon-lang';

export function currentLang(): Lang {
  try {
    return localStorage.getItem(LANG_KEY) === 'en' ? 'en' : 'sk';
  } catch {
    return 'sk';
  }
}

export function translate(lang: Lang, key: StringKey, params?: Record<string, string | number>): string {
  let text = STRINGS[key][lang];
  if (params) {
    for (const [name, value] of Object.entries(params)) {
      text = text.replaceAll(`{${name}}`, String(value));
    }
  }
  return text;
}

/** Maps an engine/server error code to readable text; unknown codes pass through. */
export function errorText(lang: Lang, code: string, params?: Record<string, string | number>): string {
  const key = `err_${code}` as StringKey;
  if (!(key in STRINGS)) return code;
  const resolved = { ...params };
  if (typeof resolved.card === 'string' && CARDS[resolved.card]) {
    resolved.card = CARDS[resolved.card].name[lang];
  }
  return translate(lang, key, resolved);
}

/** Renders a structured engine log message, resolving card/lane params. */
export function renderLogMsg(lang: Lang, event: Extract<LogEvent, { kind: 'msg' }>): string {
  const params: Record<string, string | number> = { ...event.params };
  for (const slot of ['card', 'card2'] as const) {
    const id = params[slot];
    if (typeof id === 'string' && CARDS[id]) params[slot] = CARDS[id].name[lang];
  }
  if (params.lane === 'vanguard' || params.lane === 'sanctum') {
    params.lane = translate(lang, params.lane === 'vanguard' ? 'lane_vanguard' : 'lane_sanctum');
  }
  return translate(lang, `log_${event.msgKey}` as StringKey, params);
}

/** "Card name: ability" caption for dice events. */
export function diceLabel(lang: Lang, event: Extract<LogEvent, { kind: 'dice' }>): string {
  const name = CARDS[event.source] ? CARDS[event.source].name[lang] : event.source;
  return event.ability ? `${name}: ${event.ability[lang]}` : name;
}

interface LangContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const LangContext = createContext<LangContextValue>({ lang: 'sk', setLang: () => {} });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(currentLang);
  const setLang = useCallback((next: Lang) => {
    localStorage.setItem(LANG_KEY, next);
    setLangState(next);
  }, []);
  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export function useLang() {
  const { lang, setLang } = useContext(LangContext);
  const t = useCallback(
    (key: StringKey, params?: Record<string, string | number>) => translate(lang, key, params),
    [lang],
  );
  /** Picks the active language from a LocalizedText. */
  const lx = useCallback((text: LocalizedText) => text[lang], [lang]);
  return { lang, setLang, t, lx };
}
