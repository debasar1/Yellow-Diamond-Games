import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getWallet } from '../lib/gameApi';
import styles from './WalletPage.module.css';

/**
 * Wallet Page — shows the user's YD Coin balance, lifetime score, and session history.
 * Redemption CTA is shown as "Coming Soon" in V0.
 */
export default function WalletPage({ user }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/register'); return; }
    getWallet(user.id).then(data => {
      setWallet(data);
      setLoading(false);
    });
  }, [user]);

  if (loading) return <div className={styles.loading}>🪙 लोड हो रहा है…</div>;

  const balance = (wallet?.total_coins_earned || 0) - (wallet?.total_coins_redeemed || 0);

  return (
    <div className={styles.container}>
      <button className={styles.back} onClick={() => navigate('/')}>← {t('common.back')}</button>
      <h2 className={styles.title}>🪙 {t('wallet.title')}</h2>

      {/* Balance card */}
      <div className={styles.balanceCard}>
        <p className={styles.balanceLabel}>{t('wallet.balance')}</p>
        <p className={styles.balanceNum}>{balance}</p>
        <p className={styles.balanceSub}>{t('wallet.ydCoins')}</p>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        <div className={styles.stat}>
          <p className={styles.statNum}>{wallet?.total_coins_earned || 0}</p>
          <p className={styles.statLabel}>{t('wallet.earned')}</p>
        </div>
        <div className={styles.stat}>
          <p className={styles.statNum}>{wallet?.total_coins_redeemed || 0}</p>
          <p className={styles.statLabel}>{t('wallet.redeemed')}</p>
        </div>
      </div>

      {/* Redeem CTA — V0 coming soon */}
      <div className={styles.redeemBox}>
        <p className={styles.redeemTitle}>🛒 {t('wallet.redeemSoon')}</p>
        <p className={styles.redeemDesc}>{t('wallet.redeemDesc')}</p>
        <button className={styles.btnComingSoon} disabled>
          {t('wallet.comingSoon')}
        </button>
      </div>

      {/* Play again */}
      <button className={styles.btnPlay} onClick={() => navigate('/')}>
        🎮 {t('wallet.playAgain')}
      </button>
    </div>
  );
}
