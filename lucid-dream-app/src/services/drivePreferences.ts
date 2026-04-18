/**
 * Google Drive 備份偏好設定。
 * 儲存於 localStorage，Capacitor 化時會換成 Preferences。
 */

const PREFS_KEY = 'lucid_dream_drive_prefs'

export type BackupFrequency = 'off' | 'daily' | 'weekly'

export interface DrivePreferences {
  clientId: string
  accessToken: string | null
  tokenExpiresAt: number | null
  userEmail: string | null
  frequency: BackupFrequency
  keepLast: number
  lastBackupAt: string | null
  lastBackupError: string | null
}

const DEFAULT_PREFS: DrivePreferences = {
  clientId: '',
  accessToken: null,
  tokenExpiresAt: null,
  userEmail: null,
  frequency: 'off',
  keepLast: 10,
  lastBackupAt: null,
  lastBackupError: null,
}

function sanitize(raw: unknown): DrivePreferences {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_PREFS }
  const p = raw as Partial<DrivePreferences>
  return {
    clientId: typeof p.clientId === 'string' ? p.clientId : DEFAULT_PREFS.clientId,
    accessToken: typeof p.accessToken === 'string' ? p.accessToken : null,
    tokenExpiresAt: typeof p.tokenExpiresAt === 'number' ? p.tokenExpiresAt : null,
    userEmail: typeof p.userEmail === 'string' ? p.userEmail : null,
    frequency:
      p.frequency === 'daily' || p.frequency === 'weekly' || p.frequency === 'off'
        ? p.frequency
        : DEFAULT_PREFS.frequency,
    keepLast:
      typeof p.keepLast === 'number' && p.keepLast > 0 && p.keepLast <= 100
        ? Math.floor(p.keepLast)
        : DEFAULT_PREFS.keepLast,
    lastBackupAt: typeof p.lastBackupAt === 'string' ? p.lastBackupAt : null,
    lastBackupError: typeof p.lastBackupError === 'string' ? p.lastBackupError : null,
  }
}

export const drivePreferences = {
  get(): DrivePreferences {
    try {
      const raw = localStorage.getItem(PREFS_KEY)
      if (!raw) return { ...DEFAULT_PREFS }
      return sanitize(JSON.parse(raw))
    } catch {
      return { ...DEFAULT_PREFS }
    }
  },

  update(patch: Partial<DrivePreferences>): DrivePreferences {
    const current = drivePreferences.get()
    const next: DrivePreferences = { ...current, ...patch }
    localStorage.setItem(PREFS_KEY, JSON.stringify(next))
    return next
  },

  clearAuth(): void {
    drivePreferences.update({
      accessToken: null,
      tokenExpiresAt: null,
      userEmail: null,
    })
  },

  reset(): void {
    localStorage.removeItem(PREFS_KEY)
  },
}
