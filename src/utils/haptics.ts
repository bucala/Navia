/**
 * Native haptic feedback on impact (Capacitor). A short, sharp pulse
 * scaled to how hard the hit landed — mirrors the way `sfxHit` gives
 * every damage event an audio cue (useCombatFx.ts).
 */
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export async function triggerAttackFeedback(damage: number): Promise<void> {
  try {
    await Haptics.impact({ style: damage > 10 ? ImpactStyle.Heavy : ImpactStyle.Light });
  } catch {
    // Unsupported on this platform (e.g. web browsers) — safe to ignore.
  }
}
