import { supabase } from '@/shared/api/supabase'

export type InviteRow = {
  id: string
  channel_id: string
  status: 'pending' | 'accepted' | 'revoked'
  created_at: string
  channels?: { name: string } | null
}

/** Create an invite to a users.json profile for a given channel. */
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

/** Accept an invite: self-join and mark invite accepted (optional UI). */
export async function acceptInvite(inviteId: string, channelId: string) {
  const { data: auth } = await supabase.auth.getUser()
  const uid = auth.user?.id
  if (!uid) throw new Error('No auth user')

  // Self-join (RLS allows this if a pending invite exists for my alias)
  const ins = await supabase.from('channel_members').insert({
    channel_id: channelId,
    user_id: uid,
    role: 'member',
  })
  if (ins.error) throw ins.error

  // Mark invite as accepted (either inviter or target can update)
  const upd = await supabase.from('channel_invites').update({ status: 'accepted' }).eq('id', inviteId)
  if (upd.error) throw upd.error
}

/** Resolve current alias (users.json id) for auth.user(). */
async function getMyAliasId(): Promise<number | null> {
  const { data: auth } = await supabase.auth.getUser()
  const uid = auth.user?.id
  if (!uid) return null

  const { data, error } = await supabase.from('user_aliases').select('user_json_id').eq('auth_user_id', uid).single()

  if (error) return null
  return (data as any)?.user_json_id ?? null
}

/** List only invites addressed to me (pending). Includes channel name. */
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
  return (data ?? []) as InviteRow[]
}
