import { useEffect, useState } from 'react'

import { Empty, Input, List, Modal, Skeleton, Typography } from 'antd'

import styles from './DiscoverChannelsModal.module.scss'
import { useChannelsStore } from '@/entities/channel/model/channels.store'
import { type DiscoverRow, joinChannel, searchChannels } from '@/features/discover-channel/model/discover.api'
import { notify } from '@/shared/lib/notify'
import AppButton from '@/shared/ui/app-button/AppButton'

const { Text } = Typography

// Discover and join existing public channels
export function DiscoverChannelsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [channels, setChannels] = useState<DiscoverRow[]>([])
  const [busyChannelId, setBusyChannelId] = useState<string | null>(null)

  const { fetchMyChannels, setActiveChannelId, activeChannelId } = useChannelsStore()

  // Debounced search
  useEffect(() => {
    if (!open) return
    let isAlive = true
    setIsLoading(true)
    const timer = setTimeout(async () => {
      try {
        const data = await searchChannels(query.trim(), 30, 0)
        if (isAlive) setChannels(data)
      } catch {
        if (isAlive) notify.error('Failed to load channels')
      } finally {
        if (isAlive) setIsLoading(false)
      }
    }, 280)
    return () => {
      isAlive = false
      clearTimeout(timer)
    }
  }, [query, open])

  // Reset search on open
  useEffect(() => {
    if (open) setQuery('')
  }, [open])

  async function handleJoinChannel(row: DiscoverRow) {
    try {
      setBusyChannelId(row.id)
      await joinChannel(row.id)
      notify.success('Joined the chat', row.name)
      await fetchMyChannels()
      setActiveChannelId(row.id)
      onClose()
    } catch {
      notify.error('Failed to join')
    } finally {
      setBusyChannelId(null)
    }
  }

  function handleOpenChannel(row: DiscoverRow) {
    setActiveChannelId(row.id)
    onClose()
  }

  const emptyContent = (
    <Empty className={styles.empty} description={<span className={styles.emptyText}>No channels found</span>} />
  )

  return (
    <Modal
      title="Discover channels"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      rootClassName={styles.darkModal}
      styles={{ mask: { backgroundColor: 'rgba(0,0,0,0.6)' } }}
    >
      <div className={styles.searchWrap}>
        <Input
          className={styles.search}
          placeholder="Search channels by name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          allowClear
          autoFocus
        />
      </div>

      <div className={styles.list}>
        {isLoading ? (
          <Skeleton active paragraph={{ rows: 1 }} />
        ) : (
          <List
            dataSource={channels}
            rowKey={(row) => row.id}
            locale={{ emptyText: emptyContent }}
            renderItem={(row) => {
              const membersCount = row.members_count
              const createdAt = new Date(row.created_at).toLocaleDateString()
              const isOpened = activeChannelId === row.id

              return (
                <List.Item className={styles.item}>
                  <div>
                    <div className={styles.title}>{row.name}</div>
                    <div className={styles.meta}>
                      {membersCount} members • created {createdAt}
                    </div>
                  </div>

                  <div className={styles.actions}>
                    {row.joined ? (
                      <AppButton size="small" onClick={() => handleOpenChannel(row)} disabled={isOpened}>
                        {isOpened ? 'Opened' : 'Open'}
                      </AppButton>
                    ) : (
                      <AppButton size="small" onClick={() => handleJoinChannel(row)} loading={busyChannelId === row.id}>
                        Join
                      </AppButton>
                    )}
                  </div>
                </List.Item>
              )
            }}
          />
        )}
      </div>
    </Modal>
  )
}
