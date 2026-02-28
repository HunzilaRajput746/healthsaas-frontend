'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, X, Save, Loader2, FlaskConical } from 'lucide-react'
import { clinicAPI } from '@/lib/api'
import toast from 'react-hot-toast'

const emptyTest = {
  name: '', category: '', description: '',
  fee: '', preparation: '',
  duration_minutes: 30, report_time_hours: 24,
}

export default function LabTestManager() {
  const [tests, setTests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<any>(emptyTest)
  const [saving, setSaving] = useState(false)

  const fetchTests = async () => {
    try {
      const res = await clinicAPI.getLabTests()
      setTests(res.data)
    } catch { toast.error('Failed to load lab tests') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchTests() }, [])

  const openAdd = () => { setForm(emptyTest); setEditingId(null); setShowForm(true) }
  const openEdit = (t: any) => {
    setForm({ ...t, fee: t.fee.toString() })
    setEditingId(t.test_id)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.fee) { toast.error('Name and fee are required'); return }
    setSaving(true)
    try {
      const payload = { ...form, fee: parseFloat(form.fee) }
      if (editingId) {
        await clinicAPI.updateLabTest(editingId, payload)
        toast.success('Test updated')
      } else {
        await clinicAPI.addLabTest(payload)
        toast.success('Test added')
      }
      setShowForm(false)
      fetchTests()
    } catch { toast.error('Save failed') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Deactivate "${name}"?`)) return
    try {
      await clinicAPI.deleteLabTest(id)
      toast.success('Test deactivated')
      fetchTests()
    } catch { toast.error('Delete failed') }
  }

  const inputClass = "w-full px-3 py-2.5 rounded-xl bg-[#030712] text-sm text-slate-200 placeholder-slate-600 outline-none"
  const inputStyle = { border: '1px solid rgba(0,255,136,0.15)' }

  const CATEGORIES = ['Blood Test', 'Urine Test', 'Radiology', 'ECG', 'Endoscopy', 'Microbiology', 'Other']

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold font-display text-white">Lab Tests</h2>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
          style={{ background: 'rgba(0,255,136,0.15)', border: '1px solid rgba(0,255,136,0.3)', color: '#00ff88' }}>
          <Plus size={15} /> Add Test
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin" color="#00ff88" /></div>
      ) : tests.length === 0 ? (
        <div className="text-center py-20 text-slate-600">
          <FlaskConical size={40} className="mx-auto mb-3 opacity-30" />
          <p>No lab tests added yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tests.map(test => (
            <motion.div key={test.test_id} layout
              className="p-5 rounded-xl"
              style={{ background: '#0d1527', border: 'rgba(0,255,136,0.08) 1px solid' }}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{test.name}</p>
                  {test.category && (
                    <span className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block"
                      style={{ background: 'rgba(0,255,136,0.1)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.2)' }}>
                      {test.category}
                    </span>
                  )}
                </div>
                <div className="flex gap-2 ml-2">
                  <button onClick={() => openEdit(test)} className="p-1.5 rounded-lg"
                    style={{ background: 'rgba(0,212,255,0.1)', color: '#00d4ff' }}>
                    <Pencil size={12} />
                  </button>
                  <button onClick={() => handleDelete(test.test_id, test.name)} className="p-1.5 rounded-lg"
                    style={{ background: 'rgba(255,45,155,0.1)', color: '#ff2d9b' }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              <p className="text-lg font-bold font-mono mt-3" style={{ color: '#9b59ff' }}>PKR {test.fee}</p>
              <div className="flex gap-3 mt-2 text-xs text-slate-600">
                <span>⏱ {test.duration_minutes}min</span>
                <span>📋 Report: {test.report_time_hours}h</span>
              </div>
              {test.preparation && (
                <p className="text-xs text-slate-600 mt-1">Prep: {test.preparation}</p>
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
            <motion.div className="relative z-10 w-full max-w-md rounded-2xl p-6 overflow-y-auto max-h-[90vh]"
              style={{ background: '#0a0f1e', border: '1px solid rgba(0,255,136,0.2)' }}
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold font-display text-white">{editingId ? 'EDIT TEST' : 'ADD LAB TEST'}</h3>
                <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white"><X size={18} /></button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-500 font-mono mb-1 block">TEST NAME *</label>
                  <input className={inputClass} style={inputStyle} value={form.name}
                    onChange={e => setForm((p: any) => ({ ...p, name: e.target.value }))} placeholder="e.g. Complete Blood Count" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500 font-mono mb-1 block">CATEGORY</label>
                    <select className={inputClass} style={inputStyle} value={form.category}
                      onChange={e => setForm((p: any) => ({ ...p, category: e.target.value }))}>
                      <option value="">Select...</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-mono mb-1 block">FEE (PKR) *</label>
                    <input className={inputClass} style={inputStyle} type="number" value={form.fee}
                      onChange={e => setForm((p: any) => ({ ...p, fee: e.target.value }))} placeholder="800" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500 font-mono mb-1 block">DURATION (min)</label>
                    <input className={inputClass} style={inputStyle} type="number" value={form.duration_minutes}
                      onChange={e => setForm((p: any) => ({ ...p, duration_minutes: parseInt(e.target.value) }))} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-mono mb-1 block">REPORT IN (hours)</label>
                    <input className={inputClass} style={inputStyle} type="number" value={form.report_time_hours}
                      onChange={e => setForm((p: any) => ({ ...p, report_time_hours: parseInt(e.target.value) }))} />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-500 font-mono mb-1 block">PREPARATION INSTRUCTIONS</label>
                  <textarea className={inputClass} style={inputStyle} value={form.preparation} rows={2}
                    onChange={e => setForm((p: any) => ({ ...p, preparation: e.target.value }))} placeholder="e.g. Fast for 8 hours" />
                </div>

                <button onClick={handleSave} disabled={saving}
                  className="w-full py-3 rounded-xl font-semibold text-sm font-display flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #00ff88, #00cc66)', color: '#030712', boxShadow: '0 0 20px rgba(0,255,136,0.3)' }}>
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  {saving ? 'SAVING...' : 'SAVE TEST'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
