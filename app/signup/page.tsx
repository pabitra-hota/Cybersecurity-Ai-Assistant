'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { registerWithEmail, signInWithGoogle } from '@/lib/firebase';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');

  const passwordStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) ? 4 : 3;
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', 'var(--accent-red)', 'var(--accent-amber)', 'var(--accent-blue)', 'var(--accent-green)'];

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await registerWithEmail(name, email, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please sign in instead.');
      } else if (code === 'auth/weak-password') {
        setError('Password is too weak. Use at least 6 characters.');
      } else if (code === 'auth/invalid-email') {
        setError('Invalid email address format.');
      } else {
        setError('Sign-up failed. Please try again.');
      }
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        // User closed the popup — not an error
      } else if (code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized for Google sign-in. Please contact support.');
      } else if (code === 'auth/popup-blocked') {
        setError('Popup was blocked by your browser. Please allow popups for this site and try again.');
      } else if (code === 'auth/network-request-failed') {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(`Google sign-up failed (${code ?? 'unknown'}). Please try again.`);
      }
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="cyber-grid" />
      <div className="auth-container">
        <div className="auth-branding">
          <div className="brand-content">
            <div className="shield-anim animate-float"><Shield size={64} /><div className="shield-glow" /></div>
            <h1>CyberShield <span style={{ color: 'var(--accent-green)' }}>AI</span></h1>
            <p>Join thousands protecting themselves with AI-powered cybersecurity</p>
          </div>
        </div>

        <div className="auth-form-section">
          <div className="auth-form-card glass-card">
            <h2>Create Account</h2>
            <p className="form-subtitle">Start your cybersecurity journey</p>

            {error && <div className="error-msg">{error}</div>}

            <button className="google-btn" id="google-signup-btn" onClick={handleGoogleSignup} disabled={loading}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Sign up with Google
            </button>

            <div className="divider"><span>or continue with email</span></div>

            <form onSubmit={handleSignup} id="signup-form">
              <div className="field"><div className="field-icon"><User size={16} /></div><input id="signup-name" className="input-field" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required style={{ paddingLeft: 40 }} /></div>
              <div className="field"><div className="field-icon"><Mail size={16} /></div><input id="signup-email" type="email" className="input-field" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ paddingLeft: 40 }} /></div>
              <div className="field">
                <div className="field-icon"><Lock size={16} /></div>
                <input id="signup-password" type={showPassword ? 'text' : 'password'} className="input-field" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ paddingLeft: 40, paddingRight: 40 }} />
                <button type="button" className="toggle-pw" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
              {password && (
                <div className="strength-bar">
                  <div className="strength-fill" style={{ width: `${passwordStrength * 25}%`, background: strengthColors[passwordStrength] }} />
                  <span style={{ color: strengthColors[passwordStrength] }}>{strengthLabels[passwordStrength]}</span>
                </div>
              )}
              <div className="field"><div className="field-icon"><Lock size={16} /></div><input id="signup-confirm-password" type="password" className="input-field" placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required style={{ paddingLeft: 40 }} /></div>

              <label className="terms-row">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                <span>I agree to the Terms of Service and Privacy Policy</span>
              </label>

              <button type="submit" id="signup-submit-btn" className="btn-primary submit-btn" disabled={loading || !agreed || password !== confirmPassword}>
                {loading ? <span className="animate-shield-pulse"><Shield size={18} /></span> : 'Create Account'}
              </button>
            </form>

            <p className="login-link">Already have an account? <Link href="/login">Sign in</Link></p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg-primary); position: relative; overflow: hidden; }
        .auth-container { display: grid; grid-template-columns: 1fr 1fr; width: 100%; max-width: 1000px; min-height: 600px; margin: 20px; position: relative; z-index: 1; }
        @media (max-width: 768px) { .auth-container { grid-template-columns: 1fr; } .auth-branding { display: none; } }
        .auth-branding { display: flex; align-items: center; justify-content: center; padding: 40px; }
        .brand-content { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 20px; }
        .shield-anim { position: relative; color: var(--accent-green); }
        .shield-glow { position: absolute; inset: -20px; background: radial-gradient(circle, rgba(0,255,136,0.15), transparent 70%); border-radius: 50%; z-index: -1; }
        .brand-content h1 { font-size: 32px; font-weight: 700; }
        .brand-content > p { color: var(--text-secondary); font-size: 14px; }
        .auth-form-section { display: flex; align-items: center; justify-content: center; padding: 40px 20px; }
        .auth-form-card { padding: 36px; width: 100%; max-width: 400px; }
        .auth-form-card h2 { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
        .form-subtitle { color: var(--text-muted); font-size: 14px; margin-bottom: 20px; }
        .error-msg { padding: 10px 14px; background: rgba(255,59,59,0.1); border: 1px solid rgba(255,59,59,0.2); border-radius: 8px; color: var(--accent-red); font-size: 13px; margin-bottom: 16px; }
        .google-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface); color: var(--text-primary); font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; font-family: var(--font-ui); }
        .google-btn:hover { border-color: var(--accent-green); }
        .divider { display: flex; align-items: center; margin: 16px 0; }
        .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }
        .divider span { padding: 0 16px; font-size: 12px; color: var(--text-muted); white-space: nowrap; }
        .field { position: relative; margin-bottom: 12px; }
        .field-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
        .toggle-pw { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0; }
        .strength-bar { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; height: 4px; background: var(--bg-surface); border-radius: 2px; overflow: hidden; }
        .strength-fill { height: 100%; border-radius: 2px; transition: all 0.3s; }
        .strength-bar span { font-size: 11px; font-weight: 600; white-space: nowrap; }
        .terms-row { display: flex; align-items: center; gap: 8px; margin: 16px 0; font-size: 12px; color: var(--text-secondary); cursor: pointer; }
        .terms-row input { accent-color: var(--accent-green); }
        .submit-btn { width: 100%; padding: 14px; font-size: 15px; }
        .login-link { text-align: center; margin-top: 16px; font-size: 13px; color: var(--text-muted); }
        .login-link a { color: var(--accent-green); font-weight: 600; }
      `}</style>
    </div>
  );
}
