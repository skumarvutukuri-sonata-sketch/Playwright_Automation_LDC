import { test } from '@playwright/test';
import { FormRunner } from '../utils/FormRunner';
import { CSVManager } from '../utils/CSVManager'; 
import { ReportManager } from '../utils/reporting/ReportManager'; 

const waitForAuthenticatedFormPage = async (page: any, targetUrl: string): Promise<void> => {
    if (!/onelogin\.com/i.test(page.url())) {
        return;
    }

    console.log(`=== Redirected to OneLogin for ${targetUrl}. Please approve MFA if prompted. ===`);

    try {
        await page.waitForURL((url: URL) => !/onelogin\.com/i.test(url.href), { timeout: 240000 });
    } catch {
        // If auto-redirect does not happen, retry target URL after MFA approval.
        await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
    }
};

// 🚀 HELPER: Safely find columns ignoring Excel trailing spaces or casing changes
const getCleanValue = (row: any, keyword: 'group' | 'form' | 'run' | 'url'): string => {
    const keys = Object.keys(row);
    const matchedKey = keys.find(k => k.toLowerCase().trim().includes(keyword));
    return matchedKey ? String(row[matchedKey]).trim() : '';
};

// 🚀 THE WORKER FIX: Detect the grep filter flag in the main process terminal arguments
const cliArgs = process.argv.slice(2);
const hasGrepFlag = cliArgs.some(arg => arg === '-g' || arg === '--grep');

// If the main process detects a search, share it in environment memory so workers inherit it!
if (hasGrepFlag) {
    process.env.CLI_SEARCH_ACTIVE = 'true';
}

// This now reads identically as 'true' in BOTH the main process and the worker processes!
const isSearchingViaCli = process.env.CLI_SEARCH_ACTIVE === 'true';

// Available sheets to look through
const SHEETS: Array<'Short_Courses' | 'Degree'> = ['Short_Courses', 'Degree'];

for (const sheetName of SHEETS) {
    const allData = CSVManager.getTestData(sheetName);
    const categoryLabel = sheetName === 'Short_Courses' ? 'Short Courses' : 'Degree';

    // Filter data smartly based on how you ran the command
    const testData = allData.filter(row => {
        if (!getCleanValue(row, 'url')) return false;
        
        // If we are searching via CLI keyword, load everything so Playwright can native-grep your match
        if (isSearchingViaCli) return true;
        
        // Default: If you just type 'npx playwright test', only run Short_Courses marked 'Yes'
        return sheetName === 'Short_Courses' && getCleanValue(row, 'run').toLowerCase() === 'yes';
    });

    test.describe(`Suite - ${sheetName}`, () => {
        for (const row of testData) {
            const formId = getCleanValue(row, 'form');
            const groupName = getCleanValue(row, 'group') || 'Unknown';
            const url = getCleanValue(row, 'url');
            const formConfig = { url, group: groupName, category: categoryLabel };

            // Embedding metadata in brackets creates instant search tags for the CLI
            const testIdentifier = `[Sheet:${sheetName}] [Group:${groupName}] [Form:${formId}]`;

            // ==========================================
            // HAPPY PATH
            // ==========================================
            test(`${testIdentifier} - Happy Path`, async ({ page }, testInfo) => {
                const formKey = `${formId}_happy`;
                ReportManager.startForm(formKey);

                await page.goto(formConfig.url, { waitUntil: 'domcontentloaded' });
                await waitForAuthenticatedFormPage(page, formConfig.url);
                const frame = page.frameLocator('iframe');
                await page.waitForTimeout(1500);
                const runner = new FormRunner(page, frame);

                try {
                    await runner.run(formId, formConfig, 'happy');
                    ReportManager.pass(formKey, groupName, formId, 'happy');
                } catch (error: any) {
                    if (testInfo.retry === testInfo.project.retries) {
                        ReportManager.fail(formKey, groupName, formId, 'happy', error.message);
                    }
                    throw error;
                }
            });

            // ==========================================
            // VALIDATION PATH
            // ==========================================
            test(`${testIdentifier} - Validation Path`, async ({ page }, testInfo) => {
                const formKey = `${formId}_validation`;
                ReportManager.startForm(formKey);

                await page.goto(formConfig.url, { waitUntil: 'domcontentloaded' });
                await waitForAuthenticatedFormPage(page, formConfig.url);
                const frame = page.frameLocator('iframe');
                await page.waitForTimeout(1500);
                const runner = new FormRunner(page, frame);

                try {
                    await runner.run(formId, formConfig, 'validation');
                    ReportManager.pass(formKey, groupName, formId, 'validation');
                } catch (error: any) {
                    if (testInfo.retry === testInfo.project.retries) {
                        ReportManager.fail(formKey, groupName, formId, 'validation', error.message);
                    }
                    throw error;
                }
            });
        }
    });
}