#!/usr/bin/env node

import { RssFetcher } from './fetcher';
import { ArticleFilter } from './filter';
import { MarkdownFormatter } from './formatter';
import { FileWriter } from './writer';
import { RSS_SOURCES, CONFIG } from './config';

async function main() {
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
    const sortedArticles = filter.sortByDate(recentArticles);

    if (sortedArticles.length === 0) {
      console.log(`⚠️  最近${CONFIG.hoursAgo}小时内没有新文章`);
      process.exit(0);
    }

    // 4. 统计信息
    const stats = filter.getStats(sortedArticles);
    console.log(`📊 统计: 共${stats.total}篇文章，来自${stats.sources}个源`);

    // 5. 生成Markdown
    console.log('📝 生成Markdown格式...');
    const markdownContent = formatter.generateDigest(sortedArticles, stats, CONFIG.hoursAgo);

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

// 如果是直接运行，则执行main函数
if (require.main === module) {
  main();
}

export { main };