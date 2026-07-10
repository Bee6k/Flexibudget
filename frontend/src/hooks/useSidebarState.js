import { useCallback, useState } from 'react';
import { STORAGE_KEYS } from '../config/storageKeys';

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SIDEBAR_OPEN);
    if (raw === 'false') return false;
    if (raw === 'true') return true;
  } catch { /* ignore */ }
  return true;
}

/** Persists sidebar expanded/collapsed preference across sessions. */
export function useSidebarState() {
  const [open, setOpen] = useState(readStored);

  const toggle = useCallback(() => {
    setOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEYS.SIDEBAR_OPEN, String(next));
      } catch { /* ignore */ }
      return next;
    });
  }, []);

  return [open, toggle];
}
