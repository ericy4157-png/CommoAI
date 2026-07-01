import { ExternalLink } from "lucide-react";
import type { NewsArticle } from "@/lib/news";
import { NEWS_CATEGORY_LABELS } from "@/lib/news";

interface NewsArticleCardProps {
  article: NewsArticle;
}

function formatRelativeTime(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export function NewsArticleCard({ article }: NewsArticleCardProps) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 transition-colors hover:border-slate-700 hover:bg-slate-900/80"
    >
      {article.imageUrl ? (
        <div className="aspect-[16/9] overflow-hidden bg-slate-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.imageUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-blue-500/15 px-2.5 py-0.5 font-medium text-blue-400">
            {NEWS_CATEGORY_LABELS[article.category]}
          </span>
          <span className="text-slate-500">{article.source}</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-500">
            {formatRelativeTime(article.publishedAt)}
          </span>
        </div>
        <h3 className="text-base font-semibold leading-snug text-white group-hover:text-blue-300">
          {article.title}
        </h3>
        {article.description ? (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-400">
            {article.description}
          </p>
        ) : null}
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-blue-400">
          Read article
          <ExternalLink className="h-3.5 w-3.5" />
        </span>
      </div>
    </a>
  );
}
