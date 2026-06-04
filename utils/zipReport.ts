
import * as fs from 'fs';

const archiver: any = require('archiver');

export function zipAllureReport(): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream('allure-report.zip');
    const archive = new archiver.ZipArchive({ zlib: { level: 9 } });

    output.on('close', () => {
      console.log(`Zip created: ${archive.pointer()} bytes`);
      resolve();
    });

    archive.on('error', (err: Error) => reject(err));

    archive.pipe(output);
    archive.directory('allure-report/', false);

    archive.finalize();
  });
}
