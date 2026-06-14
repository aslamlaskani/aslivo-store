import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  const addToCart = (product, quantity = 1, size = null) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id && i.size === size);
      if (existing) {
        return prev.map(i =>
          i.id === product.id && i.size === size
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { ...product, quantity, size }];
    });
  };

  const removeFromCart = (id, size) => {
    setCart(prev => prev.filter(i => !(i.id === id && i.size === size)));
  };

  const updateQuantity = (id, size, quantity) => {
    if (quantity < 1) return removeFromCart(id, size);
    setCart(prev =>
      prev.map(i => (i.id === id && i.size === size ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => setCart([]);

  const toggleWishlist = (product) => {
    setWishlist(prev =>
      prev.find(i => i.id === product.id)
        ? prev.filter(i => i.id !== product.id)
        : [...prev, product]
    );
  };

  const isWishlisted = (id) => wishlist.some(i => i.id === id);

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart,
      wishlist,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      toggleWishlist,
      isWishlisted,
      cartCount,
      cartTotal,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used inside CartProvider');
  }
  return context;
}

export default CartContext;