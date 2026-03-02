/**
 * ExerciseIndex — in-memory inverted index for fast multi-criteria queries.
 * Extended with category index for tallinn's exercise schema.
 */

import type { Exercise, Criteria, Vocabulary } from "../types.ts";

export class ExerciseIndex {
  private exercises: Map<string, Exercise>;
  private byMuscle = new Map<string, Set<string>>();
  private byEquipment = new Map<string, Set<string>>();
  private byType = new Map<string, Set<string>>();
  private byTag = new Map<string, Set<string>>();
  private byDifficulty = new Map<string, Set<string>>();
  private byCategory = new Map<string, Set<string>>();

  constructor(exercises: Map<string, Exercise>) {
    this.exercises = exercises;
    for (const [id, ex] of exercises) {
      for (const m of ex.muscles) this.addToIndex(this.byMuscle, m, id);
      for (const e of ex.equipment) this.addToIndex(this.byEquipment, e, id);
      this.addToIndex(this.byType, ex.type, id);
      for (const t of ex.tags) this.addToIndex(this.byTag, t, id);
      if (ex.difficulty) this.addToIndex(this.byDifficulty, ex.difficulty, id);
      if (ex.category) this.addToIndex(this.byCategory, ex.category, id);
    }
  }

  private addToIndex(index: Map<string, Set<string>>, key: string, id: string) {
    let set = index.get(key);
    if (!set) {
      set = new Set();
      index.set(key, set);
    }
    set.add(id);
  }

  get(id: string): Exercise | undefined {
    return this.exercises.get(id);
  }

  get size(): number {
    return this.exercises.size;
  }

  all(): Exercise[] {
    return Array.from(this.exercises.values());
  }

  /** Fast multi-criteria query. OR within fields, AND between fields. */
  query(criteria: Criteria): Exercise[] {
    if (criteria.exerciseId) {
      const ex = this.exercises.get(criteria.exerciseId);
      return ex ? [ex] : [];
    }

    let candidateIds: Set<string> | null = null;

    if (criteria.types?.length) {
      candidateIds = this.unionSets(this.byType, criteria.types, candidateIds);
    }
    if (criteria.categories?.length) {
      candidateIds = this.unionSets(this.byCategory, criteria.categories, candidateIds);
    }
    if (criteria.muscles?.length) {
      candidateIds = this.unionSets(this.byMuscle, criteria.muscles, candidateIds);
    }
    if (criteria.equipment?.length) {
      candidateIds = this.unionSets(this.byEquipment, criteria.equipment, candidateIds);
    }
    if (criteria.tags?.length) {
      candidateIds = this.unionSets(this.byTag, criteria.tags, candidateIds);
    }
    if (criteria.difficulty) {
      const diffSet = this.byDifficulty.get(criteria.difficulty) ?? new Set();
      candidateIds = candidateIds ? this.intersect(candidateIds, diffSet) : new Set(diffSet);
    }

    if (candidateIds === null) {
      candidateIds = new Set(this.exercises.keys());
    }

    // Apply exclusions
    const results: Exercise[] = [];
    for (const id of candidateIds) {
      const ex = this.exercises.get(id)!;
      if (criteria.excludeTags?.some(t => ex.tags.includes(t))) continue;
      if (criteria.excludeEquipment?.some(e => ex.equipment.includes(e))) continue;
      results.push(ex);
    }

    return results;
  }

  private unionSets(
    index: Map<string, Set<string>>,
    values: string[],
    current: Set<string> | null,
  ): Set<string> {
    const union = new Set<string>();
    for (const v of values) {
      const set = index.get(v);
      if (set) for (const id of set) union.add(id);
    }
    return current ? this.intersect(current, union) : union;
  }

  private intersect(a: Set<string>, b: Set<string>): Set<string> {
    const result = new Set<string>();
    const [smaller, larger] = a.size < b.size ? [a, b] : [b, a];
    for (const id of smaller) {
      if (larger.has(id)) result.add(id);
    }
    return result;
  }

  /** Simple text search across name, description, tags, muscles, equipment. */
  search(query: string, limit = 10): Exercise[] {
    const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 1);
    if (!terms.length) return [];

    const scored: Array<{ ex: Exercise; score: number }> = [];
    for (const ex of this.exercises.values()) {
      let score = 0;
      const name = ex.name.toLowerCase();
      const desc = (ex.description || "").toLowerCase();
      const tags = ex.tags.map(t => t.toLowerCase());
      const muscles = ex.muscles.map(m => m.toLowerCase());
      const equip = ex.equipment.map(e => e.toLowerCase());
      const id = ex.id.toLowerCase();

      for (const term of terms) {
        // Exact name match is strongest signal
        if (name === query.toLowerCase()) score += 20;
        // Name contains term
        if (name.includes(term)) score += 10;
        // ID contains term
        if (id.includes(term)) score += 6;
        // Tag/muscle/equipment exact match
        if (tags.some(t => t === term)) score += 5;
        if (muscles.some(m => m === term || m.includes(term))) score += 4;
        if (equip.some(e => e === term || e.includes(term))) score += 3;
        // Description contains term
        if (desc.includes(term)) score += 2;
        // Tag partial match
        if (tags.some(t => t.includes(term))) score += 1;
      }

      if (score > 0) scored.push({ ex, score });
    }

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(s => s.ex);
  }

  getSummary(): string {
    const typeCounts = this.countIndex(this.byType);
    const muscleCounts = this.countIndex(this.byMuscle, 15);
    const equipCounts = this.countIndex(this.byEquipment, 12);

    return [
      `Database: ${this.exercises.size} exercises across ${this.byType.size} types`,
      `Types: ${typeCounts}`,
      `Top muscles: ${muscleCounts}`,
      `Equipment: ${equipCounts}`,
    ].join("\n");
  }

  private countIndex(index: Map<string, Set<string>>, limit?: number): string {
    const sorted = Array.from(index.entries())
      .sort((a, b) => b[1].size - a[1].size);
    const items = limit ? sorted.slice(0, limit) : sorted;
    return items.map(([k, v]) => `${k}(${v.size})`).join(", ");
  }

  getVocabulary(): Vocabulary {
    return {
      types: Array.from(this.byType.keys()).sort(),
      muscles: Array.from(this.byMuscle.keys()).sort(),
      equipment: Array.from(this.byEquipment.keys()).sort(),
      tags: Array.from(this.byTag.keys()).sort(),
      difficulties: Array.from(this.byDifficulty.keys()).sort(),
      categories: Array.from(this.byCategory.keys()).sort(),
    };
  }
}
