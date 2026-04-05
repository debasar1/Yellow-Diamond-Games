import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getLeaderboard } from '../lib/gameApi';
import styles from './LeaderboardPage.module.css';

/**
 * Leaderboard Page — today's top 10 scores, Stitch design system.
 */
export default function LeaderboardPage({ user }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isHindi = i18n.language === 'hi';

  const [entries, setEntries] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard(user?.id)
      .then(({ top10, myRank }) => {
        setEntries(top10 ?? []);
        setUserRank(myRank);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  const medal = (i) => {
    const medals = ['🥇', '🥈', '🥉'];
    return medals[i] ?? null;
  };

  return (
    <div className={`${styles.wrapper} bg-pattern`}>
      {/* Header */}
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          <span className="material-symbols-outlined icon-md">arrow_back</span>
        </button>
        <div>
          <p className={styles.headerLabel}>YELLOW DIAMOND</p>
          <h1 className={styles.headerTitle}>
            {isHindi ? 'आज का Leaderboard' : "Today's Leaderboard"}
          </h1>
        </div>
      </div>

      {/* Date chip */}
      <div style={{ padding: '0 20px 12px' }}>
        <span className="chip chip-yellow">
          <span className="material-symbols-outlined icon-sm" style={{ marginRight: 4 }}>today</span>
          {new Date().toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN', { dateStyle: 'medium' })}
        </span>
      </div>

      {/* List */}
      <div className={styles.list}>
        {loading ? (
          <div className={styles.centered}>
            <div className="spinner" />
          </div>
        ) : entries.length === 0 ? (
          <div className={styles.empty}>
            <span className="material-symbols-outlined icon-xl" style={{ color: 'var(--color-outline)' }}>
              emoji_events
            </span>
            <p>{isHindi ? 'आज अभी तक कोई score नहीं। पहले बनें!' : 'No scores yet today. Be the first!'}</p>
          </div>
        ) : (
          entries.map((entry, i) => (
            <div
              key={entry.user_id ?? i}
              className={`leaderboard-row ${i < 3 ? `rank-${i + 1}` : ''} ${entry.user_id === user?.id ? 'is-me' : ''}`}
            >
              <div className="leaderboard-rank">
                {medal(i) ?? <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>{i + 1}</span>}
              </div>
              <div className="leaderboard-name">
                {entry.display_name || 'Player'}
                {entry.user_id === user?.id && (
                  <span className={styles.youTag}> ({isHindi ? 'आप' : 'You'})</span>
                )}
              </div>
              <div className="leaderboard-score">
                {entry.score.toLocaleString('en-IN')}
              </div>
            </div>
          ))
        )}

        {/* User rank below top 10 */}
        {!loading && userRank && userRank > 10 && (
          <>
            <div className={styles.separator}>· · ·</div>
            <div className="leaderboard-row is-me">
              <div className="leaderboard-rank">#{userRank}</div>
              <div className="leaderboard-name">{isHindi ? 'आप' : 'You'}</div>
              <div className="leaderboard-score">
                {entries.find(e => e.user_id === user?.id)?.score?.toLocaleString('en-IN') ?? '–'}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Play CTA */}
      <div style={{ padding: '8px 20px 24px' }}>
        <button className="btn-primary" onClick={() => navigate('/')}>
          <span className="material-symbols-outlined icon-md">sports_esports</span>
          {isHindi ? 'खेलें और Rank बढ़ाएं' : 'Play & Climb the Ranks'}
        </button>
      </div>
    </div>
  );
}
