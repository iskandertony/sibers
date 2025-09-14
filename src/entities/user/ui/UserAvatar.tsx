import { useEffect, useMemo, useState } from 'react'

import classNames from 'classnames'

import styles from './UserAvatar.module.scss'

export type UserAvatarProps = {
  // Display name used to compute the fallback letter and color
  name?: string | null
  // Image URL; if empty/broken, fallback to initial letter
  src?: string | null
  // Size in px or preset alias
  size?: number | 'sm' | 'md' | 'lg'
  // Visual shape
  shape?: 'circle' | 'square'
  // Optional ring around avatar
  ring?: boolean
  // Extra classes / title / click handler
  className?: string
  title?: string
  onClick?: () => void
}

function colorFromString(input: string): string {
  let h = 0
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0
  h = h % 360
  const s = 62
  const l = 52
  return `hsl(${h}deg ${s}% ${l}%)`
}

// First non-space letter (uppercased) or '?'
function initialFrom(name?: string | null): string {
  const text = (name ?? '').trim()
  if (!text) return '?'
  const match = text.match(/^\p{L}/u)
  return (match?.[0] ?? text[0]).toUpperCase()
}

// Map preset size to px
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
  const [isImageBroken, setIsImageBroken] = useState(false)

  // Reset broken flag when src changes
  useEffect(() => {
    setIsImageBroken(false)
  }, [src])

  const sizePx = sizeToPx(size)
  const letter = useMemo(() => initialFrom(name), [name])
  const backgroundColor = useMemo(() => colorFromString(name ?? letter), [name, letter])
  const showImage = !!src && !isImageBroken

  // Note: custom CSS var for size
  const style = {
    ['--size' as any]: `${sizePx}px`,
    background: showImage ? undefined : backgroundColor,
  }

  return (
    <span
      className={classNames(styles.root, shape === 'circle' ? styles.circle : null, ring && styles.ring, className)}
      style={style}
      title={title ?? name ?? undefined}
      onClick={onClick}
    >
      {showImage ? (
        <img
          className={styles.img}
          alt={name ?? 'avatar'}
          src={src ?? undefined}
          onError={() => setIsImageBroken(true)}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          draggable={false}
        />
      ) : (
        <span className={styles.initial}>{letter}</span>
      )}
    </span>
  )
}

export default UserAvatar
