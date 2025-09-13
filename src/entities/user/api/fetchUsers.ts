import { z } from 'zod'

import { type User, UserSchema } from '../model/types'

import { http } from '@/shared/api/axios'
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
