import { supabase } from '@/shared/api/supabase'

export type ChannelMember = {
  user_id: string
  role: 'owner' | 'member'
  joined_at: string
  name: string
  avatar: string | null
  user_json_id: number | null
}

export async function listChannelMembers(channelId: string): Promise<ChannelMember[]> {
  const { data, error } = await supabase.rpc('list_channel_members', {
    p_channel: channelId,
  })
  if (error) throw error
  return (data ?? []).map((r: any) => ({
    user_id: r.user_id,
    role: r.role,
    joined_at: r.joined_at,
    name: r.name,
    avatar: r.avatar || null,
    user_json_id: r.user_json_id ?? null,
  })) as ChannelMember[]
}
