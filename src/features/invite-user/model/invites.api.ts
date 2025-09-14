import { supabase } from '@/shared/api/supabase'

export type InviteStatus = 'pending' | 'accepted' | 'revoked'

export type InviteRow = {
  id: string
  channel_id: string
  status: InviteStatus
  created_at: string
  channels?: { name: string } | null
}

// Create an invite to a users.json profile
export async function createInvite(channelId: string, targetUserJsonId: number) {
  const { data: auth } = await supabase.auth.getUser()
  const uid = auth.user?.id
  if (!uid) throw new Error('No auth user')

  const { error } = await supabase.from('channel_invites').insert({
    channel_id: channelId,
    invited_by: uid,
    target_user_json_id: targetUserJsonId,
  })
  if (error) throw error
}

// Create an invite to a users.json profile
export async function acceptInvite(inviteId: string, channelId: string) {
  const { data: auth } = await supabase.auth.getUser()
  const uid = auth.user?.id
  if (!uid) throw new Error('No auth user')

  const ins = await supabase.from('channel_members').insert({
    channel_id: channelId,
    user_id: uid,
    role: 'member',
  })
  if (ins.error) throw ins.error

  const upd = await supabase.from('channel_invites').update({ status: 'accepted' }).eq('id', inviteId)
  if (upd.error) throw upd.error
}

function one<T>(rel: T | T[] | null | undefined): T | null {
  if (!rel) return null
  return Array.isArray(rel) ? (rel[0] ?? null) : rel
}

// Resolve current auth user id
async function getMyAliasId(): Promise<number | null> {
  const { data: auth } = await supabase.auth.getUser()
  const uid = auth.user?.id
  if (!uid) return null

  const { data } = await supabase.from('user_aliases').select('user_json_id').eq('auth_user_id', uid).single()

  return (data as any)?.user_json_id ?? null
}

// List my pending invites with channel name
export async function listMyInvites(): Promise<InviteRow[]> {
  const aliasId = await getMyAliasId()
  if (aliasId == null) return []

  const { data, error } = await supabase
    .from('channel_invites')
    .select('id, channel_id, status, created_at, channels(name)')
    .eq('status', 'pending')
    .eq('target_user_json_id', aliasId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data ?? []).map((row: any) => ({
    id: row.id,
    channel_id: row.channel_id,
    status: row.status,
    created_at: row.created_at,
    channels: one<{ name: string }>(row.channels),
  }))
}
