import { z } from "zod";

/** Minimal schema from users.json; extend if needed. */
export const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  username: z.string(),
  email: z.string(),
  avatar: z.string().url(),
  address: z.object({
    city: z.string(),
    country: z.string()
  }),
  company: z.object({
    name: z.string()
  }),
  favorite: z.boolean().optional()
});

export type User = z.infer<typeof UserSchema>;
