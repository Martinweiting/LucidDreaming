const ATTENTION_FLAGS_KEY = 'dreamSigns_attentionFlags'

export function getAttentionFlags(): Record<string, boolean> {
  const stored = localStorage.getItem(ATTENTION_FLAGS_KEY)
  if (!stored) {
    return {}
  }
  try {
    return JSON.parse(stored)
  } catch {
    return {}
  }
}

export function setAttentionFlag(tag: string, enabled: boolean): void {
  const flags = getAttentionFlags()
  const updated = { ...flags, [tag]: enabled }
  localStorage.setItem(ATTENTION_FLAGS_KEY, JSON.stringify(updated))
}

export function clearAll(): void {
  localStorage.removeItem(ATTENTION_FLAGS_KEY)
}
