import React, { useState, useEffect, useRef } from 'react';

export default function FlashSaleBanner({ navigate }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const endTimeRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem('aslivo_flash_sale_end');
    if (stored && new Date(stored) > new Date()) {
      endTimeRef.current = new Date(stored);
    } else {
      const end = new Date();
      end.setHours(end.getHours() + 6);
      endTimeRef.current = end;
      localStorage.setItem('aslivo_flash_sale_end', end.toISOString());
    }
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  const tick = () => {
    if (!endTimeRef.current) return;
    const diff = endTimeRef.current - new Date();
    if (diff <= 0) { setTimeLeft({ hours:0, minutes:0, seconds:0 }); return; }
    setTimeLeft({
      hours:   Math.floor(diff / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    });
  };

  const pad = n => String(n).padStart(2, '0');

  const Digit = ({ val, label }) => (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'1px' }}>
      <span style={{
        background:'rgba(0,0,0,0.25)',
        border:'1px solid rgba(255,255,255,0.15)',
        color:'#fff', fontSize:'12px', fontWeight:800,
        width:'28px', height:'22px', borderRadius:'5px',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontFamily:'Georgia,serif', letterSpacing:'0.02em',
        lineHeight:1,
      }}>{pad(val)}</span>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes fsb-fire {
          0%,100% { transform: rotate(-8deg) scale(1);    }
          25%      { transform: rotate( 8deg) scale(1.12); }
          50%      { transform: rotate(-4deg) scale(1.0);  }
          75%      { transform: rotate( 4deg) scale(1.06); }
        }
        @keyframes fsb-sweep {
          0%   { left: -80px; }
          100% { left: 110%;  }
        }
        .fsb-fire-ico { animation: fsb-fire 1.8s ease-in-out infinite; display:inline-block; }

        /* Responsive show/hide */
        .fsb-badge  { display:none; }
        .fsb-endsin { display:none; }
        .fsb-vdiv   { display:none; }
        @media(min-width:420px) { .fsb-badge  { display:inline-flex; } }
        @media(min-width:500px) { .fsb-endsin { display:inline;      } }
        @media(min-width:460px) { .fsb-vdiv   { display:block;       } }

        .fsb-shop-btn:hover { background: rgba(255,255,255,0.22) !important; }
      `}</style>

      <div style={{
        position:'fixed', top:0, left:0, right:0, zIndex:1100,
        height:'40px', overflow:'hidden',
        background:'linear-gradient(100deg,#9f1239 0%,#dc2626 35%,#ef4444 65%,#ea580c 100%)',
        display:'flex', alignItems:'center',
        fontFamily:'system-ui,-apple-system,sans-serif',
      }}>

        {/* Light sweep animation */}
        <div style={{
          position:'absolute', top:0, bottom:0, width:'70px',
          background:'linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.14) 50%,transparent 100%)',
          animation:'fsb-sweep 3.5s ease-in-out infinite',
          pointerEvents:'none',
        }} />

        {/* Content — fully centered */}
        <div style={{
          width:'100%', maxWidth:'1200px', margin:'0 auto',
          padding:'0 12px', display:'flex', alignItems:'center',
          justifyContent:'center', gap:'8px',
          position:'relative', zIndex:1,
        }}>

          {/* 🔥 Flash Sale */}
          <div style={{ display:'flex', alignItems:'center', gap:'5px', flexShrink:0 }}>
            <span className="fsb-fire-ico" style={{ fontSize:'14px' }}>🔥</span>
            <span style={{ color:'#fff', fontSize:'11px', fontWeight:900,
              letterSpacing:'0.12em', textTransform:'uppercase', whiteSpace:'nowrap' }}>
              Flash Sale
            </span>
          </div>

          {/* "Up to 50% Off" pill — hidden on very small screens */}
          <span className="fsb-badge" style={{
            background:'rgba(255,255,255,0.18)',
            border:'1px solid rgba(255,255,255,0.28)',
            color:'#fff', fontSize:'9px', fontWeight:800,
            padding:'2px 9px', borderRadius:'100px',
            letterSpacing:'0.1em', textTransform:'uppercase',
            whiteSpace:'nowrap', alignItems:'center',
          }}>
            Up to 50% Off
          </span>

          {/* Vertical divider */}
          <div className="fsb-vdiv" style={{
            width:'1px', height:'16px',
            background:'rgba(255,255,255,0.22)', flexShrink:0,
          }} />

          {/* Timer */}
          <div style={{ display:'flex', alignItems:'center', gap:'5px', flexShrink:0 }}>
            <span className="fsb-endsin" style={{
              color:'rgba(255,255,255,0.78)', fontSize:'10px', fontWeight:600,
              whiteSpace:'nowrap', letterSpacing:'0.03em',
            }}>
              Ends in
            </span>

            <div style={{ display:'flex', alignItems:'center', gap:'3px' }}>
              <Digit val={timeLeft.hours}   label="H" />
              <span style={{ color:'rgba(255,255,255,0.65)', fontSize:'12px',
                fontWeight:800, lineHeight:1, marginBottom:'1px' }}>:</span>
              <Digit val={timeLeft.minutes} label="M" />
              <span style={{ color:'rgba(255,255,255,0.65)', fontSize:'12px',
                fontWeight:800, lineHeight:1, marginBottom:'1px' }}>:</span>
              <Digit val={timeLeft.seconds} label="S" />
            </div>
          </div>

          {/* Vertical divider */}
          <div className="fsb-vdiv" style={{
            width:'1px', height:'16px',
            background:'rgba(255,255,255,0.22)', flexShrink:0,
          }} />

          {/* Shop Now button */}
          <button
            className="fsb-shop-btn"
            onClick={() => navigate('flashsale')}
            style={{
              background:'rgba(255,255,255,0.15)',
              border:'1px solid rgba(255,255,255,0.38)',
              color:'#fff', fontSize:'10px', fontWeight:800,
              letterSpacing:'0.1em', textTransform:'uppercase',
              padding:'5px 14px', borderRadius:'100px',
              cursor:'pointer', whiteSpace:'nowrap',
              fontFamily:'inherit', flexShrink:0,
              transition:'background .18s',
            }}>
            Shop Now →
          </button>

        </div>
      </div>
    </>
  );
}