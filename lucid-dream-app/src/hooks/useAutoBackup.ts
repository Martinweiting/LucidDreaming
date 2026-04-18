/**
 * 自動備份 hook：App 載入時處理 OAuth callback，並視頻率設定背景觸發備份。
 * 失敗時將錯誤寫入 preferences，不阻塞使用者。
 */

import { useEffect } from 'react'
import { driveBackup } from '../services/driveBackup'
import { drivePreferences } from '../services/drivePreferences'

const AUTO_BACKUP_DELAY_MS = 3000

export function useAutoBackup(): void {
  useEffect(() => {
    let cancelled = false

    const run = async (): Promise<void> => {
      try {
        await driveBackup.handleOAuthCallback()
      } catch (error) {
        const message = error instanceof Error ? error.message : '授權處理失敗'
        drivePreferences.update({ lastBackupError: message })
      }

      if (cancelled) return

      if (!driveBackup.shouldAutoBackup()) return

      try {
        await driveBackup.backupNow()
      } catch (error) {
        const message = error instanceof Error ? error.message : '自動備份失敗'
        drivePreferences.update({ lastBackupError: message })
      }
    }

    const timer = window.setTimeout(() => {
      void run()
    }, AUTO_BACKUP_DELAY_MS)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [])
}
