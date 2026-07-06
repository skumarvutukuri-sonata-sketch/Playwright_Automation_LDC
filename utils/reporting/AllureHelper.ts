import {
  attachment,
  feature,
  logStep,
  owner,
  parameter,
  parentSuite,
  severity,
  subSuite,
  suite,
  tag,
  ContentType,
  Severity,
  Status
} from 'allure-js-commons';
import { TestCaseMetrics } from './ReportTypes';


export class AllureHelper {

  /**
   * Initialize Form
   */
  static async startForm(
    category: string,
    group: string,
    formName: string,
    mode: string
  ): Promise<void> {

    await parentSuite(category);

    await suite(group);

    await subSuite(formName);

    await feature(mode.toUpperCase());

    await owner('QA Automation');

    await severity(Severity.NORMAL);

    await tag(category);

    await tag(group);

    await tag(mode);

    await parameter('Category', category);

    await parameter('Group', group);

    await parameter('Form', formName);

    await parameter('Mode', mode);
  }

  /**
   * Log Step
   */
  static async step(stepName: string): Promise<void> {

    await logStep(
      `📌 ${stepName}`,
      Status.PASSED
    );

  }

  /**
   * Log Field
   */
  static async field(fieldName: string): Promise<void> {

    await logStep(
      `📝 ${fieldName}`,
      Status.PASSED
    );

  }

  /**
   * Success
   */
  static async success(): Promise<void> {

    await logStep(
      '✅ Form Submitted Successfully',
      Status.PASSED
    );

  }

  /**
   * Failure
   */
  static async failure(
    message: string
  ): Promise<void> {

    await logStep(
      `❌ ${message}`,
      Status.FAILED
    );

  }

  /**
   * Attach JSON
   */
  static async attachJson(
    name: string,
    data: unknown
  ): Promise<void> {

    await attachment(
      name,
      JSON.stringify(data, null, 2),
      ContentType.JSON
    );

  }

  /**
   * Attach Text
   */
  static async attachText(
    name: string,
    text: string
  ): Promise<void> {

    await attachment(
      name,
      text,
      ContentType.TEXT
    );

  }

  /**
   * Attach HTML
   */
  static async attachHtml(
    name: string,
    html: string
  ): Promise<void> {

    await attachment(
      name,
      html,
      ContentType.HTML
    );

  }

  /**
   * Attach CSV
   */
  static async attachCsv(
    name: string,
    csv: string
  ): Promise<void> {

    await attachment(
      name,
      csv,
      'text/csv'
    );

  }

  /**
   * Attach Screenshot
   */
  static async attachScreenshot(
    image: Buffer,
    name = 'Screenshot'
  ): Promise<void> {

    await attachment(
      name,
      image,
      ContentType.PNG
    );

  }

  /**
   * Attach Error
   */
  static async attachError(
    error: Error
  ): Promise<void> {

    await attachment(
      'Error',
      error.stack ?? error.message,
      ContentType.TEXT
    );

  }

  /**
   * Attach Environment
   */
  static async attachEnvironment(
    environment: Record<string, unknown>
  ): Promise<void> {

    await attachment(
      'Environment',
      JSON.stringify(environment, null, 2),
      ContentType.JSON
    );

  }

  /**
   * Attach Test Data
   */
  static async attachTestData(
    data: unknown
  ): Promise<void> {

    await attachment(
      'Test Data',
      JSON.stringify(data, null, 2),
      ContentType.JSON
    );

  }

  /**
   * Attach Execution Summary
   */
  static async attachExecutionSummary(
    summary: unknown
  ): Promise<void> {

    await attachment(
      'Execution Summary',
      JSON.stringify(summary, null, 2),
      ContentType.JSON
    );

  }

  /**
   * Attach Field-level testcase metrics
   */
  static async attachTestCaseMetrics(
    metrics: TestCaseMetrics
  ): Promise<void> {
    await parameter('TestCases_Total', metrics.total);
    await parameter('TestCases_Passed', metrics.passed);
    await parameter('TestCases_Failed', metrics.failed);

    await attachment(
      'Field Test Case Metrics',
      JSON.stringify(metrics, null, 2),
      ContentType.JSON
    );
  }

  /**
   * Generic File Attachment
   */
  static async attachFile(
    name: string,
    content: string | Buffer,
    type: string
  ): Promise<void> {

    await attachment(
      name,
      content,
      type
    );

  }
}