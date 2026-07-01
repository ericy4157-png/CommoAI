export type NewsCategory =
  | "market_shock"
  | "supply_chain"
  | "geopolitical"
  | "natural_disaster";

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  category: NewsCategory;
  imageUrl?: string;
}

export interface MarketNewsResponse {
  articles: NewsArticle[];
  fetchedAt: string;
  source: "currents" | "rss";
  categories: Record<NewsCategory, number>;
}

interface NewsCategoryConfig {
  id: NewsCategory;
  label: string;
  keywords: string;
  matchers: RegExp;
}

const CATEGORY_CONFIG: NewsCategoryConfig[] = [
  {
    id: "market_shock",
    label: "Market Shocks",
    keywords: "oil crude commodity OPEC sanctions stock market crash",
    matchers:
      /\b(oil|crude|commodit|opec|sanction|stock market|market crash|wti|brent|energy price|inflation|fed|interest rate)\b/i,
  },
  {
    id: "supply_chain",
    label: "Supply Chain",
    keywords: "supply chain shipping port logistics freight disruption",
    matchers:
      /\b(supply chain|shipping|freight|logistics|port|canal|cargo|warehouse|shortage|backlog|container)\b/i,
  },
  {
    id: "geopolitical",
    label: "Wars & Geopolitics",
    keywords: "war conflict military invasion missile strike geopolitical",
    matchers:
      /\b(war|conflict|military|invasion|missile|strike|troops|geopolit|sanction|nato|ceasefire|airstrike|bombing)\b/i,
  },
  {
    id: "natural_disaster",
    label: "Natural Disasters",
    keywords: "earthquake hurricane flood wildfire tsunami drought cyclone",
    matchers:
      /\b(earthquake|hurricane|flood|wildfire|tsunami|drought|cyclone|typhoon|tornado|landslide|volcano|storm)\b/i,
  },
];

const RSS_FEEDS = [
  { name: "BBC World", url: "http://feeds.bbci.co.uk/news/world/rss.xml" },
  { name: "BBC Business", url: "http://feeds.bbci.co.uk/news/business/rss.xml" },
  { name: "NPR World", url: "https://feeds.npr.org/1004/rss.xml" },
];

const ARTICLES_PER_CATEGORY = 6;

interface CurrentsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  author?: string;
  image?: string;
  published: string;
}

function normalizeImageUrl(image?: string): string | undefined {
  if (!image || image === "None") return undefined;
  if (image.startsWith("//")) return `https:${image}`;
  return image;
}

function classifyArticle(
  title: string,
  description: string,
): NewsCategory | null {
  const text = `${title} ${description}`;
  for (const config of CATEGORY_CONFIG) {
    if (config.matchers.test(text)) return config.id;
  }
  return null;
}

function dedupeArticles(articles: NewsArticle[]): NewsArticle[] {
  const seen = new Set<string>();
  return articles.filter((article) => {
    const key = article.url || article.title.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sortByDate(articles: NewsArticle[]): NewsArticle[] {
  return [...articles].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

function countByCategory(
  articles: NewsArticle[],
): Record<NewsCategory, number> {
  return {
    market_shock: articles.filter((a) => a.category === "market_shock").length,
    supply_chain: articles.filter((a) => a.category === "supply_chain").length,
    geopolitical: articles.filter((a) => a.category === "geopolitical").length,
    natural_disaster: articles.filter((a) => a.category === "natural_disaster")
      .length,
  };
}

async function fetchCurrentsCategory(
  apiKey: string,
  config: NewsCategoryConfig,
): Promise<NewsArticle[]> {
  const params = new URLSearchParams({
    language: "en",
    keywords: config.keywords,
  });

  const res = await fetch(
    `https://api.currentsapi.services/v1/search?${params.toString()}`,
    {
      headers: { Authorization: apiKey },
      next: { revalidate: 1800 },
    },
  );

  if (!res.ok) {
    throw new Error(`Currents API error (${res.status}) for ${config.id}`);
  }

  const data = (await res.json()) as {
    status: string;
    news?: CurrentsArticle[];
  };

  if (data.status !== "ok" || !data.news) return [];

  return data.news
    .slice(0, ARTICLES_PER_CATEGORY)
    .map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description?.replace(/\s+/g, " ").trim() ?? "",
      url: item.url,
      source: item.author ?? "Currents",
      publishedAt: new Date(item.published).toISOString(),
      category: config.id,
      imageUrl: normalizeImageUrl(item.image),
    }))
    .filter((article) => article.title && article.url);
}

async function fetchFromCurrents(apiKey: string): Promise<NewsArticle[]> {
  const results = await Promise.all(
    CATEGORY_CONFIG.map((config) => fetchCurrentsCategory(apiKey, config)),
  );
  return sortByDate(dedupeArticles(results.flat()));
}

function extractXmlTag(block: string, tag: string): string {
  const cdata = new RegExp(
    `<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`,
    "i",
  ).exec(block);
  if (cdata?.[1]) return cdata[1].trim();

  const plain = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "i").exec(block);
  if (!plain?.[1]) return "";
  return plain[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim();
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

async function fetchRssFeed(
  feedUrl: string,
  sourceName: string,
): Promise<NewsArticle[]> {
  let res: Response;
  try {
    res = await fetch(feedUrl, { next: { revalidate: 1800 } });
  } catch {
    return [];
  }
  if (!res.ok) return [];

  const xml = await res.text();
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)];

  const articles: NewsArticle[] = [];

  for (const match of items) {
    const block = match[1];
    const title = stripHtml(extractXmlTag(block, "title"));
    const url = extractXmlTag(block, "link");
    const description = stripHtml(extractXmlTag(block, "description"));
    const pubDate = extractXmlTag(block, "pubDate");

    if (!title || !url) continue;

    const category = classifyArticle(title, description);
    if (!category) continue;

    articles.push({
      id: `${sourceName}-${url}`,
      title,
      description,
      url,
      source: sourceName,
      publishedAt: pubDate
        ? new Date(pubDate).toISOString()
        : new Date().toISOString(),
      category,
    });
  }

  return articles;
}

async function fetchFromRss(): Promise<NewsArticle[]> {
  const results = await Promise.all(
    RSS_FEEDS.map((feed) => fetchRssFeed(feed.url, feed.name)),
  );

  const grouped = new Map<NewsCategory, NewsArticle[]>();
  for (const config of CATEGORY_CONFIG) {
    grouped.set(config.id, []);
  }

  for (const article of sortByDate(dedupeArticles(results.flat()))) {
    const list = grouped.get(article.category);
    if (list && list.length < ARTICLES_PER_CATEGORY) {
      list.push(article);
    }
  }

  return sortByDate([...grouped.values()].flat());
}

export async function getMarketNews(): Promise<MarketNewsResponse> {
  const apiKey = process.env.CURRENTS_API_KEY;
  const fetchedAt = new Date().toISOString();

  if (apiKey) {
    try {
      const articles = await fetchFromCurrents(apiKey);
      if (articles.length > 0) {
        return {
          articles,
          fetchedAt,
          source: "currents",
          categories: countByCategory(articles),
        };
      }
    } catch {
      // Fall through to RSS if Currents fails or returns empty.
    }
  }

  const articles = await fetchFromRss();
  return {
    articles,
    fetchedAt,
    source: "rss",
    categories: countByCategory(articles),
  };
}

export const NEWS_CATEGORY_LABELS: Record<NewsCategory, string> =
  Object.fromEntries(
    CATEGORY_CONFIG.map((c) => [c.id, c.label]),
  ) as Record<NewsCategory, string>;

export const NEWS_CATEGORY_ORDER: NewsCategory[] = CATEGORY_CONFIG.map(
  (c) => c.id,
);
