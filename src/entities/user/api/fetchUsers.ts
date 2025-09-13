import { z } from 'zod'

import { type User, UserSchema } from '../model/types'

import { http } from '@/shared/api/axios'
import { supabase } from '@/shared/api/supabase'
import { USERS_JSON_URL } from '@/shared/config/constants'

/** Load users from the provided JSON dataset and validate shape with zod. */
export async function fetchUsers(): Promise<User[]> {
  const { data } = await http.get(USERS_JSON_URL, { responseType: 'json' })
  const parsed = z.array(UserSchema).safeParse(data)
  if (!parsed.success) {
    console.error(parsed.error)
    throw new Error('Invalid users.json schema')
  }
  return parsed.data
}

export async function fetchAliasesByAuthIds(ids: string[]) {
  const uniq = Array.from(new Set(ids)).filter(Boolean)
  if (!uniq.length) return new Map<string, string>()
  const { data, error } = await supabase.from('user_aliases').select('auth_user_id, name').in('auth_user_id', uniq)

  if (error) {
    console.error(error)
    return new Map<string, string>()
  }
  const map = new Map<string, string>()
  for (const row of data ?? []) map.set(row.auth_user_id, row.name ?? 'Member')
  return map
}
