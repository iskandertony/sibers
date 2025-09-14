import { useEffect, useMemo, useState } from 'react'

import { Button, List, Typography } from 'antd'

import s from './Sidebar.module.scss'
import { useChannelsStore } from '@/entities/channel/model/channels.store'
import { CreateChannelModal } from '@/features/create-channel/ui/CreateChannelModal'
import { MyInvites } from '@/features/invite-user/ui/MyInvites'
import { InviteUserModal } from '@/features/invite-user/ui/modal/InviteUserModal'
// поправь путь если другой
import { supabase } from '@/shared/api/supabase'
import { notify } from '@/shared/lib/notify'
import AppButton from '@/shared/ui/app-button/AppButton'

const { Text } = Typography

/** Left sidebar: "New chat", list, Invite…, My invites. */
export function Sidebar() {
  const { channels, fetchMyChannels, createChannel, setActiveChannelId, activeChannelId } = useChannelsStore()

  const [modalOpen, setModalOpen] = useState(false) // create-chat modal
  const [inviteOpen, setInviteOpen] = useState(false) // invite modal
  const [busy, setBusy] = useState(false)
  const [myUid, setMyUid] = useState<string | null>(null)

  useEffect(() => {
    fetchMyChannels().catch(() => notify.error('Failed to load chats'))
    supabase.auth.getUser().then(({ data }) => setMyUid(data.user?.id ?? null))
  }, [])

  const activeChannel = useMemo(() => channels.find((c) => c.id === activeChannelId), [channels, activeChannelId])

  // Only the owner can invite (RLS allows only owners to insert invites)
  const canInvite = !!activeChannel && !!myUid && activeChannel.owner_id === myUid

  async function handleCreate(name: string) {
    setBusy(true)
    const ok = await createChannel(name)
    setBusy(false)
    if (ok) {
      setModalOpen(false)
      notify.success('Chat created', name)
    } else {
      notify.error('Failed to create chat')
    }
  }

  return (
    <div className={s.wrap}>
      <AppButton className={s.newChat} onClick={() => setModalOpen(true)} loading={busy}>
        New chat
      </AppButton>

      <div className={s.headRow}>
        <Text style={{ color: 'var(--text-muted)' }}>My chats</Text>
        {canInvite && (
          <AppButton size="small" onClick={() => setInviteOpen(true)}>
            Invite
          </AppButton>
        )}
      </div>

      <List
        size="small"
        dataSource={channels}
        locale={{ emptyText: 'No chats yet' }}
        renderItem={(ch) => (
          <List.Item className={s.item} onClick={() => setActiveChannelId(ch.id)}>
            <Text style={{ color: activeChannelId === ch.id ? 'var(--brand)' : 'var(--text)' }}>{ch.name}</Text>
          </List.Item>
        )}
      />

      <MyInvites />

      {/* Modals */}
      <CreateChannelModal open={modalOpen} onCancel={() => setModalOpen(false)} onCreate={handleCreate} busy={busy} />

      {activeChannelId && (
        <InviteUserModal open={inviteOpen} onClose={() => setInviteOpen(false)} channelId={activeChannelId} />
      )}
    </div>
  )
}
