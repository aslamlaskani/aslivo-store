import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const getToken    = () => localStorage.getItem('access_token');
export const setTokens   = (access, refresh) => {
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
};
export const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

/* ── Request interceptor: attach Bearer token ── */
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    if (config.data instanceof FormData) delete config.headers['Content-Type'];
    return config;
  },
  (error) => Promise.reject(error)
);

/* ── Response interceptor: auto-refresh token ── */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        try {
          const res = await axios.post(`${BASE_URL}/api/token/refresh/`, { refresh });
          setTokens(res.data.access, refresh);
          originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
          return api(originalRequest);
        } catch {
          clearTokens();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

/* ═══════════════════════════════════════
   AUTH
═══════════════════════════════════════ */
export const authAPI = {
  login:          (data) => api.post('/api/auth/login/', data),
  register:       (data) => api.post('/api/auth/register/', data),
  getProfile:     ()     => api.get('/api/auth/profile/'),
  updateProfile:  (data) => api.put('/api/auth/profile/', data),
  changePassword: (data) => api.post('/api/auth/change-password/', data),
  deleteAccount:  ()     => api.delete('/api/auth/delete/'),
  getAddresses:   ()     => api.get('/api/auth/addresses/'),
  addAddress:     (data) => api.post('/api/auth/addresses/', data),
  deleteAddress:  (id)   => api.delete(`/api/auth/addresses/${id}/`),

  /* Email OTP */
  sendEmailOTP:       (data) => api.post('/api/auth/otp/email/send/', data),
  verifyEmailOTP:     (data) => api.post('/api/auth/otp/email/verify/', data),

  /* Forgot / Reset password — email */
  forgotPasswordEmail: (data) => api.post('/api/auth/password/forgot/', data),
  resetPasswordEmail:  (data) => api.post('/api/auth/password/reset/email/', data),

  /* WhatsApp OTP */
  sendWhatsAppOTP:    (data) => api.post('/api/auth/otp/whatsapp/send/', data),
  verifyWhatsAppOTP:  (data) => api.post('/api/auth/otp/whatsapp/verify/', data),

  /* Forgot / Reset password — phone */
  forgotPasswordPhone: (data) => api.post('/api/auth/password/forgot/phone/', data),
  resetPasswordPhone:  (data) => api.post('/api/auth/password/reset/phone/', data),

  /* Google OAuth */
  googleLogin: (data) => api.post('/api/auth/google/', data),
};

/* ═══════════════════════════════════════
   PRODUCTS
═══════════════════════════════════════ */
export const productsAPI = {
  /* public */
  getAll:        (params) => api.get('/api/products/', { params }),
  getOne:        (id)     => api.get(`/api/products/${id}/`),
  getCategories: ()       => api.get('/api/products/categories/'),
  getFlashSale:  ()       => api.get('/api/products/flash-sale/'),
  getFeatured:   ()       => api.get('/api/products/featured/'),
  getNewArrivals:()       => api.get('/api/products/new-arrivals/'),
  search:        (query)  => api.get('/api/products/', { params: { search: query } }),
  addReview:     (id, data) => api.post(`/api/products/${id}/reviews/`, data),

  /* admin — products */
  create: (data) => api.post('/api/products/create/', data),
  update: (id, data) => api.patch(`/api/products/${id}/update/`, data),
  delete: (id)   => api.delete(`/api/products/${id}/update/`),

  /* admin — categories */
  createCategory: (data)       => api.post(`/api/products/categories/`, data),
  updateCategory: (id, data)   => api.patch(`/api/products/categories/${id}/`, data),
  deleteCategory: (id)         => api.delete(`/api/products/categories/${id}/`),
};

/* ═══════════════════════════════════════
   ORDERS
═══════════════════════════════════════ */
export const ordersAPI = {
  /* customer */
  create:         (data)        => api.post('/api/orders/', data),
  getMyOrders:    ()            => api.get('/api/orders/my-orders/'),
  getOne:         (orderNumber) => api.get(`/api/orders/${orderNumber}/`),
  track:          (data)        => api.post('/api/orders/track/', data),
  validateCoupon: (data)        => api.post('/api/orders/coupons/validate/', data),

  /* admin */
  adminGetAll:      (params)              => api.get('/api/orders/admin/list/', { params }),
  adminGetStats:    ()                    => api.get('/api/orders/admin/stats/'),
  adminGetOrder:    (orderNumber)         => api.get(`/api/orders/admin/${orderNumber}/`),
  adminUpdateStatus:(orderNumber, status) => api.patch(`/api/orders/admin/${orderNumber}/status/`, { status }),
  adminCancelOrder: (orderNumber, note)   => api.patch(`/api/orders/admin/${orderNumber}/cancel/`, { note }),
  adminGetCoupons:  ()                    => api.get('/api/orders/admin/coupons/'),
  adminCreateCoupon:(data)                => api.post('/api/orders/admin/coupons/', data),
  adminDeleteCoupon:(id)                  => api.delete(`/api/orders/admin/coupons/${id}/`),
};

export default api;