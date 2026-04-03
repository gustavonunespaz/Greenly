import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'greenly_last_visit'

function readTimestamp(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const ts = Number(raw)
      if (Number.isFinite(ts)) return ts
    }
  } catch { /* noop */ }
  return 0
}

function writeTimestamp(ts: number) {
  try {
    localStorage.setItem(STORAGE_KEY, String(ts))
  } catch { /* noop */ }
}

export function useLastVisit() {
  const [lastVisit, setLastVisit] = useState<number>(0)

  useEffect(() => {
    const previous = readTimestamp()
    setLastVisit(previous)
    writeTimestamp(Date.now())
  }, [])

  const getTimeSinceLastVisit = useCallback(() => {
    if (!lastVisit) return null
    const diffMs = Date.now() - lastVisit
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor(diffMs / (1000 * 60))

    if (diffHours >= 24) {
      const days = Math.floor(diffHours / 24)
      return `há ${days} dia${days > 1 ? 's' : ''}`
    }
    if (diffHours >= 1) {
      return `há ${diffHours} hora${diffHours > 1 ? 's' : ''}`
    }
    if (diffMinutes >= 1) {
      return `há ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`
    }
    return 'agora mesmo'
  }, [lastVisit])

  return {
    lastVisit,
    isFirstVisit: lastVisit === 0,
    getTimeSinceLastVisit,
  }
}
