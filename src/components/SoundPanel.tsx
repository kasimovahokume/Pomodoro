/* ============================================================================
   SOUND PANEL — fon musiqisi idarəsi
   ----------------------------------------------------------------------------
   Səslər Web Audio API ilə real vaxtda sintez olunur (mp3 faylı yoxdur):
     • Lo-fi   → yumşaq akkordlar + vinil xırıltısı
     • Yağış   → filtrlənmiş ağ səs (iki qat)
   ========================================================================== */

import type { Settings } from "../types";
import { Icon, type IconName } from "./Icon";

interface Props {
  track: Settings["track"];
  volume: number;
  onTrackChange: (track: Settings["track"]) => void;
  onVolumeChange: (volume: number) => void;
}

const OPTIONS: { id: Settings["track"]; label: string; icon: IconName }[] = [
  { id: "none", label: "Səssiz", icon: "volumeOff" },
  { id: "lofi", label: "Lo-fi", icon: "music" },
  { id: "rain", label: "Yağış", icon: "rain" },
];

export function SoundPanel({
  track,
  volume,
  onTrackChange,
  onVolumeChange,
}: Props) {
  return (
    <section className="card">
      <div className="card__head">
        <h2 className="card__title">
          <Icon name="volumeOn" size={18} />
          Fon səsi
        </h2>
        <span className="card__badge">{track === "none" ? "söndü" : "canlı"}</span>
      </div>

      <div className="sound-row">
        {OPTIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            className={`sound-btn${track === o.id ? " is-active" : ""}`}
            onClick={() => onTrackChange(o.id)}
            aria-pressed={track === o.id}
          >
            <span>
              <Icon name={o.icon} size={20} />
            </span>
            <span>{o.label}</span>
          </button>
        ))}
      </div>

      {/* Səs səviyyəsi */}
      <div className="volume">
        <Icon name="volumeOff" size={16} />
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(volume * 100)}
          onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
          aria-label="Səs səviyyəsi"
        />
        <Icon name="volumeOn" size={16} />
      </div>
    </section>
  );
}
