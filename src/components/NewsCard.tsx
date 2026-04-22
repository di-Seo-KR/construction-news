import { CATEGORIES } from "@/lib/categories";
import { formatRelative, hostOf, stripHtml } from "@/lib/format";

const CATEGORY_COLORS: Record<string, string> = {
  "debt-collection": "bg-blue-50 text-blue-700 ring-blue-100",
  "credit-investigation": "bg-emerald-50 text-emerald-700 ring-emerald-100",
  "e-document": "bg-violet-50 text-violet-700 ring-violet-100",
  "finance-law": "bg-amber-50 text-amber-700 ring-amber-100",
  "labor-law": "bg-rose-50 text-rose-700 ring-rose-100",
  kbci: "bg-slate-100 text-slate-700 ring-slate-200",
};

const labelOf = (id: string) =>
  CATEGORIES.find((c) => c.id === id)?.label ?? id;

export type NewsCardItem = {
  link: string;
  originallink: string;
  title: string;
  pubDate: string;
  categories?: string[];
};

export function NewsCard({ item }: { item: NewsCardItem }) {
  const categories = item.categories ?? [];
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-[#FFB81C]/60 hover:shadow-md"
    >
      <div className="flex items-center gap-2 text-[13px] text-gray-500">
        <span className="font-medium text-gray-700">
          {hostOf(item.originallink)}
        </span>
        <span>·</span>
        <span>{formatRelative(item.pubDate)}</span>
      </div>
      <h3 className="mt-3 flex-1 text-[18px] font-semibold leading-snug text-gray-900 group-hover:text-gray-700">
        {stripHtml(item.title)}
      </h3>
      {categories.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {categories.map((id) => (
            <span
              key={id}
              className={`rounded-md px-2 py-0.5 text-[12px] font-medium ring-1 ring-inset ${
                CATEGORY_COLORS[id] ?? "bg-gray-100 text-gray-700"
              }`}
            >
              {labelOf(id)}
            </span>
          ))}
        </div>
      )}
    </a>
  );
}
