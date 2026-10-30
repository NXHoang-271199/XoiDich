"use client";

import { useEffect, useState } from "react";

/**
 * Returns `value` only after it has stopped changing for `delayMs`.
 * Use for search / autocomplete inputs: `const q = useDebounce(input, 400)`.
 */
export function useDebounce<T>(value: T, delayMs = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}
