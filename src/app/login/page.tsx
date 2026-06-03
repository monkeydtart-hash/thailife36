'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ email: '', password: '' })

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })
    setLoading(false)
    if (err) return setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-[#003087] px-5 py-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-[#E31E24] rounded-lg flex items-center justify-center text-white font-bold text-sm font-serif-thai">ทช</div>
        <div>
          <p className="text-white text-sm font-medium leading-tight">ไทยประกันชีวิต</p>
          <p className="text-[#F5A623] text-[10px]">DIGITAL OFFICE</p>
        </div>
      </div>

      <div className="px-5 py-10 max-w-md mx-auto">
        <h1 className="font-serif-thai text-2xl font-bold text-[#003087] mb-1">เข้าสู่ระบบ</h1>
        <p className="text-gray-500 text-sm mb-8">จัดการโปรไฟล์ Digital Office ของคุณ</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">อีเมล</label>
            <input className="input-field" type="email" placeholder="your@email.com"
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">รหัสผ่าน</label>
            <input className="input-field" type="password" placeholder="รหัสผ่าน"
              value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          ยังไม่มีบัญชี?{' '}
          <Link href="/register" className="text-[#003087] font-semibold hover:underline">สมัครฟรี</Link>
        </p>
      </div>
    </div>
  )
}
