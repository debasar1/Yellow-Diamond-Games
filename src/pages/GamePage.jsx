import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Phaser from 'phaser';
import GameConfig from '../game/config';
import { saveSession } from '../lib/gameApi';
import { useTranslation } from 'react-i18next';
import styles from './GamePage.module.css';

/**
 * GamePage — mounts the Phaser canvas and bridges game events to React.
 * Game Over overlay matches Stitch screen_0:
 *   "GREAT RUN! / शानदार खेल!" → bento score grid → Unlock Wallet → Play Again
 */
export default function GamePage({ user }) {
  const { format } = useParams();     // 'runner' | 'breaker'
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const gameRef    = useRef(null);
  const containerRef = useRef(null);

  const [showGameOver, setShowGameOver] = useState(false);
  const [gameResult, setGameResult] = useState(null);   // { score, coins, distance }
  const [confettiActive, setConfettiActive] = useState(false);

  /* ── Boot Phaser ──────────────────────────────────────────── */
  useEffect(() => {
    const game = new Phaser.Game({
      ...GameConfig,
      parent: 'game-container',
    });
    gameRef.current = game;
    game.registry.set('startFormat', format);
    game.registry.set('lang', i18n.language);

    /* Phaser → React: preload done */
    game.events.on('preload-complete', () => {
      game.scene.start(format === 'runner' ? 'Runner' : 'Breaker');
    });

    /* Phaser → React: game over */
    game.events.on('show-registration', (sessionData) => {
      setGameResult(sessionData);
      setConfettiActive(true);

      if (user) {
        saveSession({ ...sessionData, userId: user.id }).catch(console.error);
      }

      // Brief delay so the game over scene can play its own animation first
      setTimeout(() => setShowGameOver(true), 400);
    });

    return () => {
      game.destroy(true);
      gameRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [format]);

  /* ── Actions ──────────────────────────────────────────────── */
  const handleUnlockWallet = useCallback(() => {
    if (gameResult) {
      sessionStorage.setItem('pendingSession', JSON.stringify(gameResult));
    }
    if (user) {
      navigate('/wallet');
    } else {
      navigate('/register');
    }
  }, [gameResult, user, navigate]);

  const handlePlayAgain = useCallback(() => {
    setShowGameOver(false);
    setConfettiActive(false);
    setGameResult(null);
    // Restart the appropriate Phaser scene
    if (gameRef.current) {
      const sceneName = format === 'runner' ? 'Runner' : 'Breaker';
      gameRef.current.scene.stop(sceneName);
      gameRef.current.scene.stop('HUD');
      gameRef.current.scene.stop('GameOver');
      gameRef.current.scene.start(sceneName);
    }
  }, [format]);

  const handleHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  /* ── Score display helpers ────────────────────────────────── */
  const isHindi = i18n.language === 'hi';
  const score     = gameResult?.score ?? 0;
  const coins     = gameResult?.coins ?? 0;
  const distanceM = gameResult?.distanceM ?? 0;
  const distanceKm = (distanceM / 1000).toFixed(1);

  const headline = isHindi ? 'शानदार खेल! 🎉' : 'GREAT RUN! 🎉';
  const subline  = isHindi ? `${score.toLocaleString()} अंक` : `${score.toLocaleString()} points`;

  return (
    <div className={styles.wrapper}>
      {/* Phaser canvas host */}
      <div id="game-container" className={styles.canvas} ref={containerRef} />

      {/* ── Game Over Overlay (Stitch screen_0) ──────────────── */}
      {showGameOver && (
        <div className={`${styles.overlay} fade-in`}>
          {/* Confetti dots background */}
          {confettiActive && <div className={styles.confettiDots} aria-hidden="true" />}

          <div className={`${styles.sheet} slide-up`}>
            {/* Header */}
            <div className={styles.sheetHeader}>
              <h2 className={styles.headline}>{headline}</h2>
              <p className={styles.subline}>{subline}</p>
            </div>

            {/* Bento score grid */}
            <div className="bento-grid" style={{ margin: '16px 20px' }}>
              <div className="bento-cell">
                <span className="bento-value">{score.toLocaleString()}</span>
                <span className="bento-label">{isHindi ? 'अंक' : 'Score'}</span>
              </div>
              <div className="bento-cell">
                <span className="bento-value" style={{ color: '#745b00' }}>
                  {coins}
                </span>
                <span className="bento-label">YD Coins</span>
              </div>
              {format === 'runner' && (
                <div className="bento-cell span-2">
                  <span className="bento-value">{distanceKm} km</span>
                  <span className="bento-label">{isHindi ? 'दूरी' : 'Distance'}</span>
                </div>
              )}
            </div>

            {/* Coin earned callout */}
            {coins > 0 && (
              <div className={styles.coinCallout}>
                <img src="/assets/ui/yd_coin_icon.png" className={styles.calloutIcon} alt="" />
                <span>
                  {isHindi
                    ? `आपने ${coins} YD Coins कमाए!`
                    : `You earned ${coins} YD Coins!`}
                </span>
              </div>
            )}

            {/* CTAs */}
            <div className={styles.ctas}>
              <button className="btn-primary" onClick={handleUnlockWallet}>
                <span className="material-symbols-outlined icon-md">account_balance_wallet</span>
                {user
                  ? (isHindi ? 'Wallet देखें' : 'View Wallet')
                  : (isHindi ? 'Wallet Unlock करें' : 'Unlock Wallet to Save Coins')}
              </button>

              <button className="btn-secondary" onClick={handlePlayAgain}>
                <span className="material-symbols-outlined icon-md">replay</span>
                {isHindi ? 'फिर खेलें' : 'Play Again'}
              </button>

              <button className={styles.homeLink} onClick={handleHome}>
                <span className="material-symbols-outlined icon-sm">home</span>
                {isHindi ? 'Home' : 'Home'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
