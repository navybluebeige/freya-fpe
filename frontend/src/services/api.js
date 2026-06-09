import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('freya_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 - clear session and redirect to login
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !err.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('freya_token');
      localStorage.removeItem('freya_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  loginUser: (data) => API.post('/auth/login', data),
  registerPatient: (data) => API.post('/auth/register', { ...data, role: 'patient' }),
  registerDoctor:  (data) => API.post('/auth/register', { ...data, role: 'doctor' }),
  registerLab:     (data) => API.post('/auth/register', { ...data, role: 'laboratory' }),

  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
  changePassword: (data) => API.put('/auth/password', data),
  deleteAccount: (password) => API.delete('/auth/account', { data: { password } }),
};

// ─── DOCTORS ──────────────────────────────────────────────────────────────────
export const doctorsAPI = {
  search: (params) => API.get('/doctors', { params }),
  getById: (id) => API.get(`/doctors/${id}`),
  getAvailability: (id, date) => API.get(`/doctors/${id}/availability`, { params: { date } }),
  getSpecialites: () => API.get('/doctors/meta/specialites'),
  getMyProfile: () => API.get('/doctors/profile/me'),
  getMyAvailability: () => API.get('/doctors/availability/me'),
  updateProfile: (data) => API.put('/doctors/profile/update', data),
  setAvailability: (slots) => API.post('/doctors/availability', { slots }),
  getDashboardStats: () => API.get('/doctors/dashboard/stats'),
};

// ─── APPOINTMENTS ─────────────────────────────────────────────────────────────
export const appointmentsAPI = {
  book: (data) => API.post('/appointments', data),
  getMyAppointments: (params) => API.get('/appointments/my', { params }),
  getById: (id) => API.get(`/appointments/${id}`),
  updateStatus: (id, status, notes) => API.patch(`/appointments/${id}/status`, { status, notes }),
};

// ─── MESSAGES ─────────────────────────────────────────────────────────────────
export const messagesAPI = {
  getConversations: () => API.get('/messages/conversations'),
  createConversation: (doctorId) => API.post('/messages/conversations', { doctorId }),
  createConversationWithPatient: (patientId) => API.post('/messages/conversations', { patientId }),
  getMessages: (convId) => API.get(`/messages/conversations/${convId}/messages`),
  sendMessage: (convId, content) => API.post(`/messages/conversations/${convId}/messages`, { content }),
};

// ─── MEDICAL RECORDS ──────────────────────────────────────────────────────────
export const recordsAPI = {
  getRecords: (patient_id) => API.get('/records', { params: patient_id ? { patient_id } : {} }),
  addRecord: (data) => API.post('/records', data),
  getProfile: () => API.get('/records/profile'),
  updateProfile: (data) => API.put('/records/profile', data),
};

// ─── REVIEWS ──────────────────────────────────────────────────────────────────
export const reviewsAPI = {
  addReview:        (data)       => API.post('/reviews', data),
  getDoctorReviews: (doctorId)   => API.get(`/reviews/doctor/${doctorId}`),
  getClinicReviews: (clinicId)   => API.get(`/reviews/clinic/${clinicId}`),
  hasReviewed:      (appointmentId) => API.get(`/reviews/has/${appointmentId}`),
};

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
export const notificationsAPI = {
  getAll: () => API.get('/notifications'),
  markAllRead: () => API.patch('/notifications/read-all'),
  markRead: (id) => API.patch(`/notifications/${id}/read`),
};

// ─── LABORATOIRE ──────────────────────────────────────────────────────────────
export const laboAPI = {
  getProfile:           ()           => API.get('/labo/profile'),
  updateProfile:        (data)       => API.put('/labo/profile', data),
  getStats:             ()           => API.get('/labo/stats'),
  getAnalyses:          ()           => API.get('/labo/analyses'),
  getAppointments:      ()           => API.get('/labo/appointments'),
  updateApptStatus:     (id, s)      => API.patch(`/labo/appointments/${id}/status`, { status: s }),
  sendResults:          (data)       => API.post('/labo/results', data),
  uploadFile:           (file)       => { const fd = new FormData(); fd.append('file', file); return API.post('/labo/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } }); },
  getAvailability:      ()           => API.get('/labo/availability'),
  updateAvailability:   (data)       => API.put('/labo/availability', data),
  getPublicClinic:      (clinicId)   => API.get(`/labo/public/${clinicId}`),
  getPublicAvailability:(clinicId)   => API.get(`/labo/public/${clinicId}/availability`),
};

// ─── ADMIN ────────────────────────────────────────────────────────────────────
export const adminAPI = {
  getStats:          ()                       => API.get('/admin/stats'),
  getPendingDoctors: ()                       => API.get('/admin/doctors/pending'),
  approveDoctor:     (id, approved, reason)   => API.patch(`/admin/doctors/${id}/approve`, { approved, reason }),
  getAllDoctors:      (params)                 => API.get('/admin/doctors', { params }),
  toggleUser:        (id)                     => API.patch(`/admin/users/${id}/toggle`),
  deleteUser:        (id)                     => API.delete(`/admin/users/${id}`),
  getClinics:        ()                       => API.get('/admin/clinics'),
  addClinic:         (data)                   => API.post('/admin/clinics', data),
  getPatients:       (params)                 => API.get('/admin/patients', { params }),
  getAppointments:   (params)                 => API.get('/admin/appointments', { params }),
  getAllLabs:         (params)                 => API.get('/admin/labs', { params }),
  toggleLab:         (id)                     => API.patch(`/admin/labs/${id}/toggle`),
};

export default API;