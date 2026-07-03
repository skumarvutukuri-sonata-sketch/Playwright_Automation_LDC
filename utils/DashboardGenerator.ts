import * as fs from 'fs';
import * as path from 'path';
import Papa from 'papaparse';

export class DashboardGenerator {
  static generate() {
    const reportsDir = path.join(__dirname, '../reports');
    const csvPath = path.join(reportsDir, 'result-matrix.csv');
    
    // THE SAFE ZONE: These files live in the utils/ folder so they are never deleted by cleanup
    const safeHtmlTemplate = path.join(__dirname, 'index.html'); 
    const safeHistoryPath = path.join(__dirname, 'dashboard-history.js'); 
    
    // THE DESTINATION: Where they go so GitHub Pages can publish them
    const finalHtmlDestination = path.join(reportsDir, 'index.html');
    const finalHistoryDestination = path.join(reportsDir, 'dashboard-history.js');

    // 1. Ensure reports directory exists
    if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
    }

    if (!fs.existsSync(csvPath)) {
      console.log('No CSV found to generate dashboard.');
      return;
    }

    // 2. Read and parse today's CSV
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const parsed = Papa.parse(csvContent, { header: true, skipEmptyLines: true });

    const sanitizedData = parsed.data.map((row: any) => {
        if(row.Payload) row.Payload = row.Payload.replace(/"/g, '&quot;').replace(/\n/g, '<br>');
        if(row.ErrorLog) row.ErrorLog = row.ErrorLog.replace(/"/g, '&quot;').replace(/\n/g, '<br>');
        return row;
    });

    const runDate = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const currentRun = { date: runDate, results: sanitizedData };

    // 3. Load History from the SAFE ZONE
    let history: any[] = [];
    if (fs.existsSync(safeHistoryPath)) {
      const existingData = fs.readFileSync(safeHistoryPath, 'utf-8');
      const jsonString = existingData.replace('const dashboardData = ', '').replace(';', '');
      try { history = JSON.parse(jsonString); } catch (e) {}
    }

    // 4. Update the history array (keep 30 days)
    history.unshift(currentRun);
    if (history.length > 30) history = history.slice(0, 30);
    
    // 5. Save the updated history back to the SAFE ZONE
    fs.writeFileSync(safeHistoryPath, `const dashboardData = ${JSON.stringify(history, null, 2)};`);
    console.log(`✅ Dashboard data updated! Runs saved: ${history.length}`);

    // 6. Copy BOTH files into the reports folder for publishing
    fs.copyFileSync(safeHistoryPath, finalHistoryDestination);
    if (fs.existsSync(safeHtmlTemplate)) {
        fs.copyFileSync(safeHtmlTemplate, finalHtmlDestination);
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