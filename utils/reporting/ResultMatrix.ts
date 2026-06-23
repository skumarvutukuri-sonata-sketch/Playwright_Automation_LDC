import { FormExecutionResult } from './ReportTypes';
import * as fs from 'fs';
import * as path from 'path';

export class ResultMatrix {

  private static readonly reportDir = path.join(process.cwd(), 'reports');
  private static readonly filePath = path.join(
    ResultMatrix.reportDir,
    'result-matrix.csv'
  );

  /**
   * Ensure reports folder and CSV exist
   */
  private static initialize(): void {

    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true });
    }

    if (!fs.existsSync(this.filePath)) {

      const header =
        'Group,Form,Mode,Status,Duration(ms),Start Time,End Time,Error\n';

      fs.writeFileSync(this.filePath, header, 'utf8');
    }
  }

  /**
   * Append one execution result
   */
  static add(result: FormExecutionResult): void {

    this.initialize();

    const row = [

      result.group,

      result.formName,

      result.mode,

      result.status,

      result.duration,

      result.startTime.toISOString(),

      result.endTime.toISOString(),

      result.error ?? ''

    ].join(',') + '\n';

    fs.appendFileSync(this.filePath, row, 'utf8');

    console.log(`✓ Result written : ${result.formName}`);
  }

  /**
   * CSV path
   */
  static getFilePath(): string {
    this.initialize();
    return this.filePath;
  }

}