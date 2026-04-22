import { FEATURED_KEYWORDS } from "@/lib/categories";
import { stripHtml } from "@/lib/format";

export type TimeRange = "daily" | "weekly";

const inRange = (pubDate: string, range: TimeRange) => {
  const t = new Date(pubDate).getTime();
  if (Number.isNaN(t)) return false;
  const ms = range === "daily" ? 86_400_000 : 7 * 86_400_000;
  return Date.now() - t < ms;
};

export function filterFeatured<T extends { title: string; pubDate: string }>(
  items: T[],
  range: TimeRange,
  limit = 50,
): T[] {
  return items
    .filter((it) => inRange(it.pubDate, range))
    .filter((it) => {
      const text = stripHtml(it.title);
      return FEATURED_KEYWORDS.some((k) => text.includes(k));
    })
    .slice()
    .sort(
      (a, b) =>
        new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime(),
    )
    .slice(0, limit);
}
