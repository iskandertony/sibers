import { useEffect, useMemo, useState } from 'react'

import { Empty, Input, List, Modal, Skeleton, Typography } from 'antd'

import s from './DiscoverChannelsModal.module.scss'
import { useChannelsStore } from '@/entities/channel/model/channels.store'
import { type DiscoverRow, joinChannel, searchChannels } from '@/features/discover-channel/model/discover.api'
import { notify } from '@/shared/lib/notify'
import AppButton from '@/shared/ui/app-button/AppButton'

const { Text } = Typography

/** Discover and join existing public channels. */
export function DiscoverChannelsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState<DiscoverRow[]>([])
  const [busyId, setBusyId] = useState<string | null>(null)

  const { fetchMyChannels, setActiveChannelId, activeChannelId } = useChannelsStore()

  // debounced search
  useEffect(() => {
    if (!open) return
    let alive = true
    setLoading(true)
    const t = setTimeout(async () => {
      try {
        const data = await searchChannels(q.trim(), 30, 0)
        if (alive) setRows(data)
      } catch {
        if (alive) notify.error('Failed to load channels')
      } finally {
        if (alive) setLoading(false)
      }
    }, 280)
    return () => {
      alive = false
      clearTimeout(t)
    }
  }, [q, open])

  // initial load on open
  useEffect(() => {
    if (!open) return
    setQ('') // reset search
  }, [open])

  async function handleJoin(row: DiscoverRow) {
    try {
      setBusyId(row.id)
      await joinChannel(row.id)
      notify.success('Joined the chat', row.name)
      await fetchMyChannels()
      setActiveChannelId(row.id)
      onClose()
    } catch {
      notify.error('Failed to join')
    } finally {
      setBusyId(null)
    }
  }

  function handleOpen(row: DiscoverRow) {
    setActiveChannelId(row.id)
    onClose()
  }

  const emptyContent = <Empty description={<span style={{ color: 'var(--text-muted)' }}>No channels found</span>} />

  return (
    <Modal
      title="Discover channels"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      rootClassName={s.darkModal}
      styles={{ mask: { backgroundColor: 'rgba(0,0,0,0.6)' } }}
    >
      <div className={s.searchWrap}>
        <Input
          className={s.search}
          placeholder="Search channels by name"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          allowClear
          autoFocus
        />
      </div>

      <div className={s.list}>
        {loading ? (
          <Skeleton active paragraph={{ rows: 1 }} />
        ) : (
          <List
            dataSource={rows}
            locale={{ emptyText: emptyContent }}
            renderItem={(row) => (
              <List.Item className={s.item}>
                <div>
                  <div className={s.title}>{row.name}</div>
                  <div className={s.meta}>
                    {row.members_count} members • created {new Date(row.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div className={s.actions}>
                  {row.joined ? (
                    <AppButton
                      size="small"
                      className="button-discover"
                      onClick={() => handleOpen(row)}
                      disabled={activeChannelId === row.id}
                    >
                      {activeChannelId === row.id ? 'Opened' : 'Open'}
                    </AppButton>
                  ) : (
                    <AppButton size="small" onClick={() => handleJoin(row)} loading={busyId === row.id}>
                      Join
                    </AppButton>
                  )}
                </div>
              </List.Item>
            )}
          />
        )}
      </div>
    </Modal>
  )
}
