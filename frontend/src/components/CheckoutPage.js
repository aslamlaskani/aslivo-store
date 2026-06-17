import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../api';
import { placeholderImg } from '../utils/placeholder';
/* ── Payment account details ── */
const PAYMENT_INFO = {
  jazzcash: {
    number: '03258029183',
    name:   'ASLAM FAREED',
    icon:   '📱',
    color:  '#e31e24',
    bg:     '#fff5f5',
    border: '#fecaca',
    instructions: [
      'Open JazzCash app on your phone',
      'Go to "Send Money" or "Mobile Account"',
      `Send Rs. {total} to 03258029183`,
      'Account name: ASLAM FAREED',
      'Take a screenshot of the confirmation',
      'WhatsApp the screenshot to 03258029183',
    ],
  },
  easypaisa: {
    number: '03258029183',
    name:   'ASLAM FAREED',
    icon:   '💚',
    color:  '#00a651',
    bg:     '#f0fdf4',
    border: '#a7f3d0',
    instructions: [
      'Open EasyPaisa app on your phone',
      'Go to "Send Money"',
      `Send Rs. {total} to 03258029183`,
      'Account name: ASLAM FAREED',
      'Take a screenshot of the confirmation',
      'WhatsApp the screenshot to 03258029183',
    ],
  },
  bank: {
    bankName:   'Meezan Bank',
    accName:    'ASLAM FAREED',
    accNumber:  '06070106959774',
    iban:       'PK30MEZN0006070106959774',
    icon:       '🏦',
    color:      '#1d4ed8',
    bg:         '#eff6ff',
    border:     '#bfdbfe',
    instructions: [
      'Transfer Rs. {total} to the account below',
      'Use your order number as payment reference',
      'Take a screenshot of the transfer receipt',
      'WhatsApp the screenshot to 03258029183',
      'Your order will be confirmed within 2 hours',
    ],
  },
};

// ─── CheckoutPage ─────────────────────────────────────────────────────────────
// Props:
//   user — logged-in user object (null if guest).
//   If null, the page redirects to login immediately.
export default function CheckoutPage({ cart, navigate, setCart, user }) {

  // ── ALL hooks must be declared before any early return ─────────────────────
  const [step, setStep]               = useState(1);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading]         = useState(false);
  const [copyMsg, setCopyMsg]         = useState('');
  const [formData, setFormData]       = useState({
    firstName: user?.firstName || '',
    lastName:  user?.lastName  || '',
    email:     user?.email     || '',
    phone:     user?.phone     || '',
    address: '', city: '', province: '', postalCode: '',
  });
  const [errors, setErrors] = useState({});

  // ── Auth guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      navigate('login');
    }
  }, [user, navigate]);

  // Don't render while redirecting
  if (!user) {
    return (
      <div className="min-h-screen bg-cream pt-28 font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🔒</div>
          <p className="text-navy-500 font-semibold text-lg mb-2">Login Required</p>
          <p className="text-gray-400 text-sm mb-6">Please log in to proceed to checkout.</p>
          <button className="btn-primary" onClick={() => navigate('login')}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // ── Derived values (only reached when user is authenticated) ───────────────
  const subtotal = cart.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
  const shipping = subtotal > 2000 ? 0 : 199;
  const total    = subtotal + shipping;

  const provinces = ['Punjab','Sindh','KPK','Balochistan','Islamabad','AJK','Gilgit-Baltistan'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const validateStep1 = () => {
    const e = {};
    if (!formData.firstName.trim()) e.firstName = 'Required';
    if (!formData.lastName.trim())  e.lastName  = 'Required';
    if (!formData.email.includes('@')) e.email  = 'Valid email required';
    if (formData.phone.length < 10)  e.phone    = 'Valid phone required';
    if (!formData.address.trim())    e.address  = 'Required';
    if (!formData.city.trim())       e.city     = 'Required';
    if (!formData.province)          e.province = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2) setStep(3);
  };

  const handlePlaceOrder = async () => {
    // Belt-and-suspenders: re-check auth before placing order
    if (!user) { navigate('login'); return; }

    setLoading(true);
    try {
      const orderData = {
        payment_method: paymentMethod,
        first_name:  formData.firstName,
        last_name:   formData.lastName,
        email:       formData.email,
        phone:       formData.phone,
        address:     formData.address,
        city:        formData.city,
        province:    formData.province,
        postal_code: formData.postalCode,
        subtotal, shipping, discount: 0, total,
        items: cart.map(item => ({
          product:       item.id,
          product_name:  item.name,
          product_image: item.primary_image || item.images?.[0]?.image_url || '',
          size:          item.size  || '',
          color:         item.color || '',
          quantity:      item.quantity,
          price:         item.price,
        })),
      };
      const res   = await ordersAPI.create(orderData);
      const order = res.data?.order || res.data;
      setOrderNumber(order.order_number);
      setOrderPlaced(true);
      setCart([]);
    } catch (err) {
      const d = err?.response?.data;
      setErrors({ general: d?.detail || d?.error || 'Failed to place order. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyMsg(label);
      setTimeout(() => setCopyMsg(''), 2000);
    });
  };

  const paymentMethods = [
    { id:'cod',       label:'Cash on Delivery', icon:'💵', sub:'Pay when delivered' },
    { id:'jazzcash',  label:'JazzCash',          icon:'📱', sub:'03258029183'        },
    { id:'easypaisa', label:'EasyPaisa',          icon:'💚', sub:'03258029183'        },
    { id:'bank',      label:'Bank Transfer',      icon:'🏦', sub:'Meezan Bank'        },
  ];

  const steps = [
    { num:1, label:'Shipping' },
    { num:2, label:'Payment'  },
    { num:3, label:'Review'   },
  ];

  const inp = `input-field`;

  /* ── Copy row component ── */
  const CopyRow = ({ label, value, bold }) => (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
      padding:'8px 0', borderBottom:'1px solid rgba(0,0,0,0.05)' }}>
      <div>
        <p style={{ fontSize:'10px', color:'#888', textTransform:'uppercase',
          letterSpacing:'0.08em', margin:'0 0 1px' }}>{label}</p>
        <p style={{ fontSize:'14px', fontWeight: bold?800:600, color:'#0d1b2a', margin:0,
          fontFamily: bold?'Georgia,serif':'inherit', letterSpacing: bold?'0.02em':0 }}>
          {value}
        </p>
      </div>
      <button
        onClick={() => copyToClipboard(value, label)}
        style={{ padding:'4px 12px', borderRadius:'100px', border:'1px solid #e5e0d8',
          background: copyMsg===label ? '#059669' : '#f8f5f0',
          color: copyMsg===label ? '#fff' : '#6b7280',
          fontSize:'10px', fontWeight:700, cursor:'pointer',
          fontFamily:'inherit', transition:'all .15s', whiteSpace:'nowrap' }}>
        {copyMsg===label ? '✓ Copied' : 'Copy'}
      </button>
    </div>
  );

  /* ════ ORDER PLACED SCREEN ════ */
  if (orderPlaced) {
    const pmLabel = paymentMethod==='cod'       ? 'Cash on Delivery'
                  : paymentMethod==='jazzcash'  ? 'JazzCash'
                  : paymentMethod==='easypaisa' ? 'EasyPaisa'
                  : 'Bank Transfer (Meezan Bank)';

    return (
      <div className="min-h-screen bg-cream pt-28 font-sans">
        <div className="max-w-lg mx-auto px-4 py-12 text-center">
          <div className="w-24 h-24 rounded-full bg-green-100 border-4 border-green-500 flex items-center justify-center mx-auto mb-8">
            <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h1 className="font-display text-4xl font-bold text-navy-500 mb-2">Order Placed! 🎉</h1>
          <p className="text-gray-500 mb-6">Thank you for shopping with Aslivo Store!</p>

          <div className="bg-gold-500/8 border border-gold-500/30 rounded-2xl p-6 mb-5">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Order Number</p>
            <p className="font-display text-4xl font-bold text-gold-500">#{orderNumber}</p>
            <p className="text-xs text-gray-400 mt-2">Save this to track your order</p>
          </div>

          {/* Payment instructions for non-COD */}
          {paymentMethod !== 'cod' && (() => {
            const info = PAYMENT_INFO[paymentMethod];
            return (
              <div style={{ background: info.bg, border:`1px solid ${info.border}`,
                borderRadius:'16px', padding:'20px', marginBottom:'20px', textAlign:'left' }}>
                <p style={{ fontSize:'14px', fontWeight:700, color:'#0d1b2a',
                  marginBottom:'12px', display:'flex', alignItems:'center', gap:'6px' }}>
                  {info.icon} How to complete your payment
                </p>

                {paymentMethod === 'bank' && (
                  <div style={{ background:'#fff', borderRadius:'12px', padding:'14px',
                    marginBottom:'12px', border:'1px solid rgba(0,0,0,0.06)' }}>
                    <CopyRow label="Bank Name"      value={info.bankName}  />
                    <CopyRow label="Account Name"   value={info.accName}   />
                    <CopyRow label="Account Number" value={info.accNumber} bold />
                    <CopyRow label="IBAN"           value={info.iban}      bold />
                  </div>
                )}

                {(paymentMethod==='jazzcash'||paymentMethod==='easypaisa') && (
                  <div style={{ background:'#fff', borderRadius:'12px', padding:'14px',
                    marginBottom:'12px', border:'1px solid rgba(0,0,0,0.06)' }}>
                    <CopyRow label="Account Name"   value={info.name}   />
                    <CopyRow label="Mobile Number"  value={info.number} bold />
                  </div>
                )}

                <div style={{ background:'#fff', borderRadius:'12px', padding:'12px',
                  border:'1px solid rgba(0,0,0,0.06)', marginBottom:'10px' }}>
                  <p style={{ fontSize:'10px', color:'#888', textTransform:'uppercase',
                    letterSpacing:'0.08em', margin:'0 0 3px' }}>Amount to pay</p>
                  <p style={{ fontSize:'24px', fontWeight:800, color:'#0d1b2a',
                    fontFamily:'Georgia,serif', margin:0 }}>
                    Rs. {total.toLocaleString()}
                  </p>
                </div>

                <ol style={{ paddingLeft:'18px', margin:0 }}>
                  {info.instructions.map((step, i) => (
                    <li key={i} style={{ fontSize:'12px', color:'#555', marginBottom:'5px', lineHeight:1.5 }}>
                      {step.replace('{total}', `Rs. ${total.toLocaleString()}`)}
                    </li>
                  ))}
                </ol>
              </div>
            );
          })()}

          <div className="card text-left mb-5">
            {[
              { icon:'📧', label:'Email',     text: formData.email },
              { icon:'🚚', label:'Delivery',  text: `${formData.address}, ${formData.city}` },
              { icon:'💳', label:'Payment',   text: pmLabel },
              { icon:'⏱️', label:'Estimated', text: '3–5 business days' },
              { icon:'📦', label:'Status',    text: 'Pending — We will confirm shortly' },
            ].map((item, i) => (
              <div key={i} className={`flex items-center gap-3 py-3 ${i<4?'border-b border-gray-50':''}`}>
                <span className="text-xl">{item.icon}</span>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest">{item.label}</p>
                  <p className="text-sm text-navy-500 font-medium">{item.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gold-500/6 border border-gold-500/20 rounded-2xl p-4 mb-6">
            <p className="text-sm text-gold-700">
              📱 WhatsApp confirmation will be sent to <strong>{formData.phone}</strong>
            </p>
          </div>

          <div className="flex gap-3 justify-center flex-wrap">
            <button className="btn-primary"   onClick={() => navigate('tracking')}>📦 Track Order</button>
            <button className="btn-secondary" onClick={() => navigate('shop')}>Continue Shopping</button>
          </div>
        </div>
      </div>
    );
  }

  /* ════ CHECKOUT FORM ════ */
  return (
    <div className="min-h-screen bg-cream pt-28 font-sans">

      {/* Header */}
      <div className="bg-gradient-to-br from-navy-500 to-navy-600 py-10 px-4 text-center">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-cream mb-6">Checkout</h1>
        <div className="flex justify-center items-center gap-0">
          {steps.map((s, i) => (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all
                  ${step>s.num?'bg-green-500 text-white':step===s.num?'bg-gold-500 text-navy-500':'bg-white/15 text-white/50'}`}>
                  {step>s.num
                    ? <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                    : s.num}
                </div>
                <span className={`text-xs mt-1.5 font-semibold tracking-widest uppercase
                  ${step>s.num?'text-green-400':step===s.num?'text-gold-500':'text-white/40'}`}>
                  {s.label}
                </span>
              </div>
              {i < 2 && (
                <div className={`w-16 md:w-24 h-0.5 mb-4 transition-all ${step>s.num?'bg-green-500':'bg-white/15'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* ── Form ── */}
        <div className="lg:col-span-2">
          <div className="card">

            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-500">
                ⚠️ {errors.general}
              </div>
            )}

            {/* ── STEP 1: SHIPPING ── */}
            {step === 1 && (
              <div>
                <h2 className="font-display text-2xl font-bold text-navy-500 mb-6 pb-4 border-b border-gray-100">
                  Shipping Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">First Name</label>
                    <input className={`${inp} ${errors.firstName?'input-error':''}`} name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Muhammad" />
                    {errors.firstName && <p className="error-text">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="input-label">Last Name</label>
                    <input className={`${inp} ${errors.lastName?'input-error':''}`} name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Ali" />
                    {errors.lastName && <p className="error-text">{errors.lastName}</p>}
                  </div>
                  <div>
                    <label className="input-label">Email</label>
                    <input className={`${inp} ${errors.email?'input-error':''}`} name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" />
                    {errors.email && <p className="error-text">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="input-label">Phone (WhatsApp)</label>
                    <input className={`${inp} ${errors.phone?'input-error':''}`} name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="03001234567" />
                    {errors.phone && <p className="error-text">{errors.phone}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="input-label">Street Address</label>
                    <input className={`${inp} ${errors.address?'input-error':''}`} name="address" value={formData.address} onChange={handleChange} placeholder="House #, Street, Area" />
                    {errors.address && <p className="error-text">{errors.address}</p>}
                  </div>
                  <div>
                    <label className="input-label">City</label>
                    <input className={`${inp} ${errors.city?'input-error':''}`} name="city" value={formData.city} onChange={handleChange} placeholder="Lahore" />
                    {errors.city && <p className="error-text">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="input-label">Province</label>
                    <select className={`${inp} ${errors.province?'input-error':''}`} name="province" value={formData.province} onChange={handleChange}>
                      <option value="">Select Province</option>
                      {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    {errors.province && <p className="error-text">{errors.province}</p>}
                  </div>
                  <div>
                    <label className="input-label">Postal Code</label>
                    <input className={inp} name="postalCode" value={formData.postalCode} onChange={handleChange} placeholder="54000" />
                  </div>
                  <div>
                    <label className="input-label">Country</label>
                    <input className={`${inp} bg-gray-100 text-gray-400 cursor-not-allowed`} value="Pakistan 🇵🇰" disabled />
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <button className="btn-primary" onClick={handleNextStep}>Continue to Payment →</button>
                </div>
              </div>
            )}

            {/* ── STEP 2: PAYMENT ── */}
            {step === 2 && (
              <div>
                <h2 className="font-display text-2xl font-bold text-navy-500 mb-6 pb-4 border-b border-gray-100">
                  Payment Method
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {paymentMethods.map(method => (
                    <div key={method.id}
                      className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all
                        ${paymentMethod===method.id?'border-gold-500 bg-gold-500/5':'border-gray-200 hover:border-gray-300'}`}
                      onClick={() => setPaymentMethod(method.id)}>
                      <span className="text-2xl">{method.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-navy-500">{method.label}</p>
                        <p className="text-xs text-gray-400">{method.sub}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0
                        ${paymentMethod===method.id?'border-gold-500 bg-gold-500':'border-gray-300'}`} />
                    </div>
                  ))}
                </div>

                {paymentMethod === 'cod' && (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">💵</span>
                      <div>
                        <p className="font-semibold text-navy-500 text-sm">Cash on Delivery</p>
                        <p className="text-xs text-gray-400">Pay when your order arrives</p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>✅ Available across Pakistan</p>
                      <p>⚠️ Have exact change ready for the delivery person</p>
                    </div>
                  </div>
                )}

                {paymentMethod === 'jazzcash' && (() => {
                  const info = PAYMENT_INFO.jazzcash;
                  return (
                    <div style={{ background:info.bg, border:`1px solid ${info.border}`, borderRadius:'16px', padding:'18px' }}>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl">📱</span>
                        <div>
                          <p className="font-bold text-navy-500">JazzCash Payment</p>
                          <p className="text-xs text-gray-500">Send payment to the number below</p>
                        </div>
                      </div>
                      <div style={{ background:'#fff', borderRadius:'12px', padding:'14px', marginBottom:'14px', border:'1px solid rgba(0,0,0,0.06)' }}>
                        <CopyRow label="Account Name"  value={info.name}   />
                        <CopyRow label="Mobile Number" value={info.number} bold />
                        <div style={{ paddingTop:'8px' }}>
                          <p style={{ fontSize:'10px', color:'#888', textTransform:'uppercase', letterSpacing:'0.08em', margin:'0 0 3px' }}>Amount</p>
                          <p style={{ fontSize:'22px', fontWeight:800, color:'#0d1b2a', fontFamily:'Georgia,serif', margin:0 }}>Rs. {total.toLocaleString()}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">📸 After payment, WhatsApp the screenshot to <strong>03258029183</strong></p>
                    </div>
                  );
                })()}

                {paymentMethod === 'easypaisa' && (() => {
                  const info = PAYMENT_INFO.easypaisa;
                  return (
                    <div style={{ background:info.bg, border:`1px solid ${info.border}`, borderRadius:'16px', padding:'18px' }}>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl">💚</span>
                        <div>
                          <p className="font-bold text-navy-500">EasyPaisa Payment</p>
                          <p className="text-xs text-gray-500">Send payment to the number below</p>
                        </div>
                      </div>
                      <div style={{ background:'#fff', borderRadius:'12px', padding:'14px', marginBottom:'14px', border:'1px solid rgba(0,0,0,0.06)' }}>
                        <CopyRow label="Account Name"  value={info.name}   />
                        <CopyRow label="Mobile Number" value={info.number} bold />
                        <div style={{ paddingTop:'8px' }}>
                          <p style={{ fontSize:'10px', color:'#888', textTransform:'uppercase', letterSpacing:'0.08em', margin:'0 0 3px' }}>Amount</p>
                          <p style={{ fontSize:'22px', fontWeight:800, color:'#0d1b2a', fontFamily:'Georgia,serif', margin:0 }}>Rs. {total.toLocaleString()}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">📸 After payment, WhatsApp the screenshot to <strong>03258029183</strong></p>
                    </div>
                  );
                })()}

                {paymentMethod === 'bank' && (() => {
                  const info = PAYMENT_INFO.bank;
                  return (
                    <div style={{ background:info.bg, border:`1px solid ${info.border}`, borderRadius:'16px', padding:'18px' }}>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl">🏦</span>
                        <div>
                          <p className="font-bold text-navy-500">Meezan Bank Transfer</p>
                          <p className="text-xs text-gray-500">Direct bank transfer — instant confirmation</p>
                        </div>
                      </div>
                      <div style={{ background:'#fff', borderRadius:'12px', padding:'14px', marginBottom:'14px', border:'1px solid rgba(0,0,0,0.06)' }}>
                        <CopyRow label="Bank"           value={info.bankName}  />
                        <CopyRow label="Account Name"   value={info.accName}   />
                        <CopyRow label="Account Number" value={info.accNumber} bold />
                        <CopyRow label="IBAN"           value={info.iban}      bold />
                        <div style={{ paddingTop:'8px' }}>
                          <p style={{ fontSize:'10px', color:'#888', textTransform:'uppercase', letterSpacing:'0.08em', margin:'0 0 3px' }}>Amount</p>
                          <p style={{ fontSize:'22px', fontWeight:800, color:'#0d1b2a', fontFamily:'Georgia,serif', margin:0 }}>Rs. {total.toLocaleString()}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">📸 After transfer, WhatsApp the receipt to <strong>03258029183</strong>.<br/>Your order will be confirmed within 2 hours.</p>
                    </div>
                  );
                })()}

                <div className="flex justify-between mt-6 gap-3">
                  <button className="btn-secondary" onClick={() => setStep(1)}>← Back</button>
                  <button className="btn-primary"   onClick={handleNextStep}>Review Order →</button>
                </div>
              </div>
            )}

            {/* ── STEP 3: REVIEW ── */}
            {step === 3 && (
              <div>
                <h2 className="font-display text-2xl font-bold text-navy-500 mb-6 pb-4 border-b border-gray-100">
                  Review Your Order
                </h2>

                <div className="bg-gray-50 rounded-2xl p-5 mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold tracking-widest uppercase text-gray-400">Shipping Address</span>
                    <span className="text-xs text-gold-500 cursor-pointer font-semibold" onClick={() => setStep(1)}>Edit</span>
                  </div>
                  <p className="text-sm text-navy-500 leading-relaxed">
                    <strong>{formData.firstName} {formData.lastName}</strong><br/>
                    {formData.address}<br/>
                    {formData.city}, {formData.province} {formData.postalCode}<br/>
                    {formData.phone}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-5 mb-5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold tracking-widest uppercase text-gray-400">Payment Method</span>
                    <span className="text-xs text-gold-500 cursor-pointer font-semibold" onClick={() => setStep(2)}>Edit</span>
                  </div>
                  <p className="text-sm text-navy-500">
                    {paymentMethod==='cod'       ? '💵 Cash on Delivery'
                    :paymentMethod==='jazzcash'  ? '📱 JazzCash — 03258029183'
                    :paymentMethod==='easypaisa' ? '💚 EasyPaisa — 03258029183'
                    :                             '🏦 Bank Transfer — Meezan Bank'}
                  </p>
                </div>

                <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-3">
                  Items ({cart.reduce((s,i)=>s+i.quantity,0)})
                </p>
                <div className="space-y-3 mb-6">
                  {cart.map(item => (
                    <div key={`${item.id}-${item.size}`} className="flex gap-4 items-center py-3 border-b border-gray-50">
                      <img
                      src={item.primary_image||item.images?.[0]?.image_url||item.images?.[0]||placeholderImg(56,64)}
                        className="w-14 h-16 rounded-xl object-cover bg-gray-100 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-navy-500">{item.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {item.size && `Size: ${item.size} · `}Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="font-display text-lg font-bold text-navy-500">
                        Rs. {(parseFloat(item.price) * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                {paymentMethod !== 'cod' && (
                  <div style={{ background:'#fffbeb', border:'1px solid #fcd34d', borderRadius:'14px', padding:'14px', marginBottom:'20px' }}>
                    <p style={{ fontSize:'13px', fontWeight:700, color:'#92400e', margin:'0 0 4px' }}>
                      ⚠️ Important — Complete your payment
                    </p>
                    <p style={{ fontSize:'12px', color:'#78350f', margin:0, lineHeight:1.6 }}>
                      After placing the order, please send{' '}
                      <strong>Rs. {total.toLocaleString()}</strong> via{' '}
                      {paymentMethod==='jazzcash'?'JazzCash':paymentMethod==='easypaisa'?'EasyPaisa':'Meezan Bank'}{' '}
                      and WhatsApp the screenshot to <strong>03258029183</strong> to confirm your order.
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center gap-3 flex-wrap">
                  <button className="btn-secondary" onClick={() => setStep(2)}>← Back</button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className={`px-10 py-4 rounded-xl text-sm font-bold tracking-widest uppercase transition-all border-none cursor-pointer
                      ${loading?'bg-green-400 cursor-not-allowed text-white':'bg-green-500 hover:bg-green-600 text-white shadow-lg'}`}>
                    {loading ? '⏳ Placing Order...' : `✓ Place Order — Rs. ${total.toLocaleString()}`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Summary Sidebar ── */}
        <div className="lg:col-span-1">
          <div className="card sticky top-32">
            <h3 className="font-display text-xl font-bold text-navy-500 mb-5 pb-4 border-b border-gray-100">
              Order Summary
            </h3>
            <div className="space-y-3 mb-4">
              {cart.map(item => (
                <div key={`${item.id}-${item.size}`} className="flex gap-3 items-center">
                  <div className="relative flex-shrink-0">
                    <img
                   src={item.primary_image||item.images?.[0]?.image_url||item.images?.[0]||placeholderImg(48,56)}
                      className="w-12 h-14 rounded-lg object-cover bg-gray-100" />
                    <span className="absolute -top-1.5 -right-1.5 bg-navy-500 text-white w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-navy-500 truncate">{item.name}</p>
                    {item.size && <p className="text-xs text-gray-400">Size: {item.size}</p>}
                  </div>
                  <p className="text-sm font-bold text-navy-500 flex-shrink-0">
                    Rs. {(parseFloat(item.price)*item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>Rs. {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Shipping</span>
                <span className={shipping===0?'text-green-500 font-semibold':''}>
                  {shipping===0?'FREE':`Rs. ${shipping}`}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center pt-4 border-t-2 border-navy-500 mt-3">
              <span className="font-display text-lg font-bold text-navy-500">Total</span>
              <span className="font-display text-2xl font-bold text-navy-500">
                Rs. {total.toLocaleString()}
              </span>
            </div>
            <div className="mt-5 p-4 bg-gray-50 rounded-xl space-y-2">
              {[
                { icon:'🔒', text:'SSL Secured Checkout'    },
                { icon:'✅', text:'100% Authentic Products' },
                { icon:'🔄', text:'7-Day Easy Returns'      },
              ].map((b,i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{b.icon}</span><span>{b.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}