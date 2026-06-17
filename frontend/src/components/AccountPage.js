import React, { useState, useEffect, useRef } from 'react';
import { authAPI, ordersAPI } from '../api';
import { placeholderImg } from '../utils/placeholder';

export default function AccountPage({ navigate, user, handleLogout, setUser }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({
    first_name: user?.firstName || '',
    last_name: user?.lastName || '',
    phone: user?.phone || '',
  });
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: '', address: '', city: '', province: '', postal_code: '',
  });

  /* ── profile picture state ── */
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [avatarError, setAvatarError] = useState('');
  const avatarInputRef = useRef(null);

  useEffect(() => {
    if (!user) { navigate('login'); return; }
    loadOrders();
    loadAddresses();
  }, [user]);

  /* ── Safe array extractor ── */
  const toArray = (val) => {
    if (Array.isArray(val)) return val;
    if (val && Array.isArray(val.results)) return val.results;
    if (val && Array.isArray(val.data)) return val.data;
    if (val && Array.isArray(val.orders)) return val.orders;
    return [];
  };

  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await ordersAPI.getMyOrders();
      setOrders(toArray(res?.data ?? res));
    } catch (err) {
      console.error('Failed to load orders:', err);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const loadAddresses = async () => {
    try {
      const res = await authAPI.getAddresses();
      setAddresses(toArray(res?.data ?? res));
    } catch (err) {
      console.error('Failed to load addresses:', err);
      setAddresses([]);
    }
  };

  const handleSaveProfile = async () => {
    setProfileLoading(true);
    setProfileError('');
    try {
      const data = await authAPI.updateProfile(profileForm);
      const updatedUser = {
        ...user,
        firstName: data.user.first_name,
        lastName: data.user.last_name,
        phone: data.user.phone,
      };
      localStorage.setItem('aslivo_current_user', JSON.stringify(updatedUser));
      setProfileSuccess('Profile updated successfully!');
      setEditMode(false);
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (err) {
      setProfileError('Failed to update profile. Try again.');
    } finally {
      setProfileLoading(false);
    }
  };

  /* ── Profile picture upload ──
     Stored as a base64 data URL on the user object in localStorage.
     No backend call needed — works immediately like the admin image preview pattern. */
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarError('');

    if (!file.type.startsWith('image/')) {
      setAvatarError('Please choose an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Image must be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setAvatarPreview(dataUrl);

      const updatedUser = { ...user, avatar: dataUrl };
      localStorage.setItem('aslivo_current_user', JSON.stringify(updatedUser));
      if (typeof setUser === 'function') setUser(updatedUser);
    };
    reader.onerror = () => setAvatarError('Could not read that image. Try another file.');
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview('');
    setAvatarError('');
    const updatedUser = { ...user, avatar: '' };
    localStorage.setItem('aslivo_current_user', JSON.stringify(updatedUser));
    if (typeof setUser === 'function') setUser(updatedUser);
  };

  const handleChangePassword = async () => {
    const e = {};
    if (!passwordForm.current_password) e.current_password = 'Required';
    if (passwordForm.new_password.length < 6) e.new_password = 'Min 6 characters';
    if (passwordForm.new_password !== passwordForm.confirm_password) e.confirm_password = 'Passwords do not match';
    if (Object.keys(e).length > 0) { setPasswordErrors(e); return; }

    setPasswordLoading(true);
    try {
      await authAPI.changePassword(passwordForm);
      setPasswordSuccess('Password changed successfully!');
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (err) {
      setPasswordErrors({ current_password: err?.current_password?.[0] || 'Incorrect password' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.address || !newAddress.city) return;
    setAddressLoading(true);
    try {
      await authAPI.addAddress(newAddress);
      await loadAddresses();
      setNewAddress({ label: '', address: '', city: '', province: '', postal_code: '' });
      setShowAddAddress(false);
    } catch (err) {
      console.error('Failed to add address:', err);
    } finally {
      setAddressLoading(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await authAPI.deleteAddress(id);
      setAddresses(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('Failed to delete address:', err);
    }
  };

  const statusClass = {
    'Pending':   'status-pending',
    'Confirmed': 'status-confirmed',
    'Packed':    'status-packed',
    'Shipped':   'status-shipped',
    'Delivered': 'status-delivered',
    'Cancelled': 'status-cancelled',
  };

  const tabs = [
    { id: 'profile',  icon: '👤', label: 'My Profile'       },
    { id: 'orders',   icon: '📦', label: `Orders (${orders.length})` },
    { id: 'addresses',icon: '📍', label: 'Addresses'         },
    { id: 'password', icon: '🔒', label: 'Change Password'   },
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-cream pt-28 font-sans">

      {/* Header */}
      <div className="bg-gradient-to-br from-navy-500 to-navy-600 py-10 px-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-5 flex-wrap">

            {/* ── Avatar with upload ── */}
            <div className="relative flex-shrink-0 group">
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />

              <button
                onClick={() => avatarInputRef.current?.click()}
                title="Change profile picture"
                className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden flex items-center justify-center text-2xl md:text-3xl font-bold text-navy-500 shadow-gold cursor-pointer border-none p-0 relative"
                style={{
                  background: avatarPreview
                    ? `url(${avatarPreview}) center/cover no-repeat`
                    : 'linear-gradient(135deg,#c9a96e,#b8935a)',
                }}
              >
                {!avatarPreview && (user.firstName?.charAt(0) || user.email?.charAt(0) || '?').toUpperCase()}

                {/* Hover overlay with camera icon */}
                <span
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'rgba(13,27,42,0.55)' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </span>
              </button>

              {avatarPreview && (
                <button
                  onClick={handleRemoveAvatar}
                  title="Remove profile picture"
                  className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center border-2 border-white cursor-pointer"
                  style={{ lineHeight: 1 }}
                >
                  ×
                </button>
              )}
            </div>

            <div>
              <h1 className="font-display text-2xl md:text-4xl font-bold text-cream mb-1">
                {user.firstName || user.lastName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Welcome'}
              </h1>
              <p className="text-sm text-white/50">{user.email}</p>
              {avatarError && (
                <p className="text-xs text-red-300 mt-1">{avatarError}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card sticky top-32">
            <nav className="space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer border-none text-left
                    ${activeTab === tab.id
                      ? 'bg-gold-500/10 text-gold-600 font-semibold'
                      : 'bg-transparent text-gray-500 hover:bg-gray-50'
                    }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="text-lg">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
              <div className="border-t border-gray-100 pt-2 mt-2">
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all cursor-pointer border-none text-left"
                  onClick={handleLogout}
                >
                  <span className="text-lg">🚪</span>
                  Sign Out
                </button>
              </div>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">

          {/* ── PROFILE TAB ── */}
          {activeTab === 'profile' && (
            <div className="card">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                <h2 className="font-display text-2xl font-bold text-navy-500">My Profile</h2>
                <button
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border cursor-pointer transition-all
                    ${editMode
                      ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100'
                      : 'bg-gold-500/10 border-gold-500/20 text-gold-600 hover:bg-gold-500/15'
                    }`}
                  onClick={() => { setEditMode(!editMode); setProfileSuccess(''); setProfileError(''); }}
                >
                  {editMode ? '✕ Cancel' : '✏️ Edit Profile'}
                </button>
              </div>

              {profileSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 text-sm text-green-600">
                  ✅ {profileSuccess}
                </div>
              )}
              {profileError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-500">
                  ⚠️ {profileError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="input-label">First Name</label>
                  {editMode ? (
                    <input className="input-field" value={profileForm.first_name} onChange={e => setProfileForm(p => ({ ...p, first_name: e.target.value }))} />
                  ) : (
                    <p className="text-navy-500 font-medium py-3">{user.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="input-label">Last Name</label>
                  {editMode ? (
                    <input className="input-field" value={profileForm.last_name} onChange={e => setProfileForm(p => ({ ...p, last_name: e.target.value }))} />
                  ) : (
                    <p className="text-navy-500 font-medium py-3">{user.lastName}</p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label className="input-label">Email Address</label>
                <p className="text-gray-400 py-3 text-sm">
                  {user.email} <span className="text-xs text-gray-400">(cannot be changed)</span>
                </p>
              </div>

              <div className="mb-6">
                <label className="input-label">Phone Number</label>
                {editMode ? (
                  <input className="input-field" value={profileForm.phone} onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))} />
                ) : (
                  <p className="text-navy-500 font-medium py-3">{user.phone || '—'}</p>
                )}
              </div>

              {editMode && (
                <button className="btn-primary" onClick={handleSaveProfile} disabled={profileLoading}>
                  {profileLoading ? '⏳ Saving...' : '💾 Save Changes'}
                </button>
              )}
            </div>
          )}

          {/* ── ORDERS TAB ── */}
          {activeTab === 'orders' && (
            <div className="card">
              <h2 className="font-display text-2xl font-bold text-navy-500 mb-6 pb-4 border-b border-gray-100">
                My Orders
              </h2>

              {ordersLoading ? (
                <div className="text-center py-16">
                  <div className="text-4xl mb-4 animate-bounce-slow">📦</div>
                  <p className="text-gray-400">Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">📭</div>
                  <h3 className="font-display text-2xl text-navy-500 mb-2">No orders yet</h3>
                  <p className="text-gray-400 mb-6">You haven't placed any orders yet</p>
                  <button className="btn-primary" onClick={() => navigate('shop')}>Start Shopping</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div
                      key={order.id}
                      className="border border-gray-100 rounded-2xl overflow-hidden hover:shadow-navy transition-all duration-200"
                    >
                      {/* Order Header */}
                      <div className="bg-gray-50 px-5 py-4 flex justify-between items-center flex-wrap gap-3">
                        <div>
                          <span className="font-display text-lg font-bold text-navy-500">
                            #{order.order_number}
                          </span>
                          <span className="text-xs text-gray-400 ml-3">
                            {new Date(order.created_at).toLocaleDateString('en-PK', {
                              day: 'numeric', month: 'long', year: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className={statusClass[order.status] || 'badge-gold'}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {order.status}
                          </span>
                          <button
                            className="text-xs font-semibold text-gold-600 border border-gold-500/30 px-3 py-1.5 rounded-lg hover:bg-gold-500/10 transition-all cursor-pointer bg-transparent"
                            onClick={() => navigate('tracking')}
                          >
                            🔍 Track
                          </button>
                        </div>
                      </div>

                      {/* Order Body */}
                      <div className="px-5 py-4">
                        <div className="flex justify-between items-center flex-wrap gap-2">
                          <span className="text-sm text-gray-500">
                            {order.items_count} item{order.items_count !== 1 ? 's' : ''} ·{' '}
                            {order.payment_method === 'cod'       ? 'Cash on Delivery' :
                             order.payment_method === 'jazzcash'  ? 'JazzCash' :
                             order.payment_method === 'easypaisa' ? 'EasyPaisa' : 'Card'}
                          </span>
                          <span className="font-display text-xl font-bold text-navy-500">
                            Rs. {parseFloat(order.total).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── ADDRESSES TAB ── */}
          {activeTab === 'addresses' && (
            <div className="card">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                <h2 className="font-display text-2xl font-bold text-navy-500">Saved Addresses</h2>
                <button
                  className="btn-primary text-xs px-5 py-2.5"
                  onClick={() => setShowAddAddress(!showAddAddress)}
                >
                  {showAddAddress ? '✕ Cancel' : '+ Add Address'}
                </button>
              </div>

              {showAddAddress && (
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 mb-6">
                  <h3 className="font-display text-lg font-semibold text-navy-500 mb-4">New Address</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="input-label">Label (e.g. Home, Office)</label>
                      <input className="input-field" placeholder="Home" value={newAddress.label} onChange={e => setNewAddress(p => ({ ...p, label: e.target.value }))} />
                    </div>
                    <div>
                      <label className="input-label">Street Address *</label>
                      <input className="input-field" placeholder="House #, Street, Area" value={newAddress.address} onChange={e => setNewAddress(p => ({ ...p, address: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="input-label">City *</label>
                        <input className="input-field" placeholder="Lahore" value={newAddress.city} onChange={e => setNewAddress(p => ({ ...p, city: e.target.value }))} />
                      </div>
                      <div>
                        <label className="input-label">Province</label>
                        <select className="input-field" value={newAddress.province} onChange={e => setNewAddress(p => ({ ...p, province: e.target.value }))}>
                          <option value="">Select</option>
                          {['Punjab','Sindh','KPK','Balochistan','Islamabad','AJK','Gilgit-Baltistan'].map(p => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="input-label">Postal Code</label>
                      <input className="input-field" placeholder="54000" value={newAddress.postal_code} onChange={e => setNewAddress(p => ({ ...p, postal_code: e.target.value }))} />
                    </div>
                    <button className="btn-primary" onClick={handleAddAddress} disabled={addressLoading}>
                      {addressLoading ? '⏳ Saving...' : '💾 Save Address'}
                    </button>
                  </div>
                </div>
              )}

              {addresses.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-3">📍</div>
                  <p className="text-gray-400">No saved addresses yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map(addr => (
                    <div key={addr.id} className="bg-gray-50 border border-gray-100 rounded-2xl p-5 relative">
                      {addr.label && (
                        <span className="badge-gold text-xs mb-3 inline-block uppercase tracking-widest">
                          {addr.label}
                        </span>
                      )}
                      <p className="text-sm text-navy-500 leading-relaxed">
                        {addr.address}<br />
                        {addr.city}{addr.province ? `, ${addr.province}` : ''}
                        {addr.postal_code ? ` ${addr.postal_code}` : ''}
                      </p>
                      <button
                        className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition-colors text-xl bg-transparent border-none cursor-pointer"
                        onClick={() => handleDeleteAddress(addr.id)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── CHANGE PASSWORD TAB ── */}
          {activeTab === 'password' && (
            <div className="card">
              <h2 className="font-display text-2xl font-bold text-navy-500 mb-6 pb-4 border-b border-gray-100">
                Change Password
              </h2>

              {passwordSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 text-sm text-green-600">
                  ✅ {passwordSuccess}
                </div>
              )}

              <div className="max-w-md space-y-4">
                <div>
                  <label className="input-label">Current Password</label>
                  <input
                    className={`input-field ${passwordErrors.current_password ? 'input-error' : ''}`}
                    type="password" placeholder="Enter current password"
                    value={passwordForm.current_password}
                    onChange={e => { setPasswordForm(p => ({ ...p, current_password: e.target.value })); setPasswordErrors(p => ({ ...p, current_password: '' })); }}
                  />
                  {passwordErrors.current_password && <p className="error-text">{passwordErrors.current_password}</p>}
                </div>

                <div>
                  <label className="input-label">New Password</label>
                  <input
                    className={`input-field ${passwordErrors.new_password ? 'input-error' : ''}`}
                    type="password" placeholder="Min 6 characters"
                    value={passwordForm.new_password}
                    onChange={e => { setPasswordForm(p => ({ ...p, new_password: e.target.value })); setPasswordErrors(p => ({ ...p, new_password: '' })); }}
                  />
                  {passwordErrors.new_password && <p className="error-text">{passwordErrors.new_password}</p>}
                </div>

                <div>
                  <label className="input-label">Confirm New Password</label>
                  <input
                    className={`input-field ${passwordErrors.confirm_password ? 'input-error' : ''}`}
                    type="password" placeholder="Repeat new password"
                    value={passwordForm.confirm_password}
                    onChange={e => { setPasswordForm(p => ({ ...p, confirm_password: e.target.value })); setPasswordErrors(p => ({ ...p, confirm_password: '' })); }}
                  />
                  {passwordErrors.confirm_password && <p className="error-text">{passwordErrors.confirm_password}</p>}
                </div>

                <button className="btn-primary" onClick={handleChangePassword} disabled={passwordLoading}>
                  {passwordLoading ? '⏳ Updating...' : '🔒 Update Password'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}