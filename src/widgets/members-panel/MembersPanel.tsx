import { useEffect, useMemo, useState } from 'react'

import s from './MembersPanel.module.scss'
import { useChannelsStore } from '@/entities/channel/model/channels.store'
import { usePresenceStore } from '@/entities/member/model/presence.store'
import { supabase } from '@/shared/api/supabase'
import { notify } from '@/shared/lib/notify'
import AppButton from '@/shared/ui/app-button/AppButton'

export function MembersPanel({ channelId, ownerId }: { channelId: string; ownerId: string }) {
  const { online, bindPresence } = usePresenceStore()
  const { setActiveChannelId } = useChannelsStore()
  const [myUid, setMyUid] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMyUid(data.user?.id ?? null))
  }, [])

  useEffect(() => {
    if (!channelId) return
    let off: (() => void) | undefined
    ;(async () => (off = await bindPresence(channelId)))()
    return () => off?.()
  }, [channelId])

  const list = useMemo(() => Object.values(online).sort((a, b) => a.name.localeCompare(b.name)), [online])

  const isOwner = myUid && ownerId === myUid

  async function kick(userId: string) {
    try {
      // owner removes member → RLS must allow this
      await supabase.from('channel_members').delete().eq('channel_id', channelId).eq('user_id', userId)
      notify.success('Member removed')
    } catch {
      notify.error('Failed to remove')
    }
  }

  return (
    <aside className={s.wrap}>
      <div className={s.head}>
        <span>Members ({list.length})</span>
      </div>

      <div className={s.list}>
        {list.map((m) => (
          <div key={m.userId} className={s.item}>
            <img src={m.avatar} alt="" className={s.avatar} />
            <div style={{ flex: '1 1 auto' }}>
              <div className={s.name}>
                {myUid === m.userId ? 'You' : m.name} {m.userId === ownerId && <span className={s.owner}>owner</span>}
              </div>
              <div className={s.meta}>id: {m.userJsonId}</div>
            </div>

            {isOwner && m.userId !== ownerId && (
              <AppButton size="small" onClick={() => kick(m.userId)}>
                Kick
              </AppButton>
            )}
          </div>
        ))}
      </div>
    </aside>
  )
}
