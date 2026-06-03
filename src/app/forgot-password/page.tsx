'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `https://thailife36.com/reset-password`,
    })
    setLoading(false)
    if (err) return setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-[#003087] px-5 py-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-[#E31E24] rounded-lg flex items-center justify-center text-white font-bold text-sm font-serif-thai">36</div>
        <div>
          <p className="text-white text-sm font-medium leading-tight">ไทยประกันชีวิต</p>
          <p className="text-[#F5A623] text-[10px]">DIGITAL OFFICE</p>
        </div>
      </div>

      <div className="px-5 py-10 max-w-md mx-auto">
        <h1 className="font-serif-thai text-2xl font-bold text-[#003087] mb-1">ลืมรหัสผ่าน</h1>
        <p className="text-gray-500 text-sm mb-8">ระบบจะส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณ</p>

        {sent ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
            <p className="text-green-700 font-semibold mb-1">ส่งอีเมลแล้ว ✓</p>
            <p className="text-green-600 text-sm">กรุณาตรวจสอบอีเมล <span className="font-bold">{email}</span> แล้วกดลิงก์เพื่อรีเซ็ตรหัสผ่าน</p>
            <Link href="/login" className="inline-block mt-4 text-[#003087] text-sm font-semibold hover:underline">
              กลับหน้าเข้าสู่ระบบ
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">อีเมล</label>
                <input className="input-field" type="email" placeholder="your@email.com"
                  value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'กำลังส่ง...' : 'ส่งลิงก์รีเซ็ตรหัสผ่าน'}
              </button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-6">
              <Link href="/login" className="text-[#003087] font-semibold hover:underline">← กลับหน้าเข้าสู่ระบบ</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
