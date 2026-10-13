/* ============================================================================
   MASKOT ÖNİZLƏMƏ SƏHİFƏSİ (yalnız inkişaf üçün)
   ----------------------------------------------------------------------------
   Bu səhifə xarakterin bütün 6 pozu bir ekranda göstərir — dizaynı yoxlamaq
   üçün çox rahatdır. İşə salmaq:  npm run dev  →  http://localhost:5173/preview.html
   (İstehsal build-inə daxil olmur, çünki vite.config-də yalnız index.html var.)
   ========================================================================== */

import { createRoot } from "react-dom/client";
import { Character, type Scene } from "../components/Character";
import { Confetti } from "../components/Confetti";
import "../styles/tailwind.css";
import "../styles/global.css";
import "../styles/components.css";

const SCENES: { id: Scene; title: string; note: string; music?: boolean }[] = [
  { id: "typing", title: "Yazır", note: "Fokusun ilk 45%-i — noutbukda işləyir" },
  { id: "reading", title: "Oxuyur", note: "Fokusun sonu — kitab oxuyur" },
  {
    id: "stretch",
    title: "Uzanır",
    note: "45+ dəqiqəlik sessiyaların ortasında mikro-fasilə",
  },
  { id: "tea", title: "Çay içir", note: "Qısa fasilə", music: true },
  { id: "music", title: "Musiqi dinləyir", note: "Fasilə + fon musiqisi açıqdır" },
  { id: "sleep", title: "Mürgüləyir", note: "Uzun fasilə", music: true },
  { id: "celebrate", title: "Sevinir", note: "Taymer bitdi — konfetti anı" },
];

function Preview() {
  return (
    <div className="app" style={{ maxWidth: 1180 }}>
      <header className="topbar">
        <div className="brand">
          <div className="brand__logo">🐱</div>
          <div>
            <h1 className="brand__title">Maskot səhnələri</h1>
            <p className="brand__sub">
              Xarakterin bütün pozları — dizaynı yoxlamaq üçün
            </p>
          </div>
        </div>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 18,
        }}
      >
        {SCENES.map((s) => (
          <section className="card" key={s.id}>
            <div className="card__head">
              <h2 className="card__title">{s.title}</h2>
              <span className="card__badge">{s.id}</span>
            </div>
            <Character
              scene={s.id}
              bubble={s.note}
              musicOn={s.music ?? false}
            />
          </section>
        ))}

        {/* Konfetti effektinin önizləməsi (vaxt bitəndə tətbiqdə görünür) */}
        <section className="card" style={{ position: "relative", overflow: "hidden" }}>
          <div className="card__head">
            <h2 className="card__title">Konfetti</h2>
            <span className="card__badge">taymer bitəndə</span>
          </div>
          <div style={{ position: "relative", height: 230 }}>
            <Confetti count={34} />
          </div>
        </section>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<Preview />);
