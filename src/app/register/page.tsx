'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState<1 | 2>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    slug: '',
    full_name: '',
    agent_code: '',
    branch: '',
    phone: '',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  // ตรวจ slug ซ้ำ
  async function checkSlug(slug: string) {
    const { data } = await supabase
      .from('agents')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()
    return !!data
  }

  async function handleStep1(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) {
      return setError('รหัสผ่านไม่ตรงกัน')
    }
    if (form.password.length < 6) {
      return setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
    }
    // ตรวจ slug
    const slugClean = form.slug.toLowerCase().replace(/[^a-z0-9_-]/g, '')
    if (slugClean.length < 3) return setError('ชื่อ URL ต้องมีอย่างน้อย 3 ตัวอักษร (a-z, 0-9, -, _)')
    setLoading(true)
    const taken = await checkSlug(slugClean)
    setLoading(false)
    if (taken) return setError('ชื่อ URL นี้ถูกใช้แล้ว กรุณาเลือกชื่ออื่น')
    setForm(f => ({ ...f, slug: slugClean }))
    setStep(2)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // 1. สร้าง auth user
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      })
      if (authErr) throw authErr
      if (!authData.user) throw new Error('ไม่สามารถสร้างบัญชีได้')

      // 2. สร้าง agent profile
      const { error: profileErr } = await supabase.from('agents').insert({
        user_id: authData.user.id,
        slug: form.slug,
        full_name: form.full_name,
        agent_code: form.agent_code || null,
        branch: form.branch || null,
        phone: form.phone || null,
        is_active: false,
      })
      if (profileErr) throw profileErr

      router.refresh()
      router.push('/dashboard?welcome=1&pending=1')
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#003087] px-5 py-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-[#E31E24] rounded-lg flex items-center justify-center text-white font-bold text-sm font-serif-thai">ทช</div>
        <div>
          <p className="text-white text-sm font-medium leading-tight">ไทยประกันชีวิต</p>
          <p className="text-[#F5A623] text-[10px]">DIGITAL OFFICE</p>
        </div>
      </div>

      <div className="px-5 py-8 max-w-md mx-auto">
        <h1 className="font-serif-thai text-2xl font-bold text-[#003087] mb-1">สร้างโปรไฟล์ของคุณ</h1>
        <p className="text-gray-500 text-sm mb-6">
          {step === 1 ? 'ขั้นตอนที่ 1/2 — ข้อมูลบัญชีและลิงก์โปรไฟล์' : 'ขั้นตอนที่ 2/2 — ข้อมูลตัวแทน'}
        </p>

        {/* Step indicator */}
        <div className="flex gap-2 mb-7">
          <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-[#003087]' : 'bg-gray-200'}`} />
          <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-[#003087]' : 'bg-gray-200'}`} />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleStep1} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">อีเมล</label>
              <input className="input-field" type="email" placeholder="your@email.com"
                value={form.email} onChange={e => set('email', e.target.value)} required />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">รหัสผ่าน</label>
              <input className="input-field" type="password" placeholder="อย่างน้อย 6 ตัวอักษร"
                value={form.password} onChange={e => set('password', e.target.value)} required />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">ยืนยันรหัสผ่าน</label>
              <input className="input-field" type="password" placeholder="พิมพ์รหัสผ่านอีกครั้ง"
                value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} required />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">ชื่อ URL โปรไฟล์ของคุณ</label>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#003087]">
                <span className="px-3 py-3 bg-gray-50 text-gray-400 text-xs border-r border-gray-200 whitespace-nowrap">
                  thailife36.com/
                </span>
                <input className="flex-1 px-3 py-3 text-sm focus:outline-none bg-white"
                  placeholder="yourname"
                  value={form.slug} onChange={e => set('slug', e.target.value.toLowerCase())} required />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">ใช้ตัวอักษร a-z, ตัวเลข, ขีด (-) หรือ (_) เท่านั้น</p>
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'กำลังตรวจสอบ...' : 'ถัดไป →'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">ชื่อ-นามสกุล <span className="text-red-500">*</span></label>
              <input className="input-field" placeholder="คุณชื่อ นามสกุล"
                value={form.full_name} onChange={e => set('full_name', e.target.value)} required />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">รหัสตัวแทน</label>
              <input className="input-field" placeholder="361-XXXXX"
                value={form.agent_code} onChange={e => set('agent_code', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">สาขา</label>
              <input className="input-field" placeholder="เช่น ชลบุรี, ศรีราชา"
                value={form.branch} onChange={e => set('branch', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">เบอร์โทรศัพท์</label>
              <input className="input-field" placeholder="08X-XXX-XXXX" type="tel"
                value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>

            {/* Preview URL */}
            <div className="bg-[#f0f4ff] rounded-xl p-3 flex items-center gap-2">
              <span className="text-[#003087] text-xs font-semibold">🔗 ลิงก์โปรไฟล์ของคุณ:</span>
              <span className="text-[#E31E24] text-xs font-bold">thailife36.com/{form.slug}</span>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)}
                className="btn-outline-navy flex-1">← ย้อนกลับ</button>
              <button type="submit" className="btn-primary flex-1" disabled={loading}>
                {loading ? 'กำลังสร้าง...' : 'สร้างโปรไฟล์ ✓'}
              </button>
            </div>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          มีบัญชีแล้ว?{' '}
          <Link href="/login" className="text-[#003087] font-semibold hover:underline">เข้าสู่ระบบ</Link>
        </p>
      </div>
    </div>
  )
}
