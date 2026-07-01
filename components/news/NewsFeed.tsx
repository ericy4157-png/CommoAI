"use client";

import { useMemo, useState } from "react";
import type { MarketNewsResponse, NewsCategory } from "@/lib/news";
import { NEWS_CATEGORY_LABELS, NEWS_CATEGORY_ORDER } from "@/lib/news";
import { NewsArticleCard } from "./NewsArticleCard";

interface NewsFeedProps {
  data: MarketNewsResponse;
}

type FilterValue = "all" | NewsCategory;

const FILTER_OPTIONS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All" },
  ...NEWS_CATEGORY_ORDER.map((id) => ({
    value: id,
    label: NEWS_CATEGORY_LABELS[id],
  })),
];

export function NewsFeed({ data }: NewsFeedProps) {
  const [filter, setFilter] = useState<FilterValue>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return data.articles;
    return data.articles.filter((article) => article.category === filter);
  }, [data.articles, filter]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        {FILTER_OPTIONS.map((option) => {
          const count =
            option.value === "all"
              ? data.articles.length
              : data.categories[option.value];
          const active = filter === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilter(option.value)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-600 text-white"
                  : "border border-slate-700 bg-slate-900/50 text-slate-300 hover:border-slate-600 hover:text-white"
              }`}
            >
              {option.label}
              <span className="ml-1.5 opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/30 px-6 py-16 text-center">
          <p className="text-lg font-medium text-slate-300">No articles found</p>
          <p className="mt-2 text-sm text-slate-500">
            Try another category or check back later for new headlines.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((article) => (
            <NewsArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
