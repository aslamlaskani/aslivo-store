import React, { useState, useEffect, useRef } from 'react';
import logo from '../assets/logo.png';
import song1 from '../assets/music/song1.mp3';
import song2 from '../assets/music/song2.mp3';
import song3 from '../assets/music/song3.mp3';
import song4 from '../assets/music/song4.mp3';
import { placeholderImg } from '../utils/placeholder';
/* ─────────────────────────────────────────────
   PLAYLIST — replace src with your own tracks
   Free music: pixabay.com/music / mixkit.co
───────────────────────────────────────────── */
const PLAYLIST = [
  { title: 'Song 1', artist: 'Aslivo Store', src: song1 },
  { title: 'Song 2', artist: 'Aslivo Store', src: song2 },
  { title: 'Song 3', artist: 'Aslivo Store', src: song3 },
  { title: 'Song 4', artist: 'Aslivo Store', src: song4 },
];

/* ── Avatar — shows uploaded photo if present, else initial, else generic icon ── */
function UserAvatar({ user, size = 22, fontSize = 10 }) {
  const initial = user?.firstName?.charAt(0) || user?.email?.charAt(0) || '';

  if (user?.avatar) {
    return (
      <div style={{ width:`${size}px`, height:`${size}px`, borderRadius:'50%', flexShrink:0,
        backgroundImage:`url(${user.avatar})`, backgroundSize:'cover',
        backgroundPosition:'center', border:'1px solid rgba(255,255,255,0.08)' }} />
    );
  }

  if (initial) {
    return (
      <div style={{ width:`${size}px`, height:`${size}px`, borderRadius:'50%', flexShrink:0,
        background:'linear-gradient(135deg,#c9a96e,#b8935a)',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:`${fontSize}px`, fontWeight:800, color:'#0d1b2a' }}>
        {initial.toUpperCase()}
      </div>
    );
  }

  return (
    <div style={{ width:`${size}px`, height:`${size}px`, borderRadius:'50%', flexShrink:0,
      background:'linear-gradient(135deg,#c9a96e,#b8935a)',
      display:'flex', alignItems:'center', justifyContent:'center' }}>
      <svg width={size*0.55} height={size*0.55} viewBox="0 0 24 24" fill="none"
        stroke="#0d1b2a" strokeWidth="2.2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    </div>
  );
}

export default function Navbar({ navigate, cartCount, currentPage, wishlist, user, handleLogout, onSearch }) {
  const [menuOpen, setMenuOpen]         = useState(false);
  const [scrolled, setScrolled]         = useState(false);
  const [searchOpen, setSearchOpen]     = useState(false);
  const [searchQuery, setSearchQuery]   = useState('');

  /* music */
  const [trackIdx, setTrackIdx]         = useState(0);
  const [playing, setPlaying]           = useState(false);
  const [autoplay, setAutoplay]         = useState(true);
  const [volume, setVolume]             = useState(0.35);
  const [progress, setProgress]         = useState(0);
  const [playerOpen, setPlayerOpen]     = useState(false);
  const audioRef  = useRef(null);
  const progRef   = useRef(null);
  const track     = PLAYLIST[trackIdx];

  /* scroll */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  /* body lock */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  /* audio core — re-runs when track changes */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    audio.src    = track.src;
    audio.load();
    if (playing) audio.play().catch(() => setPlaying(false));

    const onEnded = () => {
      if (autoplay) setTrackIdx(i => (i + 1) % PLAYLIST.length);
      else setPlaying(false);
    };
    const onTime = () => {
      if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
    };
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('timeupdate', onTime);
    return () => {
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('timeupdate', onTime);
    };
  }, [trackIdx]);

  /* volume sync */
  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume; }, [volume]);

 /* autoplay on first user gesture — catches ANY interaction */
useEffect(() => {
  let triggered = false;

  const tryPlay = () => {
    if (triggered) return;
    triggered = true;
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    audio.play()
      .then(() => setPlaying(true))
      .catch(() => {});
    ['click','touchstart','keydown','scroll','mousemove'].forEach(evt =>
      document.removeEventListener(evt, tryPlay)
    );
  };

  ['click','touchstart','keydown','scroll','mousemove'].forEach(evt =>
    document.addEventListener(evt, tryPlay, { passive: true })
  );

  return () => {
    ['click','touchstart','keydown','scroll','mousemove'].forEach(evt =>
      document.removeEventListener(evt, tryPlay)
    );
  };
}, []);
  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { a.play().catch(() => {}); setPlaying(true); }
  };

  const skipTrack = (dir) => {
    const next = (trackIdx + dir + PLAYLIST.length) % PLAYLIST.length;
    setTrackIdx(next);
    setTimeout(() => { if (playing) audioRef.current?.play().catch(() => {}); }, 80);
  };

  const selectTrack = (i) => {
    setTrackIdx(i);
    setTimeout(() => { audioRef.current?.play().catch(() => {}); setPlaying(true); }, 80);
  };

  const seekTo = (e) => {
    const a = audioRef.current;
    if (!a?.duration || !progRef.current) return;
    const r   = progRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    a.currentTime = pct * a.duration;
    setProgress(pct * 100);
  };

  const handleSearch = (q) => {
    const query = q || searchQuery;
    if (query.trim()) { onSearch(query.trim()); setSearchOpen(false); setSearchQuery(''); setMenuOpen(false); }
  };

  const navLinks   = [{ page:'home', label:'Home' }, { page:'shop', label:'Shop' }];
  const quickTags  = ['Men', 'Women', 'Bags', 'Sneakers', 'Jackets', 'Dresses'];
  const mobileLinks = [
    { page:'home',      label:'Home',        icon:'🏠' },
    { page:'shop',      label:'Shop',        icon:'🛍️' },
    { page:'flashsale', label:'Flash Sale',  icon:'🔥', hot:true },
    { page:'tracking',  label:'Track Order', icon:'📦' },
    { page:'wishlist',  label:`Wishlist${wishlist?.length>0?` (${wishlist.length})`:''}`, icon:'❤️' },
    { page:'cart',      label:`Cart${cartCount>0?` (${cartCount})`:''}`, icon:'🛒' },
    user
      ? { page:'account', label:'My Account', icon:'👤' }
      : { page:'login',   label:'Sign In / Register', icon:'🔐' },
  ];

  const NAVBAR_H   = 56;
  const TOP_BAR_H  = 40;
  const TOP_OFFSET = TOP_BAR_H + NAVBAR_H;

  return (
    <>
      <audio ref={audioRef} preload="auto" style={{ display:'none' }} />

      <style>{`
        @keyframes flicker  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.2)} }
        @keyframes spin     { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes barPulse { 0%,100%{height:5px} 50%{height:14px} }
        @keyframes marquee  { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }

        .flicker { animation:flicker 2s ease infinite; display:inline-block; }

        .nb-icon {
          position:relative; width:36px; height:36px; border-radius:9px;
          border:none; background:transparent; cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          transition:background .18s; flex-shrink:0;
        }
        .nb-icon:hover { background:rgba(255,255,255,0.07); }
        .nb-badge {
          position:absolute; top:3px; right:3px;
          font-size:9px; font-weight:800; border-radius:50%;
          width:15px; height:15px;
          display:flex; align-items:center; justify-content:center;
          border:1.5px solid #0d1b2a; pointer-events:none;
        }
        .nav-link {
          padding:7px 13px; border-radius:9px; font-size:13px; font-weight:600;
          cursor:pointer; transition:all .18s; letter-spacing:.02em;
          border:none; background:transparent; white-space:nowrap; font-family:inherit;
        }
        .nav-link:hover { background:rgba(201,169,110,.08); color:#c9a96e; }

        .desktop-only { display:none !important; }
        .mobile-only  { display:flex  !important; }
        .logo-text    { display:none; }
        @media(min-width:360px) { .logo-text { display:block; } }
        @media(min-width:768px) {
          .desktop-only { display:flex !important; }
          .mobile-only  { display:none !important; }
          .logo-text    { display:block !important; }
        }

        /* eq bars */
        .eq-bar { width:3px; border-radius:2px; background:#c9a96e; }
        .eq-bar:nth-child(1) { animation:barPulse .55s ease infinite; }
        .eq-bar:nth-child(2) { animation:barPulse .55s ease .12s infinite; }
        .eq-bar:nth-child(3) { animation:barPulse .55s ease .25s infinite; }

        /* vinyl */
        .vinyl { animation:spin 4s linear infinite; }
        .vinyl.paused { animation-play-state:paused; }

        /* track title scroll */
        .marquee-wrap  { overflow:hidden; white-space:nowrap; }
        .marquee-inner { display:inline-block; animation:marquee 9s linear infinite; }

        /* player controls */
        .ctrl { width:32px; height:32px; border-radius:50%; border:none;
          background:rgba(255,255,255,0.06); cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          color:#fff; flex-shrink:0; transition:background .15s; }
        .ctrl:hover  { background:rgba(255,255,255,0.13); }
        .ctrl.big    { width:42px; height:42px; background:linear-gradient(135deg,#c9a96e,#b8935a) !important; color:#0d1b2a; }
        .ctrl.big:hover { opacity:.9; }

        /* progress bar */
        .prog-wrap { cursor:pointer; height:4px; border-radius:100px;
          background:rgba(255,255,255,0.09); position:relative; }
        .prog-fill { height:100%; border-radius:100px;
          background:linear-gradient(90deg,#c9a96e,#e8c98a); pointer-events:none; }
        .prog-wrap:hover::after {
          content:''; position:absolute; top:50%; right:auto;
          width:10px; height:10px; border-radius:50%; background:#c9a96e;
          transform:translateY(-50%); pointer-events:none;
        }

        /* volume */
        .vol { -webkit-appearance:none; appearance:none;
          width:100%; height:3px; border-radius:100px;
          background:rgba(255,255,255,0.08); outline:none; cursor:pointer; }
        .vol::-webkit-slider-thumb { -webkit-appearance:none;
          width:11px; height:11px; border-radius:50%; background:#c9a96e; cursor:pointer; }

        /* music button active */
        .music-btn-active { background:rgba(201,169,110,0.1) !important;
          border:1px solid rgba(201,169,110,0.2) !important; }

        /* player card */
        .player-card {
          position:fixed; right:14px; bottom:18px; z-index:1050;
          width:275px;
          background:rgba(8,12,24,0.97);
          border:1px solid rgba(201,169,110,0.18);
          border-radius:20px;
          backdrop-filter:blur(28px);
          box-shadow:0 24px 64px rgba(0,0,0,0.55);
          overflow:hidden;
        }

        .mobile-menu-panel { display:flex !important; }
        @media(min-width:768px) { .mobile-menu-panel { display:none !important; } }
      `}</style>

      {/* ════ NAVBAR ════ */}
      <nav style={{
        position:'fixed', left:0, right:0, top:`${TOP_BAR_H}px`, zIndex:1000,
        height:`${NAVBAR_H}px`,
        background: scrolled ? 'rgba(13,27,42,0.97)' : '#0d1b2a',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom:'1px solid rgba(201,169,110,0.08)',
        boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.2)' : 'none',
        transition:'all .3s ease',
      }}>
        <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'0 14px',
          height:'100%', display:'flex', alignItems:'center',
          justifyContent:'space-between', gap:'8px' }}>

          {/* Logo */}
          <div onClick={() => { navigate('home'); setMenuOpen(false); setSearchOpen(false); }}
            style={{ display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', flexShrink:0 }}>
            <img src={logo} alt="Aslivo" style={{ height:'32px', width:'auto', objectFit:'contain' }} />
            <span className="logo-text" style={{ fontSize:'18px', fontWeight:800, color:'#c9a96e',
              letterSpacing:'0.1em', textTransform:'uppercase', lineHeight:1 }}>Aslivo</span>
          </div>

          {/* Desktop nav */}
          <ul className="desktop-only" style={{ alignItems:'center', gap:'2px',
            listStyle:'none', margin:0, padding:0, flex:1, justifyContent:'center' }}>
            {navLinks.map(l => (
              <li key={l.page}>
                <button className="nav-link"
                  style={{ color: currentPage===l.page ? '#c9a96e' : 'rgba(255,255,255,0.72)',
                    background: currentPage===l.page ? 'rgba(201,169,110,0.1)' : 'transparent' }}
                  onClick={() => navigate(l.page)}>{l.label}</button>
              </li>
            ))}
            <li>
              <button className="nav-link" style={{ color:'#ef4444', fontWeight:700 }}
                onClick={() => navigate('flashsale')}>
                <span className="flicker" style={{ marginRight:'5px' }}>🔥</span>Hot Sale
                <span style={{ marginLeft:'6px', background:'rgba(239,68,68,0.15)',
                  border:'1px solid rgba(239,68,68,0.3)', borderRadius:'6px',
                  padding:'2px 6px', fontSize:'9px', fontWeight:800,
                  color:'#ef4444', letterSpacing:'0.06em' }}>LIVE</span>
              </button>
            </li>
            <li>
              <button className="nav-link" style={{ color:'rgba(201,169,110,0.7)' }}
                onClick={() => navigate('tracking')}>📦 Track Order</button>
            </li>
          </ul>

          {/* Right icons */}
          <div style={{ display:'flex', alignItems:'center', gap:'2px', flexShrink:0 }}>

            {/* ── MUSIC BUTTON ── */}
            <button className={`nb-icon${playing ? ' music-btn-active' : ''}`}
              onClick={() => setPlayerOpen(o => !o)} aria-label="Music player"
              style={{ borderRadius:'9px', border: playing ? '' : '1px solid transparent' }}>
              {playing
                ? <div style={{ display:'flex', alignItems:'center', gap:'2px', height:'18px' }}>
                    <div className="eq-bar" /><div className="eq-bar" /><div className="eq-bar" />
                  </div>
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round">
                    <path d="M9 18V5l12-2v13"/>
                    <circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                  </svg>
              }
            </button>

            {/* Search */}
            <button className="nb-icon"
              onClick={() => { setSearchOpen(s => !s); setMenuOpen(false); }} aria-label="Search">
              {searchOpen
                ? <svg width="17" height="17" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" viewBox="0 0 24 24">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                : <svg width="17" height="17" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>}
            </button>

            {/* Wishlist */}
            <button className="nb-icon" onClick={() => navigate('wishlist')} aria-label="Wishlist">
              <svg width="17" height="17" viewBox="0 0 24 24"
                fill={wishlist?.length>0 ? '#ef4444' : 'none'}
                stroke={wishlist?.length>0 ? '#ef4444' : 'rgba(255,255,255,0.8)'} strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              {wishlist?.length>0 && <span className="nb-badge" style={{ background:'#ef4444', color:'#fff' }}>{wishlist.length>9?'9+':wishlist.length}</span>}
            </button>

            {/* Cart */}
            <button className="nb-icon" onClick={() => navigate('cart')} aria-label="Cart">
              <svg width="17" height="17" fill="none"
                stroke={currentPage==='cart' ? '#c9a96e' : 'rgba(255,255,255,0.8)'}
                strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {cartCount>0 && <span className="nb-badge" style={{ background:'#c9a96e', color:'#0d1b2a' }}>{cartCount>9?'9+':cartCount}</span>}
            </button>

            {/* User desktop */}
            {user
              ? <button className="nb-icon desktop-only" onClick={() => navigate('account')}
                  style={{ width:'auto', padding:'0 10px', gap:'7px', borderRadius:'100px',
                    background:'rgba(201,169,110,0.08)', border:'1px solid rgba(201,169,110,0.2)' }}>
                  <UserAvatar user={user} size={22} fontSize={10} />
                  <span style={{ fontSize:'12px', fontWeight:600, color:'#c9a96e',
                    maxWidth:'72px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {user.firstName}
                  </span>
                </button>
              : <button className="nb-icon desktop-only" onClick={() => navigate('login')}
                  style={{ width:'auto', padding:'0 12px', gap:'6px', borderRadius:'100px',
                    background:'rgba(201,169,110,0.08)', border:'1px solid rgba(201,169,110,0.2)' }}>
                  <svg width="13" height="13" fill="none" stroke="#c9a96e" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <span style={{ fontSize:'12px', fontWeight:700, color:'#c9a96e', whiteSpace:'nowrap' }}>Sign In</span>
                </button>
            }

            <div className="desktop-only" style={{ width:'1px', height:'22px', background:'rgba(255,255,255,0.07)', margin:'0 2px' }} />

            {/* Hamburger */}
            <button className="mobile-only nb-icon"
              onClick={() => { setMenuOpen(m => !m); setSearchOpen(false); }}
              style={{ flexDirection:'column', gap:'5px' }}>
              <span style={{ display:'block', width:'19px', height:'2px', borderRadius:'2px',
                background: menuOpen ? '#c9a96e' : 'rgba(255,255,255,0.85)', transition:'all .3s',
                transform: menuOpen ? 'rotate(45deg) translate(5px,5px)' : 'none' }} />
              <span style={{ display:'block', width:'13px', height:'2px', borderRadius:'2px',
                background:'#c9a96e', transition:'all .3s',
                opacity: menuOpen ? 0 : 1, alignSelf:'flex-start' }} />
              <span style={{ display:'block', width:'19px', height:'2px', borderRadius:'2px',
                background: menuOpen ? '#c9a96e' : 'rgba(255,255,255,0.85)', transition:'all .3s',
                transform: menuOpen ? 'rotate(-45deg) translate(5px,-5px)' : 'none' }} />
            </button>
          </div>
        </div>
      </nav>

      {/* ════ SEARCH ════ */}
      <div style={{ position:'fixed', left:0, right:0, zIndex:999, top:`${TOP_OFFSET}px`,
        background:'rgba(13,27,42,0.98)', backdropFilter:'blur(20px)',
        borderBottom:'1px solid rgba(201,169,110,0.12)', padding:'14px 16px',
        opacity: searchOpen ? 1 : 0, pointerEvents: searchOpen ? 'auto' : 'none',
        transition:'opacity .25s ease' }}>
        <div style={{ maxWidth:'680px', margin:'0 auto', display:'flex', alignItems:'center', gap:'10px' }}>
          <svg width="16" height="16" fill="none" stroke="#c9a96e" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink:0 }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key==='Enter' && handleSearch()} autoFocus={searchOpen}
            placeholder="Search products, categories…"
            style={{ flex:1, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(201,169,110,0.2)',
              borderRadius:'10px', padding:'9px 14px', color:'#fff', fontSize:'14px',
              outline:'none', fontFamily:'inherit' }} />
          {searchQuery && (
            <button onClick={() => handleSearch()}
              style={{ background:'#c9a96e', color:'#0d1b2a', border:'none', borderRadius:'9px',
                padding:'9px 16px', fontSize:'12px', fontWeight:800, cursor:'pointer',
                whiteSpace:'nowrap', fontFamily:'inherit' }}>Search →</button>
          )}
        </div>
        <div style={{ maxWidth:'680px', margin:'10px auto 0', display:'flex', gap:'7px', flexWrap:'wrap' }}>
          {quickTags.map(tag => (
            <button key={tag} onClick={() => handleSearch(tag)}
              style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)',
                borderRadius:'100px', padding:'5px 12px', fontSize:'11px',
                color:'rgba(255,255,255,0.4)', fontWeight:600, letterSpacing:'0.06em',
                textTransform:'uppercase', cursor:'pointer', fontFamily:'inherit' }}>{tag}</button>
          ))}
        </div>
      </div>

      {/* ════ MOBILE BACKDROP ════ */}
      {menuOpen && <div onClick={() => setMenuOpen(false)}
        style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:997 }} />}

      {/* ════ MOBILE MENU ════ */}
      <div style={{ position:'fixed', left:0, right:0, bottom:0, top:`${TOP_OFFSET}px`,
        zIndex:998, background:'rgba(10,14,26,0.99)', backdropFilter:'blur(24px)',
        borderTop:'1px solid rgba(201,169,110,0.1)',
        display:'flex', flexDirection:'column', overflowY:'auto',
        transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
        transition:'transform .3s cubic-bezier(.25,.46,.45,.94)' }}
        className="mobile-menu-panel">
        <div style={{ padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px',
            background:'rgba(255,255,255,0.04)', border:'1px solid rgba(201,169,110,0.15)',
            borderRadius:'12px', padding:'10px 14px' }}>
            <svg width="14" height="14" fill="none" stroke="#c9a96e" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input placeholder="Search products…"
              style={{ flex:1, background:'transparent', border:'none', color:'#fff', fontSize:'14px', outline:'none', fontFamily:'inherit' }}
              onKeyDown={e => e.key==='Enter' && e.target.value.trim() && handleSearch(e.target.value.trim())} />
          </div>
          <div style={{ display:'flex', gap:'6px', marginTop:'10px', overflowX:'auto', scrollbarWidth:'none' }}>
            {quickTags.map(tag => (
              <button key={tag} onClick={() => handleSearch(tag)}
                style={{ flexShrink:0, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)',
                  borderRadius:'100px', padding:'4px 11px', fontSize:'10px', color:'rgba(255,255,255,0.35)',
                  fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', cursor:'pointer', fontFamily:'inherit' }}>{tag}</button>
            ))}
          </div>
        </div>
        {user && (
          <div style={{ padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,0.05)',
            display:'flex', alignItems:'center', gap:'12px', background:'rgba(201,169,110,0.04)' }}>
            <UserAvatar user={user} size={40} fontSize={15} />
            <div>
              <p style={{ fontSize:'14px', fontWeight:700, color:'#fff', margin:'0 0 2px' }}>{user.firstName} {user.lastName}</p>
              <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)', margin:0 }}>{user.email}</p>
            </div>
          </div>
        )}
        <div style={{ flex:1 }}>
          {mobileLinks.map((item, i) => {
            const active = currentPage===item.page;
            return (
              <div key={i} onClick={() => { navigate(item.page); setMenuOpen(false); }}
                style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                  padding:'16px 18px', borderBottom:'1px solid rgba(255,255,255,0.04)',
                  cursor:'pointer', background: active ? 'rgba(201,169,110,0.06)' : 'transparent',
                  transition:'background .15s' }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background='rgba(255,255,255,0.03)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background='transparent'; }}>
                <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
                  <span style={{ fontSize:'19px', width:'24px', textAlign:'center' }}>{item.icon}</span>
                  <span style={{ fontSize:'14px', fontWeight:600, letterSpacing:'0.03em',
                    color: item.hot ? '#ef4444' : active ? '#c9a96e' : 'rgba(255,255,255,0.85)' }}>
                    {item.label}
                  </span>
                  {item.hot && <span style={{ background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.25)',
                    borderRadius:'6px', padding:'2px 7px', fontSize:'9px', fontWeight:800,
                    color:'#ef4444', letterSpacing:'0.06em' }}>LIVE</span>}
                </div>
                <svg width="13" height="13" fill="none"
                  stroke={active ? '#c9a96e' : 'rgba(255,255,255,0.2)'} strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </div>
            );
          })}
        </div>
        <div style={{ padding:'14px 16px 32px', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
          {user && (
            <button onClick={() => { handleLogout(); setMenuOpen(false); }}
              style={{ width:'100%', display:'flex', alignItems:'center', gap:'12px',
                padding:'13px 16px', borderRadius:'12px',
                background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.12)',
                cursor:'pointer', marginBottom:'12px', fontFamily:'inherit' }}>
              <span style={{ fontSize:'17px' }}>🚪</span>
              <span style={{ fontSize:'14px', fontWeight:700, color:'#ef4444' }}>Sign Out</span>
            </button>
          )}
          <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.15)', textAlign:'center', margin:0, letterSpacing:'0.08em' }}>
            © 2025 Aslivo Store
          </p>
        </div>
      </div>

      {/* ════════════════════════════════════
          MUSIC PLAYER  (bottom-right float)
      ════════════════════════════════════ */}
      {playerOpen && (
        <div className="player-card">

          {/* Header */}
          <div style={{ padding:'13px 15px 10px', borderBottom:'1px solid rgba(255,255,255,0.05)',
            display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'7px' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="#c9a96e" strokeWidth="2" strokeLinecap="round">
                <path d="M9 18V5l12-2v13"/>
                <circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
              </svg>
              <span style={{ fontSize:'10px', fontWeight:800, letterSpacing:'0.12em',
                textTransform:'uppercase', color:'#c9a96e' }}>Store Radio</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
              {/* Autoplay toggle */}
              <button onClick={() => setAutoplay(a => !a)}
                style={{ display:'flex', alignItems:'center', gap:'4px',
                  padding:'3px 9px', borderRadius:'100px', border:'none', cursor:'pointer',
                  fontFamily:'inherit', fontSize:'9px', fontWeight:800,
                  letterSpacing:'0.07em', textTransform:'uppercase',
                  background: autoplay ? 'rgba(201,169,110,0.15)' : 'rgba(255,255,255,0.05)',
                  color: autoplay ? '#c9a96e' : 'rgba(255,255,255,0.25)',
                  transition:'all .2s' }}>
                <span style={{ width:'6px', height:'6px', borderRadius:'50%',
                  background: autoplay ? '#c9a96e' : 'rgba(255,255,255,0.2)',
                  display:'inline-block', flexShrink:0 }} />
                Auto
              </button>
              {/* Close */}
              <button onClick={() => setPlayerOpen(false)}
                style={{ background:'none', border:'none', cursor:'pointer', padding:'2px',
                  color:'rgba(255,255,255,0.28)', display:'flex', transition:'color .15s' }}
                onMouseEnter={e => e.currentTarget.style.color='#fff'}
                onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.28)'}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Album art + info */}
          <div style={{ padding:'15px 15px 10px', display:'flex', alignItems:'center', gap:'13px' }}>
            {/* Spinning vinyl */}
            <div style={{ position:'relative', flexShrink:0, width:'54px', height:'54px' }}>
              <div className={`vinyl${playing ? '' : ' paused'}`}
                style={{ width:'54px', height:'54px', borderRadius:'50%',
                  background:'radial-gradient(circle at 50%,#1a1a2e 28%,#0d1b2a 30%,#c9a96e 32%,#0d1b2a 34%,#1c2340 58%,#111827 100%)',
                  boxShadow:'0 4px 16px rgba(0,0,0,0.5)', border:'1px solid rgba(255,255,255,0.05)' }} />
              <div style={{ position:'absolute', top:'50%', left:'50%',
                transform:'translate(-50%,-50%)',
                width:'9px', height:'9px', borderRadius:'50%', background:'#c9a96e', zIndex:1 }} />
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div className="marquee-wrap" style={{ marginBottom:'3px' }}>
                <span className="marquee-inner" style={{ fontSize:'13px', fontWeight:700, color:'#fff' }}>
                  {track.title}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{track.title}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </span>
              </div>
              <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)', margin:'0 0 3px' }}>{track.artist}</p>
              <p style={{ fontSize:'10px', color:'rgba(201,169,110,0.45)', margin:0, fontWeight:600 }}>
                {trackIdx+1} / {PLAYLIST.length}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ padding:'0 15px 10px' }}>
            <div className="prog-wrap" ref={progRef} onClick={seekTo}>
              <div className="prog-fill" style={{ width:`${progress}%` }} />
            </div>
          </div>

          {/* Controls */}
          <div style={{ padding:'0 15px 14px', display:'flex',
            alignItems:'center', justifyContent:'center', gap:'12px' }}>
            <button className="ctrl" onClick={() => skipTrack(-1)} title="Previous">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/>
              </svg>
            </button>
            <button className="ctrl big" onClick={togglePlay} title={playing ? 'Pause' : 'Play'}>
              {playing
                ? <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                  </svg>
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>}
            </button>
            <button className="ctrl" onClick={() => skipTrack(1)} title="Next">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z"/>
              </svg>
            </button>
          </div>

          {/* Volume */}
          <div style={{ padding:'0 15px 13px', display:'flex', alignItems:'center', gap:'9px' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="rgba(255,255,255,0.25)" strokeWidth="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            </svg>
            <input type="range" min="0" max="1" step="0.01" value={volume}
              onChange={e => setVolume(parseFloat(e.target.value))} className="vol"
              style={{ flex:1, background:`linear-gradient(to right,#c9a96e ${volume*100}%,rgba(255,255,255,0.08) ${volume*100}%)` }} />
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="rgba(255,255,255,0.25)" strokeWidth="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
            </svg>
          </div>

          {/* Playlist */}
          <div style={{ borderTop:'1px solid rgba(255,255,255,0.05)' }}>
            {PLAYLIST.map((t, i) => (
              <div key={i} onClick={() => selectTrack(i)}
                style={{ display:'flex', alignItems:'center', gap:'10px',
                  padding:'9px 15px', cursor:'pointer',
                  background: i===trackIdx ? 'rgba(201,169,110,0.07)' : 'transparent',
                  transition:'background .15s' }}
                onMouseEnter={e => { if (i!==trackIdx) e.currentTarget.style.background='rgba(255,255,255,0.03)'; }}
                onMouseLeave={e => { if (i!==trackIdx) e.currentTarget.style.background='transparent'; }}>
                <div style={{ width:'18px', textAlign:'center', flexShrink:0 }}>
                  {i===trackIdx && playing
                    ? <div style={{ display:'flex', alignItems:'center', gap:'1px', justifyContent:'center', height:'14px' }}>
                        <div className="eq-bar" style={{ width:'2px' }} />
                        <div className="eq-bar" style={{ width:'2px' }} />
                        <div className="eq-bar" style={{ width:'2px' }} />
                      </div>
                    : <span style={{ fontSize:'10px', fontWeight:700,
                        color: i===trackIdx ? '#c9a96e' : 'rgba(255,255,255,0.2)' }}>{i+1}</span>
                  }
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:'12px', fontWeight:600,
                    color: i===trackIdx ? '#c9a96e' : 'rgba(255,255,255,0.7)',
                    margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {t.title}
                  </p>
                  <p style={{ fontSize:'10px', color:'rgba(255,255,255,0.22)', margin:'1px 0 0' }}>{t.artist}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}