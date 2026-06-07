'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    let supabase
    try {
      supabase = createClient()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Supabase not configured'
      setError(msg)
      setLoading(false)
      return
    }

    let timedOut = false
    const timeout = setTimeout(() => {
      timedOut = true
      setError('Auth check timed out. Server may be unreachable.')
      setLoading(false)
    }, 5000)

    supabase.auth.getUser()
      .then(({ data: { user } }) => {
        if (timedOut) return
        clearTimeout(timeout)
        if (!user) {
          router.push('/login')
          return
        }
        setUser(user)
        setLoading(false)
      })
      .catch((e: unknown) => {
        if (timedOut) return
        clearTimeout(timeout)
        const msg = e instanceof Error ? e.message : 'Auth check failed'
        setError(msg)
        setLoading(false)
      })
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100dvh',
        background: '#0a0f0a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        color: '#4ADE80',
        fontFamily: 'VT323, monospace',
      }}>
        {/* Pixel tree skeleton */}
        <div style={{ animation: 'skeleton-pulse 1.2s steps(3) infinite' }}>
          <svg width="48" height="60" viewBox="0 0 32 40" style={{ imageRendering: 'pixelated' }}>
            <rect x="14" y="4" width="4" height="4" fill="#4ADE80"/>
            <rect x="10" y="8" width="12" height="4" fill="#22C55E"/>
            <rect x="6" y="12" width="20" height="4" fill="#16A34A"/>
            <rect x="10" y="16" width="12" height="4" fill="#22C55E"/>
            <rect x="14" y="20" width="4" height="20" fill="#92400E"/>
          </svg>
        </div>
        {/* Skeleton bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '200px' }}>
          <div style={{ height: '8px', background: '#1a2e1a', border: '1px solid #2D6A4F', animation: 'skeleton-bar 1s steps(4) infinite' }}/>
          <div style={{ height: '8px', background: '#1a2e1a', border: '1px solid #2D6A4F', animation: 'skeleton-bar 1s steps(4) 0.2s infinite' }}/>
          <div style={{ height: '8px', background: '#1a2e1a', border: '1px solid #2D6A4F', animation: 'skeleton-bar 1s steps(4) 0.4s infinite' }}/>
        </div>
        <div style={{ fontSize: '18px', color: '#4ADE80' }}>Loading...</div>
        <div style={{ fontSize: '14px', color: '#6B7280' }}>Checking auth (max 5s)</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100dvh',
        background: '#0a0f0a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        color: '#FBBF24',
        fontFamily: "'Press Start 2P', cursive",
        fontSize: '10px',
        textAlign: 'center',
        lineHeight: 2,
        padding: '32px',
      }}>
        <div>{error}</div>
        <button
          onClick={() => router.push('/login')}
          style={{
            background: 'transparent',
            border: '2px solid #FBBF24',
            color: '#FBBF24',
            padding: '8px 20px',
            fontFamily: 'VT323, monospace',
            fontSize: '18px',
            cursor: 'pointer',
            marginTop: '8px',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#FBBF24'
            e.currentTarget.style.color = '#0a0f0a'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = '#FBBF24'
          }}
        >
          Go to Login
        </button>
      </div>
    )
  }

  return <SPAWrapper userEmail={user?.email || ''} onSignOut={handleSignOut} />
}

function SPAWrapper({ userEmail, onSignOut }: { userEmail: string; onSignOut: () => void }) {
  const [iframeLoaded, setIframeLoaded] = useState(false)

  return (
    <div style={{ width: '100%', height: '100dvh', position: 'relative', background: '#0a0f0a', overflow: 'hidden' }}>
      {/* Auth bar - pixel HUD */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '40px',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 12px',
        background: '#0a0f0a',
        borderBottom: '3px solid #2D6A4F',
        boxShadow: '0 3px 0 rgba(0,0,0,0.4)',
        fontFamily: 'VT323, monospace',
        fontSize: '14px',
        color: '#86EFAC',
        imageRendering: 'pixelated',
      }}>
        {/* Left: Pixel tree icon + WildDex */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="20" height="20" viewBox="0 0 32 32" style={{ imageRendering: 'pixelated', flexShrink: 0 }}>
            <rect x="14" y="2" width="4" height="4" fill="#4ADE80"/>
            <rect x="10" y="6" width="12" height="4" fill="#22C55E"/>
            <rect x="6" y="10" width="20" height="4" fill="#16A34A"/>
            <rect x="14" y="14" width="4" height="18" fill="#92400E"/>
          </svg>
          <span style={{ color: '#4ADE80', fontSize: '16px', fontFamily: "'Press Start 2P', cursive", letterSpacing: '1px' }}>WildDex</span>
        </div>

        {/* Right: email + Sign Out */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            fontSize: '13px',
            color: '#6B7280',
            maxWidth: '140px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontFamily: 'VT323, monospace',
          }}>{userEmail}</span>
          <button onClick={onSignOut} style={{
            background: 'transparent',
            border: '2px solid #4ADE80',
            color: '#4ADE80',
            borderRadius: 0,
            padding: '3px 10px',
            cursor: 'pointer',
            fontFamily: 'VT323, monospace',
            fontSize: '13px',
            lineHeight: '1.4',
            transition: 'all 160ms ease-out',
            imageRendering: 'pixelated',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#4ADE80'
            e.currentTarget.style.color = '#0a0f0a'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = '#4ADE80'
          }}
          >
            Sign Out
          </button>
        </div>
      </div>
      {/* Iframe with user email in hash */}
      <iframe
        src={`/index.html?v=7#user=${encodeURIComponent(userEmail)}`}
        onLoad={() => setIframeLoaded(true)}
        style={{
          position: 'absolute',
          top: '40px',
          width: '100%',
          height: 'calc(100% - 40px)',
          border: 'none',
        }}
        title="WildDex"
      />
    </div>
  )
}