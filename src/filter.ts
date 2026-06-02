import { Article } from './types';
import { subHours } from 'date-fns';

export class ArticleFilter {
  /**
   * 过滤最近N小时的文章
   */
  filterRecentArticles(articles: Article[], hoursAgo: number): Article[] {
    const cutoffTime = subHours(new Date(), hoursAgo);

    return articles.filter(article => {
      return article.pubDate >= cutoffTime;
    });
  }

  /**
   * 按发布时间倒序排序
   */
  sortByDate(articles: Article[]): Article[] {
    return [...articles].sort((a, b) => {
      return b.pubDate.getTime() - a.pubDate.getTime();
    });
  }

  /**
   * 基于URL去重，保留发布时间最新的一篇
   */
  deduplicateByUrl(articles: Article[]): Article[] {
    const map = new Map<string, Article>();
    for (const article of articles) {
      const existing = map.get(article.link);
      if (!existing || article.pubDate > existing.pubDate) {
        map.set(article.link, article);
      }
    }
    return Array.from(map.values());
  }

  /**
   * 按来源分组
   */
  groupBySource(articles: Article[]): Record<string, Article[]> {
    const groups: Record<string, Article[]> = {};

    for (const article of articles) {
      if (!groups[article.source]) {
        groups[article.source] = [];
      }
      groups[article.source].push(article);
    }

    return groups;
  }

  /**
   * 统计文章信息
   */
  getStats(articles: Article[]): {
    total: number;
    sources: number;
    sourceCounts: Record<string, number>;
  } {
    const sourceSet = new Set<string>();
    const sourceCounts: Record<string, number> = {};

    for (const article of articles) {
      sourceSet.add(article.source);
      sourceCounts[article.source] = (sourceCounts[article.source] || 0) + 1;
    }

    return {
      total: articles.length,
      sources: sourceSet.size,
      sourceCounts,
    };
  }
}