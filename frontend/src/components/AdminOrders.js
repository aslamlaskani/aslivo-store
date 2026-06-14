import React, { useState } from 'react';
import { ordersAPI } from '../api';

export default function AdminOrders({ orders, filter, statusColors, updateOrderStatus, reloadOrders }) {
  const [selectedOrder, setSelectedOrder]   = useState(null);
  const [searchQuery, setSearchQuery]       = useState('');
  const [confirmAction, setConfirmAction]   = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const statusFlow = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered'];

  /* ── STATUS CONFIG (inline-style friendly) ── */
  const STATUS = {
    Pending:   { bg:'rgba(249,115,22,0.12)',  color:'#fb923c', border:'rgba(249,115,22,0.3)'  },
    Confirmed: { bg:'rgba(59,130,246,0.12)',  color:'#60a5fa', border:'rgba(59,130,246,0.3)'  },
    Packed:    { bg:'rgba(168,85,247,0.12)',  color:'#c084fc', border:'rgba(168,85,247,0.3)'  },
    Shipped:   { bg:'rgba(201,169,110,0.12)', color:'#c9a96e', border:'rgba(201,169,110,0.3)' },
    Delivered: { bg:'rgba(34,197,94,0.12)',   color:'#4ade80', border:'rgba(34,197,94,0.3)'   },
    Cancelled: { bg:'rgba(239,68,68,0.12)',   color:'#f87171', border:'rgba(239,68,68,0.3)'   },
  };

  const getStatus = (s) => STATUS[s] || STATUS.Pending;

  const NEXT_BTN = {
    Pending:   { bg:'#3b82f6', hover:'#2563eb', color:'#fff' },
    Confirmed: { bg:'#a855f7', hover:'#9333ea', color:'#fff' },
    Packed:    { bg:'#c9a96e', hover:'#b8935a', color:'#0d1b2a' },
    Shipped:   { bg:'#22c55e', hover:'#16a34a', color:'#fff' },
  };

  const filteredOrders = orders
    .filter(o => {
      if (filter==='pending')   return o.status==='Pending';
      if (filter==='shipped')   return o.status==='Shipped';
      if (filter==='delivered') return o.status==='Delivered';
      return true;
    })
    .filter(o => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        o.order_number?.toLowerCase().includes(q) ||
        o.first_name?.toLowerCase().includes(q) ||
        o.last_name?.toLowerCase().includes(q) ||
        o.phone?.includes(q) ||
        o.email?.toLowerCase().includes(q)
      );
    })
    .sort((a,b) => new Date(b.created_at) - new Date(a.created_at));

  const getNextStatus = (current) => {
    const idx = statusFlow.indexOf(current);
    return idx < statusFlow.length - 1 ? statusFlow[idx+1] : null;
  };

  const sendConfirmWhatsApp = (order) => {
    if (!order.phone) return;
    const phone = order.phone.replace(/\D/g,'');
    const formatted = phone.startsWith('0') ? '92'+phone.slice(1)
      : phone.startsWith('92') ? phone : '92'+phone;
    const items = order.items
      ?.map((it,i) => `${i+1}. ${it.product_name}${it.size?` (${it.size})`:''} x${it.quantity} = Rs.${(it.price*it.quantity).toLocaleString()}`)
      .join('%0A') || '';
    const pay = order.payment_method==='cod'?'Cash on Delivery':order.payment_method==='jazzcash'?'JazzCash':order.payment_method==='easypaisa'?'EasyPaisa':'Card';
    const msg =
      `✅ *Order Confirmed - Aslivo Store*%0A` +
      `━━━━━━━━━━━━━━━━━━━━%0A` +
      `Assalam o Alaikum *${order.first_name}*! 🎉%0A` +
      `Your order has been *confirmed* by Aslivo Store.%0A%0A` +
      `📦 *Order %23${order.order_number}*%0A%0A` +
      `🛒 *YOUR ITEMS*%0A${items}%0A%0A` +
      `━━━━━━━━━━━━━━━━━━━━%0A` +
      `💰 Total: Rs.${parseFloat(order.total).toLocaleString()}%0A` +
      `💳 Payment: ${pay}%0A%0A` +
      `📍 Delivering to: ${order.city}%0A` +
      `⏱️ Estimated: 3-5 business days%0A%0A` +
      `Shukriya for shopping! 🙏%0A` +
      `━━━━━━━━━━━━━━━━━━━━%0A` +
      `🏪 *Aslivo Store Team*`;
    window.open(`https://wa.me/${formatted}?text=${msg}`, '_blank');
  };

  const handleStatusUpdate = async (orderNumber, newStatus) => {
    setConfirmLoading(true);
    try {
      await updateOrderStatus(orders.find(o=>o.order_number===orderNumber)?.id, newStatus);
      if (selectedOrder?.order_number===orderNumber) setSelectedOrder(p=>({...p,status:newStatus}));
      if (newStatus==='Confirmed') {
        const o = orders.find(o=>o.order_number===orderNumber);
        if (o) sendConfirmWhatsApp(o);
      }
      setConfirmAction(null);
      if (reloadOrders) await reloadOrders();
    } catch(err){ console.error(err); }
    finally { setConfirmLoading(false); }
  };

  const handleCancelOrder = async (orderNumber) => {
    setConfirmLoading(true);
    try {
      await ordersAPI.adminCancelOrder(orderNumber, 'Cancelled by admin');
      setConfirmAction(null);
      if (selectedOrder?.order_number===orderNumber) setSelectedOrder(p=>({...p,status:'Cancelled'}));
      if (reloadOrders) await reloadOrders();
    } catch(err){ console.error(err); }
    finally { setConfirmLoading(false); }
  };

  const loadFullOrder = async (order) => {
    try {
      const data = await ordersAPI.adminGetOrder(order.order_number);
      setSelectedOrder(data);
    } catch { setSelectedOrder(order); }
  };

  /* ── STATUS BADGE ── */
  const StatusBadge = ({ status }) => {
    const s = getStatus(status);
    return (
      <span style={{ display:'inline-flex', alignItems:'center', gap:'5px',
        padding:'3px 10px', borderRadius:'100px', fontSize:'10px', fontWeight:700,
        background:s.bg, color:s.color, border:`1px solid ${s.border}`, whiteSpace:'nowrap' }}>
        <span style={{ width:'5px', height:'5px', borderRadius:'50%',
          background:s.color, flexShrink:0 }} />
        {status}
      </span>
    );
  };

  /* ── EMPTY ── */
  if (orders.length===0 && !searchQuery) return (
    <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)',
      borderRadius:'16px', padding:'64px 16px', textAlign:'center' }}>
      <div style={{ fontSize:'44px', marginBottom:'12px' }}>📭</div>
      <h3 style={{ fontSize:'20px', fontWeight:700, color:'#fff', fontFamily:'Georgia,serif', margin:'0 0 8px' }}>
        No orders found
      </h3>
      <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.28)', margin:0 }}>
        {filter==='all' ? 'Orders will appear here once customers place them' : `No ${filter} orders at the moment`}
      </p>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn{ from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:.4} }

        .orders-layout { display:flex; flex-direction:column; gap:16px; }
        @media(min-width:1200px) {
          .orders-layout { flex-direction:row; align-items:flex-start; }
          .orders-list   { flex:3; min-width:0; }
          .order-detail  { flex:2; min-width:0; position:sticky; top:70px; max-height:calc(100vh - 90px); overflow-y:auto; }
        }

        .order-row:hover { background:rgba(255,255,255,0.03) !important; }
        .order-row.selected { border-left:3px solid #c9a96e !important; background:rgba(201,169,110,0.06) !important; }

        /* detail scroll */
        .detail-scroll { overflow-y:auto; max-height:calc(100vh - 200px); }
        .detail-scroll::-webkit-scrollbar { width:4px; }
        .detail-scroll::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.08); border-radius:4px; }

        /* timeline */
        .tl-dot { width:26px; height:26px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:all .2s; }
        .tl-line { flex:1; height:2px; transition:background .3s; }

        /* mobile order cards */
        .mob-card { display:block; }
        .desk-row { display:none; }
        @media(min-width:640px) {
          .mob-card { display:none; }
          .desk-row { display:grid; }
        }

        .nb-btn:hover { opacity:.85; }
        .close-btn:hover { color:#fff !important; }
        .wa-btn:hover { background:rgba(37,211,102,0.18) !important; }
      `}</style>

      {/* ════ CONFIRM MODAL ════ */}
      {confirmAction && (
        <div style={{ position:'fixed', inset:0, zIndex:999,
          background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)',
          display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' }}>
          <div style={{ background:'#12141f', border:'1px solid rgba(255,255,255,0.1)',
            borderRadius:'20px', padding:'32px 24px', maxWidth:'360px', width:'100%',
            textAlign:'center', boxShadow:'0 32px 80px rgba(0,0,0,0.6)',
            animation:'fadeUp .3s ease' }}>
            <div style={{ fontSize:'40px', marginBottom:'14px' }}>
              {confirmAction.type==='cancel' ? '⚠️' : confirmAction.newStatus==='Confirmed' ? '📱' : '✅'}
            </div>
            <h3 style={{ fontSize:'18px', fontWeight:700, color:'#fff',
              fontFamily:'Georgia,serif', margin:'0 0 6px' }}>
              {confirmAction.type==='cancel' ? 'Cancel Order?' : 'Update Status'}
            </h3>
            <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.35)', margin:'0 0 10px' }}>
              Order <span style={{ color:'#c9a96e', fontWeight:700 }}>#{confirmAction.orderNumber}</span>
            </p>

            {confirmAction.type !== 'cancel' && (
              <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.55)', margin:'0 0 16px' }}>
                Change to <strong style={{ color: getStatus(confirmAction.newStatus).color }}>
                  {confirmAction.newStatus}
                </strong>?
              </p>
            )}

            {confirmAction.newStatus==='Confirmed' && (
              <div style={{ background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.2)',
                borderRadius:'10px', padding:'10px 14px', marginBottom:'16px',
                display:'flex', alignItems:'flex-start', gap:'8px', textAlign:'left' }}>
                <span style={{ fontSize:'16px', flexShrink:0 }}>📱</span>
                <p style={{ fontSize:'12px', color:'#4ade80', margin:0, lineHeight:1.5 }}>
                  WhatsApp confirmation will be sent to customer automatically.
                </p>
              </div>
            )}

            {confirmAction.type==='cancel' && (
              <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.35)', margin:'0 0 16px' }}>
                This action cannot be undone.
              </p>
            )}

            <div style={{ display:'flex', gap:'10px', justifyContent:'center' }}>
              <button onClick={() => setConfirmAction(null)} disabled={confirmLoading}
                style={{ padding:'9px 20px', borderRadius:'10px', cursor:'pointer',
                  background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
                  color:'rgba(255,255,255,0.55)', fontSize:'13px', fontFamily:'inherit',
                  transition:'all .15s' }}
                className="nb-btn">
                Cancel
              </button>
              <button
                onClick={() => confirmAction.type==='cancel'
                  ? handleCancelOrder(confirmAction.orderNumber)
                  : handleStatusUpdate(confirmAction.orderNumber, confirmAction.newStatus)}
                disabled={confirmLoading}
                style={{ padding:'9px 20px', borderRadius:'10px', cursor: confirmLoading ? 'not-allowed' : 'pointer',
                  border:'none', fontSize:'13px', fontWeight:700, fontFamily:'inherit',
                  opacity: confirmLoading ? .6 : 1, transition:'all .15s',
                  background: confirmAction.type==='cancel' ? '#ef4444' : '#c9a96e',
                  color: confirmAction.type==='cancel' ? '#fff' : '#0d1b2a' }}
                className="nb-btn">
                {confirmLoading ? '⏳ Processing…'
                  : confirmAction.newStatus==='Confirmed' ? '✅ Confirm & Notify'
                  : confirmAction.type==='cancel' ? 'Yes, Cancel'
                  : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════ SEARCH BAR ════ */}
      <div style={{ display:'flex', gap:'10px', marginBottom:'16px', flexWrap:'wrap' }}>
        <div style={{ flex:1, minWidth:'200px', display:'flex', alignItems:'center', gap:'10px',
          background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)',
          borderRadius:'12px', padding:'9px 14px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="rgba(255,255,255,0.3)" strokeWidth="2" style={{ flexShrink:0 }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search order #, name, phone…"
            style={{ flex:1, background:'transparent', border:'none', color:'#fff',
              fontSize:'13px', outline:'none', fontFamily:'inherit' }} />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')}
              style={{ background:'none', border:'none', cursor:'pointer',
                color:'rgba(255,255,255,0.3)', fontSize:'18px', lineHeight:1, padding:0 }}>×</button>
          )}
        </div>
        <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)',
          borderRadius:'12px', padding:'9px 14px', fontSize:'12px',
          color:'rgba(255,255,255,0.35)', whiteSpace:'nowrap', display:'flex', alignItems:'center' }}>
          {filteredOrders.length} order{filteredOrders.length!==1?'s':''}
        </div>
      </div>

      {/* ════ LAYOUT ════ */}
      <div className="orders-layout">

        {/* ── ORDERS LIST ── */}
        <div className="orders-list">
          <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)',
            borderRadius:'16px', overflow:'hidden' }}>

            {/* Desktop header row */}
            <div className="desk-row"
              style={{ gridTemplateColumns:'1fr 1.2fr 0.8fr 0.7fr 1fr 0.9fr',
                gap:'12px', padding:'10px 16px',
                background:'rgba(255,255,255,0.02)', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
              {['Order #','Customer','Amount','Date','Status','Action'].map(h => (
                <span key={h} style={{ fontSize:'9px', fontWeight:800, letterSpacing:'0.1em',
                  textTransform:'uppercase', color:'rgba(255,255,255,0.2)' }}>{h}</span>
              ))}
            </div>

            {filteredOrders.length === 0 ? (
              <div style={{ textAlign:'center', padding:'48px 16px' }}>
                <div style={{ fontSize:'36px', marginBottom:'10px' }}>🔍</div>
                <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.28)', margin:0 }}>No orders match your search</p>
              </div>
            ) : filteredOrders.map((order, i) => {
              const s = getStatus(order.status);
              const nextStatus = getNextStatus(order.status);
              const nb = NEXT_BTN[order.status];
              const isSelected = selectedOrder?.id===order.id || selectedOrder?.order_number===order.order_number;
              const isDone = order.status==='Delivered';
              const isCancelled = order.status==='Cancelled';

              return (
                <div key={order.id}>
                  {/* MOBILE CARD */}
                  <div className={`mob-card order-row${isSelected?' selected':''}`}
                    onClick={() => loadFullOrder(order)}
                    style={{ padding:'13px 14px', borderBottom:'1px solid rgba(255,255,255,0.04)',
                      cursor:'pointer', transition:'background .15s',
                      background: isSelected ? 'rgba(201,169,110,0.06)' : i%2===0?'rgba(255,255,255,0.01)':'transparent',
                      borderLeft: isSelected ? '3px solid #c9a96e' : '3px solid transparent' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'8px' }}>
                      <div>
                        <span style={{ color:'#c9a96e', fontWeight:700, fontSize:'13px' }}>#{order.order_number}</span>
                        <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.6)', margin:'2px 0 0', fontWeight:500 }}>
                          {order.first_name} {order.last_name}
                        </p>
                        <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.25)', margin:'1px 0 0' }}>{order.phone}</p>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <p style={{ fontSize:'14px', fontWeight:700, color:'#fff',
                          fontFamily:'Georgia,serif', margin:0 }}>
                          Rs.{parseFloat(order.total).toLocaleString()}
                        </p>
                        <p style={{ fontSize:'10px', color:'rgba(255,255,255,0.25)', margin:'3px 0 6px' }}>
                          {new Date(order.created_at).toLocaleDateString('en-PK',{day:'numeric',month:'short'})}
                        </p>
                        <StatusBadge status={order.status} />
                      </div>
                    </div>
                    {nextStatus && !isDone && !isCancelled && (
                      <button onClick={e => { e.stopPropagation(); setConfirmAction({ orderNumber:order.order_number, newStatus:nextStatus }); }}
                        style={{ padding:'6px 14px', borderRadius:'100px', border:'none', cursor:'pointer',
                          background: nb?.bg || '#c9a96e', color: nb?.color || '#0d1b2a',
                          fontSize:'10px', fontWeight:800, letterSpacing:'0.06em',
                          textTransform:'uppercase', fontFamily:'inherit', marginTop:'4px' }}>
                        {nextStatus==='Confirmed'?'📱 ':''}{nextStatus} →
                      </button>
                    )}
                    {isDone && <span style={{ fontSize:'11px', color:'#4ade80', fontWeight:700 }}>✓ Delivered</span>}
                    {isCancelled && <span style={{ fontSize:'11px', color:'#f87171', fontWeight:700 }}>✗ Cancelled</span>}
                  </div>

                  {/* DESKTOP ROW */}
                  <div className={`desk-row order-row${isSelected?' selected':''}`}
                    onClick={() => loadFullOrder(order)}
                    style={{ gridTemplateColumns:'1fr 1.2fr 0.8fr 0.7fr 1fr 0.9fr',
                      gap:'12px', padding:'12px 16px', cursor:'pointer',
                      borderBottom:'1px solid rgba(255,255,255,0.04)', alignItems:'center',
                      transition:'background .15s',
                      background: isSelected ? 'rgba(201,169,110,0.06)' : i%2===0?'rgba(255,255,255,0.01)':'transparent',
                      borderLeft: isSelected ? '3px solid #c9a96e' : '3px solid transparent' }}>
                    <div>
                      <span style={{ color:'#c9a96e', fontWeight:700, fontSize:'13px' }}>#{order.order_number}</span>
                    </div>
                    <div>
                      <p style={{ fontSize:'13px', fontWeight:600, color:'rgba(255,255,255,0.8)',
                        margin:'0 0 2px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                        {order.first_name} {order.last_name}
                      </p>
                      <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.28)', margin:0 }}>{order.phone}</p>
                    </div>
                    <div>
                      <span style={{ fontSize:'14px', fontWeight:700, color:'#fff', fontFamily:'Georgia,serif' }}>
                        Rs.{parseFloat(order.total).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.45)', margin:0 }}>
                        {new Date(order.created_at).toLocaleDateString('en-PK',{day:'numeric',month:'short'})}
                      </p>
                      <p style={{ fontSize:'10px', color:'rgba(255,255,255,0.22)', margin:'2px 0 0' }}>
                        {new Date(order.created_at).toLocaleTimeString('en-PK',{hour:'2-digit',minute:'2-digit'})}
                      </p>
                    </div>
                    <div><StatusBadge status={order.status} /></div>
                    <div onClick={e => e.stopPropagation()}>
                      {nextStatus && !isDone && !isCancelled ? (
                        <button onClick={() => setConfirmAction({ orderNumber:order.order_number, newStatus:nextStatus })}
                          style={{ padding:'6px 12px', borderRadius:'8px', border:'none', cursor:'pointer',
                            background: nb?.bg||'#c9a96e', color: nb?.color||'#0d1b2a',
                            fontSize:'10px', fontWeight:800, fontFamily:'inherit', whiteSpace:'nowrap',
                            transition:'opacity .15s' }}
                          className="nb-btn">
                          {nextStatus==='Confirmed'?'📱 ':''}{nextStatus}
                        </button>
                      ) : isDone ? (
                        <span style={{ fontSize:'11px', color:'#4ade80', fontWeight:700 }}>✓ Done</span>
                      ) : isCancelled ? (
                        <span style={{ fontSize:'11px', color:'#f87171', fontWeight:700 }}>✗ Cancelled</span>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── ORDER DETAIL PANEL ── */}
        {selectedOrder && (
          <div className="order-detail" style={{ animation:'slideIn .3s ease' }}>
            <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)',
              borderRadius:'16px', overflow:'hidden' }}>

              {/* Header */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start',
                padding:'16px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <h3 style={{ fontSize:'17px', fontWeight:700, color:'#fff',
                    fontFamily:'Georgia,serif', margin:'0 0 3px' }}>
                    #{selectedOrder.order_number}
                  </h3>
                  <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.28)', margin:0 }}>
                    {new Date(selectedOrder.created_at).toLocaleString('en-PK')}
                  </p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="close-btn"
                  style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)',
                    borderRadius:'8px', width:'30px', height:'30px', cursor:'pointer',
                    color:'rgba(255,255,255,0.35)', fontSize:'16px',
                    display:'flex', alignItems:'center', justifyContent:'center', transition:'color .15s' }}>×</button>
              </div>

              <div className="detail-scroll">

                {/* ── STATUS TIMELINE ── */}
                <div style={{ padding:'16px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                  <p style={{ fontSize:'9px', fontWeight:800, letterSpacing:'0.12em',
                    textTransform:'uppercase', color:'rgba(255,255,255,0.2)', marginBottom:'14px' }}>Progress</p>
                  <div style={{ display:'flex', alignItems:'center' }}>
                    {statusFlow.map((status, i) => {
                      const currentIdx = statusFlow.indexOf(selectedOrder.status);
                      const isDone = i <= currentIdx && selectedOrder.status !== 'Cancelled';
                      const isCurrent = i === currentIdx;
                      const s = getStatus(status);
                      return (
                        <React.Fragment key={status}>
                          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0 }}>
                            <div className="tl-dot" style={{
                              background: isDone ? s.bg : 'rgba(255,255,255,0.07)',
                              border: isCurrent ? `2px solid ${s.color}` : isDone ? `1px solid ${s.border}` : '1px solid rgba(255,255,255,0.1)',
                              boxShadow: isCurrent ? `0 0 10px ${s.color}55` : 'none' }}>
                              {isDone ? (
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                                  stroke={s.color} strokeWidth="3">
                                  <polyline points="20 6 9 17 4 12"/>
                                </svg>
                              ) : (
                                <div style={{ width:'6px', height:'6px', borderRadius:'50%',
                                  background:'rgba(255,255,255,0.15)' }} />
                              )}
                            </div>
                            <span style={{ fontSize:'8px', maxWidth:'38px', textAlign:'center',
                              marginTop:'4px', lineHeight:1.2, fontWeight: isCurrent ? 700 : 400,
                              color: isDone ? s.color : 'rgba(255,255,255,0.2)' }}>
                              {status}
                            </span>
                          </div>
                          {i < statusFlow.length-1 && (
                            <div className="tl-line" style={{
                              background: i < statusFlow.indexOf(selectedOrder.status) && selectedOrder.status!=='Cancelled'
                                ? '#c9a96e' : 'rgba(255,255,255,0.08)',
                              marginBottom:'18px' }} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>

                {/* ── STATUS ACTIONS ── */}
                <div style={{ padding:'16px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                  <p style={{ fontSize:'9px', fontWeight:800, letterSpacing:'0.12em',
                    textTransform:'uppercase', color:'rgba(255,255,255,0.2)', marginBottom:'10px' }}>
                    Update Status
                  </p>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginBottom:'12px' }}>
                    {statusFlow.map(status => {
                      const s = getStatus(status);
                      const isCurrent = selectedOrder.status === status;
                      return (
                        <button key={status} disabled={isCurrent}
                          onClick={() => !isCurrent && setConfirmAction({ orderNumber:selectedOrder.order_number, newStatus:status })}
                          style={{ padding:'6px 12px', borderRadius:'100px', cursor: isCurrent?'default':'pointer',
                            fontSize:'11px', fontWeight: isCurrent?700:500, fontFamily:'inherit',
                            transition:'all .15s',
                            background: isCurrent ? s.bg : 'transparent',
                            color: isCurrent ? s.color : 'rgba(255,255,255,0.35)',
                            border: isCurrent ? `1px solid ${s.border}` : '1px solid rgba(255,255,255,0.1)' }}
                          onMouseEnter={e => { if (!isCurrent) { e.currentTarget.style.borderColor='rgba(255,255,255,0.25)'; e.currentTarget.style.color='rgba(255,255,255,0.65)'; }}}
                          onMouseLeave={e => { if (!isCurrent) { e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'; e.currentTarget.style.color='rgba(255,255,255,0.35)'; }}}>
                          {isCurrent?'● ':''}{status}{status==='Confirmed'&&!isCurrent?' 📱':''}
                        </button>
                      );
                    })}
                    {selectedOrder.status!=='Cancelled' && selectedOrder.status!=='Delivered' && (
                      <button onClick={() => setConfirmAction({ orderNumber:selectedOrder.order_number, type:'cancel' })}
                        style={{ padding:'6px 12px', borderRadius:'100px', cursor:'pointer',
                          fontSize:'11px', fontWeight:500, fontFamily:'inherit',
                          background:'transparent', color:'#f87171',
                          border:'1px solid rgba(239,68,68,0.25)', transition:'all .15s' }}
                        onMouseEnter={e => e.currentTarget.style.background='rgba(239,68,68,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                        ✕ Cancel Order
                      </button>
                    )}
                  </div>

                  {/* WhatsApp */}
                  <button onClick={() => sendConfirmWhatsApp(selectedOrder)} className="wa-btn"
                    style={{ width:'100%', background:'rgba(37,211,102,0.08)',
                      border:'1px solid rgba(37,211,102,0.22)', borderRadius:'12px',
                      padding:'10px 14px', cursor:'pointer', fontFamily:'inherit',
                      display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
                      fontSize:'12px', fontWeight:700, color:'#25D366', transition:'background .15s' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Send WhatsApp to Customer
                  </button>
                </div>

                {/* ── CUSTOMER INFO ── */}
                <div style={{ padding:'16px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                  <p style={{ fontSize:'9px', fontWeight:800, letterSpacing:'0.12em',
                    textTransform:'uppercase', color:'rgba(255,255,255,0.2)', marginBottom:'12px' }}>Customer</p>
                  <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                    {[
                      { k:'Name',    v:`${selectedOrder.first_name} ${selectedOrder.last_name}` },
                      { k:'Email',   v: selectedOrder.email   },
                      { k:'Phone',   v: selectedOrder.phone   },
                      { k:'Address', v: selectedOrder.address },
                      { k:'City',    v:`${selectedOrder.city}${selectedOrder.province?`, ${selectedOrder.province}`:''}` },
                    ].map((item,i) => (
                      <div key={i} style={{ display:'flex', justifyContent:'space-between',
                        alignItems:'flex-start', gap:'12px' }}>
                        <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.28)', flexShrink:0 }}>{item.k}</span>
                        <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.7)', fontWeight:500,
                          textAlign:'right', wordBreak:'break-word' }}>{item.v||'—'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── PAYMENT ── */}
                <div style={{ padding:'16px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                  <p style={{ fontSize:'9px', fontWeight:800, letterSpacing:'0.12em',
                    textTransform:'uppercase', color:'rgba(255,255,255,0.2)', marginBottom:'12px' }}>Payment</p>
                  <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                    {[
                      { k:'Method',   v: selectedOrder.payment_method==='cod'?'💵 COD':selectedOrder.payment_method==='jazzcash'?'📱 JazzCash':selectedOrder.payment_method==='easypaisa'?'💚 EasyPaisa':'💳 Card' },
                      { k:'Subtotal', v:`Rs.${parseFloat(selectedOrder.subtotal||0).toLocaleString()}` },
                      { k:'Shipping', v: parseFloat(selectedOrder.shipping||0)===0?'FREE':`Rs.${parseFloat(selectedOrder.shipping).toLocaleString()}` },
                    ].map((item,i) => (
                      <div key={i} style={{ display:'flex', justifyContent:'space-between' }}>
                        <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.28)' }}>{item.k}</span>
                        <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.65)', fontWeight:500 }}>{item.v}</span>
                      </div>
                    ))}
                    <div style={{ display:'flex', justifyContent:'space-between',
                      paddingTop:'8px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', fontWeight:700 }}>Total</span>
                      <span style={{ fontSize:'16px', fontWeight:700, color:'#c9a96e',
                        fontFamily:'Georgia,serif' }}>
                        Rs.{parseFloat(selectedOrder.total||0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── ORDER ITEMS ── */}
                <div style={{ padding:'16px' }}>
                  <p style={{ fontSize:'9px', fontWeight:800, letterSpacing:'0.12em',
                    textTransform:'uppercase', color:'rgba(255,255,255,0.2)', marginBottom:'12px' }}>
                    Items ({selectedOrder.items?.length||0})
                  </p>
                  <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                    {selectedOrder.items?.map((item,i) => (
                      <div key={i} style={{ display:'flex', gap:'10px',
                        background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.05)',
                        borderRadius:'12px', padding:'10px' }}>
                        {item.product_image && (
                          <img src={item.product_image} alt={item.product_name}
                            style={{ width:'44px', height:'52px', borderRadius:'8px',
                              objectFit:'cover', background:'rgba(255,255,255,0.08)', flexShrink:0 }} />
                        )}
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ fontSize:'12px', fontWeight:600, color:'rgba(255,255,255,0.8)',
                            margin:'0 0 3px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                            {item.product_name}
                          </p>
                          <p style={{ fontSize:'10px', color:'rgba(255,255,255,0.28)', margin:0 }}>
                            {item.size?`Size: ${item.size} · `:''}Qty: {item.quantity}
                          </p>
                        </div>
                        <span style={{ fontSize:'13px', fontWeight:700, color:'#c9a96e',
                          fontFamily:'Georgia,serif', flexShrink:0 }}>
                          Rs.{parseFloat(item.price*item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}