import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase-server'
import type { News } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = createServerSupabase()
  const { data: news } = await supabase
    .from('news')
    .select('*')
    .eq('is_published', true)
    .order('sort_order')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-white">

      {/* Header */}
      <div className="bg-[#003087] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#E31E24] rounded-xl flex items-center justify-center text-white font-bold text-sm font-serif-thai shadow">ทช</div>
          <div>
            <p className="text-white text-sm font-semibold leading-tight">ไทยประกันชีวิต</p>
            <p className="text-[#F5A623] text-[10px] tracking-wide">DIGITAL OFFICE</p>
          </div>
        </div>
        <Link href="/login"
          className="bg-white text-[#003087] text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#f0f4ff] transition-colors">
          เข้าสู่ระบบ
        </Link>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#003087] to-[#001a5e] px-5 py-10 text-center">
        <p className="text-[#F5A623] text-xs font-semibold tracking-widest mb-2 uppercase">Thai Life Insurance</p>
        <h1 className="text-white text-2xl font-bold font-serif-thai leading-snug mb-3">
          ระบบโปรไฟล์ตัวแทน<br />ดิจิทัล ออฟฟิศ
        </h1>
        <p className="text-white/60 text-sm mb-6">สร้างหน้าโปรไฟล์ออนไลน์ แชร์ให้ลูกค้า ติดต่อได้ทันที</p>
        <Link href="/login"
          className="inline-block bg-[#E31E24] text-white font-bold text-sm px-8 py-3 rounded-xl hover:bg-[#c41920] transition-colors shadow-lg">
          เข้าสู่ระบบตัวแทน →
        </Link>
      </div>

      {/* News */}
      <div className="px-5 py-6 max-w-lg mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E31E24]" />
          <h2 className="text-[#003087] font-bold text-base">ข่าวสารและประกาศ</h2>
        </div>

        {!news || news.length === 0 ? (
          <div className="bg-[#f8f9ff] rounded-xl border border-[#e8ecf8] px-4 py-8 text-center text-gray-400 text-sm">
            ยังไม่มีข่าวสาร
          </div>
        ) : (
          <div className="space-y-3">
            {(news as News[]).map(item => (
              <div key={item.id} className="bg-white rounded-xl border border-[#e8ecf8] p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-[#003087] font-semibold text-sm leading-snug">{item.title}</h3>
                  <span className="text-gray-300 text-[10px] whitespace-nowrap flex-shrink-0 mt-0.5">
                    {new Date(item.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
                  </span>
                </div>
                {item.content && (
                  <p className="text-gray-500 text-xs leading-relaxed">{item.content}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-[#001440] px-5 py-4 text-center mt-4">
        <p className="text-white/40 text-xs font-serif-thai">บริษัท ไทยประกันชีวิต จำกัด (มหาชน)</p>
      </div>

    </div>
  )
}
