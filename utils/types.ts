// ==========================================
// CORE FRAMEWORK TYPES
// ==========================================

/**
 * Defines the configuration for a specific form being tested.
 */
export interface FormDefinition {
  /** The target URL where the form is located */
  url: string;
  
  /** The group or university name (e.g., 'vu-edu', 'alb-umt') */
  group: string;

  /** High-level category for reporting (e.g., 'Degree', 'Short Courses') */
  category?: string;
  
  /** * 🚀 OPTIONAL: The framework now dynamically crawls the DOM to find fields.
   * You no longer need to hardcode step arrays! 
   */
  steps?: any[]; 
}

/**
 * Represents a single row of data extracted from your Master CSV files.
 */
export interface CsvRowData {
  url: string;
  group: string;
  form: string;
  run: string;
  
  // Allows for any other dynamic columns in the spreadsheet
  [key: string]: string | undefined; 
}

/**
 * Defines the execution mode for the current test run.
 */
export type TestMode = 'positive' | 'negative';
