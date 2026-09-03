import { test, expect } from '@playwright/test';
import { PayloadMapper } from '../utils/api/PayloadMapper';
import { PayloadValidator } from '../utils/api/PayloadValidator';

test.describe('Dynamic payload validation', () => {
  test('maps B2B positive scenario values for the expected API fields', () => {
    const enteredValues = {
      first_name: 'Ava',
      last_name: 'Patel',
      email: 'skumarvutukuri+test+currentdate@2u.com',
      b2b_interest: 'yes',
      company: 'Acme Learning',
      estimated_size_of_organization: '1-10',
      number_of_learners: '1-50',
      contact_intention: 'Learn more',
      phone: '+919999999999',
      email_opt_out: 'yes',
      do_not_call: 'yes',
      gdprProspect2uOptIn: 'true'
    };

    const expected = PayloadMapper.map(enteredValues);

    expect(expected.first_name).toBe('Ava');
    expect(expected.last_name).toBe('Patel');
    expect(expected.email).toBe('skumarvutukuri+test+currentdate@2u.com');
    expect(expected.b2b_interest).toBe('true');
    expect(expected.company).toBe('Acme Learning');
    expect(expected.email_opt_in).toBe('Opt In');
    expect(expected.call_opt_in).toBe('Opt In');
    expect(expected.lead_share_opt_in).toBe('Opt In');

    const actualPayload = {
      ...expected,
      form_id: 3711,
      credential_type: 'B2B',
      lead_source: 'admit_web',
      email_opt_in: 'Opt In',
      call_opt_in: 'Opt In',
      lead_share_opt_in: 'Opt In'
    };

    expect(() => PayloadValidator.validate(actualPayload, expected, 'positive')).not.toThrow();
  });

  test('maps B2B negative scenario values for the expected API fields', () => {
    const enteredValues = {
      first_name: 'Noah',
      last_name: 'Singh',
      email: 'skumarvutukuri+test+currentdate@2u.com',
      b2b_interest: 'no',
      company: 'Example Co',
      estimated_size_of_organization: '11-50',
      number_of_learners: '51-100',
      contact_intention: 'Be contacted',
      phone: '+919988776655',
      email_opt_out: 'no',
      do_not_call: 'no',
      gdprProspect2uOptIn: 'false'
    };

    const expected = PayloadMapper.map(enteredValues);

    expect(expected.b2b_interest).toBe('false');
    expect(expected.email_opt_in).toBe('Opt Out');
    expect(expected.call_opt_in).toBe('Opt Out');
    expect(expected.lead_share_opt_in).toBe('Opt Out');

    const actualPayload = {
      ...expected,
      form_id: 3711,
      credential_type: 'B2B',
      email_opt_in: 'Opt Out',
      call_opt_in: 'Opt Out',
      lead_share_opt_in: 'Opt Out'
    };

    expect(() => PayloadValidator.validate(actualPayload, expected, 'negative')).not.toThrow();
  });

  test('maps optional phone and other group fields dynamically across non-B2B forms', () => {
    const enteredValues = {
      phone_optional: '+913923859143',
      postal_code: '12345',
      please_select_a_state: 'California',
      country_of_residence: 'United States',
      are_you_military_affiliated: 'No',
      which_program_most_interests_you: 'Master of Science',
      how_many_years_of_professional_work_experience_do_you_have: '3 to 5 years'
    };

    const expected = PayloadMapper.map(enteredValues);

    expect(expected.phone).toBe('+913923859143');
    expect(expected.postal_code).toBe('12345');
    expect(expected.state).toBe('California');
    expect(expected.country_of_residence).toBe('United States');
    expect(expected.are_you_military_affiliated).toBe('No');
    expect(expected.which_program_most_interests_you).toBe('Master of Science');
    expect(expected.how_many_years_of_professional_work_experience_do_you_have).toBe('3 to 5 years');
  });
});
