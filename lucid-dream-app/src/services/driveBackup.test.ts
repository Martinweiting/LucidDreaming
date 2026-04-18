/**
 * driveBackup 純邏輯測試（檔名格式、授權狀態、自動備份頻率判斷）。
 * 不測試實際的 Drive API 呼叫或 OAuth 重導。
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { driveBackup, formatBackupFilename } from './driveBackup'
import { drivePreferences } from './drivePreferences'

describe('formatBackupFilename', () => {
  it('formats as lucid-dream-backup-YYYY-MM-DD-HHmm.json', () => {
    const d = new Date(2026, 3, 18, 9, 7) // 2026-04-18 09:07 local
    expect(formatBackupFilename(d)).toBe(
      'lucid-dream-backup-2026-04-18-0907.json'
    )
  })

  it('pads single-digit months, days, hours, minutes', () => {
    const d = new Date(2026, 0, 1, 0, 0)
    expect(formatBackupFilename(d)).toBe(
      'lucid-dream-backup-2026-01-01-0000.json'
    )
  })
})

describe('driveBackup.isAuthorized', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns false when no token', () => {
    expect(driveBackup.isAuthorized()).toBe(false)
  })

  it('returns true when token valid and not expired', () => {
    drivePreferences.update({
      accessToken: 'token',
      tokenExpiresAt: Date.now() + 60_000,
    })
    expect(driveBackup.isAuthorized()).toBe(true)
  })

  it('returns false when token expired', () => {
    drivePreferences.update({
      accessToken: 'token',
      tokenExpiresAt: Date.now() - 1000,
    })
    expect(driveBackup.isAuthorized()).toBe(false)
  })
})

describe('driveBackup.shouldAutoBackup', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns false when frequency is off', () => {
    drivePreferences.update({
      accessToken: 'token',
      tokenExpiresAt: Date.now() + 60_000,
      frequency: 'off',
    })
    expect(driveBackup.shouldAutoBackup()).toBe(false)
  })

  it('returns false when not authorized', () => {
    drivePreferences.update({ frequency: 'daily' })
    expect(driveBackup.shouldAutoBackup()).toBe(false)
  })

  it('returns true when no previous backup exists and frequency is set', () => {
    drivePreferences.update({
      accessToken: 'token',
      tokenExpiresAt: Date.now() + 60_000,
      frequency: 'daily',
    })
    expect(driveBackup.shouldAutoBackup()).toBe(true)
  })

  it('returns false when daily threshold not reached', () => {
    const now = new Date('2026-04-18T12:00:00Z')
    const twelveHoursAgo = new Date(now.getTime() - 12 * 3600 * 1000)
    drivePreferences.update({
      accessToken: 'token',
      tokenExpiresAt: now.getTime() + 60_000,
      frequency: 'daily',
      lastBackupAt: twelveHoursAgo.toISOString(),
    })
    expect(driveBackup.shouldAutoBackup(now)).toBe(false)
  })

  it('returns true when daily threshold exceeded', () => {
    const now = new Date('2026-04-18T12:00:00Z')
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 3600 * 1000)
    drivePreferences.update({
      accessToken: 'token',
      tokenExpiresAt: now.getTime() + 60_000,
      frequency: 'daily',
      lastBackupAt: twoDaysAgo.toISOString(),
    })
    expect(driveBackup.shouldAutoBackup(now)).toBe(true)
  })

  it('uses 7-day threshold for weekly frequency', () => {
    const now = new Date('2026-04-18T12:00:00Z')
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 3600 * 1000)
    const eightDaysAgo = new Date(now.getTime() - 8 * 24 * 3600 * 1000)

    drivePreferences.update({
      accessToken: 'token',
      tokenExpiresAt: now.getTime() + 60_000,
      frequency: 'weekly',
      lastBackupAt: fiveDaysAgo.toISOString(),
    })
    expect(driveBackup.shouldAutoBackup(now)).toBe(false)

    drivePreferences.update({ lastBackupAt: eightDaysAgo.toISOString() })
    expect(driveBackup.shouldAutoBackup(now)).toBe(true)
  })

  it('returns true when lastBackupAt is corrupt', () => {
    drivePreferences.update({
      accessToken: 'token',
      tokenExpiresAt: Date.now() + 60_000,
      frequency: 'daily',
      lastBackupAt: 'not-a-date',
    })
    expect(driveBackup.shouldAutoBackup()).toBe(true)
  })
})
