/**
 * Anonymous player profile (GDD §5.2 — D1 accounts). The client keeps a
 * playerId+secret pair in localStorage; /api/profile logs in or mints a
 * new account. Everything degrades gracefully when the backend is
 * unreachable (local-only play stays unranked).
 */
import { useCallback, useEffect, useState } from 'react';
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

function storedCredentials(): { playerId: string; secret: string } | null {
  try {
    const raw = localStorage.getItem(CREDS_KEY);
    return raw ? (JSON.parse(raw) as { playerId: string; secret: string }) : null;
  } catch {
    return null;
  }
}

/** Login-or-register. Returns null when the backend is unreachable. */
export async function ensureProfile(name?: string): Promise<Profile | null> {
  try {
    const creds = storedCredentials();
    const res = await fetch(apiUrl('/api/profile'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...creds, name }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Omit<Profile, 'secret'> & { secret?: string };
    const secret = data.secret ?? creds?.secret;
    if (!secret) return null;
    localStorage.setItem(CREDS_KEY, JSON.stringify({ playerId: data.playerId, secret }));
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

/** Authenticated POST to a /api/decks/... endpoint. */
export async function deckApi<T>(path: string, profile: Profile, body: object = {}): Promise<T> {
  const res = await fetch(apiUrl(path), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ playerId: profile.playerId, secret: profile.secret, ...body }),
  });
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) throw new Error(data.error ?? `Server odpovedal ${res.status}`);
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
