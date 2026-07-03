import type { ReactNode } from 'react';
import { useLang } from '../i18n';
import type { StringKey } from '../i18n/strings';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6 first:mt-0">
      <h2 className="text-lg font-bold text-amber-200">{title}</h2>
      <div className="mt-1.5 space-y-2 text-sm leading-relaxed text-slate-300">{children}</div>
    </section>
  );
}

const KEYWORD_KEYS: StringKey[] = [
  'rules_kw_lava',
  'rules_kw_acid',
  'rules_kw_pest',
  'rules_kw_agile',
  'rules_kw_berserker',
  'rules_kw_flying',
];

/** 📜 Ako hrať — a rules primer surfaced from the main menu for new players. */
export function HowToPlay({ onBack }: { onBack: () => void }) {
  const { t } = useLang();
  return (
    <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto p-6">
      <h1 className="text-2xl font-bold text-amber-100">{t('rules_title')}</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">{t('rules_intro')}</p>

      <Section title={t('rules_goal_title')}>
        <p>{t('rules_goal_body')}</p>
      </Section>

      <Section title={t('rules_mana_title')}>
        <p>{t('rules_mana_body')}</p>
        <p>{t('rules_phases_body')}</p>
      </Section>

      <Section title={t('rules_lanes_title')}>
        <p>{t('rules_lanes_body')}</p>
      </Section>

      <Section title={t('rules_dice_title')}>
        <p>{t('rules_dice_body')}</p>
        <p>{t('rules_dice_advantage')}</p>
        <p>{t('rules_dice_chain')}</p>
      </Section>

      <Section title={t('rules_keywords_title')}>
        <ul className="list-disc space-y-1.5 pl-5">
          {KEYWORD_KEYS.map((key) => (
            <li key={key}>{t(key)}</li>
          ))}
        </ul>
      </Section>

      <Section title={t('rules_win_title')}>
        <p>{t('rules_win_body')}</p>
      </Section>

      <button onClick={onBack} className="mt-8 text-xs text-slate-400 hover:text-slate-200">
        {t('back_menu')}
      </button>
    </div>
  );
}
