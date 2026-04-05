import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getWallet } from '../lib/gameApi';
import styles from './HomePage.module.css';

/**
 * Home Screen — matches Stitch screen_4
 * Layout: bg-pattern, hero mascot, coin balance, PLAY NOW CTA,
 *         Snack Stack Smash secondary, torn-edge promo banner, bottom nav.
 */
export default function HomePage({ user }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [coins, setCoins] = useState(0);
  const [activeTab, setActiveTab] = useState('game');

  useEffect(() => {
    if (user) {
      getWallet(user.id)
        .then(w => setCoins((w?.total_coins_earned ?? 0) - (w?.total_coins_redeemed ?? 0)))
        .catch(() => {});
    }
  }, [user]);

  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === 'hi' ? 'en' : 'hi');
  };

  const handleNav = (tab) => {
    setActiveTab(tab);
    if (tab === 'wallet') navigate('/wallet');
    if (tab === 'rewards') navigate('/leaderboard');
  };

  return (
    <div className={styles.wrapper}>
      {/* ── Top bar ─────────────────────────────────────── */}
      <div className={styles.topBar}>
        {/* Logo */}
        <div className={styles.logoMark}>
          <img
            src="/assets/placeholder/logo.svg"
            alt="Yellow Diamond"
            className={styles.logoImg}
            onError={e => { e.target.style.display = 'none'; }}
          />
          <span className={styles.logoText}>YD</span>
        </div>

        <div className={styles.topRight}>
          {/* Language toggle */}
          <button className={styles.langBtn} onClick={toggleLang}>
            {i18n.language === 'hi' ? 'EN' : 'हि'}
          </button>

          {/* Coin balance pill (if logged in) */}
          {user && (
            <div className="coin-pill">
              <img src="/assets/ui/yd_coin_icon.webp" className="coin-icon" alt="" />
              <span>{coins}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Hero area ────────────────────────────────────── */}
      <div className={styles.hero}>
        {/* Mascot / product pack hero image */}
        <div className={styles.mascotWrap}>
          <img
            src="/assets/placeholder/pack_01.webp"
            alt="Yellow Diamond Chips"
            className={`${styles.mascot} snack-float`}
            onError={e => { e.currentTarget.style.display = 'none'; }}
          />
        </div>

        {/* Title */}
        <div className={styles.titleBlock}>
          <p className={styles.brandLabel}>YELLOW DIAMOND</p>
          <h1 className={styles.gameTitle}>{t('home.title')}</h1>
          <p className={styles.tagline}>{t('home.tagline')}</p>
        </div>
      </div>

      {/* ── CTAs ─────────────────────────────────────────── */}
      <div className={styles.ctaBlock}>
        {/* Primary: Crunch Run */}
        <button
          className={`btn-primary ${styles.playBtn} pulse`}
          onClick={() => navigate('/game/runner')}
        >
          <span className="material-symbols-outlined icon-md">directions_run</span>
          {t('home.playRunner')}
        </button>

        {/* Secondary: Snack Stack Smash */}
        <button
          className={`btn-secondary ${styles.secondaryBtn}`}
          onClick={() => navigate('/game/breaker')}
        >
          <span className="material-symbols-outlined icon-md">view_module</span>
          {t('home.playBreaker')}
        </button>

        {/* Guest hint */}
        {!user && (
          <p className={styles.guestHint}>{t('home.loginHint')}</p>
        )}
      </div>

      {/* ── Promo banner (torn-edge, green) ──────────────── */}
      <div className={`${styles.promoBanner} torn-edge`}>
        <div className={styles.promoInner}>
          <span className="material-symbols-outlined" style={{ color: '#95f990' }}>local_offer</span>
          <div>
            <p className={styles.promoTitle}>Redeem on Blinkit & Zepto!</p>
            <p className={styles.promoSub}>Earn YD Coins → Get snack discounts</p>
          </div>
          <span className={styles.promoBadge}>Coming Soon</span>
        </div>
      </div>

      {/* ── Bottom Nav ───────────────────────────────────── */}
      <nav className="bottom-nav safe-bottom">
        <div
          className={`nav-item ${activeTab === 'game' ? 'active' : ''}`}
          onClick={() => handleNav('game')}
        >
          <span className="material-symbols-outlined">sports_esports</span>
          <span>Game</span>
        </div>
        <div
          className={`nav-item ${activeTab === 'wallet' ? 'active' : ''}`}
          onClick={() => handleNav('wallet')}
        >
          <span className="material-symbols-outlined">account_balance_wallet</span>
          <span>Wallet</span>
        </div>
        <div
          className={`nav-item ${activeTab === 'rewards' ? 'active' : ''}`}
          onClick={() => handleNav('rewards')}
        >
          <span className="material-symbols-outlined">emoji_events</span>
          <span>Rewards</span>
        </div>
      </nav>
    </div>
  );
}
