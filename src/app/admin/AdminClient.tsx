'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { Agent } from '@/lib/types'

export default function AdminClient() {
  const router = useRouter()
  const supabase = createClient()
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [actionError, setActionError] = useState('')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/login')

    const { data: myAgent } = await supabase
      .from('agents').select('*').eq('user_id', user.id).single()

    if (!myAgent?.is_admin) return router.push('/dashboard')

    const { data } = await supabase
      .from('agents')
      .select('*')
      .order('created_at', { ascending: false })
    setAgents(data || [])
    setLoading(false)
  }

  async function approve(id: string) {
    setActionError('')
    const { error } = await supabase.from('agents').update({ is_active: true }).eq('id', id)
    if (error) return setActionError('อนุมัติไม่สำเร็จ: ' + error.message)
    setAgents(a => a.map(x => x.id === id ? { ...x, is_active: true } : x))
  }

  async function reject(id: string) {
    if (!confirm('ลบ agent นี้ออกเลยไหม?')) return
    setActionError('')
    const { error } = await supabase.from('agents').delete().eq('id', id)
    if (error) return setActionError('ลบไม่สำเร็จ: ' + error.message)
    setAgents(a => a.filter(x => x.id !== id))
  }

  const pending = agents.filter(a => !a.is_active)
  const approved = agents.filter(a => a.is_active)

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-[#003087] text-sm">กำลังโหลด...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f8f9ff]">
      <div className="bg-[#003087] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#E31E24] rounded-lg flex items-center justify-center text-white font-bold text-sm">ทช</div>
          <div>
            <p className="text-white text-sm font-medium">Admin Panel</p>
            <p className="text-[#F5A623] text-[10px]">Thai Life Digital Office</p>
          </div>
        </div>
        <button onClick={() => router.push('/dashboard')}
          className="text-white/60 text-xs hover:text-white">← Dashboard</button>
      </div>

      <div className="px-5 py-6 max-w-lg mx-auto space-y-6">

        {actionError && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
            {actionError}
          </div>
        )}

        {/* Pending */}
        <div>
          <h2 className="text-[#003087] font-bold text-base mb-3">
            รออนุมัติ <span className="bg-[#E31E24] text-white text-xs px-2 py-0.5 rounded-full ml-1">{pending.length}</span>
          </h2>
          {pending.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-100 px-4 py-6 text-center text-gray-400 text-sm">
              ไม่มีรายการรออนุมัติ
            </div>
          )}
          <div className="space-y-3">
            {pending.map(agent => (
              <div key={agent.id} className="bg-white rounded-xl border border-yellow-200 p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-semibold text-[#003087] text-sm">{agent.full_name}</p>
                    {agent.agent_code && <p className="text-gray-400 text-xs">รหัส: {agent.agent_code}</p>}
                    {agent.branch && <p className="text-gray-400 text-xs">สาขา: {agent.branch}</p>}
                    <p className="text-gray-400 text-xs">slug: /{agent.slug}</p>
                    <p className="text-gray-300 text-[10px] mt-1">
                      {new Date(agent.created_at).toLocaleDateString('th-TH')}
                    </p>
                  </div>
                  <span className="text-yellow-600 text-[11px] bg-yellow-50 border border-yellow-200 px-2 py-1 rounded-lg whitespace-nowrap">รออนุมัติ</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => approve(agent.id)}
                    className="flex-1 bg-[#003087] text-white text-sm font-semibold py-2 rounded-xl hover:bg-[#002060] transition-colors">
                    อนุมัติ ✓
                  </button>
                  <button onClick={() => reject(agent.id)}
                    className="flex-1 bg-red-50 text-red-500 text-sm font-semibold py-2 rounded-xl border border-red-200 hover:bg-red-100 transition-colors">
                    ปฏิเสธ
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Approved */}
        <div>
          <h2 className="text-[#003087] font-bold text-base mb-3">
            อนุมัติแล้ว <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full ml-1">{approved.length}</span>
          </h2>
          <div className="space-y-2">
            {approved.map(agent => (
              <div key={agent.id} className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-[#003087] text-sm">{agent.full_name}</p>
                  <p className="text-gray-400 text-xs">/{agent.slug}{agent.is_admin ? ' · Admin' : ''}</p>
                </div>
                <span className="text-green-600 text-[11px]">✓ Active</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
