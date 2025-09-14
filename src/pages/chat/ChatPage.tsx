import { useEffect, useMemo, useRef, useState } from 'react'

import { Empty, Flex, Input, List, message } from 'antd'

import s from './ChatPage.module.scss'
import { useChannelsStore } from '@/entities/channel/model/channels.store'
import { useMessagesStore } from '@/entities/message/model/messages.store'
import { MessageBubble } from '@/entities/message/ui'
import { fetchAliasesByAuthIds } from '@/entities/user/api/fetchUsers'
import { supabase } from '@/shared/api/supabase'
import { notify } from '@/shared/lib/notify'
import { ChatInput } from '@/widgets/chat-input'
import { MembersPanel } from '@/widgets/members-panel/MembersPanel'

export function ChatPage() {
  const { messages, subscribeToChannel, loadHistory, sendMessage } = useMessagesStore()
  const { activeChannelId, channels } = useChannelsStore()
  const activeChannel = channels.find((c) => c.id === activeChannelId)

  const [input, setInput] = useState('')
  const [aliasMap, setAliasMap] = useState<Map<string, string>>(new Map())
  const [myUid, setMyUid] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)

  // who am I?
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMyUid(data.user?.id ?? null))
  }, [])

  // load history + subscribe
  useEffect(() => {
    if (!activeChannelId) return
    loadHistory(activeChannelId).catch(() => notify.error('Failed to load history'))
    const unsub = subscribeToChannel(activeChannelId)
    return () => unsub?.()
  }, [activeChannelId])

  // scroll down on updates
  useEffect(() => {
    listRef.current?.scrollTo({ top: 999999, behavior: 'smooth' })
  }, [messages.length, activeChannelId])

  // load author names for current messages
  useEffect(() => {
    if (messages.length === 0) return
    const ids = messages.map((m) => m.author_id)
    fetchAliasesByAuthIds(ids)
      .then(setAliasMap)
      .catch(() => {})
  }, [messages])

  async function handleSend() {
    const text = input.trim()
    if (!text || !activeChannelId) return
    setInput('')
    const ok = await sendMessage(activeChannelId, text)
    if (!ok) notify.error('Failed to send')
  }

  const data = useMemo(() => messages, [messages])

  if (!activeChannelId) {
    return (
      <Flex align="center" justify="center" style={{ height: '100%' }}>
        <Empty description="Select or create a chat" />
      </Flex>
    )
  }

  return (
    <div className={s.wrap}>
      <div ref={listRef} className={s.list}>
        <div className={s.header}>#{activeChannel?.name}</div>

        <List
          dataSource={data}
          renderItem={(m) => {
            const isOwn = myUid != null && myUid === m.author_id
            const authorName = isOwn ? 'You' : (aliasMap.get(m.author_id) ?? 'Member')
            const time = new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

            return (
              <List.Item style={{ border: 0, padding: 0 }}>
                <MessageBubble authorName={authorName} content={m.content} time={time} isOwn={isOwn} />
              </List.Item>
            )
          }}
        />
      </div>


      {activeChannelId && activeChannel && (
        <MembersPanel channelId={activeChannelId} ownerId={activeChannel.owner_id} />
      )}

      <div className={s.input}>
        <ChatInput value={input} onChange={setInput} onSend={handleSend} placeholder="Type a message" />
      </div>
    </div>
  )
}
