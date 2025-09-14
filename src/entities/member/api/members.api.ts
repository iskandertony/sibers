import { supabase } from '@/shared/api/supabase'

export type ChannelMember = {
  user_id: string // auth uid
  role: 'owner' | 'member'
  joined_at: string
  name: string
  avatar?: string | null
  user_json_id?: number | null
}

/** Load members, then enrich with aliases in a second query. */
export async function listChannelMembers(channelId: string): Promise<ChannelMember[]> {
  // 1) raw members
  const { data: members, error: mErr } = await supabase
    .from('channel_members')
    .select('user_id, role, joined_at')
    .eq('channel_id', channelId)
  if (mErr) throw mErr

  const ids = Array.from(new Set((members ?? []).map((m) => m.user_id))).filter(Boolean)
  if (!ids.length) return []

  // 2) aliases by auth_user_id
  const { data: aliases, error: aErr } = await supabase
    .from('user_aliases')
    .select('auth_user_id, name, avatar, user_json_id')
    .in('auth_user_id', ids)
  if (aErr) throw aErr

  const map = new Map<string, { name?: string; avatar?: string | null; user_json_id?: number | null }>()
  for (const row of aliases ?? []) {
    map.set(row.auth_user_id, {
      name: row.name ?? 'Member',
      avatar: row.avatar ?? null,
      user_json_id: row.user_json_id ?? null,
    })
  }

  return (members ?? []).map((m) => {
    const a = map.get(m.user_id)
    return {
      user_id: m.user_id,
      role: m.role as 'owner' | 'member',
      joined_at: m.joined_at,
      name: a?.name ?? 'Member',
      avatar: a?.avatar ?? null,
      user_json_id: a?.user_json_id ?? null,
    }
  })
}
