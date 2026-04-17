import { useTranslation } from "./useTranslation";
import type { Locale } from "./translations";
import { Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const languages: { value: Locale; label: string; flag: string }[] = [
  { value: "fr", label: "Français", flag: "🇫🇷" },
  { value: "en", label: "English", flag: "🇬🇧" },
  { value: "ar", label: "عربي", flag: "🇹🇩" },
];

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale } = useTranslation();

  if (compact) {
    return (
      <Select value={locale} onValueChange={(v) => setLocale(v as Locale)}>
        <SelectTrigger className="w-auto min-w-[70px] h-9 rounded-xl bg-muted/50 border-0 text-xs gap-1 focus:ring-primary/30">
          <Globe className="h-3.5 w-3.5 shrink-0" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {languages.map((l) => (
            <SelectItem key={l.value} value={l.value}>
              {l.flag} {l.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <div className="flex gap-1">
      {languages.map((l) => (
        <button
          key={l.value}
          onClick={() => setLocale(l.value)}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            locale === l.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent"
          }`}
        >
          {l.flag} {l.label}
        </button>
      ))}
    </div>
  );
}
