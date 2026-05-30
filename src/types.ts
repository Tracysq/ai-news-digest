export interface Article {
  title: string;
  link: string;
  pubDate: Date;
  source: string;
  description?: string;
  summary?: string;
}

export interface RssSource {
  name: string;
  url: string;
}

export interface DigestConfig {
  outputDir: string;
  hoursAgo: number;
  dateFormat: string;
  fileNameTemplate: string;
  maxSummaryLength: number;
}