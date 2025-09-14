import { useEffect, useMemo, useState } from 'react'

import { Avatar, Button, Input, List, Modal, Skeleton } from 'antd'

import s from './InviteUserModal.module.scss'
import { fetchUsers } from '@/entities/user/api/fetchUsers'
import { createInvite } from '@/features/invite-user/model/invites.api'
import { notify } from '@/shared/lib/notify'

/** Flattened user VM (strings only) to avoid React rendering objects. */
type UserVM = {
  id: number
  name: string
  username: string
  email: string
  avatar: string
  city: string
  country: string
  companyName: string
}

function toVM(u: any): UserVM {
  return {
    id: u.id,
    name: u.name,
    username: u.username,
    email: u.email,
    avatar: u.avatar,
    city: u.address?.city ?? u.city ?? '',
    country: u.address?.country ?? u.country ?? '',
    companyName: typeof u.company === 'string' ? u.company : (u.company?.name ?? ''),
  }
}

/** Highlights query matches in text. */
function hl(text: string, q: string) {
  if (!q) return text
  const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig')
  const parts = text.split(re)
  return parts.map((part, i) => (re.test(part) ? <mark key={i}>{part}</mark> : <span key={i}>{part}</span>))
}

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
  const [busyId, setBusyId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    fetchUsers()
      .then((rows) => setAll(rows.map(toVM)))
      .catch(() => notify.error('Failed to load users'))
      .finally(() => setLoading(false))
  }, [open])

  const data = useMemo(() => {
    const sterm = q.trim().toLowerCase()
    const base = all
    if (!sterm) return base
    return base.filter(
      (u) =>
        u.name.toLowerCase().includes(sterm) ||
        u.username.toLowerCase().includes(sterm) ||
        u.email.toLowerCase().includes(sterm) ||
        u.city.toLowerCase().includes(sterm) ||
        u.country.toLowerCase().includes(sterm) ||
        u.companyName.toLowerCase().includes(sterm),
    )
  }, [all, q])

  async function handleInvite(userId: number) {
    try {
      setBusyId(userId)
      await createInvite(channelId, userId)
      notify.success('Invite sent')
      onClose()
    } catch {
      notify.error('Failed to send invite')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <Modal
      title="Invite user"
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
          placeholder="Search by name, username, email, city, country, company"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoFocus
          allowClear
        />
      </div>

      <div className={s.list}>
        {loading ? (
          <Skeleton active avatar paragraph={{ rows: 1 }} />
        ) : (
          <List
            dataSource={data}
            locale={{ emptyText: 'No users' }}
            renderItem={(u) => (
              <List.Item
                className={s.item}
                actions={[
                  <Button
                    key="invite"
                    type="primary"
                    size="small"
                    onClick={() => handleInvite(u.id)}
                    loading={busyId === u.id}
                  >
                    Invite
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={<span className={s.title}>{hl(`${u.name} (${u.username})`, q)}</span>}
                  description={
                    <div className={s.meta}>
                      {u.email && <span className={s.chip}>{hl(u.email, q)}</span>}
                      {(u.city || u.country) && (
                        <span className={s.chip}>{hl([u.city, u.country].filter(Boolean).join(', '), q)}</span>
                      )}
                      {u.companyName && <span className={s.chip}>{hl(u.companyName, q)}</span>}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>
    </Modal>
  )
}
