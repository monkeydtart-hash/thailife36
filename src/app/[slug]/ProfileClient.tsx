'use client'
import { QRCodeCanvas } from 'qrcode.react'
import type { AgentFull } from '@/lib/types'

// ---- helpers ----
type VideoInfo =
  | { platform: 'youtube'; id: string }
  | { platform: 'tiktok'; id: string }
  | { platform: 'facebook'; url: string }
  | { platform: 'instagram'; shortcode: string }
  | { platform: 'unknown' }

function detectVideo(url: string): VideoInfo {
  if (!url) return { platform: 'unknown' }
  // YouTube (watch, short url, shorts)
  const yt = url.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/)([A-Za-z0-9_-]{11})/)
  if (yt) return { platform: 'youtube', id: yt[1] }
  // TikTok
  const tt = url.match(/tiktok\.com\/.+\/video\/(\d+)/)
  if (tt) return { platform: 'tiktok', id: tt[1] }
  // Facebook
  if (url.includes('facebook.com') || url.includes('fb.watch'))
    return { platform: 'facebook', url }
  // Instagram reel or post
  const ig = url.match(/instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/)
  if (ig) return { platform: 'instagram', shortcode: ig[1] }
  return { platform: 'unknown' }
}

function VideoEmbed({ url }: { url: string }) {
  const info = detectVideo(url)
  if (info.platform === 'youtube') {
    return (
      <div className="rounded-xl overflow-hidden border border-[#003087]/10 w-full" style={{ aspectRatio: '16/9' }}>
        <iframe src={`https://www.youtube.com/embed/${info.id}`}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen />
      </div>
    )
  }
  if (info.platform === 'tiktok') {
    return (
      <div className="rounded-xl overflow-hidden border border-[#003087]/10 w-full" style={{ aspectRatio: '9/16' }}>
        <iframe src={`https://www.tiktok.com/embed/v2/${info.id}`}
          className="w-full h-full"
          allow="autoplay"
          allowFullScreen />
      </div>
    )
  }
  if (info.platform === 'facebook') {
    const encoded = encodeURIComponent(info.url)
    return (
      <div className="rounded-xl overflow-hidden border border-[#003087]/10 w-full" style={{ aspectRatio: '16/9' }}>
        <iframe
          src={`https://www.facebook.com/plugins/video.php?href=${encoded}&show_text=false&width=560`}
          className="w-full h-full"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          allowFullScreen />
      </div>
    )
  }
  if (info.platform === 'instagram') {
    return (
      <div className="rounded-xl overflow-hidden border border-[#003087]/10 w-full" style={{ aspectRatio: '4/5' }}>
        <iframe src={`https://www.instagram.com/p/${info.shortcode}/embed/`}
          className="w-full h-full"
          allowFullScreen />
      </div>
    )
  }
  // fallback: link
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-2 text-[#003087] text-sm underline py-2">
      ▶ ดูวิดีโอ
    </a>
  )
}

const categoryLabel: Record<string, string> = {
  life: 'ชีวิต', health: 'สุขภาพ', saving: 'ออมทรัพย์', accident: 'อุบัติเหตุ',
}

const categoryBg: Record<string, string> = {
  life: '#fff0f0', health: '#eef2ff', saving: '#f0fff4', accident: '#fffbf0',
}

// ---- Component ----
export default function ProfileClient({ agent }: { agent: AgentFull }) {
  const profileUrl = `https://thailife36.com/${agent.slug}`
  const videos = agent.agent_videos?.filter(v => detectVideo(v.youtube_url).platform !== 'unknown') || []
  const initials = agent.full_name.slice(0, 1)

  function copyLink() {
    navigator.clipboard.writeText(profileUrl)
  }

  function downloadQR() {
    const canvas = document.getElementById('profile-qr')?.querySelector('canvas')
    if (!canvas) return
    const a = document.createElement('a')
    a.download = `qr-${agent.slug}.png`
    a.href = canvas.toDataURL('image/png')
    a.click()
  }

  return (
    <div className="min-h-screen bg-white font-sarabun">

      {/* ── HERO ── */}
      <div className="bg-gradient-to-br from-[#003087] to-[#001a5e] overflow-hidden">

        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#E31E24] rounded-lg flex items-center justify-center text-white font-bold text-sm font-serif-thai">36</div>
            <div>
              <p className="text-white text-xs font-medium leading-tight">บริษัท ไทยประกันชีวิต จำกัด (มหาชน)</p>
              <p className="text-[#F5A623] text-[10px] tracking-wide">THAI LIFE INSURANCE</p>
            </div>
          </div>
          <span className="text-[#F5A623] text-[11px] border border-[#F5A623]/40 px-2.5 py-1 rounded-full font-medium">✓ ตัวแทนรับรอง</span>
        </div>

        {/* Profile info */}
        <div className="px-5 pt-5 pb-0 flex gap-4 items-start">
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-full border-[2.5px] border-[#F5A623] overflow-hidden bg-gradient-to-br from-[#4a90d9] to-[#003087] flex items-center justify-center">
              {agent.avatar_url ? (
                <img src={agent.avatar_url} alt={agent.full_name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-2xl font-bold font-serif-thai">{initials}</span>
              )}
            </div>
            <span className="absolute bottom-1 right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-[#002060]" />
          </div>

          <div className="flex-1 pt-1">
            <h1 className="text-white text-xl font-bold font-serif-thai leading-tight mb-0.5">{agent.full_name}</h1>
            {agent.agent_code && <p className="text-[#F5A623] text-[11px] font-medium mb-1">รหัสตัวแทน: {agent.agent_code}</p>}
            <p className="text-white/60 text-xs mb-2">
              ตัวแทนประกันชีวิต{agent.branch ? ` · ${agent.branch}` : ''}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {agent.experience_years > 0 && (
                <span className="text-white/80 text-[10px] border border-white/20 bg-white/10 px-2 py-0.5 rounded-full">
                  ประสบการณ์ {agent.experience_years} ปี
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        {agent.bio && (
          <p className="px-5 pt-3 text-white/65 text-xs leading-relaxed">{agent.bio}</p>
        )}

        <div className="h-5" />
      </div>

      {/* ── WHITE BODY ── */}
      <div className="bg-white">

        {/* VIDEOS */}
        <section className="px-4 pt-5 pb-1">
          <div className="section-title"><span className="w-1.5 h-1.5 rounded-full bg-[#E31E24]" />วิดีโอแนะนำตัว</div>
          {videos.length > 0 ? (
            <div className="space-y-3">
              {videos.map(vid => (
                <div key={vid.id}>
                  {vid.title && <p className="text-[#003087] text-xs font-semibold mb-1.5">{vid.title}</p>}
                  <VideoEmbed url={vid.youtube_url} />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#001440] rounded-xl h-32 flex flex-col items-center justify-center gap-2 border border-[#003087]/12">
              <div className="w-10 h-10 rounded-full bg-[#E31E24] flex items-center justify-center">
                <svg className="w-4 h-4 text-white fill-white ml-0.5" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>
              </div>
              <p className="text-white/40 text-xs">วิดีโอแนะนำตัว</p>
            </div>
          )}
        </section>

        <div className="h-px bg-gray-100 mx-4 my-1" />

        {/* INSURANCE PRODUCTS */}
        {agent.agent_products.length > 0 && (
          <section className="px-4 pt-4 pb-1">
            <div className="section-title"><span className="w-1.5 h-1.5 rounded-full bg-[#E31E24]" />แบบประกันที่แนะนำ</div>
            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
              {agent.agent_products.map(prod => (
                <div key={prod.id}
                  className={`flex-shrink-0 w-36 rounded-xl p-3 border-[1.5px] ${prod.is_featured ? 'border-[#E31E24] bg-[#fff8f8]' : 'border-[#e8ecf8] bg-[#f8f9ff]'}`}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg mb-2"
                    style={{ background: categoryBg[prod.category] || '#f8f9ff' }}>
                    {prod.icon || '📋'}
                  </div>
                  <p className="text-[#003087] text-xs font-semibold leading-tight mb-1">{prod.name}</p>
                  {prod.description && <p className="text-gray-400 text-[10px] leading-snug">{prod.description}</p>}
                  <span className={`inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-lg font-medium ${
                    prod.is_featured ? 'bg-[#E31E24]/10 text-[#E31E24]' : 'bg-[#003087]/8 text-[#003087]'
                  }`}>
                    {prod.is_featured ? '🔥 แนะนำ' : categoryLabel[prod.category] || prod.category}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="h-px bg-gray-100 mx-4 my-1" />

        {/* CONTACT */}
        <section className="px-4 pt-4 pb-1">
          <div className="section-title"><span className="w-1.5 h-1.5 rounded-full bg-[#E31E24]" />ช่องทางติดต่อ</div>
          <div className="grid grid-cols-2 gap-2">
            {agent.line_id && (
              <a href={agent.line_id.startsWith('@')
                ? 'https://line.me/R/ti/p/' + agent.line_id
                : 'https://line.me/ti/p/~' + agent.line_id}
                className="flex items-center gap-2.5 p-3 rounded-xl border-[1.5px] border-[#06C755] bg-white">
                <div className="w-8 h-8 rounded-lg bg-[#e8faf0] flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#06C755" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5C21 16.75 16.02 21 12 21c-1.1 0-2.15-.18-3.13-.52L4 21.5l1.1-4.19A9.1 9.1 0 013 11.5C3 6.25 7.02 2 12 2s9 4.25 9 9.5z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-[#05a847] text-xs font-semibold leading-tight">LINE</p>
                  <p className="text-[#05a847]/70 text-[10px]">{agent.line_id}</p>
                </div>
              </a>
            )}
            {agent.phone && (
              <a href={'tel:' + agent.phone}
                className="flex items-center gap-2.5 p-3 rounded-xl border-[1.5px] border-[#003087] bg-white">
                <div className="w-8 h-8 rounded-lg bg-[#e6ecf8] flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#003087" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C9.61 21 3 14.39 3 6c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.24 1.02l-2.21 2.2z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-[#003087] text-xs font-semibold leading-tight">โทรหาผม</p>
                  <p className="text-[#003087]/60 text-[10px]">{agent.phone}</p>
                </div>
              </a>
            )}
            {agent.facebook_url && (
              <a href={agent.facebook_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-3 rounded-xl border-[1.5px] border-[#1877F2] bg-white">
                <div className="w-8 h-8 rounded-lg bg-[#e8f0fe] flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95C18.05 21.45 22 17.19 22 12z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-[#1877F2] text-xs font-semibold leading-tight">Facebook</p>
                  <p className="text-[#1877F2]/60 text-[10px]">ติดตาม</p>
                </div>
              </a>
            )}
            {agent.booking_url && (
              <a href={agent.booking_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-3 rounded-xl border-[1.5px] border-[#E31E24] bg-white">
                <div className="w-8 h-8 rounded-lg bg-[#fdeaea] flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#E31E24" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <div>
                  <p className="text-[#E31E24] text-xs font-semibold leading-tight">นัดหมาย</p>
                  <p className="text-[#E31E24]/60 text-[10px]">จองคิวออนไลน์</p>
                </div>
              </a>
            )}
          </div>
        </section>

        <div className="h-px bg-gray-100 mx-4 my-1" />

        {/* QR CODE */}
        <section className="px-4 pt-4 pb-1">
          <div className="section-title"><span className="w-1.5 h-1.5 rounded-full bg-[#E31E24]" />QR Code ลิงก์โปรไฟล์</div>
          <div className="bg-[#f8f9ff] rounded-xl border border-[#e8ecf8] p-4 flex items-center gap-4">
            <div id="profile-qr" className="flex-shrink-0 p-2 bg-white rounded-xl border border-[#e8ecf8]">
              <QRCodeCanvas value={profileUrl} size={72} fgColor="#003087" bgColor="#ffffff" level="M" />
            </div>
            <div className="flex-1">
              <p className="text-[#003087] text-sm font-semibold mb-1">ลิงก์โปรไฟล์ส่วนตัว</p>
              <p className="text-gray-400 text-xs mb-2 leading-snug">แชร์ให้ลูกค้าเพื่อดูข้อมูลและติดต่อได้ทันที</p>
              <div className="flex gap-2">
                <button onClick={copyLink}
                  className="text-[#E31E24] text-xs font-bold bg-[#E31E24]/8 px-3 py-1.5 rounded-lg hover:bg-[#E31E24]/15 transition-colors">
                  คัดลอกลิงก์
                </button>
                <button onClick={downloadQR}
                  className="text-[#003087] text-xs font-bold bg-[#003087]/8 px-3 py-1.5 rounded-lg hover:bg-[#003087]/15 transition-colors">
                  ดาวน์โหลด QR
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="h-px bg-gray-100 mx-4 my-1" />

        {/* AWARDS */}
        {agent.agent_awards.length > 0 && (
          <section className="px-4 pt-4 pb-1">
            <div className="section-title"><span className="w-1.5 h-1.5 rounded-full bg-[#E31E24]" />รางวัลและประวัติ</div>
            <div className="space-y-2">
              {agent.agent_awards.map(award => (
                <div key={award.id} className="flex items-center gap-3 bg-[#f8f9ff] rounded-xl border border-[#e8ecf8] px-3 py-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#F5A623] to-[#e08a0a] flex items-center justify-center text-base flex-shrink-0">
                    {award.icon}
                  </div>
                  <div>
                    <p className="text-[#003087] text-xs font-semibold leading-tight">{award.title}</p>
                    <p className="text-gray-400 text-[10px]">
                      {[award.year, award.subtitle].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="px-4 pt-5 pb-6">
          <a href={agent.line_id ? 'https://line.me/ti/p/' + agent.line_id : agent.booking_url || '#'}
            className="btn-primary flex items-center justify-center gap-2 !rounded-xl !py-4 text-base">
            <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.03 2 11c0 2.75 1.29 5.2 3.32 6.88L4.5 22l4.26-2.12C9.73 20.28 10.84 20.5 12 20.5c5.52 0 10-4.03 10-9s-4.48-9-10-9z"/></svg>
            ปรึกษาฟรี ไม่มีค่าใช้จ่าย
          </a>
        </div>

      </div>

      {/* Footer */}
      <div className="bg-[#001440] px-5 py-4 text-center">
        <p className="text-white/50 text-xs font-serif-thai">บริษัท ไทยประกันชีวิต จำกัด (มหาชน)</p>
        <p className="text-white/25 text-[10px] mt-0.5">ใบอนุญาตประกอบธุรกิจประกันชีวิต เลขที่ ช.ช. 1 — กำกับดูแลโดย คปภ.</p>
      </div>

    </div>
  )
}
