import { FormExecutionResult, ExecutionSummary as Summary } from './ReportTypes';

export class ExecutionSummary {

  /**
   * Build execution summary from all results
   */
  static build(results: FormExecutionResult[]): Summary {

    const totalForms = results.length;

    const passed = results.filter(r => r.status === 'PASSED').length;

    const failed = results.filter(r => r.status === 'FAILED').length;

    const totalDuration = results.reduce(
      (sum, r) => sum + r.duration,
      0
    );

    const startedAt =
      results.length > 0
        ? results[0].startTime
        : new Date();

    const finishedAt =
      results.length > 0
        ? results[results.length - 1].endTime
        : new Date();

    return {
      totalForms,
      passed,
      failed,
      totalDuration,
      startedAt,
      finishedAt
    };
  }
}