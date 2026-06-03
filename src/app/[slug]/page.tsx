import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createServerSupabase } from '@/lib/supabase-server'
import type { AgentFull } from '@/lib/types'
import ProfileClient from './ProfileClient'

// ---- Server: fetch data + metadata ----

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = createServerSupabase()
  const { data } = await supabase
    .from('agents')
    .select('full_name, branch, bio, avatar_url')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single()

  if (!data) return { title: 'ไม่พบหน้านี้' }
  const title = `${data.full_name} — ตัวแทนไทยประกันชีวิต${data.branch ? ' ' + data.branch : ''}`
  const description = data.bio || 'ตัวแทนประกันชีวิตไทยประกันชีวิต ให้คำปรึกษาฟรี ไม่มีค่าใช้จ่าย'
  const url = `https://thailife36.com/${params.slug}`
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: 'profile',
      images: data.avatar_url ? [{ url: data.avatar_url, width: 400, height: 400 }] : [],
      siteName: 'Thai Life Digital Office',
      locale: 'th_TH',
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: data.avatar_url ? [data.avatar_url] : [],
    },
  }
}

export default async function ProfilePage({ params }: { params: { slug: string } }) {
  const supabase = createServerSupabase()

  const { data: agent } = await supabase
    .from('agents')
    .select(`
      *,
      agent_products ( * ),
      agent_awards ( * )
    `)
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single()

  if (!agent) notFound()

  // นับ page view (fire-and-forget)
  supabase.rpc('increment_view_count', { agent_id: agent.id }).then(() => {})

  // เรียง products และ awards
  const agentFull: AgentFull = {
    ...agent,
    agent_products: (agent.agent_products || []).sort((a: any, b: any) => a.sort_order - b.sort_order),
    agent_awards: (agent.agent_awards || []).sort((a: any, b: any) => a.sort_order - b.sort_order),
  }

  return <ProfileClient agent={agentFull} />
}
