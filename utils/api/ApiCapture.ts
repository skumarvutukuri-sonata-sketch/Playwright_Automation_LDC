import { Page, Request, Response } from '@playwright/test';

export class ApiCapture {

    static async capture(page: Page, endpoint: string) {

        const requestPromise = page.waitForRequest(request =>
            request.url().includes(endpoint) &&
            request.method() === 'POST'
        );

        const responsePromise = page.waitForResponse(response =>
            response.url().includes(endpoint) &&
            response.request().method() === 'POST'
        );

        return {
            requestPromise,
            responsePromise
        };
    }

    static async getRequestPayload(request: Request): Promise<any> {
        return request.postDataJSON();
    }

    static async getResponseBody(response: Response): Promise<any> {
        try {
            return await response.json();
        } catch {
            return await response.text();
        }
    }
}