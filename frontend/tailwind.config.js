/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Тема "Studio" — near-black с коралловым акцентом.
        // Namespace оставлен прежним (yadro), чтобы существующие
        // компоненты перекрасились без правок.
        yadro: {
          bg: "#0D0D0F",         // основной near-black фон
          bgDeep: "#000000",     // видеоплеер, самые тёмные зоны
          surface: "#1A1A1F",    // карточки, чат-панель
          surface2: "#26262E",   // подложка инпутов
          input: "#26262E",      // фон input
          msg: "#1F1F26",        // карточка сообщения
          primary: "#FF5C39",    // коралловая primary-кнопка
          primaryHover: "#FF7355",
          accent: "#FF5C39",     // подчёркивание активной вкладки
          accent2: "#FFB59E",    // светлый коралл для тинтов
          text: "#FFFFFF",
          textMute: "#8B8B96",
          border: "rgba(255,255,255,0.09)",
        },
      },
      fontFamily: {
        // Space Grotesk — геометрический гротеск, задаёт новый характер
        sans: ["Space Grotesk", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 24px 60px -24px rgba(0,0,0,0.7)",
        glow: "0 8px 30px -8px rgba(255,92,57,0.45)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};