import { cn } from "../../utils/cn";

export function Card({ className, glow = false, children, ...props }) {
  return (
    <div
      className={cn(
        "relative rounded-2xl glass shadow-card shadow-inner-hairline",
        glow && "hover:shadow-glow hover:border-border-accent transition-shadow duration-300",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div className={cn("p-5 pb-3", className)} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={cn("p-5 pt-0", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3 className={cn("font-display text-lg font-semibold text-ink", className)} {...props}>
      {children}
    </h3>
  );
}
