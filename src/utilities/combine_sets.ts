export function combineSets<T>(sets: Array<Set<T>>): Set<T> {
  const result = new Set<T>();
  for (const s of sets) {
    for (const id of s) {
      result.add(id);
    }
  }
  return result;
}
