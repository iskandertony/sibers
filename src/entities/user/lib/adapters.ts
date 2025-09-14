import type { User } from "../model/types";

export type UserVM = {
  id: number;
  name: string;
  username: string;
  email: string;
  avatar: string;
  city: string;
  country: string;
  company: string;
  isFavorite: boolean;
};

// Adapt validated User → VM with light normalization
export function toUserVM(user: User): UserVM {
  const {
    id,
    name,
    username,
    email,
    avatar,
    address: { city, country },
    company: { name: company },
    favorite,
  } = user;

  return {
    id,
    name: name.trim(),
    username: username.trim(),
    email: email.trim().toLowerCase(),
    avatar,
    city: city.trim(),
    country: country.trim(),
    company: company.trim(),
    isFavorite: Boolean(favorite),
  };
}
