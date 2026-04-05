import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getWallet } from '../lib/gameApi';
import styles from './WalletPage.module.css';

/**
 * Wallet Page — matches Stitch screen_3
 * "Your YD Wallet / आपका YD वॉलेट"
 * Large balance display, earned/redeemed bento, redeem CTA (coming soon)
 */
export default function WalletPage({ user }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isHindi = i18n.language === 'hi';

  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/register'); return; }
    getWallet(user.id)
      .then(data => { setWallet(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user, navigate]);

  if (loading) {
    return (
      <div className={styles.centered}>
        <div className="spinner" />
      </div>
    );
  }

  const earned   = wallet?.total_coins_earned   ?? 0;
  const redeemed = wallet?.total_coins_redeemed ?? 0;
  const balance  = earned - redeemed;

  return (
    <div className={`${styles.wrapper} bg-pattern`}>
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          <span className="material-symbols-outlined icon-md">arrow_back</span>
        </button>
        <div>
          <p className={styles.headerLabel}>YELLOW DIAMOND</p>
          <h1 className={styles.headerTitle}>
            {isHindi ? 'आपका YD वॉलेट' : 'Your YD Wallet'}
          </h1>
        </div>
      </div>

      {/* ── Balance hero card ──────────────────────────────── */}
      <div className={styles.balanceCard}>
        <p className={styles.balanceLabel}>
          {isHindi ? 'YD Coins बैलेंस' : 'YD Coins Balance'}
        </p>
        <div className={styles.balanceRow}>
          <img src="/assets/ui/yd_coin_icon.webp" className={styles.balanceCoinIcon} alt="" />
          <span className={styles.balanceNum}>{balance.toLocaleString()}</span>
        </div>
        <p className={styles.balanceSub}>YD Coins</p>
      </div>

      {/* ── Stats bento ─────────────────────────────────────── */}
      <div className="bento-grid" style={{ margin: '0 20px 20px' }}>
        <div className="bento-cell">
          <span className="bento-value" style={{ color: 'var(--color-tertiary)' }}>
            {earned.toLocaleString()}
          </span>
          <span className="bento-label">{isHindi ? 'कमाए' : 'Earned'}</span>
        </div>
        <div className="bento-cell">
          <span className="bento-value" style={{ color: 'var(--color-secondary)' }}>
            {redeemed.toLocaleString()}
          </span>
          <span className="bento-label">{isHindi ? 'Redeem किए' : 'Redeemed'}</span>
        </div>
      </div>

      {/* ── Redeem card (coming soon) ──────────────────────── */}
      <div className={styles.redeemCard}>
        <div className={styles.redeemHeader}>
          <span className="material-symbols-outlined icon-lg" style={{ color: 'var(--color-secondary)' }}>
            local_grocery_store
          </span>
          <div>
            <p className={styles.redeemTitle}>
              {isHindi ? 'जल्द आ रहा है!' : 'Coming Soon!'}
            </p>
            <p className={styles.redeemSub}>
              {isHindi
                ? 'Blinkit & Zepto पर Coins Redeem करें'
                : 'Redeem Coins on Blinkit & Zepto'}
            </p>
          </div>
        </div>
        <p className={styles.redeemDesc}>
          {isHindi
            ? 'अपने YD Coins को Blinkit और Zepto पर Yellow Diamond products के discount में बदलें।'
            : 'Convert your YD Coins into discounts on Yellow Diamond products on Blinkit and Zepto.'}
        </p>
        <div className={styles.partnerLogos}>
          <span className={styles.partnerChip}>Blinkit</span>
          <span className={styles.partnerChip}>Zepto</span>
        </div>
        <button className={`btn-primary ${styles.redeemBtn}`} disabled style={{ opacity: 0.5 }}>
          <span className="material-symbols-outlined icon-md">redeem</span>
          {isHindi ? 'Coming Soon' : 'Coming Soon'}
        </button>
      </div>

      {/* ── Play again ──────────────────────────────────────── */}
      <div style={{ padding: '12px 20px 0' }}>
        <button className="btn-secondary" onClick={() => navigate('/')}>
          <span className="material-symbols-outlined icon-md">sports_esports</span>
          {isHindi ? 'फिर खेलें' : 'Play Again'}
        </button>
      </div>
    </div>
  );
}
