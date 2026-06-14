import React, { useState } from 'react';
import logo from '../assets/logo.png';
import { setTokens } from '../api';
import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000';

export default function AdminLogin({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      setError('Please enter both email and password');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // Step 1 — Login via custom auth endpoint
      const res = await axios.post(`${BASE_URL}/api/auth/login/`, {
        email: form.email,
        password: form.password,
      });

      const { user, tokens } = res.data;

      // Step 2 — Save tokens immediately
      setTokens(tokens.access, tokens.refresh);

      // Step 3 — Verify staff using profile endpoint with token
      const profileRes = await axios.get(`${BASE_URL}/api/auth/profile/`, {
        headers: { Authorization: `Bearer ${tokens.access}` },
      });

      const profile = profileRes.data;

      // Step 4 — Check staff
      if (!profile.is_staff && !profile.is_superuser) {
        setError('Access denied. Admin accounts only.');
        setLoading(false);
        return;
      }

      // Step 5 — Save and proceed
      localStorage.setItem('adminLoggedIn', 'true');
      localStorage.setItem('aslivo_current_user', JSON.stringify({
        id: profile.id,
        firstName: profile.first_name,
        lastName: profile.last_name,
        email: profile.email,
        is_staff: profile.is_staff,
        is_superuser: profile.is_superuser,
      }));

      onLogin();

    } catch (err) {
      const errData = err?.response?.data;
      setError(
        errData?.non_field_errors?.[0] ||
        errData?.error ||
        errData?.detail ||
        'Invalid email or password'
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a14] via-navy-500 to-[#0a0a14] flex items-center justify-center px-4 font-sans">

      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-gold-500/5 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/[0.03] border border-gold-500/15 rounded-3xl p-8 md:p-10 shadow-2xl backdrop-blur-xl">

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img src={logo} alt="Aslivo" className="h-12 w-auto object-contain" />
              <span className="font-display text-3xl font-bold text-gold-500 tracking-widest uppercase">
                Aslivo
              </span>
            </div>
            <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/20 rounded-full px-4 py-1.5 mb-3">
              <span className="w-2 h-2 rounded-full bg-gold-500 animate-pulse" />
              <span className="text-xs font-bold tracking-widest uppercase text-gold-500">
                Admin Panel
              </span>
            </div>
            <p className="text-white/35 text-sm">Sign in with your admin account</p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-3 mb-5 flex items-center gap-2 text-sm text-red-400">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold tracking-widest uppercase text-white/40 mb-2 block">
                Email Address
              </label>
              <input
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 outline-none focus:border-gold-500/50 text-sm font-sans transition-all"
                type="email"
                placeholder="admin@example.com"
                value={form.email}
                onChange={e => { setForm(p => ({ ...p, email: e.target.value })); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                autoComplete="email"
              />
            </div>

            <div>
              <label className="text-xs font-bold tracking-widest uppercase text-white/40 mb-2 block">
                Password
              </label>
              <div className="relative">
                <input
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 outline-none focus:border-gold-500/50 text-sm font-sans transition-all pr-12"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={form.password}
                  onChange={e => { setForm(p => ({ ...p, password: e.target.value })); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  autoComplete="current-password"
                />
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-gold-500 transition-colors bg-transparent border-none cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              className={`w-full py-4 rounded-xl text-sm font-bold tracking-widest uppercase transition-all duration-200 border-none cursor-pointer mt-2
                ${loading
                  ? 'bg-gold-500/50 text-navy-500/50 cursor-not-allowed'
                  : 'bg-gradient-to-r from-gold-500 to-gold-600 text-navy-500 hover:shadow-gold active:scale-95'
                }`}
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? '⏳ Signing in...' : '→ Sign In to Admin'}
            </button>
          </div>

          <div className="mt-6 pt-5 border-t border-white/[0.06]">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {[
                { icon: '🔒', text: 'Secure Access' },
                { icon: '🛡️', text: 'Admin Only' },
                { icon: '📊', text: 'Full Control' },
              ].map((b, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-white/25">
                  <span>{b.icon}</span>
                  <span>{b.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center mt-5 text-xs text-white/25">
          Not an admin?{' '}
          <span
            className="text-gold-500 cursor-pointer hover:text-gold-400 transition-colors font-semibold"
            onClick={() => window.location.reload()}
          >
            Back to Store →
          </span>
        </p>
      </div>
    </div>
  );
}