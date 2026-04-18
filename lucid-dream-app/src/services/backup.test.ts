/**
 * 備份服務測試
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { backupService } from './backup'

describe('backupService', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('markExported', () => {
    it('should set last export time', () => {
      backupService.markExported()
      const lastExport = backupService.getLastExportTime()
      expect(lastExport).not.toBeNull()
      expect(lastExport).toBeInstanceOf(Date)
    })
  })

  describe('getDaysSinceLastExport', () => {
    it('should return null if never exported', () => {
      const days = backupService.getDaysSinceLastExport()
      expect(days).toBeNull()
    })

    it('should return 0 for just exported', () => {
      backupService.markExported()
      const days = backupService.getDaysSinceLastExport()
      expect(days).toBe(0)
    })

    it('should return correct days', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 5)
      localStorage.setItem('lucid_dream_last_export', pastDate.toISOString())

      const days = backupService.getDaysSinceLastExport()
      expect(days).toBe(5)
    })
  })

  describe('validateBackup', () => {
    it('should reject invalid format', () => {
      const result = backupService.validateBackup(null)
      expect(result.valid).toBe(false)
    })

    it('should reject missing appVersion', () => {
      const result = backupService.validateBackup({
        schemaVersion: 1,
        exportedAt: '2024-01-01T00:00:00Z',
        dreams: [],
      })
      expect(result.valid).toBe(false)
    })

    it('should reject missing schemaVersion', () => {
      const result = backupService.validateBackup({
        appVersion: '1.0.0',
        exportedAt: '2024-01-01T00:00:00Z',
        dreams: [],
      })
      expect(result.valid).toBe(false)
    })

    it('should reject invalid dreams array', () => {
      const result = backupService.validateBackup({
        appVersion: '1.0.0',
        schemaVersion: 1,
        exportedAt: '2024-01-01T00:00:00Z',
        dreams: 'not an array',
      })
      expect(result.valid).toBe(false)
    })

    it('should accept valid backup', () => {
      const result = backupService.validateBackup({
        appVersion: '1.0.0',
        schemaVersion: 1,
        exportedAt: '2024-01-01T00:00:00Z',
        dreams: [],
      })
      expect(result.valid).toBe(true)
    })
  })
})
