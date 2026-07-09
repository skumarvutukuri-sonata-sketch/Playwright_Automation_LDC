const fs = require('fs');
const path = require('path');

const folders = [
  'allure-results',
  'allure-report',
  'playwright-report',
  'test-results',
  'reports'
];

console.log('\nCleaning previous reports...\n');

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

console.log('\nCleanup completed.\n');