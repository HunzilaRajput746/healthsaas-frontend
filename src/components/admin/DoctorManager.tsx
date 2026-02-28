'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, X, Save, Loader2, Users } from 'lucide-react'
import { clinicAPI } from '@/lib/api'
import toast from 'react-hot-toast'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const emptyDoctor = {
  name: '', specialization: '', qualification: '',
  consultation_fee: '', bio: '', image_url: '',
  timings: [{ day: 'Mon-Fri', start_time: '09:00', end_time: '17:00' }],
  available_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
}

export default function DoctorManager() {
  const [doctors, setDoctors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<any>(emptyDoctor)
  const [saving, setSaving] = useState(false)

  const fetchDoctors = async () => {
    try {
      const res = await clinicAPI.getDoctors()
      setDoctors(res.data)
    } catch { toast.error('Failed to load doctors') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchDoctors() }, [])

  const openAdd = () => { setForm(emptyDoctor); setEditingId(null); setShowForm(true) }
  const openEdit = (doc: any) => {
    setForm({ ...doc, consultation_fee: doc.consultation_fee.toString() })
    setEditingId(doc.doctor_id)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.specialization || !form.consultation_fee) {
      toast.error('Name, specialization, and fee are required')
      return
    }
    setSaving(true)
    try {
      const payload = { ...form, consultation_fee: parseFloat(form.consultation_fee) }
      if (editingId) {
        await clinicAPI.updateDoctor(editingId, payload)
        toast.success('Doctor updated')
      } else {
        await clinicAPI.addDoctor(payload)
        toast.success('Doctor added')
      }
      setShowForm(false)
      fetchDoctors()
    } catch { toast.error('Save failed') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Deactivate Dr. ${name}?`)) return
    try {
      await clinicAPI.deleteDoctor(id)
      toast.success('Doctor deactivated')
      fetchDoctors()
    } catch { toast.error('Delete failed') }
  }

  const toggleDay = (day: string) => {
    setForm((prev: any) => ({
      ...prev,
      available_days: prev.available_days.includes(day)
        ? prev.available_days.filter((d: string) => d !== day)
        : [...prev.available_days, day]
    }))
  }

  const inputClass = "w-full px-3 py-2.5 rounded-xl bg-[#030712] text-sm text-slate-200 placeholder-slate-600 outline-none"
  const inputStyle = { border: '1px solid rgba(0,212,255,0.15)' }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold font-display text-white">Doctors</h2>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
          style={{ background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff' }}>
          <Plus size={15} /> Add Doctor
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin" color="#00d4ff" /></div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-20 text-slate-600">
          <Users size={40} className="mx-auto mb-3 opacity-30" />
          <p>No doctors added yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {doctors.map(doc => (
            <motion.div key={doc.doctor_id} layout
              className="p-5 rounded-xl"
              style={{ background: '#0d1527', border: `1px solid rgba(0,212,255,0.1)` }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-white">Dr. {doc.name}</p>
                  <p className="text-sm text-slate-400">{doc.specialization}</p>
                  {doc.qualification && <p className="text-xs text-slate-600">{doc.qualification}</p>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(doc)} className="p-1.5 rounded-lg transition-all"
                    style={{ background: 'rgba(0,212,255,0.1)', color: '#00d4ff' }}>
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => handleDelete(doc.doctor_id, doc.name)} className="p-1.5 rounded-lg transition-all"
                    style={{ background: 'rgba(255,45,155,0.1)', color: '#ff2d9b' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <span className="text-sm font-mono" style={{ color: '#9b59ff' }}>PKR {doc.consultation_fee}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${doc.is_active ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-500 bg-slate-500/10'}`}>
                  {doc.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              {doc.timings?.length > 0 && (
                <p className="text-xs text-slate-600 mt-2">
                  {doc.timings.map((t: any) => `${t.day}: ${t.start_time}–${t.end_time}`).join(', ')}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Form Modal ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showForm && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowForm(false)} />
            <motion.div className="relative z-10 w-full max-w-lg rounded-2xl p-6 overflow-y-auto max-h-[90vh]"
              style={{ background: '#0a0f1e', border: '1px solid rgba(0,212,255,0.2)', boxShadow: '0 0 60px rgba(0,0,0,0.8)' }}
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold font-display text-white">{editingId ? 'EDIT DOCTOR' : 'ADD DOCTOR'}</h3>
                <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500 font-mono mb-1 block">NAME *</label>
                    <input className={inputClass} style={inputStyle} value={form.name}
                      onChange={e => setForm((p: any) => ({ ...p, name: e.target.value }))} placeholder="Dr. Full Name" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-mono mb-1 block">SPECIALIZATION *</label>
                    <input className={inputClass} style={inputStyle} value={form.specialization}
                      onChange={e => setForm((p: any) => ({ ...p, specialization: e.target.value }))} placeholder="e.g. Cardiologist" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500 font-mono mb-1 block">QUALIFICATION</label>
                    <input className={inputClass} style={inputStyle} value={form.qualification}
                      onChange={e => setForm((p: any) => ({ ...p, qualification: e.target.value }))} placeholder="MBBS, FCPS" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-mono mb-1 block">CONSULTATION FEE (PKR) *</label>
                    <input className={inputClass} style={inputStyle} type="number" value={form.consultation_fee}
                      onChange={e => setForm((p: any) => ({ ...p, consultation_fee: e.target.value }))} placeholder="1500" />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-500 font-mono mb-1 block">BIO</label>
                  <textarea className={inputClass} style={inputStyle} value={form.bio} rows={2}
                    onChange={e => setForm((p: any) => ({ ...p, bio: e.target.value }))} placeholder="Brief introduction..." />
                </div>

                <div>
                  <label className="text-xs text-slate-500 font-mono mb-2 block">AVAILABLE DAYS</label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS.map(day => (
                      <button key={day} type="button" onClick={() => toggleDay(day)}
                        className="px-3 py-1 rounded-lg text-xs transition-all"
                        style={{
                          background: form.available_days.includes(day) ? 'rgba(0,212,255,0.2)' : 'transparent',
                          border: `1px solid ${form.available_days.includes(day) ? 'rgba(0,212,255,0.4)' : 'rgba(0,212,255,0.1)'}`,
                          color: form.available_days.includes(day) ? '#00d4ff' : '#64748b'
                        }}>
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-500 font-mono mb-2 block">TIMING</label>
                  {form.timings.map((t: any, i: number) => (
                    <div key={i} className="grid grid-cols-3 gap-2 mb-2">
                      <input className={inputClass} style={inputStyle} value={t.day}
                        onChange={e => {
                          const timings = [...form.timings]; timings[i].day = e.target.value
                          setForm((p: any) => ({ ...p, timings }))
                        }} placeholder="Mon-Fri" />
                      <input className={inputClass} style={inputStyle} type="time" value={t.start_time}
                        onChange={e => {
                          const timings = [...form.timings]; timings[i].start_time = e.target.value
                          setForm((p: any) => ({ ...p, timings }))
                        }} />
                      <input className={inputClass} style={inputStyle} type="time" value={t.end_time}
                        onChange={e => {
                          const timings = [...form.timings]; timings[i].end_time = e.target.value
                          setForm((p: any) => ({ ...p, timings }))
                        }} />
                    </div>
                  ))}
                </div>

                <button onClick={handleSave} disabled={saving}
                  className="w-full py-3 rounded-xl font-semibold text-sm font-display flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #00d4ff, #0099cc)', color: '#030712', boxShadow: '0 0 20px rgba(0,212,255,0.3)' }}>
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  {saving ? 'SAVING...' : 'SAVE DOCTOR'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
