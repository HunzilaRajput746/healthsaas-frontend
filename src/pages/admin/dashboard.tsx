'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, FlaskConical, Calendar, LogOut,
  Wifi, WifiOff, TrendingUp, Clock, CheckCircle2, XCircle,
  Bell, RefreshCw, ChevronRight, Activity
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useAdminWebSocket } from '@/hooks/useAdminWebSocket'
import { adminAPI, clinicAPI } from '@/lib/api'
import toast, { Toaster } from 'react-hot-toast'
import { format } from 'date-fns'
import DoctorManager from '@/components/admin/DoctorManager'
import LabTestManager from '@/components/admin/LabTestManager'

type Tab = 'dashboard' | 'appointments' | 'calendar' | 'doctors' | 'labs'

const STATUS_COLORS = {
  confirmed: { bg: '#00ff8815', border: '#00ff8840', text: '#00ff88' },
  cancelled: { bg: '#ff2d9b15', border: '#ff2d9b40', text: '#ff2d9b' },
  completed: { bg: '#00d4ff15', border: '#00d4ff40', text: '#00d4ff' },
}

export default function AdminDashboard() {
  const { admin, clinicName, logout, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [stats, setStats] = useState<any>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<any[]>([])
  const [calendarData, setCalendarData] = useState<any[]>([])
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [filteredAppts, setFilteredAppts] = useState<any[]>([])

  const { isConnected, lastEvent } = useAdminWebSocket(admin?.clinic_id)

  // Auth guard
  useEffect(() => {
    if (!isAuthenticated) router.push('/admin/login')
  }, [isAuthenticated, router])

  const fetchData = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }

      const [statsRes, apptRes, calRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getTodayAppointments(),
        fetch(`${apiUrl}/api/admin/appointments/by-date`, { headers }).then(r => r.json()),
      ])
      setStats(statsRes.data)
      setAppointments(apptRes.data.appointments || [])
      setCalendarData(calRes.dates || [])
    } catch (e) {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [])

  // Filter appointments by selected date
  const fetchDateAppointments = async (dateStr: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const token = localStorage.getItem('token')
      const res = await fetch(
        `${apiUrl}/api/admin/appointments?date_filter=${dateStr}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const data = await res.json()
      setFilteredAppts(data.appointments || [])
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchDateAppointments(selectedDate)
  }, [selectedDate])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Handle real-time WebSocket events
  useEffect(() => {
    if (!lastEvent) return

    if (lastEvent.event === 'new_appointment') {
      const appt = lastEvent.data
      
      // Add to appointments list (today's only)
      const today = new Date().toISOString().split('T')[0]
      if (appt.date === today) {
        setAppointments((prev: any[]) => [appt, ...prev])
      }

      // Update stats
      setStats((prev: any) => prev ? {
        ...prev,
        today: {
          ...prev.today,
          total: prev.today.total + 1,
          confirmed: prev.today.confirmed + 1,
          revenue: prev.today.revenue + (appt.fee || 0),
        },
        all_time_appointments: prev.all_time_appointments + 1,
      } : prev)

      // Toast notification with neon styling
      toast.custom((t) => (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          className="rounded-xl p-4 max-w-sm"
          style={{
            background: '#0a0f1e',
            border: '1px solid rgba(0,255,136,0.4)',
            boxShadow: '0 0 20px rgba(0,255,136,0.2)',
          }}
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#00ff8820' }}>
              <Bell size={14} color="#00ff88" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">New Appointment!</p>
              <p className="text-xs text-slate-400">{appt.patient_name} → {appt.doctor_name || appt.test_name}</p>
              <p className="text-xs" style={{ color: '#00ff88' }}>{appt.date} at {appt.time_slot}</p>
            </div>
          </div>
        </motion.div>
      ), { duration: 5000 })

      // Add to notification feed
      setNotifications((prev: any[]) => [appt, ...prev.slice(0, 19)])
    }
  }, [lastEvent])

  const updateStatus = async (id: string, status: string) => {
    try {
      await adminAPI.updateAppointment(id, { status })
      setAppointments((prev: any[]) => prev.map((a: any) =>
        a.appointment_id === id ? { ...a, status } : a
      ))
      toast.success(`Status updated to ${status}`)
    } catch {
      toast.error('Update failed')
    }
  }

  const StatCard = ({ label, value, sub, color, icon: Icon }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-5 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${color}12, ${color}06)`,
        border: `1px solid ${color}25`,
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-bold mt-1" style={{ color, fontFamily: 'Orbitron, sans-serif' }}>
            {value ?? '—'}
          </p>
          {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
        </div>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon size={18} color={color} />
        </div>
      </div>
      {/* Decorative corner glow */}
      <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full blur-2xl opacity-20" style={{ background: color }} />
    </motion.div>
  )

  const navItems: { id: Tab; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'appointments', label: "Today's", icon: Calendar },
    { id: 'calendar', label: 'Date Wise', icon: Activity },
    { id: 'doctors', label: 'Doctors', icon: Users },
    { id: 'labs', label: 'Lab Tests', icon: FlaskConical },
  ]

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-[#030712] flex" style={{
      backgroundImage: 'linear-gradient(rgba(0,212,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.02) 1px, transparent 1px)',
      backgroundSize: '40px 40px'
    }}>
      <Toaster position="top-right" />

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <div
        className="w-64 flex-shrink-0 flex flex-col h-screen sticky top-0"
        style={{
          background: 'rgba(10, 15, 30, 0.98)',
          borderRight: '1px solid rgba(0,212,255,0.1)',
        }}
      >
        {/* Logo */}
        <div className="p-6 border-b" style={{ borderColor: 'rgba(0,212,255,0.1)' }}>
          <h1 className="text-lg font-bold font-display" style={{ color: '#00d4ff', textShadow: '0 0 15px rgba(0,212,255,0.5)' }}>
            HEALTHSAAS
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 truncate">{clinicName}</p>
        </div>

        {/* Connection status */}
        <div className="mx-4 mt-3 px-3 py-2 rounded-lg flex items-center gap-2"
          style={{ background: isConnected ? '#00ff8810' : '#ff2d9b10', border: `1px solid ${isConnected ? '#00ff8830' : '#ff2d9b30'}` }}>
          {isConnected
            ? <><Wifi size={12} color="#00ff88" /><span className="text-xs" style={{ color: '#00ff88' }}>Live Dashboard</span></>
            : <><WifiOff size={12} color="#ff2d9b" /><span className="text-xs" style={{ color: '#ff2d9b' }}>Reconnecting...</span></>
          }
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as Tab)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all text-left"
              style={{
                background: activeTab === id ? 'rgba(0,212,255,0.1)' : 'transparent',
                color: activeTab === id ? '#00d4ff' : '#64748b',
                border: activeTab === id ? '1px solid rgba(0,212,255,0.2)' : '1px solid transparent',
              }}
            >
              <Icon size={16} />
              <span className="font-medium">{label}</span>
              {activeTab === id && <ChevronRight size={14} className="ml-auto" />}
            </button>
          ))}
        </nav>

        {/* Admin info + logout */}
        <div className="p-4 border-t" style={{ borderColor: 'rgba(0,212,255,0.1)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: '#9b59ff20', border: '1px solid #9b59ff40', color: '#9b59ff' }}>
              {admin?.full_name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-300 truncate">{admin?.full_name}</p>
              <p className="text-xs text-slate-600 truncate">{admin?.email}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); router.push('/admin/login') }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-red-400 hover:bg-red-400/5 transition-all"
          >
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      </div>

      {/* ── Main Content ────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto p-8">
        <AnimatePresence mode="wait">
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold font-display text-white">Dashboard</h2>
                  <p className="text-slate-500 text-sm mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
                </div>
                <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all"
                  style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff' }}>
                  <RefreshCw size={14} />
                  Refresh
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#00d4ff40', borderTopColor: '#00d4ff' }} />
                </div>
              ) : (
                <>
                  {/* Stats grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard label="Today's Appointments" value={stats?.today?.total} sub="Total bookings" color="#00d4ff" icon={Calendar} />
                    <StatCard label="Confirmed" value={stats?.today?.confirmed} sub="Active slots" color="#00ff88" icon={CheckCircle2} />
                    <StatCard label="Cancelled" value={stats?.today?.cancelled} sub="Released slots" color="#ff2d9b" icon={XCircle} />
                    <StatCard label="Today's Revenue" value={`PKR ${(stats?.today?.revenue || 0).toLocaleString()}`} sub="Estimated" color="#9b59ff" icon={TrendingUp} />
                  </div>

                  {/* Secondary stats */}
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <StatCard label="All-Time Bookings" value={stats?.all_time_appointments} color="#00d4ff" icon={Activity} />
                    <StatCard label="Active Doctors" value={stats?.active_doctors} color="#9b59ff" icon={Users} />
                    <StatCard label="Lab Tests" value={stats?.active_lab_tests} color="#00ff88" icon={FlaskConical} />
                  </div>

                  {/* Recent live notifications */}
                  {notifications.length > 0 && (
                    <div>
                      <h3 className="text-sm font-mono text-slate-400 mb-3 flex items-center gap-2">
                        <Bell size={13} color="#00ff88" />
                        LIVE NOTIFICATIONS
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      </h3>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {notifications.slice(0, 5).map((n, i) => (
                          <motion.div
                            key={i}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="flex items-center gap-3 p-3 rounded-xl"
                            style={{ background: '#0d1527', border: '1px solid rgba(0,255,136,0.15)' }}
                          >
                            <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0 animate-pulse" />
                            <p className="text-sm text-slate-300 flex-1">
                              <span className="text-white font-medium">{n.patient_name}</span> booked{' '}
                              <span style={{ color: '#00d4ff' }}>{n.doctor_name || n.test_name}</span> for{' '}
                              <span style={{ color: '#9b59ff' }}>{n.date} @ {n.time_slot}</span>
                            </p>
                            <span className="text-xs text-slate-600">{n.fee ? `PKR ${n.fee}` : ''}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* APPOINTMENTS TAB */}
          {activeTab === 'appointments' && (
            <motion.div key="appointments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold font-display text-white">Today's Appointments</h2>
                <span className="text-sm text-slate-500">{appointments.length} total</span>
              </div>

              {appointments.length === 0 ? (
                <div className="text-center py-20 text-slate-600">
                  <Calendar size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No appointments today yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.map((appt) => {
                    const sc = STATUS_COLORS[appt.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.confirmed
                    return (
                      <motion.div
                        key={appt.appointment_id}
                        layout
                        className="p-4 rounded-xl flex items-center gap-4"
                        style={{ background: '#0d1527', border: '1px solid rgba(0,212,255,0.08)' }}
                      >
                        {/* Time */}
                        <div className="text-center w-14 flex-shrink-0">
                          <p className="text-lg font-bold font-mono" style={{ color: '#00d4ff' }}>{appt.time_slot}</p>
                          <p className="text-xs text-slate-600">{appt.date}</p>
                        </div>
                        
                        <div className="w-px h-10 bg-slate-700" />
                        
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white truncate">{appt.patient_name}</p>
                          <p className="text-sm text-slate-400 truncate">
                            {appt.doctor_name ? `Dr. ${appt.doctor_name}` : appt.test_name}
                          </p>
                          <p className="text-xs text-slate-600">{appt.phone}</p>
                        </div>

                        {/* Fee */}
                        <p className="text-sm font-mono" style={{ color: '#9b59ff' }}>
                          PKR {appt.fee}
                        </p>

                        {/* Status badge + actions */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2.5 py-1 rounded-full font-mono"
                            style={{ background: sc.bg, border: `1px solid ${sc.border}`, color: sc.text }}>
                            {appt.status}
                          </span>
                          {appt.status === 'confirmed' && (
                            <>
                              <button onClick={() => updateStatus(appt.appointment_id, 'completed')}
                                className="text-xs px-2 py-1 rounded-lg transition-all"
                                style={{ background: '#00d4ff10', color: '#00d4ff', border: '1px solid #00d4ff20' }}>
                                ✓ Done
                              </button>
                              <button onClick={() => updateStatus(appt.appointment_id, 'cancelled')}
                                className="text-xs px-2 py-1 rounded-lg transition-all"
                                style={{ background: '#ff2d9b10', color: '#ff2d9b', border: '1px solid #ff2d9b20' }}>
                                ✕
                              </button>
                            </>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* DOCTORS TAB */}
          {activeTab === 'doctors' && (
            <motion.div key="doctors" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DoctorManager />
            </motion.div>
          )}

          {/* CALENDAR / DATE-WISE TAB */}
          {activeTab === 'calendar' && (
            <motion.div key="calendar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Date-Wise Appointments</h2>
                  <p className="text-sm mt-1" style={{ color: '#64748b' }}>
                    Select a date to see all bookings
                  </p>
                </div>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="px-4 py-2 rounded-xl text-sm outline-none"
                  style={{
                    background: 'rgba(13,21,39,0.8)',
                    border: '1px solid rgba(0,212,255,0.3)',
                    color: '#e2e8f0',
                  }}
                />
              </div>

              {/* Date summary cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Total Bookings', value: filteredAppts.length, color: '#00d4ff' },
                  { label: 'Confirmed', value: filteredAppts.filter(a => a.status === 'confirmed').length, color: '#00ff88' },
                  { label: 'Completed', value: filteredAppts.filter(a => a.status === 'completed').length, color: '#9b59ff' },
                  { label: 'Revenue', value: `PKR ${filteredAppts.filter(a => a.status !== 'cancelled').reduce((s,a) => s + (a.fee||0), 0).toLocaleString()}`, color: '#f97316' },
                ].map(card => (
                  <div key={card.label} className="rounded-xl p-4" style={{
                    background: `${card.color}10`,
                    border: `1px solid ${card.color}30`,
                  }}>
                    <div className="text-xs mb-1" style={{ color: card.color }}>{card.label}</div>
                    <div className="text-xl font-bold" style={{ color: card.color }}>{card.value}</div>
                  </div>
                ))}
              </div>

              {/* Appointments list for selected date */}
              {filteredAppts.length === 0 ? (
                <div className="text-center py-16 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <Calendar size={40} className="mx-auto mb-3 opacity-30" style={{ color: '#00d4ff' }} />
                  <p className="text-slate-500">No appointments on {selectedDate}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAppts.map((appt, i) => (
                    <div key={appt.appointment_id || i} className="rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap"
                      style={{ background: 'rgba(13,21,39,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                          style={{ background: 'rgba(0,212,255,0.15)', color: '#00d4ff' }}>
                          {(appt.patient_name || 'U')[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-white text-sm">{appt.patient_name}</div>
                          <div className="text-xs" style={{ color: '#64748b' }}>
                            📞 {appt.phone} &nbsp;|&nbsp; ⏰ {appt.time_slot}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(155,89,255,0.15)', color: '#9b59ff', border: '1px solid rgba(155,89,255,0.3)' }}>
                          {appt.doctor_name ? `👨‍⚕️ Dr. ${appt.doctor_name}` : `🧪 ${appt.test_name || 'Lab Test'}`}
                        </div>
                        <div className="text-xs font-bold" style={{ color: '#00ff88' }}>PKR {(appt.fee || 0).toLocaleString()}</div>
                        <div className="text-xs px-2 py-1 rounded-full font-medium"
                          style={{
                            background: STATUS_COLORS[appt.status as keyof typeof STATUS_COLORS]?.bg || '#ffffff10',
                            color: STATUS_COLORS[appt.status as keyof typeof STATUS_COLORS]?.text || '#fff',
                            border: `1px solid ${STATUS_COLORS[appt.status as keyof typeof STATUS_COLORS]?.border || '#ffffff20'}`,
                          }}>
                          {appt.status}
                        </div>
                        <select
                          defaultValue={appt.status}
                          onChange={async (e) => {
                            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
                            const token = localStorage.getItem('token')
                            await fetch(`${apiUrl}/api/admin/appointments/${appt.appointment_id}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                              body: JSON.stringify({ status: e.target.value })
                            })
                            fetchDateAppointments(selectedDate)
                            toast.success('Status updated!')
                          }}
                          className="text-xs px-2 py-1 rounded-lg outline-none"
                          style={{ background: '#0d1527', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}
                        >
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* All dates summary at bottom */}
              {calendarData.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-sm font-semibold mb-3" style={{ color: '#94a3b8' }}>ALL DATES WITH BOOKINGS</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {calendarData.map(day => (
                      <button key={day.date} onClick={() => setSelectedDate(day.date)}
                        className="rounded-xl p-3 text-left transition-all hover:scale-105"
                        style={{
                          background: selectedDate === day.date ? 'rgba(0,212,255,0.15)' : 'rgba(13,21,39,0.6)',
                          border: selectedDate === day.date ? '1px solid rgba(0,212,255,0.5)' : '1px solid rgba(255,255,255,0.06)',
                        }}>
                        <div className="text-xs font-bold mb-1" style={{ color: selectedDate === day.date ? '#00d4ff' : '#94a3b8' }}>
                          {day.date}
                        </div>
                        <div className="text-lg font-bold text-white">{day.total}</div>
                        <div className="text-xs" style={{ color: '#64748b' }}>appointments</div>
                        <div className="text-xs mt-1 font-medium" style={{ color: '#00ff88' }}>
                          PKR {(day.revenue || 0).toLocaleString()}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}


          {/* LABS TAB */}
          {activeTab === 'labs' && (
            <motion.div key="labs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LabTestManager />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
