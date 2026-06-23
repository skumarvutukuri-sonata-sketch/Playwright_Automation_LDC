/**
 * ================================
 * Supported Execution Modes
 * ================================
 */
export type TestMode = 'happy' | 'validation';


/**
 * ================================
 * Field Types (optional override)
 * ================================
 * NOTE:
 * Used only when overriding auto-detection
 */
export type FieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'textarea'
  | 'dropdown'
  | 'radio'
  | 'checkbox';


/**
 * ================================
 * Form Field Definition
 * ================================
 */
export interface FormField {

  /**
   * Label shown in UI
   * (Used for locating + data mapping)
   */
  label: string;

  /**
   * Optional explicit type override
   * (used for radio ambiguity like Email/Phone)
   */
  type?: FieldType;

  /**
   * Required validation flag
   */
  required?: boolean;

  /**
   * Enable invalid value testing
   */
  invalid?: boolean;
}


/**
 * ================================
 * One Step of Form
 * ================================
 */
export interface FormStep {

  fields: FormField[];

}


/**
 * ================================
 * Complete Form Definition
 * ================================
 */
export interface FormDefinition {

  /**
   * Group / Degree Name (e.g., AU-LAW)
   */
  group: string;

  /**
   * URL of form
   */
  url: string;

  /**
   * Multi-step structure
   */
  steps: FormStep[];
}


/**
 * ================================
 * forms.json structure
 * ================================
 */
export interface FormsFile {

  forms: Record<string, FormDefinition>;

}
``