/* ============================================================================
   COZY POMODORO — Əsas tətbiq (App)
   ----------------------------------------------------------------------------
   Bu fayl hər şeyi bir yerə yığır:
     • localStorage-dan oxunan vəziyyət (settings, tasks, history)
     • usePomodoro hook-u (taymer məntiqi)
     • Səs idarəsi, rejim rəngi, konfetti və xarakter səhnəsi
   ========================================================================== */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Character, type Scene } from "../components/Character";
import { Confetti } from "../components/Confetti";
import { DurationPicker } from "../components/DurationPicker";
import { Icon } from "../components/Icon";
import { SoundPanel } from "../components/SoundPanel";
import { StatsPanel } from "../components/StatsPanel";
import { TaskPanel } from "../components/TaskPanel";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { usePomodoro } from "../hooks/usePomodoro";
import { cozyAudio } from "../lib/audio";
import { STORAGE_KEYS, todayKey } from "../lib/storage";
import { MODE_META, type DayStat, type Mode, type Settings, type Task } from "../types";

/** İlk açılışda istifadə olunan standart parametrlər */
const DEFAULT_SETTINGS: Settings = {
  focusMinutes: 25,
  shortMinutes: 5,
  longMinutes: 15,
  autoStart: false, // sessiya bitəndə növbəti mərhələ avtomatik başlasın?
  chimeEnabled: true, // vaxt bitəndə zəng çalınsın?
  volume: 0.7,
  track: "none",
};

/** Xarakterin danışdığı şirin cümlələr */
const BUBBLES: Record<Scene, string[]> = {
  typing: ["Fokuslanırıq! ✍️", "Diqqət, işləyirəm…", "Bir az da! 💪"],
  reading: ["Son düzəlişlər…", "Oxuyub öyrənirəm 📖"],
  stretch: ["Bir az uzanım 🧘", "Qəhvə vaxtı! ☕"],
  tea: ["Çay fasiləsi 🍵", "Bir qurtum dincələk…"],
  music: ["Musiqi ilə dincəlirik 🎧"],
  sleep: ["Mürgüləyirik… 🌙"],
  celebrate: ["Hazırdır! 🎉", "Afərin sənə! ✨"],
};

/** Uzun sessiyalarda ortada "uzanma" fasiləsi göstərilsin? (45+ dəqiqə) */
const STRETCH_MIN_MINUTES = 45;

export default function App() {
  /* --------------------------- YADDAŞDAN OXUMA --------------------------- */
  const [settings, setSettings] = useLocalStorage<Settings>(
    STORAGE_KEYS.settings,
    DEFAULT_SETTINGS,
  );
  const [tasks, setTasks] = useLocalStorage<Task[]>(STORAGE_KEYS.tasks, []);
  const [history, setHistory] = useLocalStorage<DayStat[]>(
    STORAGE_KEYS.history,
    [],
  );
  const [activeTaskId, setActiveTaskId] = useLocalStorage<string | null>(
    STORAGE_KEYS.activeTask,
    null,
  );

  /* ------------------------------ KÖMƏKÇİ ------------------------------ */
  const [celebrating, setCelebrating] = useState(false);
  const celebrateTimer = useRef<number | null>(null);

  const updateSettings = useCallback(
    (patch: Partial<Settings>) => setSettings((prev) => ({ ...prev, ...patch })),
    [setSettings],
  );

  const celebrate = useCallback(() => {
    setCelebrating(true);
    if (celebrateTimer.current) window.clearTimeout(celebrateTimer.current);
    // 7 saniyə sonra konfetti və sevinc pozu avtomatik sönür
    celebrateTimer.current = window.setTimeout(() => setCelebrating(false), 7000);
  }, []);

  /* --------------------- SESSİYA BİTDİKƏ NƏ BAŞ VERİR --------------------- */
  const handleComplete = useCallback(
    (finishedMode: Mode, minutes: number) => {
      if (finishedMode === "focus") {
        // 1) Bugünün statistikasını artır
        const key = todayKey();
        setHistory((prev) => {
          const exists = prev.some((d) => d.date === key);
          if (!exists) return [...prev, { date: key, sessions: 1, minutes }];
          return prev.map((d) =>
            d.date === key
              ? { ...d, sessions: d.sessions + 1, minutes: d.minutes + minutes }
              : d,
          );
        });

        // 2) Aktiv tapşırığın pomodoro sayğacını artır
        if (activeTaskId) {
          setTasks((prev) =>
            prev.map((t) =>
              t.id === activeTaskId ? { ...t, pomodoros: t.pomodoros + 1 } : t,
            ),
          );
        }

        // 3) Zəng çal və sevinci göstər
        if (settings.chimeEnabled) cozyAudio.chime("focus-done").catch(() => {});
        celebrate();
      } else if (settings.chimeEnabled) {
        cozyAudio.chime("break-done").catch(() => {});
      }
    },
    [activeTaskId, celebrate, setHistory, setTasks, settings.chimeEnabled],
  );

  /* ------------------------------ TAYMER ------------------------------ */
  const {
    mode,
    running,
    clock,
    progress,
    cycle,
    toggle,
    reset,
    skip,
    changeMode,
  } = usePomodoro({ settings, onComplete: handleComplete });

  /* --------------------- REJİM RƏNGİNİ CSS-Ə ÖTÜR --------------------- */
  // <html data-mode="focus"> → CSS-dəki --accent rəngləri dəyişir
  useEffect(() => {
    document.documentElement.dataset.mode = mode;
  }, [mode]);

  /* ------------------------- SƏSİ SİNXRONLAŞDIR ------------------------- */
  useEffect(() => {
    cozyAudio.setTrack(settings.track).catch(() => {});
  }, [settings.track]);

  useEffect(() => {
    cozyAudio.setVolume(settings.volume);
  }, [settings.volume]);

  // Komponent söküləndə audio kontekstini bağla (yaddaş sızmasının qarşısı)
  useEffect(() => () => cozyAudio.dispose(), []);

  // Taymer düymələrinə basanda sevinc pozu bitsin
  const handleToggle = useCallback(() => {
    setCelebrating(false);
    toggle();
  }, [toggle]);

  /* ---------------------- XARAKTERİN SƏHNƏSİ ----------------------
     Fokus sessiyasının GEDİŞATINA görə dəyişir:
       0–45%   → yazır (typing)
       45–62%  → uzun sessiyalarda (45+ dəq) uzanır (stretch)
       62–100% → oxuyur (reading)                                        */
  const scene: Scene = useMemo(() => {
    if (celebrating) return "celebrate";
    if (mode === "focus") {
      const isLongSession = settings.focusMinutes >= STRETCH_MIN_MINUTES;
      if (isLongSession && progress >= 0.45 && progress < 0.62) return "stretch";
      return progress < 0.45 ? "typing" : "reading";
    }
    if (settings.track !== "none") return "music";
    return mode === "long" ? "sleep" : "tea";
  }, [celebrating, mode, progress, settings.track, settings.focusMinutes]);

  /** Səhnə dəyişdikcə yeni şirin cümlə seçilir */
  const bubble = useMemo(() => {
    if (!running && !celebrating) return "Başlamağa hazırıq? 🌸";
    const list = BUBBLES[scene];
    return list[Math.floor(Math.random() * list.length)];
  }, [scene, running, celebrating]);

  const activeTask = tasks.find((t) => t.id === activeTaskId && !t.done) ?? null;
  const todaySessions =
    history.find((d) => d.date === todayKey())?.sessions ?? 0;

  /* ------------------------------ RENDER ------------------------------ */
  // Halqanın riyaziyyatı: çevrə uzunluğu = 2πr. `dashoffset` ilə progress çəkilir.
  const R = 130;
  const CIRC = 2 * Math.PI * R;

  return (
    <>
      {/* Arxa fon dekorasiyası (üzən pastel ləkələr) */}
      <div className="bg-decor" aria-hidden="true">
        <div className="blob blob--1" />
        <div className="blob blob--2" />
        <div className="blob blob--3" />
      </div>

      <div className="app">
        {/* ------------------------------ ÜST SƏTİR ------------------------------ */}
        <header className="topbar">
          <div className="brand">
            <div className="brand__logo">🍅</div>
            <div>
              <h1 className="brand__title">Cozy Pomodoro</h1>
              <p className="brand__sub">Şirin fokus köşən</p>
            </div>
          </div>
          <div className="row-between">
            <span className="card__badge">
              <Icon name="heart" size={12} /> {todaySessions} pomodoro bugün
            </span>
          </div>
        </header>

        <div className="layout">
          {/* ============================ SOL PANEL ============================ */}
          <div className="col">
            <TaskPanel
              tasks={tasks}
              setTasks={setTasks}
              activeId={activeTaskId}
              setActiveId={setActiveTaskId}
            />
            <StatsPanel history={history} />
            <SoundPanel
              track={settings.track}
              volume={settings.volume}
              onTrackChange={(track) => updateSettings({ track })}
              onVolumeChange={(volume) => updateSettings({ volume })}
            />
          </div>

          {/* ============================ SAĞ PANEL ============================ */}
          <div className="col">
            <section className="card hero">
              {/* Rejim seçimi */}
              <div style={{ display: "flex", justifyContent: "center" }}>
                <div className="mode-switch" role="tablist" aria-label="Rejim">
                  {(Object.keys(MODE_META) as Mode[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      role="tab"
                      aria-selected={mode === m}
                      className={`mode-switch__btn${mode === m ? " is-active" : ""}`}
                      onClick={() => {
                        setCelebrating(false);
                        changeMode(m);
                      }}
                    >
                      {MODE_META[m].emoji} {MODE_META[m].short}
                    </button>
                  ))}
                </div>
              </div>

              <div className="hero__grid" style={{ marginTop: 8 }}>
                {/* ---------- Taymer halqası ---------- */}
                <div className="hero__left">
                  <div className="ring-wrap">
                    <svg className="timer-ring" viewBox="0 0 300 300" aria-hidden="true">
                      <circle className="ring__track" cx="150" cy="150" r={R} />
                      <circle
                        className="ring__progress"
                        cx="150"
                        cy="150"
                        r={R}
                        strokeDasharray={CIRC}
                        // progress 0 → tam boş, 1 → tam dolu
                        strokeDashoffset={CIRC * (1 - progress)}
                      />
                    </svg>
                    <div className="ring-center">
                      <span className="timer-phase">{MODE_META[mode].label}</span>
                      <span className="timer-time">{clock}</span>
                      <span className="timer-round">
                        {activeTask ? `📌 ${activeTask.text}` : "Tapşırıq seçilməyib"}
                      </span>
                    </div>
                  </div>

                  {/* Nazik xətti progress */}
                  <div
                    className="progress-track"
                    style={{ width: "100%", maxWidth: 290 }}
                  >
                    <div
                      className="progress-fill"
                      style={{ width: `${Math.min(100, progress * 100)}%` }}
                    />
                  </div>
                </div>

                {/* ---------- Şirin xarakter ---------- */}
                <div className="hero__right">
                  <Character
                    scene={scene}
                    bubble={bubble}
                    musicOn={settings.track !== "none"}
                  />
                </div>
              </div>

              {/* ---------- İdarəetmə düymələri ---------- */}
              <div className="timer-controls">
                <button
                  type="button"
                  className="btn btn--icon btn--ghost"
                  onClick={() => {
                    setCelebrating(false);
                    reset();
                  }}
                  aria-label="Sıfırla"
                  title="Sıfırla"
                >
                  <Icon name="reset" size={20} />
                </button>

                <button type="button" className="btn btn--primary" onClick={handleToggle}>
                  <Icon name={running ? "pause" : "play"} size={18} weight="fill" />
                  {running ? "Fasilə ver" : "Başla"}
                </button>

                <button
                  type="button"
                  className="btn btn--icon btn--ghost"
                  onClick={() => {
                    setCelebrating(false);
                    skip();
                  }}
                  aria-label="Növbəti mərhələ"
                  title="Növbəti mərhələ"
                >
                  <Icon name="skip" size={20} />
                </button>
              </div>

              {/* ---------- Müddət seçimi ---------- */}
              <DurationPicker mode={mode} settings={settings} onChange={updateSettings} />

              {/* ---------- Kiçik parametrlər ---------- */}
              <div className="prefs">
                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.autoStart}
                  className="pref"
                  onClick={() => updateSettings({ autoStart: !settings.autoStart })}
                >
                  <span className={`switch${settings.autoStart ? " is-on" : ""}`} />
                  Avtomatik başlat
                </button>

                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.chimeEnabled}
                  className="pref"
                  onClick={() =>
                    updateSettings({ chimeEnabled: !settings.chimeEnabled })
                  }
                >
                  <span className={`switch${settings.chimeEnabled ? " is-on" : ""}`} />
                  Zəng səsi
                </button>

                <span className="pref" style={{ cursor: "default" }}>
                  <Icon name="sparkle" size={14} />
                  {cycle} sessiya tamamlandı
                </span>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Vaxt bitəndə yağan konfetti */}
      {celebrating && <Confetti />}
    </>
  );
}
