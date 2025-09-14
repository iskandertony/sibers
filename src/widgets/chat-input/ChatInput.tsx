import { type KeyboardEvent, useCallback, useState } from 'react'

import styles from './ChatInput.module.scss'

type ChatInputProps = {
  value: string
  onChange: (nextValue: string) => void
  onSend: () => void
  placeholder?: string
}

// Single-line input with Enter-to-send and a send button
export function ChatInput({ value, onChange, onSend, placeholder = 'Type a message' }: ChatInputProps) {
  const [isComposing, setIsComposing] = useState(false)
  const canSend = value.trim().length > 0

  // Guarded send to avoid empty submissions
  const handleSend = useCallback(() => {
    if (!canSend) return
    onSend()
  }, [canSend, onSend])

  // Enter sends; ignore while IME composition is active
  const handleInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (isComposing) return
      if (event.key === 'Enter') {
        event.preventDefault()
        handleSend()
      }
    },
    [handleSend, isComposing],
  )

  return (
    <div className={styles.wrap}>
      <input
        className={styles.input}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleInputKeyDown}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => setIsComposing(false)}
        placeholder={placeholder}
        aria-label="Message input"
        autoComplete="off"
      />

      <button
        type="button"
        className={styles.send}
        onClick={handleSend}
        disabled={!canSend}
        aria-label="Send"
        title="Send"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M3 11.5l17-7-7 17-2.5-6-6.5-4.5z" stroke="currentColor" strokeWidth="2" fill="currentColor" />
        </svg>
      </button>
    </div>
  )
}
