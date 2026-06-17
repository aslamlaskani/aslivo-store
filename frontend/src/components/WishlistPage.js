import React, { useState } from 'react';
import { placeholderImg } from '../utils/placeholder';
export default function WishlistPage({ wishlist, navigate, addToCart, toggleWishlist }) {

  const BADGE = {
    new:      { bg: '#0d1b2a', color: '#c9a96e' },
    featured: { bg: '#c9a96e', color: '#0d1b2a' },
    sale:     { bg: '#ef4444', color: '#fff'     },
    hot:      { bg: '#f97316', color: '#fff'     },
  };

  /* ── Empty state ── */
  if (!wishlist?.length) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f5f0',
        paddingTop: '80px', fontFamily: 'system-ui,-apple-system,sans-serif' }}>

        {/* Header */}
        <div style={{ background: '#0d1b2a', padding: '28px 16px 24px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <p style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.14em',
              textTransform: 'uppercase', color: '#c9a96e', margin: '0 0 5px' }}>Saved Items</p>
            <h1 style={{ fontSize: 'clamp(1.6rem,5vw,2.6rem)', fontWeight: 700, color: '#fff',
              fontFamily: 'Georgia,serif', letterSpacing: '-0.02em', margin: 0, lineHeight: 1 }}>
              My Wishlist
            </h1>
          </div>
        </div>

        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '64px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px', lineHeight: 1 }}>❤️</div>
          <h2 style={{ fontSize: 'clamp(1.4rem,4vw,2rem)', fontWeight: 700, color: '#0d1b2a',
            fontFamily: 'Georgia,serif', margin: '0 0 10px' }}>
            Your wishlist is empty
          </h2>
          <p style={{ fontSize: '14px', color: '#aaa', lineHeight: 1.65, margin: '0 0 28px' }}>
            Save your favourite items and shop them later!
          </p>
          <button onClick={() => navigate('shop')}
            style={{ padding: '13px 32px', borderRadius: '100px', background: '#0d1b2a',
              color: '#c9a96e', border: 'none', cursor: 'pointer',
              fontSize: '12px', fontWeight: 800, letterSpacing: '0.1em',
              textTransform: 'uppercase', fontFamily: 'inherit' }}>
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  /* ── Product Card ── */
  const WishCard = ({ product }) => {
    const [hovered, setHovered]           = useState(false);
    const [addedFeedback, setAddedFeedback] = useState(false);

    const cfg = product.badge ? BADGE[product.badge] : null;
    const discountPct = product.original_price && parseFloat(product.original_price) > parseFloat(product.price)
      ? Math.round((1 - parseFloat(product.price) / parseFloat(product.original_price)) * 100)
      : null;

    const handleCart = (e) => {
      e.stopPropagation();
      addToCart(product, 1, null);
      setAddedFeedback(true);
      setTimeout(() => setAddedFeedback(false), 1800);
    };

    const handleCartAndGo = (e) => {
      e.stopPropagation();
      addToCart(product, 1, null);
      navigate('cart');
    };

    return (
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: '#fff', borderRadius: '16px', overflow: 'hidden',
          display: 'flex', flexDirection: 'column', cursor: 'pointer',
          border: `1.5px solid ${hovered ? '#c9a96e' : '#ede9e3'}`,
          transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
          boxShadow: hovered ? '0 12px 32px rgba(0,0,0,0.10)' : '0 1px 4px rgba(0,0,0,0.04)',
          transition: 'all .22s ease',
        }}
      >
        {/* Image */}
        <div style={{ position: 'relative', paddingTop: '128%', overflow: 'hidden',
          background: '#f7f4ef', flexShrink: 0 }}>
          <img
            src={product.primary_image || product.images?.[0]?.image_url || product.images?.[0] || placeholderImg(300, 380)}
            alt={product.name}
            onClick={() => navigate('product', product)}
            onError={e => { e.target.src = placeholderImg(300, 380); }}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'cover',
              transform: hovered ? 'scale(1.06)' : 'scale(1)',
              transition: 'transform .6s cubic-bezier(.25,.46,.45,.94)' }}
          />

          {/* Badge */}
          {cfg && (
            <span style={{ position: 'absolute', top: '9px', left: '9px',
              background: cfg.bg, color: cfg.color,
              fontSize: '8px', fontWeight: 800, letterSpacing: '0.1em',
              textTransform: 'uppercase', padding: '3px 9px', borderRadius: '100px', zIndex: 2 }}>
              {product.badge}
            </span>
          )}

          {/* Remove (wishlist heart) */}
          <button
            onClick={e => { e.stopPropagation(); toggleWishlist(product); }}
            title="Remove from wishlist"
            style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 2,
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(239,68,68,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
              transition: 'transform .15s' }}
            onMouseEnter={e => e.currentTarget.style.transform='scale(1.12)'}
            onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}>
            <svg width="13" height="13" viewBox="0 0 24 24"
              fill="#ef4444" stroke="#ef4444" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>

          {/* Quick add slide-up */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 2,
            transform: hovered ? 'translateY(0)' : 'translateY(100%)',
            transition: 'transform .28s cubic-bezier(.25,.46,.45,.94)' }}>
            <button onClick={handleCart}
              style={{ width: '100%', padding: '10px 0', border: 'none', cursor: 'pointer',
                fontFamily: 'inherit',
                background: addedFeedback ? 'rgba(5,150,105,.95)' : 'rgba(13,27,42,.94)',
                color: addedFeedback ? '#fff' : '#c9a96e',
                fontSize: '9px', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase',
                transition: 'background .2s' }}>
              {addedFeedback ? '✓ Added to Cart' : '+ Quick Add'}
            </button>
          </div>
        </div>

        {/* Body */}
        <div onClick={() => navigate('product', product)}
          style={{ padding: '11px 13px 13px', display: 'flex', flexDirection: 'column', flex: 1 }}>

          <p style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: '#c9a96e', margin: '0 0 3px' }}>
            {product.category_name || product.category || 'Product'}
          </p>

          <h3 style={{ fontSize: '13px', fontWeight: 500, color: '#0d1b2a', margin: '0 0 7px',
            lineHeight: 1.35, flex: 1,
            overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {product.name}
          </h3>

          {/* Stars */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginBottom: '8px' }}>
            {[1,2,3,4,5].map(s => (
              <svg key={s} width="10" height="10" viewBox="0 0 20 20"
                fill={s <= Math.round(product.rating || 0) ? '#c9a96e' : '#e5e7eb'}>
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            ))}
            <span style={{ fontSize: '10px', color: '#bbb', marginLeft: '3px' }}>
              ({product.review_count || 0})
            </span>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: '#f0ece6', margin: '0 0 9px' }} />

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', gap: '6px', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px', minWidth: 0 }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#0d1b2a',
                fontFamily: 'Georgia,serif', whiteSpace: 'nowrap' }}>
                Rs.{parseFloat(product.price).toLocaleString()}
              </span>
              {discountPct && (
                <span style={{ fontSize: '10px', color: '#c0bab2',
                  textDecoration: 'line-through', whiteSpace: 'nowrap' }}>
                  Rs.{parseFloat(product.original_price).toLocaleString()}
                </span>
              )}
            </div>
            {discountPct && (
              <span style={{ fontSize: '8px', fontWeight: 800, flexShrink: 0,
                background: '#fef2f2', color: '#dc2626',
                padding: '2px 6px', borderRadius: '100px' }}>
                -{discountPct}%
              </span>
            )}
          </div>

          {/* Add to Cart — always visible */}
          <button
            onClick={handleCartAndGo}
            style={{ width: '100%', padding: '8px', borderRadius: '100px',
              background: '#0d1b2a', color: '#c9a96e', border: 'none',
              cursor: 'pointer', fontSize: '10px', fontWeight: 800,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              fontFamily: 'inherit', transition: 'opacity .15s' }}
            onMouseEnter={e => e.currentTarget.style.opacity='.85'}
            onMouseLeave={e => e.currentTarget.style.opacity='1'}>
            Add to Cart
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f5f0',
      paddingTop: '80px', fontFamily: 'system-ui,-apple-system,sans-serif' }}>

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .wish-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        @media(min-width:640px)  { .wish-grid { grid-template-columns:repeat(3,1fr); gap:14px; } }
        @media(min-width:1024px) { .wish-grid { grid-template-columns:repeat(4,1fr); gap:18px; } }
        .fade-in { animation: fadeUp .45s ease forwards; }
      `}</style>

      {/* Page header */}
      <div style={{ background: '#0d1b2a', padding: '28px 16px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: '#c9a96e', margin: '0 0 5px' }}>Saved Items</p>
          <h1 style={{ fontSize: 'clamp(1.6rem,5vw,2.6rem)', fontWeight: 700, color: '#fff',
            fontFamily: 'Georgia,serif', letterSpacing: '-0.02em', margin: '0 0 4px', lineHeight: 1 }}>
            My Wishlist
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', margin: 0 }}>
            {wishlist.length} saved item{wishlist.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 14px 56px' }}>

        {/* Actions bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <p style={{ fontSize: '12px', color: '#aaa', margin: 0 }}>
            <span style={{ color: '#0d1b2a', fontWeight: 700 }}>{wishlist.length}</span>
            {' '}item{wishlist.length !== 1 ? 's' : ''} saved
          </p>
          <button onClick={() => navigate('shop')}
            style={{ background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', fontSize: '13px', fontWeight: 700, color: '#c9a96e' }}>
            Continue Shopping →
          </button>
        </div>

        {/* Grid */}
        <div className="wish-grid fade-in">
          {wishlist.map(product => (
            <WishCard key={product.id} product={product} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '20px',
            border: '1.5px solid #ede9e3', padding: '28px 24px',
            textAlign: 'center', maxWidth: '400px', width: '100%' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px', lineHeight: 1 }}>🛍️</div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0d1b2a',
              fontFamily: 'Georgia,serif', margin: '0 0 6px' }}>
              Ready to order?
            </h3>
            <p style={{ fontSize: '13px', color: '#aaa', lineHeight: 1.6, margin: '0 0 20px' }}>
              Add all your saved items to cart and checkout
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => { wishlist.forEach(p => addToCart(p, 1, null)); navigate('cart'); }}
                style={{ padding: '11px 24px', borderRadius: '100px',
                  background: '#0d1b2a', color: '#c9a96e', border: 'none',
                  cursor: 'pointer', fontSize: '11px', fontWeight: 800,
                  letterSpacing: '0.09em', textTransform: 'uppercase',
                  fontFamily: 'inherit', transition: 'opacity .15s' }}
                onMouseEnter={e => e.currentTarget.style.opacity='.85'}
                onMouseLeave={e => e.currentTarget.style.opacity='1'}>
                Add All to Cart
              </button>
              <button
                onClick={() => navigate('shop')}
                style={{ padding: '11px 24px', borderRadius: '100px',
                  background: '#fff', color: '#0d1b2a',
                  border: '1.5px solid #d5d0c8', cursor: 'pointer',
                  fontSize: '11px', fontWeight: 800,
                  letterSpacing: '0.09em', textTransform: 'uppercase',
                  fontFamily: 'inherit', transition: 'all .15s' }}
                onMouseEnter={e => { e.currentTarget.style.background='#0d1b2a'; e.currentTarget.style.color='#c9a96e'; e.currentTarget.style.borderColor='#0d1b2a'; }}
                onMouseLeave={e => { e.currentTarget.style.background='#fff'; e.currentTarget.style.color='#0d1b2a'; e.currentTarget.style.borderColor='#d5d0c8'; }}>
                Browse More
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}