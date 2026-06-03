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
    .select('full_name, branch, bio')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single()

  if (!data) return { title: 'ไม่พบหน้านี้' }
  return {
    title: `${data.full_name} — ตัวแทนไทยประกันชีวิต${data.branch ? ' ' + data.branch : ''}`,
    description: data.bio || 'ตัวแทนประกันชีวิตไทยประกันชีวิต ให้คำปรึกษาฟรี',
    openGraph: {
      title: data.full_name,
      description: data.bio || 'ตัวแทนประกันชีวิต',
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

  // เรียง products และ awards
  const agentFull: AgentFull = {
    ...agent,
    agent_products: (agent.agent_products || []).sort((a: any, b: any) => a.sort_order - b.sort_order),
    agent_awards: (agent.agent_awards || []).sort((a: any, b: any) => a.sort_order - b.sort_order),
  }

  return <ProfileClient agent={agentFull} />
}
