import { create } from 'zustand'

import { supabase } from '@/shared/api/supabase'

export type Channel = {
  id: string
  name: string
  owner_id: string
  created_at: string
}

type ChannelsState = {
  channels: Channel[]
  activeChannelId: string | null
  setActiveChannelId: (id: string) => void
  fetchMyChannels: () => Promise<void>
  createChannel: (name: string) => Promise<boolean>
}

export const useChannelsStore = create<ChannelsState>((set, get) => ({
  channels: [],
  activeChannelId: null,
  setActiveChannelId: (id) => set({ activeChannelId: id }),

  /** Load channels where current auth user is a member. */
  async fetchMyChannels() {
    const { data: auth } = await supabase.auth.getUser()
    const uid = auth.user?.id
    if (!uid) {
      set({ channels: [] })
      return
    }

    const { data: mems, error: err1 } = await supabase.from('channel_members').select('channel_id').eq('user_id', uid)

    if (err1 || !mems?.length) {
      set({ channels: [] })
      return
    }

    const ids = mems.map((m) => m.channel_id)
    const { data: chs, error: err2 } = await supabase
      .from('channels')
      .select('id, name, owner_id, created_at')
      .in('id', ids)

    if (err2) {
      console.error(err2)
      set({ channels: [] })
      return
    }
    set({ channels: chs ?? [] })
  },

  /** Create a channel and add current user as owner/member. */
  async createChannel(name: string) {
    const { data: auth } = await supabase.auth.getUser()
    const uid = auth.user?.id
    if (!uid) return false

    const { data, error } = await supabase.from('channels').insert({ name, owner_id: uid }).select('id').single()

    if (error || !data) {
      console.error(error)
      return false
    }

    // Add owner to members
    const ins = await supabase.from('channel_members').insert({
      channel_id: data.id,
      user_id: uid,
      role: 'owner',
    })
    if (ins.error) {
      console.error(ins.error)
      return false
    }

    // Refresh list and select created channel
    await get().fetchMyChannels()
    set({ activeChannelId: data.id })
    return true
  },
}))
