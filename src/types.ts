export interface Article {
  title: string;
  link: string;
  pubDate: Date;
  source: string;
  description?: string;
  summary?: string; // 原始摘要（从description截取）
  aiSummary?: string; // AI生成的摘要
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
  enableAISummary: boolean;
  aiModel?: string;
  maxConcurrentAIRequests?: number;
}