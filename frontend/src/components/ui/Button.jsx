import { forwardRef } from "react";
import { cn } from "../../utils/cn";

const VARIANTS = {
  primary:
    "bg-gradient-to-r from-violet-500 to-cyan-400 text-white shadow-glow hover:brightness-110 active:brightness-95",
  secondary:
    "glass text-ink hover:border-border-hover hover:bg-white/[0.06]",
  ghost: "text-ink-muted hover:text-ink hover:bg-white/[0.05]",
  outline: "border border-border text-ink hover:border-violet-400/50 hover:text-white",
  destructive: "bg-signal-red/10 text-signal-red border border-signal-red/30 hover:bg-signal-red/20",
};

const SIZES = {
  sm: "h-9 px-3.5 text-sm rounded-lg gap-1.5",
  md: "h-11 px-5 text-sm rounded-xl gap-2",
  lg: "h-[52px] px-7 text-base rounded-xl gap-2.5 py-3.5",
  icon: "h-10 w-10 rounded-lg",
};

export const Button = forwardRef(
  ({ className, variant = "primary", size = "md", disabled, children, as = "button", ...props }, ref) => {
    const Comp = as;
    return (
      <Comp
        ref={ref}
        disabled={as === "button" ? disabled : undefined}
        aria-disabled={as !== "button" ? disabled : undefined}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-200",
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
          "focus-visible:outline-2 focus-visible:outline-violet-500 focus-visible:outline-offset-2",
          VARIANTS[variant],
          SIZES[size],
          className
        )}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);
Button.displayName = "Button";
