import React from 'react';
import logo from '../assets/logo.png';
import { placeholderImg } from '../utils/placeholder';
export default function Footer({ navigate }) {

  const shopLinks = [
    { label: 'Men', page: 'shop' },
    { label: 'Women', page: 'shop' },
    { label: 'Accessories', page: 'shop' },
    { label: 'Footwear', page: 'shop' },
    { label: 'New Arrivals', page: 'shop' },
    { label: 'Flash Sale 🔥', page: 'flashsale' },
  ];

  const helpLinks = [
    { label: 'FAQ', page: 'home' },
    { label: 'Shipping & Delivery', page: 'home' },
    { label: 'Returns & Exchanges', page: 'home' },
    { label: 'Size Guide', page: 'home' },
    { label: '📦 Track Your Order', page: 'tracking' },
    { label: 'Contact Us', page: 'home' },
  ];

  const accountLinks = [
    { label: 'My Account', page: 'account' },
    { label: 'My Orders', page: 'account' },
    { label: 'Wishlist', page: 'wishlist' },
    { label: 'Sign In', page: 'login' },
  ];

  const socialLinks = [
    {
      name: 'Instagram',
      href: '#',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
          <circle cx="12" cy="12" r="4"/>
          <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
        </svg>
      ),
    },
    {
      name: 'Facebook',
      href: '#',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
        </svg>
      ),
    },
    {
      name: 'Twitter',
      href: '#',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
    },
    {
      name: 'WhatsApp',
      href: 'https://wa.me/923258029183',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      ),
    },
  ];

  return (
    <footer className="bg-navy-500 font-sans">

      {/* Newsletter Strip */}
      <div className="bg-gradient-to-r from-gold-600 to-gold-500">
        <div className="container-custom py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-5">
            <div>
              <h3 className="font-display text-xl md:text-2xl font-bold text-navy-500 mb-1">
                Get 10% Off Your First Order!
              </h3>
              <p className="text-navy-500/70 text-sm">
                Subscribe to our newsletter for exclusive offers. No spam, ever.
              </p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <input
                className="flex-1 md:w-64 bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-navy-500 placeholder-navy-500/50 outline-none focus:bg-white/30 text-sm font-sans"
                type="email"
                placeholder="your@email.com"
              />
              <button className="bg-navy-500 text-gold-500 font-bold text-xs tracking-widest uppercase px-6 py-3 rounded-xl border-none cursor-pointer hover:bg-navy-600 transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-custom pt-14 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-gold-500/20">

          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div
              className="flex items-center gap-2.5 cursor-pointer mb-5 group w-fit"
              onClick={() => navigate('home')}
            >
              <img
                src={logo}
                alt="Aslivo"
                className="h-10 w-auto object-contain group-hover:opacity-80 transition-opacity"
              />
              <span className="font-display text-2xl font-bold text-gold-500 tracking-widest uppercase">
                Aslivo
              </span>
            </div>

            <p className="text-white/40 text-sm leading-relaxed mb-6 max-w-xs">
              Premium fashion for the modern Pakistani lifestyle. Quality you can feel, style you can trust.
            </p>

            {/* Social Links — fixed */}
           

            {/* Trust Badges */}
            <div className="flex gap-5 flex-wrap mb-5">
              {[
                { icon: '🔒', text: 'Secure Payments' },
                { icon: '🔄', text: 'Free Returns' },
              ].map((b, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-white/40">
                  <span>{b.icon}</span>
                  <span>{b.text}</span>
                </div>
              ))}
            </div>

            {/* Contact */}
            <div className="space-y-2">
              {[
                { icon: '📱', text: '+92 325 8029183' },
                { icon: '📧', text: 'support@aslivostore.com' },
                { icon: '📍', text: 'Rawalpindi, Pakistan' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-white/35">
                  <span>{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase text-gold-500/80 mb-5">
              Shop
            </h4>
            <ul className="space-y-3">
              {shopLinks.map((link, i) => (
                <li key={i}>
                  <button
                    className="text-sm text-white/40 hover:text-gold-500 transition-colors cursor-pointer bg-transparent border-none text-left"
                    onClick={() => navigate(link.page)}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Links */}
          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase text-gold-500/80 mb-5">
              Help
            </h4>
            <ul className="space-y-3">
              {helpLinks.map((link, i) => (
                <li key={i}>
                  <button
                    className="text-sm text-white/40 hover:text-gold-500 transition-colors cursor-pointer bg-transparent border-none text-left"
                    onClick={() => navigate(link.page)}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase text-gold-500/80 mb-5">
              Account
            </h4>
            <ul className="space-y-3 mb-8">
              {accountLinks.map((link, i) => (
                <li key={i}>
                  <button
                    className="text-sm text-white/40 hover:text-gold-500 transition-colors cursor-pointer bg-transparent border-none text-left"
                    onClick={() => navigate(link.page)}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>

            <h4 className="text-xs font-bold tracking-widest uppercase text-gold-500/80 mb-3">
              Coming Soon
            </h4>
            <div className="space-y-2">
              {['App Store', 'Google Play'].map((store, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2"
                >
                  <span className="text-base">{i === 0 ? '🍎' : '🤖'}</span>
                  <div>
                    <p className="text-xs text-white/25 leading-none">Download on</p>
                    <p className="text-xs font-semibold text-white/50">{store}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6 flex-wrap">
          <p
            className="text-xs text-white/25 tracking-wide cursor-default select-none"
            onDoubleClick={() => navigate('admin')}
          >
            © 2025 Aslivo Store. All rights reserved.
          </p>

          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="text-xs text-white/20 mr-1">We accept:</span>
            {['Visa', 'Mastercard', 'JazzCash', 'EasyPaisa', 'COD'].map((p, i) => (
              <span
                key={i}
                className="bg-white/[0.06] border border-white/[0.08] rounded-lg px-2.5 py-1 text-xs text-white/40 font-medium"
              >
                {p}
              </span>
            ))}
          </div>

          <div className="flex gap-5 flex-wrap justify-center">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item, i) => (
              <button
                key={i}
                className="text-xs text-white/25 hover:text-white/50 transition-colors cursor-pointer bg-transparent border-none"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}