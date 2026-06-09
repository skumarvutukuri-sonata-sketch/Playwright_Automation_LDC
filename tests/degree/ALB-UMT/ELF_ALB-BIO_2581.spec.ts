import {test, expect} from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config();
import { LoginPage } from '../../../pages/login.page';
import { ALB_BIO_2581_Page } from '../../../pages/degree/ALB-UMT/ELF_ALB-BIO_2581.page';
import { getFormUrl } from '../../../config/forms';
import { ALB_UMT_TESTDATA } from '../../../testdata/degree/ALB-UMT/ALB_UMT.testdata';

const testdata = ALB_UMT_TESTDATA['2581'];

test.describe('ALB_BIO_2581 Form Tests', async() => {

//test.use({ storageState: 'tests/setup/storageState.json' });

let loginPage: LoginPage;
let alb_BIO_2581_Page : ALB_BIO_2581_Page;
test.beforeEach(async ({ page }) => {
test.setTimeout(360000);
    loginPage = new LoginPage(page);
    alb_BIO_2581_Page = new ALB_BIO_2581_Page(page);

    // Session already logged in via storageState — navigate directly to the form
    await page.goto(getFormUrl('ALB_BIO_2581'));
    await alb_BIO_2581_Page.verify_step1_title();
})

test('Verify the ALB_BIO_2581 form', async ({ page }) => {
    //console.log("------path ---------"+process.env.DEMO_FORM_URL);
    console.log("-------------Form Landing page ---------");
    //await loginPage.navigate_to_form(getFormUrl('ALB_BIO_2581'));
    const actual_step1_text = await alb_BIO_2581_Page.verify_step1_title();
    console.log("Actual Step 1 text is : " + actual_step1_text);
    await expect(actual_step1_text).toBe(testdata.exp_page1_text);
    //const durationOptionsLocator = alb_BIO_2581_Page.getDurationDropdown
    const durationOptionsarray = await alb_BIO_2581_Page.getDurationDropdownOptions();
    const durationOptions = durationOptionsarray[0].split('\n');
    const exp_durationValues  = testdata.Duration_dropdown_value;
     for(const opt of exp_durationValues){
       await expect(durationOptions).toContain(opt);
     }
      await alb_BIO_2581_Page.selectDurationDropdownOption(testdata.Duration_dropdown_Option);
      const actual_step2_text = await alb_BIO_2581_Page.verify_step2_title();
      console.log("Actual Step 2 text is : " + actual_step2_text);
      await expect(actual_step2_text).toBe(testdata.exp_page2_text);
      const educationOptionsarray = await alb_BIO_2581_Page.getEducationDropdownOptions();
      const exp_educationValues  = testdata.Education_dropdown_Option;  
       for(const opt of exp_educationValues){
       await expect(educationOptionsarray).toContain(opt);
              }
      const levelofEducationOptionsarray = await alb_BIO_2581_Page.getLevelofEducationDropdownOptions();
      const exp_levelofEducationValues  = testdata.LevelofEducation_dropdown_Option;
      
      for(const opt of exp_levelofEducationValues){
       await expect(levelofEducationOptionsarray).toContain(opt);
             }
      await alb_BIO_2581_Page.selectEducationDropdownOption(testdata.Education_dropdown_Value);
      await alb_BIO_2581_Page.selectLevelofEducationDropdownOption(testdata.LevelofEducation_dropdown_Value);
      
      await alb_BIO_2581_Page.selectGPADropdownOption(testdata.GPADropdown_Option_value);
      const GPAOptionarray = await alb_BIO_2581_Page.getGPADropdownOptions();
      const exp_gpaValues  = testdata.GPADropdown_Option;
      for(const opt of exp_gpaValues){
        await expect(GPAOptionarray).toContain(opt);
         } 

     await alb_BIO_2581_Page.selectSchoolinnextyearOption(testdata.Schoolinnextyear_Dropdown_Option_value);
      const SchoolinnextyearOptionarray = await alb_BIO_2581_Page.getSchoolinnextyear_DropdownOptions();
      const exp_SchoolinnextyearValues  = testdata.Schoolinnextyear;
      for(const opt of exp_SchoolinnextyearValues){
        await expect(SchoolinnextyearOptionarray).toContain(opt);
         } 
      await alb_BIO_2581_Page.clickOnStep2NextButton();

      const actual_step3_text = await alb_BIO_2581_Page.verify_step3_title();
      console.log("Actual Step 3 text is : " + actual_step3_text);
      await expect(actual_step3_text).toBe(testdata.exp_page3_text);
        await alb_BIO_2581_Page.clickOnsubmit_button_step3();
        const isErrorMessageVisible = await alb_BIO_2581_Page.step3_Error_message.isVisible();
        console.log("Is error message visible : "+ isErrorMessageVisible);
        await expect(isErrorMessageVisible).toBeTruthy(); 
// fill step3 contact fields and submit
    await alb_BIO_2581_Page.enter_FirstName_LastName_Email(testdata.FirstName, testdata.lastName, testdata.email);
    //await alb_BIO_2581_Page.clickOnsubmit_button_step3();
    //Verify the Step4 title after submission of step3
    const actual_step4_text = await alb_BIO_2581_Page.verify_step4_title();
      console.log("Actual Step 4 text is : " + actual_step4_text);
      await expect(actual_step4_text).toBe(testdata.exp_page4_text);
      await alb_BIO_2581_Page.selectStateOption(testdata.State);
      await alb_BIO_2581_Page.enterZipcode(testdata.Zipcode);
      await alb_BIO_2581_Page.enterPhoneNumber(testdata.phoneNumber);
      await alb_BIO_2581_Page.selectEmailRadioButton();
      await alb_BIO_2581_Page.selectPhoneRadioButton();
      await alb_BIO_2581_Page.selectedxEmailMeRadioButton();
      await alb_BIO_2581_Page.clickOnSubmitButtonStep4();
      console.log("ALB_BIO_2581 Form is submitted successfully");

     
     


 
})





})