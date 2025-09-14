import { useCallback } from 'react'

import s from './ChatInput.module.scss'

/** Pure UI chat input with send button. No external libs. */
export function ChatInput({
  value,
  onChange,
  onSend,
  placeholder = 'Type a message',
}: {
  value: string
  onChange: (v: string) => void
  onSend: () => void
  placeholder?: string
}) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        onSend()
      }
    },
    [onSend],
  )

  const canSend = value.trim().length > 0

  return (
    <div className={s.wrap}>
      <input
        className={s.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label="Message"
        autoComplete="off"
      />

      <button type="button" className={s.send} onClick={onSend} disabled={!canSend} aria-label="Send" title="Send">
        {/* paper plane icon */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M3 11.5l17-7-7 17-2.5-6-6.5-4.5z" stroke="currentColor" strokeWidth="2" fill="currentColor" />
        </svg>
      </button>
    </div>
  )
}
