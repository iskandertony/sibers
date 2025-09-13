import { useEffect, useState } from 'react'

import { Button, List, Space, Typography, message } from 'antd'

import { useChannelsStore } from '@/entities/channel/model/channels.store'
import { acceptInvite, listMyInvites } from '@/features/invite-user/model/invites.api'
import { InviteUserModal } from '@/features/invite-user/ui/InviteUserModal'

const { Text } = Typography

export function Sidebar() {
  const {
    channels,
    publicChannels,
    fetchMyChannels,
    fetchPublicChannels, // if you removed public earlier, keep only fetchMyChannels
    createChannel,
    joinChannel, // or remove joinChannel if not used
    setActiveChannelId,
    activeChannelId,
  } = useChannelsStore()

  const [inviteOpen, setInviteOpen] = useState(false)
  const [myInvites, setMyInvites] = useState<any[]>([])

  useEffect(() => {
    fetchMyChannels().catch(() => message.error('Failed to load my channels'))
    // fetchPublicChannels(); // if you keep public list
    listMyInvites()
      .then(setMyInvites)
      .catch(() => {})
  }, [])

  async function handleAccept(inviteId: string, channelId: string) {
    try {
      await acceptInvite(inviteId, channelId)
      message.success('Joined the channel')
      // Refresh my channels; remove invite from UI
      await fetchMyChannels()
      setMyInvites((x) => x.filter((i) => i.id !== inviteId))
    } catch (e) {
      message.error('Failed to accept invite')
    }
  }

  async function handleCreate() {
    const name = prompt('Channel name')
    if (!name) return
    const ok = await createChannel(name)
    message[ok ? 'success' : 'error'](ok ? `Channel "${name}" created` : 'Failed to create channel')
  }

  return (
    <div style={{ padding: 12 }}>
      <Button type="primary" block onClick={handleCreate}>
        New channel
      </Button>

      <Space direction="vertical" style={{ width: '100%', marginTop: 12 }}>
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: '#9aa0a6' }}>My channels</Text>
            {activeChannelId && (
              <Button size="small" onClick={() => setInviteOpen(true)}>
                Invite…
              </Button>
            )}
          </div>
          <List
            size="small"
            style={{ marginTop: 6 }}
            dataSource={channels}
            locale={{ emptyText: 'No channels yet' }}
            renderItem={(ch) => (
              <List.Item
                style={{
                  cursor: 'pointer',
                  background: '#111418',
                  borderRadius: 8,
                  marginBottom: 6,
                  padding: '8px 10px',
                }}
                onClick={() => setActiveChannelId(ch.id)}
              >
                <Text style={{ color: '#e0e0e0' }}>{ch.name}</Text>
              </List.Item>
            )}
          />
        </section>
      </Space>

      <section style={{ marginTop: 16 }}>
        <Text style={{ color: '#9aa0a6' }}>My invites</Text>
        <List
          size="small"
          style={{ marginTop: 6 }}
          dataSource={myInvites}
          locale={{ emptyText: 'No invites' }}
          renderItem={(i) => (
            <List.Item
              actions={[
                <Button size="small" onClick={() => handleAccept(i.id, i.channel_id)}>
                  Accept
                </Button>,
              ]}
              style={{ background: '#0f1216', borderRadius: 8, marginBottom: 6, padding: '8px 10px' }}
            >
              <span style={{ color: '#e0e0e0' }}>Invite to channel • {i.channel_id.slice(0, 8)}…</span>
            </List.Item>
          )}
        />
      </section>

      {activeChannelId && (
        <InviteUserModal open={inviteOpen} onClose={() => setInviteOpen(false)} channelId={activeChannelId} />
      )}
    </div>
  )
}
