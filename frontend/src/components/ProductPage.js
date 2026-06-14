import React, { useState, useEffect } from 'react';
import { productsAPI } from '../api';

export default function ProductPage({ product, navigate, addToCart, wishlist, toggleWishlist }) {
  const [fullProduct, setFullProduct]     = useState(null);
  const [loading, setLoading]             = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize]   = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity]           = useState(1);
  const [activeTab, setActiveTab]         = useState('description');
  const [addedToCart, setAddedToCart]     = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviewForm, setReviewForm]       = useState({ rating: 5, comment: '' });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewError, setReviewError]     = useState('');
  const [imgZoomed, setImgZoomed]         = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (product?.id) loadProduct(); }, [product]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const res  = await productsAPI.getOne(product.id);
      const data = res.data;
      setFullProduct(data);
      setSelectedImage(0);
      if (data.category?.id) {
        const rel  = await productsAPI.getAll({ category: data.category.id, ordering: '-rating' });
        const list = rel.data?.results || rel.data || [];
        setRelatedProducts(list.filter(p => p.id !== product.id).slice(0, 4));
      }
    } catch {
      setFullProduct(product);
    } finally { setLoading(false); }
  };

  const handleAddToCart = () => {
    addToCart(fullProduct || product, quantity, selectedSize || null);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2200);
  };

  const handleSubmitReview = async () => {
    setReviewLoading(true); setReviewError('');
    try {
      await productsAPI.addReview(product.id, reviewForm);
      setReviewSuccess('Review submitted!');
      setReviewForm({ rating: 5, comment: '' });
      await loadProduct();
      setTimeout(() => setReviewSuccess(''), 3000);
    } catch (err) {
      const d = err?.response?.data;
      setReviewError(d?.detail || d?.error || 'Please login to submit a review.');
    } finally { setReviewLoading(false); }
  };

  const isInWishlist = wishlist?.some(i => i.id === product?.id);
  const p = fullProduct || product;

  const images = fullProduct?.images?.length > 0
    ? fullProduct.images.map(img => img.image_url || img.image)
    : [product?.primary_image || 'https://via.placeholder.com/600x800'];

  const sizes  = [...new Set(fullProduct?.variants?.filter(v => v.size).map(v => v.size)  || [])];
  const colors = [...new Set(fullProduct?.variants?.filter(v => v.color).map(v => v.color) || [])];

  const BADGE = {
    new:      { bg: '#0d1b2a', color: '#c9a96e' },
    featured: { bg: '#c9a96e', color: '#0d1b2a' },
    sale:     { bg: '#ef4444', color: '#fff'     },
    hot:      { bg: '#f97316', color: '#fff'     },
  };

  const StarRow = ({ rating, size = 16 }) => (
    <div style={{ display:'flex', gap:'2px' }}>
      {[1,2,3,4,5].map(s => (
        <svg key={s} width={size} height={size} viewBox="0 0 20 20"
          fill={s <= Math.round(rating||0) ? '#c9a96e' : '#e5e7eb'}>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
  );

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#f8f5f0', paddingTop:'80px',
      fontFamily:'system-ui,-apple-system,sans-serif' }}>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'20px 14px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:'20px' }}>
          <div style={{ borderRadius:'16px', maxHeight:'380px', height:'55vw', minHeight:'200px',
            background:'linear-gradient(90deg,#f7f4ef 25%,#ede9e3 50%,#f7f4ef 75%)',
            backgroundSize:'200% 100%', animation:'shimmer 1.4s infinite' }} />
          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            {[120,200,80,60,48].map((w,i) => (
              <div key={i} style={{ height:i===2?'38px':'13px', width:`${w}px`, borderRadius:'6px',
                background:'linear-gradient(90deg,#f7f4ef 25%,#ede9e3 50%,#f7f4ef 75%)',
                backgroundSize:'200% 100%', animation:'shimmer 1.4s infinite', maxWidth:'100%' }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const badgeCfg   = p?.badge ? BADGE[p.badge] : null;
  const badgeLabel = p?.badge === 'sale' && p?.discount_percent > 0
    ? `-${p.discount_percent}%` : p?.badge?.toUpperCase();
  const discountPct = p?.original_price && parseFloat(p.original_price) > parseFloat(p.price)
    ? Math.round((1 - parseFloat(p.price) / parseFloat(p.original_price)) * 100) : null;

  return (
    <div style={{ minHeight:'100vh', background:'#f8f5f0', paddingTop:'80px',
      fontFamily:'system-ui,-apple-system,sans-serif' }}>

      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

        /* ── Layout ── */
        .pp-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          animation: fadeUp .45s ease;
        }
        @media(min-width:768px) {
          .pp-grid { grid-template-columns: 1fr 1fr; gap: 36px; align-items: start; }
        }
        @media(min-width:1024px) {
          .pp-grid { grid-template-columns: 1.1fr 1fr; gap: 52px; }
        }

        /* ── Main image ── */
        .pp-main-img {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          background: #f7f4ef;
          cursor: zoom-in;
          height: 260px;
          width: 100%;
        }
        @media(min-width:400px)  { .pp-main-img { height: 300px; } }
        @media(min-width:540px)  { .pp-main-img { height: 360px; } }
        @media(min-width:768px)  {
          .pp-main-img {
            height: auto;
            aspect-ratio: 3/4;
            max-height: 560px;
            border-radius: 20px;
          }
        }
        @media(min-width:1024px) { .pp-main-img { max-height: 640px; } }
        .pp-main-img.zoomed { cursor: zoom-out; }

        /* ── Thumbnails ── */
        .pp-thumbs {
          display: flex; gap: 7px; margin-top: 9px;
          overflow-x: auto; scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
        }
        .pp-thumbs::-webkit-scrollbar { height: 3px; }
        .pp-thumbs::-webkit-scrollbar-thumb { background: #ddd6cc; border-radius: 4px; }
        .pp-thumb {
          flex-shrink: 0; scroll-snap-align: start;
          width: 56px; height: 68px;
          border-radius: 9px; overflow: hidden; padding: 0; cursor: pointer;
          background: #f7f4ef; transition: border-color .15s;
        }
        @media(min-width:480px) { .pp-thumb { width: 64px; height: 78px; } }
        @media(min-width:768px) { .pp-thumb { width: 72px; height: 88px; } }

        /* ── Info panel ── */
        .pp-info {
          display: flex; flex-direction: column; gap: 16px;
        }
        @media(min-width:768px) {
          .pp-info { gap: 18px; position: sticky; top: 96px; }
        }

        /* ── CTA row ── */
        .pp-cta { display: flex; gap: 10px; flex-direction: column; }
        @media(min-width:400px) { .pp-cta { flex-direction: row; } }

        /* ── Trust badges ── */
        .pp-trust { display: grid; grid-template-columns: repeat(3,1fr); gap: 7px; }

        /* ── Tabs ── */
        .pp-tabs { display:flex; overflow-x:auto; border-bottom:1px solid #f0ece6; margin-bottom:18px; }
        .pp-tabs::-webkit-scrollbar { display:none; }

        /* ── Related grid ── */
        .rel-grid {
          display: grid;
          grid-template-columns: repeat(2,1fr);
          gap: 11px;
        }
        @media(min-width:640px)  { .rel-grid { grid-template-columns:repeat(4,1fr); gap:14px; } }

        /* ── Detail table ── */
        .pp-detail-row {
          display:flex; justify-content:space-between; align-items:center;
          padding:11px 0; border-bottom:1px solid #f7f4ef; gap:12px;
        }
      `}</style>

      <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'14px 14px 56px' }}>

        {/* Breadcrumb */}
        <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'16px',
          fontSize:'12px', color:'#aaa', flexWrap:'wrap' }}>
          {[['Home','home'],['Shop','shop']].map(([label,route]) => (
            <React.Fragment key={route}>
              <button onClick={() => navigate(route)}
                style={{ background:'none', border:'none', cursor:'pointer', color:'#aaa',
                  fontSize:'12px', fontFamily:'inherit', padding:0 }}
                onMouseEnter={e=>e.target.style.color='#c9a96e'}
                onMouseLeave={e=>e.target.style.color='#aaa'}>{label}</button>
              <span style={{ color:'#ddd' }}>/</span>
            </React.Fragment>
          ))}
          <span style={{ color:'#0d1b2a', fontWeight:600, fontSize:'12px',
            overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'160px' }}>
            {p?.name}
          </span>
        </div>

        {/* ══ MAIN GRID ══ */}
        <div className="pp-grid" style={{ marginBottom:'36px' }}>

          {/* ── LEFT: Gallery ── */}
          <div>
            <div className={`pp-main-img${imgZoomed?' zoomed':''}`}
              onClick={() => setImgZoomed(z=>!z)}>
              <img src={images[selectedImage]} alt={p?.name}
                style={{ width:'100%', height:'100%', objectFit:'cover', display:'block',
                  transform: imgZoomed ? 'scale(1.35)' : 'scale(1)',
                  transition:'transform .5s cubic-bezier(.25,.46,.45,.94)' }} />

              {/* Badge */}
              {badgeCfg && badgeLabel && (
                <span style={{ position:'absolute', top:'12px', left:'12px',
                  background:badgeCfg.bg, color:badgeCfg.color,
                  fontSize:'9px', fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase',
                  padding:'4px 10px', borderRadius:'100px', zIndex:2 }}>
                  {badgeLabel}
                </span>
              )}

              {/* Wishlist */}
              <button onClick={e=>{ e.stopPropagation(); toggleWishlist(p); }}
                style={{ position:'absolute', top:'10px', right:'10px', zIndex:2,
                  width:'36px', height:'36px', borderRadius:'50%',
                  background:'rgba(255,255,255,0.95)', border:'1px solid rgba(0,0,0,0.06)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  cursor:'pointer', boxShadow:'0 2px 8px rgba(0,0,0,0.12)' }}>
                <svg width="15" height="15" viewBox="0 0 24 24"
                  fill={isInWishlist?'#ef4444':'none'}
                  stroke={isInWishlist?'#ef4444':'#374151'} strokeWidth="2.2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>

              {/* Arrows */}
              {images.length > 1 && ['←','→'].map((arrow, di) => {
                const dir = di === 0 ? -1 : 1;
                const side = di === 0 ? 'left' : 'right';
                return (
                  <button key={side}
                    onClick={e=>{ e.stopPropagation(); setSelectedImage(i=>(i+dir+images.length)%images.length); }}
                    style={{ position:'absolute', top:'50%', [side]:'10px', transform:'translateY(-50%)',
                      zIndex:2, width:'32px', height:'32px', borderRadius:'50%',
                      background:'rgba(255,255,255,0.9)', border:'none', cursor:'pointer',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:'14px', color:'#0d1b2a', boxShadow:'0 2px 6px rgba(0,0,0,0.12)' }}>
                    {arrow}
                  </button>
                );
              })}

              {/* Counter */}
              {images.length > 1 && (
                <div style={{ position:'absolute', bottom:'10px', right:'10px',
                  background:'rgba(13,27,42,0.6)', color:'rgba(255,255,255,0.85)',
                  fontSize:'9px', fontWeight:600, padding:'3px 8px', borderRadius:'100px', zIndex:2 }}>
                  {selectedImage+1}/{images.length}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="pp-thumbs">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)} className="pp-thumb"
                    style={{ border:`2px solid ${selectedImage===i?'#c9a96e':'transparent'}`,
                      boxShadow: selectedImage===i ? '0 0 0 1px #c9a96e' : 'none' }}>
                    <img src={img} alt={`${p?.name} ${i+1}`}
                      style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Info ── */}
          <div className="pp-info">

            {/* Category */}
            <p style={{ fontSize:'10px', fontWeight:800, letterSpacing:'0.14em',
              textTransform:'uppercase', color:'#c9a96e', margin:0 }}>
              {p?.category?.name || p?.category_name}
            </p>

            {/* Name */}
            <h1 style={{ fontSize:'clamp(1.4rem,5vw,2.2rem)', fontWeight:700, color:'#0d1b2a',
              fontFamily:'Georgia,serif', letterSpacing:'-0.02em', lineHeight:1.2, margin:0 }}>
              {p?.name}
            </h1>

            {/* Rating + stock */}
            <div style={{ display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap' }}>
              <StarRow rating={p?.rating} size={16} />
              <span style={{ fontSize:'12px', color:'#aaa' }}>
                {parseFloat(p?.rating||0).toFixed(1)} · {p?.review_count||0} reviews
              </span>
              {p?.stock > 0 && (
                <span style={{ fontSize:'10px', fontWeight:700,
                  background:'#ecfdf5', color:'#059669', padding:'3px 9px',
                  borderRadius:'100px', letterSpacing:'0.04em' }}>
                  ✓ In Stock ({p.stock})
                </span>
              )}
            </div>

            <div style={{ height:'1px', background:'#f0ece6' }} />

            {/* Price */}
            <div style={{ display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap' }}>
              <span style={{ fontSize:'clamp(1.5rem,5vw,2rem)', fontWeight:700, color:'#0d1b2a',
                fontFamily:'Georgia,serif', lineHeight:1 }}>
                Rs. {parseFloat(p?.price||0).toLocaleString()}
              </span>
              {discountPct && (
                <>
                  <span style={{ fontSize:'14px', color:'#c0bab2', textDecoration:'line-through',
                    fontFamily:'Georgia,serif' }}>
                    Rs. {parseFloat(p.original_price).toLocaleString()}
                  </span>
                  <span style={{ fontSize:'11px', fontWeight:800,
                    background:'#fef2f2', color:'#dc2626', border:'1px solid #fecaca',
                    padding:'3px 9px', borderRadius:'100px' }}>
                    -{discountPct}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            {p?.description && (
              <p style={{ fontSize:'13px', color:'#6b7280', lineHeight:1.7, margin:0 }}>
                {p.description}
              </p>
            )}

            {/* Sizes */}
            {sizes.length > 0 && (
              <div>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'9px' }}>
                  <label style={{ fontSize:'9px', fontWeight:800, letterSpacing:'0.12em',
                    textTransform:'uppercase', color:'#c9a96e' }}>Size</label>
                  {selectedSize && (
                    <span style={{ fontSize:'11px', color:'#c9a96e', fontWeight:700 }}>
                      Selected: {selectedSize}
                    </span>
                  )}
                </div>
                <div style={{ display:'flex', gap:'7px', flexWrap:'wrap' }}>
                  {sizes.map(size => (
                    <button key={size} onClick={() => setSelectedSize(size)}
                      style={{ width:'42px', height:'42px', borderRadius:'9px', cursor:'pointer',
                        fontFamily:'inherit', fontSize:'12px', fontWeight:600,
                        border:`2px solid ${selectedSize===size?'#c9a96e':'#e5e0d8'}`,
                        background: selectedSize===size ? 'rgba(201,169,110,0.1)' : '#fff',
                        color: selectedSize===size ? '#c9a96e' : '#0d1b2a',
                        transition:'all .15s' }}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {colors.length > 0 && (
              <div>
                <label style={{ fontSize:'9px', fontWeight:800, letterSpacing:'0.12em',
                  textTransform:'uppercase', color:'#c9a96e', display:'block', marginBottom:'9px' }}>
                  Color
                </label>
                <div style={{ display:'flex', gap:'7px', flexWrap:'wrap' }}>
                  {colors.map(color => (
                    <button key={color} onClick={() => setSelectedColor(color)}
                      style={{ padding:'7px 14px', borderRadius:'100px', cursor:'pointer',
                        fontFamily:'inherit', fontSize:'12px', fontWeight:600,
                        border:`2px solid ${selectedColor===color?'#c9a96e':'#e5e0d8'}`,
                        background: selectedColor===color ? 'rgba(201,169,110,0.1)' : '#fff',
                        color: selectedColor===color ? '#c9a96e' : '#0d1b2a',
                        transition:'all .15s' }}>
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label style={{ fontSize:'9px', fontWeight:800, letterSpacing:'0.12em',
                textTransform:'uppercase', color:'#c9a96e', display:'block', marginBottom:'9px' }}>
                Quantity
              </label>
              <div style={{ display:'flex', alignItems:'center', width:'fit-content',
                border:'1.5px solid #e5e0d8', borderRadius:'11px', overflow:'hidden', background:'#fff' }}>
                <button onClick={() => setQuantity(q=>Math.max(1,q-1))}
                  style={{ width:'42px', height:'42px', border:'none', cursor:'pointer',
                    background:'transparent', fontSize:'20px', color:'#0d1b2a',
                    borderRight:'1px solid #f0ece6', transition:'background .15s', fontFamily:'inherit' }}
                  onMouseEnter={e=>e.target.style.background='#f7f4ef'}
                  onMouseLeave={e=>e.target.style.background='transparent'}>−</button>
                <span style={{ width:'48px', textAlign:'center', fontSize:'16px',
                  fontWeight:700, color:'#0d1b2a', fontFamily:'Georgia,serif' }}>
                  {quantity}
                </span>
                <button onClick={() => setQuantity(q=>q+1)}
                  style={{ width:'42px', height:'42px', border:'none', cursor:'pointer',
                    background:'transparent', fontSize:'20px', color:'#0d1b2a',
                    borderLeft:'1px solid #f0ece6', transition:'background .15s', fontFamily:'inherit' }}
                  onMouseEnter={e=>e.target.style.background='#f7f4ef'}
                  onMouseLeave={e=>e.target.style.background='transparent'}>+</button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="pp-cta">
              <button onClick={handleAddToCart}
                style={{ flex:1, padding:'13px 18px', borderRadius:'100px', border:'none',
                  cursor:'pointer', fontFamily:'inherit', fontSize:'11px', fontWeight:800,
                  letterSpacing:'0.1em', textTransform:'uppercase',
                  background: addedToCart ? '#059669' : '#c9a96e',
                  color: addedToCart ? '#fff' : '#0d1b2a',
                  transition:'all .2s', boxShadow: addedToCart
                    ? '0 4px 14px rgba(5,150,105,.3)' : '0 4px 14px rgba(201,169,110,.3)' }}>
                {addedToCart ? '✓ Added to Cart!' : '+ Add to Cart'}
              </button>
              <button onClick={() => { handleAddToCart(); navigate('checkout'); }}
                style={{ flex:1, padding:'13px 18px', borderRadius:'100px', cursor:'pointer',
                  fontFamily:'inherit', fontSize:'11px', fontWeight:800,
                  letterSpacing:'0.1em', textTransform:'uppercase',
                  background:'#0d1b2a', color:'#c9a96e',
                  border:'2px solid #0d1b2a', transition:'all .2s' }}
                onMouseEnter={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#0d1b2a'; }}
                onMouseLeave={e=>{ e.currentTarget.style.background='#0d1b2a'; e.currentTarget.style.color='#c9a96e'; }}>
                Buy Now
              </button>
            </div>

            {/* Trust badges */}
            <div className="pp-trust">
              {[
                { icon:'🔒', text:'Secure Payment' },
                { icon:'🔄', text:'7-Day Returns'  },
                { icon:'🚚', text:'Fast Delivery'  },
              ].map((b,i) => (
                <div key={i} style={{ background:'#fff', border:'1px solid #f0ece6',
                  borderRadius:'11px', padding:'9px 4px', textAlign:'center' }}>
                  <div style={{ fontSize:'16px', marginBottom:'3px' }}>{b.icon}</div>
                  <p style={{ fontSize:'9px', color:'#888', fontWeight:600, margin:0 }}>{b.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ TABS ══ */}
        <div style={{ background:'#fff', borderRadius:'18px', border:'1px solid #ede9e3',
          padding:'0 16px 20px', marginBottom:'36px', overflow:'hidden' }}>

          <div className="pp-tabs">
            {[
              { id:'description', label:'Description'                    },
              { id:'details',     label:'Details'                        },
              { id:'reviews',     label:`Reviews (${p?.review_count||0})` },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{ padding:'14px 16px', border:'none', cursor:'pointer',
                  background:'transparent', fontFamily:'inherit', fontSize:'13px',
                  fontWeight:600, whiteSpace:'nowrap',
                  color: activeTab===tab.id ? '#c9a96e' : '#aaa',
                  borderBottom:`2px solid ${activeTab===tab.id?'#c9a96e':'transparent'}`,
                  transition:'color .15s, border-color .15s' }}>
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'description' && (
            <p style={{ fontSize:'13px', color:'#6b7280', lineHeight:1.8, margin:0 }}>
              {p?.description || 'No description available.'}
            </p>
          )}

          {activeTab === 'details' && (
            <div>
              {[
                { label:'Category', value: p?.category?.name || p?.category_name },
                { label:'Stock',    value: p?.stock > 0 ? `${p.stock} available` : 'Out of stock' },
                { label:'Rating',   value: `${parseFloat(p?.rating||0).toFixed(1)} / 5.0` },
                { label:'Reviews',  value: `${p?.review_count||0} reviews` },
                sizes.length  > 0 && { label:'Sizes',  value: sizes.join(', ')  },
                colors.length > 0 && { label:'Colors', value: colors.join(', ') },
              ].filter(Boolean).map((item, i) => (
                <div key={i} className="pp-detail-row">
                  <span style={{ fontSize:'9px', fontWeight:800, letterSpacing:'0.1em',
                    textTransform:'uppercase', color:'#bbb', flexShrink:0 }}>{item.label}</span>
                  <span style={{ fontSize:'12px', fontWeight:600, color:'#0d1b2a',
                    textAlign:'right' }}>{item.value}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'18px' }}>

              {/* Write Review */}
              <div style={{ background:'#f8f5f0', borderRadius:'14px', padding:'16px' }}>
                <h3 style={{ fontSize:'15px', fontWeight:700, color:'#0d1b2a',
                  fontFamily:'Georgia,serif', margin:'0 0 14px' }}>Write a Review</h3>

                {reviewSuccess && (
                  <div style={{ background:'#ecfdf5', border:'1px solid #a7f3d0', borderRadius:'9px',
                    padding:'9px 12px', marginBottom:'10px', fontSize:'12px', color:'#065f46' }}>
                    ✅ {reviewSuccess}
                  </div>
                )}
                {reviewError && (
                  <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'9px',
                    padding:'9px 12px', marginBottom:'10px', fontSize:'12px', color:'#991b1b' }}>
                    ⚠️ {reviewError}
                  </div>
                )}

                <div style={{ marginBottom:'12px' }}>
                  <label style={{ fontSize:'9px', fontWeight:800, letterSpacing:'0.12em',
                    textTransform:'uppercase', color:'#c9a96e', display:'block', marginBottom:'7px' }}>
                    Your Rating
                  </label>
                  <div style={{ display:'flex', gap:'3px', alignItems:'center' }}>
                    {[1,2,3,4,5].map(star => (
                      <button key={star} onClick={() => setReviewForm(f=>({...f,rating:star}))}
                        style={{ background:'none', border:'none', cursor:'pointer', padding:'2px',
                          transform: star<=reviewForm.rating ? 'scale(1.1)' : 'scale(1)',
                          transition:'transform .15s' }}>
                        <svg width="24" height="24" viewBox="0 0 20 20"
                          fill={star<=reviewForm.rating?'#c9a96e':'#e5e7eb'}>
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                      </button>
                    ))}
                    <span style={{ fontSize:'11px', color:'#aaa', marginLeft:'5px' }}>
                      {reviewForm.rating}/5
                    </span>
                  </div>
                </div>

                <div style={{ marginBottom:'12px' }}>
                  <label style={{ fontSize:'9px', fontWeight:800, letterSpacing:'0.12em',
                    textTransform:'uppercase', color:'#c9a96e', display:'block', marginBottom:'7px' }}>
                    Comment
                  </label>
                  <textarea rows={3} placeholder="Share your experience…"
                    value={reviewForm.comment}
                    onChange={e => setReviewForm(f=>({...f,comment:e.target.value}))}
                    style={{ width:'100%', padding:'9px 12px', borderRadius:'10px',
                      border:'1.5px solid #ddd6cc', background:'#fff', fontSize:'13px',
                      color:'#0d1b2a', fontFamily:'inherit', resize:'none', outline:'none',
                      boxSizing:'border-box', lineHeight:1.6 }}
                    onFocus={e=>e.target.style.borderColor='#c9a96e'}
                    onBlur={e=>e.target.style.borderColor='#ddd6cc'} />
                </div>

                <button onClick={handleSubmitReview} disabled={reviewLoading}
                  style={{ padding:'9px 22px', borderRadius:'100px', border:'none',
                    cursor: reviewLoading?'not-allowed':'pointer', fontFamily:'inherit',
                    fontSize:'10px', fontWeight:800, letterSpacing:'0.08em', textTransform:'uppercase',
                    background:'#0d1b2a', color:'#c9a96e', opacity: reviewLoading?.7:1 }}>
                  {reviewLoading?'⏳ Submitting…':'⭐ Submit Review'}
                </button>
              </div>

              {fullProduct?.reviews?.length > 0 ? (
                <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                  {fullProduct.reviews.map((review, i) => (
                    <div key={i} style={{ border:'1px solid #f0ece6', borderRadius:'14px',
                      padding:'14px', background:'#fff' }}>
                      <div style={{ display:'flex', justifyContent:'space-between',
                        alignItems:'flex-start', marginBottom:'9px', flexWrap:'wrap', gap:'7px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'9px' }}>
                          <div style={{ width:'34px', height:'34px', borderRadius:'50%', flexShrink:0,
                            background:'linear-gradient(135deg,#c9a96e,#e8c98a)',
                            display:'flex', alignItems:'center', justifyContent:'center',
                            fontSize:'13px', fontWeight:700, color:'#0d1b2a' }}>
                            {review.user?.first_name?.charAt(0).toUpperCase()||'U'}
                          </div>
                          <div>
                            <p style={{ fontSize:'12px', fontWeight:600, color:'#0d1b2a', margin:'0 0 2px' }}>
                              {review.user?.first_name} {review.user?.last_name}
                            </p>
                            <p style={{ fontSize:'10px', color:'#bbb', margin:0 }}>
                              {new Date(review.created_at).toLocaleDateString('en-PK',
                                { day:'numeric', month:'short', year:'numeric' })}
                            </p>
                          </div>
                        </div>
                        <StarRow rating={review.rating} size={13} />
                      </div>
                      {review.comment && (
                        <p style={{ fontSize:'12px', color:'#6b7280', lineHeight:1.65, margin:0 }}>
                          {review.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign:'center', padding:'32px 0', color:'#bbb' }}>
                  <div style={{ fontSize:'36px', marginBottom:'8px' }}>⭐</div>
                  <p style={{ fontSize:'13px', margin:0 }}>No reviews yet. Be the first!</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ══ RELATED PRODUCTS ══ */}
        {relatedProducts.length > 0 && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end',
              marginBottom:'16px', flexWrap:'wrap', gap:'8px' }}>
              <div>
                <p style={{ fontSize:'10px', fontWeight:800, letterSpacing:'0.14em',
                  textTransform:'uppercase', color:'#c9a96e', margin:'0 0 3px' }}>
                  You May Also Like
                </p>
                <h2 style={{ fontSize:'clamp(1.2rem,3vw,1.7rem)', fontWeight:700, color:'#0d1b2a',
                  fontFamily:'Georgia,serif', margin:0 }}>
                  Related Products
                </h2>
              </div>
              <button onClick={() => navigate('shop')}
                style={{ background:'none', border:'none', cursor:'pointer',
                  fontFamily:'inherit', fontSize:'12px', fontWeight:700, color:'#c9a96e' }}>
                View All →
              </button>
            </div>

            <div className="rel-grid">
              {relatedProducts.map(rp => (
                <RelatedCard key={rp.id} rp={rp} navigate={navigate} addToCart={addToCart} BADGE={BADGE} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RelatedCard({ rp, navigate, addToCart, BADGE }) {
  const [hovered, setHovered] = useState(false);
  const [added, setAdded]     = useState(false);
  const cfg = rp.badge ? BADGE[rp.badge] : null;
  const discountPct = rp.original_price && parseFloat(rp.original_price) > parseFloat(rp.price)
    ? Math.round((1 - parseFloat(rp.price)/parseFloat(rp.original_price))*100) : null;

  const handleCart = (e) => {
    e.stopPropagation();
    addToCart(rp, 1, null);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div onClick={() => navigate('product', rp)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background:'#fff', borderRadius:'12px', overflow:'hidden', cursor:'pointer',
        display:'flex', flexDirection:'column',
        border:`1.5px solid ${hovered?'#c9a96e':'#ede9e3'}`,
        transform: hovered?'translateY(-2px)':'translateY(0)',
        boxShadow: hovered?'0 8px 24px rgba(0,0,0,0.09)':'0 1px 4px rgba(0,0,0,0.04)',
        transition:'all .22s ease' }}>

      <div style={{ position:'relative', paddingTop:'120%', overflow:'hidden',
        background:'#f7f4ef', flexShrink:0 }}>
        <img src={rp.primary_image||'https://via.placeholder.com/300x360'} alt={rp.name}
          onError={e=>{ e.target.src='https://via.placeholder.com/300x360'; }}
          style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover',
            transform: hovered?'scale(1.05)':'scale(1)',
            transition:'transform .5s cubic-bezier(.25,.46,.45,.94)' }} />
        {cfg && (
          <span style={{ position:'absolute', top:'8px', left:'8px', background:cfg.bg,
            color:cfg.color, fontSize:'7px', fontWeight:800, letterSpacing:'0.1em',
            textTransform:'uppercase', padding:'2px 8px', borderRadius:'100px', zIndex:2 }}>
            {rp.badge}
          </span>
        )}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, zIndex:2,
          transform: hovered?'translateY(0)':'translateY(100%)', transition:'transform .25s ease' }}>
          <button onClick={handleCart}
            style={{ width:'100%', padding:'9px 0', border:'none', cursor:'pointer',
              fontFamily:'inherit',
              background: added?'rgba(5,150,105,.95)':'rgba(13,27,42,.94)',
              color: added?'#fff':'#c9a96e',
              fontSize:'8px', fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase' }}>
            {added?'✓ Added':'+ Quick Add'}
          </button>
        </div>
      </div>

      <div style={{ padding:'9px 10px 11px', flex:1, display:'flex', flexDirection:'column' }}>
        <p style={{ fontSize:'7px', fontWeight:800, letterSpacing:'0.12em',
          textTransform:'uppercase', color:'#c9a96e', margin:'0 0 3px' }}>
          {rp.category_name||'Product'}
        </p>
        <h3 style={{ fontSize:'11px', fontWeight:500, color:'#0d1b2a', margin:'0 0 7px',
          lineHeight:1.35, flex:1, overflow:'hidden', display:'-webkit-box',
          WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
          {rp.name}
        </h3>
        <div style={{ height:'1px', background:'#f0ece6', margin:'0 0 7px' }} />
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontSize:'12px', fontWeight:700, color:'#0d1b2a', fontFamily:'Georgia,serif' }}>
            Rs.{parseFloat(rp.price).toLocaleString()}
          </span>
          {discountPct && (
            <span style={{ fontSize:'7px', fontWeight:800, background:'#fef2f2',
              color:'#dc2626', padding:'2px 5px', borderRadius:'100px' }}>
              -{discountPct}%
            </span>
          )}
        </div>
        <button onClick={handleCart}
          style={{ marginTop:'8px', width:'100%', padding:'6px', borderRadius:'100px',
            border:`1.5px solid ${added?'#059669':'#d5d0c8'}`,
            background: added?'#059669':'#fff',
            color: added?'#fff':'#0d1b2a',
            fontSize:'8px', fontWeight:800, letterSpacing:'0.07em', textTransform:'uppercase',
            cursor:'pointer', fontFamily:'inherit', transition:'all .18s' }}
          onMouseEnter={e=>{ if(!added) Object.assign(e.currentTarget.style,{background:'#0d1b2a',color:'#c9a96e',borderColor:'#0d1b2a'}); }}
          onMouseLeave={e=>{ if(!added) Object.assign(e.currentTarget.style,{background:'#fff',color:'#0d1b2a',borderColor:'#d5d0c8'}); }}>
          {added?'✓ Added!':'Add to Cart'}
        </button>
      </div>
    </div>
  );
}