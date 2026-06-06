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
      {/* Auth bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '30px',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: '12px',
        padding: '4px 12px',
        background: 'rgba(10, 15, 10, 0.85)',
        backdropFilter: 'blur(4px)',
        fontFamily: 'VT323, monospace',
        fontSize: '16px',
        color: '#86EFAC',
      }}>
        <span style={{ fontSize: '14px' }}>{userEmail}</span>
        <button onClick={onSignOut} style={{
          background: 'none', border: '1px solid #4ADE80', color: '#4ADE80',
          borderRadius: '4px', padding: '1px 8px', cursor: 'pointer',
          fontFamily: 'VT323, monospace', fontSize: '14px',
        }}>
          Sign Out
        </button>
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
          top: '30px',
          width: '100%',
          height: 'calc(100% - 30px)',
          border: 'none',
        }}
        title="WildDex"
      />
    </div>
  )
}