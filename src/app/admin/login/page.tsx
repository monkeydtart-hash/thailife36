'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function AdminLoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ email: '', password: '' })

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: authErr } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (authErr || !data.user) {
      setLoading(false)
      return setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
    }

    // ตรวจสอบว่าเป็น admin จริงไหม
    const { data: agent } = await supabase
      .from('agents')
      .select('is_admin')
      .eq('user_id', data.user.id)
      .single()

    setLoading(false)

    if (!agent?.is_admin) {
      await supabase.auth.signOut()
      return setError('คุณไม่มีสิทธิ์เข้าถึงหน้า Admin')
    }

    router.push('/admin')
  }

  return (
    <div className="min-h-screen bg-[#001440] flex items-center justify-center px-5">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-[#E31E24] rounded-2xl flex items-center justify-center text-white font-bold text-2xl font-serif-thai mb-3 shadow-lg">
            36
          </div>
          <p className="text-white font-semibold text-lg">Admin Panel</p>
          <p className="text-white/40 text-xs mt-1">Thai Life Digital Office</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <h1 className="text-[#003087] font-bold text-lg mb-5">เข้าสู่ระบบ Admin</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">อีเมล</label>
              <input
                className="input-field"
                type="email"
                placeholder="admin@email.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">รหัสผ่าน</label>
              <input
                className="input-field"
                type="password"
                placeholder="รหัสผ่าน"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          เฉพาะผู้ดูแลระบบเท่านั้น
        </p>
      </div>
    </div>
  )
}
