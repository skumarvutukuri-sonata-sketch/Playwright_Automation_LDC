import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

export class EnvironmentHelper {

  /**
   * Generate Allure Environment File
   */
  static generate(): void {

    const outputDir = path.join(
      process.cwd(),
      'allure-results'
    );

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const environment = [
      `Browser=Chromium`,
      `Framework=Playwright`,
      `Node=${process.version}`,
      `OS=${os.platform()}`,
      `OS Version=${os.release()}`,
      `Architecture=${os.arch()}`,
      `Execution Date=${new Date().toLocaleString()}`,
      `Environment=${process.env.NODE_ENV ?? 'development'}`
    ].join('\n');

    fs.writeFileSync(
      path.join(outputDir, 'environment.properties'),
      environment,
      'utf8'
    );
  }

}