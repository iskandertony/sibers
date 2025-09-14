import { useEffect, useState } from 'react'

import { List } from 'antd'

import styles from './MyInvites.module.scss'
import { useChannelsStore } from '@/entities/channel/model/channels.store'
import { type InviteRow, acceptInvite, listMyInvites } from '@/features/invite-user/model/invites.api'
import { notify } from '@/shared/lib/notify'
import AppButton from '@/shared/ui/app-button/AppButton'

// Shows pending invites and lets user join a channel
export function MyInvites() {
  const [loading, setLoading] = useState(false)
  const [invites, setInvites] = useState<InviteRow[]>([])
  const { fetchMyChannels, setActiveChannelId } = useChannelsStore()

  // Load pending invites
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

  // Accept invite, join channel, focus it
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
    <div className={styles.section}>
      <div className={styles.head}>
        <span>My invites</span>
        <div className={styles.btns}>
          <AppButton size="small" onClick={load} loading={loading}>
            Refresh
          </AppButton>
        </div>
      </div>

      <List
        size="small"
        className={styles.list}
        dataSource={invites}
        locale={{ emptyText: 'No invites' }}
        renderItem={(inv) => (
          <List.Item
            className={styles.item}
            actions={[
              <AppButton size="small" onClick={() => handleAccept(inv)}>
                Accept
              </AppButton>,
            ]}
          >
            <div>
              <div className={styles.name}>{inv.channels?.name ?? 'Channel'}</div>
              <div className={styles.meta}>Invited • {new Date(inv.created_at).toLocaleString()}</div>
            </div>
          </List.Item>
        )}
      />
    </div>
  )
}
