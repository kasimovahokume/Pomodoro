/* ============================================================================
   COZY AUDIO ENGINE
   ----------------------------------------------------------------------------
   HTML5 Audio API-nin ən güclü hissəsi olan **Web Audio API** istifadə olunur.
   Niyə mp3 fayl yox? Çünki bu üsulda:
     • Heç bir xarici fayl/server lazım deyil (tam offline işləyir)
     • Musiqi sonsuz dövr edir (loop nöqtəsi problemi yoxdur)
     • Fayl ölçüsü 0 KB-dır, səhifə ani açılır
   Əgər sonradan öz mp3 faylını qoşmaq istəsən, `playFile()` metoduna bax.
   ========================================================================== */

/** Mövcud musiqi variantları */
export type TrackId = "none" | "lofi" | "rain";

/** Lo-fi akkord ardıcıllığı: Fmaj7 → G7 → Em7 → Am7 (isti, cozy hiss verir) */
const CHORDS: number[][] = [
  [174.61, 220.0, 261.63, 329.63],
  [196.0, 246.94, 293.66, 349.23],
  [164.81, 196.0, 246.94, 293.66],
  [220.0, 261.63, 329.63, 392.0],
];

/** Melodiya üçün pentatonik notlar (təsadüfi seçilir → həmişə xoş səslənir) */
const MELODY: number[] = [523.25, 587.33, 659.25, 783.99, 880.0];

export class CozyAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private busGain: GainNode | null = null; // aktiv trekin qazancı
  private noiseBuffer: AudioBuffer | null = null;
  private nodes: AudioScheduledSourceNode[] = []; // dayandırılacaq node-lar
  private schedulerId: number | null = null;
  private nextChordTime = 0;
  private chordIndex = 0;
  private volume = 0.7;
  private track: TrackId = "none";

  /* ------------------------------------------------------------------------
     AudioContext-i yalnız lazım olanda yaradırıq.
     Brauzerlər istifadəçi klikinə qədər səsi başlatmağa icazə vermir,
     ona görə bu metod "Play" düyməsində çağırılır.
     ---------------------------------------------------------------------- */
  private ensure(): AudioContext {
    if (this.ctx) return this.ctx;

    const Ctor: typeof AudioContext =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new Ctor();

    // Master qazanc → dinamiklər
    const master = ctx.createGain();
    master.gain.value = this.volume;
    master.connect(ctx.destination);

    // Trek qazancı (crossfade üçün master-dən əvvəl)
    const bus = ctx.createGain();
    bus.gain.value = 0;
    bus.connect(master);

    // 2 saniyəlik ağ səs (noise) buffer-i — yağış və vinil xırıltısı üçün
    const len = Math.floor(ctx.sampleRate * 2);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;

    this.ctx = ctx;
    this.master = master;
    this.busGain = bus;
    this.noiseBuffer = buf;
    return ctx;
  }

  /** Hazırda hansı trekin çaldığını göstərir */
  get currentTrack(): TrackId {
    return this.track;
  }

  /* ------------------------------------------------------------------------
     TREK SEÇİMİ — köhnə səsi yumşaq söndürür, yenisini yandırır
     ---------------------------------------------------------------------- */
  async setTrack(track: TrackId) {
    this.track = track;
    if (track === "none") {
      this.stopAll();
      return;
    }
    const ctx = this.ensure();
    if (ctx.state === "suspended") await ctx.resume();

    this.stopAll();
    this.busGain!.gain.cancelScheduledValues(ctx.currentTime);
    this.busGain!.gain.setValueAtTime(0.0001, ctx.currentTime);
    this.busGain!.gain.linearRampToValueAtTime(1, ctx.currentTime + 1.2);

    if (track === "lofi") this.startLofi();
    if (track === "rain") this.startRain();
  }

  /** Aktiv treki dayandırır (səsi sıfıra salıb node-ları bağlayır) */
  stopAll() {
    if (this.schedulerId !== null) {
      window.clearInterval(this.schedulerId);
      this.schedulerId = null;
    }
    this.nodes.forEach((n) => {
      try {
        n.stop();
      } catch {
        /* artıq dayanıbsa xəta verməsin */
      }
    });
    this.nodes = [];
  }

  /** Tam söndürmə (komponent unmount olanda çağırılır) */
  dispose() {
    this.stopAll();
    this.ctx?.close();
    this.ctx = null;
    this.master = null;
    this.busGain = null;
  }

  /** Səs səviyyəsi: 0.0 – 1.0 */
  setVolume(v: number) {
    this.volume = Math.min(1, Math.max(0, v));
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  /* ========================================================================
     LO-FI TREKİ
     Yumşaq sine "pad" akkordları + təsadüfi melodiya notları + vinil xırıltısı
     ====================================================================== */
  private startLofi() {
    const ctx = this.ensure();
    this.chordIndex = 0;
    this.nextChordTime = ctx.currentTime + 0.15;

    // 1) Vinil xırıltısı: çox alçaq səviyyəli, yüksək tezlikli noise
    const crackle = ctx.createBufferSource();
    crackle.buffer = this.noiseBuffer;
    crackle.loop = true;
    const crackleFilter = ctx.createBiquadFilter();
    crackleFilter.type = "highpass";
    crackleFilter.frequency.value = 4500;
    const crackleGain = ctx.createGain();
    crackleGain.gain.value = 0.012;
    crackle.connect(crackleFilter).connect(crackleGain).connect(this.busGain!);
    crackle.start();
    this.nodes.push(crackle);

    // 2) Akkord planlayıcısı: hər 200ms-də 1.5 saniyə irəlini planlayır
    const lookahead = 1.5;
    this.schedulerId = window.setInterval(() => {
      if (!this.ctx) return;
      while (this.nextChordTime < this.ctx.currentTime + lookahead) {
        this.scheduleChord(this.nextChordTime);
        this.nextChordTime += 2.4; // hər akkord 2.4 saniyə
        this.chordIndex++;
      }
    }, 200);
  }

  /** Bir akkordu (4 yumşaq not) müəyyən vaxtda səsləndirir */
  private scheduleChord(time: number) {
    const ctx = this.ctx!;
    const chord = CHORDS[this.chordIndex % CHORDS.length];

    // Yumşaq, "yastıq" səsi üçün aşağı tezlikli filtr
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1100;
    filter.Q.value = 0.7;

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, time);
    g.gain.linearRampToValueAtTime(0.075, time + 0.9); // yavaş giriş
    g.gain.linearRampToValueAtTime(0.0001, time + 2.6); // yavaş çıxış
    filter.connect(g).connect(this.busGain!);

    chord.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = i === 0 ? "triangle" : "sine";
      osc.frequency.value = freq;
      // Çox yüngül detune → isti, "analoq" hiss
      osc.detune.value = (Math.random() - 0.5) * 8;
      osc.connect(filter);
      osc.start(time);
      osc.stop(time + 2.8);
      this.nodes.push(osc);
    });

    // Təsadüfi şirin melodiya notu (60% ehtimalla)
    if (Math.random() < 0.6) {
      const note = MELODY[Math.floor(Math.random() * MELODY.length)];
      this.playBellNote(note, time + 1.2, 0.035, 1.8);
    }
  }

  /* ========================================================================
     YAĞIŞ TREKİ
     İki qat filtrlənmiş ağ səs: aşağı "rumble" + yuxarı "şırıltı"
     ====================================================================== */
  private startRain() {
    const ctx = this.ensure();

    // 1) Yuxarı qat: yağışın şırıltısı (bandpass)
    const hiss = ctx.createBufferSource();
    hiss.buffer = this.noiseBuffer;
    hiss.loop = true;
    const hissFilter = ctx.createBiquadFilter();
    hissFilter.type = "bandpass";
    hissFilter.frequency.value = 1600;
    hissFilter.Q.value = 0.5;
    const hissGain = ctx.createGain();
    hissGain.gain.value = 0.16;
    hiss.connect(hissFilter).connect(hissGain).connect(this.busGain!);

    // 2) Aşağı qat: uzaq gurultu (lowpass)
    const rumble = ctx.createBufferSource();
    rumble.buffer = this.noiseBuffer;
    rumble.loop = true;
    const rumbleFilter = ctx.createBiquadFilter();
    rumbleFilter.type = "lowpass";
    rumbleFilter.frequency.value = 420;
    const rumbleGain = ctx.createGain();
    rumbleGain.gain.value = 0.22;
    rumble.connect(rumbleFilter).connect(rumbleGain).connect(this.busGain!);

    // 3) Yavaş LFO → yağışın təbii "nəfəs alması"
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.05;
    lfo.connect(lfoGain).connect(hissGain.gain);
    lfo.start();

    hiss.start();
    rumble.start();
    this.nodes.push(hiss, rumble, lfo);
  }

  /* ========================================================================
     ZƏNG SƏSİ — taymer bitəndə çalınan yumşaq, şirin "ding"
     ====================================================================== */
  async chime(kind: "focus-done" | "break-done" = "focus-done") {
    const ctx = this.ensure();
    if (ctx.state === "suspended") await ctx.resume();

    // Focus bitəndə: yuxarı qalxan 3 not | Fasilə bitəndə: 2 not
    const seq =
      kind === "focus-done" ? [659.25, 830.61, 987.77] : [987.77, 659.25];

    seq.forEach((freq, i) => {
      const t = ctx.currentTime + 0.05 + i * 0.28;
      this.playBellNote(freq, t, 0.22, 2.4);
    });
  }

  /** Zəng/nota üçün: bir neçə harmonik + eksponensial sönmə (bell timbre) */
  private playBellNote(
    freq: number,
    time: number,
    peak: number,
    duration: number,
  ) {
    const ctx = this.ctx!;
    const partials = [1, 2.01, 2.99, 4.2];
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(peak, time + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    g.connect(this.master!);

    partials.forEach((p, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq * p;
      const pg = ctx.createGain();
      pg.gain.value = 1 / (i + 1.6); // yuxarı harmoniklər daha sakit
      osc.connect(pg).connect(g);
      osc.start(time);
      osc.stop(time + duration + 0.05);
    });
  }

  /* ========================================================================
     İSTƏYƏ BAĞLI: öz mp3 faylını qoşmaq
     ----------------------------------------------------------------------
     public/ qovluğuna mahnı.mp3 at, sonra:
        const a = new CozyAudio(); a.playFile('/mahnı.mp3')
     ====================================================================== */
  async playFile(url: string, loop = true) {
    const ctx = this.ensure();
    if (ctx.state === "suspended") await ctx.resume();
    this.stopAll();
    const el = new Audio(url);
    el.loop = loop;
    const src = ctx.createMediaElementSource(el);
    src.connect(this.busGain!);
    this.busGain!.gain.setValueAtTime(1, ctx.currentTime);
    await el.play();
  }
}

/** Tətbiq boyu tək bir audio nüsxəsi (singleton) */
export const cozyAudio = new CozyAudio();
