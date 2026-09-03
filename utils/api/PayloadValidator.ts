import { Logger } from '../Logger';

export type ValidationMode = 'positive' | 'negative';

export class PayloadValidator {
  private static normalizeValue(value: any): any {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed === '') return '';
      const lower = trimmed.toLowerCase();
      if (['true', 'yes', 'opt in', 'opt-in', '1'].includes(lower)) return true;
      if (['false', 'no', 'opt out', 'opt-out', '0'].includes(lower)) return false;
      return lower;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map(item => this.normalizeValue(item));
    }

    if (value && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value).map(([key, item]) => [key, this.normalizeValue(item)])
      );
    }

    return value;
  }

  private static hasExpectedFieldValue(actualPayload: any, expectedKey: string, expectedValue: any): boolean {
    if (!(expectedKey in actualPayload)) return false;

    const actualValue = this.normalizeValue(actualPayload[expectedKey]);
    const normalizedExpected = this.normalizeValue(expectedValue);

    if (typeof normalizedExpected === 'boolean' && typeof actualValue === 'string') {
      return String(actualValue).toLowerCase() === String(normalizedExpected).toLowerCase();
    }

    if (typeof normalizedExpected === 'string' && typeof actualValue === 'boolean') {
      return String(actualValue).toLowerCase() === String(normalizedExpected).toLowerCase();
    }

    return JSON.stringify(actualValue) === JSON.stringify(normalizedExpected);
  }

  /**
   * Compares actual intercepted request payload against expected UI values.
   * Static method fix prevents "Cannot read properties of undefined (reading 'validate')" crashes.
   */
  static validate(actualPayload: any, expectedPayload: any, mode: ValidationMode = 'positive') {
    Logger.action(`Validating API Request Payload for ${mode} scenario...`);

    try {
      const actual = actualPayload || {};
      const expected = expectedPayload || {};
      const expectedKeys = Object.keys(expected);

      if (expectedKeys.length === 0) {
        Logger.action('No dynamic payload keys captured from form. Validation passed with empty expected payload.');
        return;
      }

      const mismatches: string[] = [];
      for (const key of expectedKeys) {
        const expectedValue = expected[key];
        if (!this.hasExpectedFieldValue(actual, key, expectedValue)) {
          mismatches.push(`${key}: expected ${JSON.stringify(expectedValue)} but got ${JSON.stringify(actual[key])}`);
        }
      }

      if (mismatches.length > 0) {
        throw new Error(mismatches.join('\n'));
      }

      Logger.success('✅ API Payload validation passed! Sent data matches UI input for current scenario.');
    } catch (error) {
      Logger.error(`❌ API Payload mismatch for ${mode} scenario!`);
      Logger.error(`Expected (Partial): ${JSON.stringify(expectedPayload, null, 2)}`);
      Logger.error(`Actual Sent: ${JSON.stringify(actualPayload, null, 2)}`);
      throw error;
    }
  }
}

export class PayloadMapper {
  private static readonly apiAliases: Record<string, string> = {
    'please_enter_your_first_name': 'first_name',
    'please_enter_your_last_name': 'last_name',
    'please_enter_your_email': 'email',
    'first_name': 'first_name',
    'last_name': 'last_name',
    'email': 'email',
    'company_name': 'company',
    'company': 'company',
    'contact_number_optional': 'phone',
    'contact_number': 'phone',
    'phone_optional': 'phone',
    'phone': 'phone',
    'phone_number': 'phone',
    'mobile': 'phone',
    'email_opt_out': 'email_opt_in',
    'do_not_call': 'call_opt_in',
    'gdprprospect2uoptin': 'lead_share_opt_in',
    'gdpr_prospectpartner_opt_in': 'gdpr_prospectpartner_opt_in',
    'b2b_interest': 'b2b_interest',

    // HIGHEST LEVEL OF EDUCATION DIRECT ALIASES
    'highest_level_of_education': 'highest_level_of_education',
    'highest_level_of_education_dropdown': 'highest_level_of_education',
    'what_is_your_highest_level_of_education_completed': 'highest_level_of_education',
    'highest_education': 'highest_level_of_education',

    // WORK EXPERIENCE DIRECT ALIASES
    'work_experience': 'work_experience',
    'years_of_work_experience': 'work_experience',
    'years_of_experience': 'work_experience',
    'how_many_years_of_professional_work_experience_do_you_have': 'work_experience'
  };

  private static normalizeFieldName(value: string): string {
    return String(value ?? '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .replace(/_{2,}/g, '_');
  }

  private static normalizeBooleanLike(value: any): boolean | undefined {
    if (typeof value === 'boolean') return value;

    const normalized = String(value ?? '').trim().toLowerCase();
    if (['yes', 'true', '1', 'opt in', 'opt-in'].includes(normalized)) return true;
    if (['no', 'false', '0', 'opt out', 'opt-out'].includes(normalized)) return false;
    return undefined;
  }

  private static resolveApiKey(label: string): string {
    const cleanLabel = this.normalizeFieldName(label);
    const rawLabel = label.toLowerCase().trim();

    if (this.apiAliases[cleanLabel]) return this.apiAliases[cleanLabel];
    if (this.apiAliases[rawLabel]) return this.apiAliases[rawLabel];

    if (cleanLabel.includes('education_journey')) return 'prospect_education_journey';
    if (cleanLabel.includes('work_experience') || cleanLabel.includes('years_of_work') || cleanLabel.includes('years_of_experience')) return 'work_experience';
    if (cleanLabel.includes('highest_level') || cleanLabel.includes('level_of_education')) return 'highest_level_of_education';

    if (cleanLabel.includes('first_name') || cleanLabel.includes('given_name')) return 'first_name';
    if (cleanLabel.includes('last_name') || cleanLabel.includes('surname')) return 'last_name';
    if (cleanLabel.includes('email')) return 'email';
    if (cleanLabel.includes('company')) return 'company';
    if (cleanLabel.includes('phone') || cleanLabel.includes('mobile') || cleanLabel.includes('contact')) return 'phone';
    if (cleanLabel.includes('email_opt_out')) return 'email_opt_in';
    if (cleanLabel.includes('do_not_call')) return 'call_opt_in';
    if (cleanLabel.includes('gdpr') && cleanLabel.includes('opt')) return 'lead_share_opt_in';
    if (cleanLabel.includes('b2b_interest')) return 'b2b_interest';

    return cleanLabel || label;
  }

  static map(enteredValues: Record<string, any>): Record<string, any> {
    const payload: Record<string, any> = {};

    for (const [label, rawValue] of Object.entries(enteredValues)) {
      if (rawValue === undefined || rawValue === null || rawValue === '') continue;

      const candidateKey = this.resolveApiKey(label);
      let finalValue = rawValue;
      const boolLike = this.normalizeBooleanLike(finalValue);

      if (['email_opt_in', 'call_opt_in', 'lead_share_opt_in'].includes(candidateKey)) {
        if (boolLike === true) finalValue = 'Opt In';
        else if (boolLike === false) finalValue = 'Opt Out';
      }
      else if (['b2b_interest'].includes(candidateKey)) {
        if (boolLike === true) finalValue = 'true';
        else if (boolLike === false) finalValue = 'false';
      }
      else if (['gdpr_prospectpartner_opt_in'].includes(candidateKey)) {
        if (boolLike === true) finalValue = true;
        else if (boolLike === false) finalValue = false;
      }

      payload[candidateKey] = finalValue;
    }

    return payload;
  }
}