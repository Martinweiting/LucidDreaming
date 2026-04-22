export type AiProvider = 'gemini' | 'qwen'

const STORAGE_KEYS = {
  gemini: 'gemini_api_key',
  qwen: 'qwen_api_key',
  provider: 'ai_provider',
} as const

export const apiKeyManager = {
  get(provider?: AiProvider): string | null {
    const p = provider ?? this.getProvider()
    return localStorage.getItem(STORAGE_KEYS[p])
  },

  set(key: string, provider: AiProvider): void {
    localStorage.setItem(STORAGE_KEYS[provider], key)
  },

  clear(provider: AiProvider): void {
    localStorage.removeItem(STORAGE_KEYS[provider])
  },

  exists(provider?: AiProvider): boolean {
    return !!this.get(provider)
  },

  getProvider(): AiProvider {
    const stored = localStorage.getItem(STORAGE_KEYS.provider)
    if (stored === 'gemini' || stored === 'qwen') return stored
    if (localStorage.getItem(STORAGE_KEYS.gemini)) return 'gemini'
    if (localStorage.getItem(STORAGE_KEYS.qwen)) return 'qwen'
    return 'gemini'
  },

  setProvider(provider: AiProvider): void {
    localStorage.setItem(STORAGE_KEYS.provider, provider)
  },

  hasAnyKey(): boolean {
    return !!(
      localStorage.getItem(STORAGE_KEYS.gemini) ||
      localStorage.getItem(STORAGE_KEYS.qwen)
    )
  },
}
