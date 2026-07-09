import { useCallback, useEffect, useState } from "react";
import { getItem, setItem, KEYS } from "../services/storage";

async function readSavedIds() {
  const raw = await getItem(KEYS.savedJobIds);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function useSavedJobs() {
  const [savedIds, setSavedIds] = useState([]);

  useEffect(() => {
    readSavedIds().then(setSavedIds);
  }, []);

  const persist = useCallback(async (ids) => {
    setSavedIds(ids);
    await setItem(KEYS.savedJobIds, JSON.stringify(ids));
  }, []);

  const toggleSaved = useCallback(
    async (jobId) => {
      const next = savedIds.includes(jobId)
        ? savedIds.filter((id) => id !== jobId)
        : [...savedIds, jobId];
      await persist(next);
    },
    [persist, savedIds]
  );

  const isSaved = useCallback((jobId) => savedIds.includes(jobId), [savedIds]);

  return { savedIds, toggleSaved, isSaved };
}
