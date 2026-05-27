/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Тема "Studio" — тёплый тёмный фон, мягкий коралл.
        // Чуть светлее и теплее прежнего near-black — выглядит дружелюбнее.
        yadro: {
          bg: "#16151D",         // тёплый тёмный фон
          bgDeep: "#0B0A11",     // видеоплеер
          surface: "#211F2B",    // карточки, чат-панель
          surface2: "#2E2C3B",   // подложка инпутов
          input: "#2E2C3B",      // фон input
          msg: "#272534",        // карточка сообщения
          primary: "#FF6B47",    // мягкий коралл
          primaryHover: "#FF7E5C",
          accent: "#FF6B47",     // подчёркивание активной вкладки
          accent2: "#FFC4B0",    // светлый коралл для тинтов
          ok: "#3FCF8E",         // зелёный — для лайка
          text: "#FFFFFF",
          textMute: "#9D9AAE",
          border: "rgba(255,255,255,0.10)",
        },
      },
      fontFamily: {
        sans: ["Space Grotesk", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 24px 60px -24px rgba(0,0,0,0.6)",
        glow: "0 8px 30px -8px rgba(255,107,71,0.45)",
      },
      borderRadius: {
        xl2: "1.5rem",
      },
    },
  },
  plugins: [],
};