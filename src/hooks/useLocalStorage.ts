import { useEffect, useState } from "react";
import { readJSON, writeJSON } from "../lib/storage";

/**
 * localStorage ilə sinxronlaşan ümumi hook.
 * `useState` kimi işləyir, amma dəyər avtomatik brauzer yaddaşına yazılır.
 */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => readJSON(key, initial));

  // Dəyər hər dəyişdikdə localStorage-a yaz
  useEffect(() => {
    writeJSON(key, value);
  }, [key, value]);

  return [value, setValue] as const;
}
