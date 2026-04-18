import { db } from './schema';
import { SCHEMA_VERSION } from '../types/dream';

/**
 * 執行所有需要的 migration
 * 在應用啟動時呼叫一次
 */
export async function runMigrations(): Promise<void> {
  // 版本 1：初始 schema，無需升版邏輯
  // 未來有 schema 改動時，在這裡添加升版函數
}

/**
 * 確保現有紀錄的 schemaVersion 符合目前版本
 * 用於相容舊資料
 */
export async function ensureSchemaVersion(): Promise<void> {
  const dreams = await db.dreams.toArray();
  const needsUpdate = dreams.filter((d) => d.schemaVersion !== SCHEMA_VERSION);

  if (needsUpdate.length > 0) {
    await db.dreams.bulkUpdate(
      needsUpdate.map((d) => ({
        key: d.id,
        changes: { schemaVersion: SCHEMA_VERSION, updatedAt: new Date().toISOString() },
      }))
    );
  }
}
