import { Locator, expect } from '@playwright/test';
import path from 'path'
export class CommonUtils_UI{

static async uploadFile(fileName: string, webelemet :Locator) {

    const filePath = path.join(
      process.cwd(),
      'test_data',
      'UploadFiles',
      fileName
    );

    await webelemet.setInputFiles(filePath);
  }

  static async selectDropdownValue(
    dropdown: Locator,
    value: string,
    options?: { timeout?: number }
  ) {
    const timeout = options?.timeout ?? 10000;
    await dropdown.waitFor({ state: 'attached', timeout });
    try {
      await dropdown.selectOption({ label: value });
    } catch {
      await dropdown.selectOption(value);
    }

    const selectedOptionText = await dropdown.locator('option:checked').textContent();
    const selected = selectedOptionText?.trim() ?? '';
    console.log(`Selected dropdown option: ${selected}`);
  }


  static async enterDataInTextBox(
    txtBox_locator : Locator,
    inputValue : string,
  ){
    await txtBox_locator.waitFor({ state: 'visible', timeout: 10000 });
    await txtBox_locator.scrollIntoViewIfNeeded();
    await txtBox_locator.click();
    try{
       await txtBox_locator.fill(inputValue);
    }catch{
      await txtBox_locator.pressSequentially(inputValue)
    }

    console.log("Entered input value : "+ inputValue);
  }

  static async clickOnElement(
    element_locator : Locator
  ){
    await element_locator.waitFor({ state: 'visible', timeout: 10000 });
    await element_locator.scrollIntoViewIfNeeded();
    await element_locator.hover();
    await element_locator.click({force : true});
  }


  static async hoverAndClickOnElement(
    element_locator : Locator
  ){
    await element_locator.waitFor({ state: 'visible', timeout: 10000 });
    await element_locator.hover();
    await element_locator.scrollIntoViewIfNeeded();
    await element_locator.click();

  }

  static generateRandomSubjectSufix(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';

  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

static async getDropdownOptions(dropdownLocator: Locator): Promise<string[]> {
  await dropdownLocator.waitFor({ state: 'attached', timeout: 10000 });

  const optionLocator = dropdownLocator.locator('option');
  await expect(optionLocator.first()).toBeAttached({ timeout: 10000 });
  
  const optionsTexts = (await optionLocator.allInnerTexts()).map((option) => option.trim()).filter(Boolean);
  
  console.log('Extracted Dropdown Options:', optionsTexts);
  return optionsTexts;
}


}
 