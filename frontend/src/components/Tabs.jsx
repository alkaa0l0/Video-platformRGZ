/**
 * Табы с активным состоянием через подчёркивание — повторяет
 * табы со страниц 14 и 15 дизайна.
 */
export function Tabs({ value, onChange, items }) {
  return (
    <div className="flex gap-8 border-b border-white/5">
      {items.map((it) => {
        const active = it.value === value;
        return (
          <button
            key={it.value}
            onClick={() => onChange(it.value)}
            className={[
              "relative pb-3 text-sm font-semibold tracking-wide outline-none transition",
              active ? "text-yadro-text" : "text-yadro-textMute hover:text-white",
            ].join(" ")}
            type="button"
          >
            {it.label}
            <span
              className={[
                "absolute -bottom-px left-0 right-0 h-[2px] rounded transition",
                active ? "bg-yadro-accent" : "bg-transparent",
              ].join(" ")}
            />
          </button>
        );
      })}
    </div>
  );
}
