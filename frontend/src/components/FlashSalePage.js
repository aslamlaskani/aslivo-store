import React, { useState, useEffect, useRef } from 'react';
import { productsAPI } from '../api';
import { placeholderImg } from '../utils/placeholder';

export default function FlashSalePage({ navigate, addToCart, wishlist, toggleWishlist }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const endTimeRef = useRef(null);

  useEffect(() => {
    loadFlashSaleProducts();
    initTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, []);

  const initTimer = () => {
    const stored = localStorage.getItem('aslivo_flash_sale_end');
    if (stored && new Date(stored) > new Date()) {
      endTimeRef.current = new Date(stored);
    } else {
      const end = new Date();
      end.setHours(end.getHours() + 6);
      endTimeRef.current = end;
      localStorage.setItem('aslivo_flash_sale_end', end.toISOString());
    }
    updateTimer();
  };

  const updateTimer = () => {
    if (!endTimeRef.current) return;
    const diff = endTimeRef.current - new Date();
    if (diff <= 0) { setTimeLeft({ hours: 0, minutes: 0, seconds: 0 }); return; }
    setTimeLeft({
      hours:   Math.floor(diff / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
    });
  };

  const loadFlashSaleProducts = async () => {
    setLoading(true);
    try {
      const res = await productsAPI.getFlashSale();
      const raw = res?.data ?? res;
      setProducts(Array.isArray(raw) ? raw : raw?.results ?? raw?.data ?? []);
    } catch (err) {
      console.error('Failed to load flash sale:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const pad = (n) => String(n).padStart(2, '0');
  const isInWishlist = (id) => wishlist?.some(i => i.id === id);

  /* ─── Product Card ─── */
  const ProductCard = ({ product }) => {
    const [adding, setAdding]   = useState(false);
    const [hovered, setHovered] = useState(false);

    const handleCart = (e) => {
      e.stopPropagation();
      if (product.stock === 0) return;
      addToCart(product, 1, null);
      setAdding(true);
      setTimeout(() => setAdding(false), 1800);
    };

    const discountPct = product.original_price && parseFloat(product.original_price) > parseFloat(product.price)
      ? (product.discount_percent || Math.round((1 - parseFloat(product.price) / parseFloat(product.original_price)) * 100))
      : null;

    const stockPct = product.stock > 0 ? Math.min(100, (product.stock / 50) * 100) : 0;
    const soldOut  = product.stock === 0;
    const lowStock = product.stock > 0 && product.stock < 10;

    return (
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: hovered ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${hovered ? 'rgba(201,169,110,0.35)' : 'rgba(255,255,255,0.08)'}`,
          borderRadius: '16px', overflow: 'hidden',
          transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
          boxShadow: hovered ? '0 14px 40px rgba(0,0,0,0.35)' : '0 2px 8px rgba(0,0,0,0.2)',
          transition: 'all .25s ease',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Image */}
        <div style={{ position: 'relative', paddingTop: '128%', overflow: 'hidden',
          background: 'rgba(255,255,255,0.04)', flexShrink: 0 }}>
          <img
            src={product.primary_image || 'placeholderImg(300,380)'}
            alt={product.name}
            onClick={() => navigate('product', product)}
            onError={e => { e.target.src = 'placeholderImg(300,380)'; }}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'cover', cursor: 'pointer',
              transform: hovered ? 'scale(1.06)' : 'scale(1)',
              transition: 'transform .6s cubic-bezier(.25,.46,.45,.94)',
              filter: soldOut ? 'brightness(0.45)' : 'none' }}
          />

          {/* Discount badge */}
          {discountPct && !soldOut && (
            <span style={{ position: 'absolute', top: '10px', left: '10px',
              background: '#ef4444', color: '#fff',
              fontSize: '9px', fontWeight: 800, letterSpacing: '0.08em',
              textTransform: 'uppercase', padding: '4px 9px', borderRadius: '100px', zIndex: 2 }}>
              -{discountPct}%
            </span>
          )}

          {/* Low stock */}
          {lowStock && !soldOut && (
            <span style={{ position: 'absolute', top: '10px', right: '10px',
              background: 'rgba(249,115,22,0.9)', color: '#fff',
              fontSize: '9px', fontWeight: 800, padding: '4px 9px', borderRadius: '100px', zIndex: 2 }}>
              Only {product.stock} left!
            </span>
          )}

          {/* Sold out overlay */}
          {soldOut && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 2,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.25)',
                color: '#fff', fontSize: '13px', fontWeight: 700,
                padding: '8px 20px', borderRadius: '100px', backdropFilter: 'blur(4px)' }}>
                Sold Out
              </span>
            </div>
          )}

          {/* Wishlist */}
          <button
            onClick={e => { e.stopPropagation(); toggleWishlist(product); }}
            style={{ position: 'absolute', bottom: '10px', right: '10px', zIndex: 2,
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)',
              border: '1px solid rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              opacity: hovered ? 1 : 0, transition: 'opacity .2s' }}>
            <svg width="13" height="13" viewBox="0 0 24 24"
              fill={isInWishlist(product.id) ? '#ef4444' : 'none'}
              stroke={isInWishlist(product.id) ? '#ef4444' : '#fff'} strokeWidth="2.2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '12px 13px 14px', display: 'flex', flexDirection: 'column', flex: 1 }}>
          <p style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: '#c9a96e', margin: '0 0 4px' }}>
            {product.category_name}
          </p>
          <h3
            onClick={() => navigate('product', product)}
            style={{ fontSize: '13px', fontWeight: 500, color: '#fff', margin: '0 0 10px',
              lineHeight: 1.35, cursor: 'pointer', flex: 1,
              overflow: 'hidden', display: '-webkit-box',
              WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              transition: 'color .15s' }}
            onMouseEnter={e => e.target.style.color='#c9a96e'}
            onMouseLeave={e => e.target.style.color='#fff'}>
            {product.name}
          </h3>

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '7px',
            flexWrap: 'wrap', marginBottom: '10px' }}>
            <span style={{ fontSize: '16px', fontWeight: 700, color: '#c9a96e',
              fontFamily: 'Georgia,serif' }}>
              Rs.{parseFloat(product.price).toLocaleString()}
            </span>
            {product.original_price && parseFloat(product.original_price) > parseFloat(product.price) && (
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)',
                textDecoration: 'line-through' }}>
                Rs.{parseFloat(product.original_price).toLocaleString()}
              </span>
            )}
          </div>

          {/* Stock progress */}
          {product.stock > 0 && (
            <div style={{ marginBottom: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between',
                fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginBottom: '5px' }}>
                <span>Available</span>
                <span>{product.stock} left</span>
              </div>
              <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)',
                borderRadius: '100px', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: '100px',
                  background: 'linear-gradient(90deg,#ef4444,#f97316)',
                  width: `${stockPct}%`, transition: 'width .5s ease' }} />
              </div>
            </div>
          )}

          {/* Add to cart */}
          <button
            onClick={handleCart}
            disabled={soldOut}
            style={{
              width: '100%', padding: '9px 0', borderRadius: '100px', border: 'none',
              cursor: soldOut ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', fontSize: '10px', fontWeight: 800,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              transition: 'all .18s ease',
              background: soldOut
                ? 'rgba(255,255,255,0.06)'
                : adding
                ? '#059669'
                : '#c9a96e',
              color: soldOut
                ? 'rgba(255,255,255,0.2)'
                : adding
                ? '#fff'
                : '#0d1b2a',
            }}
            onMouseEnter={e => { if (!soldOut && !adding) { e.currentTarget.style.background='#b8935a'; }}}
            onMouseLeave={e => { if (!soldOut && !adding) { e.currentTarget.style.background='#c9a96e'; }}}
          >
            {soldOut ? 'Sold Out' : adding ? '✓ Added!' : '+ Add to Cart'}
          </button>
        </div>
      </div>
    );
  };

  /* ─── Skeleton ─── */
  const SkeletonCard = () => (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '16px', overflow: 'hidden' }}>
      <div style={{ paddingTop: '128%',
        backgroundImage: 'linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.08) 50%,rgba(255,255,255,0.04) 75%)',
        backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
      <div style={{ padding: '12px 13px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ height: '8px', width: '44px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px' }} />
        <div style={{ height: '12px', width: '90%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} />
        <div style={{ height: '18px', width: '60px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px' }} />
        <div style={{ height: '36px', background: 'rgba(255,255,255,0.05)', borderRadius: '100px' }} />
      </div>
    </div>
  );

  /* ═══════ RENDER ═══════ */
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0d',
      fontFamily: 'system-ui,-apple-system,sans-serif', paddingTop: '96px' }}>

      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .sale-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        @media(min-width:640px)  { .sale-grid { grid-template-columns:repeat(3,1fr); gap:14px; } }
        @media(min-width:1024px) { .sale-grid { grid-template-columns:repeat(4,1fr); gap:18px; } }
        .pulse-dot { animation: pulse 1.8s ease-in-out infinite; }
        .fade-up   { animation: fadeUp .55s ease forwards; }
      `}</style>

      {/* ════ HERO ════ */}
      <div style={{ position: 'relative', paddingBottom: '48px', overflow: 'hidden' }}>

        {/* Background glows */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '10%', left: '15%',
            width: '320px', height: '320px', borderRadius: '50%',
            background: 'rgba(239,68,68,0.07)', filter: 'blur(80px)' }} />
          <div style={{ position: 'absolute', bottom: 0, right: '10%',
            width: '280px', height: '280px', borderRadius: '50%',
            background: 'rgba(201,169,110,0.05)', filter: 'blur(80px)' }} />
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px',
          position: 'relative', zIndex: 1, textAlign: 'center' }} className="fade-up">

          {/* Live badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.28)',
            borderRadius: '100px', padding: '6px 16px', marginBottom: '20px' }}>
            <span className="pulse-dot" style={{ width: '7px', height: '7px', borderRadius: '50%',
              background: '#ef4444', flexShrink: 0 }} />
            <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.14em',
              textTransform: 'uppercase', color: '#ef4444' }}>Live Flash Sale</span>
          </div>

          {/* Title */}
          <h1 style={{ fontSize: 'clamp(2.2rem,8vw,5rem)', fontWeight: 700, color: '#fff',
            fontFamily: 'Georgia,serif', letterSpacing: '-0.025em', lineHeight: 1.05,
            margin: '0 0 12px' }}>
            🔥 Hot Sale
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 'clamp(13px,2vw,15px)',
            lineHeight: 1.65, maxWidth: '380px', margin: '0 auto 28px' }}>
            Massive discounts on premium products. Limited time only!
          </p>

          {/* ── COUNTDOWN TIMER ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '8px', marginBottom: '32px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.3)',
              letterSpacing: '0.1em', textTransform: 'uppercase', marginRight: '4px' }}>
              Ends in
            </span>
            {[
              { value: timeLeft.hours,   label: 'Hrs' },
              { value: timeLeft.minutes, label: 'Min' },
              { value: timeLeft.seconds, label: 'Sec' },
            ].map((t, i) => (
              <React.Fragment key={i}>
                <div style={{ background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  borderRadius: '14px', padding: '10px 14px',
                  minWidth: '60px', textAlign: 'center' }}>
                  <div style={{ fontSize: 'clamp(1.4rem,4vw,2.2rem)', fontWeight: 700,
                    color: '#c9a96e', fontFamily: 'Georgia,serif', lineHeight: 1 }}>
                    {pad(t.value)}
                  </div>
                  <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)',
                    marginTop: '4px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    {t.label}
                  </div>
                </div>
                {i < 2 && (
                  <span className="pulse-dot"
                    style={{ fontSize: 'clamp(1.2rem,3vw,1.6rem)', fontWeight: 700,
                      color: 'rgba(201,169,110,0.45)', lineHeight: 1 }}>:</span>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(20px,5vw,48px)',
            flexWrap: 'wrap' }}>
            {[
              { value: `${products.length}+`,  label: 'Products on Sale'        },
              { value: 'Up to 50%',             label: 'Discount'               },
              { value: 'Free',                  label: 'Delivery above Rs.2000' },
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 'clamp(1.1rem,3vw,1.5rem)', fontWeight: 700,
                  color: '#c9a96e', fontFamily: 'Georgia,serif', margin: '0 0 3px' }}>
                  {stat.value}
                </p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)',
                  letterSpacing: '0.05em', margin: 0 }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════ PRODUCTS ════ */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 14px 56px' }}>

        {/* Section header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
          marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ fontSize: 'clamp(1.3rem,3vw,1.8rem)', fontWeight: 700, color: '#fff',
              fontFamily: 'Georgia,serif', margin: '0 0 4px' }}>
              Sale Products
            </h2>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.28)', margin: 0 }}>
              {products.length} products available
            </p>
          </div>
          <button onClick={() => navigate('shop')}
            style={{ background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', fontSize: '13px', fontWeight: 700, color: '#c9a96e' }}>
            View All →
          </button>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', marginBottom: '20px' }} />

        {loading ? (
          <div className="sale-grid">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 16px' }}>
            <div style={{ fontSize: '52px', marginBottom: '16px' }}>🔥</div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#fff',
              fontFamily: 'Georgia,serif', margin: '0 0 10px' }}>
              No flash sale products yet
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: '14px', margin: '0 0 24px' }}>
              Check back soon or browse our full collection
            </p>
            <button onClick={() => navigate('shop')}
              style={{ padding: '12px 28px', borderRadius: '100px',
                background: '#c9a96e', color: '#0d1b2a', border: 'none',
                cursor: 'pointer', fontSize: '12px', fontWeight: 800,
                letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'inherit' }}>
              Browse All Products
            </button>
          </div>
        ) : (
          <div className="sale-grid">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}