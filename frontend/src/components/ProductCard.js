import React, { useState } from 'react';

export default function ProductCard({ product, navigate, addToCart, wishlist, toggleWishlist }) {
  const [hovered, setHovered] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const [addedMsg, setAddedMsg] = useState(false);

  const isWishlisted = wishlist?.find(i => i.id === product.id);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product, 1, product.sizes[0]);
    setAddedMsg(true);
    setTimeout(() => setAddedMsg(false), 1800);
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  const cardStyle = {
    background: '#fff',
    borderRadius: '16px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
    boxShadow: hovered
      ? '0 20px 48px rgba(26,26,46,0.14)'
      : '0 2px 12px rgba(26,26,46,0.07)',
    position: 'relative',
  };

  const imgWrapStyle = {
    position: 'relative',
    width: '100%',
    paddingBottom: '115%',
    overflow: 'hidden',
    background: '#f5f4f0',
  };

  const imgStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.5s ease',
    transform: hovered ? 'scale(1.07)' : 'scale(1)',
  };

  const badgeStyle = {
    position: 'absolute',
    top: '12px',
    left: '12px',
    background: product.badge === 'Sale' ? '#c0392b'
      : product.badge === 'New' ? '#1a1a2e'
      : product.badge === 'Best Seller' ? '#c9a96e'
      : '#27ae60',
    color: product.badge === 'Best Seller' ? '#1a1a2e' : '#fff',
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    padding: '4px 10px',
    borderRadius: '20px',
    zIndex: 2,
  };

  const discountBadgeStyle = {
    position: 'absolute',
    top: '12px',
    right: '44px',
    background: '#c0392b',
    color: '#fff',
    fontSize: '10px',
    fontWeight: '700',
    padding: '4px 8px',
    borderRadius: '20px',
    zIndex: 2,
  };

  const wishlistBtnStyle = {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: '34px',
    height: '34px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
    zIndex: 2,
    transition: 'transform 0.2s ease',
  };

  const addToCartBtnStyle = {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    background: addedMsg ? '#27ae60' : '#1a1a2e',
    color: '#fff',
    border: 'none',
    padding: '13px',
    fontSize: '12px',
    fontWeight: '600',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transform: hovered ? 'translateY(0)' : 'translateY(100%)',
    transition: 'transform 0.3s ease, background 0.2s ease',
    zIndex: 2,
    fontFamily: "'DM Sans', sans-serif",
  };

  const bodyStyle = {
    padding: '14px 16px 18px',
  };

  const categoryStyle = {
    fontSize: '10px',
    fontWeight: '600',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    color: '#c9a96e',
    marginBottom: '6px',
  };

  const nameStyle = {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: '8px',
    lineHeight: '1.3',
  };

  const ratingRowStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '10px',
  };

  const starsStyle = {
    display: 'flex',
    gap: '2px',
  };

  const priceRowStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  };

  const priceStyle = {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1a1a2e',
    fontFamily: "'Cormorant Garamond', Georgia, serif",
  };

  const originalPriceStyle = {
    fontSize: '14px',
    color: '#a09e98',
    textDecoration: 'line-through',
  };

  const colorsRowStyle = {
    display: 'flex',
    gap: '6px',
    marginTop: '10px',
  };

  const colorDotStyle = (color) => ({
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    background: color,
    border: '1.5px solid rgba(0,0,0,0.12)',
    cursor: 'pointer',
  });

  const renderStars = (rating) => {
    return [1, 2, 3, 4, 5].map(star => (
      <svg key={star} width="12" height="12" viewBox="0 0 24 24"
        fill={star <= Math.floor(rating) ? '#c9a96e' : '#e8e6e0'}
        stroke={star <= Math.floor(rating) ? '#c9a96e' : '#d0cec8'}
        strokeWidth="1">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ));
  };

  return (
    <div
      style={cardStyle}
      onMouseEnter={() => {
        setHovered(true);
        if (product.images[1]) setImgIndex(1);
      }}
      onMouseLeave={() => {
        setHovered(false);
        setImgIndex(0);
      }}
      onClick={() => navigate('product', product)}
    >
      {/* Image */}
      <div style={imgWrapStyle}>
        <img
          src={product.images[imgIndex]}
          alt={product.name}
          style={imgStyle}
        />

        {/* Badge */}
        {product.badge && <span style={badgeStyle}>{product.badge}</span>}

        {/* Discount */}
        {discount > 0 && (
          <span style={discountBadgeStyle}>-{discount}%</span>
        )}

        {/* Wishlist Button */}
        <button style={wishlistBtnStyle} onClick={handleWishlist}>
          <svg width="16" height="16" fill={isWishlisted ? '#c0392b' : 'none'}
            stroke={isWishlisted ? '#c0392b' : '#6b6960'} strokeWidth="2" viewBox="0 0 24 24">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>

        {/* Add to Cart */}
        <button style={addToCartBtnStyle} onClick={handleAddToCart}>
          {addedMsg ? '✓ Added to Cart' : 'Add to Cart'}
        </button>
      </div>

      {/* Body */}
      <div style={bodyStyle}>
        <div style={categoryStyle}>{product.category} · {product.subCategory}</div>
        <div style={nameStyle}>{product.name}</div>

        {/* Rating */}
        <div style={ratingRowStyle}>
          <div style={starsStyle}>{renderStars(product.rating)}</div>
          <span style={{ fontSize: '12px', color: '#6b6960' }}>
            {product.rating} ({product.reviews})
          </span>
        </div>

        {/* Price */}
        <div style={priceRowStyle}>
          <span style={priceStyle}>Rs. {product.price.toLocaleString()}</span>
          <span style={originalPriceStyle}>Rs. {product.originalPrice.toLocaleString()}</span>
        </div>

        {/* Colors */}
        <div style={colorsRowStyle}>
          {product.colors.slice(0, 4).map((color, i) => (
            <div key={i} style={colorDotStyle(color)} />
          ))}
          {product.colors.length > 4 && (
            <span style={{ fontSize: '11px', color: '#a09e98', alignSelf: 'center' }}>
              +{product.colors.length - 4}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}