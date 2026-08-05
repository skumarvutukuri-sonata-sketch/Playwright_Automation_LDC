import { test } from '@playwright/test';
import { FormRunner } from '../utils/FormRunner';
import { CSVManager } from '../utils/CSVManager';
import { FormChangeDetector } from '../utils/FormChangeDetector';
import { FieldCaptureBus } from '../utils/FieldCaptureBus';

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
            // POSITIVE PATH
            // ==========================================
            test(`${testIdentifier} - Positive Path`, async ({ page }, testInfo) => {
                // 🚀 Increased timeout to 2 minutes
                test.setTimeout(120000);

                await page.goto(formConfig.url, { waitUntil: 'domcontentloaded' });
                const frame = page.frameLocator('iframe');
                await page.waitForTimeout(1500);

                const runner = new FormRunner(page, frame);
                let metrics;

                try {
                    metrics = await runner.run(formId, formConfig, 'positive');
                    testInfo.annotations.push({
                        type: 'test-cases',
                        description: `total=${metrics.total}, passed=${metrics.passed}, failed=${metrics.failed}`
                    });
                } catch (error: any) {
                    throw error;
                } finally {
                    // ✅ FIELD CAPTURE & GATEKEEPER LOGIC
                    try {
                        const detector = new FormChangeDetector();
                        const snapshot = detector.buildSnapshotFromBus(formId);

                        if (snapshot) {
                            const baseline = detector.loadBaseline(formId, sheetName);
                            
                            // Check for the Gatekeeper Flag
                            const forceUpdate = process.env.UPDATE_BASELINES === 'true';

                            if (!baseline || forceUpdate) {
                                if (forceUpdate && baseline) {
                                    console.log(`🔄 UPDATE FLAG DETECTED: Overwriting baseline for ${formId} with new approved structure.`);
                                }
                                // FIRST RUN or APPROVED UPDATE: save as baseline
                                detector.saveBaseline(snapshot, sheetName);
                                console.log(`\n📸 BASELINE SAVED: ${formId}`);
                                console.log(`   Steps: ${snapshot.totalSteps} | Fields: ${snapshot.totalFieldCount}`);
                            } else {
                                // SUBSEQUENT RUNS: strict compare and alert (No overwriting!)
                                const changes = detector.detectChanges(snapshot, baseline);
                                detector.displayChanges(formId, changes);
                                
                                if (changes.length > 0) {
                                    // 🚀 THE FIX: Save the changes to a temp folder instead of sending individual emails
                                    const fs = require('fs');
                                    const path = require('path');
                                    const changesDir = path.resolve('reports', 'form-changes');
                                    
                                    if (!fs.existsSync(changesDir)) {
                                        fs.mkdirSync(changesDir, { recursive: true });
                                    }
                                    
                                    fs.writeFileSync(
                                        path.join(changesDir, `${formId}_changes.json`),
                                        JSON.stringify({ formId, category: sheetName, changes }, null, 2)
                                    );
                                    
                                    console.log(`🔒 Baseline protected. Changes logged for consolidated email. Run with UPDATE_BASELINES=true to approve.`);
                                }
                            }
                        }
                    } catch (captureError) {
                        // Never fail the test due to capture errors
                        console.log(`⚠️  Field capture error for ${formId}:`, captureError);
                    }
                }
            });

            // ==========================================
            // NEGATIVE PATH
            // ==========================================
            test(`${testIdentifier} - Negative Path`, async ({ page }, testInfo) => {
                // 🚀 FIX: Increased timeout to 4 minutes (240000ms) for heavy validation loops
                test.setTimeout(240000);

                await page.goto(formConfig.url, { waitUntil: 'domcontentloaded' });
                const frame = page.frameLocator('iframe');
                await page.waitForTimeout(1500);
                const runner = new FormRunner(page, frame);

                try {
                    const metrics = await runner.run(formId, formConfig, 'negative');
                    testInfo.annotations.push({
                        type: 'test-cases',
                        description: `total=${metrics.total}, passed=${metrics.passed}, failed=${metrics.failed}`
                    });
                } catch (error: any) {
                    throw error;
                } finally {
                    // Prevent memory leaks by clearing the bus after the negative run
                    FieldCaptureBus.getAndClear(formId);
                }
            });
        }
    });
}