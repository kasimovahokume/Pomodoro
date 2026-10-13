/* ============================================================================
   DURATION PICKER — müddət seçimi (chip düymələri)
   İstifadəçi hər rejim üçün vaxtı özü seçir:
     Fokus: 15 / 25 / 30 / 45 / 60 dəqiqə
     Qısa fasilə: 5 / 10 / 15 dəqiqə
     Uzun fasilə: 10 / 15 / 20 / 30 dəqiqə
   ========================================================================== */

import type { Mode, Settings } from "../types";

/** Hər rejim üçün hazır müddət variantları */
export const PRESETS: Record<Mode, number[]> = {
  focus: [15, 25, 30, 45, 60],
  short: [5, 10, 15],
  long: [10, 15, 20, 30],
};

/** Rejimə uyğun parametr açarı */
const KEY: Record<Mode, keyof Settings> = {
  focus: "focusMinutes",
  short: "shortMinutes",
  long: "longMinutes",
};

interface Props {
  mode: Mode;
  settings: Settings;
  /** Parametr dəyişəndə valideyn komponentə xəbər verir */
  onChange: (patch: Partial<Settings>) => void;
}

export function DurationPicker({ mode, settings, onChange }: Props) {
  const active = settings[KEY[mode]] as number;

  return (
    <div className="duration-row">
      <span className="duration-label">Müddət</span>
      {PRESETS[mode].map((min) => (
        <button
          key={min}
          type="button"
          className={`chip${min === active ? " is-active" : ""}`}
          onClick={() => onChange({ [KEY[mode]]: min } as Partial<Settings>)}
          aria-pressed={min === active}
        >
          {min} dəq
        </button>
      ))}
    </div>
  );
}
