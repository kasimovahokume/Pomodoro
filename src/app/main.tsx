/* ============================================================================
   GİRİŞ NÖQTƏSİ (entry point)
   CSS faylları burada, düzgün ardıcıllıqla qoşulur:
     1) tailwind.css   → Tailwind utility sinifləri (layered)
     2) global.css     → dizayn tokenləri + baza + layout
     3) components.css → komponent stilləri
   ========================================================================== */

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "../styles/tailwind.css";
import "../styles/global.css";
import "../styles/components.css";

createRoot(document.getElementById("root")!).render(<App />);
