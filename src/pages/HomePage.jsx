import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './HomePage.module.css';

/**
 * Home / Splash Page
 * Shows the game logo, tagline, play buttons for both formats, and wallet CTA.
 */
export default function HomePage({ user }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === 'hi' ? 'en' : 'hi');
  };

  return (
    <div className={styles.container}>
      {/* Language toggle */}
      <button className={styles.langToggle} onClick={toggleLang}>
        {i18n.language === 'hi' ? 'English' : 'हिंदी'}
      </button>

      {/* Logo / Mascot */}
      <div className={styles.logoWrap}>
        {/* Replace with <img src="/assets/brand/logo.webp" alt="Yellow Diamond" /> when assets arrive */}
        <div className={styles.logoPlaceholder}>🟡</div>
        <h1 className={styles.title}>{t('home.title')}</h1>
        <p className={styles.tagline}>{t('home.tagline')}</p>
      </div>

      {/* Play buttons */}
      <div className={styles.btnGroup}>
        <button className={styles.btnPrimary} onClick={() => navigate('/game/runner')}>
          🏃 {t('home.playRunner')}
        </button>
        <button className={styles.btnSecondary} onClick={() => navigate('/game/breaker')}>
          🧱 {t('home.playBreaker')}
        </button>
      </div>

      {/* Wallet / score CTA */}
      {user ? (
        <button className={styles.btnWallet} onClick={() => navigate('/wallet')}>
          🪙 {t('home.myWallet')}
        </button>
      ) : (
        <p className={styles.loginHint}>{t('home.loginHint')}</p>
      )}

      {/* Leaderboard link */}
      <button className={styles.btnLink} onClick={() => navigate('/leaderboard')}>
        🏆 {t('home.leaderboard')}
      </button>
    </div>
  );
}
