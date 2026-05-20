export function YadroLogo({ size = 56, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Логотип проекта"
    >
      <text
        x="50"
        y="40"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Manrope, sans-serif"
        fontWeight="800"
        fontSize="20"
        fill="currentColor"
        letterSpacing="4"
      >
        YADRO
      </text>
    </svg>
  );
}