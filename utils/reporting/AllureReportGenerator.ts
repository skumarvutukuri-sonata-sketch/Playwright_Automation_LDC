import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export class AllureReportGenerator {

  static generate(): void {

    const resultsDir = path.join(process.cwd(), 'allure-results');

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

    console.log('✓ Allure Report Generated');
  }

}