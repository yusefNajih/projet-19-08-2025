import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: ({ email, password }) => api.post("/auth/login", { email, password }),
  register: (userData) => api.post("/auth/register", userData),
  getMe: () => api.get("/auth/me"),
  updatePreferences: (preferences) => api.put("/auth/preferences", preferences),
  changePassword: (passwords) => api.post("/auth/change-password", passwords),
  
  updateProfile: (userData) => {
    const token = localStorage.getItem('token'); // ou où vous stockez le token
    return axios.put('/api/auth/profile', userData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }
};

// Vehicles API
export const vehiclesAPI = {
  getAll: (params) => api.get("/vehicles", { params }),
  getById: (id) => api.get(`/vehicles/${id}`),
  create: (vehicleData) => api.post("/vehicles", vehicleData),
  update: (id, vehicleData) => api.put(`/vehicles/${id}`, vehicleData),
  delete: (id) => api.delete(`/vehicles/${id}`),
  checkAvailability: (id, params) =>
    api.get(`/vehicles/${id}/check-availability`, { params }),
};

// Clients API
export const clientsAPI = {
  getAll: (params) => api.get("/clients", { params }),
  getById: (id) => api.get(`/clients/${id}`),
  create: (clientData) => api.post("/clients", clientData),
  update: (id, clientData) => api.put(`/clients/${id}`, clientData),
  delete: (id) => api.delete(`/clients/${id}`),
  getRentalHistory: (id, params) =>
    api.get(`/clients/${id}/rental-history`, { params }),
  blacklist: (id, data) => api.put(`/clients/${id}/blacklist`, data),
};

// Reservations API
export const reservationsAPI = {
  getAll: (params) => api.get("/reservations", { params }),
  getById: (id) => api.get(`/reservations/${id}`),
  create: (reservationData) => api.post("/reservations", reservationData),
  update: (id, reservationData) =>
    api.put(`/reservations/${id}`, reservationData),
  delete: (id) => api.delete(`/reservations/${id}`),
  getCalendarView: (params) =>
    api.get("/reservations/calendar-view", { params }),
  getOverdue: () => api.get("/reservations/overdue-list"),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get("/dashboard/stats"),
  getRevenue: (params) => api.get("/dashboard/revenue", { params }),
  getAlerts: () => api.get("/dashboard/alerts"),
  resetRevenue: () => api.post("/dashboard/reset-revenue"),
};

// Admin API
export const registerAdmin = (adminData) =>
  api.post("/admin/register", adminData);

export default api;
