import fs from 'fs/promises';
import path from 'path';
import { format } from 'date-fns';

export class FileWriter {
  private outputDir: string;
  private fileNameTemplate: string;

  constructor(outputDir: string, fileNameTemplate: string) {
    this.outputDir = outputDir;
    this.fileNameTemplate = fileNameTemplate;
  }

  /**
   * 确保输出目录存在
   */
  async ensureOutputDir(): Promise<void> {
    try {
      await fs.access(this.outputDir);
    } catch {
      await fs.mkdir(this.outputDir, { recursive: true });
      console.log(`创建输出目录: ${this.outputDir}`);
    }
  }

  /**
   * 生成文件名
   */
  generateFileName(): string {
    const dateStr = format(new Date(), 'yyyy-MM-dd');
    return this.fileNameTemplate.replace('{date}', dateStr);
  }

  /**
   * 写入Markdown文件
   */
  async writeMarkdown(content: string): Promise<string> {
    await this.ensureOutputDir();

    const fileName = this.generateFileName();
    const filePath = path.join(this.outputDir, fileName);

    await fs.writeFile(filePath, content, 'utf8');
    console.log(`日报已保存到: ${filePath}`);

    return filePath;
  }

  /**
   * 获取输出文件路径
   */
  getOutputFilePath(): string {
    const fileName = this.generateFileName();
    return path.join(this.outputDir, fileName);
  }
}