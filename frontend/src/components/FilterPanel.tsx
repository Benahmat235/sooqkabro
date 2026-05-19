import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cities, getCityById } from "@/data/cities";
import { useTranslation } from "@/i18n/useTranslation";
import { cn } from "@/lib/utils";

interface FilterPanelProps {
  selectedCity: string;
  onCityChange: (city: string) => void;
  minPrice: string;
  onMinPriceChange: (v: string) => void;
  maxPrice: string;
  onMaxPriceChange: (v: string) => void;
  quartier: string;
  onQuartierChange: (v: string) => void;
  verifiedOnly: boolean;
  onVerifiedOnlyChange: (v: boolean) => void;
  dateFilter: string;
  onDateFilterChange: (v: string) => void;
  className?: string;
}

export default function FilterPanel({
  selectedCity,
  onCityChange,
  minPrice,
  onMinPriceChange,
  maxPrice,
  onMaxPriceChange,
  quartier,
  onQuartierChange,
  verifiedOnly,
  onVerifiedOnlyChange,
  dateFilter,
  onDateFilterChange,
  className,
}: FilterPanelProps) {
  const { t } = useTranslation();
  const cityData = getCityById(selectedCity);
  const quartiers = cityData?.quartiers || [];

  return (
    <div className={cn("p-3 bg-card rounded-2xl shadow-card animate-fade-in space-y-4", className)}>
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        <Select value={selectedCity} onValueChange={onCityChange}>
          <SelectTrigger className="h-10 w-full text-xs rounded-xl border-border/50 sm:w-36 sm:rounded-full sm:h-9">
            <SelectValue placeholder={t("publish.city")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filter.all")}</SelectItem>
            {cities.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {quartiers.length > 0 && (
          <Select value={quartier} onValueChange={onQuartierChange}>
            <SelectTrigger className="h-10 w-full text-xs rounded-xl border-border/50 sm:w-36 sm:rounded-full sm:h-9">
              <SelectValue placeholder={t("filter.quartier")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filter.all")}</SelectItem>
              {quartiers.map((q) => (
                <SelectItem key={q} value={q}>{q}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Input
          placeholder={t("filter.minPrice")}
          value={minPrice}
          onChange={(e) => onMinPriceChange(e.target.value)}
          className="h-10 w-full text-xs rounded-xl bg-muted/50 border-0 sm:w-28 sm:rounded-full sm:h-9"
          type="number"
        />
        <Input
          placeholder={t("filter.maxPrice")}
          value={maxPrice}
          onChange={(e) => onMaxPriceChange(e.target.value)}
          className="h-10 w-full text-xs rounded-xl bg-muted/50 border-0 sm:w-28 sm:rounded-full sm:h-9"
          type="number"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
        <Select value={dateFilter} onValueChange={onDateFilterChange}>
          <SelectTrigger className="h-10 w-full text-xs rounded-xl border-border/50 sm:w-32 sm:rounded-full sm:h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filter.anytime")}</SelectItem>
            <SelectItem value="today">{t("filter.today")}</SelectItem>
            <SelectItem value="7days">{t("filter.7days")}</SelectItem>
            <SelectItem value="30days">{t("filter.30days")}</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Switch
            id="verified-filter"
            checked={verifiedOnly}
            onCheckedChange={onVerifiedOnlyChange}
          />
          <Label htmlFor="verified-filter" className="text-xs cursor-pointer">
            {t("filter.verifiedOnly")}
          </Label>
        </div>
      </div>
    </div>
  );
}
