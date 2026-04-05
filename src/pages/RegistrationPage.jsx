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
 * Multi-step registration — Stitch design system
 * V0: email OTP (Supabase, zero cost)
 * V1 upgrade: swap otp.js to mobile OTP via MSG91 — no UI changes needed.
 */
export default function RegistrationPage({ onSuccess }) {
  const { t, i18n } = useTranslation();
  const isHindi = i18n.language === 'hi';

  const [step, setStep]   = useState(STEPS.DETAILS);
  const [form, setForm]   = useState({ name: '', email: '', city: '', dob: '' });
  const [otp, setOtp]     = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [consent, setConsent] = useState(false);

  const updateForm = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  /* ── Step 1: send OTP ─────────────────────────────────── */
  const handleDetailSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || form.name.length < 2) { setError(t('reg.errorName')); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError(t('reg.errorEmail')); return; }
    if (!form.city) { setError(t('reg.errorCity')); return; }
    if (form.dob) {
      const age = Math.floor((Date.now() - new Date(form.dob)) / (365.25 * 24 * 3600 * 1000));
      if (age < 13) { setError(t('reg.errorAge')); return; }
    }

    setLoading(true);
    Analytics.registrationStart?.();
    try {
      await sendOtp(form.email);
      setStep(STEPS.OTP);
    } catch {
      setError(t('reg.errorOtpSend'));
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 2: verify OTP ───────────────────────────────── */
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (otp.length !== 6) { setError(t('reg.errorOtpLength')); return; }

    setLoading(true);
    try {
      await verifyOtp(form.email, otp);
      Analytics.otpVerified?.(true);

      const user = await createOrLoginUser(form);
      Analytics.registrationComplete?.(form.city);

      const pending = sessionStorage.getItem('pendingSession');
      if (pending) {
        const session = JSON.parse(pending);
        await saveSession({ ...session, userId: user.id });
        sessionStorage.removeItem('pendingSession');
      }

      setStep(STEPS.DONE);
      setTimeout(() => onSuccess?.(user), 1200);
    } catch {
      Analytics.otpVerified?.(false);
      setError(t('reg.errorOtpInvalid'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles.wrapper} bg-pattern`}>
      {/* ── Progress dots ──────────────────────────────────── */}
      <div className={styles.progressDots}>
        {Object.values(STEPS).map((s, i) => (
          <div
            key={s}
            className={`${styles.dot} ${step === s ? styles.dotActive : ''} ${
              Object.values(STEPS).indexOf(step) > i ? styles.dotDone : ''
            }`}
          />
        ))}
      </div>

      <div className={`${styles.card} slide-up`}>
        {/* Header */}
        <div className={styles.cardHeader}>
          <span className="material-symbols-outlined icon-xl" style={{ color: 'var(--color-secondary)' }}>
            {step === STEPS.DONE ? 'celebration' : step === STEPS.OTP ? 'mark_email_unread' : 'person_add'}
          </span>
          <h2 className={styles.cardTitle}>{t('reg.title')}</h2>
          <p className={styles.cardSub}>{t('reg.subtitle')}</p>
        </div>

        {/* ── Step 1: Details ─────────────────────────────── */}
        {step === STEPS.DETAILS && (
          <form onSubmit={handleDetailSubmit} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>{t('reg.name')}</label>
              <input
                className="input-field"
                type="text"
                value={form.name}
                onChange={e => updateForm('name', e.target.value)}
                placeholder={t('reg.namePlaceholder')}
                maxLength={50}
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>{t('reg.email')}</label>
              <input
                className="input-field"
                type="email"
                value={form.email}
                onChange={e => updateForm('email', e.target.value.trim())}
                placeholder="you@example.com"
                required
                autoCapitalize="none"
                autoCorrect="off"
                inputMode="email"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>{t('reg.city')}</label>
              <select
                className={`input-field ${styles.select}`}
                value={form.city}
                onChange={e => updateForm('city', e.target.value)}
                required
              >
                <option value="">{t('reg.selectCity')}</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>{t('reg.dob')}</label>
              <input
                className="input-field"
                type="date"
                value={form.dob}
                onChange={e => updateForm('dob', e.target.value)}
                max={new Date(Date.now() - 13 * 365.25 * 24 * 3600 * 1000).toISOString().split('T')[0]}
              />
            </div>

            {/* Consent */}
            <label className={styles.consentRow}>
              <input
                type="checkbox"
                checked={consent}
                onChange={e => setConsent(e.target.checked)}
                className={styles.checkbox}
              />
              <span className={styles.consentText}>{t('reg.consent')}</span>
            </label>

            {error && <p className={styles.error}>{error}</p>}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !consent}
              style={{ marginTop: 8, opacity: (!consent) ? 0.6 : 1 }}
            >
              {loading ? (
                <><div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />{t('common.loading')}</>
              ) : (
                <><span className="material-symbols-outlined icon-md">send</span>{t('reg.sendOtp')}</>
              )}
            </button>
          </form>
        )}

        {/* ── Step 2: OTP ────────────────────────────────── */}
        {step === STEPS.OTP && (
          <form onSubmit={handleOtpSubmit} className={styles.form}>
            <div className={styles.otpInfoBox}>
              <p className={styles.otpSent}>{t('reg.otpSent', { contact: form.email })}</p>
              <p className={styles.otpHint}>{t('reg.otpHint')}</p>
            </div>

            {/* OTP digit boxes */}
            <div className={styles.otpBoxRow}>
              {Array.from({ length: 6 }, (_, i) => (
                <div
                  key={i}
                  className={`${styles.otpBox} ${otp[i] ? styles.otpBoxFilled : ''}`}
                >
                  {otp[i] || ''}
                </div>
              ))}
            </div>

            {/* Hidden actual input */}
            <input
              type="tel"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className={styles.otpHiddenInput}
              maxLength={6}
              autoFocus
              inputMode="numeric"
              pattern="[0-9]*"
            />

            {error && <p className={styles.error}>{error}</p>}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading || otp.length !== 6}
              style={{ marginTop: 16, opacity: otp.length !== 6 ? 0.6 : 1 }}
            >
              {loading ? (
                <><div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />{t('common.loading')}</>
              ) : (
                <><span className="material-symbols-outlined icon-md">verified</span>{t('reg.verifyOtp')}</>
              )}
            </button>

            <button
              type="button"
              className={styles.changeLink}
              onClick={() => { setStep(STEPS.DETAILS); setOtp(''); setError(''); }}
            >
              <span className="material-symbols-outlined icon-sm">edit</span>
              {t('reg.changeEmail')}
            </button>
          </form>
        )}

        {/* ── Step 3: Done ───────────────────────────────── */}
        {step === STEPS.DONE && (
          <div className={styles.successBox}>
            <div className={styles.successAnim}>🎉</div>
            <p className={styles.successText}>{t('reg.success', { name: form.name })}</p>
            <p className={styles.successSub}>
              {isHindi ? 'आपके Coins save हो रहे हैं…' : 'Saving your YD Coins…'}
            </p>
            <div className="spinner" style={{ margin: '16px auto 0' }} />
          </div>
        )}
      </div>
    </div>
  );
}
