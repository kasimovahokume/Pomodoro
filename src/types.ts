/* ============================================================================
   TİPLƏR (TypeScript)
   Bütün layihədə istifadə olunan ortaq tiplər burada saxlanılır.
   ========================================================================== */

/** Taymer rejimləri: focus = iş, short = qısa fasilə, long = uzun fasilə */
export type Mode = "focus" | "short" | "long";

/** Bir tapşırıq (task) obyekti */
export interface Task {
  id: string;
  text: string;
  done: boolean;
  /** Bu tapşırıq üçün tamamlanmış pomodoro sayı */
  pomodoros: number;
  createdAt: number;
}

/** Bir günün statistikası (həftəlik diaqram üçün) */
export interface DayStat {
  /** "2026-10-12" formatında tarix */
  date: string;
  /** Tamamlanmış focus sessiyalarının sayı */
  sessions: number;
  /** Ümumi fokus dəqiqəsi */
  minutes: number;
}

/** İstifadəçi parametrləri (localStorage-da saxlanılır) */
export interface Settings {
  focusMinutes: number;
  shortMinutes: number;
  longMinutes: number;
  /** Sessiya bitəndə növbəti mərhələ avtomatik başlasın? */
  autoStart: boolean;
  /** Vaxt bitəndə zəng çalınsın? */
  chimeEnabled: boolean;
  volume: number;
  track: "none" | "lofi" | "rain";
}

/** Rejim → rəng/etiket xəritəsi (CSS `data-mode` ilə üst-üstə düşür) */
export const MODE_META: Record<Mode, { label: string; short: string; emoji: string }> = {
  focus: { label: "Fokus vaxtı", short: "Fokus", emoji: "📚" },
  short: { label: "Qısa fasilə", short: "Qısa fasilə", emoji: "🍵" },
  long: { label: "Uzun fasilə", short: "Uzun fasilə", emoji: "🌙" },
};
