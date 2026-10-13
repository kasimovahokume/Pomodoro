/* ============================================================================
   COZY CHARACTER — "Mochi" adlı şirin pişik
   ----------------------------------------------------------------------------
   Xarakter tamamilə SVG + CSS animasiyaları ilə çəkilmişdir (heç bir şəkil faylı
   yoxdur). Səhnələr (scene) taymerin rejiminə və gedişatına görə dəyişir:
       typing    → fokusun əvvəli: noutbukda yazır
       reading   → fokusun sonu: kitab oxuyur
       tea       → qısa fasilə: çay içir
       music     → fasilə: musiqi dinləyir (qulaqlıq)
       sleep     → uzun fasilə: mürgüləyir
       celebrate → vaxt bitdi: sevinir 🎉
   ========================================================================== */

import { useId, type ReactNode } from "react";

/* --------------------------- RƏNG PALİTRASI --------------------------- */
const BODY = "#FFF4E9"; // xəzin (pişiyin) əsas rəngi
const SHADE = "#FFE3CE"; // kölgə / həcm
const OUTLINE = "#E2C2AE"; // kontur
const PINK = "#FFB3C6";
const PINK_DEEP = "#F2879F";
const LAV = "#C6B3F7";
const LAV_DEEP = "#9C82E8";
const LAV_SOFT = "#EFE9FD";
const MINT = "#9BE3C9";
const INK = "#5A4A52"; // gözlər / ağız

/* --------------------------- GEOMETRİYA ---------------------------
   Bütün ölçülər 320×280 "səhnə" koordinat sistemindədir.
   Baş bədəndən böyükdür → "chibi" (şirin) nisbəti yaranır. */
const HEAD = { cx: 160, cy: 118, r: 64 };
const BODY_E = { cx: 160, cy: 204, rx: 54, ry: 44 };

export type Scene =
  | "typing"
  | "reading"
  | "stretch"
  | "tea"
  | "music"
  | "sleep"
  | "celebrate";

interface Props {
  scene: Scene;
  /** Danışıq baloncuğundaki mətn (istəyə bağlı) */
  bubble?: string;
  /** Musiqi çalırsa, üzən notlar göstərilsin */
  musicOn?: boolean;
}

export function Character({ scene, bubble, musicOn }: Props) {
  const celebrating = scene === "celebrate";
  // Hər xarakter üçün unikal clip-id (eyni səhifədə bir neçə xarakter ola bilər)
  const cid = useId().replace(/:/g, "");
  const headClip = `head-${cid}`;
  const bodyClip = `body-${cid}`;

  // Ayaq pəncələri yalnız səhnə onları örtmürsə göstərilir
  const showFeet =
    scene === "music" || scene === "celebrate" || scene === "stretch";

  return (
    <div className="stage">
      {bubble && <div className="bubble">{bubble}</div>}

      {/* Üzən ürəklər / ulduzlar — yalnız sevinc anında */}
      {celebrating && (
        <>
          <span className="floaty floaty--a">💖</span>
          <span className="floaty floaty--b">✨</span>
          <span className="floaty floaty--c">🌟</span>
        </>
      )}

      <svg
        className={`character${celebrating ? " is-celebrating" : ""}`}
        viewBox="0 0 320 280"
        role="img"
        aria-label="Cozy Pomodoro maskotu"
      >
        <defs>
          {/* Kölgə qatlarının başın/bədənin içində qalması üçün kəsici maskalar */}
          <clipPath id={headClip}>
            <circle cx={HEAD.cx} cy={HEAD.cy} r={HEAD.r} />
          </clipPath>
          <clipPath id={bodyClip}>
            <ellipse
              cx={BODY_E.cx}
              cy={BODY_E.cy}
              rx={BODY_E.rx}
              ry={BODY_E.ry}
            />
          </clipPath>
        </defs>

        {/* ----------------------- ZƏMİN KÖLGƏSİ ----------------------- */}
        <ellipse cx="160" cy="258" rx="74" ry="10" fill="#E3C6BA" opacity="0.35" />

        {/* ---------------------------- QUYRUP ---------------------------- */}
        <g className="tail">
          <path
            d="M206 216 C250 224 258 178 234 162"
            stroke={OUTLINE}
            strokeWidth="24"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M206 216 C250 224 258 178 234 162"
            stroke={BODY}
            strokeWidth="17"
            fill="none"
            strokeLinecap="round"
          />
        </g>

        {/* ---------------------------- BƏDƏN ---------------------------- */}
        <ellipse
          cx={BODY_E.cx}
          cy={BODY_E.cy}
          rx={BODY_E.rx}
          ry={BODY_E.ry}
          fill={BODY}
          stroke={OUTLINE}
          strokeWidth="3.5"
        />
        <ellipse
          cx={BODY_E.cx}
          cy="226"
          rx="40"
          ry="19"
          fill={SHADE}
          opacity="0.7"
          clipPath={`url(#${bodyClip})`}
        />

        {/* Ayaq pəncələri */}
        {showFeet && (
          <g fill={BODY} stroke={OUTLINE} strokeWidth="3">
            <ellipse cx="136" cy="242" rx="13" ry="8.5" />
            <ellipse cx="184" cy="242" rx="13" ry="8.5" />
          </g>
        )}

        {/* ----------------------------- BAŞ ----------------------------- */}
        {/* Qulaqlar (başdan ƏVVƏL çəkilir ki, başın arxasında qalsın) */}
        <path
          d="M112 86 L96 28 L154 60 Z"
          fill={BODY}
          stroke={OUTLINE}
          strokeWidth="9"
          strokeLinejoin="round"
        />
        <path
          d="M208 86 L224 28 L166 60 Z"
          fill={BODY}
          stroke={OUTLINE}
          strokeWidth="9"
          strokeLinejoin="round"
        />
        {/* Qulaqların içi */}
        <path d="M119 76 L108 42 L144 60 Z" fill={PINK} opacity="0.85" />
        <path d="M201 76 L212 42 L176 60 Z" fill={PINK} opacity="0.85" />

        {/* Başın özü */}
        <circle
          cx={HEAD.cx}
          cy={HEAD.cy}
          r={HEAD.r}
          fill={BODY}
          stroke={OUTLINE}
          strokeWidth="3.5"
        />
        <circle
          cx="160"
          cy="146"
          r="46"
          fill={SHADE}
          opacity="0.5"
          clipPath={`url(#${headClip})`}
        />

        {/* Yanaqlar (blush) */}
        <ellipse cx="110" cy="134" rx="14" ry="8.5" fill={PINK} opacity="0.6" />
        <ellipse cx="210" cy="134" rx="14" ry="8.5" fill={PINK} opacity="0.6" />

        {/* Bığlar */}
        <g stroke={OUTLINE} strokeWidth="2.6" strokeLinecap="round">
          <path d="M94 114 L70 107" />
          <path d="M94 124 L70 127" />
          <path d="M226 114 L250 107" />
          <path d="M226 124 L250 127" />
        </g>

        {/* Gözlər — səhnəyə görə dəyişir */}
        {renderEyes(scene)}

        {/* Burun */}
        <path d="M160 126 l4.5 4.5 -4.5 4.5 -4.5 -4.5 z" fill={PINK_DEEP} />

        {/* Ağız */}
        <g stroke={INK} strokeWidth="2.4" fill="none" strokeLinecap="round">
          <path d="M160 135 v4" />
          {celebrating ? (
            <path d="M147 140 q13 14 26 0" />
          ) : (
            <>
              <path d="M160 139 q-6.5 6 -11.5 1" />
              <path d="M160 139 q6.5 6 11.5 1" />
            </>
          )}
        </g>

        {/* ----------------------- SƏHNƏ ƏŞYALARI ----------------------- */}
        {scene === "typing" && <LaptopScene />}
        {scene === "reading" && <BookScene />}
        {scene === "stretch" && <StretchScene />}
        {scene === "tea" && <TeaScene />}
        {scene === "music" && <MusicScene />}
        {scene === "sleep" && <SleepScene />}
        {scene === "celebrate" && <CelebrateScene />}

        {/* Musiqi notları */}
        {musicOn && (scene === "tea" || scene === "music" || scene === "sleep") && (
          <g fill={LAV_DEEP} fontFamily="var(--font-display)">
            <text className="note" x="252" y="104" fontSize="20">
              ♪
            </text>
            <text className="note note--b" x="272" y="138" fontSize="22">
              ♫
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

/* ============================================================================
   GÖZLƏR — hər əhval üçün fərqli ifadə
   ========================================================================== */
function renderEyes(scene: Scene): ReactNode {
  // Sevinc: "> <" formasında qapalı, xoşbəxt gözlər
  if (scene === "celebrate") {
    return (
      <g stroke={INK} strokeWidth="3.4" fill="none" strokeLinecap="round">
        <path d="M127 104 L136 112 L127 120" />
        <path d="M193 104 L184 112 L193 120" />
      </g>
    );
  }

  // Yuxu: qapalı, aşağı əyilmiş gözlər
  if (scene === "sleep") {
    return (
      <g stroke={INK} strokeWidth="3.4" fill="none" strokeLinecap="round">
        <path d="M127 113 q9 7 18 0" />
        <path d="M175 113 q9 7 18 0" />
      </g>
    );
  }

  // Çay / musiqi / uzanma: xoşbəxt, yuxarı əyilmiş qapalı gözlər
  if (scene === "tea" || scene === "music" || scene === "stretch") {
    return (
      <g stroke={INK} strokeWidth="3.4" fill="none" strokeLinecap="round">
        <path d="M127 116 q9 -9 18 0" />
        <path d="M175 116 q9 -9 18 0" />
      </g>
    );
  }

  // Fokus (yazma / oxuma): açıq, diqqətli gözlər + parıltı
  return (
    <>
      <g className="eye">
        <circle cx="136" cy="112" r="9.5" fill={INK} />
        <circle cx="132.6" cy="108.4" r="3.4" fill="#fff" />
      </g>
      <g className="eye eye--b">
        <circle cx="184" cy="112" r="9.5" fill={INK} />
        <circle cx="180.6" cy="108.4" r="3.4" fill="#fff" />
      </g>
      {/* Oxuyarkən gözlərin üstündə cizgi (diqqət ifadəsi) */}
      {scene === "reading" && (
        <g stroke={INK} strokeWidth="2.6" strokeLinecap="round" opacity="0.75">
          <path d="M126 96 L144 92" />
          <path d="M194 96 L176 92" />
        </g>
      )}
    </>
  );
}

/* ============================================================================
   SƏHNƏ: NOUTBUKDA YAZIR
   ========================================================================== */
function LaptopScene() {
  return (
    <g>
      {/* Ekran */}
      <rect
        x="122"
        y="180"
        width="76"
        height="50"
        rx="9"
        fill={LAV_SOFT}
        stroke={LAV_DEEP}
        strokeWidth="3"
      />
      {/* Ekranda "kod" sətirləri */}
      <g stroke={LAV_DEEP} strokeWidth="3" strokeLinecap="round" opacity="0.6">
        <path d="M132 193 h26" />
        <path d="M132 203 h40" />
        <path d="M132 213 h18" />
      </g>
      <circle cx="188" cy="213" r="4.5" fill={MINT} opacity="0.95" />
      {/* Klaviatura */}
      <rect
        x="106"
        y="232"
        width="108"
        height="13"
        rx="6.5"
        fill={LAV}
        stroke={LAV_DEEP}
        strokeWidth="2.6"
      />
      {/* Yazı yazan pəncələr */}
      <ellipse
        className="paw"
        cx="136"
        cy="226"
        rx="10.5"
        ry="7.5"
        fill={BODY}
        stroke={OUTLINE}
        strokeWidth="3"
      />
      <ellipse
        className="paw paw--b"
        cx="184"
        cy="226"
        rx="10.5"
        ry="7.5"
        fill={BODY}
        stroke={OUTLINE}
        strokeWidth="3"
      />
    </g>
  );
}

/* ============================================================================
   SƏHNƏ: KİTAB OXUYUR
   ========================================================================== */
function BookScene() {
  return (
    <g>
      {/* Sol səhifə */}
      <path
        d="M160 224 C140 214 114 210 94 213 V243 C114 240 140 244 160 254 Z"
        fill="#FFFDF8"
        stroke={OUTLINE}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Sağ səhifə */}
      <path
        d="M160 224 C180 214 206 210 226 213 V243 C206 240 180 244 160 254 Z"
        fill="#FFFDF8"
        stroke={OUTLINE}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Kitabın beli */}
      <path d="M160 224 V254" stroke={OUTLINE} strokeWidth="3" />
      {/* Mətn sətirləri */}
      <g stroke={PINK} strokeWidth="2.6" strokeLinecap="round" opacity="0.65">
        <path d="M108 224 h34" />
        <path d="M108 233 h30" />
        <path d="M178 224 h34" />
        <path d="M178 233 h26" />
      </g>
      {/* Çevrilən səhifə animasiyası */}
      <path
        className="page-turn"
        d="M188 216 h26 v26 h-26 z"
        fill={LAV_SOFT}
        opacity="0.85"
      />
      {/* Kitabı tutan pəncələr */}
      <ellipse cx="112" cy="234" rx="11" ry="8" fill={BODY} stroke={OUTLINE} strokeWidth="3" />
      <ellipse cx="208" cy="234" rx="11" ry="8" fill={BODY} stroke={OUTLINE} strokeWidth="3" />
    </g>
  );
}

/* ============================================================================
   SƏHNƏ: ÇAY İÇİR
   ========================================================================== */
function TeaScene() {
  return (
    <g>
      {/* Buxar */}
      <g stroke="#D6C0B6" strokeWidth="3.2" fill="none" strokeLinecap="round">
        <path className="steam" d="M150 204 C145 194 155 190 150 179" />
        <path className="steam steam--b" d="M170 204 C165 194 175 190 170 179" />
      </g>
      {/* Fincan */}
      <rect
        x="140"
        y="210"
        width="40"
        height="40"
        rx="12"
        fill="#FFE1E9"
        stroke={PINK_DEEP}
        strokeWidth="3"
      />
      {/* Dəstək */}
      <path
        d="M180 220 C194 220 194 242 180 242"
        stroke={PINK_DEEP}
        strokeWidth="3.4"
        fill="none"
        strokeLinecap="round"
      />
      {/* Çayın səthi */}
      <ellipse cx="160" cy="212" rx="20" ry="5.5" fill="#E8C9A0" />
      {/* Fincanı tutan pəncələr */}
      <ellipse cx="134" cy="230" rx="11" ry="8.5" fill={BODY} stroke={OUTLINE} strokeWidth="3" />
      <ellipse cx="186" cy="230" rx="11" ry="8.5" fill={BODY} stroke={OUTLINE} strokeWidth="3" />
    </g>
  );
}

/* ============================================================================
   SƏHNƏ: MUSİQİ DİNLƏYİR (qulaqlıq)
   ========================================================================== */
function MusicScene() {
  return (
    <g>
      {/* Yumşaq yastıq — pişik onun üstündə oturur */}
      <ellipse cx="160" cy="240" rx="58" ry="15" fill={LAV_SOFT} opacity="0.9" />
      {/* Qulaqlığın teli */}
      <path
        d="M112 126 C112 54 208 54 208 126"
        stroke={LAV_DEEP}
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
      />
      {/* Sol qulaqcıq */}
      <rect
        x="98"
        y="116"
        width="24"
        height="36"
        rx="12"
        fill={LAV}
        stroke={LAV_DEEP}
        strokeWidth="3"
      />
      {/* Sağ qulaqcıq */}
      <rect
        x="198"
        y="116"
        width="24"
        height="36"
        rx="12"
        fill={LAV}
        stroke={LAV_DEEP}
        strokeWidth="3"
      />
    </g>
  );
}

/* ============================================================================
   SƏHNƏ: MÜRGÜLƏYİR (uzun fasilə)
   ========================================================================== */
function SleepScene() {
  return (
    <g>
      {/* Yumşaq yorğan — bədənin aşağı hissəsini örtür */}
      <path
        d="M104 210 C130 200 190 200 216 210 C220 238 196 252 160 252 C124 252 100 238 104 210 Z"
        fill={LAV_SOFT}
        stroke={LAV}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Yorğanın qatı (detallı görünüş üçün nazik cizgi) */}
      <path
        d="M118 224 C136 218 184 218 202 224"
        stroke={LAV}
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
        opacity="0.65"
      />
      {/* Zzz */}
      <g fill={LAV_DEEP} fontFamily="var(--font-display)" fontWeight="700">
        <text className="zzz" x="232" y="90" fontSize="18">
          z
        </text>
        <text className="zzz zzz--b" x="252" y="72" fontSize="24">
          z
        </text>
      </g>
    </g>
  );
}

/* ============================================================================
   ORTAQ HƏNDƏSƏ: hər iki qolu yuxarı qaldıran qollar + pəncələr
   Həm "uzanma", həm də "sevinc" səhnələri bundan istifadə edir.
   ========================================================================== */
function RaisedArms() {
  return (
    <>
      {/* Sol qol — bədənin çiynindən kənara və yuxarı */}
      <path d="M130 188 C110 178 90 162 80 138" stroke={OUTLINE} strokeWidth="12" fill="none" strokeLinecap="round" />
      <path d="M130 188 C110 178 90 162 80 138" stroke={BODY} strokeWidth="7.5" fill="none" strokeLinecap="round" />
      {/* Sağ qol */}
      <path d="M190 188 C210 178 230 162 240 138" stroke={OUTLINE} strokeWidth="12" fill="none" strokeLinecap="round" />
      <path d="M190 188 C210 178 230 162 240 138" stroke={BODY} strokeWidth="7.5" fill="none" strokeLinecap="round" />
      {/* Qalxmış pəncələr */}
      <ellipse className="paw" cx="78" cy="130" rx="12.5" ry="11" fill={BODY} stroke={OUTLINE} strokeWidth="3" />
      <ellipse className="paw paw--b" cx="242" cy="130" rx="12.5" ry="11" fill={BODY} stroke={OUTLINE} strokeWidth="3" />
    </>
  );
}

/* ============================================================================
   SƏHNƏ: UZANIR — uzun sessiyaların ortasında "mikro-fasilə"
   45+ dəqiqəlik fokuslarda pişik qollarını qaldırıb uzanır və qəhvə içir.
   ========================================================================== */
function StretchScene() {
  return (
    <g>
      <RaisedArms />
      {/* Yerdə qəhvə fincanı (sol tərəfdə — balans üçün) */}
      <rect
        x="56"
        y="222"
        width="30"
        height="30"
        rx="9"
        fill="#F3E0CE"
        stroke="#C9A27A"
        strokeWidth="3"
      />
      <path
        d="M86 230 C97 230 97 246 86 246"
        stroke="#C9A27A"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx="71" cy="224" rx="15" ry="4.5" fill="#B98A5E" />
      {/* Fincandan çıxan buxar */}
      <g stroke="#D6C0B6" strokeWidth="2.8" fill="none" strokeLinecap="round">
        <path className="steam" d="M66 216 C62 208 70 204 66 195" />
        <path className="steam steam--b" d="M78 216 C74 208 82 204 78 195" />
      </g>
      {/* "Hazıram!" parıltısı */}
      <g fill={MINT}>
        <path d="M268 132 l2.5 6 6 2.5 -6 2.5 -2.5 6 -2.5 -6 -6 -2.5 6 -2.5 z" opacity="0.85" />
      </g>
    </g>
  );
}

/* ============================================================================
   SƏHNƏ: SEVİNİR 🎉
   ========================================================================== */
function CelebrateScene() {
  return (
    <g>
      <RaisedArms />
      {/* Ulduz parıltıları */}
      <g fill={MINT}>
        <path d="M52 120 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 z" opacity="0.9" />
        <path d="M268 132 l2.5 6 6 2.5 -6 2.5 -2.5 6 -2.5 -6 -6 -2.5 6 -2.5 z" opacity="0.9" />
      </g>
      <g fill="#FFD98A">
        <circle cx="66" cy="196" r="5" />
        <circle cx="256" cy="198" r="4" />
      </g>
    </g>
  );
}
