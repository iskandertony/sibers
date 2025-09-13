import { useEffect, useState } from 'react'

import { Button, List, Typography, message } from 'antd'

import s from './Sidebar.module.scss'
import { useChannelsStore } from '@/entities/channel/model/channels.store'

const { Text } = Typography

/** Left sidebar: my chats + "New chat" CTA with hover outline. */
export function Sidebar() {
  const { channels, fetchMyChannels, createChannel, setActiveChannelId, activeChannelId } = useChannelsStore()
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    fetchMyChannels().catch(() => message.error('Failed to load my chats'))
  }, [])

  async function handleCreate() {
    const name = prompt('Chat name')
    if (!name) return
    setBusy(true)
    const ok = await createChannel(name)
    setBusy(false)
    message[ok ? 'success' : 'error'](ok ? `Chat "${name}" created` : 'Failed to create chat')
  }

  return (
    <div className={s.wrap}>
      <Button className={s.newChat} onClick={handleCreate} loading={busy}>
        New chat
      </Button>

      <div style={{ marginTop: 12 }}>
        <Text style={{ color: 'var(--text-muted)' }}>My chats</Text>
        <List
          size="small"
          style={{ marginTop: 6 }}
          dataSource={channels}
          locale={{ emptyText: 'No chats yet' }}
          renderItem={(ch) => (
            <List.Item className={s.item} onClick={() => setActiveChannelId(ch.id)}>
              <Text style={{ color: activeChannelId === ch.id ? 'var(--brand)' : 'var(--text)' }}>{ch.name}</Text>
            </List.Item>
          )}
        />
      </div>
    </div>
  )
}
