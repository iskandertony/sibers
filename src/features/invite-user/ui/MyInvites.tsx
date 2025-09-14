import { useEffect, useState } from 'react'

import { Button, List } from 'antd'

import s from './MyInvites.module.scss'
import { useChannelsStore } from '@/entities/channel/model/channels.store'
import { type InviteRow, acceptInvite, listMyInvites } from '@/features/invite-user/model/invites.api'
import { notify } from '@/shared/lib/notify'
import AppButton from '@/shared/ui/app-button/AppButton'

export function MyInvites() {
  const [loading, setLoading] = useState(false)
  const [invites, setInvites] = useState<InviteRow[]>([])
  const { fetchMyChannels, setActiveChannelId } = useChannelsStore()

  async function load() {
    setLoading(true)
    try {
      const data = await listMyInvites()
      setInvites(data)
    } catch {
      notify.error('Failed to load invites')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleAccept(inv: InviteRow) {
    try {
      await acceptInvite(inv.id, inv.channel_id)
      notify.success('Joined the chat', inv.channels?.name ?? '')
      await fetchMyChannels()
      setActiveChannelId(inv.channel_id)
      setInvites((xs) => xs.filter((x) => x.id !== inv.id))
    } catch {
      notify.error('Failed to accept invite')
    }
  }

  return (
    <div className={s.section}>
      <div className={s.head}>
        <span>My invites</span>
        <div className={s.btns}>
          <AppButton size="small" onClick={load} loading={loading}>
            Refresh
          </AppButton>
        </div>
      </div>

      <List
        size="small"
        dataSource={invites}
        locale={{ emptyText: 'No invites' }}
        renderItem={(inv) => (
          <List.Item
            className={s.item}
            actions={[
              <AppButton size="small" onClick={() => handleAccept(inv)}>
                Accept
              </AppButton>,
            ]}
          >
            <div>
              <div className={s.name}>{inv.channels?.name ?? 'Channel'}</div>
              <div className={s.meta}>Invited • {new Date(inv.created_at).toLocaleString()}</div>
            </div>
          </List.Item>
        )}
      />
    </div>
  )
}
