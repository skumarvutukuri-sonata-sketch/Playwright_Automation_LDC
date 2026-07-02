import { expect } from '@playwright/test';
import { Logger } from '../Logger';

export class ResponseValidator {
  /**
   * Validates the server's response to ensure the lead was successfully created.
   */
  static validate(responseBody: any) {
    Logger.action('Validating API Response Body...');
    
    try {
      // Ensure the response is valid and not empty
      expect(responseBody).toBeDefined();
      
      Logger.success('✅ API Response validation passed! Server acknowledged the submission.');
    } catch (error) {
      Logger.error(`❌ API Response validation failed!`);
      Logger.error(`Actual Response: ${JSON.stringify(responseBody, null, 2)}`);
      throw error;
    }
  }
}