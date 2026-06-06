'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [configured, setConfigured] = useState(true)
  const [resetStep, setResetStep] = useState(0)
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [timer, setTimer] = useState(0)
  const router = useRouter()

  useEffect(() => {
    let supabase
    try {
      supabase = createClient()
    } catch {
      setConfigured(false)
      return
    }
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.push('/')
    })
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  function startTimer() {
    setTimer(300)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimer(t => { if (t <= 1) { if (timerRef.current) clearInterval(timerRef.current); return 0 } return t - 1 })
    }, 1000)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    let supabase
    try {
      supabase = createClient()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Supabase not configured'
      setError(msg)
      setLoading(false)
      return
    }

    const options = { email, password }

    const { error: authError } = mode === 'login'
      ? await supabase.auth.signInWithPassword(options)
      : await supabase.auth.signUp(options)

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (mode === 'signup') {
      setSuccess('Signed up! Check your email to confirm.')
      setLoading(false)
      return
    }

    router.push('/')
  }

  async function handleSendOtp() {
    if (!email) { setError('Enter your email first'); return }
    setLoading(true)
    setError('')
    setSuccess('')
    let supabase
    try {
      supabase = createClient()
    } catch {
      setError('Supabase not configured')
      setLoading(false)
      return
    }
    const { error: otpError } = await supabase.auth.signInWithOtp({ email })
    if (otpError) { setError(otpError.message); setLoading(false); return }
    setResetStep(1)
    setSuccess('6-digit code sent! Check your email.')
    startTimer()
    setLoading(false)
  }

  async function handleVerifyOtp() {
    if (!otp) { setError('Enter the code'); return }
    setLoading(true)
    setError('')
    let supabase
    try {
      supabase = createClient()
    } catch {
      setError('Supabase not configured')
      setLoading(false)
      return
    }
    const { error: verifyError } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' })
    if (verifyError) { setError(verifyError.message); setLoading(false); return }
    setResetStep(2)
    setSuccess('')
    setLoading(false)
  }

  async function handleResetPassword() {
    if (!newPassword || newPassword.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    setError('')
    let supabase
    try {
      supabase = createClient()
    } catch {
      setError('Supabase not configured')
      setLoading(false)
      return
    }
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
    if (updateError) { setError(updateError.message); setLoading(false); return }
    setSuccess('Password reset! Signing in...')
    setLoading(false)
    setTimeout(() => router.push('/'), 1500)
  }

  function cancelReset() {
    setResetStep(0)
    setOtp('')
    setNewPassword('')
    setError('')
    setSuccess('')
    if (timerRef.current) clearInterval(timerRef.current)
    setTimer(0)
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #0a0f0a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: 'VT323, monospace',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: 'rgba(30, 41, 59, 0.9)',
        border: '3px solid #4ADE80',
        borderRadius: '12px',
        padding: '40px 32px',
        boxShadow: '0 0 40px rgba(74, 222, 128, 0.2)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <svg viewBox="0 0 32 32" width="64" height="64" style={{ imageRendering: 'pixelated', marginBottom: '12px' }}>
            <rect x="14" y="2" width="4" height="4" fill="#4ADE80"/>
            <rect x="10" y="6" width="12" height="4" fill="#22C55E"/>
            <rect x="6" y="10" width="20" height="4" fill="#16A34A"/>
            <rect x="14" y="14" width="4" height="18" fill="#92400E"/>
          </svg>
          <h1 style={{
            fontFamily: "'Press Start 2P', cursive",
            fontSize: '24px',
            color: '#4ADE80',
            textShadow: '0 0 20px rgba(74, 222, 128, 0.5)',
            marginBottom: '8px',
          }}>WildDex</h1>
          <p style={{ color: '#86EFAC', fontSize: '20px' }}>Gotta Log &apos;Em All!</p>
        </div>

{!configured ? (
          <div style={{
            textAlign: 'center',
            padding: '24px',
            fontFamily: 'VT323, monospace',
            fontSize: '20px',
            color: '#FBBF24',
            lineHeight: 1.6,
          }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>⚙</div>
            Supabase not configured.<br/>
            Set NEXT_PUBLIC_SUPABASE_URL<br/>
            and NEXT_PUBLIC_SUPABASE_ANON_KEY<br/>
            in .env.local
          </div>
        ) : resetStep === 1 ? (
          <>
          <p style={{ color: '#94A3B8', fontSize: '16px', textAlign: 'center', marginBottom: '16px' }}>
            Enter the code sent to<br/>
            <strong style={{ color: '#86EFAC', fontSize: '18px' }}>{email}</strong>
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="text"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              style={{
                padding: '12px 16px',
                background: '#0F172A',
                border: '2px solid #334155',
                borderRadius: '8px',
                color: '#E2E8F0',
                fontFamily: 'VT323, monospace',
                fontSize: '28px',
                textAlign: 'center',
                letterSpacing: '8px',
                outline: 'none',
              }}
            />
            <p style={{ color: '#94A3B8', fontSize: '16px', textAlign: 'center' }}>
              {timer > 0 ? `Code expires in ${fmt(timer)}` : 'Code expired'}
            </p>
            <button onClick={handleVerifyOtp} disabled={loading || otp.length < 6} style={{
              padding: '14px',
              background: '#4ADE80',
              color: '#0F172A',
              border: 'none',
              borderRadius: '8px',
              fontFamily: 'VT323, monospace',
              fontSize: '22px',
              cursor: loading || otp.length < 6 ? 'not-allowed' : 'pointer',
              opacity: loading || otp.length < 6 ? 0.6 : 1,
              letterSpacing: '2px',
            }}>
              {loading ? '...' : 'Verify Code'}
            </button>
            <button onClick={cancelReset} style={{
              background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer',
              fontFamily: 'VT323, monospace', fontSize: '16px', textDecoration: 'underline',
              padding: '8px',
            }}>
              Back
            </button>
          </div>
          {error && <p style={{ color: '#EF4444', fontSize: '18px', textAlign: 'center', marginTop: '12px' }}>{error}</p>}
          {success && <p style={{ color: '#4ADE80', fontSize: '18px', textAlign: 'center', marginTop: '12px' }}>{success}</p>}
          </>
        ) : resetStep === 2 ? (
          <>
          <p style={{ color: '#86EFAC', fontSize: '18px', textAlign: 'center', marginBottom: '16px' }}>
            Enter new password
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="password"
              placeholder="New password (min 6 chars)"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              minLength={6}
              style={{
                padding: '12px 16px',
                background: '#0F172A',
                border: '2px solid #334155',
                borderRadius: '8px',
                color: '#E2E8F0',
                fontFamily: 'VT323, monospace',
                fontSize: '20px',
                outline: 'none',
              }}
            />
            <button onClick={handleResetPassword} disabled={loading || newPassword.length < 6} style={{
              padding: '14px',
              background: '#4ADE80',
              color: '#0F172A',
              border: 'none',
              borderRadius: '8px',
              fontFamily: 'VT323, monospace',
              fontSize: '22px',
              cursor: loading || newPassword.length < 6 ? 'not-allowed' : 'pointer',
              opacity: loading || newPassword.length < 6 ? 0.6 : 1,
              letterSpacing: '2px',
            }}>
              {loading ? '...' : 'Reset Password'}
            </button>
            <button onClick={cancelReset} style={{
              background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer',
              fontFamily: 'VT323, monospace', fontSize: '16px', textDecoration: 'underline',
              padding: '8px',
            }}>
              Back
            </button>
          </div>
          {error && <p style={{ color: '#EF4444', fontSize: '18px', textAlign: 'center', marginTop: '12px' }}>{error}</p>}
          {success && <p style={{ color: '#4ADE80', fontSize: '18px', textAlign: 'center', marginTop: '12px' }}>{success}</p>}
          </>
        ) : (
          <>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                padding: '12px 16px',
                background: '#0F172A',
                border: '2px solid #334155',
                borderRadius: '8px',
                color: '#E2E8F0',
                fontFamily: 'VT323, monospace',
                fontSize: '20px',
                outline: 'none',
              }}
            />
            {mode === 'login' && (
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                style={{
                  padding: '12px 16px',
                  background: '#0F172A',
                  border: '2px solid #334155',
                  borderRadius: '8px',
                  color: '#E2E8F0',
                  fontFamily: 'VT323, monospace',
                  fontSize: '20px',
                  outline: 'none',
                }}
              />
            )}
            {mode === 'login' && (
              <button type="button" onClick={handleSendOtp} style={{
                background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer',
                fontFamily: 'VT323, monospace', fontSize: '16px', textAlign: 'right',
                padding: '0', marginTop: '-8px', textDecoration: 'underline',
              }}>
                Forgot password?
              </button>
            )}
            {error && <p style={{ color: '#EF4444', fontSize: '18px', textAlign: 'center' }}>{error}</p>}
            {success && <p style={{ color: '#4ADE80', fontSize: '18px', textAlign: 'center' }}>{success}</p>}
            {mode === 'login' ? (
              <button type="submit" disabled={loading} style={{
                padding: '14px',
                background: '#4ADE80',
                color: '#0F172A',
                border: 'none',
                borderRadius: '8px',
                fontFamily: 'VT323, monospace',
                fontSize: '22px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                letterSpacing: '2px',
              }}>
                {loading ? '...' : 'Sign In'}
              </button>
            ) : (
              <button type="submit" disabled={loading} style={{
                padding: '14px',
                background: '#4ADE80',
                color: '#0F172A',
                border: 'none',
                borderRadius: '8px',
                fontFamily: 'VT323, monospace',
                fontSize: '22px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                letterSpacing: '2px',
              }}>
                {loading ? '...' : 'Sign Up'}
              </button>
            )}
          </form>

          <p style={{ textAlign: 'center', marginTop: '24px', color: '#94A3B8', fontSize: '18px' }}>
            {mode === 'login' ? (
              <>No account?{' '}
                <button onClick={() => { setMode('signup'); setError(''); setSuccess('') }} style={{
                  background: 'none', border: 'none', color: '#4ADE80', cursor: 'pointer',
                  fontFamily: 'VT323, monospace', fontSize: '18px', textDecoration: 'underline',
                }}>
                  Sign Up
                </button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button onClick={() => { setMode('login'); setError(''); setSuccess('') }} style={{
                  background: 'none', border: 'none', color: '#4ADE80', cursor: 'pointer',
                  fontFamily: 'VT323, monospace', fontSize: '18px', textDecoration: 'underline',
                }}>
                  Sign In
                </button>
              </>
            )}
          </p>
          </>
        )}
      </div>
    </div>
  )
}
