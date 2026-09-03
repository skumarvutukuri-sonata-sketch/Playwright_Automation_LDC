// // export class PayloadMapper {
// //     private static readonly apiAliases: Record<string, string> = {
// //         'please_enter_your_first_name': 'first_name',
// //         'please_enter_your_last_name': 'last_name',
// //         'please_enter_your_email': 'email',
// //         'first_name': 'first_name',
// //         'last_name': 'last_name',
// //         'email': 'email',
// //         'company_name': 'company',
// //         'company': 'company',
// //         'how_many_employees_work_at_your_company': 'estimated_size_of_organization',
// //         'estimated_size_of_organization': 'estimated_size_of_organization',
// //         'number_of_participants': 'number_of_learners',
// //         'number_of_learners': 'number_of_learners',
// //         'contact_intention': 'contact_intention',
// //         'contact_number_optional': 'phone',
// //         'phone_optional': 'phone',
// //         'contact_number': 'phone',
// //         'phone': 'phone',
// //         'phone_number': 'phone',
// //         'mobile': 'phone',
// //         'email_opt_out': 'email_opt_in',
// //         'do_not_call': 'call_opt_in',
// //         'gdprprospect2uoptin': 'lead_share_opt_in',
// //         'gdpr_prospectpartner_opt_in': 'gdpr_prospectpartner_opt_in',
// //         'b2b_interest': 'b2b_interest',
// //         'highest_level_of_education': 'highest_level_of_education',
// //         'what_is_your_highest_level_of_education_completed': 'highest_level_of_education',
// //         'work_experience': 'work_experience',
// //         'how_many_years_of_professional_work_experience_do_you_have': 'work_experience',
// //         'gpa': 'what_was_your_undergraduate_gpa',
// //         'what_was_your_undergraduate_gpa': 'what_was_your_undergraduate_gpa',
// //         'program': 'which_program_most_interests_you',
// //         'which_program_most_interests_you': 'which_program_most_interests_you',
// //         'start_program': 'when_are_you_considering_starting_your_program',
// //         'when_are_you_considering_starting_your_program': 'when_are_you_considering_starting_your_program',
// //         // --- NEW ADDITIONS TO SUPPORT DYNAMIC ALIASES ---
// //         'zip_code': 'zip_code',
// //         'postal_code': 'postal_code',
// //         'prospect_education_journey': 'prospect_education_journey',
// //         'which_best_describes_you': 'which_best_describes_you',
// //         'level_of_education': 'level_of_education',
// //         'stated_gpa_range': 'stated_gpa_range',
// //         // --- NEW: Hidden API Fields ---
// //         'experiment_variant': 'experiment_variant',
// //         'experiment_project': 'experiment_project',
// //         'experiment_name': 'experiment_name',
// //         'rv_source': 'rv_source',
// //         'lead_capture_form_type': 'lead_capture_form_type',
// //         'lead_source': 'lead_source',
// //         'degree_offering': 'degree_offering',
// //         'test_taken': 'test_taken',
// //         'have_you_taken_the_gre': 'have_you_taken_the_gre'
        
        
// //     };

// //     private static normalizeFieldName(value: string): string {
// //         return String(value ?? '')
// //             .trim()
// //             .toLowerCase()
// //             .replace(/[^a-z0-9]+/g, '_')
// //             .replace(/^_+|_+$/g, '')
// //             .replace(/_{2,}/g, '_');
// //     }

// //     private static normalizeBooleanLike(value: any): boolean | undefined {
// //         if (typeof value === 'boolean') return value;

// //         const normalized = String(value ?? '').trim().toLowerCase();
// //         if (['yes', 'true', '1', 'opt in', 'opt-in'].includes(normalized)) return true;
// //         if (['no', 'false', '0', 'opt out', 'opt-out'].includes(normalized)) return false;
// //         return undefined;
// //     }

// //     private static resolveApiKey(label: string): string | undefined {
// //         const cleanLabel = this.normalizeFieldName(label);
// //         const rawLabel = label.toLowerCase().trim();

// //         if (this.apiAliases[cleanLabel]) return this.apiAliases[cleanLabel];
// //         if (this.apiAliases[rawLabel]) return this.apiAliases[rawLabel];

// //         if (cleanLabel.includes('first_name') || cleanLabel.includes('given_name')) return 'first_name';
// //         if (cleanLabel.includes('last_name') || cleanLabel.includes('surname')) return 'last_name';
// //         if (cleanLabel.includes('email')) return 'email';
// //         if (cleanLabel.includes('company')) return 'company';
// //         if (cleanLabel.includes('employee') && cleanLabel.includes('company')) return 'estimated_size_of_organization';
// //         if (cleanLabel.includes('participant') || cleanLabel.includes('learners')) return 'number_of_learners';
// //         if (cleanLabel.includes('phone') || cleanLabel.includes('mobile') || cleanLabel.includes('contact_number')) return 'phone';
// //         if (cleanLabel.includes('postal') || cleanLabel.includes('zip')) return 'postal_code';
// //         if (cleanLabel.includes('state')) return 'state';
// //         if (cleanLabel.includes('country')) return 'country_of_residence';
// //         if (cleanLabel.includes('military')) return 'are_you_military_affiliated';
// //         if (cleanLabel.includes('education')) return 'highest_level_of_education';
// //         if (cleanLabel.includes('experience')) return 'work_experience';
// //         if (cleanLabel.includes('gpa')) return 'what_was_your_undergraduate_gpa';
// //         if (cleanLabel.includes('program') && !cleanLabel.includes('programming')) return 'which_program_most_interests_you';
// //         if (cleanLabel.includes('start') && cleanLabel.includes('program')) return 'when_are_you_considering_starting_your_program';
// //         if (cleanLabel.includes('intention')) return 'contact_intention';
// //         if (cleanLabel.includes('email_opt_out')) return 'email_opt_in';
// //         if (cleanLabel.includes('do_not_call')) return 'call_opt_in';
// //         if (cleanLabel.includes('gdpr') && cleanLabel.includes('opt')) return 'lead_share_opt_in';
// //         if (cleanLabel.includes('b2b_interest')) return 'b2b_interest';
// //         // --- NEW ADDITIONS FOR NEGATIVE SCENARIOS & SPEECH PATHOLOGY ---
// //         if (cleanLabel.includes('speech_pathology') || cleanLabel.includes('best_describes_you')) return 'which_best_describes_you';
// //         if (cleanLabel.includes('education_journey')) return 'prospect_education_journey';
// //         if (cleanLabel.includes('test') || cleanLabel.includes('gre') || cleanLabel.includes('gmat')) return 'test_taken';
        
               
// //         return cleanLabel.includes('_') ? cleanLabel : undefined;
// //     }

// //     /**
// //      * Convert UI entered values into expected API payload while keeping the validation dynamic.
// //      */
// //     static map(enteredValues: Record<string, any>): Record<string, any> {
// //         const payload: Record<string, any> = {};

// //         for (const [label, rawValue] of Object.entries(enteredValues)) {
// //             const candidateKey = this.resolveApiKey(label);
// //             if (!candidateKey) continue;

// //             let finalValue = rawValue;
// //             const boolLike = this.normalizeBooleanLike(finalValue);

// //             if (['email_opt_in', 'call_opt_in'].includes(candidateKey)) {
// //                 if (boolLike === true) finalValue = 'Opt In';
// //                 else if (boolLike === false) finalValue = 'Opt Out';
// //             }
// //             else if (['lead_share_opt_in'].includes(candidateKey)) {
// //                 if (boolLike === true) finalValue = 'Opt In';
// //                 else if (boolLike === false) finalValue = 'Opt Out';
// //             }
// //             else if (['b2b_interest'].includes(candidateKey)) {
// //                 if (boolLike === true) finalValue = 'true';
// //                 else if (boolLike === false) finalValue = 'false';
// //             }
// //             else if (['gdpr_prospectpartner_opt_in'].includes(candidateKey)) {
// //                 if (boolLike === true) finalValue = true;
// //                 else if (boolLike === false) finalValue = false;
// //             }
// //             else if (['email_opt_out', 'do_not_call', 'gdprprospect2uoptin'].includes(this.normalizeFieldName(label))) {
// //                 if (boolLike === true) finalValue = true;
// //                 else if (boolLike === false) finalValue = false;
// //             }

// //             payload[candidateKey] = finalValue;
// //         }

// //         return payload;
// //     }
// // }
// export class PayloadMapper {
//   private static readonly apiAliases: Record<string, string> = {
//     'please_enter_your_first_name': 'first_name',
//     'please_enter_your_last_name': 'last_name',
//     'please_enter_your_email': 'email',
//     'first_name': 'first_name',
//     'last_name': 'last_name',
//     'email': 'email',
//     'company_name': 'company',
//     'company': 'company',
//     'how_many_employees_work_at_your_company': 'estimated_size_of_organization',
//     'estimated_size_of_organization': 'estimated_size_of_organization',
//     'number_of_participants': 'number_of_learners',
//     'number_of_learners': 'number_of_learners',
//     'contact_intention': 'contact_intention',
//     'contact_number_optional': 'phone',
//     'contact_number': 'phone',
//     'phone_optional': 'phone',
//     'phone': 'phone',
//     'phone_number': 'phone',
//     'mobile': 'phone',
//     'email_opt_out': 'email_opt_in',
//     'do_not_call': 'call_opt_in',
//     'gdprprospect2uoptin': 'lead_share_opt_in',
//     'gdpr_prospectpartner_opt_in': 'gdpr_prospectpartner_opt_in',
//     'b2b_interest': 'b2b_interest',

//     // 🚀 HIGHEST LEVEL OF EDUCATION DIRECT ALIASES
//     'highest_level_of_education': 'highest_level_of_education',
//     'highest_level_of_education_dropdown': 'highest_level_of_education',
//     'what_is_your_highest_level_of_education_completed': 'highest_level_of_education',
//     'highest_education': 'highest_level_of_education',

//     // 🚀 WORK EXPERIENCE DIRECT ALIASES
//     'work_experience': 'work_experience',
//     'years_of_work_experience': 'work_experience',
//     'years_of_experience': 'work_experience',
//     'how_many_years_of_professional_work_experience_do_you_have': 'work_experience',

//     'gpa': 'what_was_your_undergraduate_gpa',
//     'what_was_your_undergraduate_gpa': 'what_was_your_undergraduate_gpa',
//     'program': 'which_program_most_interests_you',
//     'which_program_most_interests_you': 'which_program_most_interests_you',
//     'start_program': 'when_are_you_considering_starting_your_program',
//     'when_are_you_considering_starting_your_program': 'when_are_you_considering_starting_your_program',

//     'zip_code': 'zip_code',
//     'postal_code': 'postal_code',
//     'prospect_education_journey': 'prospect_education_journey',
//     'which_best_describes_you': 'which_best_describes_you',
//     'level_of_education': 'level_of_education',
//     'stated_gpa_range': 'stated_gpa_range'
//   };

//   private static normalizeFieldName(value: string): string {
//     return String(value ?? '')
//       .trim()
//       .toLowerCase()
//       .replace(/[^a-z0-9]+/g, '_')
//       .replace(/^_+|_+$/g, '')
//       .replace(/_{2,}/g, '_');
//   }

//   private static normalizeBooleanLike(value: any): boolean | undefined {
//     if (typeof value === 'boolean') return value;

//     const normalized = String(value ?? '').trim().toLowerCase();
//     if (['yes', 'true', '1', 'opt in', 'opt-in'].includes(normalized)) return true;
//     if (['no', 'false', '0', 'opt out', 'opt-out'].includes(normalized)) return false;
//     return undefined;
//   }

//   private static resolveApiKey(label: string): string {
//     const cleanLabel = this.normalizeFieldName(label);
//     const rawLabel = label.toLowerCase().trim();

//     if (this.apiAliases[cleanLabel]) return this.apiAliases[cleanLabel];
//     if (this.apiAliases[rawLabel]) return this.apiAliases[rawLabel];

//     if (cleanLabel.includes('education_journey')) return 'prospect_education_journey';
//     if (cleanLabel.includes('speech_pathology') || cleanLabel.includes('best_describes_you')) return 'which_best_describes_you';
//     if (cleanLabel.includes('work_experience') || cleanLabel.includes('years_of_work') || cleanLabel.includes('years_of_experience')) return 'work_experience';
//     if (cleanLabel.includes('highest_level') || cleanLabel.includes('level_of_education')) return 'highest_level_of_education';

//     if (cleanLabel.includes('first_name') || cleanLabel.includes('given_name')) return 'first_name';
//     if (cleanLabel.includes('last_name') || cleanLabel.includes('surname')) return 'last_name';
//     if (cleanLabel.includes('email')) return 'email';
//     if (cleanLabel.includes('company')) return 'company';
//     if (cleanLabel.includes('phone') || cleanLabel.includes('mobile') || cleanLabel.includes('contact')) return 'phone';
//     if (cleanLabel.includes('postal') || cleanLabel.includes('zip')) return 'postal_code';
//     if (cleanLabel.includes('email_opt_out')) return 'email_opt_in';
//     if (cleanLabel.includes('do_not_call')) return 'call_opt_in';
//     if (cleanLabel.includes('gdpr') && cleanLabel.includes('opt')) return 'lead_share_opt_in';
//     if (cleanLabel.includes('b2b_interest')) return 'b2b_interest';

//     return cleanLabel || label;
//   }

//   static map(enteredValues: Record<string, any>): Record<string, any> {
//     const payload: Record<string, any> = {};

//     for (const [label, rawValue] of Object.entries(enteredValues)) {
//       if (rawValue === undefined || rawValue === null || rawValue === '') continue;

//       const candidateKey = this.resolveApiKey(label);
//       let finalValue = rawValue;
//       const boolLike = this.normalizeBooleanLike(finalValue);

//       if (['email_opt_in', 'call_opt_in', 'lead_share_opt_in'].includes(candidateKey)) {
//         if (boolLike === true) finalValue = 'Opt In';
//         else if (boolLike === false) finalValue = 'Opt Out';
//       }
//       else if (['b2b_interest'].includes(candidateKey)) {
//         if (boolLike === true) finalValue = 'true';
//         else if (boolLike === false) finalValue = 'false';
//       }
//       else if (['gdpr_prospectpartner_opt_in'].includes(candidateKey)) {
//         if (boolLike === true) finalValue = true;
//         else if (boolLike === false) finalValue = false;
//       }

//       payload[candidateKey] = finalValue;
//     }

//     return payload;
//   }
// }
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