import * as fs from 'fs';
import * as path from 'path';

async function globalSetup(): Promise<void> {

  console.log('\n========================================');
  console.log('Cleaning Previous Reports...');
  console.log('========================================');

  const folders = [
    'allure-results',
    'allure-report',
    'playwright-report',
    'test-results',
    'reports'
  ];

  for (const folder of folders) {

    const folderPath = path.join(process.cwd(), folder);

    if (fs.existsSync(folderPath)) {
      fs.rmSync(folderPath, {
        recursive: true,
        force: true
      });

      console.log(`✓ Deleted ${folder}`);
    }

  }

  console.log('\n✓ Cleanup completed.\n');

  const reportsFolder = path.join(process.cwd(), 'reports');

    if (!fs.existsSync(reportsFolder)) {
        fs.mkdirSync(reportsFolder, { recursive: true });
    }

    fs.writeFileSync(
        path.join(reportsFolder, 'start-time.txt'),
        new Date().toISOString()
    );

  console.log('✓ Start time created\n');

}


export default globalSetup;