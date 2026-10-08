import axios from 'axios';

export const AUTH_STORAGE_KEY = 'user';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function readStoredUser() {
  try {
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEY)
      || sessionStorage.getItem(AUTH_STORAGE_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error('Unable to read the saved session.', error);
    clearStoredUser();
    return null;
  }
}

export function storeUser(user, remember = true) {
  const storage = remember ? localStorage : sessionStorage;
  const otherStorage = remember ? sessionStorage : localStorage;
  storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  otherStorage.removeItem(AUTH_STORAGE_KEY);
}

export function clearStoredUser() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
}

export function getApiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  const responseData = error?.response?.data;
  if (typeof responseData === 'string' && responseData.trim()) {
    return responseData;
  }

  if (responseData && typeof responseData === 'object') {
    const message = responseData.message || responseData.error;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }

    const validationMessage = Object.values(responseData)
      .find((value) => typeof value === 'string' && value.trim());
    if (validationMessage) {
      return validationMessage;
    }
  }

  if (error?.code === 'ECONNABORTED') {
    return 'The server took too long to respond. Please try again.';
  }

  if (error?.request && !error.response) {
    return 'Could not reach the server. Check that the backend is running and try again.';
  }

  return fallback;
}

api.interceptors.request.use((config) => {
  const user = readStoredUser();
  const token = user?.token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || '';
    const isLoginRequest = requestUrl.endsWith('/auth/login');

    if (error.response?.status === 401 && !isLoginRequest && error.config?.headers?.Authorization) {
      clearStoredUser();
      window.dispatchEvent(new Event('auth:unauthorized'));
    }

    return Promise.reject(error);
  },
);

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (details) => api.post('/auth/register', details),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) =>
    api.post('/auth/reset-password', { newPassword }, { params: { token } }),
};

export const usersApi = {
  profile: () => api.get('/users/profile'),
  updateProfile: (details) => api.put('/users/profile', details),
  changePassword: (passwords) => api.put('/users/change-password', passwords),
  uploadProfileImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/users/profile-image', formData);
  },
  page: (params) => api.get('/users/page', { params }),
  mfaSetup: () => api.get('/mfa/setup'),
  mfaEnable: (code) => api.post('/mfa/enable', { code }),
  mfaDisable: (code) => api.post('/mfa/disable', { code }),
};

export const appointmentsApi = {
  listForUser: (userId) => api.get(`/appointments/user/${userId}`),
  createForUser: (userId, appointment) =>
    api.post(`/appointments/user/${userId}`, appointment),
};

export const notificationsApi = {
  listForUser: (userId) => api.get(`/notifications/user/${userId}`),
  unreadForUser: (userId) => api.get(`/notifications/user/${userId}/unread`),
  markAsRead: (notificationId, userId) =>
    api.put(`/notifications/${notificationId}/read/user/${userId}`),
};

export const adminApi = {
  dashboardStats: () => api.get('/dashboard/stats'),
  monthlyUserReport: () => api.get('/reports/users/monthly'),
  usersPage: (params) => api.get('/users/page', { params }),
  auditLogs: (params) => api.get('/audit-logs', { params }),
};

export const ticketsApi = {
  getUserTickets: () => api.get('/tickets'),
  getTicket: (id) => api.get(`/tickets/${id}`),
  createTicket: (payload) => api.post('/tickets', payload),
  addMessage: (id, payload) => api.post(`/tickets/${id}/messages`, payload),
  updateStatus: (id, status) => api.put(`/tickets/${id}/status`, { status }),
};

export function getAssetUrl(path) {
  if (!path) {
    return '';
  }
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  const apiOrigin = new URL(api.defaults.baseURL, window.location.origin).origin;
  return new URL(path.startsWith('/') ? path : `/${path}`, apiOrigin).toString();
}

export function getAsset(path) {
  return api.get(getAssetUrl(path), { responseType: 'blob' });
}

export default api;


export const tasksApi = {
  list: () => api.get('/tasks'),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
};
