/**
 * Логотип платформы — нейтральный знак «play» в скруглённом квадрате.
 * Не привязан к бренду YADRO, тема "Studio".
 */
export function YadroLogo({ size = 52, className = "" }) {
  return (
    <div
      className={`flex items-center gap-2.5 ${className}`}
      aria-label="Логотип платформы"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* скруглённый квадрат */}
        <rect width="48" height="48" rx="13" fill="#FF5C39" />
        {/* треугольник play */}
        <path d="M19 15.5L34 24L19 32.5V15.5Z" fill="#0D0D0F" />
      </svg>
      <span
        className="text-lg font-bold tracking-tight text-yadro-text"
        style={{ letterSpacing: "-0.02em" }}
      >
        Studio
      </span>
    </div>
  );
}