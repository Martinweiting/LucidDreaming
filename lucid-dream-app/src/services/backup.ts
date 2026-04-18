/**
 * 備份與復原服務。
 * 處理夢境資料的匯出、匯入與驗證。
 */

import { dreamRepo } from './dreamRepo'
import { db } from '../db'
import { SCHEMA_VERSION, type Dream } from '../types/dream'

const LAST_EXPORT_KEY = 'lucid_dream_last_export'

interface BackupData {
  appVersion: string
  schemaVersion: number
  exportedAt: string
  dreams: Dream[]
}

interface ImportResult {
  added: number
  skipped: number
  errors?: string[]
}

interface ValidationResult {
  valid: boolean
  error?: string
}

export const backupService = {
  async exportAllToJson(): Promise<Blob> {
    const dreams = await dreamRepo.listAll()
    const backup: BackupData = {
      appVersion: '1.0.0',
      schemaVersion: SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      dreams,
    }

    const json = JSON.stringify(backup, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    return blob
  },

  async importFromJson(
    file: File,
    mode: 'replace' | 'merge'
  ): Promise<ImportResult> {
    try {
      const text = await file.text()
      const data = JSON.parse(text) as BackupData

      const validation = backupService.validateBackup(data)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      if (data.schemaVersion > SCHEMA_VERSION) {
        throw new Error(
          `備份檔來自更新版本（v${data.schemaVersion}），可能不相容。請升級應用程式。`
        )
      }

      if (mode === 'replace') {
        // 清除所有現有資料
        const existingDreams = await dreamRepo.listAll()
        for (const dream of existingDreams) {
          await dreamRepo.delete(dream.id)
        }
      }

      // 匯入資料
      let added = 0
      let skipped = 0

      for (const dreamData of data.dreams) {
        if (mode === 'merge') {
          // 檢查是否已存在
          const existing = await dreamRepo.get(dreamData.id)
          if (existing) {
            skipped++
            continue
          }
        }

        try {
          await db.dreams.add(dreamData as unknown as Parameters<typeof db.dreams.add>[0])
          added++
        } catch (error) {
          skipped++
        }
      }

      backupService.markExported()
      return { added, skipped }
    } catch (error) {
      const message = error instanceof Error ? error.message : '未知錯誤'
      throw new Error(`匯入失敗：${message}`)
    }
  },

  validateBackup(data: unknown): ValidationResult {
    if (!data || typeof data !== 'object') {
      return { valid: false, error: '無效的備份檔案格式' }
    }

    const backup = data as Partial<BackupData>

    if (!backup.appVersion) {
      return { valid: false, error: '備份檔案缺少應用版本' }
    }

    if (backup.schemaVersion === undefined) {
      return { valid: false, error: '備份檔案缺少 schema 版本' }
    }

    if (!backup.exportedAt) {
      return { valid: false, error: '備份檔案缺少匯出時間' }
    }

    if (!Array.isArray(backup.dreams)) {
      return { valid: false, error: '備份檔案的夢境資料無效' }
    }

    return { valid: true }
  },

  getLastExportTime(): Date | null {
    const timestamp = localStorage.getItem(LAST_EXPORT_KEY)
    if (!timestamp) return null
    return new Date(timestamp)
  },

  markExported(): void {
    localStorage.setItem(LAST_EXPORT_KEY, new Date().toISOString())
  },

  getDaysSinceLastExport(): number | null {
    const lastExport = backupService.getLastExportTime()
    if (!lastExport) return null

    const now = new Date()
    const diff = now.getTime() - lastExport.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    return days
  },

  async clearAllDreams(): Promise<void> {
    const dreams = await dreamRepo.listAll()
    for (const dream of dreams) {
      await dreamRepo.delete(dream.id)
    }
  },
}
