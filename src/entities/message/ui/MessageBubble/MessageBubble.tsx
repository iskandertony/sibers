import clsx from 'classnames'

import styles from './MessageBubble.module.scss'

export function MessageBubble({
  authorName,
  content,
  time,
  isOwn,
}: {
  authorName: string
  content: string
  time: string
  isOwn?: boolean
}) {
  return (
    <div className={clsx(styles.row, isOwn && styles.own)}>
      <div className={styles.bubble}>
        <div className={styles.header}>{authorName}</div>
        <div className={styles.line}>
          <div className={styles.text}>{content}</div>
          <div className={styles.time}>{time}</div>
        </div>
      </div>
    </div>
  )
}
