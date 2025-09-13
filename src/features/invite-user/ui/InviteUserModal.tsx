import { useEffect, useMemo, useState } from 'react'

import { Avatar, Button, Input, List, Modal, message } from 'antd'

import { createInvite } from '../model/invites.api'

import { fetchUsers } from '@/entities/user/api/fetchUsers'
import { type UserVM, toUserVM } from '@/entities/user/lib/adapters'

/** Invite dialog: local search over users.json and send invite on click. */
export function InviteUserModal({
  open,
  onClose,
  channelId,
}: {
  open: boolean
  onClose: () => void
  channelId: string
}) {
  const [all, setAll] = useState<UserVM[]>([])
  const [q, setQ] = useState('')

  useEffect(() => {
    if (!open) return
    fetchUsers()
      .then((u) => setAll(u.map(toUserVM)))
      .catch(() => {
        message.error('Failed to load users.json')
      })
  }, [open])

  const data = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return all
    return all.filter(
      (x) =>
        x.name.toLowerCase().includes(s) ||
        x.username.toLowerCase().includes(s) ||
        x.email.toLowerCase().includes(s) ||
        x.city.toLowerCase().includes(s) ||
        x.country.toLowerCase().includes(s),
    )
  }, [all, q])

  async function handleInvite(targetUserJsonId: number) {
    try {
      await createInvite(channelId, targetUserJsonId)
      message.success('Invite sent')
      onClose()
    } catch (e) {
      console.error(e)
      message.error('Failed to send invite')
    }
  }

  return (
    <Modal open={open} onCancel={onClose} footer={null} title="Invite user">
      <Input
        placeholder="Search by name, username, email, city, country"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        style={{ marginBottom: 12 }}
      />
      <List
        dataSource={data}
        renderItem={(u) => (
          <List.Item
            actions={[
              <Button onClick={() => handleInvite(u.id)} type="primary" size="small">
                Invite
              </Button>,
            ]}
          >
            <List.Item.Meta
              avatar={<Avatar src={u.avatar} />}
              title={`${u.name} (${u.username})`}
              description={`${u.email} • ${u.city}, ${u.country} • ${u.company}`}
            />
          </List.Item>
        )}
      />
    </Modal>
  )
}
