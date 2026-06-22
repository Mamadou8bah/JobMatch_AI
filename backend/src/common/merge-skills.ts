export function mergeSkills(...skillLists: Array<string[] | null | undefined>): string[] {
  const seen = new Map<string, string>();

  for (const list of skillLists) {
    for (const skill of list ?? []) {
      const trimmed = skill.trim();
      if (!trimmed) {
        continue;
      }

      const key = trimmed.toLowerCase();
      if (!seen.has(key)) {
        seen.set(key, trimmed);
      }
    }
  }

  return Array.from(seen.values());
}
