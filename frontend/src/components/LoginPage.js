import React, { useState, useEffect, useRef } from 'react';
import { authAPI, setTokens } from '../api';
import { placeholderImg } from '../utils/placeholder';
/* ── OTP 6-box input ── */
function OTPInput({ value, onChange, disabled }) {
  const inputs = useRef([]);
  const digits  = Array.from({ length: 6 }, (_, i) => value[i] || '');

  const focus = (i) => inputs.current[i]?.focus();

  const handleChange = (i, e) => {
    const char = e.target.value.replace(/\D/g, '').slice(-1);
    const arr  = [...digits];
    arr[i]     = char;
    onChange(arr.join(''));
    if (char && i < 5) focus(i + 1);
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace') {
      const arr = [...digits];
      if (arr[i]) { arr[i] = ''; onChange(arr.join('')); }
      else if (i > 0) { arr[i - 1] = ''; onChange(arr.join('')); focus(i - 1); }
    } else if (e.key === 'ArrowLeft'  && i > 0) focus(i - 1);
    else if  (e.key === 'ArrowRight' && i < 5) focus(i + 1);
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted.padEnd(6, '').slice(0, 6));
    focus(Math.min(pasted.length, 5));
    e.preventDefault();
  };

  return (
    <div style={{ display:'flex', gap:'8px', justifyContent:'center', margin:'20px 0' }}>
      {digits.map((d, i) => (
        <input key={i}
          ref={el => inputs.current[i] = el}
          value={d} maxLength={1} disabled={disabled}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={e => { e.target.select(); e.target.style.borderColor='rgba(201,169,110,0.9)'; }}
          onBlur={e  => e.target.style.borderColor= d ? 'rgba(201,169,110,0.7)' : 'rgba(255,255,255,0.12)'}
          style={{
            width:'46px', height:'54px', textAlign:'center',
            fontSize:'22px', fontWeight:700, fontFamily:'Georgia,serif',
            background:'rgba(255,255,255,0.06)',
            border:`2px solid ${d ? 'rgba(201,169,110,0.7)' : 'rgba(255,255,255,0.12)'}`,
            borderRadius:'12px', color:'#c9a96e', outline:'none',
            transition:'border-color .15s', caretColor:'transparent',
          }}
        />
      ))}
    </div>
  );
}

/* ════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════ */
export default function LoginPage({ navigate, setUser }) {
  /*
    screens:
      login | register
      verify-email        enter email OTP after register
      forgot-options      enter email to reset password
      reset-email-otp     OTP + new password
  */
  const [screen,  setScreen]  = useState('login');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [showPw,  setShowPw]  = useState(false);

  const [loginForm, setLoginForm] = useState({ email:'', password:'' });
  const [regForm,   setRegForm]   = useState({
    first_name:'', last_name:'', email:'',
    phone:'', password:'', confirm_password:'',
  });
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPw, setNewPw] = useState({ new_password:'', confirm_password:'' });

  const [otp,       setOtp]       = useState('');
  const [otpTarget, setOtpTarget] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const go = (s) => { setScreen(s); setError(''); setSuccess(''); setOtp(''); };

  const errMsg = (err) => {
    const d = err?.response?.data;
    if (!d) return 'Something went wrong. Try again.';
    if (typeof d === 'string') return d;
    const msg = d?.error || d?.detail || d?.message ||
      d?.non_field_errors?.[0] ||
      d?.email?.[0] || d?.password?.[0] ||
      (typeof Object.values(d)[0] === 'string'
        ? Object.values(d)[0]
        : Object.values(d).flat()[0]);
    return msg || 'Something went wrong.';
  };

  const saveUser = (userData, tokens) => {
    setTokens(tokens.access, tokens.refresh);
    const u = {
      id:           userData.id,
      firstName:    userData.first_name,
      lastName:     userData.last_name,
      email:        userData.email,
      phone:        userData.phone,
      is_staff:     userData.is_staff,
      is_superuser: userData.is_superuser,
    };
    localStorage.setItem('aslivo_current_user', JSON.stringify(u));
    setUser(u);
  };

  /* ── handlers ── */
  const handleLogin = async () => {
    if (!loginForm.email || !loginForm.password) { setError('Enter email and password'); return; }
    setLoading(true); setError('');
    try {
      const res = await authAPI.login(loginForm);
      saveUser(res.data.user, res.data.tokens);
      navigate('home');
    } catch (err) { setError(errMsg(err)); }
    finally { setLoading(false); }
  };

  const handleRegister = async () => {
    if (!regForm.first_name.trim())          { setError('First name required'); return; }
    if (!regForm.email.includes('@'))         { setError('Valid email required'); return; }
    if (regForm.password.length < 6)          { setError('Password min 6 chars'); return; }
    if (regForm.password !== regForm.confirm_password) { setError('Passwords do not match'); return; }
    setLoading(true); setError('');
    try {
      const res = await authAPI.register(regForm);
      setTokens(res.data.tokens.access, res.data.tokens.refresh);
      const u = {
        id: res.data.user.id, firstName: res.data.user.first_name,
        lastName: res.data.user.last_name, email: res.data.user.email,
        phone: res.data.user.phone,
      };
      localStorage.setItem('aslivo_current_user', JSON.stringify(u));
      setUser(u);
      setOtpTarget(regForm.email);
      // Auto-send email OTP right after registration
      await authAPI.sendEmailOTP({ email: regForm.email });
      setCountdown(60);
      go('verify-email');
    } catch (err) { setError(errMsg(err)); }
    finally { setLoading(false); }
  };

  const sendEmailOTP = async () => {
    try {
      await authAPI.sendEmailOTP({ email: otpTarget });
      setCountdown(60);
    } catch (err) { setError(errMsg(err)); }
  };

  const handleVerifyEmail = async () => {
    if (otp.length < 6) { setError('Enter the 6-digit code'); return; }
    setLoading(true); setError('');
    try {
      await authAPI.verifyEmailOTP({ email: otpTarget, otp });
      setSuccess('Email verified! ✅');
      setTimeout(() => navigate('home'), 1200);
    } catch (err) { setError(errMsg(err)); }
    finally { setLoading(false); }
  };

  const handleForgotEmail = async () => {
    if (!forgotEmail.includes('@')) { setError('Enter a valid email'); return; }
    setLoading(true); setError('');
    try {
      await authAPI.forgotPasswordEmail({ email: forgotEmail });
      setOtpTarget(forgotEmail);
      setCountdown(60);
      go('reset-email-otp');
    } catch (err) { setError(errMsg(err)); }
    finally { setLoading(false); }
  };

  const handleResetEmail = async () => {
    if (otp.length < 6)                 { setError('Enter the 6-digit code'); return; }
    if (!newPw.new_password)             { setError('Enter a new password'); return; }
    if (newPw.new_password.length < 6)  { setError('Min 6 characters'); return; }
    if (newPw.new_password !== newPw.confirm_password) { setError('Passwords do not match'); return; }
    setLoading(true); setError('');
    try {
      const res = await authAPI.resetPasswordEmail({
        email: otpTarget, otp,
        new_password: newPw.new_password, confirm_password: newPw.confirm_password,
      });
      setTokens(res.data.tokens.access, res.data.tokens.refresh);
      setSuccess('Password reset! Logging you in…');
      setTimeout(() => navigate('home'), 1400);
    } catch (err) { setError(errMsg(err)); }
    finally { setLoading(false); }
  };

  /* ════ STYLES ════ */
  const inp = {
    width:'100%', background:'rgba(255,255,255,0.05)',
    border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px',
    padding:'12px 16px', color:'#fff', fontSize:'14px',
    outline:'none', fontFamily:'inherit', boxSizing:'border-box', transition:'border-color .15s',
  };
  const lbl = {
    fontSize:'9px', fontWeight:800, letterSpacing:'0.12em',
    textTransform:'uppercase', color:'rgba(255,255,255,0.38)',
    display:'block', marginBottom:'7px',
  };
  const primaryBtn = (disabled) => ({
    width:'100%', padding:'14px', borderRadius:'100px', border:'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily:'inherit', fontSize:'12px', fontWeight:800,
    letterSpacing:'0.09em', textTransform:'uppercase', marginTop:'4px',
    background: disabled ? 'rgba(201,169,110,0.35)' : 'linear-gradient(135deg,#c9a96e,#b8935a)',
    color:'#0d1b2a', opacity: disabled ? .7 : 1, transition:'opacity .15s',
  });
  const ghostBtn = (color='rgba(255,255,255,0.65)') => ({
    width:'100%', padding:'12px', borderRadius:'100px',
    border:'1px solid rgba(255,255,255,0.1)', cursor:'pointer',
    fontFamily:'inherit', fontSize:'12px', fontWeight:700,
    background:'rgba(255,255,255,0.04)', color, transition:'all .15s', marginTop:'8px',
  });
  const lnk = { color:'#c9a96e', cursor:'pointer', fontWeight:700 };
  const iF  = (e) => e.target.style.borderColor='rgba(201,169,110,0.55)';
  const iB  = (e) => e.target.style.borderColor='rgba(255,255,255,0.1)';

  const Alert = ({ msg, type='error' }) => !msg ? null : (
    <div style={{
      background: type==='error'?'rgba(239,68,68,0.1)':'rgba(34,197,94,0.1)',
      border:`1px solid ${type==='error'?'rgba(239,68,68,0.28)':'rgba(34,197,94,0.28)'}`,
      borderRadius:'10px', padding:'10px 14px', marginBottom:'14px',
      fontSize:'13px', color: type==='error'?'#f87171':'#4ade80',
      display:'flex', alignItems:'center', gap:'8px',
    }}>
      {type==='error'?'⚠️':'✅'} {msg}
    </div>
  );

  const Back = ({ to }) => (
    <button onClick={() => go(to)}
      style={{ background:'none', border:'none', cursor:'pointer',
        color:'rgba(255,255,255,0.35)', fontSize:'12px', fontFamily:'inherit',
        marginBottom:'14px', padding:0, display:'block' }}>
      ← Back
    </button>
  );

  const Divider = () => (
    <div style={{ display:'flex', alignItems:'center', gap:'10px', margin:'14px 0' }}>
      <div style={{ flex:1, height:'1px', background:'rgba(255,255,255,0.07)' }} />
      <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.25)' }}>or</span>
      <div style={{ flex:1, height:'1px', background:'rgba(255,255,255,0.07)' }} />
    </div>
  );

  const Resend = ({ onResend }) => (
    <p style={{ textAlign:'center', fontSize:'12px', color:'rgba(255,255,255,0.32)', marginTop:'14px' }}>
      Didn't receive it?{' '}
      {countdown > 0
        ? <span style={{ color:'rgba(255,255,255,0.2)' }}>Resend in {countdown}s</span>
        : <span style={lnk} onClick={onResend}>Resend Code</span>
      }
    </p>
  );

  /* ════ RENDER ════ */
  return (
    <div style={{
      minHeight:'100vh', background:'#0a0c18',
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:'20px 16px', fontFamily:'system-ui,-apple-system,sans-serif',
    }}>
      <div style={{ position:'fixed', top:'30%', left:'50%', transform:'translateX(-50%)',
        width:'500px', height:'500px', borderRadius:'50%',
        background:'rgba(201,169,110,0.04)', filter:'blur(80px)', pointerEvents:'none' }} />

      <div style={{
        width:'100%', maxWidth:'440px', position:'relative', zIndex:1,
        background:'rgba(255,255,255,0.03)', border:'1px solid rgba(201,169,110,0.15)',
        borderRadius:'24px', padding:'32px 28px', boxShadow:'0 24px 64px rgba(0,0,0,0.55)',
      }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'22px' }}>
          <span style={{ fontSize:'22px', fontWeight:800, color:'#c9a96e',
            letterSpacing:'0.12em', textTransform:'uppercase', fontFamily:'Georgia,serif' }}>
            🛍️ Aslivo
          </span>
        </div>

        {/* ══ LOGIN ══ */}
        {screen === 'login' && <>
          <h2 style={{ fontSize:'1.5rem', fontWeight:700, color:'#fff', fontFamily:'Georgia,serif',
            textAlign:'center', margin:'0 0 5px' }}>Welcome Back</h2>
          <p style={{ textAlign:'center', fontSize:'13px', color:'rgba(255,255,255,0.35)', marginBottom:'20px' }}>
            Sign in to your account
          </p>
          <Alert msg={error} /><Alert msg={success} type="success" />

          <div style={{ marginBottom:'12px' }}>
            <label style={lbl}>Email</label>
            <input style={inp} type="email" placeholder="you@example.com"
              value={loginForm.email}
              onChange={e=>{ setLoginForm(p=>({...p,email:e.target.value})); setError(''); }}
              onKeyDown={e=>e.key==='Enter'&&handleLogin()} onFocus={iF} onBlur={iB} />
          </div>
          <div style={{ marginBottom:'6px' }}>
            <label style={lbl}>Password</label>
            <div style={{ position:'relative' }}>
              <input style={{ ...inp, paddingRight:'44px' }}
                type={showPw?'text':'password'} placeholder="Enter your password"
                value={loginForm.password}
                onChange={e=>{ setLoginForm(p=>({...p,password:e.target.value})); setError(''); }}
                onKeyDown={e=>e.key==='Enter'&&handleLogin()} onFocus={iF} onBlur={iB} />
              <button onClick={()=>setShowPw(!showPw)}
                style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)',
                  background:'none', border:'none', cursor:'pointer', fontSize:'16px' }}>
                {showPw?'🙈':'👁️'}
              </button>
            </div>
          </div>
          <div style={{ textAlign:'right', marginBottom:'18px' }}>
            <span style={{ ...lnk, fontSize:'12px' }} onClick={()=>go('forgot-options')}>
              Forgot password?
            </span>
          </div>

          <button style={primaryBtn(loading)} onClick={handleLogin} disabled={loading}>
            {loading?'⏳ Signing In…':'→ Sign In'}
          </button>
          <Divider />
          <button style={ghostBtn()} onClick={()=>go('register')}>Create New Account →</button>
          <button style={{ ...ghostBtn('rgba(255,255,255,0.3)'), fontSize:'12px' }}
            onClick={()=>navigate('shop')}>
            Continue as Guest
          </button>
        </>}

        {/* ══ REGISTER ══ */}
        {screen === 'register' && <>
          <Back to="login" />
          <h2 style={{ fontSize:'1.5rem', fontWeight:700, color:'#fff', fontFamily:'Georgia,serif', margin:'0 0 16px' }}>
            Create Account
          </h2>
          <Alert msg={error} />

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'10px' }}>
            <div>
              <label style={lbl}>First Name *</label>
              <input style={inp} placeholder="Ali" value={regForm.first_name}
                onChange={e=>{ setRegForm(p=>({...p,first_name:e.target.value})); setError(''); }}
                onFocus={iF} onBlur={iB} />
            </div>
            <div>
              <label style={lbl}>Last Name</label>
              <input style={inp} placeholder="Khan" value={regForm.last_name}
                onChange={e=>setRegForm(p=>({...p,last_name:e.target.value}))}
                onFocus={iF} onBlur={iB} />
            </div>
          </div>

          {[
            { k:'email',            l:'Email *',         t:'email',    p:'you@example.com'  },
            { k:'phone',            l:'Phone (optional)', t:'tel',      p:'03XX-XXXXXXX'     },
            { k:'password',         l:'Password *',       t:'password', p:'Min 6 characters' },
            { k:'confirm_password', l:'Confirm Password *', t:'password', p:'Repeat password' },
          ].map(f => (
            <div key={f.k} style={{ marginBottom:'10px' }}>
              <label style={lbl}>{f.l}</label>
              <input style={inp} type={f.t} placeholder={f.p} value={regForm[f.k]}
                onChange={e=>{ setRegForm(p=>({...p,[f.k]:e.target.value})); setError(''); }}
                onFocus={iF} onBlur={iB} />
            </div>
          ))}

          <button style={primaryBtn(loading)} onClick={handleRegister} disabled={loading}>
            {loading?'⏳ Creating Account…':'Create Account →'}
          </button>
          <p style={{ textAlign:'center', marginTop:'14px', fontSize:'13px', color:'rgba(255,255,255,0.35)' }}>
            Already have an account?{' '}
            <span style={lnk} onClick={()=>go('login')}>Sign In →</span>
          </p>
        </>}

        {/* ══ VERIFY EMAIL OTP ══ */}
        {screen === 'verify-email' && <>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:'44px', marginBottom:'10px' }}>📧</div>
            <h2 style={{ fontSize:'1.4rem', fontWeight:700, color:'#fff', fontFamily:'Georgia,serif', margin:'0 0 6px' }}>
              Check Your Email
            </h2>
            <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.38)', margin:0 }}>
              We sent a 6-digit code to{' '}
              <strong style={{ color:'#c9a96e' }}>{otpTarget}</strong>
            </p>
          </div>
          <Alert msg={error} /><Alert msg={success} type="success" />
          <OTPInput value={otp} onChange={setOtp} disabled={loading} />
          <button style={primaryBtn(loading || otp.length < 6)}
            onClick={handleVerifyEmail} disabled={loading || otp.length < 6}>
            {loading?'⏳ Verifying…':'Verify Email ✅'}
          </button>
          <Resend onResend={async()=>{ await sendEmailOTP(); setSuccess('New code sent!'); setTimeout(()=>setSuccess(''),3000); }} />
          <div style={{ textAlign:'center', marginTop:'14px' }}>
            <span style={{ ...lnk, fontSize:'12px' }} onClick={()=>navigate('home')}>
              Skip for now →
            </span>
          </div>
        </>}

        {/* ══ FORGOT PASSWORD ══ */}
        {screen === 'forgot-options' && <>
          <Back to="login" />
          <div style={{ textAlign:'center', marginBottom:'20px' }}>
            <div style={{ fontSize:'44px', marginBottom:'10px' }}>🔐</div>
            <h2 style={{ fontSize:'1.4rem', fontWeight:700, color:'#fff', fontFamily:'Georgia,serif', margin:'0 0 6px' }}>
              Reset Password
            </h2>
            <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.38)', margin:0 }}>
              Enter your email to receive a reset code
            </p>
          </div>
          <Alert msg={error} />

          <div style={{ marginBottom:'12px' }}>
            <label style={lbl}>Email Address</label>
            <input style={inp} type="email" placeholder="your@email.com"
              value={forgotEmail}
              onChange={e=>{ setForgotEmail(e.target.value); setError(''); }}
              onFocus={iF} onBlur={iB}
              onKeyDown={e=>e.key==='Enter'&&handleForgotEmail()} />
          </div>
          <button style={primaryBtn(loading)} onClick={handleForgotEmail} disabled={loading}>
            {loading ? '⏳ Sending…' : 'Send Reset Code →'}
          </button>
        </>}

        {/* ══ RESET VIA EMAIL OTP ══ */}
        {screen === 'reset-email-otp' && <>
          <Back to="forgot-options" />
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:'40px', marginBottom:'8px' }}>📧</div>
            <h2 style={{ fontSize:'1.3rem', fontWeight:700, color:'#fff', fontFamily:'Georgia,serif', margin:'0 0 5px' }}>
              Enter Code + New Password
            </h2>
            <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.38)', margin:0 }}>
              Code sent to <strong style={{ color:'#c9a96e' }}>{otpTarget}</strong>
            </p>
          </div>
          <Alert msg={error} /><Alert msg={success} type="success" />
          <OTPInput value={otp} onChange={setOtp} disabled={loading} />
          <div style={{ marginBottom:'10px' }}>
            <label style={lbl}>New Password</label>
            <input style={inp} type="password" placeholder="Min 6 characters"
              value={newPw.new_password}
              onChange={e=>{ setNewPw(p=>({...p,new_password:e.target.value})); setError(''); }}
              onFocus={iF} onBlur={iB} />
          </div>
          <div style={{ marginBottom:'14px' }}>
            <label style={lbl}>Confirm New Password</label>
            <input style={inp} type="password" placeholder="Repeat new password"
              value={newPw.confirm_password}
              onChange={e=>{ setNewPw(p=>({...p,confirm_password:e.target.value})); setError(''); }}
              onFocus={iF} onBlur={iB} />
          </div>
          <button style={primaryBtn(loading || otp.length < 6)}
            onClick={handleResetEmail} disabled={loading || otp.length < 6}>
            {loading?'⏳ Resetting…':'🔒 Reset Password'}
          </button>
          <Resend onResend={handleForgotEmail} />
        </>}

        <p style={{ textAlign:'center', fontSize:'11px', color:'rgba(255,255,255,0.18)',
          marginTop:'20px', lineHeight:1.6 }}>
          By continuing you agree to our{' '}
          <span style={lnk}>Terms</span> and <span style={lnk}>Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}