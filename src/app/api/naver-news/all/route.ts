import { NextResponse } from "next/server";
import { CATEGORIES } from "@/lib/categories";
import type { NaverNewsItem } from "@/app/api/naver-news/route";

const NAVER_ENDPOINT = "https://openapi.naver.com/v1/search/news.json";
const PER_KEYWORD = 100;

export type EnrichedNewsItem = NaverNewsItem & {
  categories: string[];
};

export async function GET() {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "Naver API credentials are not configured" },
      { status: 500 },
    );
  }

  const tasks = CATEGORIES.flatMap((category) =>
    category.keywords.map((keyword) => ({
      categoryId: category.id,
      keyword,
    })),
  );

  try {
    const results = await Promise.all(
      tasks.map(async ({ categoryId, keyword }) => {
        const url = `${NAVER_ENDPOINT}?query=${encodeURIComponent(keyword)}&display=${PER_KEYWORD}&sort=date`;
        const response = await fetch(url, {
          headers: {
            "X-Naver-Client-Id": clientId,
            "X-Naver-Client-Secret": clientSecret,
          },
          next: { revalidate: 300 },
        });
        if (!response.ok) return { categoryId, items: [] as NaverNewsItem[] };
        const data = (await response.json()) as { items: NaverNewsItem[] };
        return { categoryId, items: data.items };
      }),
    );

    const byKey = new Map<string, EnrichedNewsItem>();
    for (const { categoryId, items } of results) {
      for (const item of items) {
        const key = item.originallink || item.link;
        const existing = byKey.get(key);
        if (existing) {
          if (!existing.categories.includes(categoryId)) {
            existing.categories.push(categoryId);
          }
        } else {
          byKey.set(key, { ...item, categories: [categoryId] });
        }
      }
    }

    const items = Array.from(byKey.values()).sort(
      (a, b) =>
        new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime(),
    );

    return NextResponse.json({ total: items.length, items });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch from Naver API",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 502 },
    );
  }
}
