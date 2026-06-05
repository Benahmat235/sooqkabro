import { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Shoppe-style grouped settings list (iOS-like). Title above, white card below.
export function SectionList({
  title,
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {title && (
        <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-1">
          {title}
        </h3>
      )}
      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden divide-y divide-border/40">
        {children}
      </div>
    </div>
  );
}

interface SectionRowProps {
  icon?: ReactNode;
  label: string;
  value?: ReactNode;
  onClick?: () => void;
  destructive?: boolean;
  trailing?: ReactNode;
  hideChevron?: boolean;
}

export function SectionRow({
  icon,
  label,
  value,
  onClick,
  destructive,
  trailing,
  hideChevron,
}: SectionRowProps) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors",
        onClick && "hover:bg-muted/40 active:bg-muted/60",
      )}
    >
      {icon && (
        <span
          className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
            destructive ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground",
          )}
        >
          {icon}
        </span>
      )}
      <span
        className={cn(
          "flex-1 text-sm font-semibold truncate",
          destructive ? "text-destructive" : "text-foreground",
        )}
      >
        {label}
      </span>
      {value !== undefined && (
        <span className="text-xs text-muted-foreground truncate max-w-[40%]">{value}</span>
      )}
      {trailing}
      {onClick && !hideChevron && (
        <ChevronRight className="h-4 w-4 text-muted-foreground/60 shrink-0" />
      )}
    </Comp>
  );
}
