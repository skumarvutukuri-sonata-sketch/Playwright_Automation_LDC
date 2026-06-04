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
    await dropdown.scrollIntoViewIfNeeded();
    await dropdown.selectOption(value);
    await expect(dropdown).toHaveValue(value, { timeout });
    //await expect(dropdown).toHaveClass(/has-value/, { timeout });
    const selected = await dropdown.inputValue();
    console.log(`Selected value: ${selected}`);
  }


  static async enterDataInTextBox(
    txtBox_locator : Locator,
    inputValue : string,
  ){
    await txtBox_locator.waitFor();
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
    await element_locator.waitFor();
    await element_locator.scrollIntoViewIfNeeded();
    await element_locator.hover();
    await element_locator.click({force : true});
  }


  static async hoverAndClickOnElement(
    element_locator : Locator
  ){
    await element_locator.waitFor();
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
  // 1. Ensure the element is visible and interactable
  await dropdownLocator.waitFor();
  await dropdownLocator.scrollIntoViewIfNeeded();
  await dropdownLocator.hover();
  await dropdownLocator.click();

  // 2. Locate all <option> elements inside this specific dropdown
  const optionLocator = dropdownLocator.locator('option');
  
  // 3. Extract and return the inner text of each option as an array of strings
  const optionsTexts = await optionLocator.allInnerTexts();
  
  console.log('Extracted Dropdown Options:', optionsTexts);
  return optionsTexts;
}


}
 