'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Stethoscope, Lock, Mail, Building2, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

export default function AdminLoginPage() {
  const [form, setForm] = useState({ email: '', password: '', clinicId: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email || !form.password || !form.clinicId) {
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      await login(form.email, form.password, form.clinicId)
      toast.success('Welcome back!')
      router.push('/admin/dashboard')
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30" style={{
        backgroundImage: 'linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />
      
      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, #00d4ff, transparent)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, #9b59ff, transparent)' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4"
            style={{
              background: 'linear-gradient(135deg, #00d4ff15, #9b59ff15)',
              border: '1px solid rgba(0,212,255,0.3)',
              boxShadow: '0 0 30px rgba(0,212,255,0.15)',
            }}
            animate={{ boxShadow: ['0 0 20px rgba(0,212,255,0.15)', '0 0 40px rgba(0,212,255,0.3)', '0 0 20px rgba(0,212,255,0.15)'] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Stethoscope size={36} color="#00d4ff" />
          </motion.div>
          <h1 className="text-3xl font-bold font-display" style={{ color: '#00d4ff', textShadow: '0 0 20px rgba(0,212,255,0.5)' }}>
            HEALTHSAAS
          </h1>
          <p className="text-slate-400 text-sm mt-1">Admin Dashboard Login</p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: 'rgba(10, 15, 30, 0.9)',
            border: '1px solid rgba(0,212,255,0.15)',
            boxShadow: '0 0 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,212,255,0.05) inset',
            backdropFilter: 'blur(20px)',
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Clinic ID */}
            <div>
              <label className="text-xs font-mono text-slate-400 mb-1.5 block">CLINIC ID</label>
              <div className="relative">
                <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={form.clinicId}
                  onChange={e => setForm(p => ({ ...p, clinicId: e.target.value }))}
                  placeholder="your-clinic-id"
                  className="w-full pl-9 pr-4 py-3 rounded-xl bg-[#0d1527] text-sm text-slate-200 placeholder-slate-600 outline-none transition-all font-mono"
                  style={{ border: '1px solid rgba(0,212,255,0.15)', }}
                  onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(0,212,255,0.15)'}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-mono text-slate-400 mb-1.5 block">EMAIL ADDRESS</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="admin@clinic.com"
                  className="w-full pl-9 pr-4 py-3 rounded-xl bg-[#0d1527] text-sm text-slate-200 placeholder-slate-600 outline-none transition-all"
                  style={{ border: '1px solid rgba(0,212,255,0.15)' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(0,212,255,0.15)'}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-mono text-slate-400 mb-1.5 block">PASSWORD</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-3 rounded-xl bg-[#0d1527] text-sm text-slate-200 placeholder-slate-600 outline-none transition-all"
                  style={{ border: '1px solid rgba(0,212,255,0.15)' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(0,212,255,0.15)'}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-display tracking-wider"
              style={{
                background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
                color: '#030712',
                boxShadow: '0 0 20px rgba(0,212,255,0.3)',
              }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? 'AUTHENTICATING...' : 'ACCESS DASHBOARD'}
            </motion.button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          Multi-Tenant Healthcare Platform © 2024 HealthSaaS
        </p>
      </motion.div>
    </div>
  )
}
