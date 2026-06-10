'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef, useMemo } from 'react'
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
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [timer, setTimer] = useState(0)
  const router = useRouter()
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

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
    const code = String(Math.floor(100000 + Math.random() * 900000))
    localStorage.setItem('wd_reset_code', code)
    localStorage.setItem('wd_reset_email', email)
    localStorage.setItem('wd_reset_expiry', String(Date.now() + 300000))
    setResetStep(1)
    setSuccess(`Code: ${code}`)
    startTimer()
    setLoading(false)
  }

  async function handleVerifyOtp() {
    const fullOtp = otp.join('')
    if (fullOtp.length < 6) { setError('Enter the complete code'); return }
    setLoading(true)
    setError('')
    const storedCode = localStorage.getItem('wd_reset_code')
    const storedEmail = localStorage.getItem('wd_reset_email')
    const expiry = localStorage.getItem('wd_reset_expiry')
    if (!storedCode || !storedEmail || !expiry) { setError('No code found. Request a new one.'); setLoading(false); return }
    if (Date.now() > Number(expiry)) { setError('Code expired. Request a new one.'); setLoading(false); return }
    if (email !== storedEmail) { setError('Email mismatch. Request a new code.'); setLoading(false); return }
    if (fullOtp !== storedCode) { setError('Wrong code'); setLoading(false); return }
    localStorage.removeItem('wd_reset_code')
    localStorage.removeItem('wd_reset_email')
    localStorage.removeItem('wd_reset_expiry')
    setResetStep(2)
    setLoading(false)
  }

  async function handleResetPassword() {
    if (!newPassword || newPassword.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: newPassword }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); setLoading(false); return }
    } catch {
      setError('Failed to reset password')
      setLoading(false)
      return
    }
    setSuccess('Password reset! Signing in...')
    setLoading(false)
    setTimeout(() => router.push('/'), 1500)
  }

  function cancelReset() {
    setResetStep(0)
    setOtp(['', '', '', '', '', ''])
    setNewPassword('')
    setError('')
    setSuccess('')
    if (timerRef.current) clearInterval(timerRef.current)
    setTimer(0)
  }

  function handleOtpChange(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(0, 1)
    setOtp(prev => {
      const next = [...prev]
      next[index] = digit
      return next
    })
    if (digit && index < 5) {
      setTimeout(() => otpRefs.current[index + 1]?.focus(), 10)
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      setTimeout(() => otpRefs.current[index - 1]?.focus(), 10)
    }
    if (e.key === 'Enter') {
      handleVerifyOtp()
    }
  }

  const formatTimer = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  const inputBase = {
    width: '100%',
    padding: '12px 16px',
    background: 'rgba(0, 0, 0, 0.4)',
    border: '3px solid #2D6A4F',
    color: '#E2E8F0',
    fontFamily: 'VT323, monospace',
    fontSize: '20px',
    outline: 'none',
    transition: 'border-color 200ms ease-out',
  } as const

  const btnGreen = {
    width: '100%',
    padding: '14px',
    background: '#16A34A',
    color: '#E2E8F0',
    border: '3px solid #4ADE80',
    fontFamily: 'VT323, monospace',
    fontSize: '22px',
    letterSpacing: '2px',
    cursor: 'pointer',
    transition: 'transform 160ms ease-out, opacity 200ms',
    outline: 'none',
  } as const

  // Pixel-art tree decorations for login background
  const pixelTrees = [
    { left: '5%', bottom: '12px', scale: 1.2 },
    { left: '18%', bottom: '8px', scale: 0.9 },
    { left: '72%', bottom: '10px', scale: 1.0 },
    { left: '88%', bottom: '6px', scale: 1.3 },
  ]

  const panelSx = {
    width: '100%',
    maxWidth: '420px',
    background: '#0a0f0a',
    border: '4px solid #2D6A4F',
    padding: '40px 32px',
    boxShadow: '6px 6px 0 rgba(0, 0, 0, 0.4)',
    animation: 'float-up 0.5s steps(6) forwards',
    position: 'relative' as const,
    overflow: 'hidden',
  } as const

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#0a0f0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: 'VT323, monospace',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Pixel tree decorations */}
      {pixelTrees.map((t, i) => (
        <div key={i} style={{
          position: 'absolute',
          bottom: t.bottom,
          left: t.left,
          transform: `scale(${t.scale})`,
          opacity: 0.15,
          pointerEvents: 'none',
        }}>
          <svg width="32" height="40" viewBox="0 0 32 40" style={{ imageRendering: 'pixelated' }}>
            <rect x="14" y="4" width="4" height="4" fill="#4ADE80"/>
            <rect x="10" y="8" width="12" height="4" fill="#22C55E"/>
            <rect x="6" y="12" width="20" height="4" fill="#16A34A"/>
            <rect x="10" y="16" width="12" height="4" fill="#22C55E"/>
            <rect x="14" y="20" width="4" height="20" fill="#92400E"/>
          </svg>
        </div>
      ))}

      {/* Main card */}
      <div style={panelSx}>

        {/* Logo + Header */}
        <div style={{
          textAlign: 'center', marginBottom: '28px',
          animation: 'float-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both',
        }}>
          {/* FORESTX badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            border: '2px solid #D4AF37',
            marginBottom: '16px',
            fontSize: '12px',
            fontFamily: "'Press Start 2P', cursive",
            color: '#FBBF24',
            letterSpacing: '1px',
          }}>
            FORESTX HACKATHON 2026
          </div>

          <svg viewBox="0 0 32 32" width="72" height="72" style={{
            imageRendering: 'pixelated',
            marginBottom: '8px',
            display: 'block',
            margin: '0 auto 8px',
          }}>
            <rect x="14" y="2" width="4" height="4" fill="#4ADE80"/>
            <rect x="10" y="6" width="12" height="4" fill="#22C55E"/>
            <rect x="6" y="10" width="20" height="4" fill="#16A34A"/>
            <rect x="14" y="14" width="4" height="18" fill="#92400E"/>
          </svg>

          <h1 style={{
            fontFamily: "'Press Start 2P', cursive",
            fontSize: '22px',
            color: '#4ADE80',
            marginBottom: '4px',
          }}>WildDex</h1>

          <p style={{
            color: '#86EFAC',
            fontSize: '14px',
            marginBottom: '4px',
          }}>
            AI-Driven Species Identification
          </p>

          <p style={{
            color: '#94A3B8',
            fontSize: '13px',
          }}>
            Case Study 4 &middot; FORESTX
          </p>
        </div>

        {/* ====== NOT CONFIGURED ====== */}
        {!configured ? (
          <div style={{
            textAlign: 'center',
            padding: '24px',
            fontSize: '18px',
            color: '#FBBF24',
            lineHeight: 1.6,
            animation: 'float-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both',
          }}>
            <div style={{
              fontSize: '28px', marginBottom: '12px',
              width: '40px', height: '40px', margin: '0 auto 12px',
              border: '3px solid #FBBF24',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              lineHeight: 1,
            }}>!</div>
            Supabase not configured.
            Set <span style={{ color: '#FBBF24', fontFamily: "'Press Start 2P', cursive", fontSize: '12px' }}>NEXT_PUBLIC_SUPABASE_URL</span>
            {' '}and{' '}
            <span style={{ color: '#FBBF24', fontFamily: "'Press Start 2P', cursive", fontSize: '12px' }}>NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
            {' '}in .env.local
          </div>
        ) : /* ====== OTP STEP ====== */
        resetStep === 1 ? (
          <div style={{ animation: 'float-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both' }}>
            <p style={{ color: '#94A3B8', fontSize: '16px', textAlign: 'center', marginBottom: '20px', lineHeight: 1.5 }}>
              Enter the code sent to<br/>
              <span style={{ color: '#86EFAC', fontFamily: "'Press Start 2P', cursive", fontSize: '12px' }}>{email}</span>
            </p>

            {/* 6 OTP cells */}
            <div style={{
              display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '16px',
            }}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => { otpRefs.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(i, e)}
                  onFocus={e => e.target.select()}
                  style={{
                    width: '48px',
                    height: '56px',
                    textAlign: 'center',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: digit
                      ? '3px solid #4ADE80'
                      : '3px solid #2D6A4F',
                    color: '#4ADE80',
                    fontFamily: 'VT323, monospace',
                    fontSize: '28px',
                    outline: 'none',
                    transition: 'border-color 150ms ease-out',
                    animation: digit ? 'otp-pop 0.15s steps(3)' : 'none',
                    caretColor: '#4ADE80',
                  }}
                />
              ))}
            </div>

            <p style={{
              color: timer > 0 ? 'rgba(148, 163, 184, 0.7)' : '#EF4444',
              fontSize: '14px', textAlign: 'center', marginBottom: '16px',
            }}>
              {timer > 0 ? `Code expires in ${formatTimer(timer)}` : 'Code expired — request a new one'}
            </p>

            <button
              onClick={handleVerifyOtp}
              disabled={loading || otp.join('').length < 6}
              style={{
                ...btnGreen,
                opacity: loading || otp.join('').length < 6 ? 0.5 : 1,
                cursor: loading || otp.join('').length < 6 ? 'not-allowed' : 'pointer',
              }}
              onMouseDown={e => {
                if (!loading && otp.join('').length >= 6) {
                  (e.currentTarget as HTMLElement).style.transform = 'scale(0.97)'
                }
              }}
              onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {loading && <span style={{
                  display: 'inline-block', width: '14px', height: '14px',
                  border: '2px solid transparent', borderTopColor: '#E2E8F0',
                  borderRadius: '50%', animation: 'spin 0.6s linear infinite',
                }} />}
                {loading ? 'Verifying...' : 'Verify Code'}
              </span>
            </button>

            <button onClick={cancelReset} style={{
              display: 'block',
              margin: '12px auto 0',
              background: 'none', border: 'none',
              color: 'rgba(148, 163, 184, 0.6)', cursor: 'pointer',
              fontFamily: 'VT323, monospace', fontSize: '16px',
              padding: '6px 12px',
              transition: 'color 200ms',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#86EFAC' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(148, 163, 184, 0.6)' }}
            >
              &larr; Back
            </button>

            {error && <p style={{
              color: '#EF4444', fontSize: '16px', textAlign: 'center',
              marginTop: '16px', padding: '6px 12px',
              border: '2px solid rgba(239, 68, 68, 0.4)',
              background: 'rgba(239, 68, 68, 0.08)',
            }}>{error}</p>}
            {success && <p style={{
              color: '#4ADE80', fontSize: '16px', textAlign: 'center',
              marginTop: '16px', padding: '6px 12px',
              border: '2px solid rgba(74, 222, 128, 0.4)',
              background: 'rgba(74, 222, 128, 0.08)',
            }}>{success}</p>}
          </div>
        ) : /* ====== NEW PASSWORD STEP ====== */
        resetStep === 2 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', gap: '16px',
            animation: 'float-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both',
          }}>
            <p style={{
              color: '#86EFAC', fontSize: '16px', textAlign: 'center',
              padding: '8px 12px',
              border: '2px solid rgba(74, 222, 128, 0.3)',
              background: 'rgba(74, 222, 128, 0.05)',
            }}>
              Verified. Set a new password.
            </p>

            <input
              type="password"
              placeholder="New password (min 6 characters)"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              minLength={6}
              style={{
                ...inputBase,
                borderColor: newPassword.length >= 6
                  ? 'rgba(74, 222, 128, 0.6)'
                  : 'rgba(45, 106, 79, 0.5)',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = '#4ADE80'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#2D6A4F'; }}
            />

            <button
              onClick={handleResetPassword}
              disabled={loading || newPassword.length < 6}
              style={{
                ...btnGreen,
                opacity: loading || newPassword.length < 6 ? 0.5 : 1,
                cursor: loading || newPassword.length < 6 ? 'not-allowed' : 'pointer',
              }}
              onMouseDown={e => {
                if (!loading && newPassword.length >= 6) {
                  (e.currentTarget as HTMLElement).style.transform = 'scale(0.97)'
                }
              }}
              onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {loading && <span style={{
                  display: 'inline-block', width: '14px', height: '14px',
                  border: '2px solid transparent', borderTopColor: '#E2E8F0',
                  borderRadius: '50%', animation: 'spin 0.6s linear infinite',
                }} />}
                {loading ? 'Resetting...' : 'Reset Password'}
              </span>
            </button>

            <button onClick={cancelReset} style={{
              display: 'block',
              margin: '4px auto 0',
              background: 'none', border: 'none',
              color: 'rgba(148, 163, 184, 0.6)', cursor: 'pointer',
              fontFamily: 'VT323, monospace', fontSize: '16px',
              padding: '6px 12px',
              transition: 'color 200ms',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#86EFAC' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(148, 163, 184, 0.6)' }}
            >
              &larr; Back
            </button>

            {error && <p style={{
              color: '#EF4444', fontSize: '16px', textAlign: 'center',
              padding: '6px 12px',
              border: '2px solid rgba(239, 68, 68, 0.4)',
              background: 'rgba(239, 68, 68, 0.08)',
            }}>{error}</p>}
            {success && <p style={{
              color: '#4ADE80', fontSize: '16px', textAlign: 'center',
              padding: '6px 12px',
              border: '2px solid rgba(74, 222, 128, 0.4)',
              background: 'rgba(74, 222, 128, 0.08)',
            }}>{success}</p>}
          </div>
        ) : (
          /* ====== LOGIN / SIGNUP FORM ====== */
          <form onSubmit={handleSubmit} style={{
            display: 'flex', flexDirection: 'column', gap: '14px',
            animation: 'float-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both',
          }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={inputBase}
              onFocus={e => { e.currentTarget.style.borderColor = '#4ADE80'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#2D6A4F'; }}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              style={inputBase}
              onFocus={e => { e.currentTarget.style.borderColor = '#4ADE80'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#2D6A4F'; }}
            />

            {mode === 'login' && (
              <button type="button" onClick={handleSendOtp} style={{
                background: 'none', border: 'none',
                color: 'rgba(148, 163, 184, 0.6)',
                cursor: 'pointer',
                fontFamily: 'VT323, monospace',
                fontSize: '15px',
                textAlign: 'right',
                padding: '2px 0',
                marginTop: '-6px',
                transition: 'color 200ms',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#86EFAC' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(148, 163, 184, 0.6)' }}
              >
                Forgot password?
              </button>
            )}

            {error && <p style={{
              color: '#EF4444', fontSize: '16px', textAlign: 'center',
              padding: '8px 12px',
              border: '2px solid rgba(239, 68, 68, 0.4)',
              background: 'rgba(239, 68, 68, 0.08)',
            }}>{error}</p>}
            {success && <p style={{
              color: '#FBBF24', fontSize: '16px', textAlign: 'center',
              padding: '8px 12px',
              border: '2px solid rgba(251, 191, 36, 0.4)',
              background: 'rgba(251, 191, 36, 0.08)',
            }}>{success}</p>}

            <button
              type="submit"
              disabled={loading}
              style={{
                ...btnGreen,
                opacity: loading ? 0.5 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
              onMouseDown={e => {
                if (!loading) (e.currentTarget as HTMLElement).style.transform = 'scale(0.97)'
              }}
              onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {loading && <span style={{
                  display: 'inline-block', width: '14px', height: '14px',
                  border: '2px solid transparent', borderTopColor: '#E2E8F0',
                  borderRadius: '50%', animation: 'spin 0.6s linear infinite',
                }} />}
                {loading
                  ? (mode === 'login' ? 'Signing in...' : 'Creating account...')
                  : (mode === 'login' ? 'Sign In' : 'Sign Up')
                }
              </span>
            </button>
          </form>
        )}

        {/* Toggle login/signup (only when not in reset flow) */}
        {resetStep === 0 && configured && (
          <p style={{
            textAlign: 'center', marginTop: '20px',
            color: 'rgba(148, 163, 184, 0.6)',
            fontSize: '16px',
            animation: 'float-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both',
          }}>
            {mode === 'login' ? (
              <>No account?{' '}
                <button onClick={() => { setMode('signup'); setError(''); setSuccess('') }} style={{
                  background: 'none', border: 'none',
                  color: '#86EFAC', cursor: 'pointer',
                  fontFamily: 'VT323, monospace', fontSize: '16px',
                  textDecoration: 'underline',
                  textUnderlineOffset: '3px',
                  transition: 'color 200ms',
                  padding: '0',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#4ADE80' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#86EFAC' }}
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button onClick={() => { setMode('login'); setError(''); setSuccess('') }} style={{
                  background: 'none', border: 'none',
                  color: '#86EFAC', cursor: 'pointer',
                  fontFamily: 'VT323, monospace', fontSize: '16px',
                  textDecoration: 'underline',
                  textUnderlineOffset: '3px',
                  transition: 'color 200ms',
                  padding: '0',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#4ADE80' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#86EFAC' }}
                >
                  Sign In
                </button>
              </>
            )}
          </p>
        )}

        {/* UPM footer */}
        <div style={{
          textAlign: 'center', marginTop: '24px',
          fontSize: '12px',
          color: 'rgba(148, 163, 184, 0.25)',
          fontFamily: "'Press Start 2P', cursive",
          letterSpacing: '1px',
          animation: 'float-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.35s both',
        }}>
          UPM &middot; KOLEJ PENDETA ZA&apos;BA &middot; FORESTX
        </div>
      </div>
    </div>
  )
}
