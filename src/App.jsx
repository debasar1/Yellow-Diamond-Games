import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';
import WalletPage from './pages/WalletPage';
import LeaderboardPage from './pages/LeaderboardPage';
import RegistrationPage from './pages/RegistrationPage';
import { supabase, hasSupabase } from './lib/supabase';

const LS_USER = 'yd_user';

/**
 * App — top-level router.
 * Also manages global auth state (logged-in user).
 */
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (hasSupabase) {
      // Check existing session on mount
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        setLoading(false);
      });

      // Listen for auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });

      return () => subscription.unsubscribe();
    }

    // ── localStorage fallback: restore user from previous session ────────────
    try {
      const stored = JSON.parse(localStorage.getItem(LS_USER));
      if (stored) setUser(stored);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        height: '100vh', gap: 16,
        background: '#fff8f7',
        backgroundImage: 'radial-gradient(#ffdad5 2px, transparent 2px)',
        backgroundSize: '32px 32px'
      }}>
        <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 28, fontWeight: 800, color: '#b3291e' }}>YD</span>
        <div style={{
          width: 40, height: 40,
          border: '3px solid #ffdad5',
          borderTopColor: '#b3291e',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite'
        }} />
        <span style={{ fontFamily: 'Be Vietnam Pro, sans-serif', fontSize: 14, color: '#534341' }}>लोड हो रहा है…</span>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/"             element={<HomePage user={user} />} />
      <Route path="/game/:format" element={<GamePage user={user} />} />
      <Route path="/wallet"       element={<WalletPage user={user} />} />
      <Route path="/leaderboard"  element={<LeaderboardPage user={user} />} />
      <Route path="/register"     element={<RegistrationPage onSuccess={(u) => { setUser(u); navigate('/wallet'); }} />} />
    </Routes>
  );
}
