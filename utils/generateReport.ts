import * as fs from 'fs';
import * as path from 'path';

interface TestResult {
  name: string;
  status: string;
  duration: number;
}

export function generateFormattedReport(): { html: string; summary: any } {
  const testResultsPath = path.resolve('test-results.json');
  if (!fs.existsSync(testResultsPath)) {
    return { html: '<p>No test results found</p>', summary: {} };
  }

  const rawResults = JSON.parse(fs.readFileSync(testResultsPath, 'utf-8'));
  const stats = rawResults.stats || {};
  const totalTests = (stats.expected || 0) + (stats.unexpected || 0) + (stats.skipped || 0);
  const duration = formatDuration(stats.duration || 0);
  const executionDate = new Date(stats.startTime || new Date()).toLocaleString();

  const testDetails: TestResult[] = [];
  if (Array.isArray(rawResults.suites)) {
    collectTests(rawResults.suites, testDetails);
  }

  const statusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pass': return '#4CAF50';
      case 'fail': return '#f44336';
      case 'skip': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  const statusBadge = (status: string) => {
    const color = statusBadgeColor(status);
    return `<strong style="background-color: ${color}; color: white; padding: 2px 8px; border-radius: 4px; display: inline-block; font-size: 12px;">${status.toUpperCase()}</strong>`;
  };

  let html = `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5;">
      <h2 style="color: #2c3e50;">Automated Test Execution Report</h2>
      <p><strong>Execution Date:</strong> ${executionDate}</p>
      <p><strong>Source:</strong> allure-report/widgets/duration.json</p>

      <h3>Summary</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
          <td style="padding: 6px 8px; border: 1px solid #ccc; font-weight: bold;">Count Status</td>
          <td style="padding: 6px 8px; border: 1px solid #ccc; font-weight: bold;">Badge</td>
          <td style="padding: 6px 8px; border: 1px solid #ccc; font-weight: bold;">Total</td>
        </tr>
        <tr>
          <td style="padding: 6px 8px; border: 1px solid #ccc;">Total Tests</td>
          <td style="padding: 6px 8px; border: 1px solid #ccc;">UNKNOWN</td>
          <td style="padding: 6px 8px; border: 1px solid #ccc;"><strong>${totalTests}</strong></td>
        </tr>
        <tr>
          <td style="padding: 6px 8px; border: 1px solid #ccc;">Duration</td>
          <td style="padding: 6px 8px; border: 1px solid #ccc;">-</td>
          <td style="padding: 6px 8px; border: 1px solid #ccc;"><strong>${duration}</strong></td>
        </tr>
        <tr>
          <td style="padding: 6px 8px; border: 1px solid #ccc;">Passed</td>
          <td style="padding: 6px 8px; border: 1px solid #ccc;">${statusBadge('PASS')}</td>
          <td style="padding: 6px 8px; border: 1px solid #ccc;"><strong>${stats.expected || 0}</strong></td>
        </tr>
        <tr>
          <td style="padding: 6px 8px; border: 1px solid #ccc;">Failed</td>
          <td style="padding: 6px 8px; border: 1px solid #ccc;">${statusBadge('FAIL')}</td>
          <td style="padding: 6px 8px; border: 1px solid #ccc;"><strong>${stats.unexpected || 0}</strong></td>
        </tr>
        <tr>
          <td style="padding: 6px 8px; border: 1px solid #ccc;">Skipped</td>
          <td style="padding: 6px 8px; border: 1px solid #ccc;">${statusBadge('SKIP')}</td>
          <td style="padding: 6px 8px; border: 1px solid #ccc;"><strong>${stats.skipped || 0}</strong></td>
        </tr>
      </table>

      <h3>Test Results</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="background: #34495e; color: white;">
          <th style="padding: 8px; border: 1px solid #ccc; text-align: left;">S.No</th>
          <th style="padding: 8px; border: 1px solid #ccc; text-align: left;">Test Case Name</th>
          <th style="padding: 8px; border: 1px solid #ccc; text-align: center;">Result</th>
          <th style="padding: 8px; border: 1px solid #ccc; text-align: center;">Duration</th>
        </tr>
  `;

  testDetails.forEach((test, index) => {
    const bgColor = index % 2 === 0 ? '#f7f7f7' : 'white';
    html += `
      <tr style="background: ${bgColor};">
        <td style="padding: 8px; border: 1px solid #ccc;">${index + 1}</td>
        <td style="padding: 8px; border: 1px solid #ccc;">${test.name}</td>
        <td style="padding: 8px; border: 1px solid #ccc; text-align: center;">${statusBadge(test.status)}</td>
        <td style="padding: 8px; border: 1px solid #ccc; text-align: center;">${formatDuration(test.duration)}</td>
      </tr>
    `;
  });

  html += `
      </table>
      <p style="margin-top: 20px; font-size: 12px; color: #7f8c8d;">
        <strong>Note:</strong> Colored badges indicate status (green = PASS, red = FAIL, amber = SKIP, gray = BROKEN).
      </p>
    </div>
  `;

  return { html, summary: { totalTests, passed: stats.expected, failed: stats.unexpected, skipped: stats.skipped, duration } };
}

function collectTests(suites: any[], testDetails: TestResult[]): void {
  suites.forEach((suite) => {
    if (suite.specs) {
      suite.specs.forEach((spec: any) => {
        if (spec.tests && spec.tests.length > 0) {
          spec.tests.forEach((test: any) => {
            const status =
              test.expectedStatus === 'passed'
                ? 'PASS'
                : test.expectedStatus === 'skipped'
                ? 'SKIP'
                : 'FAIL';
            const duration = test.results?.[0]?.duration || 0;
            testDetails.push({
              name: `${suite.title || 'Test'}: ${spec.title}`,
              status,
              duration,
            });
          });
        }
      });
    }
    if (suite.suites) {
      collectTests(suite.suites, testDetails);
    }
  });
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const remainingMs = ms % 1000;

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s ${remainingMs}ms`;
  }
  return `${seconds}s ${remainingMs}ms`;
}
