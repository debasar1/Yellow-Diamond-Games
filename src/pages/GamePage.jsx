import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Phaser from 'phaser';
import GameConfig from '../game/config';
import { saveSession } from '../lib/gameApi';
import styles from './GamePage.module.css';

/**
 * GamePage — mounts the Phaser canvas and bridges game events to React.
 * Handles navigation to Registration when game-over + coins > 0.
 */
export default function GamePage({ user }) {
  const { format } = useParams();   // 'runner' | 'breaker'
  const navigate = useNavigate();
  const gameRef = useRef(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [pendingSession, setPendingSession] = useState(null);

  useEffect(() => {
    // Boot Phaser into #game-container
    const config = {
      ...GameConfig,
      // Start directly in the chosen format scene after Preload
    };
    const game = new Phaser.Game(config);
    gameRef.current = game;

    // Store chosen format so Preload can hand off to correct scene
    game.registry.set('startFormat', format);

    // Listen for game events bridged from Phaser scenes
    game.events.on('preload-complete', () => {
      game.scene.start(format === 'runner' ? 'Runner' : 'Breaker');
    });

    game.events.on('show-registration', (sessionData) => {
      setPendingSession(sessionData);
      if (user) {
        // Already logged in — save session and go to wallet
        saveSession({ ...sessionData, userId: user.id }).then(() => {
          navigate('/wallet');
        });
      } else {
        setShowOverlay(true);
      }
    });

    return () => {
      game.destroy(true);
      gameRef.current = null;
    };
  }, [format]);

  const handleRegisterClick = () => {
    // Store pending session in sessionStorage to pick up after registration
    if (pendingSession) {
      sessionStorage.setItem('pendingSession', JSON.stringify(pendingSession));
    }
    navigate('/register');
  };

  return (
    <div className={styles.wrapper}>
      <div id="game-container" className={styles.canvas} />

      {/* Overlay prompting registration after game over */}
      {showOverlay && (
        <div className={styles.overlay}>
          <div className={styles.overlayCard}>
            <p className={styles.overlayTitle}>🪙 {pendingSession?.coins || 0} YD Coins!</p>
            <p className={styles.overlayDesc}>
              Register to save your coins and win real rewards!
              <br />
              <span style={{ fontSize: 13, color: '#888' }}>Coins जमा हो जाएंगे — Register करें!</span>
            </p>
            <button className={styles.btnRegister} onClick={handleRegisterClick}>
              Register Now / अभी Register करें
            </button>
            <button className={styles.btnSkip} onClick={() => navigate('/')}>
              Skip for now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
