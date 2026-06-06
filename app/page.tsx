'use client'
export const dynamic = 'force-dynamic'

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

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
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
        alignItems: 'center',
        justifyContent: 'center',
        color: '#4ADE80',
        fontFamily: 'VT323, monospace',
        fontSize: '24px',
      }}>
        Loading...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100dvh',
        background: '#0a0f0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#FBBF24',
        fontFamily: "'Press Start 2P', cursive",
        fontSize: '10px',
        textAlign: 'center',
        lineHeight: 2,
        padding: '32px',
      }}>
        {error}
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
        height: '36px',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 10px',
        background: 'linear-gradient(180deg, #0a0f0a 0%, #0d1a0d 100%)',
        borderBottom: '2px solid #2D6A4F',
        fontFamily: 'VT323, monospace',
        fontSize: '14px',
        color: '#86EFAC',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <svg width="18" height="18" viewBox="0 0 32 32" style={{ imageRendering: 'pixelated' }}>
            <rect x="14" y="2" width="4" height="4" fill="#4ADE80"/>
            <rect x="10" y="6" width="12" height="4" fill="#22C55E"/>
            <rect x="6" y="10" width="20" height="4" fill="#16A34A"/>
            <rect x="14" y="14" width="4" height="18" fill="#92400E"/>
          </svg>
          <span style={{ color: '#4ADE80', fontSize: '15px', fontWeight: 600 }}>WildDex</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '12px',
            color: '#6B7280',
            maxWidth: '160px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>{userEmail}</span>
          <button onClick={onSignOut} style={{
            background: 'transparent',
            border: '1px solid #4ADE80',
            color: '#4ADE80',
            borderRadius: '2px',
            padding: '2px 8px',
            cursor: 'pointer',
            fontFamily: 'VT323, monospace',
            fontSize: '12px',
            lineHeight: '1.4',
            transition: 'background 0.15s',
            imageRendering: 'pixelated',
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(74, 222, 128, 0.15)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            Sign Out
          </button>
        </div>
      </div>
      {/* Iframe with user email injected after load */}
      <iframe
        src={`/index.html`}
        onLoad={(e) => {
          // Inject user email into iframe's URL hash after load
          try {
            const iframe = e.target as HTMLIFrameElement
            const src = iframe.src
            if (!src.includes('#user=')) {
              iframe.src = `/index.html#user=${encodeURIComponent(userEmail)}`
            }
          } catch {}
          setIframeLoaded(true)
        }}
        style={{
          position: 'absolute',
          top: '36px',
          width: '100%',
          height: 'calc(100% - 36px)',
          border: 'none',
        }}
        title="WildDex"
      />
    </div>
  )
}