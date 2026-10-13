import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  // react()  → JSX/TSX fayllarını emal edir
  // tailwindcss() → src/styles/tailwind.css içindəki Tailwind siniflərini yaradır
  plugins: [react(), tailwindcss()],
});
