import { create } from 'zustand'

export type Profile = {
  id: number
  name: string
  username: string
  email: string
  avatar: string
  city: string
  country: string
  company: string
  isFavorite: boolean
}

type SessionState = {
  profile: Profile | null
  setProfile: (p: Profile) => void
  clearProfile: () => void
}

export const useSessionStore = create<SessionState>((set) => ({
  profile: null,
  setProfile: (p) => set({ profile: p }),
  clearProfile: () => {
    localStorage.removeItem('app.profile.userJsonId')
    localStorage.removeItem('app.profile.snapshot')
    localStorage.removeItem('app.profile.version')
    localStorage.removeItem('app.lastLoginAt')
    localStorage.clear()
    set({ profile: null })
    location.reload()
  },
}))
