import type { User } from '../model/types'

export type UserVM = {
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

export function toUserVM(u: User): UserVM {
  return {
    id: u.id,
    name: u.name,
    username: u.username,
    email: u.email,
    avatar: u.avatar,
    city: u.address.city,
    country: u.address.country,
    company: u.company.name,
    isFavorite: !!u.favorite,
  }
}
