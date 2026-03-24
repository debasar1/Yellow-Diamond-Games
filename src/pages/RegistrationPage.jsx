import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sendOtp, verifyOtp } from '../lib/otp';
import { createOrLoginUser } from '../lib/userApi';
import { saveSession } from '../lib/gameApi';
import { supabase } from '../lib/supabase';
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
 * Multi-step registration flow:
 * Step 1 — Name, Mobile, City, DOB
 * Step 2 — OTP entry
 * Step 3 — Success → onSuccess callback
 */
export default function RegistrationPage({ onSuccess }) {
  const { t } = useTranslation();
  const [step, setStep] = useState(STEPS.DETAILS);
  const [form, setForm] = useState({ name: '', mobile: '', city: '', dob: '' });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateForm = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  // ── Step 1 submit ──────────────────────────────────────────────────────────
  const handleDetailSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || form.name.length < 2) { setError(t('reg.errorName')); return; }
    if (!/^[6-9]\d{9}$/.test(form.mobile)) { setError(t('reg.errorMobile')); return; }
    if (!form.city) { setError(t('reg.errorCity')); return; }

    // Age validation (must be 13+)
    if (form.dob) {
      const age = Math.floor((Date.now() - new Date(form.dob)) / (365.25 * 24 * 3600 * 1000));
      if (age < 13) { setError(t('reg.errorAge')); return; }
    }

    setLoading(true);
    try {
      await sendOtp(form.mobile);
      setStep(STEPS.OTP);
    } catch (err) {
      setError(t('reg.errorOtpSend'));
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2 OTP verify ────────────────────────────────────────────────────
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (otp.length !== 6) { setError(t('reg.errorOtpLength')); return; }

    setLoading(true);
    try {
      await verifyOtp(form.mobile, otp);
      // Create / update user record
      const user = await createOrLoginUser(form);
      // Save any pending game session
      const pending = sessionStorage.getItem('pendingSession');
      if (pending) {
        const session = JSON.parse(pending);
        await saveSession({ ...session, userId: user.id });
        sessionStorage.removeItem('pendingSession');
      }
      setStep(STEPS.DONE);
      setTimeout(() => onSuccess?.(user), 1200);
    } catch (err) {
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

        {step === STEPS.DETAILS && (
          <form onSubmit={handleDetailSubmit} className={styles.form}>
            <label>{t('reg.name')}</label>
            <input type="text" value={form.name} onChange={e => updateForm('name', e.target.value)}
              placeholder={t('reg.namePlaceholder')} maxLength={50} required />

            <label>{t('reg.mobile')}</label>
            <div className={styles.mobileRow}>
              <span className={styles.prefix}>+91</span>
              <input type="tel" value={form.mobile} onChange={e => updateForm('mobile', e.target.value.replace(/\D/g, ''))}
                placeholder="9876543210" maxLength={10} required />
            </div>

            <label>{t('reg.city')}</label>
            <select value={form.city} onChange={e => updateForm('city', e.target.value)} required>
              <option value="">{t('reg.selectCity')}</option>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <label>{t('reg.dob')}</label>
            <input type="date" value={form.dob} onChange={e => updateForm('dob', e.target.value)}
              max={new Date(Date.now() - 13 * 365.25 * 24 * 3600 * 1000).toISOString().split('T')[0]} />

            {error && <p className={styles.error}>{error}</p>}

            <p className={styles.consent}>{t('reg.consent')}</p>

            <button type="submit" className={styles.btnSubmit} disabled={loading}>
              {loading ? t('common.loading') : t('reg.sendOtp')}
            </button>
          </form>
        )}

        {step === STEPS.OTP && (
          <form onSubmit={handleOtpSubmit} className={styles.form}>
            <p className={styles.otpInfo}>{t('reg.otpSent', { mobile: form.mobile })}</p>
            <label>{t('reg.enterOtp')}</label>
            <input type="tel" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="------" maxLength={6} className={styles.otpInput} autoFocus />
            {error && <p className={styles.error}>{error}</p>}
            <button type="submit" className={styles.btnSubmit} disabled={loading || otp.length !== 6}>
              {loading ? t('common.loading') : t('reg.verifyOtp')}
            </button>
            <button type="button" className={styles.btnLink} onClick={() => { setStep(STEPS.DETAILS); setOtp(''); }}>
              {t('reg.changeNumber')}
            </button>
          </form>
        )}

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
