import { useEffect, useMemo, useState } from 'react'

import s from './MembersPanel.module.scss'
import { type ChannelMember, listChannelMembers } from '@/entities/member/api/members.api'
import { usePresenceStore } from '@/entities/member/model/presence.store'
import { InviteUserModal } from '@/features/invite-user/ui/modal/InviteUserModal'
import { supabase } from '@/shared/api/supabase'
import { notify } from '@/shared/lib/notify'
import AppButton from '@/shared/ui/app-button/AppButton'
import UserAvatar from '@/entities/user/ui/UserAvatar'

/** Shows all channel members; marks who is online using presence. */
export function MembersPanel({ channelId, ownerId }: { channelId: string; ownerId: string }) {
  const { online, bindPresence } = usePresenceStore()
  const [myUid, setMyUid] = useState<string | null>(null)
  const [members, setMembers] = useState<ChannelMember[]>([])
  const [loading, setLoading] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)
  // who am I
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMyUid(data.user?.id ?? null))
  }, [])

  // presence bind
  useEffect(() => {
    if (!channelId) return
    let off: (() => void) | undefined
    ;(async () => (off = await bindPresence(channelId)))()
    return () => off?.()
  }, [channelId])

  // load members
  async function refreshMembers() {
    try {
      setLoading(true)
      const rows = await listChannelMembers(channelId)
      setMembers(rows)
    } catch {
      notify.error('Failed to load members')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    if (channelId) refreshMembers()
  }, [channelId])

  // merge: mark online
  const merged = useMemo(() => {
    const onlineSet = new Set(Object.keys(online)) // userId (auth.uid)
    const out = members.map((m) => ({ ...m, online: onlineSet.has(m.user_id) }))
    // sort: online first, then owner on top of online block, then by name
    out.sort((a: any, b: any) => {
      if (a.online !== b.online) return a.online ? -1 : 1
      if ((a.user_id === ownerId) !== (b.user_id === ownerId)) {
        return a.user_id === ownerId ? -1 : 1
      }
      return a.name.localeCompare(b.name)
    })
    return out
  }, [members, online, ownerId])

  const isOwner = myUid && ownerId === myUid

  async function kick(userId: string) {
    try {
      await supabase.from('channel_members').delete().eq('channel_id', channelId).eq('user_id', userId)
      notify.success('Member removed')
      await refreshMembers()
    } catch {
      notify.error('Failed to remove')
    }
  }

  return (
    <aside className={s.wrap}>
      <div className={s.head}>
        <span>Members ({merged.length})</span>
        <AppButton size="small" onClick={refreshMembers} loading={loading}>
          Refresh
        </AppButton>
      </div>

      <div className={s.list}>
        <div className={s.headBtns}>
          {isOwner && (
            <AppButton size="small" onClick={() => setInviteOpen(true)}>
              Invite
            </AppButton>
          )}
        </div>
        {merged.map((m) => (
          <div key={m.user_id} className={s.item}>
            <div className={s.left}>
              <div className={s.avatarWrap}>
                <UserAvatar name={m.name} src={m.avatar ?? undefined} size={28} ring />
                <span className={`${s.dot} ${m.online ? s.online : ''}`} />
              </div>
              <div>
                <div className={s.nameRow}>
                  <span className={s.name}>{myUid === m.user_id ? 'You' : m.name}</span>
                  {m.user_id === ownerId && <span className={s.owner}>owner</span>}
                </div>
                <div className={s.meta}>
                  {m.role} • joined {new Date(m.joined_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            {isOwner && m.user_id !== ownerId && (
              <div className={s.actions}>
                <AppButton size="small" onClick={() => kick(m.user_id)}>
                  Kick
                </AppButton>
              </div>
            )}
          </div>
        ))}
      </div>

      <InviteUserModal open={inviteOpen} onClose={() => setInviteOpen(false)} channelId={channelId} />
    </aside>
  )
}
