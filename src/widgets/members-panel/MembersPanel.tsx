import { useCallback, useEffect, useMemo, useState } from 'react'

import styles from './MembersPanel.module.scss'
import { type ChannelMember, listChannelMembers } from '@/entities/member/api/members.api'
import { usePresenceStore } from '@/entities/member/model/presence.store'
import { UserAvatar } from '@/entities/user/ui/UserAvatar'
import { InviteUserModal } from '@/features/invite-user/ui/modal/InviteUserModal'
import { supabase } from '@/shared/api/supabase'
import { notify } from '@/shared/lib/notify'
import AppButton from '@/shared/ui/app-button/AppButton'

// Shows all members; marks online using presence
export function MembersPanel({ channelId, ownerId }: { channelId: string; ownerId: string }) {
  const { online, bindPresence } = usePresenceStore()

  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [members, setMembers] = useState<ChannelMember[]>([])
  const [loading, setLoading] = useState(false)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)

  const isOwner = currentUserId === ownerId
  // Get user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null))
  }, [])

  // Presence bind
  useEffect(() => {
    if (!channelId) return
    let unsubscribe: (() => void) | undefined
    ;(async () => {
      unsubscribe = await bindPresence(channelId)
    })()
    return () => unsubscribe?.()
  }, [channelId, bindPresence])

  // Load members
  const refreshMembers = useCallback(async () => {
    try {
      setLoading(true)
      const rows = await listChannelMembers(channelId)
      setMembers(rows)
    } catch {
      notify.error('Failed to load members')
    } finally {
      setLoading(false)
    }
  }, [channelId])

  useEffect(() => {
    if (channelId) refreshMembers()
  }, [channelId, refreshMembers])

  // Merge presence and sort
  const sortedMembers = useMemo(() => {
    const onlineSet = new Set(Object.keys(online))
    const withOnline = members.map((member) => ({
      ...member,
      online: onlineSet.has(member.user_id),
    }))
    return withOnline.sort((a, b) => {
      if (a.online !== b.online) return a.online ? -1 : 1
      if ((a.user_id === ownerId) !== (b.user_id === ownerId)) {
        return a.user_id === ownerId ? -1 : 1
      }
      return a.name.localeCompare(b.name)
    })
  }, [members, online, ownerId])

  async function removeMember(userId: string) {
    try {
      await supabase.from('channel_members').delete().eq('channel_id', channelId).eq('user_id', userId)
      notify.success('Member removed')
      await refreshMembers()
    } catch {
      notify.error('Failed to remove')
    }
  }

  return (
    <aside className={styles.wrap}>
      <div className={styles.head}>
        <span>Members ({sortedMembers.length})</span>

        <div className={styles.headBtns}>
          {isOwner && (
            <AppButton size="small" onClick={() => setInviteModalOpen(true)}>
              Invite
            </AppButton>
          )}
          <AppButton size="small" onClick={refreshMembers} loading={loading}>
            Refresh
          </AppButton>
        </div>
      </div>

      <div className={styles.list}>
        {sortedMembers.map((member) => (
          <div key={member.user_id} className={styles.item}>
            <div className={styles.left}>
              <div className={styles.avatarWrap}>
                <UserAvatar name={member.name} src={member.avatar ?? undefined} size={28} ring />
                <span className={`${styles.dot} ${member.online ? styles.online : ''}`} />
              </div>

              <div>
                <div className={styles.nameRow}>
                  <span className={styles.name}>{currentUserId === member.user_id ? 'You' : member.name}</span>
                  {member.user_id === ownerId && <span className={styles.owner}>owner</span>}
                </div>
                <div className={styles.meta}>
                  {member.role} • joined {new Date(member.joined_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            {isOwner && member.user_id !== ownerId && (
              <div className={styles.actions}>
                <AppButton size="small" onClick={() => removeMember(member.user_id)}>
                  Kick
                </AppButton>
              </div>
            )}
          </div>
        ))}
      </div>

      <InviteUserModal open={inviteModalOpen} onClose={() => setInviteModalOpen(false)} channelId={channelId} />
    </aside>
  )
}
