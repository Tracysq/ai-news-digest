import { Article } from './types';
import { format, subHours } from 'date-fns';

export class MarkdownFormatter {
  private maxSummaryLength: number;

  constructor(maxSummaryLength: number = 100) {
    this.maxSummaryLength = maxSummaryLength;
  }

  /**
   * 生成摘要（截取前N个字符）
   */
  generateSummary(description?: string): string | undefined {
    if (!description) {
      return undefined;
    }

    // 移除HTML标签和换行符
    const plainText = description
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (plainText.length <= this.maxSummaryLength) {
      return plainText;
    }

    return plainText.substring(0, this.maxSummaryLength) + '...';
  }

  /**
   * 获取文章的最佳可用摘要
   */
  getArticleSummary(article: Article): string | undefined {
    // 优先使用AI生成的摘要
    if (article.aiSummary) {
      return article.aiSummary;
    }

    // 其次使用原始摘要
    if (article.summary) {
      return article.summary;
    }

    // 最后从description生成摘要
    return this.generateSummary(article.description);
  }

  /**
   * 格式化单篇文章为Markdown
   */
  formatArticle(article: Article): string {
    const lines: string[] = [];

    lines.push(`### [${article.title}](${article.link})`);
    lines.push(`发布时间: ${format(article.pubDate, 'yyyy-MM-dd HH:mm:ss')}`);

    const summary = this.getArticleSummary(article);
    if (summary) {
      lines.push(`摘要: ${summary}`);
    }

    lines.push(''); // 空行分隔

    return lines.join('\n');
  }

  /**
   * 格式化一组文章（按来源分组）
   */
  formatSourceGroup(sourceName: string, articles: Article[]): string {
    const lines: string[] = [];

    lines.push(`## ${sourceName} (${articles.length})`);
    lines.push('');

    for (const article of articles) {
      lines.push(this.formatArticle(article));
    }

    return lines.join('\n');
  }

  /**
   * 生成完整的日报Markdown
   */
  generateDigest(
    articles: Article[],
    stats: { total: number; sources: number; sourceCounts: Record<string, number> },
    hoursAgo: number
  ): string {
    const now = new Date();
    const startTime = subHours(now, hoursAgo);
    const dateStr = format(now, 'yyyy-MM-dd');

    const lines: string[] = [];

    // 标题
    lines.push(`# AI新闻日报 (${dateStr})`);
    lines.push('');

    // 统计信息
    lines.push(`**统计**: 共 ${stats.total} 篇文章，来自 ${stats.sources} 个源`);

    // 各源数量统计
    const sourceCountsText = Object.entries(stats.sourceCounts)
      .map(([source, count]) => `${source}: ${count}`)
      .join(', ');
    lines.push(`**来源分布**: ${sourceCountsText}`);

    lines.push(`**时间范围**: ${format(startTime, 'yyyy-MM-dd HH:mm:ss')} - ${format(now, 'yyyy-MM-dd HH:mm:ss')}`);
    lines.push('');

    lines.push('---');
    lines.push('');

    // 按来源分组显示文章
    const sourceMap = new Map<string, Article[]>();
    for (const article of articles) {
      if (!sourceMap.has(article.source)) {
        sourceMap.set(article.source, []);
      }
      sourceMap.get(article.source)!.push(article);
    }

    for (const [sourceName, sourceArticles] of sourceMap) {
      lines.push(this.formatSourceGroup(sourceName, sourceArticles));
      lines.push(''); // 来源间空行
    }

    // 页脚
    lines.push('---');
    lines.push(`*生成时间: ${format(now, 'yyyy-MM-dd HH:mm:ss')}*`);
    lines.push(`*数据源: ${Object.keys(stats.sourceCounts).join(', ')}*`);

    return lines.join('\n');
  }
}