import { z } from "zod";

// helpers
const Trimmed = z.string().transform((s) => s.trim());
const Email = z.string().email().transform((s) => s.trim());
const Url = z.string().url();

// schema for users.json
export const UserSchema = z
  .object({
    id: z.number().int(),
    name: Trimmed,
    username: Trimmed,
    email: Email,
    avatar: Url,
    address: z.object({
      city: Trimmed,
      country: Trimmed,
    }),
    company: z.object({
      name: Trimmed,
    }),
    favorite: z.boolean().optional(),
  })
  .passthrough();

export type User = z.infer<typeof UserSchema>;
