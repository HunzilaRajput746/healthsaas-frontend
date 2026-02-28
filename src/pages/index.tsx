import { GetServerSideProps } from 'next'
import Head from 'next/head'
import ChatWidget from '@/components/chat/ChatWidget'
import { Stethoscope, LayoutDashboard, ChevronRight, Shield } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/router'

interface Props {
  clinicId: string
  clinicName: string
}

const QUICK_MESSAGES = [
  { label: '📅 Book Appointment', message: 'I want to book an appointment', color: '#0ea5e9' },
  { label: '👨‍⚕️ Doctor Timings', message: 'Show me available doctors and their timings', color: '#8b5cf6' },
  { label: '🧪 Lab Test Info', message: 'What lab tests are available and their fees?', color: '#10b981' },
]

export default function ClinicChatPage({ clinicId, clinicName }: Props) {
  const [triggerMessage, setTriggerMessage] = useState<string | null>(null)
  const router = useRouter()

  const handleQuickAction = (message: string) => {
    setTriggerMessage(message)
    setTimeout(() => setTriggerMessage(null), 500)
  }

  return (
    <>
      <Head>
        <title>{clinicName} — Book Appointment</title>
        <meta name="description" content={`Book your appointment at ${clinicName} with our AI assistant`} />
        <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </Head>

      {/* ── WHITE background with neon accents ── */}
      <div className="min-h-screen relative overflow-hidden" style={{ background: '#ffffff' }}>

        {/* Subtle grid pattern on white */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(14,165,233,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.04) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />

        {/* Neon color blobs — soft on white */}
        <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.08), transparent 70%)' }} />
        <div className="absolute bottom-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.08), transparent 70%)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.05), transparent 70%)' }} />

        {/* ── NAVBAR ── */}
        <nav className="relative z-20 flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg" style={{
              background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)',
            }}>
              <Stethoscope size={18} color="white" />
            </div>
            <span className="font-bold text-gray-900 text-base" style={{ fontFamily: 'Sora, sans-serif' }}>
              {clinicName}
            </span>
          </div>

          {/* Admin Login Button */}
          <button
            onClick={() => router.push('/admin/login')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
            style={{
              background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)',
              color: 'white',
              boxShadow: '0 4px 15px rgba(14,165,233,0.3)',
              fontFamily: 'Sora, sans-serif',
            }}
          >
            <Shield size={14} />
            Admin Login
          </button>
        </nav>

        {/* ── HERO SECTION ── */}
        <div className="relative z-10 flex flex-col items-center justify-center px-4 pt-12 pb-8">

          {/* Icon */}
          <div className="mb-6 relative">
            <div className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl" style={{
              background: 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)',
              boxShadow: '0 20px 60px rgba(14,165,233,0.25)',
            }}>
              <Stethoscope size={42} color="white" />
            </div>
            {/* Live dot */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center" style={{ background: '#10b981' }}>
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-5xl font-extrabold text-center mb-3 text-gray-900" style={{ fontFamily: 'Sora, sans-serif', letterSpacing: '-0.02em' }}>
            {clinicName}
          </h1>
          <p className="text-lg text-gray-500 text-center mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>
            AI-Powered Healthcare Assistant
          </p>
          <div className="flex items-center gap-2 mb-10">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#10b981' }} />
            <span className="text-sm font-medium" style={{ color: '#10b981', fontFamily: 'Sora, sans-serif' }}>Available 24/7</span>
          </div>

          {/* ── Quick Action Cards ── */}
          <div className="flex flex-wrap gap-3 justify-center mb-8 max-w-lg">
            {QUICK_MESSAGES.map(({ label, message, color }) => (
              <button
                key={label}
                onClick={() => handleQuickAction(message)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  background: `${color}12`,
                  border: `1.5px solid ${color}35`,
                  color: color,
                  boxShadow: `0 2px 12px ${color}18`,
                  fontFamily: 'Sora, sans-serif',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <p className="text-sm text-gray-400" style={{ fontFamily: 'Sora, sans-serif' }}>
            Click a button above or the chat icon to get started →
          </p>
        </div>

        {/* ── STATS BAR ── */}
        <div className="relative z-10 max-w-2xl mx-auto px-4 mt-4 mb-8">
          <div className="rounded-2xl p-5 grid grid-cols-3 gap-4" style={{
            background: 'rgba(248,250,252,0.9)',
            border: '1.5px solid rgba(14,165,233,0.12)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            backdropFilter: 'blur(10px)',
          }}>
            {[
              { label: 'Instant Booking', icon: '📅', color: '#0ea5e9' },
              { label: 'AI Receptionist', icon: '🤖', color: '#8b5cf6' },
              { label: 'WhatsApp Confirm', icon: '📱', color: '#10b981' },
            ].map(item => (
              <div key={item.label} className="text-center">
                <div className="text-2xl mb-1">{item.icon}</div>
                <div className="text-xs font-semibold text-gray-600" style={{ fontFamily: 'Sora, sans-serif' }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── ADMIN LINK at bottom ── */}
        <div className="relative z-10 text-center pb-8">
          <button
            onClick={() => router.push('/admin/login')}
            className="inline-flex items-center gap-2 text-sm transition-all hover:gap-3"
            style={{ color: '#94a3b8', fontFamily: 'Sora, sans-serif' }}
          >
            <LayoutDashboard size={14} />
            <span>Admin Dashboard</span>
            <ChevronRight size={14} />
          </button>
        </div>

      </div>

      <ChatWidget
        clinicId={clinicId}
        clinicName={clinicName}
        accentColor="blue"
        triggerMessage={triggerMessage}
      />
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const clinicId = (query.clinic as string) || process.env.DEFAULT_CLINIC_ID || ''
  const clinicName = (query.name as string) || 'HealthSaaS Clinic'
  return { props: { clinicId, clinicName } }
}
