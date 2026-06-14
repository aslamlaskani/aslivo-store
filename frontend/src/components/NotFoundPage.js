import React, { useEffect, useState } from 'react';

export default function NotFoundPage({ navigate }) {
  const [count, setCount] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('home');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const suggestions = [
    { icon: '🏠', label: 'Home', page: 'home' },
    { icon: '🛍️', label: 'Shop', page: 'shop' },
    { icon: '🔥', label: 'Hot Sale', page: 'flashsale' },
    { icon: '📦', label: 'Track Order', page: 'tracking' },
    { icon: '❤️', label: 'Wishlist', page: 'wishlist' },
    { icon: '🛒', label: 'Cart', page: 'cart' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a14] via-navy-500 to-[#0a0a14] flex items-center justify-center px-4 py-24 font-sans text-center relative overflow-hidden">

      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gold-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-72 h-72 rounded-full bg-red-500/4 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl w-full">

        {/* 404 Number */}
        <div className="font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-gold-300 to-gold-500 leading-none mb-4 animate-fade-in"
          style={{ fontSize: 'clamp(100px, 20vw, 180px)', letterSpacing: '-4px' }}>
          404
        </div>

        {/* Bouncing Emoji */}
        <div className="text-5xl mb-5 animate-bounce">🔍</div>

        {/* Title */}
        <h1 className="font-display text-3xl md:text-5xl font-bold text-cream mb-3 animate-fade-up">
          Page Not Found
        </h1>

        {/* Description */}
        <p className="text-white/45 text-sm md:text-base mb-3 leading-relaxed max-w-md mx-auto animate-fade-up">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Countdown */}
        <p className="text-gold-500/70 text-sm mb-10 animate-fade-up">
          Redirecting to home in{' '}
          <span className="text-gold-500 font-bold text-lg">{count}</span>
          {' '}seconds...
        </p>

        {/* Main Buttons */}
        <div className="flex gap-3 justify-center flex-wrap mb-12 animate-fade-up">
          <button
            className="btn-primary"
            onClick={() => navigate('home')}
          >
            🏠 Go Home
          </button>
          <button
            className="bg-transparent text-white/70 border border-white/15 rounded-xl px-8 py-4 text-xs font-bold tracking-widest uppercase cursor-pointer hover:border-gold-500/40 hover:text-gold-400 transition-all font-sans"
            onClick={() => navigate('shop')}
          >
            🛍️ Browse Shop
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-7 max-w-xs mx-auto">
          <div className="flex-1 h-px bg-white/[0.08]" />
          <span className="text-xs text-white/25 tracking-widest uppercase">Or go to</span>
          <div className="flex-1 h-px bg-white/[0.08]" />
        </div>

        {/* Quick Links Grid */}
        <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto mb-12">
          {suggestions.map((item, i) => (
            <button
              key={i}
              className="glass rounded-2xl py-4 px-3 cursor-pointer border-none flex flex-col items-center gap-2 hover:bg-gold-500/8 hover:border-gold-500/20 transition-all duration-200 hover:-translate-y-1 group"
              onClick={() => navigate(item.page)}
            >
              <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
                {item.icon}
              </span>
              <span className="text-xs font-semibold tracking-widest uppercase text-white/50 group-hover:text-gold-500 transition-colors">
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* Store Name */}
        <div>
          <div
            className="font-display text-xl font-bold text-gold-500 tracking-widest uppercase mb-1.5 cursor-pointer hover:text-gold-400 transition-colors"
            onClick={() => navigate('home')}
          >
            Aslivo Store
          </div>
          <p className="text-xs text-white/20 tracking-wide">
            Premium Fashion for the Modern Lifestyle
          </p>
        </div>
      </div>
    </div>
  );
}