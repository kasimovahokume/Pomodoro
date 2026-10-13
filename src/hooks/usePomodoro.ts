/* ============================================================================
   usePomodoro — TAYMERİN BEYNİ
   ----------------------------------------------------------------------------
   Bu hook bütün taymer məntiqini idarə edir:
     • Geri sayım (drift-free: saat fərqinə görə hesablanır, gecikmə yığılmır)
     • Rejim keçidləri (fokus → qısa/uzun fasilə → fokus)
     • Start / Pause / Reset / Skip
   ========================================================================== */

import { useCallback, useEffect, useRef, useState } from "react";
import type { Mode, Settings } from "../types";

/** Neçə fokus sessiyasından sonra uzun fasilə gəlsin? */
const LONG_BREAK_EVERY = 4;

interface Options {
  settings: Settings;
  /** Sessiya tamamlandıqda çağırılır (statistika üçün) */
  onComplete?: (mode: Mode, minutes: number) => void;
}

export function usePomodoro({ settings, onComplete }: Options) {
  const [mode, setMode] = useState<Mode>("focus");
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(settings.focusMinutes * 60_000);
  /** Tamamlanmış fokus sessiyalarının sayı (uzun fasilə üçün sayğac) */
  const [cycle, setCycle] = useState(0);

  // Ref-lər: interval içində "köhnəlmiş dəyər" (stale closure) probleminin həlli
  const remainingRef = useRef(remaining);
  const deadlineRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  const settingsRef = useRef(settings);
  const modeRef = useRef(mode);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    runningRef.current = running;
  }, [running]);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  /** Rejimin ümumi müddəti (ms) */
  const durationOf = useCallback((m: Mode) => {
    const s = settingsRef.current;
    const min =
      m === "focus" ? s.focusMinutes : m === "short" ? s.shortMinutes : s.longMinutes;
    return min * 60_000;
  }, []);

  /** Müddəti sıfırlayır (taymeri dayandırır) */
  const resetTo = useCallback(
    (m: Mode) => {
      setRunning(false);
      deadlineRef.current = null;
      const d = durationOf(m);
      remainingRef.current = d;
      setRemaining(d);
    },
    [durationOf],
  );

  /* ------------------------------------------------------------------------
     REJİM DƏYİŞMƏSİ — istifadəçi özü seçəndə
     ---------------------------------------------------------------------- */
  const changeMode = useCallback(
    (m: Mode) => {
      setMode(m);
      resetTo(m);
    },
    [resetTo],
  );

  /* ------------------------------------------------------------------------
     NÖVBƏTİ MƏRHƏLƏYƏ KEÇİŞ — vaxt bitəndə avtomatik
     ---------------------------------------------------------------------- */
  const goNext = useCallback(
    (from: Mode) => {
      let next: Mode;
      if (from === "focus") {
        // Hər 4-cü fokusdan sonra uzun fasilə
        const done = cycle + 1;
        setCycle(done);
        next = done % LONG_BREAK_EVERY === 0 ? "long" : "short";
      } else {
        next = "focus";
      }
      setMode(next);
      const d = durationOf(next);
      remainingRef.current = d;
      setRemaining(d);
      deadlineRef.current = null;
      // "Avtomatik başlat" açıqdırsa, növbəti mərhələ dərhal başlayır
      setRunning(settingsRef.current.autoStart);
    },
    [cycle, durationOf],
  );

  /* ------------------------------------------------------------------------
     GERİ SAYIM DÖVRÜ
     ---------------------------------------------------------------------- */
  useEffect(() => {
    if (!running) return;

    // İnterval başlayanda son tarixi (deadline) təyin edirik
    deadlineRef.current = Date.now() + remainingRef.current;

    const id = window.setInterval(() => {
      const left = Math.max(0, (deadlineRef.current ?? 0) - Date.now());
      remainingRef.current = left;
      setRemaining(left);

      if (left <= 0) {
        window.clearInterval(id);
        const finished = modeRef.current;
        const minutes = Math.round(durationOf(finished) / 60_000);
        onCompleteRef.current?.(finished, minutes);
        goNext(finished);
      }
    }, 200);

    return () => window.clearInterval(id);
  }, [running, mode, durationOf, goNext]);

  /* ------------------------------------------------------------------------
     PARAMETRLƏR DƏYİŞƏNDƏ (məs. 25 → 45 dəqiqə)
     taymer işləmirsə, ekrandakı vaxtı dərhal yenilə
     ---------------------------------------------------------------------- */
  useEffect(() => {
    if (!running) {
      const d = durationOf(mode);
      remainingRef.current = d;
      setRemaining(d);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.focusMinutes, settings.shortMinutes, settings.longMinutes]);

  /* ------------------------------------------------------------------------
     BRAUZER TABININ BAŞLIĞINDA QALAN VAXT
     ---------------------------------------------------------------------- */
  useEffect(() => {
    const total = Math.ceil(remaining / 1000);
    const mm = String(Math.floor(total / 60)).padStart(2, "0");
    const ss = String(total % 60).padStart(2, "0");
    const icon = mode === "focus" ? "📚" : "🍵";
    document.title = running ? `${mm}:${ss} ${icon} Cozy Pomodoro` : "Cozy Pomodoro";
  }, [remaining, running, mode]);

  /* ------------------------------------------------------------------------
     İDARƏETMƏ FUNKSİYALARI
     ---------------------------------------------------------------------- */
  const toggle = useCallback(() => {
    if (runningRef.current) {
      // Dayandırarkən qalan vaxtı yadda saxla (son tarixdən geri hesabla)
      remainingRef.current = Math.max(
        0,
        (deadlineRef.current ?? Date.now()) - Date.now(),
      );
      deadlineRef.current = null;
      setRunning(false);
    } else {
      setRunning(true);
    }
  }, []);

  const skip = useCallback(() => {
    setRunning(false);
    goNext(mode);
  }, [goNext, mode]);

  const reset = useCallback(() => resetTo(mode), [mode, resetTo]);

  /* ------------------------------------------------------------------------
     HESABLANMIŞ DƏYƏRLƏR (render üçün)
     ---------------------------------------------------------------------- */
  const totalMs = durationOf(mode);
  const progress = totalMs === 0 ? 0 : 1 - remaining / totalMs; // 0 → 1
  const minutes = Math.floor(remaining / 60_000);
  const seconds = Math.floor((remaining % 60_000) / 1000);
  const clock = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return {
    mode,
    running,
    remaining,
    clock,
    progress,
    totalMs,
    cycle,
    toggle,
    reset,
    skip,
    changeMode,
  };
}
