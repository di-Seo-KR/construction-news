"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { NewsResponseItem } from "@/app/api/news/route";
import { filterFeatured, type TimeRange } from "@/lib/featured";
import { NewsCard } from "@/components/NewsCard";

export default function FeaturedListClient() {
  const [items, setItems] = useState<NewsResponseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<TimeRange>("daily");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    fetch("/api/news", { signal: controller.signal })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "요청 실패");
        return json;
      })
      .then((json) => setItems(json.items ?? []))
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "오류가 발생했습니다");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  const featured = useMemo(
    () => filterFeatured(items, range, 50),
    [items, range],
  );

  return (
    <div className="space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        ← 메인으로
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            주요 뉴스
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {range === "daily" ? "지난 24시간" : "지난 7일"} 핵심 키워드 이슈
            (최대 50건)
          </p>
        </div>
        <div className="inline-flex rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setRange("daily")}
            className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${
              range === "daily"
                ? "bg-white text-gray-900 shadow-sm ring-1 ring-[#FFB81C]/40"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            일간
          </button>
          <button
            onClick={() => setRange("weekly")}
            className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${
              range === "weekly"
                ? "bg-white text-gray-900 shadow-sm ring-1 ring-[#FFB81C]/40"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            주간
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5"
            >
              <div className="h-3 w-32 rounded bg-gray-200" />
              <div className="mt-3 h-5 w-3/4 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      ) : featured.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center text-sm text-gray-500">
          표시할 주요 뉴스가 없습니다.
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-sm text-gray-500">총 {featured.length}건</div>
          {featured.map((item) => (
            <NewsCard key={item.link} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
