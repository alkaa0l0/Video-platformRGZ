import { forwardRef } from "react";

/**
 * Поле ввода с заголовком, плейсхолдером, состоянием ошибки и звёздочкой
 * для обязательных. Повторяет компонент со страниц 12–13 дизайна.
 */
export const Field = forwardRef(function Field(
  { label, required, error, hint, ...inputProps },
  ref
) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-yadro-textMute">
          {label}
        </span>
      )}
      <div className="relative">
        <input
          ref={ref}
          {...inputProps}
          className={[
            "w-full rounded-md bg-yadro-input/60 px-4 py-3 text-yadro-text",
            "placeholder:text-yadro-textMute/70 outline-none transition",
            "border",
            error
              ? "border-red-500/70 focus:border-red-400"
              : "border-yadro-border focus:border-yadro-accent/70",
            "focus:bg-yadro-input/80",
          ].join(" ")}
        />
        {required && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-yadro-textMute">
            *
          </span>
        )}
      </div>
      {error && <span className="mt-1 block text-xs text-red-400">{error}</span>}
      {!error && hint && (
        <span className="mt-1 block text-xs text-yadro-textMute">{hint}</span>
      )}
    </label>
  );
});
