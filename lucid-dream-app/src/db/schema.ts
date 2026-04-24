import Dexie, { type Table } from 'dexie';
import type { Dream } from '../types/dream';
import type { IncubationIntent } from '../types/incubation';

export class LucidDreamDatabase extends Dexie {
  dreams!: Table<Dream>;
  incubations!: Table<IncubationIntent>;

  constructor() {
    super('LucidDreamDB');
    this.version(1).stores({
      dreams: '++id, dreamDate, createdAt, lucidity, *tags',
    });
    this.version(2).stores({
      dreams: '++id, dreamDate, createdAt, lucidity, *tags',
      incubations: '++id, date, reviewed, createdAt',
    });
  }
}

export const db = new LucidDreamDatabase();
