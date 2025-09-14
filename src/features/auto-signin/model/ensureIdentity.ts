import { fetchUsers } from '@/entities/user/api/fetchUsers'
import { type UserVM, toUserVM } from '@/entities/user/lib/adapters'
import { supabase } from '@/shared/api/supabase'
import { LS_KEYS } from '@/shared/config/constants'
import { randInt } from '@/shared/lib/random'

// Snapshot stored in localStorage so we don't have to fetch catalog just to render the header
export type ProfileSnapshot = UserVM

// Read profile snapshot from storage
function readProfile(): ProfileSnapshot | null {
  try {
    const version = localStorage.getItem(LS_KEYS.profileVersion)
    if (version !== 'v1') return null

    const raw = localStorage.getItem(LS_KEYS.profileSnapshot)
    if (!raw) return null

    return JSON.parse(raw) as ProfileSnapshot
  } catch {
    return null
  }
}

// Persist profile snapshot and bookkeeping
function writeProfile(profile: ProfileSnapshot) {
  localStorage.setItem(LS_KEYS.profileSnapshot, JSON.stringify(profile))
  localStorage.setItem(LS_KEYS.profileUserJsonId, String(profile.id))
  localStorage.setItem(LS_KEYS.profileVersion, 'v1')
  localStorage.setItem(LS_KEYS.lastLoginAt, new Date().toISOString())
}

// Pick or create a profile snapshot
async function getOrCreateProfile(): Promise<{ profile: ProfileSnapshot; justSignedIn: boolean }> {
  const existing = readProfile()
  if (existing) return { profile: existing, justSignedIn: false }

  const users = await fetchUsers()
  if (!users.length) throw new Error('users.json is empty')

  const randomIndex = randInt(0, users.length - 1)
  const profile = toUserVM(users[randomIndex])
  writeProfile(profile)
  return { profile, justSignedIn: true }
}

// Ensure we have an anonymous Supabase session
async function ensureAnonSession() {
  const { data } = await supabase.auth.getSession()
  if (data.session) return

  const { error } = await supabase.auth.signInAnonymously()
  if (error) throw error
}

// Sync current alias row with selected profile
async function syncAliasWithProfile(profile: ProfileSnapshot) {
  const { data } = await supabase.auth.getUser()
  const userId = data.user?.id
  if (!userId) return

  try {
    localStorage.setItem(LS_KEYS.authUserId, userId)
  } catch {}

  const { error } = await supabase.from('user_aliases').upsert(
    {
      auth_user_id: userId,
      user_json_id: profile.id,
      name: profile.name,
      avatar: profile.avatar,
    },
    { onConflict: 'auth_user_id' },
  )

  if (error) throw error
}

// Main entry: ensures a profile in localStorage and an anonymous Supabase session
export async function ensureIdentity(): Promise<{ profile: ProfileSnapshot; justSignedIn: boolean }> {
  const { profile, justSignedIn } = await getOrCreateProfile()
  await ensureAnonSession()
  await syncAliasWithProfile(profile)
  return { profile, justSignedIn }
}
