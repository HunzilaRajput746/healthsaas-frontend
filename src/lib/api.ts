import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
})

// Request interceptor — attach token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('healthsaas-auth')
    if (stored) {
      const { state } = JSON.parse(stored)
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`
      }
    }
  }
  return config
})

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('healthsaas-auth')
      window.location.href = '/admin/login'
    }
    return Promise.reject(error)
  }
)

// ─── API Methods ───────────────────────────────────────────────────────────────

export const chatAPI = {
  sendMessage: (clinicId: string, message: string, sessionId: string) =>
    api.post(`/api/chat/${clinicId}`, { message, session_id: sessionId }),
}

export const adminAPI = {
  getStats: () => api.get('/api/admin/stats'),
  getAppointments: (params?: any) => api.get('/api/admin/appointments', { params }),
  getTodayAppointments: () => api.get('/api/admin/appointments/today'),
  updateAppointment: (id: string, data: any) => api.put(`/api/admin/appointments/${id}`, data),
}

export const clinicAPI = {
  getInfo: () => api.get('/api/clinic/info'),
  updateInfo: (data: any) => api.put('/api/clinic/info', data),
  getDoctors: () => api.get('/api/clinic/doctors'),
  addDoctor: (data: any) => api.post('/api/clinic/doctors', data),
  updateDoctor: (id: string, data: any) => api.put(`/api/clinic/doctors/${id}`, data),
  deleteDoctor: (id: string) => api.delete(`/api/clinic/doctors/${id}`),
  getLabTests: () => api.get('/api/clinic/lab-tests'),
  addLabTest: (data: any) => api.post('/api/clinic/lab-tests', data),
  updateLabTest: (id: string, data: any) => api.put(`/api/clinic/lab-tests/${id}`, data),
  deleteLabTest: (id: string) => api.delete(`/api/clinic/lab-tests/${id}`),
}

export const authAPI = {
  login: (email: string, password: string, clinicId: string) =>
    api.post('/api/auth/login', { email, password, clinic_id: clinicId }),
  registerClinic: (data: any) => api.post('/api/auth/register-clinic', data),
}

export default api
