#!/usr/bin/env node

import { RssFetcher } from './fetcher';
import { ArticleFilter } from './filter';
import { MarkdownFormatter } from './formatter';
import { FileWriter } from './writer';
import cron from 'node-cron';
import { AISummarizer } from './summarizer';
import { RSS_SOURCES, CONFIG } from './config';

async function runDigest() {
  console.log('🚀 开始生成AI新闻日报...');

  try {
    // 1. 初始化组件
    const fetcher = new RssFetcher();
    const filter = new ArticleFilter();
    const formatter = new MarkdownFormatter(CONFIG.maxSummaryLength);
    const writer = new FileWriter(CONFIG.outputDir, CONFIG.fileNameTemplate);

    // 2. 获取所有文章
    console.log('📡 正在从RSS源获取文章...');
    const allArticles = await fetcher.fetchAll(RSS_SOURCES);

    if (allArticles.length === 0) {
      console.log('⚠️  未获取到任何文章，请检查网络连接或RSS源');
      process.exit(1);
    }

    // 3. 过滤和排序
    console.log('🔍 过滤最近24小时的文章...');
    const recentArticles = filter.filterRecentArticles(allArticles, CONFIG.hoursAgo);

    console.log('🔗 基于URL去重...');
    const dedupedArticles = filter.deduplicateByUrl(recentArticles);
    console.log(`   去重前: ${recentArticles.length}篇, 去重后: ${dedupedArticles.length}篇`);

    const sortedArticles = filter.sortByDate(dedupedArticles);

    if (sortedArticles.length === 0) {
      console.log(`⚠️  最近${CONFIG.hoursAgo}小时内没有新文章`);
      process.exit(0);
    }

    // 4. AI摘要生成（如果启用）
    let articlesWithAI = sortedArticles;
    if (CONFIG.enableAISummary) {
      try {
        console.log('🤖 AI摘要功能已启用，正在检查API key...');

        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
          console.warn('⚠️ ANTHROPIC_API_KEY环境变量未设置，跳过AI摘要功能');
          console.warn('   请设置环境变量: export ANTHROPIC_API_KEY="your-api-key"');
        } else {
          const summarizer = new AISummarizer({
            apiKey,
            model: CONFIG.aiModel,
            maxConcurrent: CONFIG.maxConcurrentAIRequests,
          });

          console.log(`🔑 API key已读取，开始为${sortedArticles.length}篇文章生成AI摘要...`);

          const aiSummaries = await summarizer.summarizeArticles(sortedArticles);

          articlesWithAI = sortedArticles.map(article => ({
            ...article,
            aiSummary: aiSummaries.get(article.link)
          }));

          const successCount = Array.from(aiSummaries.values()).filter(Boolean).length;
          console.log(`✅ AI摘要生成完成: ${successCount}/${sortedArticles.length}篇文章成功`);
        }
      } catch (error) {
        console.warn('⚠️ AI摘要生成失败，使用原始摘要:', error instanceof Error ? error.message : '未知错误');
        articlesWithAI = sortedArticles; // 回退到原始文章
      }
    } else {
      console.log('⏭️ AI摘要功能已禁用，使用原始摘要');
    }

    // 5. 统计信息
    const stats = filter.getStats(articlesWithAI);
    console.log(`📊 统计: 共${stats.total}篇文章，来自${stats.sources}个源`);

    // 6. 生成Markdown
    console.log('📝 生成Markdown格式...');
    const markdownContent = formatter.generateDigest(articlesWithAI, stats, CONFIG.hoursAgo);

    // 6. 写入文件
    const outputPath = await writer.writeMarkdown(markdownContent);

    console.log('✅ AI新闻日报生成完成！');
    console.log(`📄 文件位置: ${outputPath}`);
    console.log(`📈 文章统计: 共${stats.total}篇，来源: ${Object.entries(stats.sourceCounts)
      .map(([source, count]) => `${source}(${count})`)
      .join(', ')}`);

  } catch (error) {
    console.error('❌ 生成失败:', error instanceof Error ? error.message : '未知错误');
    console.error(error);
    process.exit(1);
  }
}

function main() {
  const isCronMode = process.argv.includes('--cron');

  if (!isCronMode) {
    runDigest();
    return;
  }

  console.log('⏰ Cron模式已启动，将在每天早上8点自动生成AI新闻日报');
  cron.schedule('0 8 * * *', () => {
    runDigest();
  });
}

if (require.main === module) {
  main();
}

export { main, runDigest };