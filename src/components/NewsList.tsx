"use client";

import { useEffect, useMemo, useState } from "react";
import type { EnrichedNewsItem } from "@/app/api/naver-news/all/route";
import type { NaverNewsItem } from "@/app/api/naver-news/route";
import { CATEGORIES } from "@/lib/categories";
import {
  dateGroupOf,
  formatRelative,
  hostOf,
  stripHtml,
} from "@/lib/format";

const ALL_TAB = "__all__";
const GROUP_ORDER = ["오늘", "어제", "이번 주", "이전"];

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

type SearchResult = { mode: "search"; q: string; items: NaverNewsItem[] };
type AllResult = { mode: "all"; items: EnrichedNewsItem[] };
type State = SearchResult | AllResult | null;

export default function NewsList() {
  const [data, setData] = useState<State>(null);
  const [activeTab, setActiveTab] = useState<string>(ALL_TAB);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const url = searchQuery
      ? `/api/naver-news?q=${encodeURIComponent(searchQuery)}&display=100&sort=date`
      : "/api/naver-news/all";

    setLoading(true);
    setError(null);

    fetch(url, { signal: controller.signal })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "요청 실패");
        return json;
      })
      .then((json) => {
        if (searchQuery) {
          setData({ mode: "search", q: searchQuery, items: json.items ?? [] });
        } else {
          setData({ mode: "all", items: json.items ?? [] });
        }
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "오류가 발생했습니다");
        setData(null);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [searchQuery]);

  const filteredItems = useMemo(() => {
    if (!data) return [];
    if (data.mode === "search") return data.items;
    if (activeTab === ALL_TAB) return data.items;
    return data.items.filter((it) => it.categories.includes(activeTab));
  }, [data, activeTab]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { [ALL_TAB]: 0 };
    if (data?.mode === "all") {
      c[ALL_TAB] = data.items.length;
      for (const cat of CATEGORIES) {
        c[cat.id] = data.items.filter((it) =>
          it.categories.includes(cat.id),
        ).length;
      }
    }
    return c;
  }, [data]);

  const grouped = useMemo(() => {
    const groups = new Map<string, (EnrichedNewsItem | NaverNewsItem)[]>();
    for (const item of filteredItems) {
      const g = dateGroupOf(item.pubDate);
      if (!groups.has(g)) groups.set(g, []);
      groups.get(g)!.push(item);
    }
    return GROUP_ORDER.map((g) => ({ group: g, items: groups.get(g) ?? [] }))
      .filter((g) => g.items.length > 0);
  }, [filteredItems]);

  const onSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchInput.trim();
    if (!q) return;
    setSearchQuery(q);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchQuery(null);
  };

  return (
    <div className="space-y-8">
      <form onSubmit={onSubmitSearch} className="relative">
        <svg
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="키워드를 입력해 검색하세요"
          className="w-full rounded-2xl border border-gray-200 bg-white py-4 pl-12 pr-32 text-base shadow-sm outline-none transition-all placeholder:text-gray-400 focus:border-gray-900 focus:shadow-md"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-700"
        >
          검색
        </button>
      </form>

      {searchQuery ? (
        <div className="flex items-center justify-between rounded-xl bg-blue-50 px-4 py-3">
          <div className="text-sm text-blue-900">
            <span className="font-semibold">&quot;{searchQuery}&quot;</span> 검색 결과
          </div>
          <button
            onClick={clearSearch}
            className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-blue-700 ring-1 ring-blue-200 hover:bg-blue-100"
          >
            ✕ 검색 닫기
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <TabButton
            label="전체"
            count={counts[ALL_TAB]}
            active={activeTab === ALL_TAB}
            onClick={() => setActiveTab(ALL_TAB)}
          />
          {CATEGORIES.map((c) => (
            <TabButton
              key={c.id}
              label={c.label}
              count={counts[c.id] ?? 0}
              active={activeTab === c.id}
              onClick={() => setActiveTab(c.id)}
            />
          ))}
        </div>
      )}

      {loading && <SkeletonList />}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {!loading && !error && filteredItems.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center text-sm text-gray-500">
          표시할 뉴스가 없습니다.
        </div>
      )}

      {!loading && !error && grouped.map(({ group, items }) => (
        <section key={group} className="space-y-3">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">
              {group}
            </h2>
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-400">{items.length}건</span>
          </div>
          <ul className="space-y-2">
            {items.map((item) => (
              <NewsCard key={item.link} item={item} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function TabButton({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`group rounded-full px-4 py-2 text-sm font-medium transition-all ${
        active
          ? "bg-gray-900 text-white shadow-sm"
          : "bg-white text-gray-700 ring-1 ring-gray-200 hover:ring-gray-300"
      }`}
    >
      {label}
      {count > 0 && (
        <span
          className={`ml-2 text-xs ${
            active ? "text-gray-300" : "text-gray-400"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function NewsCard({ item }: { item: EnrichedNewsItem | NaverNewsItem }) {
  const categories = "categories" in item ? item.categories : [];
  return (
    <li>
      <a
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        className="group block rounded-xl border border-gray-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
      >
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="font-medium text-gray-700">
            {hostOf(item.originallink)}
          </span>
          <span>·</span>
          <span>{formatRelative(item.pubDate)}</span>
          {categories.length > 0 && (
            <>
              <span className="ml-auto flex flex-wrap gap-1">
                {categories.map((id) => (
                  <span
                    key={id}
                    className={`rounded-md px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${
                      CATEGORY_COLORS[id] ?? "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {labelOf(id)}
                  </span>
                ))}
              </span>
            </>
          )}
        </div>
        <h3 className="mt-2 text-base font-semibold leading-snug text-gray-900 group-hover:text-gray-700">
          {stripHtml(item.title)}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-gray-600">
          {stripHtml(item.description)}
        </p>
      </a>
    </li>
  );
}

function SkeletonList() {
  return (
    <ul className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <li
          key={i}
          className="animate-pulse rounded-xl border border-gray-200 bg-white p-5"
        >
          <div className="h-3 w-32 rounded bg-gray-200" />
          <div className="mt-3 h-5 w-3/4 rounded bg-gray-200" />
          <div className="mt-2 h-4 w-full rounded bg-gray-100" />
          <div className="mt-1.5 h-4 w-2/3 rounded bg-gray-100" />
        </li>
      ))}
    </ul>
  );
}
