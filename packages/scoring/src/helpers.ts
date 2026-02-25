/**
 * Jaccard similarity index between two sets.
 * Returns 0..1
 */
export function jaccardSimilarity(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 1;
  const setA = new Set(a);
  const setB = new Set(b);
  const intersection = [...setA].filter((x) => setB.has(x)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Set overlap count (absolute, not normalized).
 */
export function setOverlap(a: string[], b: string[]): number {
  const setB = new Set(b);
  return a.filter((x) => setB.has(x)).length;
}

/**
 * Normalize a value from [min, max] range to [0, 1].
 */
export function normalize(value: number, min: number, max: number): number {
  if (max === min) return 1;
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

/**
 * Clamp value between 0 and 100.
 */
export function clamp100(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

/**
 * Age difference score: full score if diff <= 2, diminishing returns beyond.
 */
export function ageCompatibilityScore(ageA: number, ageB: number): number {
  const diff = Math.abs(ageA - ageB);
  if (diff <= 2) return 1;
  if (diff <= 5) return 0.8;
  if (diff <= 10) return 0.5;
  return 0.2;
}
