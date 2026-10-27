import type { PressureCategory } from "@/lib/civx/types";

export function PressureBadge({ category, className = "" }: {
  category: PressureCategory | null | undefined;
  className?: string;
}) {
  return (
    <span className={`civx-pressure ${className}`} data-category={category ?? undefined}>
      {category ? `${category[0].toUpperCase()}${category.slice(1)} relative pressure` : "Score unavailable"}
    </span>
  );
}
