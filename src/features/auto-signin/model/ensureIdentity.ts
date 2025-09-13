import { fetchUsers } from '@/entities/user/api/fetchUsers'
import { type UserVM, toUserVM } from '@/entities/user/lib/adapters'
import { supabase } from '@/shared/api/supabase'
import { LS_KEYS } from '@/shared/config/constants'
import { randInt } from '@/shared/lib/random'

/** Snapshot stored in localStorage so we don't have to fetch catalog just to render the header. */
export type ProfileSnapshot = UserVM

function readProfile(): ProfileSnapshot | null {
  try {
    const raw = localStorage.getItem(LS_KEYS.profileSnapshot)
    if (!raw) return null
    return JSON.parse(raw) as ProfileSnapshot
  } catch {
    return null
  }
}

function writeProfile(p: ProfileSnapshot) {
  localStorage.setItem(LS_KEYS.profileSnapshot, JSON.stringify(p))
  localStorage.setItem(LS_KEYS.profileUserJsonId, String(p.id))
  localStorage.setItem(LS_KEYS.profileVersion, 'v1')
  localStorage.setItem(LS_KEYS.lastLoginAt, new Date().toISOString())
}

/** Main entry: ensures a profile in localStorage and an anonymous Supabase session. */
export async function ensureIdentity(): Promise<{ profile: ProfileSnapshot; justSignedIn: boolean }> {
  let profile = readProfile()
  let justSignedIn = false

  if (!profile) {
    const users = await fetchUsers()
    if (!users.length) throw new Error('users.json is empty')
    const idx = randInt(0, users.length - 1)
    profile = toUserVM(users[idx])
    writeProfile(profile)
    justSignedIn = true
  }

  // Ensure anonymous auth in Supabase.
  const session = (await supabase.auth.getSession()).data.session
  if (!session) {
    const { error } = await supabase.auth.signInAnonymously()
    if (error) throw error
  }

  // after anonymous sign-in is ensured
  const { data: auth } = await supabase.auth.getUser()
  const uid = auth.user?.id
  if (uid) {
    await supabase.from('user_aliases').upsert({
      auth_user_id: uid,
      user_json_id: profile.id,
      name: profile.name,
      avatar: profile.avatar,
    })
  }

  return { profile, justSignedIn }
}
