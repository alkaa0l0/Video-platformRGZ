/**
 * Логотип YADRO — минималистичный геометрический.
 */
export function YadroLogo({ size = 56, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Логотип проекта"
    >
      <rect width="56" height="56" rx="12" fill="#7B82FF" fillOpacity="0.1" />
      <path 
        d="M16 20L28 36L40 20" 
        stroke="#7B82FF" 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        fill="none"
      />
      <line 
        x1="28" 
        y1="36" 
        x2="28" 
        y2="46" 
        stroke="#7B82FF" 
        strokeWidth="4" 
        strokeLinecap="round"
      />
      <circle cx="28" cy="28" r="3" fill="#7B82FF" fillOpacity="0.3" />
    </svg>
  );
}