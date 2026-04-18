const API_KEY_STORAGE_KEY = 'gemini_api_key'

export const apiKeyManager = {
  get(): string | null {
    return localStorage.getItem(API_KEY_STORAGE_KEY)
  },

  set(key: string): void {
    localStorage.setItem(API_KEY_STORAGE_KEY, key)
  },

  clear(): void {
    localStorage.removeItem(API_KEY_STORAGE_KEY)
  },

  exists(): boolean {
    return !!this.get()
  }
}
