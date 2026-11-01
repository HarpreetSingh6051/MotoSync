import { useState } from 'react'
import { Bike, KeyRound, Mail, MapPin, ShieldCheck, User, UserPlus } from 'lucide-react'
import { Button, Modal } from '@/components/ui'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'
import { cx } from '@/lib/format'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'https://moto-sync-be.vercel.app/api/v1').replace(/\/$/, '')

interface AuthModalProps {
  open: boolean
  onClose: () => void
}

export const AuthModal = ({ open, onClose }: AuthModalProps) => {
  const [mode, setMode] = useState<'register' | 'signin'>('register')
  const [fullName, setFullName] = useState('')
  const [handle, setHandle] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [primaryBike, setPrimaryBike] = useState('')
  const [city, setCity] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const pushToast = useAppStore((state) => state.pushToast)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)

    try {
      if (mode === 'register') {
        if (!fullName.trim() || !email.trim() || !password.trim()) {
          throw new Error('Please enter your full name, email and a password.')
        }

        const userHandle = handle.trim() || fullName.toLowerCase().replace(/[^a-z0-9]/g, '')
        const bikeModel = primaryBike.trim() || 'Harley-Davidson Fat Bob 114'
        const baseCity = city.trim() || 'Ludhiana, IN'

        // 1. Supabase Auth signup
        if (supabase) {
          try {
            await supabase.auth.signUp({
              email: email.trim(),
              password: password.trim(),
              options: {
                data: {
                  full_name: fullName.trim(),
                  user_name: userHandle,
                  primary_bike: bikeModel,
                  city: baseCity,
                },
              },
            })
          } catch (authErr) {
            console.warn('Supabase auth signup fallback:', authErr)
          }
        }

        // 2. Sync to Backend REST API so Super Admin ERP CRM immediately reflects the new user
        try {
          await fetch(`${API_BASE}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: `u_${Date.now()}`,
              handle: userHandle,
              full_name: fullName.trim(),
              city: baseCity,
              country: 'IN',
              primary_bike: bikeModel,
              email: email.trim(),
              is_pro: false,
              total_km: 0,
              role: 'rider',
              status: 'active',
            }),
          })
        } catch (apiErr) {
          console.warn('Backend API registration fallback:', apiErr)
        }

        pushToast('Welcome to MotoSync!', `Account created for ${fullName}. You are now registered with the pack.`, 'success')
        onClose()
      } else {
        // Sign in
        if (!email.trim() || !password.trim()) {
          throw new Error('Please enter your email and password.')
        }

        if (supabase) {
          const { error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password.trim(),
          })
          if (error) throw error
        }

        pushToast('Signed In', `Welcome back to the pack!`, 'success')
        onClose()
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Authentication error. Please check your inputs.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === 'register' ? 'Join the Pack' : 'Rider Sign In'}
      subtitle={
        mode === 'register'
          ? 'Register your profile, garage bike, and connect with riding clubs.'
          : 'Sign in to access your pack rides, clubs, and telemetry.'
      }
      size="md"
    >
      <div className="space-y-4">
        {/* Mode Toggle Tabs */}
        <div className="flex rounded-xl bg-white/[0.04] p-1 border border-white/10">
          <button
            type="button"
            onClick={() => {
              setMode('register')
              setErrorMsg('')
            }}
            className={cx(
              'flex-1 rounded-lg py-2 text-xs font-semibold transition',
              mode === 'register'
                ? 'bg-amber-400 text-black shadow'
                : 'text-white/60 hover:text-white',
            )}
          >
            Register Profile
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signin')
              setErrorMsg('')
            }}
            className={cx(
              'flex-1 rounded-lg py-2 text-xs font-semibold transition',
              mode === 'signin'
                ? 'bg-amber-400 text-black shadow'
                : 'text-white/60 hover:text-white',
            )}
          >
            Sign In
          </button>
        </div>

        {errorMsg ? (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            {errorMsg}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <>
              <div>
                <label className="label mb-1.5 block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/35" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Harpreet Singh"
                    className="field pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label mb-1.5 block">Handle</label>
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="harpreetrides"
                    className="field"
                  />
                </div>
                <div>
                  <label className="label mb-1.5 block">City</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/35" />
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Ludhiana, IN"
                      className="field pl-10"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="label mb-1.5 block">Primary Motorcycle</label>
                <div className="relative">
                  <Bike className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/35" />
                  <input
                    type="text"
                    value={primaryBike}
                    onChange={(e) => setPrimaryBike(e.target.value)}
                    placeholder="e.g. Harley-Davidson Fat Bob 114"
                    className="field pl-10"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="label mb-1.5 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/35" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rider@motosync.app"
                className="field pl-10"
              />
            </div>
          </div>

          <div>
            <label className="label mb-1.5 block">Password</label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/35" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="field pl-10"
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              full
              loading={loading}
              icon={mode === 'register' ? <UserPlus className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
            >
              {mode === 'register' ? 'Complete Registration' : 'Sign In to MotoSync'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
