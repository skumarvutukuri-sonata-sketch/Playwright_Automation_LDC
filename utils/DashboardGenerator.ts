import * as fs from 'fs';
import * as path from 'path';
import Papa from 'papaparse';

type MatrixRow = Record<string, any>;

interface DashboardDay {
  dateLabel: string;
  dateIso: string;
  updatedAt: string;
  rows: MatrixRow[];
  totals: {
    pathsTotal: number;
    pathsPassed: number;
    pathsFailed: number;
    testCasesTotal: number;
    testCasesPassed: number;
    testCasesFailed: number;
  };
}

interface DashboardPayload {
  version: number;
  generatedAt: string;
  days: DashboardDay[];
}

export class DashboardGenerator {
  static generate() {
    const reportsDir = path.join(__dirname, '../reports');
    const csvPath = path.join(reportsDir, 'result-matrix.csv');
    
    // THE SAFE ZONE: These files live in the utils/ folder so they are never deleted by cleanup
    const safeHtmlTemplate = path.join(__dirname, 'index.html'); 
    const safeHistoryPath = path.join(__dirname, 'dashboard-history.js'); 
    const safeLogoSvgPath = path.join(__dirname, 'company-logo.svg');
    const safeLogoPngPath = path.join(__dirname, 'company-logo.png');
    
    // THE DESTINATION: Where they go so GitHub Pages can publish them
    const finalHtmlDestination = path.join(reportsDir, 'index.html');
    const finalHistoryDestination = path.join(reportsDir, 'dashboard-history.js');
    const finalLogoSvgDestination = path.join(reportsDir, 'company-logo.svg');
    const finalLogoPngDestination = path.join(reportsDir, 'company-logo.png');

    // 1. Ensure reports directory exists
    if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
    }

    if (!fs.existsSync(csvPath)) {
      console.log('No CSV found to generate dashboard.');
      return;
    }

    // Build form ID -> category mapping from test data files
    const formToCategory = new Map<string, string>();
    const testDataDir = path.join(__dirname, '../test_data');
    if (fs.existsSync(testDataDir)) {
      const degreeFile = path.join(testDataDir, 'Degree.csv');
      const shortCoursesFile = path.join(testDataDir, 'Short_Courses.csv');
      
      if (fs.existsSync(degreeFile)) {
        const degreeContent = fs.readFileSync(degreeFile, 'utf-8');
        const degreeParsed = Papa.parse(degreeContent, { header: true, skipEmptyLines: true });
        (degreeParsed.data as any[]).forEach((row: any) => {
          const formId = String(row.Form_ID || '').trim();
          if (formId) formToCategory.set(formId, 'Degree');
        });
      }
      
      if (fs.existsSync(shortCoursesFile)) {
        const coursesContent = fs.readFileSync(shortCoursesFile, 'utf-8');
        const coursesParsed = Papa.parse(coursesContent, { header: true, skipEmptyLines: true });
        (coursesParsed.data as any[]).forEach((row: any) => {
          const formId = String(row.Form_ID || '').trim();
          if (formId) formToCategory.set(formId, 'Short_Courses');
        });
      }
    }

    // 2. Read and parse today's CSV
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const parsed = Papa.parse(csvContent, { header: true, skipEmptyLines: true });

    const sanitizedData = parsed.data.map((row: any) => {
        if(row.Payload) row.Payload = row.Payload.replace(/"/g, '&quot;').replace(/\n/g, '<br>');
        if(row.ErrorLog) row.ErrorLog = row.ErrorLog.replace(/"/g, '&quot;').replace(/\n/g, '<br>');
        
        // Transform old Happy_/Val_ column names to Positive_/Negative_
        if (row.Happy_Status) {
            row.Positive_Status = row.Happy_Status;
            delete row.Happy_Status;
        }
        if (row['Happy_Duration(sec)']) {
            row['Positive_Duration(sec)'] = row['Happy_Duration(sec)'];
            delete row['Happy_Duration(sec)'];
        }
        if (row.Happy_TC_Total) {
            row.Positive_TC_Total = row.Happy_TC_Total;
            delete row.Happy_TC_Total;
        }
        if (row.Happy_TC_Passed) {
            row.Positive_TC_Passed = row.Happy_TC_Passed;
            delete row.Happy_TC_Passed;
        }
        if (row.Happy_TC_Failed) {
            row.Positive_TC_Failed = row.Happy_TC_Failed;
            delete row.Happy_TC_Failed;
        }
        
        if (row.Val_Status) {
            row.Negative_Status = row.Val_Status;
            delete row.Val_Status;
        }
        if (row['Val_Duration(sec)']) {
            row['Negative_Duration(sec)'] = row['Val_Duration(sec)'];
            delete row['Val_Duration(sec)'];
        }
        if (row.Val_TC_Total) {
            row.Negative_TC_Total = row.Val_TC_Total;
            delete row.Val_TC_Total;
        }
        if (row.Val_TC_Passed) {
            row.Negative_TC_Passed = row.Val_TC_Passed;
            delete row.Val_TC_Passed;
        }
        if (row.Val_TC_Failed) {
            row.Negative_TC_Failed = row.Val_TC_Failed;
            delete row.Val_TC_Failed;
        }
        
        // Set Category from form->category mapping or default to Degree
        const formId = String(row.Form || '').trim();
        row.Category = formToCategory.get(formId) || 'Degree';
        
        return row;
    });

    function parseDateLabelToIso(dateLabel: string): string {
      const label = String(dateLabel || '').trim();
      const monthMap: Record<string, string> = {
        jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
        jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
      };

      const dmyTextMatch = label.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/);
      if (dmyTextMatch) {
        const day = dmyTextMatch[1].padStart(2, '0');
        const month = monthMap[dmyTextMatch[2].toLowerCase()];
        const year = dmyTextMatch[3];
        if (month) return `${year}-${month}-${day}`;
      }

      const direct = new Date(label);
      if (!Number.isNaN(direct.getTime())) {
        return direct.toISOString().slice(0, 10);
      }

      return new Date().toISOString().slice(0, 10);
    }

    function formKey(row: MatrixRow): string {
      return `${String(row.Group || '').trim().toLowerCase()}::${String(row.Form || '').trim().toLowerCase()}`;
    }

    function statusCount(status: any): number {
      const value = String(status || '').toUpperCase().trim();
      return value && value !== '—' ? 1 : 0;
    }

    function statusPassed(status: any): number {
      return String(status || '').toUpperCase().trim() === 'PASSED' ? 1 : 0;
    }

    function statusFailed(status: any): number {
      return String(status || '').toUpperCase().trim() === 'FAILED' ? 1 : 0;
    }

    function toNum(value: any): number {
      const n = Number(value);
      return Number.isFinite(n) ? n : 0;
    }

    function computeTotals(rows: MatrixRow[]) {
      const totals = {
        pathsTotal: 0,
        pathsPassed: 0,
        pathsFailed: 0,
        testCasesTotal: 0,
        testCasesPassed: 0,
        testCasesFailed: 0,
      };

      rows.forEach((row) => {
        totals.pathsTotal += statusCount(row.Positive_Status) + statusCount(row.Negative_Status);
        totals.pathsPassed += statusPassed(row.Positive_Status) + statusPassed(row.Negative_Status);
        totals.pathsFailed += statusFailed(row.Positive_Status) + statusFailed(row.Negative_Status);

        totals.testCasesTotal += toNum(row.Positive_TC_Total) + toNum(row.Negative_TC_Total);
        totals.testCasesPassed += toNum(row.Positive_TC_Passed) + toNum(row.Negative_TC_Passed);
        totals.testCasesFailed += toNum(row.Positive_TC_Failed) + toNum(row.Negative_TC_Failed);
      });

      return totals;
    }

    function parseExistingPayload(): DashboardPayload {
      if (!fs.existsSync(safeHistoryPath)) {
        return { version: 2, generatedAt: new Date().toISOString(), days: [] };
      }

      try {
        const existingData = fs.readFileSync(safeHistoryPath, 'utf-8');
        const jsonString = existingData.replace('const dashboardData = ', '').replace(/;\s*$/, '');
        const parsedData = JSON.parse(jsonString);

        if (parsedData && Array.isArray(parsedData.days)) {
          return {
            version: 2,
            generatedAt: parsedData.generatedAt || new Date().toISOString(),
            days: parsedData.days,
          };
        }

        // Legacy format migration (array of runs)
        if (Array.isArray(parsedData)) {
          const dayMap = new Map<string, Map<string, MatrixRow>>();

          parsedData.forEach((run: any) => {
            const rows = Array.isArray(run.results) ? run.results : [];
            rows.forEach((row: MatrixRow) => {
              const dateLabel = String(row.Date || '').trim();
              if (!dateLabel) return;

              const dayRows = dayMap.get(dateLabel) || new Map<string, MatrixRow>();
              dayRows.set(formKey(row), row);
              dayMap.set(dateLabel, dayRows);
            });
          });

          const days: DashboardDay[] = Array.from(dayMap.entries()).map(([dateLabel, rowsMap]) => {
            const rows = Array.from(rowsMap.values());
            return {
              dateLabel,
              dateIso: parseDateLabelToIso(dateLabel),
              updatedAt: new Date().toISOString(),
              rows,
              totals: computeTotals(rows),
            };
          });

          return { version: 2, generatedAt: new Date().toISOString(), days };
        }
      } catch (error) {
        // Fall back to clean payload if history file is malformed.
      }

      return { version: 2, generatedAt: new Date().toISOString(), days: [] };
    }

    const payload = parseExistingPayload();
    const dayMap = new Map<string, DashboardDay>(payload.days.map((d) => [d.dateLabel, d]));

    // Merge current CSV rows by date and form key (replace only matching form in same day).
    sanitizedData.forEach((row: MatrixRow) => {
      const dateLabel = String(row.Date || '').trim();
      if (!dateLabel) return;

      const existingDay = dayMap.get(dateLabel) || {
        dateLabel,
        dateIso: parseDateLabelToIso(dateLabel),
        updatedAt: new Date().toISOString(),
        rows: [],
        totals: {
          pathsTotal: 0,
          pathsPassed: 0,
          pathsFailed: 0,
          testCasesTotal: 0,
          testCasesPassed: 0,
          testCasesFailed: 0,
        },
      };

      const rowMap = new Map<string, MatrixRow>((existingDay.rows || []).map((r) => [formKey(r), r]));
      const key = formKey(row);
      const existingRow = rowMap.get(key);
      
      // Preserve existing Positive_* fields if new row doesn't have them (for dummy data)
      if (existingRow) {
        if (!row.Positive_Status || row.Positive_Status === '—' || row.Positive_Status === '-') {
          row.Positive_Status = existingRow.Positive_Status;
        }
        if (!row['Positive_Duration(sec)'] || row['Positive_Duration(sec)'] === '—') {
          row['Positive_Duration(sec)'] = existingRow['Positive_Duration(sec)'];
        }
        if (!row.Positive_TC_Total || row.Positive_TC_Total === '—') {
          row.Positive_TC_Total = existingRow.Positive_TC_Total;
        }
        if (!row.Positive_TC_Passed || row.Positive_TC_Passed === '—') {
          row.Positive_TC_Passed = existingRow.Positive_TC_Passed;
        }
        if (!row.Positive_TC_Failed || row.Positive_TC_Failed === '—') {
          row.Positive_TC_Failed = existingRow.Positive_TC_Failed;
        }
      }
      
      rowMap.set(key, row);
      const mergedRows = Array.from(rowMap.values());

      dayMap.set(dateLabel, {
        ...existingDay,
        dateIso: parseDateLabelToIso(dateLabel),
        updatedAt: new Date().toISOString(),
        rows: mergedRows,
        totals: computeTotals(mergedRows),
      });
    });

    // Ensure ALL rows have Category field set (for both old and new data)
    const daysWithCategories = Array.from(dayMap.values()).map((day) => ({
      ...day,
      rows: (day.rows || []).map((row) => {
        const formId = String(row.Form || '').trim();
        return {
          ...row,
          Category: row.Category || formToCategory.get(formId) || 'Degree',
        };
      }),
    }));

    // Keep only latest 30 calendar dates.
    const sortedDays = daysWithCategories
      .sort((a, b) => b.dateIso.localeCompare(a.dateIso))
      .slice(0, 30);

    const finalPayload: DashboardPayload = {
      version: 2,
      generatedAt: new Date().toISOString(),
      days: sortedDays,
    };

    // 5. Save the updated history back to the SAFE ZONE
    fs.writeFileSync(safeHistoryPath, `const dashboardData = ${JSON.stringify(finalPayload, null, 2)};`);
    console.log(`✅ Dashboard data updated! Days saved: ${finalPayload.days.length}`);

    // 6. Copy BOTH files into the reports folder for publishing
    fs.copyFileSync(safeHistoryPath, finalHistoryDestination);
    if (fs.existsSync(safeHtmlTemplate)) {
        fs.copyFileSync(safeHtmlTemplate, finalHtmlDestination);
        if (fs.existsSync(safeLogoSvgPath)) {
          fs.copyFileSync(safeLogoSvgPath, finalLogoSvgDestination);
        }
        if (fs.existsSync(safeLogoPngPath)) {
          fs.copyFileSync(safeLogoPngPath, finalLogoPngDestination);
        }
        console.log(`✅ Dashboard UI and History successfully copied to reports folder!`);
    } else {
        console.log(`❌ Error: Could not find index.html in the utils folder.`);
    }
  }
}

// Auto-run if executed directly from the terminal
if (require.main === module) {
  DashboardGenerator.generate();
}