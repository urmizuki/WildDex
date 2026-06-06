import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  const { email, password } = await request.json()

  if (!email || !password || password.length < 6) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: users, error: listError } = await supabase.auth.admin.listUsers()
  if (listError) return NextResponse.json({ error: listError.message }, { status: 400 })

  const user = users.users.find(u => u.email === email)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { error } = await supabase.auth.admin.updateUserById(user.id, { password })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ ok: true })
}
