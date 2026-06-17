import React, { useState, useEffect } from 'react';
import { productsAPI } from '../api';
import { placeholderImg } from '../utils/placeholder';
export default function ShopPage({ navigate, addToCart, wishlist, toggleWishlist }) {
  const [products, setProducts]       = useState([]);
  const [categories, setCategories]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [totalCount, setTotalCount]   = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange]             = useState([0, 50000]);
  const [selectedBadge, setSelectedBadge]       = useState('');
  const [sortBy, setSortBy]                     = useState('-created_at');
  const [searchQuery, setSearchQuery]           = useState('');
  const [viewMode, setViewMode]                 = useState('grid');
  const [filterOpen, setFilterOpen]             = useState(false);

  useEffect(() => { loadCategories(); }, []);
  useEffect(() => { loadProducts(); }, [selectedCategory, selectedBadge, sortBy, currentPage, searchQuery]);

  const loadCategories = async () => {
    try {
      const res = await productsAPI.getCategories();
      const raw = res?.data ?? res;
      setCategories(Array.isArray(raw) ? raw : raw?.results ?? raw?.data ?? []);
    } catch { setCategories([]); }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = { ordering: sortBy, page: currentPage };
      if (selectedCategory)      params.category  = selectedCategory;
      if (selectedBadge)         params.badge      = selectedBadge;
      if (searchQuery)           params.search     = searchQuery;
      if (priceRange[0] > 0)     params.min_price  = priceRange[0];
      if (priceRange[1] < 50000) params.max_price  = priceRange[1];

      const res  = await productsAPI.getAll(params);
      const raw  = res?.data ?? res;
      const list = Array.isArray(raw) ? raw : raw?.results ?? raw?.data ?? [];
      setProducts(list);
      setTotalCount(raw?.count ?? list.length);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  };

  const isInWishlist = (id) => wishlist?.some(i => i.id === id);

  const clearFilters = () => {
    setSelectedCategory(''); setSelectedBadge('');
    setPriceRange([0, 50000]); setSearchQuery('');
    setSortBy('-created_at'); setCurrentPage(1);
  };

  const hasActiveFilters = !!(selectedCategory || selectedBadge || searchQuery
    || priceRange[0] > 0 || priceRange[1] < 50000);

  const badges = [
    { value: '',         label: 'All'      },
    { value: 'new',      label: 'New'      },
    { value: 'sale',     label: 'Sale'     },
    { value: 'hot',      label: 'Hot'      },
    { value: 'featured', label: 'Featured' },
  ];

  const sortOptions = [
    { value: '-created_at', label: 'Newest'      },
    { value: 'price',       label: 'Price ↑'     },
    { value: '-price',      label: 'Price ↓'     },
    { value: '-rating',     label: 'Top Rated'   },
    { value: 'name',        label: 'A – Z'       },
  ];

  const totalPages = Math.ceil(totalCount / 20);

  const BADGE = {
    new:      { bg: '#0d1b2a', color: '#c9a96e' },
    featured: { bg: '#c9a96e', color: '#0d1b2a' },
    sale:     { bg: '#ef4444', color: '#fff'     },
    hot:      { bg: '#f97316', color: '#fff'     },
  };

  /* shared styles */
  const labelSt = {
    fontSize: '9px', fontWeight: 800, letterSpacing: '0.12em',
    textTransform: 'uppercase', color: '#c9a96e', display: 'block', marginBottom: '8px',
  };
  const inputSt = {
    width: '100%', padding: '9px 12px', borderRadius: '10px',
    border: '1.5px solid #ddd6cc', background: '#f7f4ef',
    fontSize: '13px', color: '#0d1b2a', outline: 'none',
    fontFamily: 'inherit', boxSizing: 'border-box',
  };

  /* ─── Filter panel shared between bottom-sheet and desktop sidebar ─── */
  const FilterContent = ({ onClose }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

      {/* Search */}
      <div>
        <label style={labelSt}>Search</label>
        <div style={{ position: 'relative' }}>
          <svg style={{ position:'absolute', left:'11px', top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}
            width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input placeholder="Search products…" value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            style={{ ...inputSt, paddingLeft: '34px' }}
            onFocus={e => e.target.style.borderColor='#c9a96e'}
            onBlur={e  => e.target.style.borderColor='#ddd6cc'} />
        </div>
      </div>

      {/* Category */}
      <div>
        <label style={labelSt}>Category</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {[{ id: '', name: 'All Categories' }, ...categories].map(cat => (
            <button key={cat.id}
              onClick={() => { setSelectedCategory(String(cat.id)); setCurrentPage(1); onClose?.(); }}
              style={{ textAlign:'left', padding:'8px 10px', borderRadius:'8px', border:'none',
                cursor:'pointer', fontSize:'13px', fontFamily:'inherit',
                background: selectedCategory === String(cat.id) ? 'rgba(201,169,110,0.14)' : 'transparent',
                color:      selectedCategory === String(cat.id) ? '#c9a96e' : '#555',
                fontWeight: selectedCategory === String(cat.id) ? 700 : 400 }}>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Badge */}
      <div>
        <label style={labelSt}>Filter By</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {badges.map(b => (
            <button key={b.value}
              onClick={() => { setSelectedBadge(b.value); setCurrentPage(1); }}
              style={{ padding:'7px 14px', borderRadius:'100px', border:'none', cursor:'pointer',
                fontSize:'12px', fontWeight:600, fontFamily:'inherit',
                background: selectedBadge === b.value ? '#0d1b2a' : '#f7f4ef',
                color:      selectedBadge === b.value ? '#c9a96e' : '#666' }}>
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <label style={labelSt}>Price Range</label>
        <div style={{ display:'flex', gap:'8px', alignItems:'center', marginBottom:'8px' }}>
          <input type="number" placeholder="Min" value={priceRange[0] || ''}
            onChange={e => setPriceRange([Number(e.target.value), priceRange[1]])}
            style={{ ...inputSt, flex:1 }}
            onFocus={e => e.target.style.borderColor='#c9a96e'}
            onBlur={e  => e.target.style.borderColor='#ddd6cc'} />
          <span style={{ color:'#bbb', fontSize:'11px', flexShrink:0 }}>–</span>
          <input type="number" placeholder="Max"
            value={priceRange[1] === 50000 ? '' : priceRange[1]}
            onChange={e => setPriceRange([priceRange[0], Number(e.target.value) || 50000])}
            style={{ ...inputSt, flex:1 }}
            onFocus={e => e.target.style.borderColor='#c9a96e'}
            onBlur={e  => e.target.style.borderColor='#ddd6cc'} />
        </div>
        <button onClick={() => { loadProducts(); onClose?.(); }}
          style={{ width:'100%', padding:'10px', borderRadius:'100px', background:'#0d1b2a',
            color:'#c9a96e', border:'none', cursor:'pointer', fontSize:'11px', fontWeight:800,
            letterSpacing:'0.08em', textTransform:'uppercase', fontFamily:'inherit' }}>
          Apply Price
        </button>
      </div>

      {hasActiveFilters && (
        <button onClick={() => { clearFilters(); onClose?.(); }}
          style={{ width:'100%', padding:'10px', borderRadius:'100px', background:'#fef2f2',
            color:'#ef4444', border:'1.5px solid #fecaca', cursor:'pointer', fontSize:'11px',
            fontWeight:800, letterSpacing:'0.06em', textTransform:'uppercase', fontFamily:'inherit' }}>
          ✕ Clear All Filters
        </button>
      )}
    </div>
  );

  /* ─── Product Card ─── */
  const ProductCard = ({ product }) => {
    const [hovered, setHovered]             = useState(false);
    const [addedFeedback, setAddedFeedback] = useState(false);

    const cfg = product.badge ? BADGE[product.badge] : null;
    const discountPct = product.original_price && parseFloat(product.original_price) > parseFloat(product.price)
      ? Math.round((1 - parseFloat(product.price) / parseFloat(product.original_price)) * 100)
      : null;
    const badgeLabel = product.badge === 'sale' && discountPct
      ? `-${discountPct}%` : product.badge;

    const handleCart = (e) => {
      e.stopPropagation();
      addToCart(product, 1, null);
      setAddedFeedback(true);
      setTimeout(() => setAddedFeedback(false), 1800);
    };

    if (viewMode === 'list') {
      return (
        <div onClick={() => navigate('product', product)}
          onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
          style={{ display:'flex', background:'#fff', borderRadius:'14px', overflow:'hidden',
            marginBottom:'10px', cursor:'pointer',
            border:`1.5px solid ${hovered ? '#c9a96e' : '#ede9e3'}`,
            boxShadow: hovered ? '0 6px 20px rgba(0,0,0,0.08)' : '0 1px 4px rgba(0,0,0,0.04)',
            transition:'border-color .2s, box-shadow .2s' }}>
          <div style={{ position:'relative', width:'100px', minWidth:'100px', background:'#f7f4ef', overflow:'hidden' }}>
            <img src={product.primary_image || 'placeholderImg(200,240)'} alt={product.name}
              onError={e => { e.target.src='placeholderImg(200,240)'; }}
              style={{ width:'100%', height:'100%', objectFit:'cover', display:'block',
                transform: hovered ? 'scale(1.05)' : 'scale(1)', transition:'transform .5s' }} />
            {cfg && badgeLabel && (
              <span style={{ position:'absolute', top:'8px', left:'8px', background:cfg.bg, color:cfg.color,
                fontSize:'8px', fontWeight:800, letterSpacing:'0.08em', textTransform:'uppercase',
                padding:'3px 7px', borderRadius:'100px' }}>{badgeLabel}</span>
            )}
          </div>
          <div style={{ flex:1, padding:'12px', display:'flex', flexDirection:'column',
            justifyContent:'space-between', minWidth:0 }}>
            <div>
              <p style={{ fontSize:'9px', fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase',
                color:'#c9a96e', margin:'0 0 3px' }}>{product.category_name}</p>
              <h3 style={{ fontSize:'13px', fontWeight:600, color:'#0d1b2a', margin:'0 0 6px',
                lineHeight:1.35, overflow:'hidden', display:'-webkit-box',
                WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{product.name}</h3>
            </div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
              gap:'8px', flexWrap:'wrap' }}>
              <div style={{ display:'flex', alignItems:'baseline', gap:'5px' }}>
                <span style={{ fontSize:'14px', fontWeight:700, color:'#0d1b2a', fontFamily:'Georgia,serif' }}>
                  Rs.{parseFloat(product.price).toLocaleString()}
                </span>
                {discountPct && (
                  <span style={{ fontSize:'10px', color:'#c0bab2', textDecoration:'line-through' }}>
                    Rs.{parseFloat(product.original_price).toLocaleString()}
                  </span>
                )}
              </div>
              <button onClick={handleCart}
                style={{ padding:'7px 14px', borderRadius:'100px', border:'none', cursor:'pointer',
                  background: addedFeedback ? '#059669' : '#0d1b2a',
                  color: addedFeedback ? '#fff' : '#c9a96e',
                  fontSize:'10px', fontWeight:800, letterSpacing:'0.06em', textTransform:'uppercase',
                  fontFamily:'inherit', transition:'background .2s', whiteSpace:'nowrap' }}>
                {addedFeedback ? '✓ Added' : '+ Cart'}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div onClick={() => navigate('product', product)}
        onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        style={{ background:'#fff', borderRadius:'14px', overflow:'hidden', cursor:'pointer',
          display:'flex', flexDirection:'column',
          border:`1.5px solid ${hovered ? '#c9a96e' : '#ede9e3'}`,
          transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
          boxShadow: hovered ? '0 10px 28px rgba(0,0,0,0.10)' : '0 1px 4px rgba(0,0,0,0.04)',
          transition:'transform .22s ease, box-shadow .22s ease, border-color .22s ease' }}>

        {/* image */}
        <div style={{ position:'relative', paddingTop:'128%', overflow:'hidden',
          background:'#f7f4ef', flexShrink:0 }}>
          <img src={product.primary_image || 'placeholderImg(300,380)'} alt={product.name}
            onError={e => { e.target.src='placeholderImg(300,380)'; }}
            style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover',
              transform: hovered ? 'scale(1.06)' : 'scale(1)',
              transition:'transform .6s cubic-bezier(.25,.46,.45,.94)' }} />

          {cfg && badgeLabel && (
            <span style={{ position:'absolute', top:'9px', left:'9px', background:cfg.bg, color:cfg.color,
              fontSize:'8px', fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase',
              padding:'3px 9px', borderRadius:'100px', zIndex:2 }}>{badgeLabel}</span>
          )}

          <button onClick={e => { e.stopPropagation(); toggleWishlist(product); }}
            style={{ position:'absolute', top:'8px', right:'8px', width:'30px', height:'30px',
              borderRadius:'50%', background:'rgba(255,255,255,0.95)',
              border:'1px solid rgba(0,0,0,0.06)',
              display:'flex', alignItems:'center', justifyContent:'center',
              cursor:'pointer', zIndex:2,
              opacity: hovered ? 1 : 0, transition:'opacity .2s',
              boxShadow:'0 2px 6px rgba(0,0,0,0.10)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24"
              fill={isInWishlist(product.id) ? '#ef4444' : 'none'}
              stroke={isInWishlist(product.id) ? '#ef4444' : '#374151'} strokeWidth="2.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>

          {/* desktop quick-add (hover only) */}
          <div style={{ position:'absolute', bottom:0, left:0, right:0, zIndex:2,
            transform: hovered ? 'translateY(0)' : 'translateY(100%)',
            transition:'transform .28s cubic-bezier(.25,.46,.45,.94)' }}>
            <button onClick={handleCart}
              style={{ width:'100%', padding:'10px 0', border:'none', cursor:'pointer',
                fontFamily:'inherit',
                background: addedFeedback ? 'rgba(5,150,105,0.95)' : 'rgba(13,27,42,0.94)',
                color: addedFeedback ? '#fff' : '#c9a96e',
                fontSize:'9px', fontWeight:800, letterSpacing:'0.14em', textTransform:'uppercase',
                transition:'background .2s' }}>
              {addedFeedback ? '✓ Added to Cart' : '+ Quick Add'}
            </button>
          </div>
        </div>

        {/* body */}
        <div style={{ padding:'10px 11px 12px', display:'flex', flexDirection:'column', flex:1 }}>
          <p style={{ fontSize:'8px', fontWeight:800, letterSpacing:'0.14em', textTransform:'uppercase',
            color:'#c9a96e', margin:'0 0 3px' }}>
            {product.category_name || 'Product'}
          </p>
          <h3 style={{ fontSize:'12px', fontWeight:500, color:'#0d1b2a', margin:'0 0 6px',
            lineHeight:1.35, flex:1, overflow:'hidden', display:'-webkit-box',
            WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
            {product.name}
          </h3>

          <div style={{ height:'1px', background:'#f0ece6', margin:'0 0 8px' }} />

          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
            gap:'4px', marginBottom:'9px' }}>
            <div style={{ display:'flex', alignItems:'baseline', gap:'4px', minWidth:0 }}>
              <span style={{ fontSize:'13px', fontWeight:700, color:'#0d1b2a',
                fontFamily:'Georgia,serif', whiteSpace:'nowrap' }}>
                Rs.{parseFloat(product.price).toLocaleString()}
              </span>
              {discountPct && (
                <span style={{ fontSize:'9px', color:'#c0bab2', textDecoration:'line-through', whiteSpace:'nowrap' }}>
                  Rs.{parseFloat(product.original_price).toLocaleString()}
                </span>
              )}
            </div>
            {discountPct && (
              <span style={{ fontSize:'8px', fontWeight:800, flexShrink:0,
                background:'#fef2f2', color:'#dc2626', padding:'2px 5px', borderRadius:'100px' }}>
                -{discountPct}%
              </span>
            )}
          </div>

          {/* Add to Cart — ALWAYS visible (critical for mobile) */}
          <button onClick={handleCart}
            style={{ width:'100%', padding:'8px 0', borderRadius:'100px', fontFamily:'inherit',
              background: addedFeedback ? '#059669' : '#fff',
              border:`1.5px solid ${addedFeedback ? '#059669' : '#d5d0c8'}`,
              color: addedFeedback ? '#fff' : '#0d1b2a',
              fontSize:'10px', fontWeight:800, letterSpacing:'0.07em', textTransform:'uppercase',
              cursor:'pointer', transition:'all .18s ease' }}
            onMouseEnter={e => { if (!addedFeedback) { Object.assign(e.currentTarget.style, { background:'#0d1b2a', color:'#c9a96e', borderColor:'#0d1b2a' }); }}}
            onMouseLeave={e => { if (!addedFeedback) { Object.assign(e.currentTarget.style, { background:'#fff', color:'#0d1b2a', borderColor:'#d5d0c8' }); }}}>
            {addedFeedback ? '✓ Added!' : 'Add to Cart'}
          </button>
        </div>
      </div>
    );
  };

  /* ─── Skeleton ─── */
  const SkeletonCard = () => (
    <div style={{ background:'#fff', borderRadius:'14px', overflow:'hidden', border:'1.5px solid #ede9e3' }}>
      <div style={{ paddingTop:'128%',
        backgroundImage:'linear-gradient(90deg,#f7f4ef 25%,#ede9e3 50%,#f7f4ef 75%)',
        backgroundSize:'200% 100%', animation:'shimmer 1.4s infinite' }} />
      <div style={{ padding:'10px 11px 12px' }}>
        <div style={{ height:'7px', width:'40px', background:'#f3ede3', borderRadius:'4px', marginBottom:'7px' }} />
        <div style={{ height:'11px', width:'90%', background:'#f3f4f6', borderRadius:'4px', marginBottom:'5px' }} />
        <div style={{ height:'11px', width:'60%', background:'#f3f4f6', borderRadius:'4px', marginBottom:'10px' }} />
        <div style={{ height:'30px', background:'#f3f4f6', borderRadius:'100px' }} />
      </div>
    </div>
  );

  /* ═══ RENDER ═══ */
  return (
    <div style={{ minHeight:'100vh', background:'#f8f5f0',
      fontFamily:'system-ui,-apple-system,sans-serif', paddingTop:'80px' }}>

      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
        @keyframes fadeIn  { from{opacity:0}                  to{opacity:1}               }

        /* Product grid: 2-col mobile, 3-col tablet, 4-col desktop */
        .shop-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        @media(min-width: 640px)  { .shop-grid { grid-template-columns: repeat(3,1fr); gap:13px; } }
        @media(min-width: 1024px) { .shop-grid { grid-template-columns: repeat(4,1fr); gap:16px; } }
        .list-grid { display:flex; flex-direction:column; }

        /* Desktop sidebar: hidden on mobile, shown md+ */
        .desk-sidebar { display:none; }
        @media(min-width:768px) {
          .desk-sidebar {
            display:block;
            width:220px; min-width:220px;
            position:sticky; top:110px;
            background:#fff;
            border-radius:16px;
            border:1.5px solid #ede9e3;
            padding:18px 15px;
            max-height:calc(100vh - 130px);
            overflow-y:auto;
            flex-shrink:0;
          }
          .desk-sidebar::-webkit-scrollbar{width:3px}
          .desk-sidebar::-webkit-scrollbar-thumb{background:#ddd6cc;border-radius:4px}
          /* hide mobile-only filter button on desktop */
          .mob-filter-btn { display:none !important; }
        }
      `}</style>

      {/* PAGE HEADER */}
      <div style={{ background:'#0d1b2a', padding:'28px 16px 24px' }}>
        <div style={{ maxWidth:'1200px', margin:'0 auto' }}>
          <p style={{ fontSize:'10px', fontWeight:800, letterSpacing:'0.14em',
            textTransform:'uppercase', color:'#c9a96e', margin:'0 0 5px' }}>Discover</p>
          <h1 style={{ fontSize:'clamp(1.6rem,5vw,2.6rem)', fontWeight:700, color:'#fff',
            fontFamily:'Georgia,serif', letterSpacing:'-0.02em', margin:'0 0 4px', lineHeight:1 }}>
            Our Collection
          </h1>
          <p style={{ color:'rgba(255,255,255,0.35)', fontSize:'12px', margin:0 }}>
            {totalCount} products
          </p>
        </div>
      </div>

      {/* STICKY TOOLBAR */}
      <div style={{ background:'#fff', borderBottom:'1px solid #ede9e3', padding:'8px 12px',
        display:'flex', gap:'8px', alignItems:'center', position:'sticky', top:'80px', zIndex:30 }}>

        {/* Filter btn — mobile only */}
        <button className="mob-filter-btn" onClick={() => setFilterOpen(true)}
          style={{ display:'flex', alignItems:'center', gap:'5px', padding:'7px 13px',
            borderRadius:'100px', border:'none', cursor:'pointer', fontFamily:'inherit', flexShrink:0,
            background: hasActiveFilters ? '#0d1b2a' : '#f7f4ef',
            color:      hasActiveFilters ? '#c9a96e' : '#0d1b2a',
            fontSize:'11px', fontWeight:700, letterSpacing:'0.05em', textTransform:'uppercase' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="4" y1="6" x2="20" y2="6"/>
            <line x1="8" y1="12" x2="20" y2="12"/>
            <line x1="12" y1="18" x2="20" y2="18"/>
          </svg>
          {hasActiveFilters ? 'Filters ●' : 'Filters'}
        </button>

        {/* Sort */}
        <select value={sortBy} onChange={e => { setSortBy(e.target.value); setCurrentPage(1); }}
          style={{ flex:1, padding:'8px 10px', borderRadius:'100px', border:'1.5px solid #ddd6cc',
            background:'#f7f4ef', fontSize:'12px', color:'#0d1b2a', fontWeight:500,
            fontFamily:'inherit', outline:'none', cursor:'pointer', minWidth:0 }}>
          {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {/* View toggle */}
        <div style={{ display:'flex', border:'1.5px solid #ddd6cc', borderRadius:'10px',
          overflow:'hidden', flexShrink:0 }}>
          {['grid','list'].map(m => (
            <button key={m} onClick={() => setViewMode(m)}
              style={{ width:'32px', height:'32px', border:'none', cursor:'pointer',
                background: viewMode===m ? '#0d1b2a' : '#f7f4ef',
                color:      viewMode===m ? '#c9a96e' : '#888',
                display:'flex', alignItems:'center', justifyContent:'center',
                transition:'background .15s' }}>
              {m === 'grid'
                ? <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M1 2.5A1.5 1.5 0 012.5 1h3A1.5 1.5 0 017 2.5v3A1.5 1.5 0 015.5 7h-3A1.5 1.5 0 011 5.5v-3zm8 0A1.5 1.5 0 0110.5 1h3A1.5 1.5 0 0115 2.5v3A1.5 1.5 0 0113.5 7h-3A1.5 1.5 0 019 5.5v-3zm-8 8A1.5 1.5 0 012.5 9h3A1.5 1.5 0 017 10.5v3A1.5 1.5 0 015.5 15h-3A1.5 1.5 0 011 13.5v-3zm8 0A1.5 1.5 0 0110.5 9h3a1.5 1.5 0 011.5 1.5v3a1.5 1.5 0 01-1.5 1.5h-3A1.5 1.5 0 019 13.5v-3z"/>
                  </svg>
                : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="8" y1="6" x2="21" y2="6"/>
                    <line x1="8" y1="12" x2="21" y2="12"/>
                    <line x1="8" y1="18" x2="21" y2="18"/>
                    <circle cx="3" cy="6" r="1.2" fill="currentColor"/>
                    <circle cx="3" cy="12" r="1.2" fill="currentColor"/>
                    <circle cx="3" cy="18" r="1.2" fill="currentColor"/>
                  </svg>}
            </button>
          ))}
        </div>
      </div>

      {/* BODY */}
      <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'14px 12px 56px',
        display:'flex', gap:'18px', alignItems:'flex-start' }}>

        {/* Desktop sidebar */}
        <div className="desk-sidebar">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
            <h3 style={{ fontSize:'15px', fontWeight:700, color:'#0d1b2a', margin:0,
              fontFamily:'Georgia,serif' }}>Filters</h3>
            {hasActiveFilters && (
              <button onClick={clearFilters}
                style={{ fontSize:'11px', color:'#ef4444', fontWeight:700,
                  background:'none', border:'none', cursor:'pointer', fontFamily:'inherit' }}>
                Clear
              </button>
            )}
          </div>
          <FilterContent />
        </div>

        {/* Products */}
        <div style={{ flex:1, minWidth:0 }}>

          {hasActiveFilters && (
            <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'10px' }}>
              {selectedCategory && (
                <FilterChip
                  label={categories.find(c => String(c.id)===selectedCategory)?.name}
                  onRemove={() => setSelectedCategory('')} />
              )}
              {selectedBadge  && <FilterChip label={selectedBadge}         onRemove={() => setSelectedBadge('')} />}
              {searchQuery    && <FilterChip label={`"${searchQuery}"`}    onRemove={() => setSearchQuery('')}   />}
            </div>
          )}

          <p style={{ fontSize:'12px', color:'#aaa', marginBottom:'12px', fontWeight:500 }}>
            <span style={{ color:'#0d1b2a', fontWeight:700 }}>{totalCount}</span> products found
          </p>

          {loading ? (
            <div className="shop-grid">
              {[...Array(8)].map((_,i) => <SkeletonCard key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign:'center', padding:'52px 16px', background:'#fff',
              borderRadius:'20px', border:'1.5px solid #ede9e3' }}>
              <div style={{ fontSize:'44px', marginBottom:'12px' }}>🔍</div>
              <h3 style={{ fontSize:'18px', fontWeight:700, color:'#0d1b2a',
                fontFamily:'Georgia,serif', margin:'0 0 7px' }}>No products found</h3>
              <p style={{ color:'#aaa', fontSize:'13px', margin:'0 0 18px' }}>
                Try adjusting your filters
              </p>
              <button onClick={clearFilters}
                style={{ padding:'10px 24px', borderRadius:'100px', background:'#0d1b2a',
                  color:'#c9a96e', border:'none', cursor:'pointer', fontSize:'11px',
                  fontWeight:800, letterSpacing:'0.08em', textTransform:'uppercase',
                  fontFamily:'inherit' }}>
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className={viewMode==='grid' ? 'shop-grid' : 'list-grid'}>
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>

              {totalPages > 1 && (
                <div style={{ display:'flex', justifyContent:'center', gap:'6px',
                  marginTop:'28px', flexWrap:'wrap', alignItems:'center' }}>
                  <PagBtn label="← Prev" disabled={currentPage===1}
                    onClick={() => setCurrentPage(p => Math.max(1,p-1))} />
                  {[...Array(Math.min(totalPages,7))].map((_,i) => (
                    <button key={i} onClick={() => setCurrentPage(i+1)}
                      style={{ width:'36px', height:'36px', borderRadius:'50%', cursor:'pointer',
                        border:`1.5px solid ${currentPage===i+1 ? '#c9a96e' : '#ddd6cc'}`,
                        background: currentPage===i+1 ? '#c9a96e' : '#fff',
                        color:'#0d1b2a', fontSize:'12px', fontFamily:'inherit',
                        fontWeight: currentPage===i+1 ? 800 : 500, transition:'all .15s' }}>
                      {i+1}
                    </button>
                  ))}
                  <PagBtn label="Next →" disabled={currentPage===totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages,p+1))} />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ══ MOBILE FILTER BOTTOM SHEET ══ */}
      {filterOpen && (
        <>
          <div onClick={() => setFilterOpen(false)}
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)',
              zIndex:98, animation:'fadeIn .2s ease' }} />
          <div style={{ position:'fixed', left:0, right:0, bottom:0, zIndex:99,
            background:'#fff', borderRadius:'20px 20px 0 0',
            padding:'0 16px 40px', maxHeight:'85vh', overflowY:'auto',
            animation:'slideUp .3s cubic-bezier(.25,.46,.45,.94)',
            boxShadow:'0 -8px 40px rgba(0,0,0,0.18)' }}>

            {/* drag handle */}
            <div style={{ display:'flex', justifyContent:'center', padding:'12px 0 6px' }}>
              <div style={{ width:'36px', height:'4px', borderRadius:'100px', background:'#ddd6cc' }} />
            </div>

            {/* header */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
              padding:'6px 0 14px', borderBottom:'1px solid #f0ece6', marginBottom:'18px' }}>
              <h3 style={{ fontSize:'17px', fontWeight:700, color:'#0d1b2a', margin:0,
                fontFamily:'Georgia,serif' }}>Filters</h3>
              <button onClick={() => setFilterOpen(false)}
                style={{ width:'32px', height:'32px', borderRadius:'50%', background:'#f7f4ef',
                  border:'none', cursor:'pointer', fontSize:'18px', color:'#888',
                  display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
            </div>

            <FilterContent onClose={() => setFilterOpen(false)} />
          </div>
        </>
      )}
    </div>
  );
}

/* ─── tiny shared components ─── */
const FilterChip = ({ label, onRemove }) => (
  <span style={{ display:'inline-flex', alignItems:'center', gap:'4px',
    background:'rgba(201,169,110,0.12)', color:'#c9a96e',
    fontSize:'11px', fontWeight:700, padding:'4px 10px', borderRadius:'100px' }}>
    {label}
    <button onClick={onRemove}
      style={{ background:'none', border:'none', cursor:'pointer', color:'inherit',
        fontSize:'14px', lineHeight:1, padding:0 }}>×</button>
  </span>
);

const PagBtn = ({ label, disabled, onClick }) => (
  <button disabled={disabled} onClick={onClick}
    style={{ padding:'8px 14px', borderRadius:'100px', border:'1.5px solid #ddd6cc',
      background:'#fff', color: disabled ? '#ccc' : '#0d1b2a',
      fontSize:'12px', fontWeight:700, cursor: disabled ? 'not-allowed' : 'pointer',
      fontFamily:'inherit' }}>
    {label}
  </button>
);