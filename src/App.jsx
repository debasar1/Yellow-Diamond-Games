import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';
import WalletPage from './pages/WalletPage';
import LeaderboardPage from './pages/LeaderboardPage';
import RegistrationPage from './pages/RegistrationPage';
import { supabase } from './lib/supabase';

/**
 * App — top-level router.
 * Also manages global auth state (logged-in user).
 */
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
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
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#FFD700' }}>
        <span style={{ fontFamily: 'Baloo 2', fontSize: 24, color: '#B71C1C' }}>लोड हो रहा है…</span>
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
