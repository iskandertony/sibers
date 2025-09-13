import { supabase } from '@/shared/api/supabase'

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

/** List invites addressed to the current alias (optional UI). */
export async function listMyInvites() {
  const { data, error } = await supabase
    .from('channel_invites')
    .select('id, channel_id, status, created_at')
    .eq('status', 'pending') // RLS will show only my invites
  if (error) throw error
  return data ?? []
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
