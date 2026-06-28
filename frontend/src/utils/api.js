import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  logout: () => API.get('/auth/logout'),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/updateprofile', data),
  updatePassword: (data) => API.put('/auth/updatepassword', data)
};

// Books
export const booksAPI = {
  getAll: (params) => API.get('/books', { params }),
  getOne: (id) => API.get(`/books/${id}`),
  create: (data) => API.post('/books', data),
  update: (id, data) => API.put(`/books/${id}`, data),
  delete: (id) => API.delete(`/books/${id}`),
  getStats: () => API.get('/books/stats')
};

// Members
export const membersAPI = {
  getAll: (params) => API.get('/members', { params }),
  getOne: (id) => API.get(`/members/${id}`),
  create: (data) => API.post('/members', data),
  update: (id, data) => API.put(`/members/${id}`, data),
  delete: (id) => API.delete(`/members/${id}`)
};

// Borrows
export const borrowsAPI = {
  getAll: (params) => API.get('/borrows', { params }),
  borrow: (data) => API.post('/borrows', data),
  return: (id) => API.put(`/borrows/${id}/return`),
  getStats: () => API.get('/borrows/stats'),
  delete: (id) => API.delete(`/borrows/${id}`)
};

export default API;
