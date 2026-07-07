/**
 * Execution status
 */
export type ExecutionStatus = 'PASSED' | 'FAILED';

/**
 * Test mode
 */
export type ExecutionMode = 'positive' | 'negative';

/**
 * Field-level testcase metrics
 */
export interface TestCaseMetrics {
  total: number;
  passed: number;
  failed: number;
}

/**
 * One executed form
 */
export interface FormExecutionResult {
  group: string;
  formName: string;
  mode: ExecutionMode;
  status: ExecutionStatus;
  duration: number;
  startTime: Date;
  endTime: Date;
  error?: string;
  testCases?: TestCaseMetrics;
}

/**
 * Overall execution summary
 */
export interface ExecutionSummary {

  totalForms: number;

  passed: number;

  failed: number;

  totalDuration: number;

  startedAt: Date;

  finishedAt: Date;

}