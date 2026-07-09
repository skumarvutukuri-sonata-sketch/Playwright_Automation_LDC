// import * as fs from 'fs';
// import * as path from 'path';
// import Papa from 'papaparse';

// interface TestResult {
//   name: string;
//   status: string;
//   duration: number;
// }

// export function generateFormattedReport(): { html: string; summary: any } {
//   const testResultsPath = path.resolve('test-results.json');
//   const resultMatrixPath = path.resolve('reports', 'result-matrix.csv');
  
//   if (!fs.existsSync(testResultsPath)) {
//     return { html: '<p>No test results found</p>', summary: {} };
//   }

//   const rawResults = JSON.parse(fs.readFileSync(testResultsPath, 'utf-8'));
//   const stats = rawResults.stats || {};
//   const totalTests = (stats.expected || 0) + (stats.unexpected || 0) + (stats.skipped || 0);
//   const duration = formatDuration(stats.duration || 0);
//   const executionDate = new Date(stats.startTime || new Date()).toLocaleString();

//   const testDetails: TestResult[] = [];
//   if (Array.isArray(rawResults.suites)) {
//     collectTests(rawResults.suites, testDetails);
//   }

//   // 🚀 READ POSITIVE/NEGATIVE DATA FROM RESULT-MATRIX.CSV
//   let matrixData: any[] = [];
//   let positiveTotal = 0;
//   let positivePassed = 0;
//   let positiveFailed = 0;
//   let positiveFormsCount = 0;
//   let positiveTestCasesPassed = 0;
//   let positiveTestCasesTotal = 0;
  
//   let negativeTotal = 0;
//   let negativePassed = 0;
//   let negativeFailed = 0;
//   let negativeTestCasesPassed = 0;
//   let negativeTestCasesTotal = 0;
//   let totalUniqueFormsTested = 0;
  
//   if (fs.existsSync(resultMatrixPath)) {
//     try {
//       const csvContent = fs.readFileSync(resultMatrixPath, 'utf-8');
//       const parsed = Papa.parse(csvContent, { header: true, skipEmptyLines: true });
//       matrixData = parsed.data || [];
      
//       // Count positive and negative results
//       const uniquePositiveForms = new Set<string>();
//       const uniqueNegativeForms = new Set<string>();
      
//       matrixData.forEach((row: any) => {
//         if (row.Positive_Status && row.Positive_Status !== '—') {
//           positiveTotal++;
//           uniquePositiveForms.add(row.Form);
//           if (row.Positive_Status === 'PASSED') {
//             positivePassed++;
//           } else {
//             positiveFailed++;
//           }
//           // Count test cases
//           positiveTestCasesTotal += parseInt(row.Positive_TC_Total || 0);
//           positiveTestCasesPassed += parseInt(row.Positive_TC_Passed || 0);
//         }
//         if (row.Negative_Status && row.Negative_Status !== '—') {
//           negativeTotal++;
//           uniqueNegativeForms.add(row.Form);
//           if (row.Negative_Status === 'PASSED') {
//             negativePassed++;
//           } else {
//             negativeFailed++;
//           }
//           // Count test cases
//           negativeTestCasesTotal += parseInt(row.Negative_TC_Total || 0);
//           negativeTestCasesPassed += parseInt(row.Negative_TC_Passed || 0);
//         }
//       });
      
//       positiveFormsCount = uniquePositiveForms.size;
//       negativeTotal = matrixData.length; // Total forms with negative tests
      
//       // Count total unique forms tested (both positive and negative paths)
//       const allUniqueForms = new Set([...uniquePositiveForms, ...uniqueNegativeForms]);
//       totalUniqueFormsTested = allUniqueForms.size;
//     } catch (err) {
//       console.error('Failed to parse result-matrix.csv:', err);
//     }
//   }

//   const statusBadgeColor = (status: string) => {
//     switch (status.toLowerCase()) {
//       case 'pass': return '#4CAF50';
//       case 'fail': return '#f44336';
//       case 'skip': return '#FF9800';
//       default: return '#9E9E9E';
//     }
//   };

//   const statusBadge = (status: string) => {
//     const color = statusBadgeColor(status);
//     return `<strong style="background-color: ${color}; color: white; padding: 2px 8px; border-radius: 4px; display: inline-block; font-size: 12px;">${status.toUpperCase()}</strong>`;
//   };

//   let html = `
//     <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5;">
//       <h2 style="color: #2c3e50;">Automated Test Execution Report</h2>
//       <p><strong>Execution Date:</strong> ${executionDate}</p>
//       <p><strong>Source:</strong> Playwright + Custom Form Testing Framework</p>

//       <h3>Summary</h3>
//       <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
//         <tr style="background: #34495e; color: white;">
//           <th style="padding: 12px; border: 1px solid #ccc; text-align: center; font-size: 12px;">Forms Tested</th>
//           <th style="padding: 12px; border: 1px solid #ccc; text-align: center; font-size: 12px;">Success Rate</th>
//           <th style="padding: 12px; border: 1px solid #ccc; text-align: center; font-size: 12px;">Total Paths</th>
//           <th style="padding: 12px; border: 1px solid #ccc; text-align: center; font-size: 12px;">Passed</th>
//           <th style="padding: 12px; border: 1px solid #ccc; text-align: center; font-size: 12px;">Failed</th>
//           <th style="padding: 12px; border: 1px solid #ccc; text-align: center; font-size: 12px;">TC Covered</th>
//         </tr>
//         <tr style="background: #ecf0f1;">
//           <td style="padding: 12px; border: 1px solid #ccc; text-align: center;"><strong style="font-size: 18px; color: #2980b9;">${totalUniqueFormsTested || 0}</strong></td>
//           <td style="padding: 12px; border: 1px solid #ccc; text-align: center;"><strong style="font-size: 18px; color: ${(positivePassed + negativePassed + positiveFailed + negativeFailed > 0 ? ((positivePassed + negativePassed) / (positivePassed + negativePassed + positiveFailed + negativeFailed) * 100 >= 50 ? '#27ae60' : '#e74c3c') : '#95a5a6');};">${(positivePassed + negativePassed + positiveFailed + negativeFailed > 0 ? Math.round((positivePassed + negativePassed) / (positivePassed + negativePassed + positiveFailed + negativeFailed) * 100) : 0)}%</strong></td>
//           <td style="padding: 12px; border: 1px solid #ccc; text-align: center;"><strong style="font-size: 18px; color: #8e44ad;">${positivePassed + negativePassed + positiveFailed + negativeFailed}</strong></td>
//           <td style="padding: 12px; border: 1px solid #ccc; text-align: center;"><strong style="font-size: 18px; color: #27ae60;">${positivePassed + negativePassed}</strong></td>
//           <td style="padding: 12px; border: 1px solid #ccc; text-align: center;"><strong style="font-size: 18px; color: #e74c3c;">${positiveFailed + negativeFailed}</strong></td>
//           <td style="padding: 12px; border: 1px solid #ccc; text-align: center;"><strong style="font-size: 18px; color: #f39c12;">${positiveTestCasesTotal + negativeTestCasesTotal}</strong></td>
//         </tr>
//       </table>

//       <h3>Form Testing Summary</h3>
//       <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
//         <tr style="background: #2c3e50; color: white;">
//           <th style="padding: 10px; border: 1px solid #ccc; text-align: left;">Test Path</th>
//           <th style="padding: 10px; border: 1px solid #ccc; text-align: center;">Total Scenarios</th>
//           <th style="padding: 10px; border: 1px solid #ccc; text-align: center;">Pass / Fail</th>
//           <th style="padding: 10px; border: 1px solid #ccc; text-align: center;">Test Cases</th>
//         </tr>
//         <tr style="background: #e8f5e9;">
//           <td style="padding: 10px; border: 1px solid #ccc;"><strong>✅ Positive Path</strong></td>
//           <td style="padding: 10px; border: 1px solid #ccc; text-align: center;"><strong>${positiveFormsCount}</strong></td>
//           <td style="padding: 10px; border: 1px solid #ccc; text-align: center;">${statusBadge('PASS')} <strong>${positivePassed}</strong> / ${statusBadge('FAIL')} <strong>${positiveFailed}</strong></td>
//           <td style="padding: 10px; border: 1px solid #ccc; text-align: center;"><strong>${positiveTestCasesPassed}/${positiveTestCasesTotal}</strong></td>
//         </tr>
//         <tr style="background: #fff3e0;">
//           <td style="padding: 10px; border: 1px solid #ccc;"><strong>🔍 Negative Path</strong></td>
//           <td style="padding: 10px; border: 1px solid #ccc; text-align: center;"><strong>${matrixData.length}</strong></td>
//           <td style="padding: 10px; border: 1px solid #ccc; text-align: center;">${statusBadge('PASS')} <strong>${negativePassed}</strong> / ${statusBadge('FAIL')} <strong>${negativeFailed}</strong></td>
//           <td style="padding: 10px; border: 1px solid #ccc; text-align: center;"><strong>${negativeTestCasesPassed}/${negativeTestCasesTotal}</strong></td>
//         </tr>
//         <tr style="background: #f7f7f7; border-top: 2px solid #ccc;">
//           <td style="padding: 10px; border: 1px solid #ccc;"><strong>Total</strong></td>
//           <td style="padding: 10px; border: 1px solid #ccc; text-align: center;"><strong>${matrixData.length}</strong></td>
//           <td style="padding: 10px; border: 1px solid #ccc; text-align: center;">${statusBadge('PASS')} <strong>${positivePassed + negativePassed}</strong> / ${statusBadge('FAIL')} <strong>${positiveFailed + negativeFailed}</strong></td>
//           <td style="padding: 10px; border: 1px solid #ccc; text-align: center;"><strong>${positiveTestCasesPassed + negativeTestCasesPassed}/${positiveTestCasesTotal + negativeTestCasesTotal}</strong></td>
//         </tr>
//       </table>

//       <h3>Test Results Details</h3>
//       <table style="width: 100%; border-collapse: collapse;">
//         <tr style="background: #34495e; color: white;">
//           <th style="padding: 8px; border: 1px solid #ccc; text-align: left;">S.No</th>
//           <th style="padding: 8px; border: 1px solid #ccc; text-align: left;">Test Case Name</th>
//           <th style="padding: 8px; border: 1px solid #ccc; text-align: center;">Result</th>
//           <th style="padding: 8px; border: 1px solid #ccc; text-align: center;">Duration</th>
//         </tr>
//   `;

//   testDetails.forEach((test, index) => {
//     const bgColor = index % 2 === 0 ? '#f7f7f7' : 'white';
//     html += `
//       <tr style="background: ${bgColor};">
//         <td style="padding: 8px; border: 1px solid #ccc;">${index + 1}</td>
//         <td style="padding: 8px; border: 1px solid #ccc;">${test.name}</td>
//         <td style="padding: 8px; border: 1px solid #ccc; text-align: center;">${statusBadge(test.status)}</td>
//         <td style="padding: 8px; border: 1px solid #ccc; text-align: center;">${formatDuration(test.duration)}</td>
//       </tr>
//     `;
//   });

//   html += `
//       </table>
//       <p style="margin-top: 20px; font-size: 12px; color: #7f8c8d;">
//         <strong>Note:</strong> Colored badges indicate status (green = PASS, red = FAIL, amber = SKIP, gray = BROKEN).
//       </p>
//     </div>
//   `;

//   return { html, summary: { totalTests, passed: stats.expected, failed: stats.unexpected, skipped: stats.skipped, duration } };
// }

// function collectTests(suites: any[], testDetails: TestResult[]): void {
//   suites.forEach((suite) => {
//     if (suite.specs) {
//       suite.specs.forEach((spec: any) => {
//         if (spec.tests && spec.tests.length > 0) {
//           spec.tests.forEach((test: any) => {
//             const status =
//               test.expectedStatus === 'passed'
//                 ? 'PASS'
//                 : test.expectedStatus === 'skipped'
//                 ? 'SKIP'
//                 : 'FAIL';
//             const duration = test.results?.[0]?.duration || 0;
//             testDetails.push({
//               name: `${suite.title || 'Test'}: ${spec.title}`,
//               status,
//               duration,
//             });
//           });
//         }
//       });
//     }
//     if (suite.suites) {
//       collectTests(suite.suites, testDetails);
//     }
//   });
// }

// function formatDuration(ms: number): string {
//   if (ms < 1000) return `${Math.round(ms)}ms`;
//   const seconds = Math.floor(ms / 1000);
//   const minutes = Math.floor(seconds / 60);
//   const remainingSeconds = seconds % 60;
//   const remainingMs = ms % 1000;

//   if (minutes > 0) {
//     return `${minutes}m ${remainingSeconds}s ${remainingMs}ms`;
//   }
//   return `${seconds}s ${remainingMs}ms`;
// }




import * as fs from 'fs';
import * as path from 'path';
import Papa from 'papaparse';

interface TestResult {
  name: string;
  status: string;
  duration: number;
}

export function generateFormattedReport(): { html: string; summary: any } {
  const testResultsPath = path.resolve('test-results.json');
  const resultMatrixPath = path.resolve('reports', 'result-matrix.csv');
  
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

  // 🚀 READ POSITIVE/NEGATIVE DATA FROM RESULT-MATRIX.CSV
  let matrixData: any[] = [];
  let positiveTotal = 0;
  let positivePassed = 0;
  let positiveFailed = 0;
  let positiveFormsCount = 0;
  let positiveTestCasesPassed = 0;
  let positiveTestCasesTotal = 0;
  
  let negativeTotal = 0;
  let negativePassed = 0;
  let negativeFailed = 0;
  let negativeTestCasesPassed = 0;
  let negativeTestCasesTotal = 0;
  let totalUniqueFormsTested = 0;
  
  if (fs.existsSync(resultMatrixPath)) {
    try {
      const csvContent = fs.readFileSync(resultMatrixPath, 'utf-8');
      const parsed = Papa.parse(csvContent, { header: true, skipEmptyLines: true });
      matrixData = parsed.data || [];
      
      // Count positive and negative results
      const uniquePositiveForms = new Set<string>();
      const uniqueNegativeForms = new Set<string>();
      
      matrixData.forEach((row: any) => {
        if (row.Positive_Status && row.Positive_Status !== '—') {
          positiveTotal++;
          uniquePositiveForms.add(row.Form);
          if (row.Positive_Status === 'PASSED') {
            positivePassed++;
          } else {
            positiveFailed++;
          }
          // Count test cases
          positiveTestCasesTotal += parseInt(row.Positive_TC_Total || 0);
          positiveTestCasesPassed += parseInt(row.Positive_TC_Passed || 0);
        }
        if (row.Negative_Status && row.Negative_Status !== '—') {
          negativeTotal++;
          uniqueNegativeForms.add(row.Form);
          if (row.Negative_Status === 'PASSED') {
            negativePassed++;
          } else {
            negativeFailed++;
          }
          // Count test cases
          negativeTestCasesTotal += parseInt(row.Negative_TC_Total || 0);
          negativeTestCasesPassed += parseInt(row.Negative_TC_Passed || 0);
        }
      });
      
      positiveFormsCount = uniquePositiveForms.size;
      negativeTotal = matrixData.length; // Total forms with negative tests
      
      // Count total unique forms tested (both positive and negative paths)
      const allUniqueForms = new Set([...uniquePositiveForms, ...uniqueNegativeForms]);
      totalUniqueFormsTested = allUniqueForms.size;
    } catch (err) {
      console.error('Failed to parse result-matrix.csv:', err);
    }
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
      <p><strong>Source:</strong> Playwright + Custom Form Testing Framework</p>

      <h3>Summary</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr style="background: #34495e; color: white;">
          <th style="padding: 12px; border: 1px solid #ccc; text-align: center; font-size: 12px;">Forms Tested</th>
          <th style="padding: 12px; border: 1px solid #ccc; text-align: center; font-size: 12px;">Success Rate</th>
          <th style="padding: 12px; border: 1px solid #ccc; text-align: center; font-size: 12px;">Total Paths</th>
          <th style="padding: 12px; border: 1px solid #ccc; text-align: center; font-size: 12px;">Passed</th>
          <th style="padding: 12px; border: 1px solid #ccc; text-align: center; font-size: 12px;">Failed</th>
          <th style="padding: 12px; border: 1px solid #ccc; text-align: center; font-size: 12px;">TC Covered</th>
        </tr>
        <tr style="background: #ecf0f1;">
          <td style="padding: 12px; border: 1px solid #ccc; text-align: center;"><strong style="font-size: 18px; color: #2980b9;">${totalUniqueFormsTested || 0}</strong></td>
          <td style="padding: 12px; border: 1px solid #ccc; text-align: center;"><strong style="font-size: 18px; color: ${(positivePassed + negativePassed + positiveFailed + negativeFailed > 0 ? (((positivePassed + negativePassed) / (positivePassed + negativePassed + positiveFailed + negativeFailed)) * 100 >= 50 ? '#27ae60' : '#e74c3c') : '#95a5a6')};">${(positivePassed + negativePassed + positiveFailed + negativeFailed > 0 ? Math.round((positivePassed + negativePassed) / (positivePassed + negativePassed + positiveFailed + negativeFailed) * 100) : 0)}%</strong></td>
          <td style="padding: 12px; border: 1px solid #ccc; text-align: center;"><strong style="font-size: 18px; color: #8e44ad;">${positivePassed + negativePassed + positiveFailed + negativeFailed}</strong></td>
          <td style="padding: 12px; border: 1px solid #ccc; text-align: center;"><strong style="font-size: 18px; color: #27ae60;">${positivePassed + negativePassed}</strong></td>
          <td style="padding: 12px; border: 1px solid #ccc; text-align: center;"><strong style="font-size: 18px; color: #e74c3c;">${positiveFailed + negativeFailed}</strong></td>
          <td style="padding: 12px; border: 1px solid #ccc; text-align: center;"><strong style="font-size: 18px; color: #f39c12;">${positiveTestCasesTotal + negativeTestCasesTotal}</strong></td>
        </tr>
      </table>

      <h3>Form Testing Summary</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr style="background: #2c3e50; color: white;">
          <th style="padding: 10px; border: 1px solid #ccc; text-align: left;">Test Path</th>
          <th style="padding: 10px; border: 1px solid #ccc; text-align: center;">Total Scenarios</th>
          <th style="padding: 10px; border: 1px solid #ccc; text-align: center;">Pass / Fail</th>
          <th style="padding: 10px; border: 1px solid #ccc; text-align: center;">Test Cases</th>
        </tr>
        <tr style="background: #e8f5e9;">
          <td style="padding: 10px; border: 1px solid #ccc;"><strong>✅ Positive Path</strong></td>
          <td style="padding: 10px; border: 1px solid #ccc; text-align: center;"><strong>${positiveFormsCount}</strong></td>
          <td style="padding: 10px; border: 1px solid #ccc; text-align: center;">${statusBadge('PASS')} <strong>${positivePassed}</strong> / ${statusBadge('FAIL')} <strong>${positiveFailed}</strong></td>
          <td style="padding: 10px; border: 1px solid #ccc; text-align: center;"><strong>${positiveTestCasesPassed}/${positiveTestCasesTotal}</strong></td>
        </tr>
        <tr style="background: #fff3e0;">
          <td style="padding: 10px; border: 1px solid #ccc;"><strong>🔍 Negative Path</strong></td>
          <td style="padding: 10px; border: 1px solid #ccc; text-align: center;"><strong>${matrixData.length}</strong></td>
          <td style="padding: 10px; border: 1px solid #ccc; text-align: center;">${statusBadge('PASS')} <strong>${negativePassed}</strong> / ${statusBadge('FAIL')} <strong>${negativeFailed}</strong></td>
          <td style="padding: 10px; border: 1px solid #ccc; text-align: center;"><strong>${negativeTestCasesPassed}/${negativeTestCasesTotal}</strong></td>
        </tr>
        <tr style="background: #f7f7f7; border-top: 2px solid #ccc;">
          <td style="padding: 10px; border: 1px solid #ccc;"><strong>Total</strong></td>
          <td style="padding: 10px; border: 1px solid #ccc; text-align: center;"><strong>${matrixData.length}</strong></td>
          <td style="padding: 10px; border: 1px solid #ccc; text-align: center;">${statusBadge('PASS')} <strong>${positivePassed + negativePassed}</strong> / ${statusBadge('FAIL')} <strong>${positiveFailed + negativeFailed}</strong></td>
          <td style="padding: 10px; border: 1px solid #ccc; text-align: center;"><strong>${positiveTestCasesPassed + negativeTestCasesPassed}/${positiveTestCasesTotal + negativeTestCasesTotal}</strong></td>
        </tr>
      </table>

      <h3>Test Results Details</h3>
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