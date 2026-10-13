/* ============================================================================
   ICON — Phosphor Icons üçün nazik wrapper
   ----------------------------------------------------------------------------
   Niyə wrapper? Çünki beləliklə ikon adları bir yerdə saxlanılır və bütün
   layihədə `<Icon name="play" />` kimi oxunaqlı istifadə olunur.

   Vacib performans detalı: ikonlar kök paketdən deyil, birbaşa öz modulundan
   import edilir (`@phosphor-icons/react/dist/csr/Play`). Kök paketdə 3000+
   ikon var — hamısını import etsək, dev server və build çox yavaşlayar.
   ========================================================================== */

import type { ComponentType } from "react";
import { ArrowCounterClockwise } from "@phosphor-icons/react/dist/csr/ArrowCounterClockwise";
import { BookOpen } from "@phosphor-icons/react/dist/csr/BookOpen";
import { ChartBar } from "@phosphor-icons/react/dist/csr/ChartBar";
import { Check } from "@phosphor-icons/react/dist/csr/Check";
import { CloudRain } from "@phosphor-icons/react/dist/csr/CloudRain";
import { Coffee } from "@phosphor-icons/react/dist/csr/Coffee";
import { Flame } from "@phosphor-icons/react/dist/csr/Flame";
import { Heart } from "@phosphor-icons/react/dist/csr/Heart";
import { ListChecks } from "@phosphor-icons/react/dist/csr/ListChecks";
import { Moon } from "@phosphor-icons/react/dist/csr/Moon";
import { MusicNotes } from "@phosphor-icons/react/dist/csr/MusicNotes";
import { Pause } from "@phosphor-icons/react/dist/csr/Pause";
import { PencilSimple } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { Play } from "@phosphor-icons/react/dist/csr/Play";
import { Plus } from "@phosphor-icons/react/dist/csr/Plus";
import { SkipForward } from "@phosphor-icons/react/dist/csr/SkipForward";
import { Sparkle } from "@phosphor-icons/react/dist/csr/Sparkle";
import { SpeakerHigh } from "@phosphor-icons/react/dist/csr/SpeakerHigh";
import { SpeakerSlash } from "@phosphor-icons/react/dist/csr/SpeakerSlash";
import { Target } from "@phosphor-icons/react/dist/csr/Target";
import { Timer } from "@phosphor-icons/react/dist/csr/Timer";
import { Trash } from "@phosphor-icons/react/dist/csr/Trash";

/** Phosphor ikonunun bizə lazım olan minimal prop tipi */
type PhosphorComp = ComponentType<{
  size?: number | string;
  weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
  className?: string;
}>;

const ICONS = {
  play: Play,
  pause: Pause,
  reset: ArrowCounterClockwise,
  skip: SkipForward,
  plus: Plus,
  trash: Trash,
  check: Check,
  pencil: PencilSimple,
  music: MusicNotes,
  rain: CloudRain,
  volumeOn: SpeakerHigh,
  volumeOff: SpeakerSlash,
  coffee: Coffee,
  moon: Moon,
  book: BookOpen,
  heart: Heart,
  sparkle: Sparkle,
  flame: Flame,
  target: Target,
  list: ListChecks,
  chart: ChartBar,
  timer: Timer,
} satisfies Record<string, PhosphorComp>;

export type IconName = keyof typeof ICONS;

interface Props {
  name: IconName;
  size?: number;
  /** Phosphor çəki variantı: "bold" ən şirin görünür */
  weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
  className?: string;
}

export function Icon({ name, size = 20, weight = "bold", className }: Props) {
  const Cmp = ICONS[name];
  return <Cmp size={size} weight={weight} className={className} />;
}
