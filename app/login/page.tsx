'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { loginWithEmail, signInWithGoogle, resetPassword } from '@/lib/firebase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await loginWithEmail(email, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { code?: string })?.code;
      if (msg === 'auth/invalid-credential' || msg === 'auth/wrong-password' || msg === 'auth/user-not-found') {
        setError('Invalid email or password. Please try again.');
      } else if (msg === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please reset your password or try later.');
      } else {
        setError('Login failed. Please check your credentials.');
      }
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { code?: string })?.code;
      if (msg !== 'auth/popup-closed-by-user') {
        setError('Google sign-in failed. Please try again.');
      }
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Enter your email address above, then click Forgot password.');
      return;
    }
    try {
      await resetPassword(email);
      setResetSent(true);
      setError('');
    } catch {
      setError('Could not send reset email. Check the address and try again.');
    }
  };

  return (
    <div className="auth-page">
      <div className="cyber-grid" />

      <div className="auth-container">
        {/* Left - Branding */}
        <div className="auth-branding">
          <div className="brand-content">
            <div className="shield-anim animate-float">
              <Shield size={64} />
              <div className="shield-glow" />
            </div>
            <h1>CyberShield <span className="text-green">AI</span></h1>
            <p>AI-Powered Cybersecurity Intelligence Platform</p>
            <div className="features-list">
              <div className="feature">🔍 Scan files &amp; URLs with 70+ engines</div>
              <div className="feature">📰 Real-time AI threat intelligence</div>
              <div className="feature">🤖 AI security advisor chatbot</div>
              <div className="feature">📊 Personalized security analytics</div>
            </div>
          </div>
        </div>

        {/* Right - Form */}
        <div className="auth-form-section">
          <div className="auth-form-card glass-card">
            <h2>Welcome Back</h2>
            <p className="form-subtitle">Sign in to your CyberShield account</p>

            {error && <div className="error-msg">{error}</div>}
            {resetSent && <div className="success-msg">✅ Password reset email sent! Check your inbox.</div>}

            {/* Google Sign In */}
            <button className="google-btn" onClick={handleGoogleLogin} disabled={loading} id="google-signin-btn">
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Sign in with Google
            </button>

            <div className="divider"><span>or continue with email</span></div>

            <form onSubmit={handleLogin} id="login-form">
              <div className="field">
                <div className="field-icon"><Mail size={16} /></div>
                <input
                  type="email"
                  id="login-email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-field"
                />
              </div>
              <div className="field">
                <div className="field-icon"><Lock size={16} /></div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-field"
                />
                <button type="button" className="toggle-pw" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="form-actions">
                <button type="button" className="forgot-link" onClick={handleForgotPassword}>
                  Forgot password?
                </button>
              </div>

              <button type="submit" id="login-submit-btn" className="btn-primary submit-btn" disabled={loading}>
                {loading ? <span className="animate-shield-pulse"><Shield size={18} /></span> : 'Sign In'}
              </button>
            </form>

            <p className="signup-link">
              Don&apos;t have an account? <Link href="/signup">Sign up</Link>
            </p>
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
        .text-green { color: var(--accent-green); }
        .brand-content > p { color: var(--text-secondary); font-size: 14px; }
        .features-list { display: flex; flex-direction: column; gap: 8px; text-align: left; margin-top: 12px; }
        .feature { font-size: 13px; color: var(--text-secondary); padding: 6px 0; }

        .auth-form-section { display: flex; align-items: center; justify-content: center; padding: 40px 20px; }
        .auth-form-card { padding: 40px; width: 100%; max-width: 400px; }
        .auth-form-card h2 { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
        .form-subtitle { color: var(--text-muted); font-size: 14px; margin-bottom: 24px; }
        .error-msg { padding: 10px 14px; background: rgba(255,59,59,0.1); border: 1px solid rgba(255,59,59,0.2); border-radius: 8px; color: var(--accent-red); font-size: 13px; margin-bottom: 16px; }
        .success-msg { padding: 10px 14px; background: rgba(0,255,136,0.08); border: 1px solid rgba(0,255,136,0.2); border-radius: 8px; color: var(--accent-green); font-size: 13px; margin-bottom: 16px; }

        .google-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface); color: var(--text-primary); font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; font-family: var(--font-ui); }
        .google-btn:hover { border-color: var(--accent-green); background: rgba(0,255,136,0.03); }

        .divider { display: flex; align-items: center; margin: 20px 0; }
        .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }
        .divider span { padding: 0 16px; font-size: 12px; color: var(--text-muted); white-space: nowrap; }

        .field { position: relative; margin-bottom: 14px; }
        .field .input-field { padding-left: 40px; padding-right: 40px; }
        .field-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
        .toggle-pw { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0; }

        .form-actions { display: flex; justify-content: flex-end; margin-bottom: 20px; }
        .forgot-link { font-size: 13px; color: var(--accent-green); background: none; border: none; cursor: pointer; padding: 0; font-family: var(--font-ui); }

        .submit-btn { width: 100%; padding: 14px; font-size: 15px; }

        .signup-link { text-align: center; margin-top: 20px; font-size: 13px; color: var(--text-muted); }
        .signup-link a { color: var(--accent-green); font-weight: 600; }
      `}</style>
    </div>
  );
}
