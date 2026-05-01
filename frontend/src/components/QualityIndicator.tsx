import { Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { computeListingQuality, qualityLevelLabel, type QualityInput } from "@/lib/quality";
import { cn } from "@/lib/utils";

interface QualityIndicatorProps {
  input: QualityInput;
  variant?: "compact" | "detailed";
  className?: string;
}

const levelBg: Record<string, string> = {
  weak: "bg-destructive/10 text-destructive border-destructive/30",
  fair: "bg-orange-500/10 text-orange-600 border-orange-500/30",
  good: "bg-yellow-500/10 text-yellow-700 border-yellow-500/30",
  excellent: "bg-green-500/10 text-green-700 border-green-500/30",
};

const barColor: Record<string, string> = {
  weak: "bg-destructive",
  fair: "bg-orange-500",
  good: "bg-yellow-500",
  excellent: "bg-green-500",
};

export function QualityIndicator({ input, variant = "compact", className }: QualityIndicatorProps) {
  const result = computeListingQuality(input);

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-semibold",
          levelBg[result.level],
          className
        )}
        title={`Score qualité : ${result.score}/100`}
      >
        <Sparkles className="h-3 w-3" />
        <span>{result.score}/100</span>
        <span className="opacity-70">· {qualityLevelLabel[result.level]}</span>
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border bg-card p-4 space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">Score qualité</span>
        </div>
        <span className="text-2xl font-bold">{result.score}<span className="text-sm text-muted-foreground">/100</span></span>
      </div>

      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full transition-all duration-500", barColor[result.level])}
          style={{ width: `${result.score}%` }}
        />
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {result.level === "excellent" ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
        ) : (
          <AlertCircle className="h-3.5 w-3.5" />
        )}
        <span className="font-medium">{qualityLevelLabel[result.level]}</span>
      </div>

      {result.suggestions.length > 0 && (
        <ul className="space-y-1 text-xs text-muted-foreground border-t pt-2">
          {result.suggestions.slice(0, 4).map((s) => (
            <li key={s} className="flex items-start gap-1.5">
              <span className="text-primary mt-0.5">→</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default QualityIndicator;
