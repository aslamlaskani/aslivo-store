import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import ShopPage from './components/ShopPage';
import ProductPage from './components/ProductPage';
import CartPage from './components/CartPage';
import CheckoutPage from './components/CheckoutPage';
import OrderTrackingPage from './components/OrderTrackingPage';
import WishlistPage from './components/WishlistPage';
import FlashSalePage from './components/FlashSalePage';
import FlashSaleBanner from './components/FlashSaleBanner';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import LoginPage from './components/LoginPage';
import AccountPage from './components/AccountPage';
import NotFoundPage from './components/NotFoundPage';
import SearchResultsPage from './components/SearchResultsPage';
import { clearTokens, getToken } from './api';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('aslivo_cart') || '[]');
    } catch { return []; }
  });
  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('aslivo_wishlist') || '[]');
    } catch { return []; }
  });
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('aslivo_current_user') || 'null');
    } catch { return null; }
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Persist cart
  useEffect(() => {
    localStorage.setItem('aslivo_cart', JSON.stringify(cart));
  }, [cart]);

  // Persist wishlist
  useEffect(() => {
    localStorage.setItem('aslivo_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Check admin login
  useEffect(() => {
    const adminStatus = localStorage.getItem('adminLoggedIn');
    if (adminStatus === 'true') setIsAdminLoggedIn(true);
  }, []);

  // Check if token exists on load
  useEffect(() => {
    const token = getToken();
    const savedUser = localStorage.getItem('aslivo_current_user');
    if (!token && savedUser) {
      clearTokens();
      setUser(null);
    }
  }, []);

  const navigate = (page, product = null) => {
    setCurrentPage(page);
    if (product) setSelectedProduct(product);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    clearTokens();
    setUser(null);
    navigate('home');
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    navigate('search');
  };

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
      return [...prev, {
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        original_price: product.original_price ? parseFloat(product.original_price) : null,
        category: product.category?.name || product.category_name || product.category,
        category_name: product.category_name || product.category?.name,
        images: product.images?.map(img => img.image_url || img.image) ||
                (product.primary_image ? [product.primary_image] : []),
        primary_image: product.primary_image,
        badge: product.badge,
        rating: product.rating,
        review_count: product.review_count,
        stock: product.stock,
        quantity,
        size,
      }];
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

  const toggleWishlist = (product) => {
    setWishlist(prev =>
      prev.find(i => i.id === product.id)
        ? prev.filter(i => i.id !== product.id)
        : [...prev, {
            id: product.id,
            name: product.name,
            price: parseFloat(product.price),
            original_price: product.original_price ? parseFloat(product.original_price) : null,
            category: product.category?.name || product.category_name || product.category,
            category_name: product.category_name || product.category?.name,
            images: product.images?.map(img => img.image_url || img.image) ||
                    (product.primary_image ? [product.primary_image] : []),
            primary_image: product.primary_image,
            badge: product.badge,
            rating: product.rating,
            review_count: product.review_count,
            stock: product.stock,
          }]
    );
  };

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  // ── ADMIN PAGES ──
  if (currentPage === 'admin') {
    if (!isAdminLoggedIn) {
      return (
        <AdminLogin onLogin={() => {
          setIsAdminLoggedIn(true);
          setCurrentPage('admin');
        }} />
      );
    }
    return (
      <AdminDashboard
        navigate={(page) => {
          if (page === 'home') {
            setIsAdminLoggedIn(false);
            localStorage.removeItem('adminLoggedIn');
          }
          setCurrentPage(page);
        }}
      />
    );
  }

  // ── CUSTOMER PAGES ──
  const pages = {
    home: (
      <HomePage
        navigate={navigate}
        addToCart={addToCart}
        wishlist={wishlist}
        toggleWishlist={toggleWishlist}
      />
    ),
    shop: (
      <ShopPage
        navigate={navigate}
        addToCart={addToCart}
        wishlist={wishlist}
        toggleWishlist={toggleWishlist}
      />
    ),
    product: (
      <ProductPage
        product={selectedProduct}
        navigate={navigate}
        addToCart={addToCart}
        wishlist={wishlist}
        toggleWishlist={toggleWishlist}
      />
    ),
    cart: (
      <CartPage
        cart={cart}
        navigate={navigate}
        removeFromCart={removeFromCart}
        updateQuantity={updateQuantity}
      />
    ),
    checkout: (
      <CheckoutPage
        cart={cart}
        navigate={navigate}
        setCart={setCart}
        user={user}
      />
    ),
    tracking: (
      <OrderTrackingPage navigate={navigate} />
    ),
    wishlist: (
      <WishlistPage
        wishlist={wishlist}
        navigate={navigate}
        addToCart={addToCart}
        toggleWishlist={toggleWishlist}
      />
    ),
    flashsale: (
      <FlashSalePage
        navigate={navigate}
        addToCart={addToCart}
        wishlist={wishlist}
        toggleWishlist={toggleWishlist}
      />
    ),
    login: (
      <LoginPage
        navigate={navigate}
        setUser={setUser}
      />
    ),
    account: (
      <AccountPage
        navigate={navigate}
        user={user}
        handleLogout={handleLogout}
      />
    ),
    search: (
      <SearchResultsPage
        navigate={navigate}
        addToCart={addToCart}
        wishlist={wishlist}
        toggleWishlist={toggleWishlist}
        searchQuery={searchQuery}
      />
    ),
  };

  return (
    <div className="font-sans bg-cream min-h-screen">

      {/* Flash Sale Banner */}
      <FlashSaleBanner navigate={navigate} />

      {/* Navbar */}
      <Navbar
        navigate={navigate}
        cartCount={cartCount}
        currentPage={currentPage}
        wishlist={wishlist}
        user={user}
        handleLogout={handleLogout}
        onSearch={handleSearch}
      />

      {/* Page Content */}
      <main style={{ paddingTop: '44px' }}>
        {pages[currentPage] || <NotFoundPage navigate={navigate} />}
      </main>

      {/* Footer */}
      {currentPage !== 'flashsale' && (
        <Footer navigate={navigate} />
      )}
    </div>
  );
}