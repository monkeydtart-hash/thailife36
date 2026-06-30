export type Agent = {
  id: string
  user_id: string
  slug: string
  full_name: string
  agent_code: string | null
  branch: string | null
  experience_years: number
  bio: string | null
  avatar_url: string | null
  video_url: string | null
  phone: string | null
  line_id: string | null
  facebook_url: string | null
  instagram_url: string | null
  tiktok_url: string | null
  youtube_channel_url: string | null
  booking_url: string | null
  profile_url: string
  is_active: boolean
  is_admin: boolean
  view_count: number
  created_at: string
  updated_at: string
}

export type AgentProduct = {
  id: string
  agent_id: string
  name: string
  description: string | null
  category: 'life' | 'health' | 'saving' | 'accident' | string
  icon: string | null
  is_featured: boolean
  sort_order: number
}

export type AgentAward = {
  id: string
  agent_id: string
  title: string
  subtitle: string | null
  year: string | null
  icon: string
  sort_order: number
}

export type News = {
  id: string
  title: string
  content: string | null
  is_published: boolean
  sort_order: number
  created_at: string
}

export type AgentVideo = {
  id: string
  agent_id: string
  title: string | null
  youtube_url: string
  sort_order: number
}

export type AgentFull = Agent & {
  agent_products: AgentProduct[]
  agent_awards: AgentAward[]
  agent_videos: AgentVideo[]
}
