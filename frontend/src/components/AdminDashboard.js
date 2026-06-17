import React, { useState, useEffect } from 'react';
import AdminOrders from './AdminOrders';
import AdminProducts from './AdminProducts';
import { ordersAPI } from '../api';
import { placeholderImg } from '../utils/placeholder';

export default function AdminDashboard({ navigate }) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [stats, setStats]                 = useState(null);
  const [orders, setOrders]               = useState([]);
  const [statsLoading, setStatsLoading]   = useState(true);
  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const [refreshing, setRefreshing]       = useState(false);

  useEffect(() => { loadStats(); loadOrders(); }, []);

  /* close sidebar on section change (mobile) */
  const goTo = (section) => { setActiveSection(section); setSidebarOpen(false); };

  const loadStats = async () => {
    setStatsLoading(true);
    try { const res = await ordersAPI.adminGetStats(); setStats(res.data); }
    catch (err) { console.error(err); }
    finally { setStatsLoading(false); }
  };

  const loadOrders = async () => {
    try {
      const res = await ordersAPI.adminGetAll();
      const raw = res?.data ?? res;
      setOrders(Array.isArray(raw) ? raw : raw?.results ?? raw?.data ?? []);
    } catch (err) { console.error(err); }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadStats(), loadOrders()]);
    setRefreshing(false);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;
      await ordersAPI.adminUpdateStatus(order.order_number, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      await loadStats();
    } catch (err) { console.error(err); }
  };

  const handleLogout = () => { localStorage.removeItem('adminLoggedIn'); navigate('home'); };

  /* ── STATUS CONFIG ── */
  const STATUS = {
    Pending:   { bg: 'rgba(249,115,22,0.12)',  color: '#fb923c', border: 'rgba(249,115,22,0.3)'  },
    Confirmed: { bg: 'rgba(59,130,246,0.12)',  color: '#60a5fa', border: 'rgba(59,130,246,0.3)'  },
    Packed:    { bg: 'rgba(168,85,247,0.12)',  color: '#c084fc', border: 'rgba(168,85,247,0.3)'  },
    Shipped:   { bg: 'rgba(201,169,110,0.12)', color: '#c9a96e', border: 'rgba(201,169,110,0.3)' },
    Delivered: { bg: 'rgba(34,197,94,0.12)',   color: '#4ade80', border: 'rgba(34,197,94,0.3)'   },
    Cancelled: { bg: 'rgba(239,68,68,0.12)',   color: '#f87171', border: 'rgba(239,68,68,0.3)'   },
  };

  const navGroups = [
    { title: 'Main',    items: [{ id:'dashboard', icon:'📊', label:'Dashboard' }] },
    { title: 'Catalog', items: [{ id:'products',  icon:'👕', label:'Products'  }] },
    { title: 'Orders',  items: [
      { id:'orders',    icon:'📦', label:'All Orders', badge: stats?.pending_orders  },
      { id:'pending',   icon:'⏳', label:'Pending',    badge: stats?.pending_orders  },
      { id:'shipped',   icon:'🚚', label:'Shipped',    badge: stats?.shipped_orders  },
      { id:'delivered', icon:'✅', label:'Delivered',  badge: stats?.delivered_orders },
    ]},
  ];

  const statCards = stats ? [
    { icon:'📦', label:'Total Orders', value: stats.total_orders,    color:'#60a5fa' },
    { icon:'⏳', label:'Pending',      value: stats.pending_orders,  color:'#fb923c' },
    { icon:'✅', label:'Delivered',    value: stats.delivered_orders, color:'#4ade80' },
    { icon:'💰', label:'Revenue',      value:`Rs.${parseFloat(stats.total_revenue||0).toLocaleString()}`, color:'#c9a96e' },
    { icon:'👕', label:'Products',     value: stats.total_products,  color:'#c084fc' },
    { icon:'❌', label:'Cancelled',    value: stats.cancelled_orders, color:'#f87171' },
  ] : [];

  const getOrderFilter = () => {
    if (activeSection==='pending')   return 'pending';
    if (activeSection==='shipped')   return 'shipped';
    if (activeSection==='delivered') return 'delivered';
    return 'all';
  };

  const PAGE_TITLE = {
    dashboard: '📊 Dashboard',
    products:  '👕 Products',
    orders:    '📦 All Orders',
    pending:   '⏳ Pending',
    shipped:   '🚚 Shipped',
    delivered: '✅ Delivered',
  };

  /* ── SIDEBAR INNER ── */
  const SidebarInner = () => (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>

      {/* Logo area */}
      <div style={{ padding:'18px 16px 14px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px' }}>
          <div style={{ width:'34px', height:'34px', borderRadius:'10px', flexShrink:0,
            background:'linear-gradient(135deg,#c9a96e,#b8935a)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'14px', fontWeight:900, color:'#0d1b2a' }}>A</div>
          <div>
            <p style={{ fontSize:'13px', fontWeight:800, color:'#c9a96e',
              letterSpacing:'0.1em', textTransform:'uppercase', margin:0, lineHeight:1.2 }}>Aslivo</p>
            <p style={{ fontSize:'10px', color:'rgba(255,255,255,0.25)', margin:0, marginTop:'2px' }}>Admin Panel</p>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'6px',
          background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.2)',
          borderRadius:'8px', padding:'5px 10px', width:'fit-content' }}>
          <span style={{ width:'6px', height:'6px', borderRadius:'50%',
            background:'#4ade80', display:'inline-block', animation:'pulse 2s infinite' }} />
          <span style={{ fontSize:'10px', color:'#4ade80', fontWeight:700 }}>Online</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:'12px 10px', overflowY:'auto' }}>
        {navGroups.map(group => (
          <div key={group.title} style={{ marginBottom:'20px' }}>
            <p style={{ fontSize:'9px', fontWeight:800, letterSpacing:'0.14em',
              textTransform:'uppercase', color:'rgba(255,255,255,0.18)',
              padding:'0 10px', marginBottom:'6px' }}>{group.title}</p>
            <div style={{ display:'flex', flexDirection:'column', gap:'2px' }}>
              {group.items.map(item => {
                const active = activeSection === item.id;
                return (
                  <button key={item.id} onClick={() => goTo(item.id)}
                    style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                      padding:'9px 10px', borderRadius:'10px', border:'none', cursor:'pointer',
                      fontFamily:'inherit', fontSize:'13px', fontWeight: active ? 700 : 500,
                      background: active ? 'rgba(201,169,110,0.14)' : 'transparent',
                      color: active ? '#c9a96e' : 'rgba(255,255,255,0.5)',
                      transition:'all .15s', textAlign:'left', width:'100%' }}
                    onMouseEnter={e => { if (!active) { e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.color='rgba(255,255,255,0.8)'; }}}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(255,255,255,0.5)'; }}}>
                    <span style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                      <span style={{ fontSize:'16px', width:'20px', textAlign:'center' }}>{item.icon}</span>
                      {item.label}
                    </span>
                    {item.badge > 0 && (
                      <span style={{ background:'#f97316', color:'#fff', fontSize:'9px',
                        fontWeight:800, padding:'2px 6px', borderRadius:'100px',
                        minWidth:'18px', textAlign:'center' }}>{item.badge}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom actions */}
      <div style={{ padding:'10px', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={() => navigate('home')}
          style={{ width:'100%', display:'flex', alignItems:'center', gap:'10px',
            padding:'9px 10px', borderRadius:'10px', border:'none', cursor:'pointer',
            fontFamily:'inherit', fontSize:'13px', fontWeight:500,
            background:'transparent', color:'rgba(255,255,255,0.45)',
            transition:'all .15s', marginBottom:'2px' }}
          onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.color='rgba(255,255,255,0.8)'; }}
          onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(255,255,255,0.45)'; }}>
          <span style={{ fontSize:'16px' }}>🏠</span> View Store
        </button>
        <button onClick={handleLogout}
          style={{ width:'100%', display:'flex', alignItems:'center', gap:'10px',
            padding:'9px 10px', borderRadius:'10px', border:'none', cursor:'pointer',
            fontFamily:'inherit', fontSize:'13px', fontWeight:500,
            background:'transparent', color:'#f87171', transition:'all .15s' }}
          onMouseEnter={e => e.currentTarget.style.background='rgba(239,68,68,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background='transparent'}>
          <span style={{ fontSize:'16px' }}>🚪</span> Sign Out
        </button>
      </div>
    </div>
  );

  /* ── STATUS BADGE ── */
  const StatusBadge = ({ status }) => {
    const s = STATUS[status] || STATUS.Pending;
    return (
      <span style={{ display:'inline-flex', alignItems:'center', gap:'5px',
        padding:'3px 10px', borderRadius:'100px', fontSize:'11px', fontWeight:700,
        background:s.bg, color:s.color, border:`1px solid ${s.border}` }}>
        <span style={{ width:'5px', height:'5px', borderRadius:'50%',
          background:s.color, flexShrink:0 }} />
        {status}
      </span>
    );
  };

  return (
    <div style={{ minHeight:'100vh', background:'#0a0c18',
      fontFamily:'system-ui,-apple-system,sans-serif',
      display:'flex', position:'relative' }}>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes spin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fadeUp{ from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

        /* stats grid */
        .stat-grid {
          display:grid;
          grid-template-columns:repeat(2,1fr);
          gap:10px;
        }
        @media(min-width:640px)  { .stat-grid { grid-template-columns:repeat(3,1fr); gap:12px; } }
        @media(min-width:1200px) { .stat-grid { grid-template-columns:repeat(6,1fr); } }

        .action-grid {
          display:grid;
          grid-template-columns:repeat(2,1fr);
          gap:10px;
        }
        @media(min-width:640px) { .action-grid { grid-template-columns:repeat(4,1fr); gap:14px; } }

        /* desktop sidebar always visible */
        .admin-sidebar {
          display: none;
        }
        @media(min-width:768px) {
          .admin-sidebar {
            display: flex !important;
            flex-direction: column;
            width: 230px;
            min-width: 230px;
            flex-shrink: 0;
            position: sticky;
            top: 0;
            height: 100vh;
            overflow-y: auto;
            border-right: 1px solid rgba(255,255,255,0.05);
          }
        }

        /* table scroll */
        .tbl-wrap { overflow-x:auto; }
        .tbl-wrap::-webkit-scrollbar { height:4px; }
        .tbl-wrap::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:4px; }

        .fade-in { animation:fadeUp .4s ease; }

        /* stat card hover */
        .stat-card:hover { background:rgba(255,255,255,0.06) !important; transform:translateY(-2px); }
        .action-btn:hover { background:rgba(201,169,110,0.1) !important; border-color:rgba(201,169,110,0.25) !important; }
        .action-btn:hover .action-icon { transform:scale(1.12); }
        .action-btn:hover .action-label { color:#c9a96e !important; }
      `}</style>

      {/* ════ DESKTOP SIDEBAR ════ */}
      <div className="admin-sidebar" style={{ background:'#0d0f1e' }}>
        <SidebarInner />
      </div>

      {/* ════ MOBILE SIDEBAR BACKDROP ════ */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', zIndex:198 }} />
      )}

      {/* ════ MOBILE SIDEBAR DRAWER ════ */}
      <div style={{
        position:'fixed', top:0, left:0, bottom:0, width:'240px', zIndex:199,
        background:'#0d0f1e',
        borderRight:'1px solid rgba(255,255,255,0.05)',
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition:'transform .3s cubic-bezier(.25,.46,.45,.94)',
        display:'flex', flexDirection:'column',
      }}>
        <SidebarInner />
      </div>

      {/* ════ MAIN ════ */}
      <main style={{ flex:1, minWidth:0, overflowX:'hidden', display:'flex', flexDirection:'column' }}>

        {/* ── TOP BAR ── */}
        <div style={{ position:'sticky', top:0, zIndex:50,
          background:'rgba(10,12,24,0.97)', backdropFilter:'blur(20px)',
          borderBottom:'1px solid rgba(255,255,255,0.05)',
          padding:'12px 16px',
          display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px' }}>

          {/* Mobile hamburger + title */}
          <div style={{ display:'flex', alignItems:'center', gap:'12px', minWidth:0 }}>
            <button onClick={() => setSidebarOpen(o => !o)}
              style={{ display:'flex', flexDirection:'column', gap:'5px', width:'36px', height:'36px',
                alignItems:'center', justifyContent:'center',
                background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)',
                borderRadius:'9px', cursor:'pointer', flexShrink:0 }}
              className="md-hide">
              <span style={{ width:'16px', height:'2px', background:'rgba(255,255,255,0.7)', borderRadius:'2px',
                transition:'all .25s',
                transform: sidebarOpen ? 'rotate(45deg) translate(5px,5px)' : 'none' }} />
              <span style={{ width:'12px', height:'2px', background:'#c9a96e', borderRadius:'2px',
                opacity: sidebarOpen ? 0 : 1, alignSelf:'flex-start', marginLeft:'2px', transition:'opacity .2s' }} />
              <span style={{ width:'16px', height:'2px', background:'rgba(255,255,255,0.7)', borderRadius:'2px',
                transition:'all .25s',
                transform: sidebarOpen ? 'rotate(-45deg) translate(5px,-5px)' : 'none' }} />
            </button>
            <div style={{ minWidth:0 }}>
              <h1 style={{ fontSize:'clamp(14px,3vw,18px)', fontWeight:700, color:'#fff',
                margin:0, lineHeight:1.2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                {PAGE_TITLE[activeSection]}
              </h1>
              <p style={{ fontSize:'10px', color:'rgba(255,255,255,0.25)', margin:0, marginTop:'2px' }}>
                {new Date().toLocaleDateString('en-PK', { weekday:'long', day:'numeric', month:'long' })}
              </p>
            </div>
          </div>

          {/* Right actions */}
          <div style={{ display:'flex', alignItems:'center', gap:'8px', flexShrink:0 }}>
            <button onClick={handleRefresh}
              style={{ display:'flex', alignItems:'center', gap:'6px',
                padding:'7px 13px', borderRadius:'10px', cursor:'pointer',
                background:'rgba(201,169,110,0.08)', border:'1px solid rgba(201,169,110,0.2)',
                color:'#c9a96e', fontSize:'11px', fontWeight:700,
                fontFamily:'inherit', transition:'all .15s' }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(201,169,110,0.14)'}
              onMouseLeave={e => e.currentTarget.style.background='rgba(201,169,110,0.08)'}>
              <span style={{ display:'inline-block', animation: refreshing ? 'spin 1s linear infinite' : 'none' }}>
                🔄
              </span>
              <span style={{ display:'none' }} className="sm-show">Refresh</span>
            </button>
            <div style={{ width:'32px', height:'32px', borderRadius:'50%', flexShrink:0,
              background:'linear-gradient(135deg,#c9a96e,#b8935a)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'12px', fontWeight:900, color:'#0d1b2a' }}>A</div>
          </div>
        </div>

        {/* ── PAGE CONTENT ── */}
        <div style={{ padding:'16px 14px 48px', flex:1 }} className="fade-in">

          {/* ════ DASHBOARD ════ */}
          {activeSection === 'dashboard' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>

              {/* Stat cards */}
              {statsLoading ? (
                <div className="stat-grid">
                  {[...Array(6)].map((_,i) => (
                    <div key={i} style={{ background:'rgba(255,255,255,0.03)',
                      border:'1px solid rgba(255,255,255,0.06)', borderRadius:'14px', padding:'16px' }}>
                      <div style={{ width:'32px', height:'32px', borderRadius:'8px',
                        background:'rgba(255,255,255,0.06)', marginBottom:'12px',
                        backgroundImage:'linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.08) 50%,rgba(255,255,255,0.04) 75%)',
                        backgroundSize:'200% 100%', animation:'shimmer 1.4s infinite' }} />
                      <div style={{ height:'20px', width:'50px', borderRadius:'6px',
                        background:'rgba(255,255,255,0.06)', marginBottom:'8px' }} />
                      <div style={{ height:'10px', width:'70px', borderRadius:'4px',
                        background:'rgba(255,255,255,0.04)' }} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="stat-grid">
                  {statCards.map((s, i) => (
                    <div key={i} className="stat-card"
                      style={{ background:'rgba(255,255,255,0.03)',
                        border:'1px solid rgba(255,255,255,0.06)',
                        borderRadius:'14px', padding:'16px',
                        transition:'all .2s ease', cursor:'default' }}>
                      <div style={{ fontSize:'22px', marginBottom:'10px' }}>{s.icon}</div>
                      <p style={{ fontSize:'clamp(1.1rem,2.5vw,1.4rem)', fontWeight:700,
                        color:s.color, fontFamily:'Georgia,serif', margin:'0 0 4px' }}>
                        {s.value ?? '—'}
                      </p>
                      <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.28)', margin:0 }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick actions */}
              <div className="action-grid">
                {[
                  { icon:'➕', label:'Add Product',    action:() => goTo('products') },
                  { icon:'📦', label:'All Orders',     action:() => goTo('orders')   },
                  { icon:'⏳', label:'Pending Orders', action:() => goTo('pending')  },
                  { icon:'🏠', label:'View Store',     action:() => navigate('home') },
                ].map((a, i) => (
                  <button key={i} onClick={a.action} className="action-btn"
                    style={{ background:'rgba(255,255,255,0.03)',
                      border:'1px solid rgba(255,255,255,0.06)',
                      borderRadius:'14px', padding:'16px 12px',
                      textAlign:'center', cursor:'pointer', fontFamily:'inherit',
                      display:'flex', flexDirection:'column', alignItems:'center', gap:'8px',
                      transition:'all .2s' }}>
                    <span className="action-icon" style={{ fontSize:'22px', display:'block', transition:'transform .2s' }}>
                      {a.icon}
                    </span>
                    <span className="action-label" style={{ fontSize:'11px', fontWeight:600,
                      color:'rgba(255,255,255,0.45)', letterSpacing:'0.05em',
                      transition:'color .2s' }}>
                      {a.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Recent orders table */}
              <div style={{ background:'rgba(255,255,255,0.02)',
                border:'1px solid rgba(255,255,255,0.06)',
                borderRadius:'16px', overflow:'hidden' }}>

                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                  padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                  <h3 style={{ fontSize:'16px', fontWeight:700, color:'#fff',
                    fontFamily:'Georgia,serif', margin:0 }}>Recent Orders</h3>
                  <button onClick={() => goTo('orders')}
                    style={{ background:'none', border:'none', cursor:'pointer',
                      fontFamily:'inherit', fontSize:'12px', fontWeight:700, color:'#c9a96e' }}>
                    View All →
                  </button>
                </div>

                {orders.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'48px 16px' }}>
                    <div style={{ fontSize:'40px', marginBottom:'10px' }}>📭</div>
                    <p style={{ color:'rgba(255,255,255,0.25)', fontSize:'13px', margin:0 }}>No orders yet</p>
                  </div>
                ) : (
                  <div className="tbl-wrap">
                    <table style={{ width:'100%', borderCollapse:'collapse', minWidth:'600px' }}>
                      <thead>
                        <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                          {['Order #','Customer','Amount','Payment','Status','Date'].map(h => (
                            <th key={h} style={{ padding:'10px 14px', textAlign:'left',
                              fontSize:'9px', fontWeight:800, letterSpacing:'0.1em',
                              textTransform:'uppercase', color:'rgba(255,255,255,0.2)',
                              whiteSpace:'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 8).map((order, i) => (
                          <tr key={order.id} onClick={() => goTo('orders')}
                            style={{ borderBottom:'1px solid rgba(255,255,255,0.04)',
                              background: i%2===0 ? 'rgba(255,255,255,0.01)' : 'transparent',
                              cursor:'pointer', transition:'background .15s' }}
                            onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.03)'}
                            onMouseLeave={e => e.currentTarget.style.background= i%2===0 ? 'rgba(255,255,255,0.01)' : 'transparent'}>
                            <td style={{ padding:'11px 14px' }}>
                              <span style={{ color:'#c9a96e', fontWeight:700, fontSize:'13px' }}>
                                #{order.order_number}
                              </span>
                            </td>
                            <td style={{ padding:'11px 14px' }}>
                              <p style={{ fontSize:'13px', fontWeight:600,
                                color:'rgba(255,255,255,0.8)', margin:'0 0 2px', whiteSpace:'nowrap' }}>
                                {order.first_name} {order.last_name}
                              </p>
                              <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.28)', margin:0 }}>
                                {order.phone}
                              </p>
                            </td>
                            <td style={{ padding:'11px 14px' }}>
                              <span style={{ fontSize:'14px', fontWeight:700, color:'#fff',
                                fontFamily:'Georgia,serif', whiteSpace:'nowrap' }}>
                                Rs.{parseFloat(order.total).toLocaleString()}
                              </span>
                            </td>
                            <td style={{ padding:'11px 14px' }}>
                              <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.45)', whiteSpace:'nowrap' }}>
                                {order.payment_method==='cod'       ? '💵 COD'      :
                                 order.payment_method==='jazzcash'  ? '📱 JazzCash' :
                                 order.payment_method==='easypaisa' ? '💚 EasyPaisa': '💳 Card'}
                              </span>
                            </td>
                            <td style={{ padding:'11px 14px' }}>
                              <StatusBadge status={order.status} />
                            </td>
                            <td style={{ padding:'11px 14px' }}>
                              <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.28)', whiteSpace:'nowrap' }}>
                                {new Date(order.created_at).toLocaleDateString('en-PK',
                                  { day:'numeric', month:'short', year:'numeric' })}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Summary footer */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'12px' }}>
                {[
                  { label:'Today\'s Orders',  value: orders.filter(o => {
                      const d = new Date(o.created_at);
                      const n = new Date();
                      return d.toDateString() === n.toDateString();
                    }).length, icon:'📅', color:'#60a5fa' },
                  { label:'Pending Action',   value: orders.filter(o => o.status==='Pending').length,   icon:'⚠️', color:'#fb923c' },
                  { label:'Ready to Ship',    value: orders.filter(o => o.status==='Packed').length,    icon:'📫', color:'#c084fc' },
                  { label:'In Transit',       value: orders.filter(o => o.status==='Shipped').length,   icon:'🚚', color:'#c9a96e' },
                ].map((s, i) => (
                  <div key={i} style={{ background:'rgba(255,255,255,0.02)',
                    border:'1px solid rgba(255,255,255,0.05)',
                    borderRadius:'12px', padding:'14px 16px',
                    display:'flex', alignItems:'center', gap:'12px' }}>
                    <span style={{ fontSize:'22px', flexShrink:0 }}>{s.icon}</span>
                    <div>
                      <p style={{ fontSize:'18px', fontWeight:700, color:s.color,
                        fontFamily:'Georgia,serif', margin:'0 0 2px' }}>{s.value}</p>
                      <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.28)', margin:0 }}>{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════ PRODUCTS ════ */}
          {activeSection === 'products' && <AdminProducts />}

          {/* ════ ORDERS ════ */}
          {['orders','pending','shipped','delivered'].includes(activeSection) && (
            <AdminOrders
              orders={orders}
              filter={getOrderFilter()}
              statusColors={STATUS}
              updateOrderStatus={updateOrderStatus}
              reloadOrders={loadOrders}
            />
          )}
        </div>
      </main>

      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @media(min-width:768px) { .md-hide { display:none !important; } }
        @media(min-width:480px) { .sm-show { display:inline !important; } }
        .sm-show { display:none; }
      `}</style>
    </div>
  );
}