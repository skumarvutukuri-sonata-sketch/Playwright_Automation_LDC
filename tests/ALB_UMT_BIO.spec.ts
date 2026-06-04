import {test, expect} from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config();
import { LoginPage } from '../pages/login.page';
import { ALB_UMT_BIO_Page } from '../pages/ALB_UMT_BIO.page';
import * as testdata from '../testdata/ALB_UMT_BIO_testdata.json';

test.describe('ALB_UMT_BIO Form Tests', async() => {

//test.use({ storageState: 'tests/setup/storageState.json' });

let loginPage: LoginPage;
let alb_UMT_BIO_Page : ALB_UMT_BIO_Page;
test.beforeEach(async ({ page }) => {
test.setTimeout(360000);
    loginPage = new LoginPage(page);
    alb_UMT_BIO_Page = new ALB_UMT_BIO_Page(page);

    await page.goto(process.env.Taxi_Staging_URL!);
  //await page.goto(process.env.ALB_UMT_BIO!);
  await loginPage.valid_login(process.env.EMAIL!, process.env.USERNAME!, process.env.PASSWORD!);
    //await loginPage.valid_login(logindata.email, logindata.username, logindata.password);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(10000);
        await page.goto(process.env.ALB_UMT_BIO!);
        //await page.waitForLoadState('networkidle');
        await page.waitForTimeout(10000);
})

test('Verify the ALB_UMT_BIO form', async ({ page }) => {
    //console.log("------path ---------"+process.env.DEMO_FORM_URL);
    console.log("-------------Form Landing page ---------");
    //await loginPage.navigate_to_form(process.env.ALB_UMT_BIO!);
    const actual_step1_text = await alb_UMT_BIO_Page.verify_step1_title();
    console.log("Actual Step 1 text is : " + actual_step1_text);
    await expect(actual_step1_text).toBe(testdata.exp_page1_text);
    //const durationOptionsLocator = alb_UMT_BIO_Page.getDurationDropdown
    const durationOptionsarray = await alb_UMT_BIO_Page.getDurationDropdownOptions();
    const durationOptions = durationOptionsarray[0].split('\n');
    const exp_durationValues  = testdata.Duration_dropdown_value;
     for(const opt of exp_durationValues){
       await expect(durationOptions).toContain(opt);
     }
      await alb_UMT_BIO_Page.selectDurationDropdownOption(testdata.Duration_dropdown_Option);
      await page.waitForTimeout(5000);
      const actual_step2_text = await alb_UMT_BIO_Page.verify_step2_title();
      console.log("Actual Step 2 text is : " + actual_step2_text);
      await expect(actual_step2_text).toBe(testdata.exp_page2_text);
      const educationOptionsarray = await alb_UMT_BIO_Page.getEducationDropdownOptions();
      const exp_educationValues  = testdata.Education_dropdown_Option;  
       for(const opt of exp_educationValues){
       await expect(educationOptionsarray).toContain(opt);
              }
      await page.waitForTimeout(5000);
      const levelofEducationOptionsarray = await alb_UMT_BIO_Page.getLevelofEducationDropdownOptions();
      const exp_levelofEducationValues  = testdata.LevelofEducation_dropdown_Option;
      
      for(const opt of exp_levelofEducationValues){
       await expect(levelofEducationOptionsarray).toContain(opt);
             }
      await alb_UMT_BIO_Page.selectEducationDropdownOption(testdata.Education_dropdown_Value);
      await alb_UMT_BIO_Page.selectLevelofEducationDropdownOption(testdata.LevelofEducation_dropdown_Value);
      
      await alb_UMT_BIO_Page.selectGPADropdownOption(testdata.GPADropdown_Option_value);
      const GPAOptionarray = await alb_UMT_BIO_Page.getGPADropdownOptions();
      const exp_gpaValues  = testdata.GPADropdown_Option;
      for(const opt of exp_gpaValues){
        await expect(GPAOptionarray).toContain(opt);
         } 

     await alb_UMT_BIO_Page.selectSchoolinnextyearOption(testdata.Schoolinnextyear_Dropdown_Option_value);
      const SchoolinnextyearOptionarray = await alb_UMT_BIO_Page.getSchoolinnextyear_DropdownOptions();
      const exp_SchoolinnextyearValues  = testdata.Schoolinnextyear;
      for(const opt of exp_SchoolinnextyearValues){
        await expect(SchoolinnextyearOptionarray).toContain(opt);
         } 
      await alb_UMT_BIO_Page.clickOnStep2NextButton();

      const actual_step3_text = await alb_UMT_BIO_Page.verify_step3_title();
      console.log("Actual Step 3 text is : " + actual_step3_text);
      await expect(actual_step3_text).toBe(testdata.exp_page3_text);
        await alb_UMT_BIO_Page.clickOnsubmit_button_step3();
        const isErrorMessageVisible = await alb_UMT_BIO_Page.step3_Error_message.isVisible();
        console.log("Is error message visible : "+ isErrorMessageVisible);
        await expect(isErrorMessageVisible).toBeTruthy(); 
       await page.waitForTimeout(5000);
// fill step3 contact fields and submit
    await alb_UMT_BIO_Page.enter_FirstName_LastName_Email(testdata.FirstName, testdata.lastName, testdata.email);
    //await alb_UMT_BIO_Page.clickOnsubmit_button_step3();
    await page.waitForTimeout(5000);
    //Verify the Step4 title after submission of step3
    const actual_step4_text = await alb_UMT_BIO_Page.verify_step4_title();
      console.log("Actual Step 4 text is : " + actual_step4_text);
      await expect(actual_step4_text).toBe(testdata.exp_page4_text);
      await alb_UMT_BIO_Page.selectStateOption(testdata.State);
      await alb_UMT_BIO_Page.enterZipcode(testdata.Zipcode);
      await alb_UMT_BIO_Page.enterPhoneNumber(testdata.phoneNumber);
      await alb_UMT_BIO_Page.selectEmailRadioButton();
      await alb_UMT_BIO_Page.selectPhoneRadioButton();
      await alb_UMT_BIO_Page.selectedxEmailMeRadioButton();
      await alb_UMT_BIO_Page.clickOnSubmitButtonStep4();
      await page.waitForTimeout(5000);
      console.log("ALB_UMT_BIO Form is submitted successfully");

     
     


 
})





})