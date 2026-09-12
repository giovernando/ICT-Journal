import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const base =
  "w-full rounded-xl border border-border/70 bg-card/50 px-3.5 py-2.5 text-base sm:text-sm text-foreground placeholder:text-muted-foreground/60 backdrop-blur-md shadow-[inset_0_1px_0_0_rgb(255_255_255/0.04)] transition-all duration-200 hover:border-border focus:border-primary/50 focus:bg-card/70 focus:outline-none focus:ring-2 focus:ring-ring/40 [color-scheme:dark]";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(base, "h-11", className)} {...props} />
  ),
);
Input.displayName = "Input";

export const PasswordInput = forwardRef<
  HTMLInputElement,
  Omit<InputHTMLAttributes<HTMLInputElement>, "type">
>(({ className, ...props }, ref) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        ref={ref}
        type={visible ? "text" : "password"}
        className={cn(base, "h-11 pr-11", className)}
        {...props}
      />
      <button
        type="button"
        aria-label={visible ? "Sembunyikan password" : "Tampilkan password"}
        aria-pressed={visible}
        onClick={() => setVisible((current) => !current)}
        className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
});
PasswordInput.displayName = "PasswordInput";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(base, "min-h-[88px] resize-y", className)} {...props} />
));
Textarea.displayName = "Textarea";

export interface SelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  options: readonly string[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(base, "h-11 cursor-pointer appearance-none pr-9", className)}
        {...props}
      >
        {options.map((option) => (
          <option key={option} value={option} className="bg-[#0d1117] text-foreground">
            {option}
          </option>
        ))}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 20 20"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
      >
        <path d="M6 8l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    </div>
  ),
);
Select.displayName = "Select";
