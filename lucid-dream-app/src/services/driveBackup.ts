/**
 * Google Drive 自動備份服務。
 *
 * 使用 OAuth 2.0 Implicit Flow（純前端），scope 僅請求 drive.file，
 * 表示本 app 只能存取自己建立的檔案，無法讀取使用者其他 Drive 檔案。
 *
 * 備份檔案格式：lucid-dream-backup-YYYY-MM-DD-HHmm.json
 */

import { drivePreferences } from './drivePreferences'
import { backupService } from './backup'

const SCOPE = 'https://www.googleapis.com/auth/drive.file'
const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const DRIVE_API = 'https://www.googleapis.com/drive/v3'
const DRIVE_UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3/files'
const REVOKE_URL = 'https://oauth2.googleapis.com/revoke'
const STATE_KEY = 'lucid_dream_drive_oauth_state'
const FILE_PREFIX = 'lucid-dream-backup-'

export interface DriveFile {
  id: string
  name: string
  createdTime: string
  size?: string
}

export class DriveAuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DriveAuthError'
  }
}

export class DriveApiError extends Error {
  constructor(
    message: string,
    public status?: number
  ) {
    super(message)
    this.name = 'DriveApiError'
  }
}

export function getRedirectUri(): string {
  return `${window.location.origin}${window.location.pathname}`
}

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

export function formatBackupFilename(d: Date): string {
  return `${FILE_PREFIX}${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(
    d.getDate()
  )}-${pad2(d.getHours())}${pad2(d.getMinutes())}.json`
}

function getValidToken(): string {
  const prefs = drivePreferences.get()
  if (!prefs.accessToken || !prefs.tokenExpiresAt) {
    throw new DriveAuthError('尚未連結 Google Drive')
  }
  if (Date.now() >= prefs.tokenExpiresAt) {
    drivePreferences.clearAuth()
    throw new DriveAuthError('Google 授權已過期，請重新連結')
  }
  return prefs.accessToken
}

async function handleApiError(response: Response, fallback: string): Promise<never> {
  let message = fallback
  try {
    const data = (await response.json()) as { error?: { message?: string } }
    if (data.error?.message) message = `${fallback}：${data.error.message}`
  } catch {
    // 忽略解析失敗
  }
  if (response.status === 401 || response.status === 403) {
    drivePreferences.clearAuth()
    throw new DriveAuthError(message)
  }
  throw new DriveApiError(message, response.status)
}

async function fetchUserEmail(token: string): Promise<string | null> {
  try {
    const response = await fetch(
      `${DRIVE_API}/about?fields=user(emailAddress,displayName)`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    if (!response.ok) return null
    const data = (await response.json()) as {
      user?: { emailAddress?: string }
    }
    return data.user?.emailAddress ?? null
  } catch {
    return null
  }
}

async function pruneOldBackups(): Promise<void> {
  const prefs = drivePreferences.get()
  const token = getValidToken()
  const files = await driveBackup.listBackups()
  if (files.length <= prefs.keepLast) return

  const toDelete = files.slice(prefs.keepLast)
  await Promise.all(
    toDelete.map(async (f) => {
      try {
        await fetch(`${DRIVE_API}/files/${f.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        })
      } catch {
        // 單檔刪除失敗不中斷整體流程
      }
    })
  )
}

export const driveBackup = {
  /**
   * 觸發 OAuth 授權流程，會 redirect 至 Google 授權頁。
   * 返回時 URL hash 會帶 access_token，需在 App 載入時呼叫 handleOAuthCallback。
   */
  authorize(): void {
    const prefs = drivePreferences.get()
    if (!prefs.clientId) {
      throw new DriveAuthError('請先設定 Google OAuth Client ID')
    }

    const state = crypto.randomUUID()
    sessionStorage.setItem(STATE_KEY, state)

    const params = new URLSearchParams({
      client_id: prefs.clientId,
      redirect_uri: getRedirectUri(),
      response_type: 'token',
      scope: SCOPE,
      state,
      include_granted_scopes: 'true',
      prompt: 'consent',
    })

    window.location.assign(`${AUTH_URL}?${params.toString()}`)
  },

  /**
   * 偵測 URL hash 是否為 OAuth callback；若是，解析並儲存 token。
   * 返回 true 表示已處理；false 表示無 callback。
   */
  async handleOAuthCallback(): Promise<boolean> {
    const hash = window.location.hash
    if (!hash || !hash.includes('access_token')) return false

    const params = new URLSearchParams(hash.slice(1))
    const token = params.get('access_token')
    const expiresIn = params.get('expires_in')
    const state = params.get('state')
    const error = params.get('error')

    const expectedState = sessionStorage.getItem(STATE_KEY)
    sessionStorage.removeItem(STATE_KEY)

    // 無論如何都清掉 hash，避免 token 留在 URL 中
    const cleanUrl = `${window.location.pathname}${window.location.search}`
    window.history.replaceState(null, '', cleanUrl)

    if (error) {
      throw new DriveAuthError(`Google 授權失敗：${error}`)
    }

    if (!token || !expiresIn) {
      throw new DriveAuthError('Google 授權未返回有效 token')
    }

    if (!expectedState || state !== expectedState) {
      throw new DriveAuthError('OAuth state 驗證失敗，請重試')
    }

    const expiresMs = parseInt(expiresIn, 10) * 1000
    const tokenExpiresAt = Date.now() + expiresMs
    const userEmail = await fetchUserEmail(token)

    drivePreferences.update({
      accessToken: token,
      tokenExpiresAt,
      userEmail,
      lastBackupError: null,
    })

    return true
  },

  isAuthorized(): boolean {
    const prefs = drivePreferences.get()
    if (!prefs.accessToken || !prefs.tokenExpiresAt) return false
    return Date.now() < prefs.tokenExpiresAt
  },

  async backupNow(): Promise<{ fileId: string; fileName: string }> {
    const token = getValidToken()
    const blob = await backupService.exportAllToJson()
    const now = new Date()
    const fileName = formatBackupFilename(now)

    const metadata = {
      name: fileName,
      mimeType: 'application/json',
    }

    const boundary = `lucid_dream_boundary_${crypto.randomUUID()}`
    const delim = `\r\n--${boundary}\r\n`
    const closeDelim = `\r\n--${boundary}--`
    const text = await blob.text()

    const body =
      delim +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delim +
      'Content-Type: application/json\r\n\r\n' +
      text +
      closeDelim

    const response = await fetch(`${DRIVE_UPLOAD_API}?uploadType=multipart`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body,
    })

    if (!response.ok) {
      await handleApiError(response, '備份上傳失敗')
    }

    const result = (await response.json()) as { id: string; name: string }

    drivePreferences.update({
      lastBackupAt: now.toISOString(),
      lastBackupError: null,
    })

    try {
      await pruneOldBackups()
    } catch {
      // 修剪失敗不阻斷備份成功
    }

    return { fileId: result.id, fileName: result.name }
  },

  async listBackups(): Promise<DriveFile[]> {
    const token = getValidToken()
    const q = `name contains '${FILE_PREFIX}' and trashed = false`
    const params = new URLSearchParams({
      q,
      fields: 'files(id,name,createdTime,size)',
      orderBy: 'createdTime desc',
      pageSize: '100',
    })

    const response = await fetch(`${DRIVE_API}/files?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) {
      await handleApiError(response, '讀取備份列表失敗')
    }

    const data = (await response.json()) as { files?: DriveFile[] }
    return data.files ?? []
  },

  async restoreFromBackup(fileId: string): Promise<void> {
    const token = getValidToken()
    const response = await fetch(
      `${DRIVE_API}/files/${encodeURIComponent(fileId)}?alt=media`,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    if (!response.ok) {
      await handleApiError(response, '下載備份失敗')
    }

    const blob = await response.blob()
    const file = new File([blob], 'drive-restore.json', {
      type: 'application/json',
    })
    await backupService.importFromJson(file, 'replace')
  },

  async revoke(): Promise<void> {
    const prefs = drivePreferences.get()
    const token = prefs.accessToken
    if (token) {
      try {
        await fetch(`${REVOKE_URL}?token=${encodeURIComponent(token)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })
      } catch {
        // 網路失敗仍須清除本地 token
      }
    }
    drivePreferences.clearAuth()
  },

  /**
   * 判斷是否該觸發自動備份。
   * 需已授權且 frequency 不為 off，且距上次備份已超過頻率。
   */
  shouldAutoBackup(now: Date = new Date()): boolean {
    const prefs = drivePreferences.get()
    if (prefs.frequency === 'off') return false
    if (!driveBackup.isAuthorized()) return false
    if (!prefs.lastBackupAt) return true

    const last = new Date(prefs.lastBackupAt).getTime()
    if (Number.isNaN(last)) return true

    const dayMs = 1000 * 60 * 60 * 24
    const threshold = prefs.frequency === 'daily' ? dayMs : dayMs * 7
    return now.getTime() - last >= threshold
  },
}
