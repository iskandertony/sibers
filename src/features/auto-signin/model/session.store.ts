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
  setProfile: (profile: Profile) => void
  clearProfile: () => void
}

// Remove all local storage data
function clearStoredProfile() {
  try {
    localStorage.clear()
  } catch {
    // ignore storage errors
  }
}

export const useSessionStore = create<SessionState>((set) => ({
  profile: null,

  // Set current profile in memory (persisting — if needed — делаем отдельно)
  setProfile: (profile) => set({ profile }),

  // Clear profile and refresh UI to a clean state
  clearProfile: () => {
    clearStoredProfile()
    set({ profile: null })
    if (typeof location !== 'undefined') location.reload()
  },
}))
