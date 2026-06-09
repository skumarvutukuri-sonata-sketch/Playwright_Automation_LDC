import { Page, Locator, expect } from '@playwright/test';
import { CommonUtils_UI } from '../../../utils/common_utils';

export class ALB_MSB_3003_Page {

    readonly page: Page;

    // Step 1
    readonly step1_title: Locator;
    readonly DurationDropdown: Locator;
    readonly DegreeDropdown: Locator;
    readonly step1_NextButton: Locator;

    // Step 2
    readonly step2_title: Locator;
    readonly EducationBackgroundDropdown: Locator;
    readonly LevelOfEducationDropdown: Locator;
    readonly GPADropdown: Locator;
    readonly WorkExperienceDropdown: Locator;
    readonly step2_NextButton: Locator;

    // Step 3
    readonly step3_title: Locator;
    readonly FirstName: Locator;
    readonly LastName: Locator;
    readonly Email: Locator;
    readonly step3_NextButton: Locator;

    // Step 4
    readonly step4_title: Locator;
    readonly Phone: Locator;
    readonly ZipCode: Locator;
    readonly CountryDropdown: Locator;
    readonly StateDropdown: Locator;
    readonly LeadShareOptIn: Locator;
    readonly SmsOptInTrue: Locator;
    readonly SmsOptInFalse: Locator;
    readonly SubmitButton: Locator;

    constructor(page: Page) {
        this.page = page;

        // Step 1
        this.step1_title = page.frameLocator('iframe[title="Taxi Form Preview"]').getByText('Step 1 of 4', { exact: true });
        this.DurationDropdown = page.frameLocator('iframe[title="Taxi Form Preview"]').locator('#bodega-taxiselect-field-prospect_education_journey');
        this.DegreeDropdown = page.frameLocator('iframe[title="Taxi Form Preview"]').locator('#bodega-taxiselect-field-degree');
        this.step1_NextButton = page.frameLocator('iframe[title="Taxi Form Preview"]').getByRole('button', { name: 'Next Step' }).first();

        // Step 2
        this.step2_title = page.frameLocator('iframe[title="Taxi Form Preview"]').getByText('Step 2 of 4', { exact: true });
        this.EducationBackgroundDropdown = page.frameLocator('iframe[title="Taxi Form Preview"]').locator('#bodega-taxiselect-field-major_educational_background');
        this.LevelOfEducationDropdown = page.frameLocator('iframe[title="Taxi Form Preview"]').locator('#bodega-taxiselect-field-level_of_education');
        this.GPADropdown = page.frameLocator('iframe[title="Taxi Form Preview"]').locator('#bodega-taxiselect-field-stated_gpa_range');
        this.WorkExperienceDropdown = page.frameLocator('iframe[title="Taxi Form Preview"]').locator('#bodega-taxiselect-field-work_experience');
        this.step2_NextButton = page.frameLocator('iframe[title="Taxi Form Preview"]').getByRole('button', { name: 'Next Step' }).first();

        // Step 3
        this.step3_title = page.frameLocator('iframe[title="Taxi Form Preview"]').getByText('Step 3 of 4', { exact: true });
        this.FirstName = page.frameLocator('iframe[title="Taxi Form Preview"]').locator('#bodega-taxitext-field-first_name');
        this.LastName = page.frameLocator('iframe[title="Taxi Form Preview"]').locator('#bodega-taxitext-field-last_name');
        this.Email = page.frameLocator('iframe[title="Taxi Form Preview"]').locator('#bodega-taxiemail');
        this.step3_NextButton = page.frameLocator('iframe[title="Taxi Form Preview"]').getByRole('button', { name: 'Next Step' }).first();

        // Step 4
        this.step4_title = page.frameLocator('iframe[title="Taxi Form Preview"]').getByText('Step 4 of 4', { exact: true });
        this.Phone = page.frameLocator('iframe[title="Taxi Form Preview"]').locator('#bodega-taxiphone-field-phone');
        this.ZipCode = page.frameLocator('iframe[title="Taxi Form Preview"]').locator('#bodega-taxitext-field-zip_code');
        this.CountryDropdown = page.frameLocator('iframe[title="Taxi Form Preview"]').locator('#bodega-taxiselect-field-country');
        this.StateDropdown = page.frameLocator('iframe[title="Taxi Form Preview"]').locator('#bodega-taxiselect-field-state');
        this.LeadShareOptIn = page.frameLocator('iframe[title="Taxi Form Preview"]').locator('#bodega-taxicheck-box-lead_share_opt_in');
        this.SmsOptInTrue = page.frameLocator('iframe[title="Taxi Form Preview"]').locator('#bodega-taxiradio-field-sms_opt_in_marketing-true');
        this.SmsOptInFalse = page.frameLocator('iframe[title="Taxi Form Preview"]').locator('#bodega-taxiradio-field-sms_opt_in_marketing-false');
        this.SubmitButton = page.frameLocator('iframe[title="Taxi Form Preview"]').locator('button:has-text("Submit"):visible').first();
    }

    // ---- Step 1 ----
    async verify_step1_title(): Promise<string> {
        await this.step1_title.waitFor({ state: 'visible', timeout: 30000 });
        await expect(this.step1_title).toBeVisible();
        const text = await this.step1_title.textContent();
        console.log('Step 1 title text is: ' + text);
        return text!;
    }

    async getDurationDropdownOptions(): Promise<string[]> {
        return await CommonUtils_UI.getDropdownOptions(this.DurationDropdown);
    }

    async selectDurationDropdownOption(value: string): Promise<void> {
        await CommonUtils_UI.selectDropdownValue(this.DurationDropdown, value);
    }

    async getDegreeDropdownOptions(): Promise<string[]> {
        return await CommonUtils_UI.getDropdownOptions(this.DegreeDropdown);
    }

    async isDegreeDropdownVisible(): Promise<boolean> {
        return await this.DegreeDropdown.isVisible().catch(() => false);
    }

    async selectDegreeDropdownOption(value: string): Promise<void> {
        await CommonUtils_UI.selectDropdownValue(this.DegreeDropdown, value);
    }

    async clickStep1Next(): Promise<void> {
        await this.step1_NextButton.click();
    }

    // ---- Step 2 ----
    async verify_step2_title(): Promise<string> {
        await this.step2_title.waitFor({ state: 'visible', timeout: 15000 });
        await expect(this.step2_title).toBeVisible();
        const text = await this.step2_title.textContent();
        console.log('Step 2 title text is: ' + text);
        return text!;
    }

    async getEducationBackgroundOptions(): Promise<string[]> {
        return await CommonUtils_UI.getDropdownOptions(this.EducationBackgroundDropdown);
    }

    async selectEducationBackground(value: string): Promise<void> {
        await CommonUtils_UI.selectDropdownValue(this.EducationBackgroundDropdown, value);
    }

    async getLevelOfEducationOptions(): Promise<string[]> {
        return await CommonUtils_UI.getDropdownOptions(this.LevelOfEducationDropdown);
    }

    async selectLevelOfEducation(value: string): Promise<void> {
        await CommonUtils_UI.selectDropdownValue(this.LevelOfEducationDropdown, value);
    }

    async getGPAOptions(): Promise<string[]> {
        return await CommonUtils_UI.getDropdownOptions(this.GPADropdown);
    }

    async selectGPA(value: string): Promise<void> {
        await CommonUtils_UI.selectDropdownValue(this.GPADropdown, value);
    }

    async getWorkExperienceOptions(): Promise<string[]> {
        return await CommonUtils_UI.getDropdownOptions(this.WorkExperienceDropdown);
    }

    async selectWorkExperience(value: string): Promise<void> {
        await CommonUtils_UI.selectDropdownValue(this.WorkExperienceDropdown, value);
    }

    async clickStep2Next(): Promise<void> {
        await this.step2_NextButton.click();
    }

    // ---- Step 3 ----
    async verify_step3_title(): Promise<string> {
        await this.step3_title.waitFor({ state: 'visible', timeout: 15000 });
        await expect(this.step3_title).toBeVisible();
        const text = await this.step3_title.textContent();
        console.log('Step 3 title text is: ' + text);
        return text!;
    }

    async fillPersonalInfo(firstName: string, lastName: string, email: string): Promise<void> {
        await CommonUtils_UI.enterDataInTextBox(this.FirstName, firstName);
        await CommonUtils_UI.enterDataInTextBox(this.LastName, lastName);
        await CommonUtils_UI.enterDataInTextBox(this.Email, email);
    }

    async clickStep3Next(): Promise<void> {
        await this.step3_NextButton.click();
    }

    // ---- Step 4 ----
    async verify_step4_title(): Promise<string> {
        await this.step4_title.waitFor({ state: 'visible', timeout: 30000 });
        await expect(this.step4_title).toBeVisible({ timeout: 30000 });
        const text = await this.step4_title.textContent();
        console.log('Step 4 title text is: ' + text);
        return text!;
    }

    async fillContactInfo(phone: string, zipCode: string, state: string): Promise<void> {
        await CommonUtils_UI.enterDataInTextBox(this.Phone, phone);
        await CommonUtils_UI.enterDataInTextBox(this.ZipCode, zipCode);
        await this.selectCountryIfPresent();

        await this.StateDropdown.waitFor({ state: 'visible', timeout: 15000 });
        await CommonUtils_UI.selectDropdownValue(this.StateDropdown, state);
    }

    async selectCountryIfPresent(preferredCountry: string = 'United States'): Promise<void> {
        if (!(await this.CountryDropdown.count().catch(() => 0))) {
            return;
        }

        await this.CountryDropdown.waitFor({ state: 'attached', timeout: 10000 });

        await this.CountryDropdown.evaluate((selectEl, preferred) => {
            const select = selectEl as HTMLSelectElement;
            const options = Array.from(select.options);
            const isPlaceholder = (text: string) => /^[-—\s]*select[-—\s]*$/i.test(text.trim());

            let index = options.findIndex((o) => o.text.trim().toLowerCase() === String(preferred).toLowerCase());
            if (index < 0) {
                index = options.findIndex((o) => !isPlaceholder(o.text));
            }

            if (index >= 0) {
                select.selectedIndex = index;
                select.dispatchEvent(new Event('input', { bubbles: true }));
                select.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }, preferredCountry);
    }

    async clickLeadShareOptIn(): Promise<void> {
        if (!(await this.LeadShareOptIn.isChecked().catch(() => false))) {
            await this.LeadShareOptIn.check({ force: true });
        }
    }

    async selectSmsOptIn(value: 'true' | 'false'): Promise<void> {
        const target = value === 'true' ? this.SmsOptInTrue : this.SmsOptInFalse;
        if (!(await target.count().catch(() => 0))) {
            return;
        }
        if (!(await target.isVisible().catch(() => false))) {
            return;
        }
        await target.check({ force: true });
    }

    async submitForm(): Promise<void> {
        const frame = this.page.frameLocator('iframe[title="Taxi Form Preview"]');
        const visibleSubmit = frame.getByRole('button', { name: /^Submit$/ }).first();

        await expect(visibleSubmit).toBeVisible({ timeout: 20000 });

        // If dependent fields briefly reset, re-apply country before asserting submit is enabled.
        if (!(await visibleSubmit.isEnabled().catch(() => false))) {
            await this.selectCountryIfPresent();
        }

        await expect(visibleSubmit).toBeEnabled({ timeout: 20000 });
        await visibleSubmit.click();
    }
    async verifyThankYouPage(): Promise<void> {
        const successPatterns = [
            /thank\s*you/i,
            /thank\s*you\s+for\s+requesting\s+information/i,
            /application\s+received/i,
            /request\s+received/i,
            /submitted/i,
            /begin\s+your\s+application/i,
            /learn\s+more/i,
        ];
        const frame = this.page.frameLocator('iframe[title="Taxi Form Preview"]');

        await expect
            .poll(
                async () => {
                    const bodyText = (await frame.locator('body').innerText().catch(() => '')).toLowerCase();
                    return successPatterns.some((pattern) => pattern.test(bodyText));
                },
                {
                    timeout: 45000,
                    intervals: [500, 1000, 2000],
                }
            )
            .toBeTruthy();

        for (const pattern of successPatterns) {
            const inFrame = frame.getByText(pattern).first();
            if (await inFrame.isVisible({ timeout: 20000 }).catch(() => false)) {
                await expect(inFrame).toBeVisible();
                return;
            }
        }

        for (const pattern of successPatterns) {
            const onPage = this.page.getByText(pattern).first();
            if (await onPage.isVisible({ timeout: 20000 }).catch(() => false)) {
                await expect(onPage).toBeVisible();
                return;
            }
        }

        throw new Error('Thank you page/confirmation message was not found after form submission.');
    }

    // ---- Navigation Helpers (quickly pass a step with valid data) ----

    async passStep1WithValidData(): Promise<void> {
        await this.verify_step1_title();
        await CommonUtils_UI.selectDropdownValue(this.DurationDropdown, 'Next available cohort');
        await this.step1_NextButton.click();
        await this.page.waitForTimeout(3000);
    }

    async passStep2WithValidData(): Promise<void> {
        await this.verify_step2_title();
        await CommonUtils_UI.selectDropdownValue(this.EducationBackgroundDropdown, 'Biology/Chemistry');
        await CommonUtils_UI.selectDropdownValue(this.LevelOfEducationDropdown, 'Bachelors');
        await CommonUtils_UI.selectDropdownValue(this.GPADropdown, '4.00 And Above');
        await CommonUtils_UI.selectDropdownValue(this.WorkExperienceDropdown, '3');
        await this.step2_NextButton.click();
        await this.page.waitForTimeout(3000);
    }

    async passStep3WithValidData(): Promise<void> {
        await this.verify_step3_title();
        await CommonUtils_UI.enterDataInTextBox(this.FirstName, 'Test');
        await CommonUtils_UI.enterDataInTextBox(this.LastName, 'User');
        await CommonUtils_UI.enterDataInTextBox(this.Email, 'example-sonatatest@test.2u.com');
        await this.step3_NextButton.click();
        await this.page.waitForTimeout(3000);
    }

    // ---- Step State Checks (verify form did NOT advance) ----

    async isStillOnStep1(): Promise<boolean> {
        return await this.step1_title.isVisible().catch(() => false);
    }

    async isStillOnStep2(): Promise<boolean> {
        return await this.step2_title.isVisible().catch(() => false);
    }

    async isStillOnStep3(): Promise<boolean> {
        return await this.step3_title.isVisible().catch(() => false);
    }

    async isStillOnStep4(): Promise<boolean> {
        return await this.step4_title.isVisible().catch(() => false);
    }

    // ---- Validation Error Helpers ----

    async getValidationErrors(): Promise<string[]> {
        const errorLinks = this.page
            .frameLocator('iframe[title="Taxi Form Preview"]')
            .getByRole('link')
            .filter({ hasText: /please/i });
        return await errorLinks.allTextContents().catch(() => []);
    }

    // ---- Individual Field Entry Methods (for negative tests) ----

    async enterDataInFirstName(value: string): Promise<void> {
        await CommonUtils_UI.enterDataInTextBox(this.FirstName, value);
    }

    async enterDataInLastName(value: string): Promise<void> {
        await CommonUtils_UI.enterDataInTextBox(this.LastName, value);
    }

    async enterDataInEmail(value: string): Promise<void> {
        await CommonUtils_UI.enterDataInTextBox(this.Email, value);
    }

    async fillPhoneAndZip(phone: string, zipCode: string): Promise<void> {
        await CommonUtils_UI.enterDataInTextBox(this.Phone, phone);
        await CommonUtils_UI.enterDataInTextBox(this.ZipCode, zipCode);
    }

    async fillPhoneOnly(phone: string): Promise<void> {
        await CommonUtils_UI.enterDataInTextBox(this.Phone, phone);
    }

    async fillZipOnly(zipCode: string): Promise<void> {
        await CommonUtils_UI.enterDataInTextBox(this.ZipCode, zipCode);
    }

    async fillStateOnly(state: string): Promise<void> {
        await this.StateDropdown.waitFor({ state: 'visible', timeout: 15000 });
        await CommonUtils_UI.selectDropdownValue(this.StateDropdown, state);
    }

    // ---- Select by Display Text (for each-option verification tests) ----

    async selectByDisplayText(dropdown: Locator, displayText: string): Promise<string> {
        await dropdown.waitFor({ state: 'attached', timeout: 10000 });
        await dropdown.selectOption({ label: displayText });
        const selectedText = await dropdown.locator('option:checked').textContent();
        const trimmed = selectedText?.trim() ?? '';
        console.log(`Selected by display text "${displayText}" â†’ "${trimmed}"`);
        return trimmed;
    }
}





