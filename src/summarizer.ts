import { Article } from './types';
import Anthropic from '@anthropic-ai/sdk';

export interface SummarizerConfig {
  apiKey?: string;
  model?: string;
  maxConcurrent?: number;
}

export class AISummarizer {
  private client: Anthropic;
  private config: Required<SummarizerConfig>;

  constructor(config: SummarizerConfig = {}) {
    const apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required for AI summarization');
    }

    this.client = new Anthropic({
      apiKey,
    });

    this.config = {
      apiKey,
      model: config.model || 'claude-opus-4-7',
      maxConcurrent: config.maxConcurrent || 3,
    };
  }

  async summarizeArticle(article: Article): Promise<string> {
    const { title, description } = article;
    const plainDescription = this.cleanDescription(description);

    try {
      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: 120,
        messages: [
          {
            role: 'user',
            content: `请基于标题和description，用中文生成一句话新闻摘要。只输出摘要，不要添加前缀、引号或项目符号。\n\n标题：${title}\ndescription：${plainDescription || '无'}`,
          },
        ],
      });

      const textBlock = response.content.find((block) => block.type === 'text');
      const summary = textBlock?.text.trim() ?? '';

      if (!summary) {
        throw new Error('AI摘要生成失败：返回空内容');
      }

      return summary;
    } catch (error) {
      console.error(`为文章生成AI摘要失败: "${title}"`, error instanceof Error ? error.message : '未知错误');
      throw error;
    }
  }

  /**
   * 批量生成文章摘要（带并发控制）
   */
  async summarizeArticles(articles: Article[]): Promise<Map<string, string>> {
    console.log(`🤖 正在为 ${articles.length} 篇文章生成AI摘要...`);

    const results = new Map<string, string>();
    const errors: string[] = [];

    // 使用简单的并发控制
    const chunks = this.chunkArray(articles, this.config.maxConcurrent);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(`  处理批次 ${i + 1}/${chunks.length} (${chunk.length}篇文章)...`);

      const promises = chunk.map(async (article) => {
        try {
          const summary = await this.summarizeArticle(article);
          results.set(article.link, summary);
          return { success: true, article };
        } catch (error) {
          errors.push(`"${article.title}": ${error instanceof Error ? error.message : '未知错误'}`);
          return { success: false, article };
        }
      });

      await Promise.all(promises);
    }

    if (errors.length > 0) {
      console.warn(`⚠️  ${errors.length} 篇文章的AI摘要生成失败，将使用原始摘要`);
      console.warn(`   失败原因: ${errors.slice(0, 3).join('; ')}${errors.length > 3 ? '...' : ''}`);
    }

    console.log(`✅ AI摘要生成完成: ${results.size}/${articles.length} 篇文章成功`);
    return results;
  }

  private cleanDescription(description?: string): string {
    return (description ?? '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * 将数组分块
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
}