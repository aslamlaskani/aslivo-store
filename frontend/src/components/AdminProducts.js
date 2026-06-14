import React, { useState, useEffect } from 'react';
import { productsAPI } from '../api';

const BASE_URL = 'http://127.0.0.1:8000';

const getImageUrl = (url) => {
  if (!url) return 'https://via.placeholder.com/300x400?text=No+Image';
  if (url.startsWith('http')) return url;
  return `${BASE_URL}${url}`;
};

const BADGE_CFG = {
  new:      { bg:'rgba(34,197,94,0.15)',   color:'#4ade80', border:'rgba(34,197,94,0.3)'   },
  sale:     { bg:'rgba(239,68,68,0.15)',   color:'#f87171', border:'rgba(239,68,68,0.3)'   },
  hot:      { bg:'rgba(249,115,22,0.15)',  color:'#fb923c', border:'rgba(249,115,22,0.3)'  },
  featured: { bg:'rgba(201,169,110,0.15)', color:'#c9a96e', border:'rgba(201,169,110,0.3)' },
};

const SIZE_OPTIONS  = ['XS','S','M','L','XL','XXL','3XL','28','30','32','34','36','38','40'];
const COLOR_OPTIONS = ['Black','White','Navy','Grey','Red','Blue','Green','Yellow','Pink','Brown','Beige','Orange'];
const BADGE_OPTIONS = [
  { value:'',         label:'None'     },
  { value:'new',      label:'New'      },
  { value:'sale',     label:'Sale'     },
  { value:'hot',      label:'Hot'      },
  { value:'featured', label:'Featured' },
];

const EMPTY_FORM = {
  name:'', description:'', price:'', original_price:'',
  category:'', badge:'', stock:'', is_active:true,
  is_featured:false, is_new_arrival:false, sizes:[], colors:[],
};

/* ── Custom dark dropdown — replaces native <select> ── */
function CustomSelect({ value, onChange, options, placeholder = 'Select…' }) {
  const [open, setOpen] = useState(false);
  const ref = React.useRef(null);

  /* close on outside click */
  React.useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find(o => String(o.value) === String(value));

  return (
    <div ref={ref} style={{ position:'relative', userSelect:'none' }}>
      {/* Trigger */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          width:'100%', background:'rgba(255,255,255,0.05)',
          border:`1px solid ${open ? 'rgba(201,169,110,0.5)' : 'rgba(255,255,255,0.1)'}`,
          borderRadius:'10px', padding:'10px 36px 10px 14px',
          color: selected?.value !== '' && selected ? '#fff' : 'rgba(255,255,255,0.3)',
          fontSize:'13px', cursor:'pointer', boxSizing:'border-box',
          transition:'border-color .15s', position:'relative',
          display:'flex', alignItems:'center',
        }}
      >
        <span style={{ flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {selected ? selected.label : placeholder}
        </span>
        {/* Chevron */}
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="rgba(255,255,255,0.35)" strokeWidth="2.5"
          style={{ position:'absolute', right:'12px', top:'50%', transform:`translateY(-50%) rotate(${open?'180deg':'0deg'})`, transition:'transform .2s', flexShrink:0 }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>

      {/* Dropdown list */}
      {open && (
        <div style={{
          position:'absolute', top:'calc(100% + 4px)', left:0, right:0, zIndex:9999,
          background:'#161825', border:'1px solid rgba(255,255,255,0.1)',
          borderRadius:'10px', overflow:'hidden',
          boxShadow:'0 12px 32px rgba(0,0,0,0.5)',
          maxHeight:'220px', overflowY:'auto',
        }}>
          {options.map(opt => {
            const isActive = String(opt.value) === String(value);
            return (
              <div
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                style={{
                  padding:'10px 14px', cursor:'pointer', fontSize:'13px',
                  color: isActive ? '#c9a96e' : 'rgba(255,255,255,0.7)',
                  background: isActive ? 'rgba(201,169,110,0.1)' : 'transparent',
                  transition:'background .12s',
                  borderBottom:'1px solid rgba(255,255,255,0.04)',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background='rgba(255,255,255,0.06)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background='transparent'; }}
              >
                {isActive && <span style={{ marginRight:'8px', fontSize:'10px' }}>●</span>}
                {opt.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminProducts() {
  const [products, setProducts]           = useState([]);
  const [categories, setCategories]       = useState([]);
  const [loading, setLoading]             = useState(true);
  const [showForm, setShowForm]           = useState(false);
  const [editProduct, setEditProduct]     = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchQuery, setSearchQuery]     = useState('');
  const [formLoading, setFormLoading]     = useState(false);
  const [formSuccess, setFormSuccess]     = useState('');
  const [formError, setFormError]         = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreview, setImagePreview]   = useState([]);
  const [form, setForm]                   = useState(EMPTY_FORM);

  /* ── category manager state ── */
  const [showCatManager, setShowCatManager]     = useState(false);
  const [newCatName, setNewCatName]             = useState('');
  const [catLoading, setCatLoading]             = useState(false);
  const [catError, setCatError]                 = useState('');
  const [deleteCatConfirm, setDeleteCatConfirm] = useState(null);
  const [editCat, setEditCat]                   = useState(null);
  const [editCatName, setEditCatName]           = useState('');

  useEffect(() => { loadProducts(); loadCategories(); }, []);

  /* ── category CRUD ── */
  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    setCatLoading(true); setCatError('');
    try {
      await productsAPI.createCategory({ name: newCatName.trim() });
      setNewCatName('');
      await loadCategories();
    } catch (err) {
      setCatError(err?.response?.data?.name?.[0] || 'Failed to add category');
    } finally { setCatLoading(false); }
  };

  const handleUpdateCategory = async (id) => {
    if (!editCatName.trim()) return;
    setCatLoading(true); setCatError('');
    try {
      await productsAPI.updateCategory(id, { name: editCatName.trim() });
      setEditCat(null); setEditCatName('');
      await loadCategories();
    } catch (err) {
      setCatError(err?.response?.data?.name?.[0] || 'Failed to update category');
    } finally { setCatLoading(false); }
  };

  const handleDeleteCategory = async (cat) => {
    setCatLoading(true);
    try {
      await productsAPI.deleteCategory(cat.id);
      setDeleteCatConfirm(null);
      await loadCategories();
    } catch (err) {
      setCatError('Cannot delete — category may have products');
      setDeleteCatConfirm(null);
    } finally { setCatLoading(false); }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await productsAPI.getAll({ ordering:'-created_at', page_size:100 });
      const raw = res?.data ?? res;
      setProducts(Array.isArray(raw) ? raw : raw?.results ?? raw?.data ?? []);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  };

  const loadCategories = async () => {
    try {
      const res = await productsAPI.getCategories();
      const raw = res?.data ?? res;
      setCategories(Array.isArray(raw) ? raw : raw?.results ?? raw?.data ?? []);
    } catch { setCategories([]); }
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setSelectedImages([]); setImagePreview([]);
    setFormError(''); setFormSuccess(''); setEditProduct(null);
  };

  const handleOpenForm = (product = null) => {
    if (product) {
      setEditProduct(product);
      setForm({
        name:           product.name        || '',
        description:    product.description || '',
        price:          product.price       || '',
        original_price: product.original_price || '',
        category:       product.category?.id || product.category || '',
        badge:          product.badge       || '',
        stock:          product.stock       || '',
        is_active:      product.is_active   !== false,
        is_featured:    product.is_featured || false,
        is_new_arrival: product.is_new_arrival || false,
        sizes:  product.variants?.filter(v=>v.size).map(v=>v.size)   || [],
        colors: product.variants?.filter(v=>v.color).map(v=>v.color) || [],
      });
    } else {
      resetForm();
    }
    setShowForm(true);
    window.scrollTo({ top:0, behavior:'smooth' });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(files);
    setImagePreview(files.map(f => URL.createObjectURL(f)));
  };

  const toggleSize  = (s) => setForm(p => ({ ...p, sizes:  p.sizes.includes(s)  ? p.sizes.filter(x=>x!==s)  : [...p.sizes,s]  }));
  const toggleColor = (c) => setForm(p => ({ ...p, colors: p.colors.includes(c) ? p.colors.filter(x=>x!==c) : [...p.colors,c] }));

  const handleSubmit = async () => {
    if (!form.name || !form.price || !form.stock) { setFormError('Name, price and stock are required'); return; }
    if (formLoading) return;
    setFormLoading(true); setFormError(''); setFormSuccess('');
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description || '');
      fd.append('price', form.price);
      if (form.original_price) fd.append('original_price', form.original_price);
      if (form.category) fd.append('category', form.category);
      fd.append('badge', form.badge || '');
      fd.append('stock', form.stock);
      fd.append('is_active',      form.is_active      ? 'True' : 'False');
      fd.append('is_featured',    form.is_featured    ? 'True' : 'False');
      fd.append('is_new_arrival', form.is_new_arrival ? 'True' : 'False');
      form.sizes.forEach(s  => { if (s) fd.append('sizes',  s); });
      form.colors.forEach(c => { if (c) fd.append('colors', c); });
      selectedImages.forEach(img => fd.append('images', img));

      if (editProduct) { await productsAPI.update(editProduct.id, fd); setFormSuccess('Product updated!'); }
      else             { await productsAPI.create(fd); setFormSuccess('Product created!'); }

      await loadProducts();
      setTimeout(() => { setShowForm(false); resetForm(); }, 1400);
    } catch (err) {
      const d = err?.response?.data;
      setFormError(d?.name?.[0] || d?.price?.[0] || d?.detail || 'Failed to save. Try again.');
    } finally { setFormLoading(false); }
  };

  const handleDelete = async (product) => {
    try { await productsAPI.delete(product.id); setDeleteConfirm(null); await loadProducts(); }
    catch (err) { console.error(err); }
  };

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* ── shared input style ── */
  const inp = {
    width:'100%', background:'rgba(255,255,255,0.05)',
    border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px',
    padding:'10px 14px', color:'#fff', fontSize:'13px',
    outline:'none', fontFamily:'inherit', boxSizing:'border-box',
    transition:'border-color .15s',
  };
  const lbl = {
    fontSize:'9px', fontWeight:800, letterSpacing:'0.12em',
    textTransform:'uppercase', color:'rgba(255,255,255,0.35)',
    display:'block', marginBottom:'7px',
  };
  const sec = {
    fontSize:'9px', fontWeight:800, letterSpacing:'0.12em',
    textTransform:'uppercase', color:'rgba(255,255,255,0.22)',
    marginBottom:'14px',
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'18px', fontFamily:'system-ui,-apple-system,sans-serif' }}>

      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .prod-admin-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        @media(min-width:640px)  { .prod-admin-grid { grid-template-columns:repeat(3,1fr); gap:13px; } }
        @media(min-width:1024px) { .prod-admin-grid { grid-template-columns:repeat(4,1fr); gap:16px; } }
        .form-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        @media(min-width:640px) { .form-grid { grid-template-columns:1fr 1fr; } }
        .img-preview-grid {
          display: grid;
          grid-template-columns: repeat(4,1fr);
          gap: 8px;
          margin-top: 12px;
        }
        @media(min-width:480px) { .img-preview-grid { grid-template-columns:repeat(6,1fr); } }
        .prod-card:hover { border-color:rgba(201,169,110,0.3) !important; background:rgba(255,255,255,0.05) !important; }
        .prod-card:hover .card-overlay { opacity:1 !important; }
        .prod-card:hover .prod-img { transform:scale(1.05); }
        .prod-img { transition:transform .5s cubic-bezier(.25,.46,.45,.94); }
        .adm-inp:focus { border-color:rgba(201,169,110,0.5) !important; }
        .toggle-btn:hover { border-color:rgba(255,255,255,0.25) !important; color:rgba(255,255,255,0.65) !important; }
        .size-btn:hover   { border-color:rgba(255,255,255,0.2) !important; }
        .del-btn:hover    { background:rgba(239,68,68,0.08) !important; color:#f87171 !important; }
        .edit-btn:hover   { background:rgba(201,169,110,0.12) !important; color:#c9a96e !important; }
      `}</style>

      {/* ════ DELETE MODAL ════ */}
      {deleteConfirm && (
        <div style={{ position:'fixed', inset:0, zIndex:999, background:'rgba(0,0,0,0.75)',
          backdropFilter:'blur(8px)', display:'flex', alignItems:'center',
          justifyContent:'center', padding:'16px' }}>
          <div style={{ background:'#12141f', border:'1px solid rgba(255,255,255,0.1)',
            borderRadius:'20px', padding:'32px 24px', maxWidth:'340px', width:'100%',
            textAlign:'center', animation:'fadeUp .3s ease' }}>
            <div style={{ fontSize:'40px', marginBottom:'14px' }}>🗑️</div>
            <h3 style={{ fontSize:'18px', fontWeight:700, color:'#fff',
              fontFamily:'Georgia,serif', margin:'0 0 8px' }}>Delete Product?</h3>
            <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.35)', margin:'0 0 22px', lineHeight:1.6 }}>
              "<strong style={{ color:'rgba(255,255,255,0.65)' }}>{deleteConfirm.name}</strong>" will be removed from the store.
            </p>
            <div style={{ display:'flex', gap:'10px', justifyContent:'center' }}>
              <button onClick={() => setDeleteConfirm(null)}
                style={{ padding:'9px 20px', borderRadius:'10px', cursor:'pointer',
                  background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
                  color:'rgba(255,255,255,0.5)', fontSize:'13px', fontFamily:'inherit' }}>
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm)}
                style={{ padding:'9px 20px', borderRadius:'10px', cursor:'pointer',
                  background:'#ef4444', border:'none', color:'#fff',
                  fontSize:'13px', fontWeight:700, fontFamily:'inherit' }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════ HEADER ════ */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
        flexWrap:'wrap', gap:'12px' }}>
        <div>
          <h2 style={{ fontSize:'clamp(1.2rem,3vw,1.6rem)', fontWeight:700, color:'#fff',
            fontFamily:'Georgia,serif', margin:'0 0 3px' }}>Products</h2>
          <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.28)', margin:0 }}>
            {products.length} total products
          </p>
        </div>
        <button onClick={() => handleOpenForm()}
          style={{ padding:'10px 20px', borderRadius:'100px', border:'none', cursor:'pointer',
            background:'linear-gradient(135deg,#c9a96e,#b8935a)', color:'#0d1b2a',
            fontSize:'11px', fontWeight:800, letterSpacing:'0.09em',
            textTransform:'uppercase', fontFamily:'inherit', transition:'opacity .15s' }}
          onMouseEnter={e=>e.currentTarget.style.opacity='.88'}
          onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
          + Add Product
        </button>
      </div>

      {/* ════ CATEGORY MANAGER ════ */}
      <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)',
        borderRadius:'14px', overflow:'hidden' }}>

        {/* Toggle header */}
        <button
          onClick={() => setShowCatManager(o => !o)}
          style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'13px 16px', background:'transparent', border:'none', cursor:'pointer',
            fontFamily:'inherit' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <span style={{ fontSize:'16px' }}>🏷️</span>
            <span style={{ fontSize:'14px', fontWeight:700, color:'rgba(255,255,255,0.75)' }}>
              Manage Categories
            </span>
            <span style={{ background:'rgba(201,169,110,0.15)', color:'#c9a96e',
              fontSize:'10px', fontWeight:800, padding:'2px 8px', borderRadius:'100px' }}>
              {categories.length}
            </span>
          </div>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="rgba(255,255,255,0.3)" strokeWidth="2.5"
            style={{ transition:'transform .2s', transform: showCatManager?'rotate(180deg)':'rotate(0deg)' }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        {showCatManager && (
          <div style={{ borderTop:'1px solid rgba(255,255,255,0.05)', padding:'16px' }}>

            {catError && (
              <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)',
                borderRadius:'8px', padding:'8px 12px', fontSize:'12px', color:'#f87171',
                marginBottom:'12px' }}>⚠️ {catError}</div>
            )}

            {/* Delete category confirm */}
            {deleteCatConfirm && (
              <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)',
                borderRadius:'10px', padding:'12px 14px', marginBottom:'12px',
                display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'8px' }}>
                <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.65)', margin:0 }}>
                  Delete <strong style={{ color:'#f87171' }}>"{deleteCatConfirm.name}"</strong>?
                </p>
                <div style={{ display:'flex', gap:'8px' }}>
                  <button onClick={() => setDeleteCatConfirm(null)}
                    style={{ padding:'5px 12px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.1)',
                      background:'transparent', color:'rgba(255,255,255,0.4)', fontSize:'11px',
                      cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
                  <button onClick={() => handleDeleteCategory(deleteCatConfirm)}
                    style={{ padding:'5px 12px', borderRadius:'8px', border:'none',
                      background:'#ef4444', color:'#fff', fontSize:'11px', fontWeight:700,
                      cursor:'pointer', fontFamily:'inherit' }}>Delete</button>
                </div>
              </div>
            )}

            {/* Add new category */}
            <div style={{ display:'flex', gap:'8px', marginBottom:'14px' }}>
              <input
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                onKeyDown={e => e.key==='Enter' && handleAddCategory()}
                placeholder="New category name…"
                style={{ flex:1, background:'rgba(255,255,255,0.05)',
                  border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px',
                  padding:'9px 13px', color:'#fff', fontSize:'13px',
                  outline:'none', fontFamily:'inherit' }}
                onFocus={e => e.target.style.borderColor='rgba(201,169,110,0.5)'}
                onBlur={e  => e.target.style.borderColor='rgba(255,255,255,0.1)'}
              />
              <button onClick={handleAddCategory} disabled={catLoading || !newCatName.trim()}
                style={{ padding:'9px 18px', borderRadius:'10px', border:'none', cursor:'pointer',
                  background: !newCatName.trim() ? 'rgba(201,169,110,0.3)' : '#c9a96e',
                  color:'#0d1b2a', fontSize:'12px', fontWeight:800, fontFamily:'inherit',
                  whiteSpace:'nowrap', transition:'opacity .15s',
                  opacity: catLoading ? .6 : 1 }}>
                {catLoading ? '…' : '+ Add'}
              </button>
            </div>

            {/* Category list */}
            {categories.length === 0 ? (
              <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.25)', textAlign:'center', padding:'16px 0' }}>
                No categories yet. Add one above.
              </p>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                {categories.map(cat => (
                  <div key={cat.id}
                    style={{ display:'flex', alignItems:'center', gap:'10px',
                      background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)',
                      borderRadius:'10px', padding:'9px 12px' }}>

                    {editCat?.id === cat.id ? (
                      /* Edit mode */
                      <>
                        <input
                          value={editCatName}
                          onChange={e => setEditCatName(e.target.value)}
                          onKeyDown={e => { if(e.key==='Enter') handleUpdateCategory(cat.id); if(e.key==='Escape') { setEditCat(null); setEditCatName(''); } }}
                          autoFocus
                          style={{ flex:1, background:'rgba(255,255,255,0.06)',
                            border:'1px solid rgba(201,169,110,0.4)', borderRadius:'7px',
                            padding:'5px 10px', color:'#fff', fontSize:'13px',
                            outline:'none', fontFamily:'inherit' }}
                        />
                        <button onClick={() => handleUpdateCategory(cat.id)}
                          style={{ padding:'5px 12px', borderRadius:'7px', border:'none',
                            background:'#c9a96e', color:'#0d1b2a', fontSize:'11px',
                            fontWeight:800, cursor:'pointer', fontFamily:'inherit' }}>Save</button>
                        <button onClick={() => { setEditCat(null); setEditCatName(''); }}
                          style={{ padding:'5px 10px', borderRadius:'7px',
                            border:'1px solid rgba(255,255,255,0.1)', background:'transparent',
                            color:'rgba(255,255,255,0.4)', fontSize:'11px', cursor:'pointer', fontFamily:'inherit' }}>✕</button>
                      </>
                    ) : (
                      /* View mode */
                      <>
                        <span style={{ fontSize:'14px' }}>🏷️</span>
                        <span style={{ flex:1, fontSize:'13px', fontWeight:500,
                          color:'rgba(255,255,255,0.75)' }}>{cat.name}</span>
                        <span style={{ fontSize:'10px', color:'rgba(255,255,255,0.25)',
                          marginRight:'4px' }}>
                          {products.filter(p => String(p.category) === String(cat.id) ||
                            p.category_name?.toLowerCase() === cat.name?.toLowerCase()).length} products
                        </span>
                        <button
                          onClick={() => { setEditCat(cat); setEditCatName(cat.name); }}
                          style={{ padding:'4px 10px', borderRadius:'7px',
                            background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)',
                            color:'rgba(255,255,255,0.45)', fontSize:'11px', cursor:'pointer',
                            fontFamily:'inherit', transition:'all .15s' }}
                          onMouseEnter={e=>{ e.currentTarget.style.background='rgba(201,169,110,0.1)'; e.currentTarget.style.color='#c9a96e'; }}
                          onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.color='rgba(255,255,255,0.45)'; }}>
                          Edit
                        </button>
                        <button
                          onClick={() => { setCatError(''); setDeleteCatConfirm(cat); }}
                          style={{ padding:'4px 10px', borderRadius:'7px',
                            background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)',
                            color:'rgba(239,68,68,0.5)', fontSize:'11px', cursor:'pointer',
                            fontFamily:'inherit', transition:'all .15s' }}
                          onMouseEnter={e=>{ e.currentTarget.style.background='rgba(239,68,68,0.1)'; e.currentTarget.style.color='#f87171'; }}
                          onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.color='rgba(239,68,68,0.5)'; }}>
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ════ PRODUCT FORM ════ */}
      {showForm && (
        <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)',
          borderRadius:'18px', overflow:'hidden', animation:'fadeUp .35s ease' }}>

          {/* Form header */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
            padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ fontSize:'17px', fontWeight:700, color:'#fff',
              fontFamily:'Georgia,serif', margin:0 }}>
              {editProduct ? '✏️ Edit Product' : '➕ Add New Product'}
            </h3>
            <button onClick={() => { setShowForm(false); resetForm(); }}
              style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)',
                borderRadius:'8px', width:'30px', height:'30px', cursor:'pointer',
                color:'rgba(255,255,255,0.4)', fontSize:'16px',
                display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
          </div>

          <div style={{ padding:'20px', display:'flex', flexDirection:'column', gap:'22px' }}>

            {/* Alerts */}
            {formSuccess && (
              <div style={{ background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.25)',
                borderRadius:'10px', padding:'10px 14px', fontSize:'13px', color:'#4ade80',
                display:'flex', alignItems:'center', gap:'8px' }}>
                ✅ {formSuccess}
              </div>
            )}
            {formError && (
              <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)',
                borderRadius:'10px', padding:'10px 14px', fontSize:'13px', color:'#f87171',
                display:'flex', alignItems:'center', gap:'8px' }}>
                ⚠️ {formError}
              </div>
            )}

            {/* Basic info */}
            <div>
              <p style={sec}>Basic Info</p>
              <div style={{ marginBottom:'12px' }}>
                <label style={lbl}>Product Name *</label>
                <input className="adm-inp" style={inp} placeholder="e.g. Premium Cotton T-Shirt"
                  value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} />
              </div>
              <div style={{ marginBottom:'12px' }}>
                <label style={lbl}>Description</label>
                <textarea className="adm-inp" style={{ ...inp, resize:'none' }} rows={3}
                  placeholder="Product description…"
                  value={form.description} onChange={e => setForm(p=>({...p,description:e.target.value}))} />
              </div>
              <div className="form-grid">
                <div>
                  <label style={lbl}>Price (Rs.) *</label>
                  <input className="adm-inp" style={inp} type="number" placeholder="1999"
                    value={form.price} onChange={e => setForm(p=>({...p,price:e.target.value}))} />
                </div>
                <div>
                  <label style={lbl}>Original Price (Rs.)</label>
                  <input className="adm-inp" style={inp} type="number" placeholder="2499"
                    value={form.original_price} onChange={e => setForm(p=>({...p,original_price:e.target.value}))} />
                </div>
                <div>
                  <label style={lbl}>Stock *</label>
                  <input className="adm-inp" style={inp} type="number" placeholder="50"
                    value={form.stock} onChange={e => setForm(p=>({...p,stock:e.target.value}))} />
                </div>
                <div>
                  <label style={lbl}>Category</label>
                  <CustomSelect
                    value={form.category}
                    onChange={val => setForm(p=>({...p,category:val}))}
                    placeholder="Select Category"
                    options={[{value:'',label:'Select Category'}, ...categories.map(c=>({value:String(c.id),label:c.name}))]}
                  />
                </div>
                <div>
                  <label style={lbl}>Badge</label>
                  <CustomSelect
                    value={form.badge}
                    onChange={val => setForm(p=>({...p,badge:val}))}
                    placeholder="Select Badge"
                    options={BADGE_OPTIONS}
                  />
                </div>
              </div>
            </div>

            {/* Settings toggles */}
            <div>
              <p style={sec}>Settings</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                {[
                  { key:'is_active',      label:'✅ Active'       },
                  { key:'is_featured',    label:'⭐ Featured'     },
                  { key:'is_new_arrival', label:'✨ New Arrival'  },
                ].map(t => (
                  <button key={t.key} onClick={() => setForm(p=>({...p,[t.key]:!p[t.key]}))}
                    style={{ padding:'7px 14px', borderRadius:'100px', cursor:'pointer',
                      fontFamily:'inherit', fontSize:'12px', fontWeight:700, transition:'all .15s',
                      background: form[t.key] ? 'rgba(201,169,110,0.15)' : 'rgba(255,255,255,0.04)',
                      color:      form[t.key] ? '#c9a96e'                 : 'rgba(255,255,255,0.38)',
                      border: form[t.key]
                        ? '1px solid rgba(201,169,110,0.4)'
                        : '1px solid rgba(255,255,255,0.09)' }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div>
              <p style={sec}>Sizes</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                {SIZE_OPTIONS.map(size => (
                  <button key={size} onClick={() => toggleSize(size)} className="size-btn"
                    style={{ width:'42px', height:'38px', borderRadius:'8px', cursor:'pointer',
                      fontFamily:'inherit', fontSize:'11px', fontWeight:700, transition:'all .15s',
                      background: form.sizes.includes(size) ? 'rgba(201,169,110,0.15)' : 'rgba(255,255,255,0.04)',
                      color:      form.sizes.includes(size) ? '#c9a96e'                : 'rgba(255,255,255,0.38)',
                      border: form.sizes.includes(size)
                        ? '1px solid rgba(201,169,110,0.4)'
                        : '1px solid rgba(255,255,255,0.09)' }}>
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div>
              <p style={sec}>Colors</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                {COLOR_OPTIONS.map(color => (
                  <button key={color} onClick={() => toggleColor(color)}
                    style={{ padding:'6px 12px', borderRadius:'100px', cursor:'pointer',
                      fontFamily:'inherit', fontSize:'11px', fontWeight:600, transition:'all .15s',
                      background: form.colors.includes(color) ? 'rgba(201,169,110,0.15)' : 'rgba(255,255,255,0.04)',
                      color:      form.colors.includes(color) ? '#c9a96e'                 : 'rgba(255,255,255,0.38)',
                      border: form.colors.includes(color)
                        ? '1px solid rgba(201,169,110,0.4)'
                        : '1px solid rgba(255,255,255,0.09)' }}>
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Images */}
            <div>
              <p style={sec}>Product Images</p>
              <label style={{ display:'flex', flexDirection:'column', alignItems:'center',
                justifyContent:'center', width:'100%', height:'110px', cursor:'pointer',
                border:'2px dashed rgba(255,255,255,0.12)', borderRadius:'14px',
                transition:'border-color .2s', boxSizing:'border-box' }}
                onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(201,169,110,0.3)'}
                onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.12)'}>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:'28px', marginBottom:'6px' }}>📸</div>
                  <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.35)', margin:0 }}>Click to upload images</p>
                  <p style={{ fontSize:'10px', color:'rgba(255,255,255,0.18)', margin:'3px 0 0' }}>PNG, JPG, WEBP up to 5MB each</p>
                </div>
                <input type="file" multiple accept="image/*"
                  style={{ display:'none' }} onChange={handleImageChange} />
              </label>

              {imagePreview.length > 0 && (
                <div className="img-preview-grid">
                  {imagePreview.map((src,i) => (
                    <div key={i} style={{ position:'relative' }}>
                      <img src={src} alt={`Preview ${i+1}`}
                        style={{ width:'100%', aspectRatio:'1/1', borderRadius:'10px',
                          objectFit:'cover', border:'1px solid rgba(255,255,255,0.1)', display:'block' }} />
                      {i===0 && (
                        <span style={{ position:'absolute', top:'4px', left:'4px',
                          background:'#c9a96e', color:'#0d1b2a',
                          fontSize:'8px', fontWeight:800, padding:'2px 6px', borderRadius:'5px' }}>
                          Main
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {editProduct?.images?.length > 0 && imagePreview.length === 0 && (
                <div style={{ marginTop:'12px' }}>
                  <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.25)', marginBottom:'8px' }}>Current Images:</p>
                  <div className="img-preview-grid">
                    {editProduct.images.map((img,i) => (
                      <img key={i}
                        src={getImageUrl(img.image_url || img.image)} alt={`Product ${i+1}`}
                        style={{ width:'100%', aspectRatio:'1/1', borderRadius:'10px',
                          objectFit:'cover', border:'1px solid rgba(255,255,255,0.1)', display:'block' }} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit */}
            <div style={{ display:'flex', gap:'10px' }}>
              <button onClick={handleSubmit} disabled={formLoading}
                style={{ flex:1, padding:'13px', borderRadius:'100px', border:'none',
                  cursor: formLoading ? 'not-allowed' : 'pointer', fontFamily:'inherit',
                  fontSize:'12px', fontWeight:800, letterSpacing:'0.09em', textTransform:'uppercase',
                  opacity: formLoading ? .65 : 1, transition:'opacity .15s',
                  background:'linear-gradient(135deg,#c9a96e,#b8935a)', color:'#0d1b2a' }}>
                {formLoading ? '⏳ Saving…' : editProduct ? '💾 Update Product' : '✅ Create Product'}
              </button>
              <button onClick={() => { setShowForm(false); resetForm(); }}
                style={{ padding:'13px 22px', borderRadius:'100px', cursor:'pointer',
                  fontFamily:'inherit', fontSize:'12px', fontWeight:600,
                  background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)',
                  color:'rgba(255,255,255,0.45)', transition:'all .15s' }}
                onMouseEnter={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.08)'; e.currentTarget.style.color='rgba(255,255,255,0.7)'; }}
                onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.color='rgba(255,255,255,0.45)'; }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════ SEARCH ════ */}
      <div style={{ display:'flex', gap:'10px', alignItems:'center', flexWrap:'wrap' }}>
        <div style={{ flex:1, minWidth:'180px', display:'flex', alignItems:'center', gap:'10px',
          background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)',
          borderRadius:'12px', padding:'9px 14px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="rgba(255,255,255,0.3)" strokeWidth="2" style={{ flexShrink:0 }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
            placeholder="Search products…"
            style={{ flex:1, background:'transparent', border:'none', color:'#fff',
              fontSize:'13px', outline:'none', fontFamily:'inherit' }} />
          {searchQuery && (
            <button onClick={()=>setSearchQuery('')}
              style={{ background:'none', border:'none', cursor:'pointer',
                color:'rgba(255,255,255,0.3)', fontSize:'18px', lineHeight:1, padding:0 }}>×</button>
          )}
        </div>
        <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.3)', whiteSpace:'nowrap' }}>
          {filteredProducts.length} products
        </span>
      </div>

      {/* ════ PRODUCT GRID ════ */}
      {loading ? (
        <div className="prod-admin-grid">
          {[...Array(8)].map((_,i) => (
            <div key={i} style={{ background:'rgba(255,255,255,0.03)',
              border:'1px solid rgba(255,255,255,0.06)', borderRadius:'14px', overflow:'hidden' }}>
              <div style={{ paddingTop:'128%',
                backgroundImage:'linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.08) 50%,rgba(255,255,255,0.04) 75%)',
                backgroundSize:'200% 100%', animation:'shimmer 1.4s infinite' }} />
              <div style={{ padding:'12px', display:'flex', flexDirection:'column', gap:'8px' }}>
                <div style={{ height:'12px', width:'70%', background:'rgba(255,255,255,0.06)', borderRadius:'4px' }} />
                <div style={{ height:'10px', width:'50%', background:'rgba(255,255,255,0.04)', borderRadius:'4px' }} />
                <div style={{ height:'14px', width:'60px', background:'rgba(255,255,255,0.06)', borderRadius:'4px' }} />
              </div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)',
          borderRadius:'16px', padding:'60px 16px', textAlign:'center' }}>
          <div style={{ fontSize:'44px', marginBottom:'12px' }}>📦</div>
          <h3 style={{ fontSize:'20px', fontWeight:700, color:'#fff',
            fontFamily:'Georgia,serif', margin:'0 0 8px' }}>No products yet</h3>
          <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.28)', margin:'0 0 20px' }}>
            Add your first product to get started
          </p>
          <button onClick={() => handleOpenForm()}
            style={{ padding:'10px 24px', borderRadius:'100px', border:'none', cursor:'pointer',
              background:'linear-gradient(135deg,#c9a96e,#b8935a)', color:'#0d1b2a',
              fontSize:'11px', fontWeight:800, letterSpacing:'0.09em',
              textTransform:'uppercase', fontFamily:'inherit' }}>
            + Add First Product
          </button>
        </div>
      ) : (
        <div className="prod-admin-grid">
          {filteredProducts.map(product => {
            const badge = BADGE_CFG[product.badge];
            const stockColor = product.stock > 10 ? '#4ade80' : product.stock > 0 ? '#fb923c' : '#f87171';
            return (
              <div key={product.id} className="prod-card"
                style={{ background:'rgba(255,255,255,0.03)',
                  border:'1px solid rgba(255,255,255,0.07)',
                  borderRadius:'14px', overflow:'hidden',
                  transition:'all .2s ease', cursor:'default' }}>

                {/* Image */}
                <div style={{ position:'relative', paddingTop:'128%', overflow:'hidden',
                  background:'rgba(255,255,255,0.04)' }}>
                  <img src={getImageUrl(product.primary_image)} alt={product.name}
                    className="prod-img"
                    onError={e=>{ e.target.src='https://via.placeholder.com/300x400?text=No+Image'; }}
                    style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />

                  {/* Badges top-left */}
                  <div style={{ position:'absolute', top:'8px', left:'8px',
                    display:'flex', flexDirection:'column', gap:'4px', zIndex:2 }}>
                    {badge && (
                      <span style={{ background:badge.bg, color:badge.color,
                        fontSize:'8px', fontWeight:800, padding:'2px 8px',
                        borderRadius:'100px', letterSpacing:'0.06em', textTransform:'uppercase' }}>
                        {product.badge}
                      </span>
                    )}
                  </div>

                  {/* Flags top-right */}
                  <div style={{ position:'absolute', top:'8px', right:'8px',
                    display:'flex', flexDirection:'column', gap:'4px', alignItems:'flex-end', zIndex:2 }}>
                    {product.is_featured && (
                      <span style={{ background:'rgba(201,169,110,0.8)', color:'#0d1b2a',
                        fontSize:'9px', fontWeight:800, padding:'2px 6px', borderRadius:'5px' }}>⭐</span>
                    )}
                    {product.is_new_arrival && (
                      <span style={{ background:'rgba(59,130,246,0.8)', color:'#fff',
                        fontSize:'9px', fontWeight:800, padding:'2px 6px', borderRadius:'5px' }}>✨</span>
                    )}
                  </div>

                  {/* Hover overlay */}
                  <div className="card-overlay"
                    style={{ position:'absolute', inset:0, zIndex:3,
                      background:'rgba(13,27,42,0.82)',
                      opacity:0, transition:'opacity .25s',
                      display:'flex', alignItems:'center', justifyContent:'center', gap:'10px' }}>
                    <button onClick={() => handleOpenForm(product)}
                      style={{ padding:'8px 16px', borderRadius:'100px', border:'none', cursor:'pointer',
                        background:'#c9a96e', color:'#0d1b2a',
                        fontSize:'11px', fontWeight:800, fontFamily:'inherit' }}>
                      ✏️ Edit
                    </button>
                    <button onClick={() => setDeleteConfirm(product)}
                      style={{ padding:'8px 16px', borderRadius:'100px', border:'none', cursor:'pointer',
                        background:'#ef4444', color:'#fff',
                        fontSize:'11px', fontWeight:800, fontFamily:'inherit' }}>
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Card body */}
                <div style={{ padding:'11px 12px 13px' }}>
                  <p style={{ fontSize:'9px', fontWeight:800, letterSpacing:'0.12em',
                    textTransform:'uppercase', color:'rgba(201,169,110,0.6)',
                    margin:'0 0 3px' }}>
                    {product.category_name || 'No category'}
                  </p>
                  <h3 style={{ fontSize:'12px', fontWeight:500, color:'rgba(255,255,255,0.85)',
                    margin:'0 0 8px', lineHeight:1.35,
                    overflow:'hidden', display:'-webkit-box',
                    WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
                    {product.name}
                  </h3>

                  {/* Price row */}
                  <div style={{ marginBottom:'6px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'6px', flexWrap:'wrap' }}>
                      <span style={{ fontSize:'14px', fontWeight:700, color:'#c9a96e', fontFamily:'Georgia,serif' }}>
                        Rs.{parseFloat(product.price).toLocaleString()}
                      </span>
                      {product.original_price && parseFloat(product.original_price) > parseFloat(product.price) && (
                        <>
                          <span style={{ fontSize:'10px', color:'rgba(255,255,255,0.3)', textDecoration:'line-through' }}>
                            Rs.{parseFloat(product.original_price).toLocaleString()}
                          </span>
                          <span style={{ fontSize:'9px', fontWeight:800,
                            background:'rgba(239,68,68,0.15)', color:'#f87171',
                            padding:'1px 6px', borderRadius:'100px' }}>
                            -{Math.round((1 - parseFloat(product.price)/parseFloat(product.original_price))*100)}%
                          </span>
                        </>
                      )}
                    </div>
                    <span style={{ fontSize:'10px', fontWeight:700, color:stockColor, marginTop:'3px', display:'block' }}>
                      {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </span>
                  </div>

                  <div style={{ display:'flex', gap:'6px', marginTop:'8px' }}>
                    <button onClick={() => handleOpenForm(product)} className="edit-btn"
                      style={{ flex:1, padding:'7px', borderRadius:'8px', cursor:'pointer',
                        background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)',
                        color:'rgba(255,255,255,0.45)', fontSize:'11px', fontWeight:600,
                        fontFamily:'inherit', transition:'all .15s' }}>
                      Edit
                    </button>
                    <button onClick={() => setDeleteConfirm(product)} className="del-btn"
                      style={{ flex:1, padding:'7px', borderRadius:'8px', cursor:'pointer',
                        background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)',
                        color:'rgba(239,68,68,0.55)', fontSize:'11px', fontWeight:600,
                        fontFamily:'inherit', transition:'all .15s' }}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}