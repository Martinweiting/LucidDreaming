/**
 * drivePreferences 服務測試
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { drivePreferences } from './drivePreferences'

describe('drivePreferences', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('get', () => {
    it('returns defaults when nothing stored', () => {
      const prefs = drivePreferences.get()
      expect(prefs.clientId).toBe('')
      expect(prefs.accessToken).toBeNull()
      expect(prefs.tokenExpiresAt).toBeNull()
      expect(prefs.userEmail).toBeNull()
      expect(prefs.frequency).toBe('off')
      expect(prefs.keepLast).toBe(10)
      expect(prefs.lastBackupAt).toBeNull()
      expect(prefs.lastBackupError).toBeNull()
    })

    it('falls back to defaults when localStorage has corrupt JSON', () => {
      localStorage.setItem('lucid_dream_drive_prefs', '{not-json')
      const prefs = drivePreferences.get()
      expect(prefs.frequency).toBe('off')
      expect(prefs.keepLast).toBe(10)
    })

    it('sanitizes invalid frequency values', () => {
      localStorage.setItem(
        'lucid_dream_drive_prefs',
        JSON.stringify({ frequency: 'hourly' })
      )
      expect(drivePreferences.get().frequency).toBe('off')
    })

    it('clamps keepLast to a sane value', () => {
      localStorage.setItem(
        'lucid_dream_drive_prefs',
        JSON.stringify({ keepLast: -5 })
      )
      expect(drivePreferences.get().keepLast).toBe(10)
    })
  })

  describe('update', () => {
    it('merges partial updates with existing values', () => {
      drivePreferences.update({ clientId: 'abc', frequency: 'daily' })
      drivePreferences.update({ keepLast: 5 })
      const prefs = drivePreferences.get()
      expect(prefs.clientId).toBe('abc')
      expect(prefs.frequency).toBe('daily')
      expect(prefs.keepLast).toBe(5)
    })

    it('returns the updated preferences', () => {
      const result = drivePreferences.update({ frequency: 'weekly' })
      expect(result.frequency).toBe('weekly')
    })
  })

  describe('clearAuth', () => {
    it('clears token fields but retains other settings', () => {
      drivePreferences.update({
        clientId: 'abc',
        accessToken: 'token',
        tokenExpiresAt: Date.now() + 1000,
        userEmail: 'a@b.com',
        frequency: 'daily',
        keepLast: 5,
      })
      drivePreferences.clearAuth()
      const prefs = drivePreferences.get()
      expect(prefs.accessToken).toBeNull()
      expect(prefs.tokenExpiresAt).toBeNull()
      expect(prefs.userEmail).toBeNull()
      expect(prefs.clientId).toBe('abc')
      expect(prefs.frequency).toBe('daily')
      expect(prefs.keepLast).toBe(5)
    })
  })

  describe('reset', () => {
    it('removes all stored preferences', () => {
      drivePreferences.update({ clientId: 'abc' })
      drivePreferences.reset()
      expect(localStorage.getItem('lucid_dream_drive_prefs')).toBeNull()
    })
  })
})
