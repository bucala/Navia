import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const triggerAttackFeedback = async (damage) => {
  try {
    if (damage > 10) {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } else {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
  } catch (error) {
    console.warn("Haptická odozva nie je podporovaná.");
  }
};
