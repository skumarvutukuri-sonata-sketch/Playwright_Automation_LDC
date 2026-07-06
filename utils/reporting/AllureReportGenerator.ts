import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export class AllureReportGenerator {

  private static readonly persistentHistoryDir = path.join(process.cwd(), 'utils', 'allure-history');

  private static copyDirectory(sourceDir: string, destinationDir: string): void {
    if (!fs.existsSync(sourceDir)) return;
    fs.mkdirSync(destinationDir, { recursive: true });
    for (const fileName of fs.readdirSync(sourceDir)) {
      const src = path.join(sourceDir, fileName);
      const dest = path.join(destinationDir, fileName);
      const stat = fs.statSync(src);
      if (stat.isDirectory()) {
        this.copyDirectory(src, dest);
      } else {
        fs.copyFileSync(src, dest);
      }
    }
  }

  private static trimArrayFile(filePath: string, maxItems = 30): void {
    if (!fs.existsSync(filePath)) return;
    try {
      const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (Array.isArray(parsed)) {
        const trimmed = parsed.slice(-maxItems);
        fs.writeFileSync(filePath, JSON.stringify(trimmed, null, 2), 'utf8');
      }
    } catch {
      // Ignore malformed history files.
    }
  }

  private static trimHistoryJson(filePath: string, maxItems = 30): void {
    if (!fs.existsSync(filePath)) return;
    try {
      const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return;

      const updated: Record<string, any> = {};
      for (const [key, value] of Object.entries(parsed)) {
        if (Array.isArray(value)) {
          updated[key] = value.slice(-maxItems);
        } else {
          updated[key] = value;
        }
      }

      fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), 'utf8');
    } catch {
      // Ignore malformed history files.
    }
  }

  private static trimPersistentHistory(maxItems = 30): void {
    if (!fs.existsSync(this.persistentHistoryDir)) return;
    this.trimArrayFile(path.join(this.persistentHistoryDir, 'history-trend.json'), maxItems);
    this.trimArrayFile(path.join(this.persistentHistoryDir, 'duration-trend.json'), maxItems);
    this.trimArrayFile(path.join(this.persistentHistoryDir, 'retry-trend.json'), maxItems);
    this.trimArrayFile(path.join(this.persistentHistoryDir, 'categories-trend.json'), maxItems);
    this.trimHistoryJson(path.join(this.persistentHistoryDir, 'history.json'), maxItems);
  }

  static generate(): void {

    const resultsDir = path.join(process.cwd(), 'allure-results');
    const allureHistoryDir = path.join(resultsDir, 'history');
    const generatedHistoryDir = path.join(process.cwd(), 'allure-report', 'history');

    // Restore previously persisted history so Allure can build trends.
    if (fs.existsSync(this.persistentHistoryDir)) {
      fs.mkdirSync(allureHistoryDir, { recursive: true });
      this.copyDirectory(this.persistentHistoryDir, allureHistoryDir);
    }

    if (!fs.existsSync(resultsDir)) {
      console.log('No allure-results folder found.');
      return;
    }

    console.log('\nGenerating Allure Report...\n');

    execSync(
      'npx allure generate allure-results --clean -o allure-report',
      {
        stdio: 'inherit'
      }
    );

    // Persist fresh history and keep only the latest 30 points.
    if (fs.existsSync(generatedHistoryDir)) {
      fs.mkdirSync(this.persistentHistoryDir, { recursive: true });
      this.copyDirectory(generatedHistoryDir, this.persistentHistoryDir);
      this.trimPersistentHistory(30);
    }

    console.log('✓ Allure Report Generated');
  }

}