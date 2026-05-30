import { RssSource, DigestConfig } from './types';

export const RSS_SOURCES: RssSource[] = [
  {
    name: 'TechCrunch AI',
    url: 'https://techcrunch.com/category/artificial-intelligence/feed/',
  },
  {
    name: 'The Verge AI',
    url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml',
  },
  {
    name: 'Hacker News',
    url: 'https://hnrss.org/newest?q=AI&count=30',
  },
];

export const CONFIG: DigestConfig = {
  outputDir: './output',
  hoursAgo: 24,
  dateFormat: 'yyyy-MM-dd',
  fileNameTemplate: 'ai-news-{date}.md',
  maxSummaryLength: 100,
};