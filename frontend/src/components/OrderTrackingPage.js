import React, { useState } from 'react';
import { ordersAPI } from '../api';

export default function OrderTrackingPage({ navigate }) {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const statusFlow = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered'];

  const statusConfig = {
    Pending: { color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20', dot: 'bg-orange-500' },
    Confirmed: { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', dot: 'bg-blue-500' },
    Packed: { color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20', dot: 'bg-purple-500' },
    Shipped: { color: 'text-gold-600', bg: 'bg-gold-500/10', border: 'border-gold-500/20', dot: 'bg-gold-500' },
    Delivered: { color: 'text-green-600', bg: 'bg-green-500/10', border: 'border-green-500/20', dot: 'bg-green-500' },
    Cancelled: { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', dot: 'bg-red-500' },
  };

  const handleTrack = async () => {
    if (!orderNumber.trim() || !email.trim()) {
      setError('Both order number and email are required');
      return;
    }
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      // ✅ Pass as object, extract .data from response
      const res = await ordersAPI.track({
        order_number: orderNumber.trim(),
        email: email.trim(),
      });
      setOrder(res.data);
    } catch (err) {
      setError('Order not found. Please check your order number and email.');
    } finally {
      setLoading(false);
    }
  };

  const currentStatusIndex = order ? statusFlow.indexOf(order.status) : -1;

  return (
    <div className="min-h-screen bg-cream pt-28 font-sans">

      {/* Header */}
      <div className="page-header">
        <div className="container-custom">
          <p className="section-subtitle text-gold-400 mb-3">Real-time Updates</p>
          <h1 className="page-header-title">Track Your Order</h1>
          <p className="text-white/50 text-sm max-w-md mx-auto">
            Enter your order number and email to get live updates
          </p>
        </div>
      </div>

      <div className="container-custom py-10">

        {/* Search Form */}
        <div className="max-w-xl mx-auto mb-10">
          <div className="card shadow-navy-lg">
            <h2 className="font-display text-2xl font-bold text-navy-500 mb-6 text-center">
              Find Your Order
            </h2>

            <div className="space-y-4">
              <div>
                <label className="input-label">Order Number</label>
                <input
                  className="input-field"
                  placeholder="e.g. ASL1234567"
                  value={orderNumber}
                  onChange={e => { setOrderNumber(e.target.value.toUpperCase()); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleTrack()}
                />
              </div>
              <div>
                <label className="input-label">Email Address</label>
                <input
                  className="input-field"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleTrack()}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-500">
                  ⚠️ {error}
                </div>
              )}

              <button
                className={`w-full py-4 rounded-xl text-sm font-bold tracking-widest uppercase transition-all duration-200 border-none cursor-pointer
                  ${loading
                    ? 'bg-gold-500/50 cursor-not-allowed text-navy-500/50'
                    : 'bg-gradient-to-r from-gold-500 to-gold-600 text-navy-500 hover:shadow-gold active:scale-95'
                  }`}
                onClick={handleTrack}
                disabled={loading}
              >
                {loading ? '⏳ Searching...' : '🔍 Track Order'}
              </button>
            </div>
          </div>
        </div>

        {/* Order Results */}
        {order && (
          <div className="max-w-3xl mx-auto animate-fade-up">

            {/* Order Header */}
            <div className="card mb-5">
              <div className="flex justify-between items-start flex-wrap gap-4 mb-4 pb-4 border-b border-gray-100">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Order Number</p>
                  <h2 className="font-display text-3xl font-bold text-navy-500">
                    #{order.order_number}
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Placed on {new Date(order.created_at).toLocaleDateString('en-PK', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </p>
                </div>
                <div className="text-right">
                  {order.status !== 'Cancelled' ? (
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border
                      ${statusConfig[order.status]?.bg || 'bg-gray-100'}
                      ${statusConfig[order.status]?.color || 'text-gray-500'}
                      ${statusConfig[order.status]?.border || 'border-gray-200'}`}>
                      <span className={`w-2 h-2 rounded-full ${statusConfig[order.status]?.dot || 'bg-gray-400'}`} />
                      {order.status}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-red-500/10 text-red-500 border border-red-500/20">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      Cancelled
                    </span>
                  )}
                  <p className="font-display text-2xl font-bold text-navy-500 mt-2">
                    Rs. {parseFloat(order.total).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Progress Timeline */}
              {order.status !== 'Cancelled' && (
                <div className="mb-2">
                  <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">
                    Order Progress
                  </p>
                  <div className="flex items-center">
                    {statusFlow.map((status, i) => {
                      const isDone = i <= currentStatusIndex;
                      const isCurrent = i === currentStatusIndex;
                      const sc = statusConfig[status];
                      return (
                        <React.Fragment key={status}>
                          <div className="flex flex-col items-center flex-shrink-0">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 mb-1
                              ${isDone ? sc.dot + ' shadow-lg' : 'bg-gray-200'}
                              ${isCurrent ? 'ring-4 ring-offset-2 ring-' + sc.dot : ''}`}>
                              {isDone ? (
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                  <polyline points="20 6 9 17 4 12"/>
                                </svg>
                              ) : (
                                <div className="w-2 h-2 rounded-full bg-gray-400" />
                              )}
                            </div>
                            <span className={`text-xs font-semibold text-center leading-tight
                              ${isDone ? sc.color : 'text-gray-300'}`}
                              style={{ fontSize: '9px', maxWidth: '50px' }}>
                              {status}
                            </span>
                          </div>
                          {i < statusFlow.length - 1 && (
                            <div className={`flex-1 h-0.5 mb-4 transition-all duration-500
                              ${i < currentStatusIndex ? 'bg-gold-500' : 'bg-gray-200'}`}
                            />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">

              {/* Customer Info */}
              <div className="card">
                <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">
                  Customer Details
                </p>
                <div className="space-y-2">
                  {[
                    { label: 'Name', value: `${order.first_name} ${order.last_name}` },
                    { label: 'Email', value: order.email },
                    { label: 'Phone', value: order.phone },
                    { label: 'Address', value: order.address },
                    { label: 'City', value: `${order.city}, ${order.province}` },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between gap-4">
                      <span className="text-xs text-gray-400 flex-shrink-0">{item.label}</span>
                      <span className="text-xs text-navy-500 font-medium text-right">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Info */}
              <div className="card">
                <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">
                  Payment Details
                </p>
                <div className="space-y-2">
                  {[
                    { label: 'Method', value: order.payment_method === 'cod' ? '💵 Cash on Delivery' : order.payment_method === 'jazzcash' ? '📱 JazzCash' : order.payment_method === 'easypaisa' ? '💚 EasyPaisa' : '💳 Card' },
                    { label: 'Subtotal', value: `Rs. ${parseFloat(order.subtotal).toLocaleString()}` },
                    { label: 'Shipping', value: order.shipping === 0 || order.shipping === '0.00' ? 'FREE' : `Rs. ${parseFloat(order.shipping).toLocaleString()}` },
                    { label: 'Total', value: `Rs. ${parseFloat(order.total).toLocaleString()}` },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between gap-4">
                      <span className="text-xs text-gray-400">{item.label}</span>
                      <span className={`text-xs font-medium text-right ${item.label === 'Total' ? 'text-gold-600 font-bold text-sm' : 'text-navy-500'}`}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="card mb-5">
              <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">
                Items Ordered ({order.items?.length})
              </p>
              <div className="space-y-3">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex gap-3 items-center py-2 border-b border-gray-50 last:border-0">
                    {item.product_image && (
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="w-12 h-14 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-navy-500">{item.product_name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.size && `Size: ${item.size} · `}Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-display text-base font-bold text-navy-500 flex-shrink-0">
                      Rs. {parseFloat(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Status History */}
            {order.status_history?.length > 0 && (
              <div className="card">
                <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">
                  Status History
                </p>
                <div className="space-y-3">
                  {order.status_history.map((h, i) => {
                    const sc = statusConfig[h.status] || statusConfig['Pending'];
                    return (
                      <div key={i} className="flex gap-3 items-start">
                        <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${sc.dot}`} />
                        <div className="flex-1">
                          <div className="flex justify-between items-center flex-wrap gap-1">
                            <span className={`text-sm font-semibold ${sc.color}`}>{h.status}</span>
                            <span className="text-xs text-gray-400">
                              {new Date(h.created_at).toLocaleString('en-PK', {
                                day: 'numeric', month: 'short',
                                hour: '2-digit', minute: '2-digit'
                              })}
                            </span>
                          </div>
                          {h.note && <p className="text-xs text-gray-400 mt-0.5">{h.note}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-5 flex-wrap">
              <button className="btn-primary" onClick={() => navigate('shop')}>
                Continue Shopping
              </button>
              <button
                className="btn-secondary"
                onClick={() => { setOrder(null); setOrderNumber(''); setEmail(''); }}
              >
                Track Another Order
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!order && !loading && !error && (
          <div className="max-w-xl mx-auto text-center py-8">
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { icon: '📝', title: 'Enter Details', desc: 'Your order number and email' },
                { icon: '🔍', title: 'We Search', desc: 'Find your order instantly' },
                { icon: '📍', title: 'Live Status', desc: 'See where your order is' },
              ].map((step, i) => (
                <div key={i} className="card text-center">
                  <div className="text-3xl mb-2">{step.icon}</div>
                  <p className="text-xs font-bold text-navy-500 mb-1">{step.title}</p>
                  <p className="text-xs text-gray-400">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}