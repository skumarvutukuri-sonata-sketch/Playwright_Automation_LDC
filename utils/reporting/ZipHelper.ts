import * as fs from 'fs';
import * as path from 'path';
import archiver from 'archiver';

export class ZipHelper {

  /**
   * Zip any folder
   */
  static async zipFolder(
    sourceFolder: string,
    outputZip: string
  ): Promise<void> {

    return new Promise((resolve, reject) => {

      const outputDir = path.dirname(outputZip);

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const output = fs.createWriteStream(outputZip);

      const archive = archiver('zip', {
        zlib: { level: 9 }
      });

      output.on('close', () => {
        console.log(`📦 Zip created: ${outputZip}`);
        console.log(`📦 Total Size: ${archive.pointer()} bytes`);
        resolve();
      });

      output.on('error', reject);

      archive.on('warning', (err) => {
        console.warn(err);
      });

      archive.on('error', reject);

      archive.pipe(output);

      archive.directory(sourceFolder, false);

      archive.finalize();

    });

  }

  /**
   * Zip Allure Report
   */
  static async zipAllureReport(): Promise<string> {

    const reportFolder = path.join(
      process.cwd(),
      'allure-report'
    );

    if (!fs.existsSync(reportFolder)) {
      throw new Error(
        'Allure report folder not found.'
      );
    }

    const reportsFolder = path.join(
      process.cwd(),
      'reports'
    );

    if (!fs.existsSync(reportsFolder)) {
      fs.mkdirSync(reportsFolder, {
        recursive: true
      });
    }

    const zipPath = path.join(
      reportsFolder,
      'AllureReport.zip'
    );

    await this.zipFolder(
      reportFolder,
      zipPath
    );

    return zipPath;

  }

}