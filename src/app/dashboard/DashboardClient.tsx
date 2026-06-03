'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import type { Agent, AgentProduct, AgentAward, AgentVideo } from '@/lib/types'
import ImageCropper from './ImageCropper'

// ---- Sub-components ----

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="section-title">
      <span className="w-1.5 h-1.5 rounded-full bg-[#E31E24] flex-shrink-0" />
      {children}
    </div>
  )
}

function InputField({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-600 mb-1.5 block">{label}</label>
      <input className="input-field" {...props} />
    </div>
  )
}

function TextAreaField({ label, ...props }: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-600 mb-1.5 block">{label}</label>
      <textarea className="input-field resize-none" rows={3} {...props} />
    </div>
  )
}

// ---- Main Dashboard ----

export default function DashboardClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [agent, setAgent] = useState<Agent | null>(null)
  const [products, setProducts] = useState<AgentProduct[]>([])
  const [awards, setAwards] = useState<AgentAward[]>([])
  const [videos, setVideos] = useState<AgentVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'products' | 'awards' | 'videos'>('profile')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [cropSrc, setCropSrc] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/login')

    const { data: agentData, error: agentError } = await supabase
      .from('agents')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (agentError && agentError.code !== 'PGRST116') {
      setLoadError(agentError.message)
      setLoading(false)
      return
    }
    if (!agentData) {
      // authenticated but no agent row — send to register without destroying session
      return router.push('/register')
    }
    setAgent(agentData)

    const { data: prods } = await supabase
      .from('agent_products')
      .select('*')
      .eq('agent_id', agentData.id)
      .order('sort_order')
    setProducts(prods || [])

    const { data: awds } = await supabase
      .from('agent_awards')
      .select('*')
      .eq('agent_id', agentData.id)
      .order('sort_order')
    setAwards(awds || [])

    const { data: vids } = await supabase
      .from('agent_videos')
      .select('*')
      .eq('agent_id', agentData.id)
      .order('sort_order')
    setVideos(vids || [])

    setLoading(false)
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCropSrc(URL.createObjectURL(file))
    e.target.value = ''
  }

  function handleCropDone(file: File, preview: string) {
    setAvatarFile(file)
    setAvatarPreview(preview)
    setCropSrc(null)
  }

  async function saveProfile() {
    if (!agent) return
    setSaving(true)
    try {
      let avatar_url = agent.avatar_url

      // อัปโหลดรูปโปรไฟล์ถ้ามีการเลือกใหม่
      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop()
        const path = `${agent.user_id}/avatar.${ext}`
        const { error: uploadErr } = await supabase.storage
          .from('avatars')
          .upload(path, avatarFile, { upsert: true })
        if (!uploadErr) {
          const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
          avatar_url = urlData.publicUrl
        }
      }

      // exclude generated/immutable columns from update
      const { id, user_id, profile_url, created_at, updated_at, ...editableFields } = agent
      const { error } = await supabase
        .from('agents')
        .update({ ...editableFields, avatar_url })
        .eq('id', id)

      if (!error) {
        setAgent(a => a ? { ...a, avatar_url } : a)
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
      }
    } finally {
      setSaving(false)
    }
  }

  async function addProduct() {
    if (!agent) return
    const { data } = await supabase
      .from('agent_products')
      .insert({ agent_id: agent.id, name: 'แบบประกันใหม่', category: 'life', sort_order: products.length })
      .select().single()
    if (data) setProducts(p => [...p, data])
  }

  async function updateProduct(id: string, updates: Partial<AgentProduct>) {
    setProducts(p => p.map(x => x.id === id ? { ...x, ...updates } : x))
    await supabase.from('agent_products').update(updates).eq('id', id)
  }

  async function deleteProduct(id: string) {
    setProducts(p => p.filter(x => x.id !== id))
    await supabase.from('agent_products').delete().eq('id', id)
  }

  async function addAward() {
    if (!agent) return
    const { data } = await supabase
      .from('agent_awards')
      .insert({ agent_id: agent.id, title: 'รางวัลใหม่', icon: '🏆', sort_order: awards.length })
      .select().single()
    if (data) setAwards(a => [...a, data])
  }

  async function updateAward(id: string, updates: Partial<AgentAward>) {
    setAwards(a => a.map(x => x.id === id ? { ...x, ...updates } : x))
    await supabase.from('agent_awards').update(updates).eq('id', id)
  }

  async function deleteAward(id: string) {
    setAwards(a => a.filter(x => x.id !== id))
    await supabase.from('agent_awards').delete().eq('id', id)
  }

  async function addVideo() {
    if (!agent || videos.length >= 5) return
    const { data } = await supabase
      .from('agent_videos')
      .insert({ agent_id: agent.id, youtube_url: '', sort_order: videos.length })
      .select().single()
    if (data) setVideos(v => [...v, data])
  }

  async function updateVideo(id: string, updates: Partial<AgentVideo>) {
    setVideos(v => v.map(x => x.id === id ? { ...x, ...updates } : x))
    await supabase.from('agent_videos').update(updates).eq('id', id)
  }

  async function deleteVideo(id: string) {
    setVideos(v => v.filter(x => x.id !== id))
    await supabase.from('agent_videos').delete().eq('id', id)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-[#003087] text-sm">กำลังโหลด...</div>
      </div>
    )
  }

  if (loadError) return (
    <div className="min-h-screen bg-white flex items-center justify-center px-5">
      <div className="text-center">
        <p className="text-red-500 text-sm mb-2">โหลดข้อมูลไม่สำเร็จ</p>
        <p className="text-gray-400 text-xs mb-4">{loadError}</p>
        <button onClick={() => { setLoadError(''); setLoading(true); loadData() }}
          className="text-[#003087] text-sm border border-[#003087]/30 px-4 py-2 rounded-xl">
          ลองใหม่
        </button>
      </div>
    </div>
  )

  if (!agent) return null

  const tabs = [
    { key: 'profile', label: 'โปรไฟล์' },
    { key: 'products', label: 'แบบประกัน' },
    { key: 'awards', label: 'รางวัล' },
    { key: 'videos', label: 'วิดีโอ' },
  ] as const

  const categoryOptions = [
    { value: 'life', label: 'ชีวิต' },
    { value: 'health', label: 'สุขภาพ' },
    { value: 'saving', label: 'ออมทรัพย์' },
    { value: 'accident', label: 'อุบัติเหตุ' },
  ]

  return (
    <div className="min-h-screen bg-white">
      {cropSrc && (
        <ImageCropper
          imageSrc={cropSrc}
          onDone={handleCropDone}
          onCancel={() => setCropSrc(null)}
        />
      )}
      {/* Header */}
      <div className="bg-[#003087] px-5 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-[#E31E24] rounded-lg flex items-center justify-center text-white font-bold text-xs font-serif-thai">36</div>
          <div>
            <p className="text-white text-xs font-medium leading-tight">Dashboard</p>
            <p className="text-[#F5A623] text-[10px]">Digital Office</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {agent.is_admin && (
            <Link href="/admin"
              className="text-white/70 text-xs border border-white/20 px-2.5 py-1.5 rounded-lg hover:bg-white/10 transition-colors">
              Admin
            </Link>
          )}
          <Link href={'/' + agent.slug} target="_blank"
            className="text-[#F5A623] text-xs font-semibold border border-[#F5A623]/40 px-3 py-1.5 rounded-lg hover:bg-[#F5A623]/10 transition-colors">
            ดูโปรไฟล์ →
          </Link>
          <button onClick={handleLogout} className="text-white/50 text-xs hover:text-white transition-colors">
            ออก
          </button>
        </div>
      </div>

      {/* Pending approval banner */}
      {!agent.is_active && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-5 py-3 text-yellow-800 text-sm font-medium">
          ⏳ โปรไฟล์ของคุณกำลังรอการอนุมัติจาก Admin — หน้าโปรไฟล์จะแสดงสาธารณะหลังได้รับการอนุมัติ
        </div>
      )}

      {/* Welcome banner */}
      {searchParams.get('welcome') && agent.is_active && (
        <div className="bg-green-50 border-b border-green-200 px-5 py-3 text-green-700 text-sm font-medium">
          🎉 ยินดีต้อนรับ! โปรไฟล์ของคุณถูกสร้างแล้วที่ <span className="font-bold">thailife36.com/{agent.slug}</span>
        </div>
      )}

      {/* Profile link preview */}
      <div className="px-5 py-3 bg-[#f0f4ff] border-b border-[#e8ecf8] flex items-center justify-between">
        <div>
          <span className="text-[11px] text-gray-500">ลิงก์โปรไฟล์ของคุณ</span>
          <p className="text-[#E31E24] text-sm font-bold">thailife36.com/{agent.slug}</p>
          <p className="text-gray-400 text-[11px] mt-0.5">👁 ลูกค้าเปิดดู {agent.view_count} ครั้ง</p>
        </div>
        <button
          onClick={() => navigator.clipboard.writeText('https://thailife36.com/' + agent.slug)}
          className="text-[#003087] text-xs border border-[#003087]/30 px-3 py-1.5 rounded-lg hover:bg-[#003087]/5 transition-colors">
          คัดลอก
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 px-5 sticky top-[56px] bg-white z-10">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`py-3 px-4 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              activeTab === t.key
                ? 'border-[#E31E24] text-[#E31E24]'
                : 'border-transparent text-gray-500 hover:text-[#003087]'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="px-5 py-5 max-w-lg mx-auto pb-24">

        {/* ---- TAB: PROFILE ---- */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            {/* Avatar */}
            <div className="flex items-center gap-4 card">
              <div className="w-16 h-16 rounded-full border-2 border-[#F5A623] overflow-hidden bg-[#003087] flex items-center justify-center flex-shrink-0">
                {avatarPreview || agent.avatar_url ? (
                  <img src={avatarPreview || agent.avatar_url!} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-2xl font-bold font-serif-thai">
                    {agent.full_name[0]}
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#003087] mb-1">{agent.full_name}</p>
                <label className="cursor-pointer text-xs text-[#003087] border border-[#003087]/30 px-3 py-1.5 rounded-lg hover:bg-[#003087]/5 transition-colors">
                  เปลี่ยนรูปโปรไฟล์
                  <input type="file" accept="image/*,.jpg,.jpeg,.png,.gif,.webp" className="hidden" onChange={handleAvatarChange} />
                </label>
              </div>
            </div>

            <SectionTitle>ข้อมูลพื้นฐาน</SectionTitle>
            <InputField label="ชื่อ-นามสกุล *"
              value={agent.full_name}
              onChange={e => setAgent(a => a ? { ...a, full_name: e.target.value } : a)} />
            <InputField label="รหัสตัวแทน"
              placeholder="361-XXXXX"
              value={agent.agent_code || ''}
              onChange={e => setAgent(a => a ? { ...a, agent_code: e.target.value } : a)} />
            <InputField label="สาขา"
              placeholder="เช่น ชลบุรี, ศรีราชา"
              value={agent.branch || ''}
              onChange={e => setAgent(a => a ? { ...a, branch: e.target.value } : a)} />
            <InputField label="ประสบการณ์ (ปี)"
              type="number" min={0}
              value={agent.experience_years}
              onChange={e => setAgent(a => a ? { ...a, experience_years: Number(e.target.value) } : a)} />
            <TextAreaField label="แนะนำตัวสั้นๆ"
              placeholder="แนะนำตัวและความเชี่ยวชาญของคุณ..."
              value={agent.bio || ''}
              onChange={e => setAgent(a => a ? { ...a, bio: e.target.value } : a)} />

            <SectionTitle>ช่องทางติดต่อ</SectionTitle>
            <InputField label="เบอร์โทรศัพท์"
              type="tel" placeholder="08X-XXX-XXXX"
              value={agent.phone || ''}
              onChange={e => setAgent(a => a ? { ...a, phone: e.target.value } : a)} />
            <InputField label="LINE ID"
              placeholder="@line_id"
              value={agent.line_id || ''}
              onChange={e => setAgent(a => a ? { ...a, line_id: e.target.value } : a)} />
            <InputField label="Facebook URL"
              placeholder="https://facebook.com/..."
              value={agent.facebook_url || ''}
              onChange={e => setAgent(a => a ? { ...a, facebook_url: e.target.value } : a)} />
            <InputField label="ลิงก์นัดหมาย (Calendly หรืออื่นๆ)"
              placeholder="https://..."
              value={agent.booking_url || ''}
              onChange={e => setAgent(a => a ? { ...a, booking_url: e.target.value } : a)} />

            <p className="text-xs text-gray-400">จัดการวิดีโอได้ที่ tab "วิดีโอ" ด้านบนครับ</p>
          </div>
        )}

        {/* ---- TAB: PRODUCTS ---- */}
        {activeTab === 'products' && (
          <div className="space-y-3">
            {products.map((prod) => (
              <div key={prod.id} className="card space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#003087]">แบบประกัน</span>
                  <button onClick={() => deleteProduct(prod.id)}
                    className="text-red-400 text-xs hover:text-red-600">ลบ</button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-gray-500 mb-1 block">ไอคอน (emoji)</label>
                    <input className="input-field text-center text-lg" maxLength={2}
                      value={prod.icon || ''} onChange={e => updateProduct(prod.id, { icon: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-500 mb-1 block">หมวดหมู่</label>
                    <select className="input-field"
                      value={prod.category}
                      onChange={e => updateProduct(prod.id, { category: e.target.value })}>
                      {categoryOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>
                <input className="input-field" placeholder="ชื่อแบบประกัน"
                  value={prod.name} onChange={e => updateProduct(prod.id, { name: e.target.value })} />
                <input className="input-field" placeholder="คำอธิบายสั้นๆ"
                  value={prod.description || ''}
                  onChange={e => updateProduct(prod.id, { description: e.target.value })} />
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={prod.is_featured}
                    onChange={e => updateProduct(prod.id, { is_featured: e.target.checked })}
                    className="accent-[#E31E24]" />
                  แนะนำเป็นพิเศษ (🔥)
                </label>
              </div>
            ))}
            <button onClick={addProduct}
              className="w-full py-3 border-2 border-dashed border-[#003087]/30 rounded-xl text-[#003087] text-sm font-semibold hover:border-[#003087] hover:bg-[#003087]/5 transition-colors">
              + เพิ่มแบบประกัน
            </button>
          </div>
        )}

        {/* ---- TAB: AWARDS ---- */}
        {activeTab === 'awards' && (
          <div className="space-y-3">
            {awards.map((award) => (
              <div key={award.id} className="card space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#003087]">รางวัล / ประวัติ</span>
                  <button onClick={() => deleteAward(award.id)}
                    className="text-red-400 text-xs hover:text-red-600">ลบ</button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-[11px] text-gray-500 mb-1 block">ไอคอน</label>
                    <input className="input-field text-center text-lg" maxLength={2}
                      value={award.icon} onChange={e => updateAward(award.id, { icon: e.target.value })} />
                  </div>
                  <div className="col-span-3">
                    <label className="text-[11px] text-gray-500 mb-1 block">ปี</label>
                    <input className="input-field" placeholder="เช่น 2024"
                      value={award.year || ''}
                      onChange={e => updateAward(award.id, { year: e.target.value })} />
                  </div>
                </div>
                <input className="input-field" placeholder="ชื่อรางวัล"
                  value={award.title} onChange={e => updateAward(award.id, { title: e.target.value })} />
                <input className="input-field" placeholder="รายละเอียดเพิ่มเติม"
                  value={award.subtitle || ''}
                  onChange={e => updateAward(award.id, { subtitle: e.target.value })} />
              </div>
            ))}
            <button onClick={addAward}
              className="w-full py-3 border-2 border-dashed border-[#003087]/30 rounded-xl text-[#003087] text-sm font-semibold hover:border-[#003087] hover:bg-[#003087]/5 transition-colors">
              + เพิ่มรางวัล / ประวัติ
            </button>
          </div>
        )}
        {/* ---- TAB: VIDEOS ---- */}
        {activeTab === 'videos' && (
          <div className="space-y-3">
            <p className="text-xs text-gray-400">เพิ่มได้สูงสุด 5 คลิป — วางลิงก์ YouTube แล้วกดบันทึก</p>
            {videos.map((vid, i) => (
              <div key={vid.id} className="card space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#003087]">คลิปที่ {i + 1}</span>
                  <button onClick={() => deleteVideo(vid.id)} className="text-red-400 text-xs hover:text-red-600">ลบ</button>
                </div>
                <input className="input-field" placeholder="ชื่อคลิป (ไม่บังคับ)"
                  value={vid.title || ''}
                  onChange={e => updateVideo(vid.id, { title: e.target.value })} />
                <input className="input-field" placeholder="https://youtu.be/..."
                  value={vid.youtube_url}
                  onChange={e => updateVideo(vid.id, { youtube_url: e.target.value })} />
              </div>
            ))}
            {videos.length < 5 ? (
              <button onClick={addVideo}
                className="w-full py-3 border-2 border-dashed border-[#003087]/30 rounded-xl text-[#003087] text-sm font-semibold hover:border-[#003087] hover:bg-[#003087]/5 transition-colors">
                + เพิ่มคลิป ({videos.length}/5)
              </button>
            ) : (
              <p className="text-center text-gray-400 text-xs py-2">ครบ 5 คลิปแล้ว</p>
            )}
          </div>
        )}

      </div>

      {/* Save bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 py-3 flex items-center gap-3 max-w-lg mx-auto">
        {saved && <span className="text-green-600 text-sm font-medium flex-1">✓ บันทึกแล้ว</span>}
        {!saved && <span className="flex-1" />}
        <button onClick={saveProfile} disabled={saving}
          className="btn-primary !w-auto px-8">
          {saving ? 'กำลังบันทึก...' : 'บันทึก'}
        </button>
      </div>
    </div>
  )
}
