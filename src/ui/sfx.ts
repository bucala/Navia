/**
 * Procedural sound effects via WebAudio (GDD §6) — no audio assets
 * needed. Everything plays after a user gesture, so autoplay policies
 * are satisfied. Muting is persisted in localStorage.
 */

import { useSyncExternalStore } from 'react';

let ctx: AudioContext | null = null;
let muted = typeof localStorage !== 'undefined' && localStorage.getItem('pantheon-muted') === '1';

const muteListeners = new Set<() => void>();

export function isMuted(): boolean {
  return muted;
}

export function setMuted(value: boolean): void {
  if (muted === value) return;
  muted = value;
  localStorage.setItem('pantheon-muted', value ? '1' : '0');
  for (const listener of muteListeners) listener();
}

/** Reactive mute state shared by the header toggle and Settings. */
export function useMuted(): boolean {
  return useSyncExternalStore(
    (listener) => {
      muteListeners.add(listener);
      return () => {
        muteListeners.delete(listener);
      };
    },
    isMuted,
  );
}

function audio(): AudioContext | null {
  if (muted) return null;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** One enveloped tone sliding from `from` to `to` Hz. */
function tone(from: number, to: number, duration: number, type: OscillatorType, gain: number, when = 0): void {
  const ac = audio();
  if (!ac) return;
  const start = ac.currentTime + when;
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, start);
  osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), start + duration);
  amp.gain.setValueAtTime(gain, start);
  amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(amp).connect(ac.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

/** Rattle of a die bouncing across the table. */
export function sfxDiceRoll(): void {
  for (let i = 0; i < 6; i++) {
    const when = i * 0.09 + Math.random() * 0.04;
    tone(280 + Math.random() * 320, 120, 0.035, 'square', 0.05, when);
  }
  // Final landing thock.
  tone(190, 90, 0.09, 'triangle', 0.09, 0.62);
}

export function sfxSuccess(): void {
  tone(523, 523, 0.11, 'sine', 0.08);
  tone(784, 784, 0.18, 'sine', 0.08, 0.11);
}

export function sfxFail(): void {
  tone(240, 130, 0.28, 'sawtooth', 0.05);
}

/** Impact thud when a unit or Nexus takes damage. */
export function sfxHit(): void {
  tone(170, 50, 0.16, 'triangle', 0.12);
}

/** Band-passed noise burst — paper, cloth and air sounds. */
function noise(duration: number, freq: number, q: number, gain: number, when = 0, sweepTo?: number): void {
  const ac = audio();
  if (!ac) return;
  const start = ac.currentTime + when;
  const buffer = ac.createBuffer(1, Math.ceil(ac.sampleRate * duration), ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource();
  src.buffer = buffer;
  const filter = ac.createBiquadFilter();
  filter.type = 'bandpass';
  filter.Q.value = q;
  filter.frequency.setValueAtTime(freq, start);
  if (sweepTo) filter.frequency.exponentialRampToValueAtTime(sweepTo, start + duration);
  const amp = ac.createGain();
  amp.gain.setValueAtTime(0.0001, start);
  amp.gain.exponentialRampToValueAtTime(gain, start + duration * 0.25);
  amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  src.connect(filter).connect(amp).connect(ac.destination);
  src.start(start);
  src.stop(start + duration + 0.02);
}

/** A card turning over: a quick paper swish. */
export function sfxCardFlip(): void {
  noise(0.16, 2400, 1.4, 0.09, 0, 900);
}

/** A card sliding off the draw pile. */
export function sfxDeal(): void {
  noise(0.1, 3600, 2, 0.05);
  tone(900, 700, 0.04, 'triangle', 0.02, 0.05);
}

/** A unit slammed onto the board: low thump with a magical shimmer. */
export function sfxSummon(): void {
  tone(130, 55, 0.22, 'sine', 0.16);
  noise(0.12, 500, 0.8, 0.06);
  tone(880, 1320, 0.25, 'sine', 0.025, 0.06);
}

/** A spell bolt whooshing toward its target. */
export function sfxSpell(): void {
  noise(0.45, 600, 1.2, 0.08, 0, 3000);
  tone(220, 660, 0.35, 'sawtooth', 0.025);
}
