import { Dream } from '../types/dream';

export function calculateJaccardSimilarity(tags1: string[], tags2: string[]): number {
  if (tags1.length === 0 && tags2.length === 0) return 1;
  if (tags1.length === 0 || tags2.length === 0) return 0;

  const set1 = new Set(tags1.map(t => t.toLowerCase()));
  const set2 = new Set(tags2.map(t => t.toLowerCase()));

  const intersection = [...set1].filter(t => set2.has(t)).length;
  const union = new Set([...set1, ...set2]).size;

  return union > 0 ? intersection / union : 0;
}

export function findSimilarDreams(
  targetDream: Dream,
  allDreams: Dream[],
  topN: number = 3,
  minSimilarity: number = 0.2
): { dream: Dream; similarity: number }[] {
  return allDreams
    .filter(
      (dream) =>
        dream.id !== targetDream.id &&
        calculateJaccardSimilarity(targetDream.tags, dream.tags) >= minSimilarity
    )
    .map((dream) => ({
      dream,
      similarity: calculateJaccardSimilarity(targetDream.tags, dream.tags),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topN);
}
