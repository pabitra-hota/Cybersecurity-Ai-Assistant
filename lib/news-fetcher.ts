// ============================================================
// CyberShield AI — RSS News Fetcher
// ============================================================

import { XMLParser } from 'fast-xml-parser';

export interface RawNewsItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
}

const RSS_FEEDS = [
  'https://feeds.feedburner.com/TheHackersNews',
  'https://www.bleepingcomputer.com/feed/',
  'https://feeds.feedburner.com/Securityweek',
  'https://krebsonsecurity.com/feed/',
];

const parser = new XMLParser({
  ignoreAttributes: false,
  parseTagValue: true,
  trimValues: true,
});

/**
 * Parse RSS XML into normalized news items
 */
function parseRSSFeed(xml: string): RawNewsItem[] {
  try {
    const parsed = parser.parse(xml);
    const channel = parsed?.rss?.channel;
    if (!channel) return [];

    const items = Array.isArray(channel.item) ? channel.item : [channel.item].filter(Boolean);

    return items.map((item: Record<string, string>) => ({
      title: (item.title || '').toString().trim(),
      description: stripHtml((item.description || item['content:encoded'] || '').toString()).slice(0, 500),
      link: (item.link || '').toString().trim(),
      pubDate: (item.pubDate || '').toString().trim(),
    })).filter((item: RawNewsItem) => item.title && item.link);
  } catch (error) {
    console.error('RSS parse error:', error);
    return [];
  }
}

/**
 * Strip HTML tags from string
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
}

/**
 * Fetch all RSS feeds in parallel, return top N items
 */
export async function fetchAllNews(limit = 15): Promise<RawNewsItem[]> {
  const results = await Promise.allSettled(
    RSS_FEEDS.map(async (feedUrl) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      try {
        const response = await fetch(feedUrl, {
          signal: controller.signal,
          headers: { 'User-Agent': 'CyberShield-AI/1.0' },
        });
        clearTimeout(timeout);

        if (!response.ok) return [];
        const xml = await response.text();
        return parseRSSFeed(xml);
      } catch {
        clearTimeout(timeout);
        return [];
      }
    })
  );

  const allItems: RawNewsItem[] = [];

  for (const result of results) {
    if (result.status === 'fulfilled') {
      allItems.push(...result.value);
    }
  }

  // Sort by date (most recent first) and deduplicate by title
  const seen = new Set<string>();
  const unique = allItems
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
    .filter((item) => {
      const key = item.title.toLowerCase().slice(0, 50);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  return unique.slice(0, limit);
}
