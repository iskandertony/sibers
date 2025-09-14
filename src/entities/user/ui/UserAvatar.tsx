import { useMemo, useState } from 'react'

import classNames from 'classnames'

import s from './UserAvatar.module.scss'

export type UserAvatarProps = {
  /** Display name used to compute the fallback letter and color */
  name?: string | null
  /** Image URL; if empty/broken, fallback to initial letter */
  src?: string | null
  /** Size in px or preset alias */
  size?: number | 'sm' | 'md' | 'lg'
  /** Visual shape */
  shape?: 'circle' | 'square'
  /** Optional ring around avatar (like in the app) */
  ring?: boolean
  /** Extra classes / inline title / click handlers, etc. */
  className?: string
  title?: string
  onClick?: () => void
}

/** Hash a string into a stable HSL color (pleasant saturation/lightness). */
function colorFromString(input: string): string {
  let h = 0
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0 // simple fast hash
  }
  h = h % 360
  const s = 62 // saturation
  const l = 52 // lightness (works in dark UIs)
  return `hsl(${h}deg ${s}% ${l}%)`
}

/** First non-space letter (uppercased); fallback to '?' */
function initialFrom(name?: string | null): string {
  const t = (name ?? '').trim()
  if (!t) return '?'
  const m = t.match(/^\p{L}/u) // first unicode letter
  return (m?.[0] ?? t[0]).toUpperCase()
}

/** Map preset size to px */
function sizeToPx(size?: UserAvatarProps['size']): number {
  if (typeof size === 'number') return size
  switch (size) {
    case 'sm':
      return 24
    case 'lg':
      return 48
    case 'md':
    default:
      return 32
  }
}

export function UserAvatar({
  name,
  src,
  size = 'md',
  shape = 'circle',
  ring = false,
  className,
  title,
  onClick,
}: UserAvatarProps) {
  const [broken, setBroken] = useState(false)
  const px = sizeToPx(size)
  const letter = useMemo(() => initialFrom(name), [name])
  const bg = useMemo(() => colorFromString(name ?? letter), [name, letter])

  const showImg = !!src && !broken

  return (
    <span
      className={classNames(s.root, shape === 'circle' ? s.circle : null, ring && s.ring, className)}
      style={{ ['--size' as any]: `${px}px`, background: showImg ? undefined : bg }}
      title={title ?? name ?? undefined}
      onClick={onClick}
    >
      {showImg ? (
        <img
          className={s.img}
          alt={name ?? 'avatar'}
          src={src ?? undefined}
          onError={() => setBroken(true)}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span className={s.initial}>{letter}</span>
      )}
    </span>
  )
}

export default UserAvatar
