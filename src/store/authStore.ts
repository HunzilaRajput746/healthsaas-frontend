import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface Admin {
  id: string
  email: string
  full_name: string
  clinic_id: string
  role: string
}

interface AuthState {
  token: string | null
  admin: Admin | null
  clinicName: string
  isAuthenticated: boolean
  login: (email: string, password: string, clinicId: string) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      admin: null,
      clinicName: '',
      isAuthenticated: false,

      login: async (email, password, clinicId) => {
        const res = await axios.post(`${API}/api/auth/login`, {
          email,
          password,
          clinic_id: clinicId,
        })
        const { access_token, admin, clinic_name } = res.data
        set({
          token: access_token,
          admin,
          clinicName: clinic_name,
          isAuthenticated: true,
        })
        // Set default auth header for all axios calls
        axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
      },

      logout: () => {
        set({ token: null, admin: null, clinicName: '', isAuthenticated: false })
        delete axios.defaults.headers.common['Authorization']
      },
    }),
    {
      name: 'healthsaas-auth',
      onRehydrateStorage: () => (state) => {
        // Restore axios header on page reload
        if (state?.token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`
        }
      },
    }
  )
)
