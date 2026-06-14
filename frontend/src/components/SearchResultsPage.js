import React, { useState, useEffect } from 'react';
import { productsAPI } from '../api';

export default function SearchResultsPage({ navigate, addToCart, wishlist, toggleWishlist, searchQuery: initialQuery }) {
  const [query, setQuery] = useState(initialQuery || '');
  const [inputValue, setInputValue] = useState(initialQuery || '');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [sortBy, setSortBy] = useState('relevance');
  const [recentSearches, setRecentSearches] = useState(
    JSON.parse(localStorage.getItem('aslivo_recent_searches') || '[]')
  );

  const suggestions = ['T-Shirts', 'Dresses', 'Sneakers', 'Bags', 'Jackets', 'Jeans', 'Watches', 'Hoodies'];

  const popularCategories = [
    { icon: '👔', label: 'Men', query: 'men' },
    { icon: '👗', label: 'Women', query: 'women' },
    { icon: '👜', label: 'Bags', query: 'bags' },
    { icon: '👟', label: 'Sneakers', query: 'sneakers' },
    { icon: '💍', label: 'Jewelry', query: 'jewelry' },
    { icon: '🧥', label: 'Jackets', query: 'jackets' },
  ];

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      setInputValue(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    if (query.trim()) {
      searchProducts(query);
    } else {
      setProducts([]);
      setTotalCount(0);
    }
  }, [query, sortBy]);

  const searchProducts = async (q) => {
    setLoading(true);
    try {
      let results = [];
      // Try search endpoint first
      const data = await productsAPI.search(q);
      results = data.results || data;

      // Sort results
      if (sortBy === 'price-low') results = [...results].sort((a, b) => a.price - b.price);
      else if (sortBy === 'price-high') results = [...results].sort((a, b) => b.price - a.price);
      else if (sortBy === 'rating') results = [...results].sort((a, b) => b.rating - a.rating);
      else if (sortBy === 'newest') results = [...results].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setProducts(results);
      setTotalCount(results.length);
    } catch (err) {
      console.error('Search failed:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (q) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setQuery(trimmed);
    saveRecentSearch(trimmed);
  };

  const saveRecentSearch = (q) => {
    const updated = [q, ...recentSearches.filter(s => s !== q)].slice(0, 6);
    setRecentSearches(updated);
    localStorage.setItem('aslivo_recent_searches', JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('aslivo_recent_searches');
  };

  const isInWishlist = (id) => wishlist?.some(i => i.id === id);

  const ProductCard = ({ product }) => (
    <div className="product-card group">
      <div className="relative overflow-hidden aspect-[3/4]">
        <img
          src={product.primary_image || 'https://via.placeholder.com/300x400'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
          onClick={() => navigate('product', product)}
        />
        {product.badge && (
          <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-lg text-xs font-black uppercase
            ${product.badge === 'sale' ? 'bg-red-500 text-white' :
              product.badge === 'new' ? 'bg-green-500 text-white' :
              'bg-gold-500 text-navy-500'}`}>
            {product.badge}
          </span>
        )}
        <button
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer border-none hover:scale-110"
          onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
        >
          <svg className="w-4 h-4"
            fill={isInWishlist(product.id) ? '#e74c3c' : 'none'}
            stroke={isInWishlist(product.id) ? '#e74c3c' : '#6b6960'}
            strokeWidth="2" viewBox="0 0 24 24">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
        <div className="absolute bottom-0 left-0 right-0 bg-navy-500/90 py-2.5 px-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            className="w-full text-xs font-bold tracking-widest uppercase text-gold-500 cursor-pointer bg-transparent border-none"
            onClick={(e) => { e.stopPropagation(); addToCart(product, 1, null); }}
          >
            + Quick Add
          </button>
        </div>
      </div>
      <div className="p-4 cursor-pointer" onClick={() => navigate('product', product)}>
        <p className="text-xs font-semibold tracking-widest uppercase text-gold-500 mb-1">{product.category_name}</p>
        <h3 className="font-display text-base font-semibold text-navy-500 leading-tight mb-2 line-clamp-2">{product.name}</h3>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-display text-lg font-bold text-navy-500">
            Rs. {parseFloat(product.price).toLocaleString()}
          </span>
          {product.original_price && parseFloat(product.original_price) > parseFloat(product.price) && (
            <span className="text-xs text-gray-400 line-through">
              Rs. {parseFloat(product.original_price).toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl overflow-hidden animate-pulse">
      <div className="bg-gray-200 aspect-[3/4]" />
      <div className="p-4 space-y-2">
        <div className="bg-gray-200 h-3 w-16 rounded" />
        <div className="bg-gray-200 h-4 w-full rounded" />
        <div className="bg-gray-200 h-5 w-24 rounded" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream pt-28 font-sans">

      {/* Header */}
      <div className="page-header">
        <div className="container-custom">
          <h1 className="page-header-title">
            {query ? `Results for "${query}"` : 'Search Products'}
          </h1>
          {query && (
            <p className="text-white/50 text-sm mt-1">
              {totalCount} product{totalCount !== 1 ? 's' : ''} found
            </p>
          )}
        </div>

        {/* Search Input */}
        <div className="container-custom mt-6">
          <div className="max-w-2xl mx-auto flex gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-500" fill="none" stroke="#c9a96e" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                className="w-full bg-white/[0.08] border border-gold-500/30 rounded-2xl pl-12 pr-10 py-3.5 text-white placeholder-white/30 outline-none focus:border-gold-500/60 text-sm font-sans"
                placeholder="Search products, categories..."
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch(inputValue)}
                autoFocus
              />
              {inputValue && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 bg-transparent border-none cursor-pointer text-xl"
                  onClick={() => { setInputValue(''); setQuery(''); }}
                >
                  ×
                </button>
              )}
            </div>
            <button
              className="bg-gradient-to-r from-gold-500 to-gold-600 text-navy-500 font-bold text-sm px-6 rounded-2xl border-none cursor-pointer hover:shadow-gold transition-all whitespace-nowrap"
              onClick={() => handleSearch(inputValue)}
            >
              Search
            </button>
          </div>

          {/* Suggestion Tags */}
          {!query && (
            <div className="max-w-2xl mx-auto mt-4 flex flex-wrap gap-2 justify-center">
              {suggestions.map(s => (
                <button
                  key={s}
                  className="bg-white/[0.06] border border-white/10 rounded-2xl px-3 py-1.5 text-xs text-white/60 hover:text-gold-500 hover:border-gold-500/30 hover:bg-gold-500/6 transition-all cursor-pointer font-sans"
                  onClick={() => { setInputValue(s); handleSearch(s); }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="container-custom py-8">

        {/* No Query State */}
        {!query && (
          <div className="space-y-10">

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-display text-2xl font-bold text-navy-500">Recent Searches</h3>
                  <button
                    className="text-sm text-gold-500 font-semibold hover:text-gold-600 cursor-pointer bg-transparent border-none"
                    onClick={clearRecentSearches}
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {recentSearches.map((s, i) => (
                    <button
                      key={i}
                      className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-4 py-2 text-sm text-gray-600 hover:border-gold-500/40 hover:text-gold-600 transition-all cursor-pointer font-sans shadow-sm"
                      onClick={() => { setInputValue(s); handleSearch(s); }}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                      </svg>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Categories */}
            <div>
              <h3 className="font-display text-2xl font-bold text-navy-500 mb-5">Popular Categories</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {popularCategories.map((cat, i) => (
                  <div
                    key={i}
                    className="card text-center cursor-pointer hover:-translate-y-1 hover:shadow-navy-lg transition-all duration-200 group"
                    onClick={() => { setInputValue(cat.query); handleSearch(cat.query); }}
                  >
                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">{cat.icon}</div>
                    <p className="text-sm font-semibold text-navy-500">{cat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {query && (
          <>
            {/* Toolbar */}
            <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
              <p className="text-sm text-gray-500">
                Showing <strong className="text-navy-500">{totalCount}</strong> results for{' '}
                <strong className="text-navy-500">"{query}"</strong>
              </p>
              <select
                className="input-field py-2 text-sm w-auto"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                <option value="relevance">Most Relevant</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="newest">Newest First</option>
              </select>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {products.map(product => <ProductCard key={product.id} product={product} />)}
              </div>
            ) : (
              /* No Results */
              <div className="card text-center py-16">
                <div className="text-6xl mb-5">🔍</div>
                <h2 className="font-display text-3xl font-bold text-navy-500 mb-3">
                  No results for "{query}"
                </h2>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  Try different keywords or browse our categories
                </p>

                {/* Search Tips */}
                <div className="bg-gray-50 rounded-2xl p-5 max-w-sm mx-auto mb-6 text-left">
                  <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-3">Search Tips:</p>
                  {[
                    'Check spelling of your keyword',
                    'Try more general terms',
                    'Use category names like "men" or "women"',
                    'Search by material like "cotton" or "leather"',
                  ].map((tip, i) => (
                    <p key={i} className="text-sm text-gray-500 flex items-center gap-2 mb-2">
                      <span className="text-gold-500 font-bold">•</span> {tip}
                    </p>
                  ))}
                </div>

                {/* Try These */}
                <div className="mb-6">
                  <p className="text-sm text-gray-400 mb-3">Try searching for:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {suggestions.slice(0, 6).map(s => (
                      <button
                        key={s}
                        className="bg-white border border-gray-200 rounded-2xl px-4 py-2 text-sm text-gray-600 hover:border-gold-500 hover:text-gold-600 transition-all cursor-pointer font-sans"
                        onClick={() => { setInputValue(s); handleSearch(s); }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <button className="btn-primary" onClick={() => navigate('shop')}>
                  Browse All Products
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}