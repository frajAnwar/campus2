import { Avatar as AvatarPrimitive, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials, cn } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  name: string;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showStatus?: boolean;
}

const sizeClasses = {
  xs: "h-5 w-5 text-[8px]",
  sm: "h-6 w-6 text-xs",
  md: "h-8 w-8 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

export function Avatar({ src, name, className, size = "md", showStatus }: AvatarProps) {
  return (
    <div className="relative inline-block shrink-0">
      <AvatarPrimitive className={cn(sizeClasses[size], className)}>
        <AvatarImage src={src || undefined} alt={name} />
        <AvatarFallback className="bg-slate-100 dark:bg-slate-800 font-bold">{getInitials(name)}</AvatarFallback>
      </AvatarPrimitive>
      {showStatus && (
        <span className="absolute bottom-0 right-0 block h-[25%] w-[25%] rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 shadow-sm animate-pulse" />
      )}
    </div>
  );
}
