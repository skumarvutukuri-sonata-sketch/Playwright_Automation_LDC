import { ExecutionSummary } from './ReportTypes';

export class EmailTemplate {

  /**
   * Build HTML email body
   */
  static build(summary: any): string {

    const durationSeconds = Math.round(
      summary.totalDuration / 1000
    );

  

    return `
<!DOCTYPE html>
<html>

<head>

<meta charset="UTF-8">

<style>

body{
font-family:Arial,Helvetica,sans-serif;
font-size:14px;
color:#333;
}

table{
border-collapse:collapse;
width:500px;
}

th{
background:#1976d2;
color:white;
padding:10px;
text-align:left;
}

td{
border:1px solid #ddd;
padding:8px;
}

.success{
color:green;
font-weight:bold;
}

.failed{
color:red;
font-weight:bold;
}

.footer{
margin-top:30px;
font-size:12px;
color:#777;
}

</style>

</head>

<body>

<h2>LDC Automation Execution Report</h2>

<p>
Execution completed successfully.
</p>

<table>

<tr>

<th colspan="2">
Execution Summary
</th>

</tr>

<tr>

<td>Total Forms</td>

<td>${summary.total}</td>

</tr>

<tr>

<td>Passed</td>

<td class="success">
${summary.passed}
</td>

</tr>

<tr>

<td>Failed</td>

<td class="failed">
${summary.failed}
</td>

</tr>

<tr>

<td>Total Duration</td>

<td>
${durationSeconds} Seconds
</td>

</tr>

<tr>

<td>Started</td>

<td>
${new Date(summary.startedAt).toLocaleString('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true
})}
</td>

</tr>

<tr>

<td>Finished</td>

<td>
${new Date(summary.finishedAt).toLocaleString('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true
})}
</td>

</tr>

</table>

<br>

<b>Attachments</b>

<ul>


<li>✔ ResultMatrix.csv</li>


</ul>

<div class="footer">

Generated automatically by the Playwright Automation Framework.

</div>

</body>

</html>
`;

  }

}