/**
 * Settings 頁「Google Drive 備份」區塊。
 * 處理：Client ID 設定、OAuth 連結、立即備份、頻率、保留份數、還原、解除連結。
 */

import { useCallback, useEffect, useState } from 'react'
import {
  driveBackup,
  getRedirectUri,
  type DriveFile,
} from '../services/driveBackup'
import {
  drivePreferences,
  type BackupFrequency,
  type DrivePreferences,
} from '../services/drivePreferences'
import { ConfirmModal } from './ConfirmModal'

function formatDateTime(iso: string | null): string {
  if (!iso) return '尚未備份'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const pad = (n: number): string => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function DriveBackupSection(): JSX.Element {
  const [prefs, setPrefs] = useState<DrivePreferences>(() =>
    drivePreferences.get()
  )
  const [clientIdDraft, setClientIdDraft] = useState<string>(prefs.clientId)
  const [clientIdSaved, setClientIdSaved] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [backingUp, setBackingUp] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [backups, setBackups] = useState<DriveFile[] | null>(null)
  const [loadingBackups, setLoadingBackups] = useState(false)
  const [restoringId, setRestoringId] = useState<string | null>(null)
  const [confirmRevoke, setConfirmRevoke] = useState(false)
  const [confirmRestore, setConfirmRestore] = useState<DriveFile | null>(null)
  const [restoreConfirmInput, setRestoreConfirmInput] = useState('')
  const [copiedRedirect, setCopiedRedirect] = useState(false)

  const refreshPrefs = useCallback(() => {
    setPrefs(drivePreferences.get())
  }, [])

  useEffect(() => {
    refreshPrefs()
  }, [refreshPrefs])

  const isConnected = driveBackup.isAuthorized()
  const redirectUri = getRedirectUri()

  const handleSaveClientId = (): void => {
    const trimmed = clientIdDraft.trim()
    drivePreferences.update({ clientId: trimmed })
    refreshPrefs()
    setClientIdSaved(true)
    setTimeout(() => setClientIdSaved(false), 1500)
  }

  const handleConnect = (): void => {
    setActionError(null)
    try {
      driveBackup.authorize()
    } catch (error) {
      const message = error instanceof Error ? error.message : '連結失敗'
      setActionError(message)
    }
  }

  const handleBackupNow = async (): Promise<void> => {
    setBackingUp(true)
    setActionError(null)
    try {
      await driveBackup.backupNow()
      refreshPrefs()
      // 若已展開備份列表，重新載入
      if (backups !== null) {
        await handleLoadBackups()
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '備份失敗'
      setActionError(message)
      refreshPrefs()
    } finally {
      setBackingUp(false)
    }
  }

  const handleLoadBackups = async (): Promise<void> => {
    setLoadingBackups(true)
    setActionError(null)
    try {
      const list = await driveBackup.listBackups()
      setBackups(list)
    } catch (error) {
      const message = error instanceof Error ? error.message : '讀取失敗'
      setActionError(message)
      refreshPrefs()
    } finally {
      setLoadingBackups(false)
    }
  }

  const handleRestoreConfirm = async (): Promise<void> => {
    if (!confirmRestore) return
    const target = confirmRestore
    setConfirmRestore(null)
    setRestoreConfirmInput('')
    setRestoringId(target.id)
    setActionError(null)
    try {
      await driveBackup.restoreFromBackup(target.id)
    } catch (error) {
      const message = error instanceof Error ? error.message : '還原失敗'
      setActionError(message)
      refreshPrefs()
    } finally {
      setRestoringId(null)
    }
  }

  const handleFrequencyChange = (frequency: BackupFrequency): void => {
    drivePreferences.update({ frequency })
    refreshPrefs()
  }

  const handleKeepLastChange = (value: number): void => {
    const clamped = Math.max(1, Math.min(100, Math.floor(value)))
    drivePreferences.update({ keepLast: clamped })
    refreshPrefs()
  }

  const handleRevokeConfirm = async (): Promise<void> => {
    setConfirmRevoke(false)
    setActionError(null)
    try {
      await driveBackup.revoke()
      setBackups(null)
      refreshPrefs()
    } catch (error) {
      const message = error instanceof Error ? error.message : '解除失敗'
      setActionError(message)
    }
  }

  const handleCopyRedirect = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(redirectUri)
      setCopiedRedirect(true)
      setTimeout(() => setCopiedRedirect(false), 1500)
    } catch {
      // 忽略
    }
  }

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-body font-semibold text-text-primary">
          Google Drive 備份
        </h2>
        <p className="text-small text-text-secondary mt-1">
          自動備份至您的 Google Drive（僅存取 app 建立的檔案）
        </p>
      </div>

      <div className="space-y-4 bg-bg-secondary rounded-lg border border-border-subtle p-4">
        {/* Client ID 設定 */}
        <div className="space-y-2">
          <label
            htmlFor="driveClientId"
            className="block text-small font-medium text-text-primary"
          >
            OAuth Client ID
          </label>
          <input
            id="driveClientId"
            type="text"
            value={clientIdDraft}
            onChange={(e) => setClientIdDraft(e.target.value)}
            placeholder="000000000000-xxxxx.apps.googleusercontent.com"
            className="w-full px-3 py-2 bg-bg-primary border border-border-subtle rounded-lg text-small text-text-primary placeholder-text-muted focus:outline-none focus:border-border-default transition-colors duration-normal"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSaveClientId}
              disabled={clientIdDraft.trim() === prefs.clientId}
              className="flex-1 px-3 py-2 bg-bg-primary border border-border-subtle rounded-lg text-small font-medium text-text-primary transition-colors duration-normal hover:border-border-default disabled:opacity-50 disabled:cursor-not-allowed"
            >
              儲存 Client ID
            </button>
            {clientIdSaved && (
              <span className="self-center text-caption text-success">
                ✓ 已儲存
              </span>
            )}
          </div>
          <button
            onClick={() => setShowTutorial((v) => !v)}
            className="text-caption text-accent hover:opacity-80 transition-opacity"
          >
            {showTutorial ? '▾' : '▸'} 如何取得 Client ID
          </button>
        </div>

        {/* 教學 */}
        {showTutorial && (
          <div className="space-y-3 p-3 bg-bg-primary rounded border border-border-subtle">
            <p className="text-caption text-text-secondary leading-relaxed">
              依下列步驟在 Google Cloud Console 建立 OAuth 2.0 Client ID：
            </p>
            <ol className="list-decimal list-inside space-y-2 text-caption text-text-secondary leading-relaxed">
              <li>
                前往{' '}
                <a
                  href="https://console.cloud.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent underline hover:opacity-80"
                >
                  Google Cloud Console
                </a>
                ，登入並建立一個新專案（或選既有專案）。
              </li>
              <li>
                啟用 <span className="font-medium">Google Drive API</span>：左側選單「API 與服務 → 程式庫」，搜尋並啟用。
              </li>
              <li>
                設定 OAuth 同意畫面：「API 與服務 → OAuth 同意畫面」，選擇「外部」，填入必要資訊即可。
              </li>
              <li>
                建立憑證：「API 與服務 → 憑證 → 建立憑證 → OAuth 用戶端 ID」，應用程式類型選「網頁應用程式」。
              </li>
              <li>
                「已授權的重新導向 URI」加入以下 URI：
                <div className="mt-1 p-2 bg-bg-secondary rounded border border-border-subtle flex items-center gap-2">
                  <code className="flex-1 text-caption text-text-primary break-all">
                    {redirectUri}
                  </code>
                  <button
                    onClick={handleCopyRedirect}
                    className="px-2 py-1 bg-bg-primary border border-border-subtle rounded text-caption text-text-secondary hover:border-border-default transition-colors"
                  >
                    {copiedRedirect ? '已複製' : '複製'}
                  </button>
                </div>
              </li>
              <li>
                建立後複製「用戶端 ID」貼到上方欄位。
              </li>
            </ol>
            <div className="mt-2 p-2 bg-bg-secondary rounded border border-border-subtle">
              <p className="text-caption text-text-muted italic">
                [截圖位置：Google Cloud Console 憑證建立畫面]
              </p>
            </div>
          </div>
        )}

        {/* 連結狀態 */}
        {!isConnected ? (
          <div className="space-y-2 pt-2 border-t border-border-subtle">
            <button
              onClick={handleConnect}
              disabled={!prefs.clientId.trim()}
              className="w-full px-3 py-2 bg-accent rounded-lg text-small font-medium text-bg-primary transition-colors duration-normal hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              連結 Google Drive
            </button>
            {!prefs.clientId.trim() && (
              <p className="text-caption text-text-muted">
                請先儲存 Client ID 再連結
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3 pt-2 border-t border-border-subtle">
            {/* 帳號資訊 */}
            <div className="space-y-1">
              <p className="text-caption text-text-muted">已連結帳號</p>
              <p className="text-small text-text-primary break-all">
                {prefs.userEmail ?? '（無法取得 email）'}
              </p>
            </div>

            {/* 上次備份時間 */}
            <div className="space-y-1">
              <p className="text-caption text-text-muted">上次備份</p>
              <p className="text-small text-text-primary">
                {formatDateTime(prefs.lastBackupAt)}
              </p>
              {prefs.lastBackupError && (
                <p className="text-caption text-danger break-words">
                  上次備份失敗：{prefs.lastBackupError}
                </p>
              )}
            </div>

            {/* 立即備份 */}
            <button
              onClick={handleBackupNow}
              disabled={backingUp}
              className="w-full px-3 py-2 bg-accent rounded-lg text-small font-medium text-bg-primary transition-colors duration-normal hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {backingUp ? '備份中…' : '立即備份'}
            </button>

            {/* 自動備份頻率 */}
            <div className="space-y-2">
              <label className="block text-small font-medium text-text-primary">
                自動備份頻率
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['off', 'daily', 'weekly'] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleFrequencyChange(opt)}
                    className={`px-2 py-1 rounded border text-caption font-medium transition-colors duration-normal ${
                      prefs.frequency === opt
                        ? 'bg-accent text-bg-primary border-accent'
                        : 'bg-bg-primary text-text-primary border-border-subtle hover:border-border-default'
                    }`}
                  >
                    {opt === 'off' ? '關閉' : opt === 'daily' ? '每天' : '每週'}
                  </button>
                ))}
              </div>
            </div>

            {/* 保留份數 */}
            <div className="space-y-2">
              <label
                htmlFor="keepLast"
                className="block text-small font-medium text-text-primary"
              >
                保留最近份數
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="keepLast"
                  type="number"
                  min={1}
                  max={100}
                  value={prefs.keepLast}
                  onChange={(e) =>
                    handleKeepLastChange(Number(e.target.value))
                  }
                  className="w-20 px-2 py-1 bg-bg-primary border border-border-subtle rounded text-small text-text-primary focus:outline-none focus:border-border-default"
                />
                <span className="text-caption text-text-muted">
                  份（超過將自動刪除最舊的）
                </span>
              </div>
            </div>

            {/* 備份列表與還原 */}
            <div className="space-y-2 pt-2 border-t border-border-subtle">
              <div className="flex items-center justify-between">
                <label className="text-small font-medium text-text-primary">
                  備份列表
                </label>
                <button
                  onClick={handleLoadBackups}
                  disabled={loadingBackups}
                  className="text-caption text-accent hover:opacity-80 transition-opacity disabled:opacity-50"
                >
                  {loadingBackups
                    ? '讀取中…'
                    : backups === null
                      ? '載入'
                      : '重新整理'}
                </button>
              </div>

              {backups !== null && backups.length === 0 && (
                <p className="text-caption text-text-muted">尚無備份</p>
              )}

              {backups !== null && backups.length > 0 && (
                <ul className="space-y-1 max-h-64 overflow-y-auto">
                  {backups.map((file) => (
                    <li
                      key={file.id}
                      className="flex items-center justify-between gap-2 p-2 bg-bg-primary rounded border border-border-subtle"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-caption text-text-primary truncate">
                          {file.name}
                        </p>
                        <p className="text-caption text-text-muted">
                          {formatDateTime(file.createdTime)}
                        </p>
                      </div>
                      <button
                        onClick={() => setConfirmRestore(file)}
                        disabled={restoringId !== null}
                        className="shrink-0 px-2 py-1 bg-bg-secondary border border-border-subtle rounded text-caption font-medium text-text-primary hover:border-border-default transition-colors duration-normal disabled:opacity-50"
                      >
                        {restoringId === file.id ? '還原中…' : '還原'}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* 解除連結 */}
            <div className="pt-2 border-t border-border-subtle">
              <button
                onClick={() => setConfirmRevoke(true)}
                className="w-full px-3 py-2 bg-bg-primary border border-border-subtle rounded-lg text-small text-text-secondary transition-colors duration-normal hover:border-border-default"
              >
                解除連結
              </button>
            </div>
          </div>
        )}

        {actionError && (
          <p className="text-small text-danger break-words">{actionError}</p>
        )}
      </div>

      {/* Confirm Modals */}
      {confirmRevoke && (
        <ConfirmModal
          title="解除 Google Drive 連結"
          message="將撤銷此 app 的存取權，並清除本機儲存的 token。已上傳至 Drive 的備份檔不會被刪除。"
          confirmText="解除連結"
          onConfirm={handleRevokeConfirm}
          onCancel={() => setConfirmRevoke(false)}
        />
      )}

      {confirmRestore && (
        <ConfirmModal
          title="還原備份"
          message={`將以「${confirmRestore.name}」取代所有現有夢境記錄，此操作無法復原。`}
          confirmText="還原並取代"
          confirmValue="還原"
          currentValue={restoreConfirmInput}
          onValueChange={setRestoreConfirmInput}
          onConfirm={handleRestoreConfirm}
          onCancel={() => {
            setConfirmRestore(null)
            setRestoreConfirmInput('')
          }}
        />
      )}
    </section>
  )
}
