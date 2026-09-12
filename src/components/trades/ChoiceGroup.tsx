import { cn } from "@/lib/utils";

interface ChoiceGroupProps<T extends string> {
  value: T;
  options: readonly T[];
  tones?: Record<string, string>;
  onChange: (value: T) => void;
  className?: string;
}

export function ChoiceGroup<T extends string>({
  value,
  options,
  tones,
  onChange,
  className,
}: ChoiceGroupProps<T>) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((option) => {
        const active = option === value;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              "rounded-xl border px-3 py-2 text-xs font-semibold tracking-tight transition-all duration-200 active:scale-[0.97]",
              active
                ? (tones?.[option] ?? "border-primary/40 bg-primary/15 text-primary")
                : "border-border/60 bg-card/40 text-muted-foreground hover:border-border hover:text-foreground",
              active && "ring-1 ring-inset ring-white/10",
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
