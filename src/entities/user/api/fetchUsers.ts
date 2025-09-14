import { z } from 'zod'

import { type User, UserSchema } from '../model/types'

import { supabase } from '@/shared/api/supabase'
import { USERS_JSON_URL } from '@/shared/config/constants'

// Load users.json and validate with zod
export async function fetchUsers(): Promise<User[]> {
  const response = await fetch(USERS_JSON_URL, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-cache',
  })

  if (!response.ok) {
    throw new Error(`Failed to load users.json (${response.status})`)
  }

  const data: unknown = await response.json()
  const parsed = z.array(UserSchema).safeParse(data)
  if (!parsed.success) {
    throw new Error('Invalid users.json schema')
  }
  return parsed.data
}

// Map auth user ids to display names; silent on errors
export async function fetchAliasesByAuthIds(authUserIds: string[]) {
  const uniqueIds = Array.from(new Set(authUserIds)).filter(Boolean)
  if (uniqueIds.length === 0) return new Map<string, string>()

  const { data, error } = await supabase.from('user_aliases').select('auth_user_id, name').in('auth_user_id', uniqueIds)

  if (error) {
    return new Map<string, string>()
  }

  const displayNameById = new Map<string, string>()
  for (const row of data ?? []) {
    displayNameById.set(row.auth_user_id, row.name ?? 'Member')
  }
  return displayNameById
}
