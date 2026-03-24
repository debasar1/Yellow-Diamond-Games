import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getLeaderboard } from '../lib/gameApi';
import styles from './LeaderboardPage.module.css';

/**
 * Leaderboard Page — shows today's top 10 scores.
 * Uses Supabase real-time subscription for live updates.
 */
export default function LeaderboardPage({ user }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard(user?.id).then(({ top10, myRank }) => {
      setEntries(top10);
      setUserRank(myRank);
      setLoading(false);
    });
  }, []);

  const medal = (i) => ['🥇', '🥈', '🥉'][i] || `${i + 1}.`;

  return (
    <div className={styles.container}>
      <button className={styles.back} onClick={() => navigate('/')}>← {t('common.back')}</button>
      <h2 className={styles.title}>🏆 {t('leaderboard.title')}</h2>
      <p className={styles.subtitle}>{t('leaderboard.today')}</p>

      {loading ? (
        <p style={{ textAlign: 'center', marginTop: 40 }}>लोड हो रहा है…</p>
      ) : (
        <div className={styles.list}>
          {entries.map((entry, i) => (
            <div
              key={entry.user_id}
              className={`${styles.row} ${entry.user_id === user?.id ? styles.myRow : ''}`}
            >
              <span className={styles.rank}>{medal(i)}</span>
              <span className={styles.name}>{entry.display_name || 'Player'}</span>
              <span className={styles.score}>{entry.score.toLocaleString('en-IN')}</span>
            </div>
          ))}

          {userRank && userRank > 10 && (
            <>
              <div className={styles.divider}>…</div>
              <div className={`${styles.row} ${styles.myRow}`}>
                <span className={styles.rank}>#{userRank}</span>
                <span className={styles.name}>{t('leaderboard.you')}</span>
                <span className={styles.score}>{entries.find(e => e.user_id === user?.id)?.score?.toLocaleString('en-IN') || '–'}</span>
              </div>
            </>
          )}

          {entries.length === 0 && (
            <p style={{ textAlign: 'center', color: '#888', marginTop: 24 }}>
              {t('leaderboard.empty')}
            </p>
          )}
        </div>
      )}

      <button className={styles.btnPlay} onClick={() => navigate('/')}>
        🎮 {t('wallet.playAgain')}
      </button>
    </div>
  );
}
