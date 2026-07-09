import * as fs from 'fs';

const archiver = require('archiver');

export async function zipAllureReport(): Promise<void> {

  return new Promise((resolve, reject) => {

    const output = fs.createWriteStream('allure-report.zip');

    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    output.on('close', () => {
      console.log(`✓ Allure report zipped (${archive.pointer()} bytes)`);
      resolve();
    });

    archive.on('error', (err: Error) => {
      reject(err);
    });

    archive.pipe(output);

    archive.directory('allure-report/', false);

    archive.finalize();

  });

}