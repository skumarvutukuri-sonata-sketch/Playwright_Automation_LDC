import { expect } from '@playwright/test';
import { Logger } from '../Logger';

export class PayloadValidator {
  /**
   * Compares the actual intercepted request payload against what the UI logic intended to send.
   */
  static validate(actualPayload: any, expectedPayload: any) {
    Logger.action('Validating API Request Payload...');
    
    try {
      // expect.objectContaining allows the actual payload to have extra metadata fields
      // while still strictly verifying the exact data our UI typed in.
      expect(actualPayload).toEqual(expect.objectContaining(expectedPayload));
      
      Logger.success('✅ API Payload validation passed! The data sent matches the UI input.');
    } catch (error) {
      Logger.error(`❌ API Payload mismatch!`);
      Logger.error(`Expected (Partial): ${JSON.stringify(expectedPayload, null, 2)}`);
      Logger.error(`Actual Sent: ${JSON.stringify(actualPayload, null, 2)}`);
      throw error;
    }
  }
}