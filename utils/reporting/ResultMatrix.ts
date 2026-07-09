import * as fs from 'fs';
import * as path from 'path';
import Papa from 'papaparse'; // Safe parsing to track unique row states

export class ResultMatrix {

  private static readonly reportDir = path.join(process.cwd(), 'reports');
  private static readonly filePath = path.join(ResultMatrix.reportDir, 'result-matrix.csv');

  /**
   * Ensure reports folder and CSV exist with unified columns
   */
  private static initialize(): void {
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true });
    }

    if (!fs.existsSync(this.filePath)) {
      // 🚀 UPDATED COLUMNS: Unified tracking keys on a single row layout
      const header = 'Date,Group,Form,Positive_Status,Positive_Duration(sec),Positive_TC_Total,Positive_TC_Passed,Positive_TC_Failed,Negative_Status,Negative_Duration(sec),Negative_TC_Total,Negative_TC_Passed,Negative_TC_Failed,Error\n';
      fs.writeFileSync(this.filePath, header, 'utf8');
    }
  }

  /**
   * Append or update execution results in a single structured row
   */
  static add(result: any): void {
    this.initialize();

    const fileContent = fs.readFileSync(this.filePath, 'utf8');
    const parsed = Papa.parse(fileContent, { header: true, skipEmptyLines: true });
    const records: any[] = parsed.data;

    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');
    
    // 🚀 THE FIX: Convert duration into seconds with two decimals
    const durationSec = (result.duration / 1000).toFixed(2);

    // Filter to find if this form run has started tracking a block row entry today
    let row = records.find(r => 
      String(r.Form).trim() === String(result.formName).trim() && 
      String(r.Group).trim() === String(result.group).trim() && 
      String(r.Date).trim() === dateStr
    );

    if (!row) {
      row = {
        Date: dateStr,
        Group: result.group,
        Form: result.formName,
        Positive_Status: '—',
        'Positive_Duration(sec)': '—',
        Positive_TC_Total: '—',
        Positive_TC_Passed: '—',
        Positive_TC_Failed: '—',
        Negative_Status: '—',
        'Negative_Duration(sec)': '—',
        Negative_TC_Total: '—',
        Negative_TC_Passed: '—',
        Negative_TC_Failed: '—',
        Error: ''
      };
      records.push(row);
    }

    // 🚀 CSV FIX: Strip newlines and sanitize quotes to prevent line splitting/bleeding shells
    const cleanError = result.error ? String(result.error).replace(/\n/g, ' | ').replace(/"/g, "'") : '';

    if (String(result.mode).toLowerCase() === 'positive') {
      row.Positive_Status = result.status;
      row['Positive_Duration(sec)'] = durationSec;
      row.Positive_TC_Total = result.testCases?.total ?? '—';
      row.Positive_TC_Passed = result.testCases?.passed ?? '—';
      row.Positive_TC_Failed = result.testCases?.failed ?? '—';
    } else {
      row.Negative_Status = result.status;
      row['Negative_Duration(sec)'] = durationSec;
      row.Negative_TC_Total = result.testCases?.total ?? '—';
      row.Negative_TC_Passed = result.testCases?.passed ?? '—';
      row.Negative_TC_Failed = result.testCases?.failed ?? '—';
    }

    // Append failure traces cleanly inside the cell matrix block space
    if (result.status === 'FAILED' || result.status === 'FAILED') {
      const errorPrefix = `[${String(result.mode).toUpperCase()}]`;
      row.Error = row.Error ? `${row.Error} | ${errorPrefix} ${cleanError}` : `${errorPrefix} ${cleanError}`;
    }

    // Rewrite completely structured rows safely using standard encapsulation
    const updatedCsv = Papa.unparse(records);
    fs.writeFileSync(this.filePath, updatedCsv, 'utf8');

    console.log(`✓ Unified Matrix row updated: ${result.formName} [${result.mode}]`);
  }

  static getFilePath(): string {
    this.initialize();
    return this.filePath;
  }
}