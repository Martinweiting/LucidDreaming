import Dexie, { type Table } from 'dexie';
import type { Dream } from '../types/dream';

export class LucidDreamDatabase extends Dexie {
  dreams!: Table<Dream>;

  constructor() {
    super('LucidDreamDB');
    this.version(1).stores({
      dreams:
        '++id, dreamDate, createdAt, lucidity, *tags',
    });
  }
}

export const db = new LucidDreamDatabase();
