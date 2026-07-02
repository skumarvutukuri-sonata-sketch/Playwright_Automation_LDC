import { Request, Response } from '@playwright/test';

export class ApiCapture {
  /**
   * Safely extracts the POST payload that the browser sent to the server.
   */
  static async getRequestPayload(request: Request): Promise<any> {
    try {
      const postData = request.postDataJSON();
      return postData || {};
    } catch (e) {
      return { error: 'Could not parse request payload as JSON' };
    }
  }

  /**
   * Safely extracts the response body that the server sent back.
   */
  static async getResponseBody(response: Response): Promise<any> {
    try {
      const text = await response.text();
      return text ? JSON.parse(text) : {};
    } catch (e) {
      return { error: 'Could not parse response body as JSON' };
    }
  }
}