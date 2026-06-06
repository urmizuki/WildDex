'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
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

  // Embed the SPA in an iframe, passing the user email as a hash param
  // so the SPA can read it and gate features
  return (
    <div style={{ width: '100%', height: '100dvh', position: 'relative', background: '#0a0f0a' }}>
      {/* Logged-in indicator bar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
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
        borderBottom: '1px solid rgba(74, 222, 128, 0.15)',
      }}>
        <span>{user?.email}</span>
        <button onClick={handleSignOut} style={{
          background: 'none',
          border: '1px solid #4ADE80',
          color: '#4ADE80',
          borderRadius: '4px',
          padding: '2px 10px',
          cursor: 'pointer',
          fontFamily: 'VT323, monospace',
          fontSize: '16px',
        }}>
          Sign Out
        </button>
      </div>
      <iframe
        src={`/index.html#user=${encodeURIComponent(user?.email || '')}`}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          marginTop: '30px',
        }}
        title="WildDex"
      />
    </div>
  )
}