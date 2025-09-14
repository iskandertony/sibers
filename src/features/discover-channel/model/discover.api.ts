import { supabase } from '@/shared/api/supabase'

export type DiscoverRow = {
  id: string
  name: string
  created_at: string
  members_count: number
  joined: boolean
}

/** Search discoverable channels via RPC. */
export async function searchChannels(q: string, limit = 20, offset = 0) {
  const { data, error } = await supabase.rpc('list_discoverable_channels', {
    p_q: q,
    p_limit: limit,
    p_offset: offset,
  })
  if (error) throw error
  return (data ?? []) as DiscoverRow[]
}

/** Join a channel by inserting self into channel_members. */
export async function joinChannel(channelId: string) {
  const { data: auth } = await supabase.auth.getUser()
  const uid = auth.user?.id
  if (!uid) throw new Error('No auth user')

  const { error } = await supabase.from('channel_members').insert({
    channel_id: channelId,
    user_id: uid,
    role: 'member',
  })
  if (error) throw error
}
