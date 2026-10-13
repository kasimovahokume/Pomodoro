/* ============================================================================
   CONFETTI — vaxt bitəndə yağan rəngli kağız parçaları
   Hər parça üçün təsadüfi yer, gecikmə, sürət və rəng seçilir.
   ========================================================================== */

import { useMemo } from "react";

const COLORS = ["#FFB3C6", "#9BE3C9", "#C6B3F7", "#FFD98A", "#FFC4A3", "#F2879F"];

interface Props {
  /** Neçə parça olsun */
  count?: number;
}

export function Confetti({ count = 28 }: Props) {
  // useMemo: komponent yenidən render olanda parçalar yerini dəyişməsin
  const bits = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100, // faizlə üfüqi mövqe
        delay: Math.random() * 0.8, // saniyə
        duration: 1.7 + Math.random() * 1.4, // saniyə
        color: COLORS[i % COLORS.length],
        w: 6 + Math.random() * 7,
        h: 9 + Math.random() * 9,
        radius: Math.random() > 0.6 ? "50%" : "3px",
      })),
    [count],
  );

  return (
    <div className="confetti" aria-hidden="true">
      {bits.map((b) => (
        <span
          key={b.id}
          className="confetti__bit"
          style={{
            left: `${b.left}%`,
            width: b.w,
            height: b.h,
            borderRadius: b.radius,
            background: b.color,
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
