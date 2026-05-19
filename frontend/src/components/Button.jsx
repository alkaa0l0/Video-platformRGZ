export function Button({
  children,
  variant = "primary",
  disabled,
  className = "",
  ...rest
}) {
  const base =
    "w-full rounded-md px-4 py-3 text-base font-semibold transition select-none " +
    "disabled:cursor-not-allowed disabled:opacity-50";
  const variants = {
    primary:
      "bg-yadro-primary text-white hover:bg-yadro-primaryHover " +
      "shadow-[0_8px_22px_-8px_rgba(59,67,219,0.7)]",
    ghost:
      "bg-transparent text-yadro-text border border-yadro-border hover:bg-white/5",
    soft:
      "bg-white/8 text-yadro-text hover:bg-white/12 border border-yadro-border",
  };
  return (
    <button
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
