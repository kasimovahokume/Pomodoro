/* ============================================================================
   STATS PANEL — günlük və həftəlik statistika
   Bütün məlumat localStorage-dakı `history` massivindən hesablanır.
   ========================================================================== */

import { lastNDays, todayKey, weekdayShort } from "../lib/storage";
import type { DayStat } from "../types";
import { Icon } from "./Icon";

interface Props {
  history: DayStat[];
}

/** Ardıcıl gün seriyasını (streak) hesablayır */
function calcStreak(history: DayStat[]): number {
  const active = new Set(
    history.filter((d) => d.sessions > 0).map((d) => d.date),
  );
  const cursor = new Date();
  // Bu gün hələ sessiya yoxdursa, dünəndən saymağa başlayırıq
  if (!active.has(todayKey(cursor))) cursor.setDate(cursor.getDate() - 1);

  let streak = 0;
  while (active.has(todayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** Dəqiqəni oxunaqlı formata çevirir: 135 → "2s 15d" */
function prettyMinutes(min: number): string {
  if (min < 60) return `${min}d`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}s` : `${h}s ${m}d`;
}

export function StatsPanel({ history }: Props) {
  const today = history.find((d) => d.date === todayKey());
  const sessions = today?.sessions ?? 0;
  const minutes = today?.minutes ?? 0;
  const streak = calcStreak(history);

  // Son 7 günün seriyası (diaqram üçün)
  const series = lastNDays(7).map((date) => {
    const found = history.find((d) => d.date === date);
    return { date, sessions: found?.sessions ?? 0, minutes: found?.minutes ?? 0 };
  });
  const max = Math.max(1, ...series.map((s) => s.sessions));
  const weekTotal = series.reduce((sum, s) => sum + s.sessions, 0);

  return (
    <section className="card">
      <div className="card__head">
        <h2 className="card__title">
          <Icon name="chart" size={18} />
          Statistika
        </h2>
        <span className="card__badge">
          <Icon name="flame" size={12} /> {streak} gün seriya
        </span>
      </div>

      <div className="stat-grid">
        <div className="stat">
          <div className="stat__value">{sessions}</div>
          <div className="stat__label">Bugün sessiya</div>
        </div>
        <div className="stat">
          <div className="stat__value">{prettyMinutes(minutes)}</div>
          <div className="stat__label">Fokus vaxtı</div>
        </div>
        <div className="stat">
          <div className="stat__value">{weekTotal}</div>
          <div className="stat__label">Həftə cəmi</div>
        </div>
      </div>

      {/* Həftəlik mini diaqram — saf SVG/CSS, heç bir kitabxana yoxdur */}
      <div className="chart" role="img" aria-label="Son 7 günün pomodoro sayı">
        {series.map((s, i) => {
          const isToday = i === series.length - 1;
          // Hündürlük: boş günlər üçün kiçik "stub", dolu günlər üçün nisbi hündürlük
          const pct = s.sessions === 0 ? 12 : Math.max(20, (s.sessions / max) * 100);
          return (
            <div className="chart__col" key={s.date} title={`${s.date}: ${s.sessions} sessiya`}>
              <div
                className={`chart__bar${isToday ? " is-today" : ""}`}
                style={{ height: `${pct}%`, opacity: s.sessions === 0 ? 0.35 : 1 }}
              />
              <span className="chart__day">
                {isToday ? "Bugün" : weekdayShort(s.date)}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
