'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [configured, setConfigured] = useState(true)
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
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

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
      setError('Check your email to confirm your account!')
      setLoading(false)
      return
    }

    router.push('/')
  }

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
              fontFamily: "'Press Start 2P', cursive",
              fontSize: '10px',
              color: '#FBBF24',
              lineHeight: 1.8,
            }}>
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>⚙</div>
              Supabase not configured.<br/>
              Set NEXT_PUBLIC_SUPABASE_URL<br/>
              and NEXT_PUBLIC_SUPABASE_ANON_KEY<br/>
              in .env.local
            </div>
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
              {error && (
                <p style={{ color: error.includes('Check your email') ? '#4ADE80' : '#EF4444', fontSize: '18px', textAlign: 'center' }}>
                  {error}
                </p>
              )}
              <button type="submit" disabled={loading} style={{
                padding: '14px',
                background: '#4ADE80',
                color: '#0F172A',
                border: 'none',
                borderRadius: '8px',
                fontFamily: "'Press Start 2P', cursive",
                fontSize: '12px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                textTransform: 'uppercase',
              }}>
                {loading ? '...' : mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '24px', color: '#94A3B8', fontSize: '18px' }}>
              {mode === 'login' ? (
                <>No account?{' '}
                  <button onClick={() => { setMode('signup'); setError('') }} style={{
                    background: 'none', border: 'none', color: '#4ADE80', cursor: 'pointer',
                    fontFamily: 'VT323, monospace', fontSize: '18px', textDecoration: 'underline',
                  }}>
                    Sign up
                  </button>
                </>
              ) : (
                <>Already have an account?{' '}
                  <button onClick={() => { setMode('login'); setError('') }} style={{
                    background: 'none', border: 'none', color: '#4ADE80', cursor: 'pointer',
                    fontFamily: 'VT323, monospace', fontSize: '18px', textDecoration: 'underline',
                  }}>
                    Sign in
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