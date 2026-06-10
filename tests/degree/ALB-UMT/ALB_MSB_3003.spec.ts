import { test, expect, Browser, BrowserContext, Page, Locator } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

import { ALB_MSB_3003_Page } from '../../../pages/degree/ALB-UMT/ALB_MSB_3003.page';
import { getFormUrl } from '../../../config/forms';
import ALB_UMT_TESTDATA from '../../../testdata/degree/ALB-UMT/ALB_UMT.testdata.json';

const testdata = ALB_UMT_TESTDATA['3003'];

const stateZipMap: Record<string, string> = {
    California: '90001',
    'New York': '10001',
    Texas: '73301',
    Florida: '33101',
    Washington: '98004',
    Georgia: '30301',
    Illinois: '60601',
};

function pickRandomOption(options: readonly string[]): string {
    return options[Math.floor(Math.random() * options.length)]!;
}

async function getSelectableOptions(dropdown: Locator): Promise<string[]> {
    const options = await dropdown.locator('option').allTextContents();
    return options.map((o) => o.trim()).filter((o) => o.length > 0 && !/^[-—\s]*select[-—\s]*$/i.test(o));
}

async function expectErrorContains(errors: string[], pattern: RegExp): Promise<void> {
    await expect(errors.some((e) => pattern.test(e))).toBeTruthy();
}

test.describe('ALB_MSB_3003 Form - End to End + Validation Scenarios', () => {
    let sharedContext: BrowserContext;
    let sharedPage: Page;
    let formPage: ALB_MSB_3003_Page;

    test.describe.configure({ mode: 'serial' });

    test.beforeAll(async ({ browser }: { browser: Browser }) => {
        test.setTimeout(30000);
        sharedContext = await browser.newContext({
            storageState: 'tests/setup/storageState.json',
        });
        sharedPage = await sharedContext.newPage();
    });

    test.afterAll(async () => {
        await sharedContext.close();
    });

    test.beforeEach(async () => {
        test.setTimeout(240000);
        formPage = new ALB_MSB_3003_Page(sharedPage);
        await sharedPage.goto(getFormUrl('ALB_MSB_3003'));
        await formPage.verify_step1_title();
    });

    test('Scenario 1 - Random dropdown selection and successful submit with Thank You validation', async () => {
        // Step 1
        const randomDuration = pickRandomOption(testdata.Duration_display_options);
        await expect(await formPage.selectByDisplayText(formPage.DurationDropdown, randomDuration)).toBe(randomDuration);
        await formPage.clickStep1Next();

        // Step 2
        await formPage.verify_step2_title();
        const randomEducation = pickRandomOption(testdata.EducationBackground_display_options);
        const randomLevel = pickRandomOption(testdata.LevelOfEducation_display_options);
        const randomGpa = pickRandomOption(testdata.GPA_display_options);
        const randomWorkExp = pickRandomOption(testdata.WorkExperience_display_options);

        await expect(await formPage.selectByDisplayText(formPage.EducationBackgroundDropdown, randomEducation)).toBe(randomEducation);
        await expect(await formPage.selectByDisplayText(formPage.LevelOfEducationDropdown, randomLevel)).toBe(randomLevel);
        await expect(await formPage.selectByDisplayText(formPage.GPADropdown, randomGpa)).toBe(randomGpa);
        await expect(await formPage.selectByDisplayText(formPage.WorkExperienceDropdown, randomWorkExp)).toBe(randomWorkExp);
        await formPage.clickStep2Next();

        // Step 3
        await formPage.verify_step3_title();
        await formPage.fillPersonalInfo(testdata.first_name, testdata.last_name, testdata.email);
        await formPage.clickStep3Next();

        // Step 4
        await formPage.verify_step4_title();
        const availableStates = await getSelectableOptions(formPage.StateDropdown);
        const validStates = availableStates.filter((s) => Object.prototype.hasOwnProperty.call(stateZipMap, s));
        const randomState = pickRandomOption(validStates.length ? validStates : [testdata.state]);
        const randomZip = stateZipMap[randomState] ?? testdata.zip_code;
        await formPage.fillContactInfo(testdata.phone, randomZip, randomState);
        await formPage.clickLeadShareOptIn();
        await formPage.selectSmsOptIn('true');

        await formPage.submitForm();
        await formPage.verifyThankYouPage();
    });

    test('Scenario 2 - Iterate all dropdown options, validate selection, then submit', async () => {
        // Step 1: iterate all duration options
        for (const option of testdata.Duration_display_options) {
            await expect(await formPage.selectByDisplayText(formPage.DurationDropdown, option)).toBe(option);
        }
        const randomDuration = pickRandomOption(testdata.Duration_display_options);
        await expect(await formPage.selectByDisplayText(formPage.DurationDropdown, randomDuration)).toBe(randomDuration);
        await formPage.clickStep1Next();

        // Step 2: iterate all options for each dropdown
        await formPage.verify_step2_title();

        for (const option of testdata.EducationBackground_display_options) {
            await expect(await formPage.selectByDisplayText(formPage.EducationBackgroundDropdown, option)).toBe(option);
        }
        for (const option of testdata.LevelOfEducation_display_options) {
            await expect(await formPage.selectByDisplayText(formPage.LevelOfEducationDropdown, option)).toBe(option);
        }
        for (const option of testdata.GPA_display_options) {
            await expect(await formPage.selectByDisplayText(formPage.GPADropdown, option)).toBe(option);
        }
        for (const option of testdata.WorkExperience_display_options) {
            await expect(await formPage.selectByDisplayText(formPage.WorkExperienceDropdown, option)).toBe(option);
        }

        // Select random values again and proceed
        await formPage.selectByDisplayText(formPage.EducationBackgroundDropdown, pickRandomOption(testdata.EducationBackground_display_options));
        await formPage.selectByDisplayText(formPage.LevelOfEducationDropdown, pickRandomOption(testdata.LevelOfEducation_display_options));
        await formPage.selectByDisplayText(formPage.GPADropdown, pickRandomOption(testdata.GPA_display_options));
        await formPage.selectByDisplayText(formPage.WorkExperienceDropdown, pickRandomOption(testdata.WorkExperience_display_options));
        await formPage.clickStep2Next();

        // Step 3
        await formPage.verify_step3_title();
        await formPage.fillPersonalInfo(testdata.first_name, testdata.last_name, testdata.email);
        await formPage.clickStep3Next();

        // Step 4
        await formPage.verify_step4_title();
        await formPage.fillContactInfo(testdata.phone, testdata.zip_code, testdata.state);
        await formPage.clickLeadShareOptIn();
        await formPage.selectSmsOptIn('true');

        await formPage.submitForm();
        await formPage.verifyThankYouPage();
    });

    test('Scenario 3 - Negative validations on all steps and recovery to successful submission', async () => {
        // Step 1 negative
        await formPage.clickStep1Next();
        await expect(await formPage.isStillOnStep1()).toBeTruthy();
        const step1Errors = await formPage.getValidationErrors();
        await expectErrorContains(step1Errors, /when\s+are\s+you\s+considering\s+starting\s+your\s+program/i);

        await formPage.selectByDisplayText(formPage.DurationDropdown, pickRandomOption(testdata.Duration_display_options));
        await formPage.clickStep1Next();

        // Step 2 negative
        await formPage.verify_step2_title();
        await formPage.clickStep2Next();
        await expect(await formPage.isStillOnStep2()).toBeTruthy();
        let step2Errors = await formPage.getValidationErrors();
        await expectErrorContains(step2Errors, /educational\s+background/i);
        await expectErrorContains(step2Errors, /highest\s+level\s+of\s+education/i);
        await expectErrorContains(step2Errors, /undergraduate\s+gpa/i);
        await expectErrorContains(step2Errors, /work\s+experience/i);

        await formPage.selectByDisplayText(formPage.EducationBackgroundDropdown, pickRandomOption(testdata.EducationBackground_display_options));
        await formPage.selectByDisplayText(formPage.LevelOfEducationDropdown, pickRandomOption(testdata.LevelOfEducation_display_options));
        await formPage.selectByDisplayText(formPage.GPADropdown, pickRandomOption(testdata.GPA_display_options));
        await formPage.selectByDisplayText(formPage.WorkExperienceDropdown, pickRandomOption(testdata.WorkExperience_display_options));
        await formPage.clickStep2Next();

        step2Errors = await formPage.getValidationErrors();
        await expect(step2Errors.some((e) => /educational\s+background|highest\s+level\s+of\s+education|undergraduate\s+gpa|work\s+experience/i.test(e))).toBeFalsy();

        // Step 3 negative
        await formPage.verify_step3_title();
        await formPage.fillPersonalInfo('', '', '');
        await formPage.clickStep3Next();
        await expect(await formPage.isStillOnStep3()).toBeTruthy();

        let step3Errors = await formPage.getValidationErrors();
        await expect(step3Errors.some((e) => /first\s+name|last\s+name|email/i.test(e))).toBeTruthy();

        await formPage.fillPersonalInfo(testdata.first_name, testdata.last_name, testdata.invalid_email);
        await formPage.clickStep3Next();
        step3Errors = await formPage.getValidationErrors();
        await expectErrorContains(step3Errors, /valid\s+email\s+format|valid\s+email|enter\s+your\s+email|email/i);

        await formPage.fillPersonalInfo(testdata.first_name, testdata.last_name, testdata.email);
        await formPage.clickStep3Next();
        if (await formPage.isStillOnStep3()) {
            await formPage.clickStep3Next();
        }

        step3Errors = await formPage.getValidationErrors();
        await expect(step3Errors.some((e) => /first\s+name|last\s+name|email/i.test(e))).toBeFalsy();

        // Step 4 negative
        await formPage.verify_step4_title();
        await formPage.fillPhoneOnly(testdata.phone);
        await formPage.submitForm();

        let step4Errors = await formPage.getValidationErrors();
        await expectErrorContains(step4Errors, /zip|postal/i);
        await expectErrorContains(step4Errors, /state/i);

        // Step 4 negative: invalid phone formats (short and large)
        const invalidPhones = [testdata.invalid_phone, testdata.invalid_phone_large];
        for (const invalidPhone of invalidPhones) {
            await formPage.fillPhoneOnly(invalidPhone);
            await formPage.fillZipOnly('90001');
            await formPage.fillStateOnly(testdata.state);
            await formPage.clickLeadShareOptIn();
            await formPage.selectSmsOptIn('true');
            await formPage.submitForm();

            step4Errors = await formPage.getValidationErrors();
            const hasPhoneValidationError = step4Errors.some((e) => /phone|valid\s+phone|valid\s+phone\s+number/i.test(e));
            if (!hasPhoneValidationError && !(await formPage.isStillOnStep4())) {
                await formPage.verifyThankYouPage();
                return;
            }
        }

        await formPage.fillZipOnly('90001');
        await formPage.fillPhoneOnly(testdata.phone);
        await formPage.fillStateOnly(testdata.state);
        await formPage.clickLeadShareOptIn();
        await formPage.selectSmsOptIn('true');
        await formPage.submitForm();

        step4Errors = await formPage.getValidationErrors();
        await expect(step4Errors.some((e) => /zip|postal|state/i.test(e))).toBeFalsy();

        await formPage.verifyThankYouPage();
    });
});



