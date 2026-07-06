export class EmailTemplate {

  static build(summary: any, records: any[]): string {
    const passPercentage = summary.total > 0 ? Math.round((summary.passed / summary.total) * 100) : 0;
        const testCasePassPercentage = summary.totalTestCases > 0 ? Math.round((summary.passedTestCases / summary.totalTestCases) * 100) : 0;
    const durationSeconds = Math.round(summary.totalDuration / 1000);
    const formsTested = summary.formsTested || 0;

    const timeOptions: Intl.DateTimeFormatOptions = {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
    };
    const startTimeStr = new Date(summary.startedAt).toLocaleString('en-IN', timeOptions);

    let tableRowsHtml = '';
    for (const row of records) {
      const happyStatus = String(row.Positive_Status || '').toUpperCase().trim();
      const valStatus = String(row.Negative_Status || '').toUpperCase().trim();
      const errorMsg = row.Error || '';

      const happyBadge = happyStatus === 'PASSED' 
        ? '<span style="background-color:#D4EDDA;color:#155724;padding:4px 8px;border-radius:4px;font-weight:bold;font-size:11px;">PASSED</span>'
        : happyStatus === 'FAILED'
        ? '<span style="background-color:#F8D7DA;color:#721C24;padding:4px 8px;border-radius:4px;font-weight:bold;font-size:11px;">FAILED</span>'
        : '<span style="color:#A0AEC0;">—</span>';

      const valBadge = valStatus === 'PASSED' 
        ? '<span style="background-color:#D4EDDA;color:#155724;padding:4px 8px;border-radius:4px;font-weight:bold;font-size:11px;">PASSED</span>'
        : valStatus === 'FAILED'
        ? '<span style="background-color:#F8D7DA;color:#721C24;padding:4px 8px;border-radius:4px;font-weight:bold;font-size:11px;">FAILED</span>'
        : '<span style="color:#A0AEC0;">—</span>';

      const happyDur = row['Positive_Duration(sec)'] && row['Positive_Duration(sec)'] !== '—' ? `${row['Positive_Duration(sec)']}s` : '—';
      const valDur = row['Negative_Duration(sec)'] && row['Negative_Duration(sec)'] !== '—' ? `${row['Negative_Duration(sec)']}s` : '—';
            const happyTc = (row.Positive_TC_Total && row.Positive_TC_Total !== '—')
                ? `${row.Positive_TC_Passed || 0}/${row.Positive_TC_Total}`
                : '—';
            const valTc = (row.Negative_TC_Total && row.Negative_TC_Total !== '—')
                ? `${row.Negative_TC_Passed || 0}/${row.Negative_TC_Total}`
                : '—';

      tableRowsHtml += `
        <tr style="border-bottom: 1px solid #E2E8F0;">
          <td style="padding: 10px 12px; color: #718096; font-size: 12px; white-space: nowrap;">${row.Date || '—'}</td>
          <td style="padding: 10px 12px; font-weight: 600; color: #2D3748; font-size: 13px;">${row.Form || '—'}</td>
          <td style="padding: 10px 12px; color: #4A5568; font-size: 13px;">${row.Group || '—'}</td>
          <td style="padding: 10px 12px; text-align: center;">${happyBadge}</td>
          <td style="padding: 10px 12px; color: #718096; font-size: 12px; text-align: right; font-family: monospace;">${happyDur}</td>
                    <td style="padding: 10px 12px; color: #2D3748; font-size: 12px; text-align: center; font-family: monospace;">${happyTc}</td>
          <td style="padding: 10px 12px; text-align: center;">${valBadge}</td>
          <td style="padding: 10px 12px; color: #718096; font-size: 12px; text-align: right; font-family: monospace;">${valDur}</td>
                    <td style="padding: 10px 12px; color: #2D3748; font-size: 12px; text-align: center; font-family: monospace;">${valTc}</td>
          <td style="padding: 10px 12px; color: #E53E3E; font-size: 11px; font-family: monospace; max-width: 250px; min-width: 200px; word-break: break-word; white-space: normal; line-height: 1.4; overflow: hidden; vertical-align: top;">${errorMsg}</td>
        </tr>
      `;
    }

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
</head>
<body style="margin: 0; padding: 0; background-color: #F7FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">

    <div style="max-width: 1050px; margin: 20px auto; padding: 20px;">
        
        <div style="background: linear-gradient(135deg, #1A365D 0%, #2A4365 100%); padding: 30px; border-radius: 12px 12px 0 0; color: white;">
            <h2 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">LDC Form Automation Report</h2>
            <p style="margin: 6px 0 0 0; opacity: 0.85; font-size: 13px;">Started At: ${startTimeStr} | Run Duration: ${durationSeconds} Seconds</p>
        </div>
        
        <div style="margin: 20px 0; text-align: center; font-size: 0;">
            <div style="display: inline-block; width: 19%; margin: 0.5%; background: white; padding: 15px 0; border-radius: 8px; border: 1px solid #E2E8F0; text-align: center; vertical-align: top;">
                <div style="font-size: 11px; text-transform: uppercase; color: #718096; font-weight: 600; letter-spacing: 0.5px;">Forms Tested</div>
                <div style="font-size: 24px; font-weight: 700; color: #2B6CB0; margin-top: 5px;">${formsTested}</div>
            </div>
            <div style="display: inline-block; width: 19%; margin: 0.5%; background: white; padding: 15px 0; border-radius: 8px; border: 1px solid #E2E8F0; text-align: center; vertical-align: top;">
                <div style="font-size: 11px; text-transform: uppercase; color: #718096; font-weight: 600; letter-spacing: 0.5px;">Success Rate</div>
                <div style="font-size: 24px; font-weight: 700; color: ${passPercentage === 100 ? '#38A169' : '#E53E3E'}; margin-top: 5px;">${passPercentage}%</div>
            </div>
            <div style="display: inline-block; width: 19%; margin: 0.5%; background: white; padding: 15px 0; border-radius: 8px; border: 1px solid #E2E8F0; text-align: center; vertical-align: top;">
                <div style="font-size: 11px; text-transform: uppercase; color: #718096; font-weight: 600; letter-spacing: 0.5px;">Total Paths</div>
                <div style="font-size: 24px; font-weight: 700; color: #2B6CB0; margin-top: 5px;">${summary.total}</div>
            </div>
            <div style="display: inline-block; width: 19%; margin: 0.5%; background: white; padding: 15px 0; border-radius: 8px; border: 1px solid #E2E8F0; text-align: center; vertical-align: top;">
                <div style="font-size: 11px; text-transform: uppercase; color: #718096; font-weight: 600; letter-spacing: 0.5px;">Passed</div>
                <div style="font-size: 24px; font-weight: 700; color: #38A169; margin-top: 5px;">${summary.passed}</div>
            </div>
            <div style="display: inline-block; width: 19%; margin: 0.5%; background: white; padding: 15px 0; border-radius: 8px; border: 1px solid #E2E8F0; text-align: center; vertical-align: top;">
                <div style="font-size: 11px; text-transform: uppercase; color: #718096; font-weight: 600; letter-spacing: 0.5px;">Failed</div>
                <div style="font-size: 24px; font-weight: 700; color: #E53E3E; margin-top: 5px;">${summary.failed}</div>
            </div>
        </div>

        <div style="margin: 0 0 20px 0; text-align: center; font-size: 0;">
            <div style="display: inline-block; width: 19%; margin: 0.5%; background: white; padding: 15px 0; border-radius: 8px; border: 1px solid #E2E8F0; text-align: center; vertical-align: top;">
                <div style="font-size: 11px; text-transform: uppercase; color: #718096; font-weight: 600; letter-spacing: 0.5px;">TC Covered</div>
                <div style="font-size: 24px; font-weight: 700; color: #F59E0B; margin-top: 5px;">${summary.totalTestCases || 0}</div>
            </div>
        </div>

        <div style="background: white; border-radius: 8px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <table style="width: 100%; border-collapse: collapse; text-align: left; table-layout: fixed;">
                <colgroup>
                    <col style="width: 10%;">
                    <col style="width: 10%;">
                    <col style="width: 10%;">
                    <col style="width: 8%;">
                    <col style="width: 8%;">
                    <col style="width: 8%;">
                    <col style="width: 8%;">
                    <col style="width: 8%;">
                    <col style="width: 8%;">
                    <col style="width: 22%;">
                </colgroup>
                <thead>
                    <tr style="background-color: #EDF2F7; border-bottom: 2px solid #CBD5E0;">
                        <th style="padding: 12px; color: #4A5568; font-weight: 700; font-size: 13px;">Date</th>
                        <th style="padding: 12px; color: #4A5568; font-weight: 700; font-size: 13px;">Form Name</th>
                        <th style="padding: 12px; color: #4A5568; font-weight: 700; font-size: 13px;">Group</th>
                        <th style="padding: 12px; color: #4A5568; font-weight: 700; font-size: 13px; text-align: center;">Positive</th>
                        <th style="padding: 12px; color: #4A5568; font-weight: 700; font-size: 13px; text-align: right;">Pos Dur</th>
                        <th style="padding: 12px; color: #4A5568; font-weight: 700; font-size: 13px; text-align: center;">Pos TC</th>
                        <th style="padding: 12px; color: #4A5568; font-weight: 700; font-size: 13px; text-align: center;">Negative</th>
                        <th style="padding: 12px; color: #4A5568; font-weight: 700; font-size: 13px; text-align: right;">Neg Dur</th>
                        <th style="padding: 12px; color: #4A5568; font-weight: 700; font-size: 13px; text-align: center;">Neg TC</th>
                        <th style="padding: 12px; color: #4A5568; font-weight: 700; font-size: 13px;">Failure Logs / Trace</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRowsHtml}
                </tbody>
            </table>
        </div>
        
        <div style="margin-top: 20px; font-size: 12px; color: #2D3748; background-color: #EDF2F7; padding: 12px 15px; border-radius: 6px; border-left: 4px solid #2B6CB0; font-weight: 500;">
            📎 <b>Attached Artifacts:</b> ResultMatrix.csv (Full Matrix Workspace Log)
        </div>
    </div>

</body>
</html>
    `;
  }
}