import { ResultMatrix } from './ResultMatrix';
import { ExecutionSummary } from './ExecutionSummary';
import {
  FormExecutionResult,
  ExecutionMode,
  ExecutionStatus,
  TestCaseMetrics
} from './ReportTypes';



export class ReportManager {

  private static startTimes: Map<string, Date> = new Map();
  private static executionStartTime: Date = new Date();
  private static executionEndTime: Date = new Date();


  /**
   * Start entire automation execution
   */
  static startExecution(): void {
    this.executionStartTime = new Date();
  }

  /**
   * Start tracking a form execution
   */
  static startForm(formKey: string): void {
    this.startTimes.set(formKey, new Date());
  }
  

  /**
   * Mark form as PASSED
   */
  
  static pass(
    formKey: string,
    group: string,
    formName: string,
    mode: ExecutionMode,
    testCases?: TestCaseMetrics
  ): void {
    console.log('PASS:', formName);

    const startTime = this.startTimes.get(formKey);

    if (!startTime) return;

    const endTime = new Date();

    const result: FormExecutionResult = {
      group,
      formName,
      mode,
      status: 'PASSED' as ExecutionStatus,
      duration: endTime.getTime() - startTime.getTime(),
      startTime,
      endTime,
      testCases
    };

    ResultMatrix.add(result);

    this.startTimes.delete(formKey);
  }

  /**
   * Mark form as FAILED
   */
  static fail(
    formKey: string,
    group: string,
    formName: string,
    mode: ExecutionMode,
    error: string,
    testCases?: TestCaseMetrics
  ): void {
    console.log('FAIL:', formName);

    const startTime = this.startTimes.get(formKey);

    if (!startTime) return;

    const endTime = new Date();

    const result: FormExecutionResult = {
      group,
      formName,
      mode,
      status: 'FAILED' as ExecutionStatus,
      duration: endTime.getTime() - startTime.getTime(),
      startTime,
      endTime,
      error,
      testCases
    };

    ResultMatrix.add(result);

    this.startTimes.delete(formKey);
  }

  /**
   * Finish entire execution run
   */
  static finish(): void {

    const csvPath = ResultMatrix.getFilePath();

//    const csvPath = path.join(process.cwd(), 'reports', 'result-matrix.csv');

// const summary = ExecutionSummary.buildFromCSV(csvPath);

    console.log('\n==========================================');
    console.log('Automation Execution Summary');
    console.log('==========================================');
    // console.log(`Total Forms : ${summary.totalForms}`);
    // console.log(`Passed      : ${summary.passed}`);
    // console.log(`Failed      : ${summary.failed}`);
    // console.log(`Duration    : ${summary.totalDuration} ms`);
    console.log(`CSV Report  : ${csvPath}`);
    console.log('==========================================\n');

  }
}