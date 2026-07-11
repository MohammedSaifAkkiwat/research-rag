import { Loader2 } from "lucide-react";
import { cn } from "../../utils/cn";

export function Spinner({ className, size = 16 }) {
  return <Loader2 className={cn("animate-spin text-violet-400", className)} style={{ width: size, height: size }} />;
}
