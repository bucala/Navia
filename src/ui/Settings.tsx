import { useState } from 'react';
import { useLang, type Lang } from '../i18n';
import { getPlayerName, setPlayerName } from '../net/profile';
import { useProfileContext } from '../net/ProfileContext';
import { setMuted, useMuted } from './sfx';

/** ⚙ Nastavenia — language, sound and the summoner's name. */
export function Settings({ onBack }: { onBack: () => void }) {
  const { lang, setLang, t } = useLang();
  const muted = useMuted();
  const { refresh } = useProfileContext();
  const [name, setName] = useState(() => getPlayerName());
  const [saved, setSaved] = useState(false);

  const saveName = async () => {
    const trimmed = name.trim() || t('you');
    setPlayerName(trimmed);
    await refresh(trimmed); // sync the rename to the D1 profile and header when online
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const pickLang = (next: Lang) => setLang(next);
  const toggleSound = (next: boolean) => setMuted(!next);

  const choice = (active: boolean) =>
    `rounded-lg border px-4 py-2 text-sm font-semibold transition ${
      active
        ? 'border-amber-500 bg-amber-900/60 text-amber-100'
        : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-500'
    }`;

  return (
    <div className="mx-auto w-full max-w-md flex-1 overflow-y-auto p-6">
      <div className="menu-panel p-6">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-amber-100">
          <img src="/art/icons/icon-gear.svg" alt="" aria-hidden="true" className="h-6 w-6" />
          {t('set_title')}
        </h2>

        <h3 className="mt-6 text-[11px] font-bold uppercase tracking-widest text-slate-500">{t('set_lang')}</h3>
        <div className="mt-2 flex gap-2">
          <button onClick={() => pickLang('sk')} className={choice(lang === 'sk')}>
            🇸🇰 Slovenčina
          </button>
          <button onClick={() => pickLang('en')} className={choice(lang === 'en')}>
            🇬🇧 English
          </button>
        </div>

        <h3 className="mt-6 text-[11px] font-bold uppercase tracking-widest text-slate-500">{t('set_sound')}</h3>
        <div className="mt-2 flex gap-2">
          <button onClick={() => toggleSound(true)} className={`${choice(!muted)} inline-flex items-center gap-1.5`}>
            <img src="/art/icons/icon-speaker-on.svg" alt="" aria-hidden="true" className="h-4 w-4" />
            {t('set_sound_on')}
          </button>
          <button onClick={() => toggleSound(false)} className={`${choice(muted)} inline-flex items-center gap-1.5`}>
            <img src="/art/icons/icon-speaker-off.svg" alt="" aria-hidden="true" className="h-4 w-4" />
            {t('set_sound_off')}
          </button>
        </div>

        <h3 className="mt-6 text-[11px] font-bold uppercase tracking-widest text-slate-500">{t('set_name')}</h3>
        <div className="mt-2 flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('set_name_ph')}
            maxLength={20}
            className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-500"
          />
          <button
            onClick={saveName}
            className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-semibold text-amber-50 hover:bg-amber-600"
          >
            {saved ? t('set_saved') : t('set_save')}
          </button>
        </div>

        <button onClick={onBack} className="navia-back-btn mt-8">
          {t('back_menu')}
        </button>
      </div>
    </div>
  );
}
