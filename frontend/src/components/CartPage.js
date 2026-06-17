import React, { useState } from 'react';
import { ordersAPI } from '../api';
import { placeholderImg } from '../utils/placeholder';
export default function CartPage({ cart, navigate, removeFromCart, updateQuantity }) {
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = couponApplied ? Math.round(subtotal * (discountPercent / 100)) : 0;
  const shipping = subtotal > 2000 ? 0 : 199;
  const total = subtotal - discount + shipping;

  const handleCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const data = await ordersAPI.validateCoupon(couponCode.toUpperCase());
      setDiscountPercent(data.discount_percent);
      setCouponApplied(true);
    } catch (err) {
      setCouponError(err?.code?.[0] || 'Invalid coupon code');
      setCouponApplied(false);
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCouponApplied(false);
    setCouponCode('');
    setDiscountPercent(0);
    setCouponError('');
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-cream pt-28 font-sans">
        <div className="page-header">
          <h1 className="page-header-title">Your Cart</h1>
        </div>
        <div className="max-w-lg mx-auto px-4 py-24 text-center">
          <div className="text-7xl mb-5">🛍️</div>
          <h2 className="font-display text-4xl font-bold text-navy-500 mb-3">
            Your cart is empty
          </h2>
          <p className="text-gray-400 mb-8">
            Looks like you haven't added anything yet. Let's fix that!
          </p>
          <button className="btn-primary" onClick={() => navigate('shop')}>
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pt-28 font-sans">

      {/* Header */}
      <div className="page-header">
        <h1 className="page-header-title">Your Cart</h1>
        <p className="text-white/50 text-sm">
          {cart.reduce((s, i) => s + i.quantity, 0)} items in your cart
        </p>
      </div>

      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">

            {/* Header Row */}
            <div className="hidden sm:grid grid-cols-2 px-1 text-xs font-bold tracking-widest uppercase text-gray-400">
              <span>Product</span>
              <span className="text-right">Total</span>
            </div>

            {cart.map(item => (
              <div
                key={`${item.id}-${item.size}`}
                className="card flex gap-4 hover:shadow-navy-lg transition-all duration-200"
              >
                {/* Image */}
                <img
                  src={item.images?.[0]}
                  alt={item.name}
                  className="w-20 h-24 md:w-24 md:h-28 rounded-xl object-cover bg-gray-100 flex-shrink-0 cursor-pointer"
                  onClick={() => navigate('product', item)}
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold tracking-widest uppercase text-gold-500 mb-1">
                    {item.category}
                  </p>
                  <h3
                    className="font-display text-lg md:text-xl font-semibold text-navy-500 leading-tight cursor-pointer hover:text-gold-600 transition-colors mb-2"
                    onClick={() => navigate('product', item)}
                  >
                    {item.name}
                  </h3>
                  <div className="flex gap-3 text-xs text-gray-400 flex-wrap mb-3">
                    {item.size && <span>Size: <strong className="text-navy-500">{item.size}</strong></span>}
                    <span>Unit: <strong className="text-navy-500">Rs. {item.price.toLocaleString()}</strong></span>
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center gap-2">
                    <button
                      className="w-8 h-8 rounded-lg border border-gray-200 bg-white text-navy-500 font-bold text-base hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-center"
                      onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                    >
                      −
                    </button>
                    <span className="font-display text-lg font-semibold text-navy-500 w-8 text-center">
                      {item.quantity}
                    </span>
                    <button
                      className="w-8 h-8 rounded-lg border border-gray-200 bg-white text-navy-500 font-bold text-base hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-center"
                      onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Price + Remove */}
                <div className="flex flex-col items-end justify-between flex-shrink-0">
                  <button
                    className="text-gray-300 hover:text-red-500 transition-colors cursor-pointer bg-transparent border-none p-1"
                    onClick={() => removeFromCart(item.id, item.size)}
                    title="Remove item"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14H6L5 6"/>
                      <path d="M10 11v6M14 11v6"/>
                      <path d="M9 6V4h6v2"/>
                    </svg>
                  </button>
                  <p className="font-display text-lg md:text-xl font-bold text-navy-500">
                    Rs. {(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}

            {/* Continue Shopping */}
            <button
              className="flex items-center gap-2 text-sm text-gold-500 font-semibold hover:text-gold-600 transition-colors cursor-pointer bg-transparent border-none p-1"
              onClick={() => navigate('shop')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              Continue Shopping
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card sticky top-32">
              <h3 className="font-display text-2xl font-bold text-navy-500 mb-5 pb-4 border-b border-gray-100">
                Order Summary
              </h3>

              {/* Coupon */}
              <div className="mb-5">
                <label className="input-label">Coupon Code</label>
                <div className="flex gap-2 mb-2">
                  <input
                    className={`input-field uppercase ${couponError ? 'input-error' : ''}`}
                    placeholder="Enter coupon"
                    value={couponCode}
                    onChange={e => { setCouponCode(e.target.value); setCouponError(''); }}
                    disabled={couponApplied}
                  />
                  {couponApplied ? (
                    <button
                      className="bg-red-500 text-white border-none rounded-xl px-4 text-xs font-bold cursor-pointer hover:bg-red-600 transition-colors whitespace-nowrap"
                      onClick={removeCoupon}
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      className={`bg-navy-500 text-gold-500 border-none rounded-xl px-4 text-xs font-bold cursor-pointer transition-colors whitespace-nowrap
                        ${couponLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-navy-600'}`}
                      onClick={handleCoupon}
                      disabled={couponLoading}
                    >
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  )}
                </div>
                {couponApplied && (
                  <p className="text-xs text-green-500 font-semibold">
                    ✓ Coupon applied! {discountPercent}% off
                  </p>
                )}
                {couponError && (
                  <p className="text-xs text-red-500">✗ {couponError}</p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span>Rs. {subtotal.toLocaleString()}</span>
                </div>
                {couponApplied && (
                  <div className="flex justify-between text-sm text-green-500">
                    <span>Discount ({discountPercent}%)</span>
                    <span>− Rs. {discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-green-500 font-semibold' : ''}>
                    {shipping === 0 ? 'FREE' : `Rs. ${shipping}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-gray-400">
                    Add Rs. {(2000 - subtotal).toLocaleString()} more for free shipping
                  </p>
                )}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-4 border-t-2 border-navy-500 mb-5">
                <span className="font-display text-xl font-bold text-navy-500">Total</span>
                <span className="font-display text-3xl font-bold text-navy-500">
                  Rs. {total.toLocaleString()}
                </span>
              </div>

              {/* Checkout Button */}
              <button
                className="btn-primary w-full mb-3 text-center"
                onClick={() => navigate('checkout')}
              >
                Proceed to Checkout
              </button>
              <button
                className="btn-secondary w-full text-center"
                onClick={() => navigate('shop')}
              >
                Continue Shopping
              </button>

              {/* Secure Badges */}
              <div className="flex justify-center gap-4 mt-4 flex-wrap">
                {['🔒 Secure', '✅ Verified', '🚚 Fast Delivery'].map((b, i) => (
                  <span key={i} className="text-xs text-gray-400">{b}</span>
                ))}
              </div>

              {/* Payment Icons */}
              <div className="flex gap-2 justify-center mt-3 flex-wrap">
                {['Visa', 'Mastercard', 'JazzCash', 'EasyPaisa'].map(p => (
                  <span key={p} className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs text-gray-500 font-medium">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}