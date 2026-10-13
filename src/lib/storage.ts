/* ============================================================================
   YADDAS (localStorage) KÖMƏKÇİLƏRİ
   ----------------------------------------------------------------------------
   Backend yoxdur! Bütün məlumat brauzerin öz yaddaşında saxlanılır.
   Hər açar `cozy-pomodoro:v1:` prefiksi ilə başlayır — beləliklə gələcəkdə
   struktur dəyişsə, köhnə məlumatla qarışmır (versiyalama).
   ========================================================================== */

export const STORAGE_KEYS = {
  tasks: "cozy-pomodoro:v1:tasks",
  settings: "cozy-pomodoro:v1:settings",
  history: "cozy-pomodoro:v1:history",
  activeTask: "cozy-pomodoro:v1:active-task",
} as const;

/** Bugünün tarixi "YYYY-MM-DD" formatında (yerli saat qurşağı ilə) */
export function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Son N günün tarix açarlarını qaytarır (ən köhnədən bugünə) */
export function lastNDays(n: number): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(todayKey(d));
  }
  return out;
}

/** Həftənin gününün qısa adı (B.e, Ç.a, ...) — Azərbaycan dilində */
const WEEKDAYS_AZ = ["B", "B.e", "Ç.a", "Ç", "C.a", "C", "Ş"];
export function weekdayShort(dateKey: string): string {
  const d = new Date(`${dateKey}T00:00:00`);
  return WEEKDAYS_AZ[d.getDay()] ?? "";
}

/** Təhlükəsiz oxuma: məlumat yoxdursa və ya pozulubsa → fallback dəyər */
export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback; // pozulmuş JSON proqramı çökdürməsin
  }
}

/** Təhlükəsiz yazma (gizli rejimdə localStorage bloklana bilər) */
export function writeJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* yaddaş dolubsa və ya icazə yoxdursa, sükutla davam et */
  }
}

/** Unikal ID generatoru (crypto varsa onu, yoxsa təsadüfi sətir) */
export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
