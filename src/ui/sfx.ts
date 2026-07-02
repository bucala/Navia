/**
 * Procedural sound effects via WebAudio (GDD §6) — no audio assets
 * needed. Everything plays after a user gesture, so autoplay policies
 * are satisfied. Muting is persisted in localStorage.
 */

let ctx: AudioContext | null = null;
let muted = typeof localStorage !== 'undefined' && localStorage.getItem('pantheon-muted') === '1';

export function isMuted(): boolean {
  return muted;
}

export function setMuted(value: boolean): void {
  muted = value;
  localStorage.setItem('pantheon-muted', value ? '1' : '0');
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
