import { useEffect, useState } from 'react';
import { useLang } from '../i18n';
import { apiUrl } from '../net/api';

interface Entry {
  name: string;
  elo: number;
  wins: number;
  losses: number;
}

/** 🏆 Rebríček — top 10 by ELO (players with at least one ranked match). */
export function Leaderboard({ onBack }: { onBack: () => void }) {
  const { t } = useLang();
  const [players, setPlayers] = useState<Entry[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(apiUrl('/api/leaderboard'))
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data: { players: Entry[] }) => setPlayers(data.players))
      .catch(() => setError(true));
  }, []);

  return (
    <div className="mx-auto w-full max-w-lg flex-1 overflow-y-auto p-6">
      <div className="menu-panel p-6">
        <h2 className="text-2xl font-bold text-amber-100">{t('rank_title')}</h2>
        {error && <p className="mt-4 text-sm text-slate-400">{t('rank_error')}</p>}
        {players && players.length === 0 && (
          <p className="mt-4 text-sm text-slate-400">{t('rank_empty')}</p>
        )}
        {players && players.length > 0 && (
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-left text-[11px] uppercase tracking-widest text-slate-500">
                <th className="py-2 pr-2">#</th>
                <th className="py-2">{t('rank_player')}</th>
                <th className="py-2 text-right">ELO</th>
                <th className="py-2 text-right">{t('rank_wl')}</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p, i) => (
                <tr key={`${p.name}-${i}`} className="border-b border-slate-800/60">
                  <td className="py-2 pr-2 font-bold text-amber-200">{i + 1}.</td>
                  <td className="py-2 text-slate-100">{p.name}</td>
                  <td className="py-2 text-right font-bold text-slate-100">{p.elo}</td>
                  <td className="py-2 text-right text-slate-400">
                    <span className="text-emerald-400">{p.wins}</span> / <span className="text-red-400">{p.losses}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <button onClick={onBack} className="navia-back-btn mt-6">
          ← {t('back_menu')}
        </button>
      </div>
    </div>
  );
}
