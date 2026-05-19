/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // палитра, снятая с дизайна YADRO в PDF
        yadro: {
          bg: "#0E1166",         // основной тёмно-синий фон
          bgDeep: "#080A4A",     // глубже к краям
          surface: "#14186F",    // карточки авторизации и чата
          surface2: "#1E2380",   // подложка инпутов на тёмном
          input: "#2A2F8E",      // фон input на дарк-экранах
          msg: "#222766",        // карточка сообщения чата
          primary: "#3B43DB",    // ярко-синяя кнопка «Отправить»
          primaryHover: "#4A52E8",
          accent: "#7B82FF",     // подчёркивание активной табы
          text: "#FFFFFF",
          textMute: "#9AA0D8",
          border: "rgba(255,255,255,0.08)",
        },
      },
      fontFamily: {
        sans: ["Manrope", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 20px 60px -20px rgba(0,0,0,0.55)",
      },
    },
  },
  plugins: [],
};
