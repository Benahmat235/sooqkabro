import { useState } from "react";
import type { Category } from "@/data/categories";
import { cn } from "@/lib/utils";

interface CategoryImageProps {
  category: Category;
  className?: string;
  imgClassName?: string;
  iconClassName?: string;
}

export function CategoryImage({
  category,
  className,
  imgClassName,
  iconClassName,
}: CategoryImageProps) {
  const [hasError, setHasError] = useState(false);
  const Icon = category.icon;

  if (hasError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center",
          category.bgColor,
          className
        )}
      >
        <Icon className={cn("shrink-0", iconClassName)} />
      </div>
    );
  }

  const webpSrc = category.image.replace(/\.jpg$/, ".webp");

  return (
    <picture>
      <source srcSet={webpSrc} type="image/webp" />
      <img
        src={category.image}
        alt={category.name}
        width={160}
        height={160}
        loading="lazy"
        decoding="async"
        className={cn("object-cover", imgClassName)}
        onError={() => setHasError(true)}
      />
    </picture>
  );
}
