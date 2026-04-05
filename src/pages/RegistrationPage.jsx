import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sendOtp, verifyOtp } from '../lib/otp';
import { createOrLoginUser } from '../lib/userApi';
import { saveSession } from '../lib/gameApi';
import { Analytics } from '../lib/analytics';
import styles from './RegistrationPage.module.css';

const CITIES = [
  'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata',
  'Surat', 'Pune', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Bhopal',
  'Visakhapatnam', 'Patna', 'Vadodara', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad',
  'Meerut', 'Rajkot', 'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar',
  'Allahabad', 'Ranchi', 'Howrah', 'Coimbatore', 'Jabalpur', 'Gwalior', 'Vijayawada',
  'Jodhpur', 'Madurai', 'Raipur', 'Kota', 'Chandigarh', 'Guwahati', 'Solapur',
  'Hubballi', 'Tiruchirappalli', 'Bareilly', 'Moradabad', 'Mysuru', 'Tiruppur', 'Other'
];

const STEPS = { DETAILS: 'details', OTP: 'otp', DONE: 'done' };

/**
 * Multi-step registration — V0 uses email OTP (zero cost, no external vendor).
 * V1 upgrade: swap otp.js to mobile OTP via MSG91 — no UI changes needed.
 *
 * Step 1 — Name, Email, City, DOB
 * Step 2 — 6-digit OTP from email
 * Step 3 — Success → onSuccess callback
 */
export default function RegistrationPage({ onSuccess }) {
  const { t } = useTranslation();
  const [step, setStep]   = useState(STEPS.DETAILS);
  const [form, setForm]   = useState({ name: '', email: '', city: '', dob: '' });
  const [otp, setOtp]     = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateForm = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  // ── Step 1 — collect details & send OTP ──────────────────────────────────
  const handleDetailSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || form.name.length < 2) {
      setError(t('reg.errorName')); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError(t('reg.errorEmail')); return;
    }
    if (!form.city) {
      setError(t('reg.errorCity')); return;
    }
    if (form.dob) {
      const age = Math.floor((Date.now() - new Date(form.dob)) / (365.25 * 24 * 3600 * 1000));
      if (age < 13) { setError(t('reg.errorAge')); return; }
    }

    setLoading(true);
    Analytics.registrationStart();
    try {
      await sendOtp(form.email);
      setStep(STEPS.OTP);
    } catch (err) {
      setError(t('reg.errorOtpSend'));
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2 — verify OTP ────────────────────────────────────────────────────
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (otp.length !== 6) { setError(t('reg.errorOtpLength')); return; }

    setLoading(true);
    try {
      await verifyOtp(form.email, otp);
      Analytics.otpVerified(true);

      // Upsert user profile in our users table
      const user = await createOrLoginUser(form);
      Analytics.registrationComplete(form.city);

      // Save any pending game session accumulated as guest
      const pending = sessionStorage.getItem('pendingSession');
      if (pending) {
        const session = JSON.parse(pending);
        await saveSession({ ...session, userId: user.id });
        sessionStorage.removeItem('pendingSession');
      }

      setStep(STEPS.DONE);
      setTimeout(() => onSuccess?.(user), 1200);
    } catch (err) {
      Analytics.otpVerified(false);
      setError(t('reg.errorOtpInvalid'));
    } finally {
      setLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>{t('reg.title')}</h2>
        <p className={styles.subtitle}>{t('reg.subtitle')}</p>

        {/* ── Step 1: Details form ── */}
        {step === STEPS.DETAILS && (
          <form onSubmit={handleDetailSubmit} className={styles.form}>
            <label>{t('reg.name')}</label>
            <input
              type="text"
              value={form.name}
              onChange={e => updateForm('name', e.target.value)}
              placeholder={t('reg.namePlaceholder')}
              maxLength={50}
              required
            />

            <label>{t('reg.email')}</label>
            <input
              type="email"
              value={form.email}
              onChange={e => updateForm('email', e.target.value.trim())}
              placeholder="you@example.com"
              required
              autoCapitalize="none"
              autoCorrect="off"
            />

            <label>{t('reg.city')}</label>
            <select value={form.city} onChange={e => updateForm('city', e.target.value)} required>
              <option value="">{t('reg.selectCity')}</option>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <label>{t('reg.dob')}</label>
            <input
              type="date"
              value={form.dob}
              onChange={e => updateForm('dob', e.target.value)}
              max={new Date(Date.now() - 13 * 365.25 * 24 * 3600 * 1000).toISOString().split('T')[0]}
            />

            {error && <p className={styles.error}>{error}</p>}
            <p className={styles.consent}>{t('reg.consent')}</p>

            <button type="submit" className={styles.btnSubmit} disabled={loading}>
              {loading ? t('common.loading') : t('reg.sendOtp')}
            </button>
          </form>
        )}

        {/* ── Step 2: OTP entry ── */}
        {step === STEPS.OTP && (
          <form onSubmit={handleOtpSubmit} className={styles.form}>
            <p className={styles.otpInfo}>
              {t('reg.otpSent', { contact: form.email })}
            </p>
            <p className={styles.otpHint}>{t('reg.otpHint')}</p>

            <label>{t('reg.enterOtp')}</label>
            <input
              type="tel"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="------"
              maxLength={6}
              className={styles.otpInput}
              autoFocus
            />

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className={styles.btnSubmit} disabled={loading || otp.length !== 6}>
              {loading ? t('common.loading') : t('reg.verifyOtp')}
            </button>
            <button
              type="button"
              className={styles.btnLink}
              onClick={() => { setStep(STEPS.DETAILS); setOtp(''); setError(''); }}
            >
              {t('reg.changeEmail')}
            </button>
          </form>
        )}

        {/* ── Step 3: Success ── */}
        {step === STEPS.DONE && (
          <div className={styles.successBox}>
            <div className={styles.successIcon}>🎉</div>
            <p className={styles.successText}>{t('reg.success', { name: form.name })}</p>
          </div>
        )}
      </div>
    </div>
  );
}
