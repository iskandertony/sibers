import clsx from 'classnames'

import s from './MessageBubble.module.scss'

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
    <div className={clsx(s.row, isOwn && s.own)}>
      <div className={s.bubble}>
        <div className={s.header}>{authorName}</div>
        <div className={s.line}>
          <div className={s.text}>{content}</div>
          <div className={s.time}>{time}</div>
        </div>
      </div>
    </div>
  )
}
