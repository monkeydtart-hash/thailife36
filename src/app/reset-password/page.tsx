'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(true)
  const [hasSession, setHasSession] = useState(false)

  useEffect(() => {
    // ตรวจสอบ session จาก hash fragment ที่ Supabase ส่งมา
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session)
      setChecking(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setHasSession(!!session)
        setChecking(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) return setError('รหัสผ่านไม่ตรงกัน')
    if (password.length < 6) return setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
    setLoading(true)
    const { error: err } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (err) return setError(err.message)
    await supabase.auth.signOut()
    router.push('/login')
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
        <h1 className="font-serif-thai text-2xl font-bold text-[#003087] mb-1">ตั้งรหัสผ่านใหม่</h1>
        <p className="text-gray-500 text-sm mb-8">กรุณากรอกรหัสผ่านใหม่ของคุณ</p>

        {checking ? (
          <div className="text-center text-gray-400 text-sm py-8">กำลังตรวจสอบ...</div>
        ) : !hasSession ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center">
            <p className="text-red-600 font-semibold mb-2">ลิงก์หมดอายุหรือไม่ถูกต้อง</p>
            <p className="text-red-500 text-sm mb-4">กรุณาขอลิงก์รีเซ็ตรหัสผ่านใหม่อีกครั้ง</p>
            <a href="/forgot-password" className="text-[#003087] text-sm font-semibold hover:underline">
              ขอลิงก์ใหม่ →
            </a>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">รหัสผ่านใหม่</label>
                <input className="input-field" type="password" placeholder="อย่างน้อย 6 ตัวอักษร"
                  value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">ยืนยันรหัสผ่านใหม่</label>
                <input className="input-field" type="password" placeholder="พิมพ์อีกครั้ง"
                  value={confirm} onChange={e => setConfirm(e.target.value)} required />
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
