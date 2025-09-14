import type { RealtimeChannel } from '@supabase/supabase-js'
import { create } from 'zustand'

import { supabase } from '@/shared/api/supabase'

export type Message = {
  id: string
  channel_id: string
  author_id: string
  content: string
  created_at: string
  optimistic?: boolean
}

type MessagesState = {
  messages: Message[]
  loadHistory: (channelId: string) => Promise<void>
  subscribeToChannel: (channelId: string) => () => void
  sendMessage: (channelId: string, content: string) => Promise<boolean>
}

const broadcastMap = new Map<string, RealtimeChannel>()

function ensureBroadcastChannel(roomId: string): RealtimeChannel {
  let ch = broadcastMap.get(roomId)
  if (!ch) {
    ch = supabase.channel(`room:${roomId}`, { config: { broadcast: { ack: true } } })
    broadcastMap.set(roomId, ch)
  }
  return ch
}

export const useMessagesStore = create<MessagesState>((set, get) => ({
  messages: [],

  async loadHistory(channelId) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: true })
    if (error) {
      console.error(error)
      return
    }
    set({ messages: data ?? [] })
  },

  // Subscribe to new messages
  subscribeToChannel(channelId) {
    console.log('[realtime] subscribeToChannel ->', channelId)

    let pollTimer: ReturnType<typeof setInterval> | null = null

    const pg = supabase
      .channel(`messages:${channelId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `channel_id=eq.${channelId}` },
        (payload) => {
          console.log('[realtime] INSERT', payload)
          const row = payload.new as Message
          set((state) => {
            if (state.messages.some((m) => m.id === row.id)) {
              console.log('[realtime] SKIP duplicate id', row.id)
              return state
            }
            return { messages: [...state.messages, row] }
          })
        },
      )
      .subscribe((status) => {
        console.log('[realtime] status', status, 'for channel', channelId)
        if (status === 'CLOSED' || status === 'TIMED_OUT') {
          if (!pollTimer) {
            console.log('[realtime] start fallback polling')
            pollTimer = setInterval(async () => {
              try {
                const { data, error } = await supabase
                  .from('messages')
                  .select('*')
                  .eq('channel_id', channelId)
                  .order('created_at', { ascending: true })
                if (!error && data) {
                  set((state) => {
                    const seen = new Set(state.messages.map((m) => m.id))
                    const merged = [...state.messages]
                    for (const row of data as Message[]) {
                      if (!seen.has(row.id)) merged.push(row)
                    }
                    return { messages: merged }
                  })
                }
              } catch (e) {
                console.log('[realtime] poll error', e)
              }
            }, 3000)
          }
        } else if (status === 'SUBSCRIBED' && pollTimer) {
          console.log('[realtime] stop fallback polling')
          clearInterval(pollTimer)
          pollTimer = null
        }
      })

    const room = ensureBroadcastChannel(channelId)
    room
      .on('broadcast', { event: 'msg' }, ({ payload }) => {
        console.log('[broadcast] msg', payload)
        const row = payload as Message
        if (!row || row.channel_id !== channelId) return
        set((state) => {
          if (state.messages.some((m) => m.id === row.id)) return state
          return { messages: [...state.messages, row] }
        })
      })
      .subscribe((status) => {
        console.log('[broadcast] status', status, 'for room', channelId)
      })

    return () => {
      console.log('[realtime] unsubscribe', channelId)
      if (pollTimer) clearInterval(pollTimer)
      supabase.removeChannel(pg)
      supabase.removeChannel(room)
      broadcastMap.delete(channelId)
    }
  },

  // Insert a message
  async sendMessage(channelId, content) {
    const { data: auth } = await supabase.auth.getUser()
    const uid = auth.user?.id
    if (!uid) return false

    const optimistic: Message = {
      id: `local-${Math.random().toString(36).slice(2)}`,
      channel_id: channelId,
      author_id: uid,
      content,
      created_at: new Date().toISOString(),
      optimistic: true,
    }

    set((s) => ({ messages: [...s.messages, optimistic] }))

    const { data, error } = await supabase
      .from('messages')
      .insert({ channel_id: channelId, author_id: uid, content })
      .select('*')
      .single()

    if (error || !data) {
      console.log('[send] error, rollback', error)
      set((s) => ({ messages: s.messages.filter((m) => m.id !== optimistic.id) }))
      return false
    }

    set((s) => {
      const pruned = s.messages.filter((m) => m.id !== optimistic.id)
      const already = pruned.some((m) => m.id === data.id)
      return { messages: already ? pruned : [...pruned, data as Message] }
    })

    try {
      const room = ensureBroadcastChannel(channelId)
      const ack = await room.send({ type: 'broadcast', event: 'msg', payload: data })
      console.log('[broadcast] send ack', ack)
    } catch (e) {
      console.log('[broadcast] send error', e)
    }

    return true
  },
}))
