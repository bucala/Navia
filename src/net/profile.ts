/**
 * Anonymous player profile (GDD §5.2 — D1 accounts). Browsers retain the
 * playerId+secret pair in same-origin storage; Android encrypts it with a
 * device-bound Keystore key. Everything degrades gracefully when the backend
 * is unreachable (local-only play stays unranked).
 */
import { useCallback, useEffect, useState } from 'react';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { currentLang, errorText } from '../i18n';
import { apiUrl } from './api';

export interface Profile {
  playerId: string;
  secret: string;
  name: string;
  elo: number;
  wins: number;
  losses: number;
}

const CREDS_KEY = 'pantheon-profile';
const ACTIVE_DECK_KEY = 'pantheon-active-deck';
const PLAYER_NAME_KEY = 'pantheon-name';

/** The summoner's display name, shared by the menu, settings, and games. */
export function getPlayerName(fallback = ''): string {
  return localStorage.getItem(PLAYER_NAME_KEY) ?? fallback;
}

export function setPlayerName(name: string): void {
  localStorage.setItem(PLAYER_NAME_KEY, name);
}

interface Credentials {
  playerId: string;
  secret: string;
}

interface SecureCredentialsPlugin {
  getCredentials(): Promise<{ value?: string }>;
  setCredentials(options: { value: string }): Promise<void>;
}

const SecureCredentials = registerPlugin<SecureCredentialsPlugin>('SecureCredentials');

function parseCredentials(raw: string | null | undefined): Credentials | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Record<string, unknown>;
    return typeof value.playerId === 'string' && typeof value.secret === 'string'
      ? { playerId: value.playerId, secret: value.secret }
      : null;
  } catch {
    return null;
  }
}

async function storedCredentials(): Promise<Credentials | null> {
  if (Capacitor.getPlatform() !== 'android') {
    return parseCredentials(localStorage.getItem(CREDS_KEY));
  }

  const stored = parseCredentials((await SecureCredentials.getCredentials()).value);
  if (stored) return stored;

  // One-time migration from releases that stored the secret in WebView data.
  const legacy = parseCredentials(localStorage.getItem(CREDS_KEY));
  if (legacy) {
    await saveCredentials(legacy);
    localStorage.removeItem(CREDS_KEY);
  }
  return legacy;
}

async function saveCredentials(credentials: Credentials): Promise<void> {
  const value = JSON.stringify(credentials);
  if (Capacitor.getPlatform() === 'android') {
    await SecureCredentials.setCredentials({ value });
    localStorage.removeItem(CREDS_KEY);
  } else {
    localStorage.setItem(CREDS_KEY, value);
  }
}

/**
 * Concurrent callers (App, DeckBuilder, settings) share one queue so two
 * first-run mounts cannot each observe "no credentials" and mint separate
 * anonymous accounts that then overwrite each other in storage.
 */
let ensureQueue: Promise<unknown> = Promise.resolve();

/** Login-or-register. Returns null when the backend is unreachable. */
export function ensureProfile(name?: string): Promise<Profile | null> {
  const result = ensureQueue.then(() => ensureProfileInner(name));
  ensureQueue = result.catch(() => undefined);
  return result;
}

async function ensureProfileInner(name?: string): Promise<Profile | null> {
  try {
    const creds = await storedCredentials();
    const res = await fetch(apiUrl('/api/profile'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...creds, name }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Omit<Profile, 'secret'> & { secret?: string };
    const secret = data.secret ?? creds?.secret;
    if (!secret) return null;
    await saveCredentials({ playerId: data.playerId, secret });
    return { ...data, secret };
  } catch {
    return null;
  }
}

export function activeDeckId(): string | null {
  return localStorage.getItem(ACTIVE_DECK_KEY);
}

export function setActiveDeckId(deckId: string | null): void {
  if (deckId) localStorage.setItem(ACTIVE_DECK_KEY, deckId);
  else localStorage.removeItem(ACTIVE_DECK_KEY);
}

/** Authenticated POST to a /api/decks/... endpoint. Errors arrive as codes and are localized here. */
export async function deckApi<T>(path: string, profile: Profile, body: object = {}): Promise<T> {
  const res = await fetch(apiUrl(path), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ playerId: profile.playerId, secret: profile.secret, ...body }),
  });
  const data = (await res.json()) as T & { error?: string; params?: Record<string, string | number> };
  if (!res.ok) throw new Error(errorText(currentLang(), data.error ?? `HTTP ${res.status}`, data.params));
  return data;
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async (name?: string) => {
    setLoading(true);
    const result = await ensureProfile(name);
    setProfile(result);
    setLoading(false);
    return result;
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { profile, loading, refresh };
}
