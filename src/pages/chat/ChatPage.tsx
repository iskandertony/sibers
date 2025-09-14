import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Empty, Flex, List } from 'antd'

import s from './ChatPage.module.scss'
import { useChannelsStore } from '@/entities/channel/model/channels.store'
import { useMessagesStore } from '@/entities/message/model/messages.store'
import { MessageBubble } from '@/entities/message/ui'
import { fetchAliasesByAuthIds } from '@/entities/user/api/fetchUsers'
import { supabase } from '@/shared/api/supabase'
import { notify } from '@/shared/lib/notify'
import { ChatInput } from '@/widgets/chat-input'
import { MembersPanel } from '@/widgets/members-panel/MembersPanel'

// Chat page: shows history, binds realtime, input box, and members panel
export function ChatPage() {
  const { messages, subscribeToChannel, loadHistory, sendMessage } = useMessagesStore()
  const { activeChannelId, channels } = useChannelsStore()

  // Resolve current channel once per change
  const selectedChannel = useMemo(
    () => channels.find((c) => c.id === activeChannelId) ?? null,
    [channels, activeChannelId],
  )

  // Controlled input (message draft)
  const [messageDraft, setMessageDraft] = useState('')

  // Current auth user id
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  // Display names of authors by user id
  const [displayNameByUserId, setDisplayNameByUserId] = useState<Record<string, string>>({})
  const displayNameCacheRef = useRef<Record<string, string>>({})

  // Scroll container for messages list
  const messagesViewportRef = useRef<HTMLDivElement | null>(null)

  // Fetch auth uid once
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null))
  }, [])

  // Load history and subscribe to realtime updates for the selected channel
  useEffect(() => {
    if (!activeChannelId) return
    loadHistory(activeChannelId).catch(() => notify.error('Failed to load history'))
    const unsubscribe = subscribeToChannel(activeChannelId)
    return () => unsubscribe?.()
  }, [activeChannelId, loadHistory, subscribeToChannel])

  // Scroll to bottom helper
  const scrollMessagesToBottom = useCallback((smooth = true) => {
    const container = messagesViewportRef.current
    if (!container) return
    container.scrollTo({
      top: container.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto',
    })
  }, [])

  // Auto-scroll when messages arrive or channel changes
  useEffect(() => {
    scrollMessagesToBottom()
  }, [messages.length, activeChannelId, scrollMessagesToBottom])

  // Ensure we have display names for all authors in the current batch
  useEffect(() => {
    if (!messages.length) return
    const cache = displayNameCacheRef.current
    const missingIds = Array.from(new Set(messages.map((m) => m.author_id))).filter((id) => !cache[id])

    if (missingIds.length === 0) {
      // Trigger render with the latest cache snapshot
      setDisplayNameByUserId({ ...cache })
      return
    }

    fetchAliasesByAuthIds(missingIds).then((map) => {
      const next = { ...cache }
      for (const [id, name] of map.entries()) next[id] = name
      displayNameCacheRef.current = next
      setDisplayNameByUserId(next)
    })
  }, [messages])

  // Send current draft
  const handleSendMessage = useCallback(async () => {
    const text = messageDraft.trim()
    if (!text || !activeChannelId) return
    setMessageDraft('')
    const ok = await sendMessage(activeChannelId, text)
    if (!ok) notify.error('Failed to send')
  }, [messageDraft, activeChannelId, sendMessage])

  if (!activeChannelId) {
    return (
      <Flex align="center" justify="center">
        <Empty className={s.empty} description="Select or create a chat" />
      </Flex>
    )
  }

  return (
    <div className={s.wrap}>
      <div ref={messagesViewportRef} className={s.list}>
        <div className={s.header}>#{selectedChannel?.name}</div>

        <List
          dataSource={messages}
          rowKey={(m) => m.id}
          split={false}
          renderItem={(m) => {
            const isOwnMessage = currentUserId != null && currentUserId === m.author_id
            const authorName = isOwnMessage ? 'You' : (displayNameByUserId[m.author_id] ?? 'Member')
            const time = new Intl.DateTimeFormat(undefined, {
              hour: '2-digit',
              minute: '2-digit',
            }).format(new Date(m.created_at))

            return (
              <List.Item className={s.row}>
                <MessageBubble authorName={authorName} content={m.content} time={time} isOwn={isOwnMessage} />
              </List.Item>
            )
          }}
        />
      </div>

      {selectedChannel && <MembersPanel channelId={selectedChannel.id} ownerId={selectedChannel.owner_id} />}

      <div className={s.input}>
        <ChatInput
          value={messageDraft}
          onChange={setMessageDraft}
          onSend={handleSendMessage}
          placeholder="Type a message"
        />
      </div>
    </div>
  )
}
