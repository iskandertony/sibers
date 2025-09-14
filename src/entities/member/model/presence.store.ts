import { create } from 'zustand'

import { supabase } from '@/shared/api/supabase'

type PresencePayload = {
  userId: string
  userJsonId: number
  name: string
  avatar?: string
}

type PresenceState = {
  online: Record<string, PresencePayload> // key = userId
  bindPresence: (channelId: string) => Promise<() => void>
}

export const usePresenceStore = create<PresenceState>((set, get) => ({
  online: {},

  // Subscribe to Realtime Presence for a channel and start tracking self
  async bindPresence(channelId: string) {
    // who am I
    const { data: auth } = await supabase.auth.getUser()
    const uid = auth.user?.id
    if (!uid) return () => {}

    // profile snapshot (we saved it earlier during auto-signin)
    const raw = localStorage.getItem('app.profile.snapshot')
    const snapshot = raw ? JSON.parse(raw) : null

    const presenceKey = uid
    const room = supabase.channel(`presence:${channelId}`, {
      config: { presence: { key: presenceKey } },
    })

    const applySync = () => {
      const state = room.presenceState()
      // state format: { [key]: [{...payload}, {...}] }
      const merged: Record<string, PresencePayload> = {}
      for (const [key, arr] of Object.entries(state)) {
        const last = Array.isArray(arr) ? (arr[arr.length - 1] as any) : null
        if (last) merged[key] = last as PresencePayload
      }
      set({ online: merged })
    }

    room
      .on('presence', { event: 'sync' }, applySync)
      .on('presence', { event: 'join' }, applySync)
      .on('presence', { event: 'leave' }, applySync)

    const sub = await room.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        // start tracking myself
        await room.track({
          userId: uid,
          userJsonId: snapshot?.userJsonId ?? 0,
          name: snapshot?.name ?? 'You',
          avatar: snapshot?.avatar,
        } as PresencePayload)
      }
    })

    return () => {
      try {
        supabase.removeChannel(room)
      } catch {}
      set({ online: {} })
    }
  },
}))
