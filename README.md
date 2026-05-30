# AI新闻聚合CLI工具

一个用于生成AI领域新闻日报的命令行工具，从多个RSS源聚合最近24小时的AI相关文章。

## 功能特性

- 📡 从三个主流RSS源获取AI新闻
  - TechCrunch AI
  - The Verge AI  
  - Hacker News (前30条AI相关)
- ⏰ 自动过滤最近24小时的文章
- 📊 按时间倒序排序
- 📝 生成格式化的Markdown日报
- 📈 包含统计信息（总文章数、来源分布）
- 🔍 每篇文章包含标题、链接、发布时间和摘要

## 安装

```bash
# 克隆项目
git clone <repository-url>
cd ai-news-digest

# 安装依赖
npm install
```

## 使用

```bash
# 运行工具
npm run digest

# 或直接使用tsx
npx tsx src/index.ts
```

## 输出示例

运行后会在 `output/` 目录下生成类似 `ai-news-2026-05-29.md` 的文件：

```markdown
# AI新闻日报 (2026-05-29)

**统计**: 共 15 篇文章，来自 3 个源
**来源分布**: TechCrunch AI: 5, The Verge AI: 6, Hacker News: 4
**时间范围**: 2026-05-28 10:00:00 - 2026-05-29 10:00:00

---

## TechCrunch AI (5)

### [OpenAI发布新一代语言模型](https://example.com)
发布时间: 2026-05-29 09:30:00
摘要: OpenAI今天发布了新一代语言模型GPT-5，该模型在多个基准测试中表现优异...

### [Google DeepMind突破性研究](https://example.com)
发布时间: 2026-05-29 08:15:00
摘要: Google DeepMind的研究人员在强化学习领域取得重大突破...

...

## The Verge AI (6)

...

## Hacker News (4)

...

---
*生成时间: 2026-05-29 10:00:00*
*数据源: TechCrunch AI, The Verge AI, Hacker News*
```

## 项目结构

```
ai-news-digest/
├── src/
│   ├── index.ts          # 主入口
│   ├── types.ts          # 类型定义
│   ├── fetcher.ts        # RSS数据获取
│   ├── filter.ts         # 过滤和排序
│   ├── formatter.ts      # Markdown格式化
│   ├── writer.ts         # 文件输出
│   └── config.ts         # 配置管理
├── output/               # 生成的日报文件
├── package.json
├── tsconfig.json
└── README.md
```

## 配置

可在 `src/config.ts` 中修改配置：

```typescript
export const RSS_SOURCES = [
  // 可以添加或修改RSS源
  {
    name: 'TechCrunch AI',
    url: 'https://techcrunch.com/category/artificial-intelligence/feed/',
  },
  // ...
];

export const CONFIG = {
  outputDir: './output',      // 输出目录
  hoursAgo: 24,               // 时间范围（小时）
  maxSummaryLength: 100,      // 摘要最大长度
  // ...
};
```

## 技术栈

- **TypeScript** - 类型安全
- **tsx** - TypeScript运行时
- **axios** - HTTP客户端
- **rss-parser** - RSS解析
- **date-fns** - 日期处理

## 扩展建议

1. **添加更多RSS源**：在 `config.ts` 的 `RSS_SOURCES` 数组中添加
2. **支持自定义输出格式**：扩展 `formatter.ts`
3. **添加定时任务**：使用cron定时运行
4. **添加通知功能**：发送到Slack/Email等
5. **数据持久化**：保存历史记录到数据库

## 许可证

MIT