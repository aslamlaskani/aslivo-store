import React, { useState, useEffect, useRef } from 'react';
import { productsAPI } from '../api';
import { placeholderImg } from '../utils/placeholder';
export default function HomePage({ navigate, addToCart, wishlist, toggleWishlist }) {
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [count, setCount] = useState({ products: 0, customers: 0, orders: 0 });
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const slideTimer = useRef(null);

  const slides = [
    {
      badge: 'Summer Collection 2025',
      title: 'New Season,\nNew Style',
      subtitle: 'Discover premium fashion crafted for the modern Pakistani lifestyle',
      cta: 'Shop Now',
      ctaNav: 'shop',
      image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&q=90',
      accent: '#c9a96e',
      bg: '#0d1b2a',
    },
    {
      badge: 'Flash Sale — Up to 50% Off',
      title: 'Hot Deals\nEvery Day',
      subtitle: 'Limited time offers on our best selling products across all categories',
      cta: 'View Sale',
      ctaNav: 'flashsale',
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=90',
      accent: '#ef4444',
      bg: '#1a0808',
    },
    {
      badge: 'New Arrivals',
      title: 'Fresh Styles\nJust Landed',
      subtitle: 'Be the first to wear the latest trends from top brands',
      cta: 'Explore',
      ctaNav: 'shop',
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&q=90',
      accent: '#34d399',
      bg: '#071a0f',
    },
  ];

  useEffect(() => {
    loadData();
    startSlider();
    animateCounters();
    return () => clearInterval(slideTimer.current);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [featuredData, newArrivalsData] = await Promise.all([
        productsAPI.getFeatured(),
        productsAPI.getNewArrivals(),
      ]);
      setFeatured(featuredData.data?.results || featuredData.data || []);
      setNewArrivals(newArrivalsData.data?.results || newArrivalsData.data || []);
    } catch (err) {
      console.error('Failed to load home data:', err);
    } finally {
      setLoading(false);
    }
  };

  const startSlider = () => {
    slideTimer.current = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 6000);
  };

  const animateCounters = () => {
    const targets = { products: 500, customers: 10000, orders: 25000 };
    const steps = 60;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const ease = 1 - Math.pow(1 - step / steps, 3);
      setCount({
        products: Math.floor(targets.products * ease),
        customers: Math.floor(targets.customers * ease),
        orders: Math.floor(targets.orders * ease),
      });
      if (step >= steps) clearInterval(timer);
    }, 2000 / steps);
  };

  const isInWishlist = (id) => wishlist?.some(i => i.id === id);

const ProductCard = ({ product }) => {
  const [hovered, setHovered] = useState(false);

  const badgeColor = {
    new:      { bg: '#0d1b2a', color: '#c9a96e' },
    featured: { bg: '#c9a96e', color: '#0d1b2a' },
    sale:     { bg: '#ef4444', color: '#fff'     },
    hot:      { bg: '#f97316', color: '#fff'     },
  };
  const badge = product.badge ? badgeColor[product.badge] || { bg: '#0d1b2a', color: '#fff' } : null;
  const badgeLabel = product.badge === 'sale' && product.discount_percent > 0
    ? `-${product.discount_percent}%`
    : product.badge;

  return (
    <div
      onClick={() => navigate('product', product)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff', borderRadius: '14px', overflow: 'hidden',
        border: hovered ? '1px solid #c9a96e' : '1px solid #ede9e3',
        cursor: 'pointer',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? '0 14px 36px rgba(0,0,0,0.10)' : '0 2px 8px rgba(0,0,0,0.04)',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Image — square ratio */}
      <div style={{ position: 'relative', paddingTop: '100%', overflow: 'hidden', background: '#f7f4ef', flexShrink: 0 }}>
        <img
          src={product.primary_image || 'placeholderImg(300,300)'}
          alt={product.name}
          onError={e => { e.target.src = 'placeholderImg(300,300)'; }}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
            transition: 'transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94)',
            transform: hovered ? 'scale(1.06)' : 'scale(1)',
          }}
        />
        {badge && (
          <span style={{ position: 'absolute', top: '9px', left: '9px', background: badge.bg, color: badge.color, fontSize: '9px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 9px', borderRadius: '100px' }}>
            {badgeLabel}
          </span>
        )}
        <button
          onClick={e => { e.stopPropagation(); toggleWishlist(product); }}
          style={{
            position: 'absolute', top: '9px', right: '9px',
            width: '30px', height: '30px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(0,0,0,0.06)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: hovered ? 1 : 0, transition: 'opacity 0.2s ease',
            boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24"
            fill={isInWishlist(product.id) ? '#ef4444' : 'none'}
            stroke={isInWishlist(product.id) ? '#ef4444' : '#374151'} strokeWidth="2.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, transition: 'transform 0.3s ease', transform: hovered ? 'translateY(0)' : 'translateY(100%)' }}>
          <button
            onClick={e => { e.stopPropagation(); addToCart(product, 1, null); }}
            style={{ width: '100%', padding: '10px 0', border: 'none', cursor: 'pointer', background: 'rgba(13,27,42,0.94)', color: '#c9a96e', fontSize: '10px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}
          >
            + Quick Add
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '10px 12px 12px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <p style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#c9a96e', margin: '0 0 3px' }}>
          {product.category_name || 'Product'}
        </p>
        <p style={{ fontSize: '12px', fontWeight: 500, color: '#0d1b2a', margin: '0 0 8px', lineHeight: 1.35, flex: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {product.name}
        </p>
        <div style={{ height: '1px', background: '#f0ece6', margin: '0 0 9px' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#0d1b2a', fontFamily: 'Georgia, serif' }}>
              Rs. {parseFloat(product.price).toLocaleString()}
            </span>
            {product.original_price && parseFloat(product.original_price) > parseFloat(product.price) && (
              <span style={{ fontSize: '10px', color: '#c0bab2', textDecoration: 'line-through' }}>
                Rs. {parseFloat(product.original_price).toLocaleString()}
              </span>
            )}
          </div>
          {product.original_price && parseFloat(product.original_price) > parseFloat(product.price) && (
            <span style={{ fontSize: '9px', fontWeight: 800, background: '#fef2f2', color: '#dc2626', padding: '2px 6px', borderRadius: '100px', letterSpacing: '0.04em', flexShrink: 0 }}>
              {Math.round((1 - parseFloat(product.price) / parseFloat(product.original_price)) * 100)}% off
            </span>
          )}
        </div>
        <button
          onClick={e => { e.stopPropagation(); addToCart(product, 1, null); }}
          style={{ width: '100%', padding: '8px', background: '#fff', border: '1px solid #ddd6cc', borderRadius: '100px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#0d1b2a', cursor: 'pointer', transition: 'all 0.18s ease', fontFamily: 'inherit' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#0d1b2a'; e.currentTarget.style.color = '#c9a96e'; e.currentTarget.style.borderColor = '#0d1b2a'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#0d1b2a'; e.currentTarget.style.borderColor = '#ddd6cc'; }}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

  /* ── SKELETON ── */
  const SkeletonCard = () => (
    <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #ede9e3' }}>
      <div style={{ paddingTop: '125%', background: '#f7f4ef' }} />
      <div style={{ padding: '13px 14px 16px' }}>
        <div style={{ height: '8px', width: '50px', background: '#f3ede3', borderRadius: '4px', marginBottom: '8px' }} />
        <div style={{ height: '13px', width: '90%', background: '#f3f4f6', borderRadius: '4px', marginBottom: '6px' }} />
        <div style={{ height: '13px', width: '60%', background: '#f3f4f6', borderRadius: '4px', marginBottom: '14px' }} />
        <div style={{ height: '1px', background: '#f0ece6', marginBottom: '11px' }} />
        <div style={{ height: '15px', width: '80px', background: '#f3ede3', borderRadius: '4px' }} />
      </div>
    </div>
  );

  const currentSlideData = slides[currentSlide];

  return (
    <div style={{ background: '#f8f5f0', fontFamily: 'system-ui, -apple-system, sans-serif', overflowX: 'hidden', maxWidth: '100vw' }}>

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .slide-anim { animation: fadeUp 0.6s ease forwards; }
        .pulse-dot { animation: pulse 2s ease-in-out infinite; }
        .prod-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
        .cat-grid  { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
        .trust-grid{ display: grid; grid-template-columns: repeat(2, 1fr); }
        .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); }
        @media (min-width: 640px) {
          .prod-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; }
          .cat-grid  { grid-template-columns: repeat(4, 1fr); gap: 16px; }
          .trust-grid{ grid-template-columns: repeat(4, 1fr); }
        }
        @media (min-width: 1024px) {
          .prod-grid { grid-template-columns: repeat(4, 1fr); gap: 20px; }
        }
      `}</style>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', height: '88vh', minHeight: '540px', maxHeight: '900px', overflow: 'hidden' }}>
        {slides.map((slide, i) => (
          <div key={i} style={{
            position: 'absolute', inset: 0,
            opacity: i === currentSlide ? 1 : 0,
            transition: 'opacity 1.2s ease',
            pointerEvents: i === currentSlide ? 'auto' : 'none',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: slide.bg }} />
            <img src={slide.image} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.22 }} />
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${slide.bg}f5 0%, ${slide.bg}88 55%, transparent 100%)` }} />
          </div>
        ))}

        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '42%' }}>
          {slides.map((slide, i) => (
            <div key={i} style={{ position: 'absolute', inset: 0, opacity: i === currentSlide ? 1 : 0, transition: 'opacity 1.2s ease' }}>
              <img src={slide.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55 }} />
              <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to right, ${slide.bg} 0%, transparent 55%)` }} />
            </div>
          ))}
        </div>

        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', padding: '0 5vw' }}>
          <div key={currentSlide} className="slide-anim" style={{ maxWidth: '520px', width: '100%' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px', marginBottom: '18px',
              background: `${currentSlideData.accent}1a`,
              border: `1px solid ${currentSlideData.accent}40`,
              borderRadius: '100px', padding: '5px 14px',
            }}>
              <span className="pulse-dot" style={{ width: '5px', height: '5px', borderRadius: '50%', background: currentSlideData.accent, flexShrink: 0 }} />
              <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: currentSlideData.accent }}>
                {currentSlideData.badge}
              </span>
            </div>
            <h1 style={{
              fontSize: 'clamp(2.4rem, 7vw, 5rem)', fontWeight: 700, color: 'white',
              fontFamily: 'Georgia, serif', letterSpacing: '-0.025em', lineHeight: 1,
              margin: '0 0 18px', whiteSpace: 'pre-line',
            }}>
              {currentSlideData.title}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: 'clamp(0.8rem, 2vw, 1rem)', lineHeight: 1.65, maxWidth: '380px', margin: '0 0 28px' }}>
              {currentSlideData.subtitle}
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate(currentSlideData.ctaNav)}
                style={{
                  background: currentSlideData.accent,
                  color: currentSlideData.accent === '#c9a96e' ? '#0d1b2a' : 'white',
                  border: 'none', cursor: 'pointer',
                  padding: '13px 26px', borderRadius: '100px',
                  fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
                  boxShadow: `0 6px 20px ${currentSlideData.accent}45`,
                }}
              >
                {currentSlideData.cta} →
              </button>
              <button
                onClick={() => navigate('shop')}
                style={{
                  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.18)',
                  color: 'rgba(255,255,255,0.82)', cursor: 'pointer',
                  padding: '13px 26px', borderRadius: '100px', fontSize: '11px', fontWeight: 600,
                }}
              >
                Browse All
              </button>
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: '24px', left: '5vw', display: 'flex', gap: '6px', zIndex: 10 }}>
          {slides.map((_, i) => (
            <button key={i}
              onClick={() => { setCurrentSlide(i); clearInterval(slideTimer.current); startSlider(); }}
              style={{
                width: i === currentSlide ? '28px' : '7px', height: '7px',
                borderRadius: '100px', border: 'none', cursor: 'pointer', padding: 0,
                background: i === currentSlide ? currentSlideData.accent : 'rgba(255,255,255,0.22)',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
        <div style={{ position: 'absolute', bottom: '24px', right: '5vw', color: 'rgba(255,255,255,0.3)', fontSize: '11px', fontWeight: 600 }}>
          {String(currentSlide + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <div style={{ background: '#0d1b2a' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
          <div className="trust-grid">
            {[
              { icon: '🚚', title: 'Free Delivery',   desc: 'Orders above Rs. 2000' },
              { icon: '🔄', title: 'Easy Returns',    desc: '7-day return policy'   },
              { icon: '🔒', title: 'Secure Payment',  desc: 'JazzCash, EasyPaisa'   },
              { icon: '💬', title: '24/7 Support',    desc: 'WhatsApp & Call'        },
            ].map((f, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '14px 12px',
                borderRight:  i % 2 === 0  ? '1px solid rgba(255,255,255,0.05)' : 'none',
                borderBottom: i < 2        ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}>
                <span style={{ fontSize: '18px', flexShrink: 0 }}>{f.icon}</span>
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: '#c9a96e', margin: 0 }}>{f.title}</p>
                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.28)', margin: 0, marginTop: '1px' }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CATEGORIES — no dummy product counts ── */}
      <section style={{ padding: '52px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <p style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#c9a96e', margin: '0 0 6px' }}>Browse By</p>
            <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 700, color: '#0d1b2a', fontFamily: 'Georgia, serif', letterSpacing: '-0.02em', margin: 0 }}>
              Shop Categories
            </h2>
          </div>
          <div className="cat-grid">
            {[
              { icon: '👔', label: 'Men',         bg: '#eef2ff', accent: '#4f46e5', nav: 'men'         },
              { icon: '👗', label: 'Women',       bg: '#fdf2f8', accent: '#db2777', nav: 'women'       },
              { icon: '👜', label: 'Accessories', bg: '#fffbeb', accent: '#d97706', nav: 'accessories' },
              { icon: '👟', label: 'Footwear',    bg: '#ecfdf5', accent: '#059669', nav: 'footwear'    },
            ].map((cat, i) => (
              <button key={i}
                onClick={() => navigate('shop', { category: cat.nav })}
                style={{
                  background: cat.bg, border: 'none', borderRadius: '14px',
                  padding: '28px 14px', textAlign: 'center', cursor: 'pointer',
                  transition: 'transform 0.22s ease, box-shadow 0.22s ease',
                  width: '100%',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 24px rgba(0,0,0,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)';     e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ fontSize: '36px', marginBottom: '10px' }}>{cat.icon}</div>
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#0d1b2a', margin: '0 0 5px' }}>{cat.label}</p>
                <p style={{ fontSize: '11px', color: cat.accent, fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  Shop Now <span style={{ fontSize: '10px' }}>→</span>
                </p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section style={{ padding: '52px 0', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <p style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#c9a96e', margin: '0 0 5px' }}>Hand Picked</p>
              <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 700, color: '#0d1b2a', fontFamily: 'Georgia, serif', letterSpacing: '-0.02em', margin: 0 }}>Featured Products</h2>
            </div>
            <button onClick={() => navigate('shop')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c9a96e', fontSize: '13px', fontWeight: 700 }}>
              View All →
            </button>
          </div>
          <div className="prod-grid">
            {loading
              ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
              : featured.filter(p => p.badge === 'featured').length > 0
                ? featured.filter(p => p.badge === 'featured').slice(0, 8).map(p => <ProductCard key={p.id} product={p} />)
                : featured.slice(0, 8).map(p => <ProductCard key={p.id} product={p} />)
            }
            {!loading && featured.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>
                <div style={{ fontSize: '44px', marginBottom: '10px' }}>📦</div>
                <p style={{ margin: 0 }}>No featured products yet.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── FLASH SALE BANNER ── */}
      <section style={{ position: 'relative', padding: '60px 16px', background: '#0d1b2a', overflow: 'hidden', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(201,169,110,0.05)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '560px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', marginBottom: '14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.22)', borderRadius: '100px', padding: '5px 14px' }}>
            <span className="pulse-dot" style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
            <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#ef4444' }}>Limited Time</span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.7rem, 5vw, 2.8rem)', fontWeight: 700, color: 'white', fontFamily: 'Georgia, serif', letterSpacing: '-0.02em', margin: '0 0 10px', lineHeight: 1.12 }}>
            Flash Sale —<br />Up to 50% Off!
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', margin: '0 auto 24px', maxWidth: '340px' }}>
            Don't miss our biggest sale. Limited stock!
          </p>
          <button
            onClick={() => navigate('flashsale')}
            style={{
              background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white',
              border: 'none', cursor: 'pointer', padding: '14px 32px', borderRadius: '100px',
              fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
              boxShadow: '0 6px 20px rgba(239,68,68,0.38)',
            }}
          >
            🔥 Shop the Sale
          </button>
        </div>
      </section>

      {/* ── NEW ARRIVALS ── */}
      <section style={{ padding: '52px 0', background: '#f8f5f0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <p style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#c9a96e', margin: '0 0 5px' }}>Just In</p>
              <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 700, color: '#0d1b2a', fontFamily: 'Georgia, serif', letterSpacing: '-0.02em', margin: 0 }}>New Arrivals</h2>
            </div>
            <button onClick={() => navigate('shop')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c9a96e', fontSize: '13px', fontWeight: 700 }}>
              View All →
            </button>
          </div>
          <div className="prod-grid">
            {loading
              ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
              : newArrivals.filter(p => p.badge === 'new').length > 0
                ? newArrivals.filter(p => p.badge === 'new').slice(0, 8).map(p => <ProductCard key={p.id} product={p} />)
                : newArrivals.slice(0, 8).map(p => <ProductCard key={p.id} product={p} />)
            }
            {!loading && newArrivals.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>
                <div style={{ fontSize: '44px', marginBottom: '10px' }}>✨</div>
                <p style={{ margin: 0 }}>No new arrivals yet.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ background: '#0d1b2a', padding: '48px 16px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="stat-grid">
            {[
              { value: count.products,  suffix: '+', label: 'Products'  },
              { value: count.customers, suffix: '+', label: 'Customers' },
              { value: count.orders,    suffix: '+', label: 'Orders'    },
            ].map((stat, i) => (
              <div key={i} style={{
                textAlign: 'center', padding: '12px 8px',
                borderRight: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              }}>
                <p style={{ fontSize: 'clamp(1.6rem, 4.5vw, 2.6rem)', fontWeight: 700, color: '#c9a96e', fontFamily: 'Georgia, serif', margin: '0 0 4px' }}>
                  {stat.value.toLocaleString()}{stat.suffix}
                </p>
                <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section style={{ background: '#f8f5f0', padding: '60px 16px' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#c9a96e', margin: '0 0 8px' }}>Stay Updated</p>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 700, color: '#0d1b2a', fontFamily: 'Georgia, serif', letterSpacing: '-0.02em', margin: '0 0 8px' }}>
            Get Exclusive Offers
          </h2>
          <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.6, margin: '0 0 24px' }}>
            Subscribe and get 10% off your first order!
          </p>
          {subscribed ? (
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '16px', color: '#065f46', fontWeight: 600, fontSize: '13px' }}>
              ✅ Subscribed! Check your email for the discount.
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{
                  flex: 1, minWidth: 0, padding: '13px 16px', borderRadius: '100px',
                  border: '1.5px solid #ddd6cc', background: 'white',
                  fontSize: '13px', color: '#0d1b2a', outline: 'none',
                }}
                onFocus={e  => e.target.style.borderColor = '#c9a96e'}
                onBlur={e   => e.target.style.borderColor = '#ddd6cc'}
                onKeyDown={e => e.key === 'Enter' && email.includes('@') && (setSubscribed(true), setEmail(''))}
              />
              <button
                onClick={() => { if (email.includes('@')) { setSubscribed(true); setEmail(''); } }}
                style={{
                  flexShrink: 0, background: '#0d1b2a', color: '#c9a96e',
                  border: 'none', cursor: 'pointer', borderRadius: '100px',
                  padding: '13px 20px', fontSize: '11px', fontWeight: 800,
                  letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap',
                }}
              >
                Subscribe
              </button>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}