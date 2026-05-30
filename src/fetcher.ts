import axios from 'axios';
import Parser from 'rss-parser';
import { Article, RssSource } from './types';

const parser = new Parser();

export class RssFetcher {
  /**
   * 从单个RSS源获取文章
   */
  async fetchFromSource(source: RssSource): Promise<Article[]> {
    try {
      console.log(`正在获取 ${source.name}...`);

      const response = await axios.get(source.url, {
        timeout: 10000, // 10秒超时
        headers: {
          'User-Agent': 'AI-News-Digest/1.0',
        },
      });

      const feed = await parser.parseString(response.data);
      const articles: Article[] = [];

      for (const item of feed.items) {
        if (!item.title || !item.link) {
          continue; // 跳过无效条目
        }

        const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();

        articles.push({
          title: item.title.trim(),
          link: item.link,
          pubDate,
          source: source.name,
          description: item.contentSnippet || item.content || item.summary,
        });
      }

      console.log(`从 ${source.name} 获取到 ${articles.length} 篇文章`);
      return articles;
    } catch (error) {
      console.error(`获取 ${source.name} 失败:`, error instanceof Error ? error.message : '未知错误');
      return []; // 返回空数组，不中断整个流程
    }
  }

  /**
   * 并发获取所有RSS源的文章
   */
  async fetchAll(sources: RssSource[]): Promise<Article[]> {
    const promises = sources.map(source => this.fetchFromSource(source));
    const results = await Promise.all(promises);

    // 展平所有文章
    return results.flat();
  }
}