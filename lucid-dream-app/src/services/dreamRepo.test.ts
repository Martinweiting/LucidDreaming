import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import 'fake-indexeddb/auto';
import { dreamRepo } from './dreamRepo';
import { db } from '../db';
import type { DreamDraft } from '../types/dream';

describe('DreamRepo (RED - Tests)', () => {
  beforeEach(async () => {
    // 清空數據庫
    await db.dreams.clear();
  });

  afterEach(async () => {
    await db.dreams.clear();
  });

  describe('create()', () => {
    it('should create a dream with auto-generated id and timestamps', async () => {
      const draft: DreamDraft = {
        dreamDate: '2026-04-18',
        content: '我在飛行',
        tags: ['飛行'],
        mood: 1,
        vividness: 4,
        lucidity: 2,
        isNightmare: false,
        isRecurring: false,
        userNotes: '很清晰',
      };

      const dream = await dreamRepo.create(draft);

      expect(dream.id).toBeDefined();
      expect(dream.dreamDate).toBe('2026-04-18');
      expect(dream.content).toBe('我在飛行');
      expect(dream.tags).toEqual(['飛行']);
      expect(dream.mood).toBe(1);
      expect(dream.createdAt).toBeDefined();
      expect(dream.updatedAt).toBeDefined();
      expect(dream.schemaVersion).toBe(1);
      // 驗證時間格式為 ISO 8601
      expect(() => new Date(dream.createdAt)).not.toThrow();
    });

    it('should handle optional fields with null defaults', async () => {
      const draft: DreamDraft = {
        dreamDate: '2026-04-18',
        content: '簡單的夢',
      };

      const dream = await dreamRepo.create(draft);

      expect(dream.tags).toEqual([]);
      expect(dream.mood).toBeNull();
      expect(dream.vividness).toBeNull();
      expect(dream.lucidity).toBeNull();
      expect(dream.isNightmare).toBe(false);
      expect(dream.isRecurring).toBe(false);
      expect(dream.lucidNotes).toBeNull();
      expect(dream.ai).toBeNull();
      expect(dream.userNotes).toBe('');
    });

    it('should persist dream to database', async () => {
      const draft: DreamDraft = {
        dreamDate: '2026-04-18',
        content: '持久化測試',
      };

      const created = await dreamRepo.create(draft);
      const retrieved = await dreamRepo.get(created.id);

      expect(retrieved).toEqual(created);
    });
  });

  describe('get()', () => {
    it('should return undefined for non-existent id', async () => {
      const result = await dreamRepo.get('non-existent-id');
      expect(result).toBeUndefined();
    });

    it('should retrieve a dream by id', async () => {
      const draft: DreamDraft = {
        dreamDate: '2026-04-18',
        content: '測試',
      };

      const created = await dreamRepo.create(draft);
      const retrieved = await dreamRepo.get(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.content).toBe('測試');
    });
  });

  describe('update()', () => {
    it('should update dream fields', async () => {
      const draft: DreamDraft = {
        dreamDate: '2026-04-18',
        content: '原始內容',
        mood: 0,
      };

      const created = await dreamRepo.create(draft);
      // 添加延迟確保時間戳不同
      await new Promise((resolve) => setTimeout(resolve, 10));
      await dreamRepo.update(created.id, {
        content: '更新的內容',
        mood: 2,
      });

      const updated = await dreamRepo.get(created.id);

      expect(updated?.content).toBe('更新的內容');
      expect(updated?.mood).toBe(2);
      expect(updated?.updatedAt).not.toBe(created.updatedAt);
    });

    it('should not throw when updating non-existent dream', async () => {
      await expect(
        dreamRepo.update('non-existent', { content: 'test' })
      ).resolves.not.toThrow();
    });
  });

  describe('delete()', () => {
    it('should delete a dream', async () => {
      const draft: DreamDraft = {
        dreamDate: '2026-04-18',
        content: '待刪除',
      };

      const created = await dreamRepo.create(draft);
      await dreamRepo.delete(created.id);

      const retrieved = await dreamRepo.get(created.id);
      expect(retrieved).toBeUndefined();
    });

    it('should not throw when deleting non-existent dream', async () => {
      await expect(dreamRepo.delete('non-existent')).resolves.not.toThrow();
    });
  });

  describe('listAll()', () => {
    it('should return empty array when no dreams exist', async () => {
      const dreams = await dreamRepo.listAll();
      expect(dreams).toEqual([]);
    });

    it('should return all dreams sorted by dreamDate descending', async () => {
      await dreamRepo.create({ dreamDate: '2026-04-16', content: '夢1' });
      await dreamRepo.create({ dreamDate: '2026-04-18', content: '夢3' });
      await dreamRepo.create({ dreamDate: '2026-04-17', content: '夢2' });

      const dreams = await dreamRepo.listAll();

      expect(dreams).toHaveLength(3);
      expect(dreams[0]?.dreamDate).toBe('2026-04-18');
      expect(dreams[1]?.dreamDate).toBe('2026-04-17');
      expect(dreams[2]?.dreamDate).toBe('2026-04-16');
    });
  });

  describe('listByDateRange()', () => {
    it('should return dreams within date range', async () => {
      await dreamRepo.create({ dreamDate: '2026-04-16', content: '夢1' });
      await dreamRepo.create({ dreamDate: '2026-04-18', content: '夢3' });
      await dreamRepo.create({ dreamDate: '2026-04-17', content: '夢2' });

      const dreams = await dreamRepo.listByDateRange('2026-04-17', '2026-04-18');

      expect(dreams).toHaveLength(2);
      expect(dreams.map((d) => d.dreamDate)).toContain('2026-04-17');
      expect(dreams.map((d) => d.dreamDate)).toContain('2026-04-18');
    });

    it('should return empty array for date range with no dreams', async () => {
      await dreamRepo.create({ dreamDate: '2026-04-16', content: '夢1' });

      const dreams = await dreamRepo.listByDateRange('2026-04-20', '2026-04-21');

      expect(dreams).toEqual([]);
    });
  });

  describe('listByTag()', () => {
    it('should return dreams with specific tag', async () => {
      await dreamRepo.create({ dreamDate: '2026-04-18', content: '夢1', tags: ['飛行', '清明'] });
      await dreamRepo.create({ dreamDate: '2026-04-17', content: '夢2', tags: ['飛行'] });
      await dreamRepo.create({ dreamDate: '2026-04-16', content: '夢3', tags: ['惡夢'] });

      const dreams = await dreamRepo.listByTag('飛行');

      expect(dreams).toHaveLength(2);
      expect(dreams.every((d) => d.tags.includes('飛行'))).toBe(true);
    });

    it('should return empty array for tag with no dreams', async () => {
      await dreamRepo.create({ dreamDate: '2026-04-18', content: '夢1', tags: ['飛行'] });

      const dreams = await dreamRepo.listByTag('不存在');

      expect(dreams).toEqual([]);
    });
  });

  describe('listIncomplete()', () => {
    it('should return dreams missing ai or mood analysis', async () => {
      // 完整的夢
      const complete = await dreamRepo.create({
        dreamDate: '2026-04-18',
        content: '完整',
        mood: 1,
      });
      await dreamRepo.update(complete.id, {
        ai: {
          summary: '摘要',
          extractedTags: ['tag'],
          model: 'gpt-4',
          analyzedAt: new Date().toISOString(),
        },
      });

      // 缺 mood
      const incomplete1 = await dreamRepo.create({
        dreamDate: '2026-04-17',
        content: '缺mood',
        mood: null,
      });

      // 缺 ai
      const incomplete2 = await dreamRepo.create({
        dreamDate: '2026-04-16',
        content: '缺ai',
        mood: 1,
      });

      const incompletes = await dreamRepo.listIncomplete();

      expect(incompletes).toHaveLength(2);
      expect(incompletes.map((d) => d.id)).toContain(incomplete1.id);
      expect(incompletes.map((d) => d.id)).toContain(incomplete2.id);
    });

    it('should return empty array when all dreams are complete', async () => {
      const complete = await dreamRepo.create({
        dreamDate: '2026-04-18',
        content: '完整',
        mood: 1,
      });
      await dreamRepo.update(complete.id, {
        ai: {
          summary: '摘要',
          extractedTags: ['tag'],
          model: 'gpt-4',
          analyzedAt: new Date().toISOString(),
        },
      });

      const incompletes = await dreamRepo.listIncomplete();

      expect(incompletes).toEqual([]);
    });
  });

  describe('searchFullText()', () => {
    it('should search in content by substring', async () => {
      await dreamRepo.create({ dreamDate: '2026-04-18', content: '我在飛行中' });
      await dreamRepo.create({ dreamDate: '2026-04-17', content: '我在游泳' });
      await dreamRepo.create({ dreamDate: '2026-04-16', content: '飛行員' });

      const results = await dreamRepo.searchFullText('飛行');

      expect(results).toHaveLength(2);
      expect(results.every((d) => d.content.includes('飛行'))).toBe(true);
    });

    it('should be case-insensitive', async () => {
      await dreamRepo.create({ dreamDate: '2026-04-18', content: 'Flying' });
      await dreamRepo.create({ dreamDate: '2026-04-17', content: 'flying' });

      const results = await dreamRepo.searchFullText('FLYING');

      expect(results).toHaveLength(2);
    });

    it('should return empty array when no match found', async () => {
      await dreamRepo.create({ dreamDate: '2026-04-18', content: '無關內容' });

      const results = await dreamRepo.searchFullText('不存在');

      expect(results).toEqual([]);
    });
  });
});
