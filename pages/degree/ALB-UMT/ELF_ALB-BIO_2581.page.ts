import {Page, Locator, expect } from '@playwright/test';
import { CommonUtils_UI } from '../../../utils/common_utils';
export class ALB_BIO_2581_Page{

    readonly page : Page;
    readonly step1_title: Locator 
    readonly DurationDropdown : Locator;
    readonly page1_NextButton : Locator;
    readonly Step2_title : Locator;
    readonly EducationDropdown : Locator;
    readonly LevelofEducationDropdown : Locator;
    readonly GPA_Dropdown : Locator;
    readonly Schoolinnextyear_Dropdown : Locator;
    readonly step2_NextButton : Locator;
    readonly step3_title : Locator;
    readonly FirstName: Locator;
    readonly LastName: Locator;
    readonly Email: Locator;
    readonly submit_button_step3 : Locator;
    readonly step3_Error_message : Locator;
    readonly step4_title : Locator;
    readonly Nextstep_step3 : Locator;
    readonly state : Locator;
    readonly Zipcode : Locator;
    readonly PhoneNumber : Locator;
    readonly emailradiobutton : Locator;
    readonly Phoneradiobutton : Locator;
    readonly edxemailmeradiobutton : Locator;
    readonly step4_NextButton : Locator;



    constructor (page : Page){
        this.page = page;
        this.step1_title = page.frameLocator('iframe[title="Taxi Form Preview"]').getByText('Step 1 of 4', { exact: true })
        //this.DurationDropdown=page.frameLocator('iframe[title="Taxi Form Preview"]').getByRole('combobox')
        this.DurationDropdown = page.frameLocator('iframe[title="Taxi Form Preview"]').locator('#bodega-taxiselect-field-prospect_education_journey'),
        this.page1_NextButton = page.frameLocator('iframe[title="Taxi Form Preview"]').getByRole('button', { name: 'Next Step' }),
        this.Step2_title = page.frameLocator('iframe[title="Taxi Form Preview"]').getByText('Step 2 of 4', { exact: true }),
        this.EducationDropdown = page.frameLocator('iframe[title="Taxi Form Preview"]').locator('#bodega-taxiselect-field-major_educational_background'),
        this.LevelofEducationDropdown = page.frameLocator('iframe[title="Taxi Form Preview"]').locator('[name="level_of_education"]'),
        this.GPA_Dropdown = page.frameLocator('iframe[title="Taxi Form Preview"]').locator('#bodega-taxiselect-field-stated_gpa_range'),
        this.Schoolinnextyear_Dropdown = page.frameLocator('iframe[title="Taxi Form Preview"]').locator('#bodega-taxiselect-field-relevant_education_obtained'),
        this.step2_NextButton = page.frameLocator('iframe[title="Taxi Form Preview"]').getByRole('button', { name: 'Next Step' }).first(),
        this.step3_title = page.frameLocator('iframe[title="Taxi Form Preview"]').getByText('Step 3 of 4', { exact: true }),
        this.FirstName = page.frameLocator('iframe[title="Taxi Form Preview"]').locator('#bodega-taxitext-field-first_name'),
        this.LastName = page.frameLocator('iframe[title="Taxi Form Preview"]').locator('#bodega-taxitext-field-last_name'),
        this.Email = page.frameLocator('iframe[title="Taxi Form Preview"]').locator('#bodega-taxiemail'),
        this.submit_button_step3 = page.frameLocator('iframe[title="Taxi Form Preview"]').getByRole('button', { name: 'Next Step' }).first(),
        this.step3_Error_message = page.frameLocator('iframe[title="Taxi Form Preview"]').getByRole('link', { name: 'Please enter your email' }),
        this.Nextstep_step3 = page.frameLocator('iframe[title="Taxi Form Preview"]').locator(`button:has-text("Next Step")`).first(),
        this.step4_title = page.frameLocator('iframe[title="Taxi Form Preview"]').getByText('Step 4 of 4', { exact: true }).first(),
        this.state = page.frameLocator('iframe[title="Taxi Form Preview"]').locator('#bodega-taxiselect-field-state'),
        this.Zipcode = page.frameLocator('iframe[title="Taxi Form Preview"]').locator('#bodega-taxitext-field-zip_code'),
        this.PhoneNumber = page.frameLocator('iframe[title="Taxi Form Preview"]').locator('#bodega-taxiphone-field-phone'),
        this.emailradiobutton = page.frameLocator('iframe[title="Taxi Form Preview"]').locator('#bodega-taxiradio-field-email_opt_out-yes'),
        this.Phoneradiobutton = page.frameLocator('iframe[title="Taxi Form Preview"]').locator('#bodega-taxiradio-field-do_not_call-yes'),
        this.edxemailmeradiobutton = page.frameLocator('iframe[title="Taxi Form Preview"]').locator('#bodega-taxiradio-field-share_email_opt_out-yes'),
        this.step4_NextButton = page.frameLocator('iframe[title="Taxi Form Preview"]').getByRole('button', { name: 'Submit' })
    }
    // Return the locator pointing to the options inside the combobox
    async getDurationDropdown_Options() {
  // Utilizing the frame locator since the snapshot shows it's inside an iframe
   this.page.frameLocator('iframe[ref="e11"]').locator('combobox[name="When are you considering starting your program?"] option');
}

 async verify_step1_title(): Promise<String>{  
    await this.step1_title.waitFor({ state: 'visible', timeout: 10000 });  
    await expect(this.step1_title).toBeVisible();
    //await expect(this.step1_title).toHaveText('Step 1 of 4');
    const titletext = await this.step1_title.textContent();
    console.log("Step 1 title text is : "+ titletext);
    return titletext!;
    }
//to get all Dropdown values
async getDurationDropdownOptions() : Promise<string[]> {
    //const Dropdownoptions = await this.DurationDropdown.();
    //const durationOptionsLocator = ALB_BIO_2581_Page.getDurationDropdownOptions();
    await CommonUtils_UI.hoverAndClickOnElement(this.DurationDropdown);
    const options = this.DurationDropdown;
    const optionsTexts = await options.allInnerTexts();
    console.log(optionsTexts);
    return optionsTexts;
 
}
//Select the option values from DurationDropdown from step1 
async selectDurationDropdownOption(optionValue: string): Promise<void> {
    await this.DurationDropdown.waitFor({ state: 'visible', timeout: 10000 });
    await CommonUtils_UI.selectDropdownValue(this.DurationDropdown, optionValue);
    await CommonUtils_UI.clickOnElement(this.page1_NextButton);
}

async verify_step2_title(): Promise<String>{  
    await this.Step2_title.waitFor({ state: 'visible', timeout: 10000 });  
    await expect(this.Step2_title).toBeVisible();
    //await expect(this.Step2_title).toHaveText('Step 2 of 4');
    const titletext = await this.Step2_title.textContent();
    console.log("Step 2 title text is : "+ titletext);
    return titletext!;
    }

    //Validate the dropdown values for EducationDropdown options in step2
async getEducationDropdownOptions() : Promise<string[]> {
    return await CommonUtils_UI.getDropdownOptions(this.EducationDropdown);
    
}

//Select the option values from EducationDropdown from step2
async selectEducationDropdownOption(optionValue: string): Promise<void> {
    await this.EducationDropdown.waitFor({ state: 'visible', timeout: 10000 });
    await CommonUtils_UI.selectDropdownValue(this.EducationDropdown, optionValue);
    
}

 //Validate the dropdown values for LevelofEducationDropdown options in step2
async getLevelofEducationDropdownOptions() : Promise<string[]> {
    return await CommonUtils_UI.getDropdownOptions(this.LevelofEducationDropdown);


}


//Select the option values from LevelofEducationDropdown from step2
async selectLevelofEducationDropdownOption(optionValue: string): Promise<void> {
    console.log("Selecting the Level of education dropdown option : "+ optionValue);
    await this.LevelofEducationDropdown.waitFor({ state: 'visible', timeout: 10000 });
    await CommonUtils_UI.selectDropdownValue(this.LevelofEducationDropdown, optionValue);
    console.log("Selected the Level of education dropdown option : "+ optionValue);
    //await this.LevelofEducationDropdown.scrollIntoViewIfNeeded();
    //await this.LevelofEducationDropdown.selectOption(optionValue );

}

//Validate the dropdown values for GPADropdownOptions options in step2
async getGPADropdownOptions() : Promise<string[]> {
    return await CommonUtils_UI.getDropdownOptions(this.GPA_Dropdown);

}

//Select the option values from GPADropdownOptions from step2
async selectGPADropdownOption(optionValue: string): Promise<void> {
    await this.GPA_Dropdown.waitFor({ state: 'visible', timeout: 10000 });
    await CommonUtils_UI.selectDropdownValue(this.GPA_Dropdown, optionValue);

}  
//Validate the dropdown values for Schoolinnextyear_Dropdown options in step2
async getSchoolinnextyear_DropdownOptions() : Promise<string[]> {
    return await CommonUtils_UI.getDropdownOptions(this.Schoolinnextyear_Dropdown);
}

//Select the option values from GPADropdownOptions from step2
async selectSchoolinnextyearOption(optionValue: string): Promise<void> {
    await this.Schoolinnextyear_Dropdown.waitFor({ state: 'visible', timeout: 10000 });
    await CommonUtils_UI.selectDropdownValue(this.Schoolinnextyear_Dropdown, optionValue);
    

} 

//Click on Next button in step2 to navigate to step3
async clickOnStep2NextButton(){
    await CommonUtils_UI.clickOnElement(this.step2_NextButton);
}
//Verify the Step3 title 
async verify_step3_title(): Promise<String>{  
    await this.step3_title.waitFor({ state: 'visible', timeout: 10000 });  
    await expect(this.step3_title).toBeVisible();
    const titletext = await this.step3_title.textContent();
    console.log("Step 3 title text is : "+ titletext);
    return titletext!;
    }

    //Validation of error messages on step3 page
async clickOnsubmit_button_step3(){
    await CommonUtils_UI.clickOnElement(this.submit_button_step3);
   
}
//Enter first Name and Last name and email on step3 page
async enter_FirstName_LastName_Email(FirstName: string, lastName: string, email: string){
    await CommonUtils_UI.enterDataInTextBox(this.FirstName, FirstName);
    await CommonUtils_UI.enterDataInTextBox(this.LastName, lastName);
    await CommonUtils_UI.enterDataInTextBox(this.Email, email);
    await this.page.waitForTimeout(3000);
    await CommonUtils_UI.clickOnElement(this.submit_button_step3);
    await this.page.waitForTimeout(3000);
    if(await this.submit_button_step3.isVisible())
    {
    await CommonUtils_UI.clickOnElement(this.submit_button_step3);
    //await enter_FirstName_LastName_Email(FirstName1: string, lastName1: string, email1: string);
    
    }
}
 
//Verify the Step4 title 
async verify_step4_title(): Promise<String>{  
    await this.step4_title.waitFor({ state: 'visible', timeout: 10000 });  
    await expect(this.step4_title).toBeVisible();
    const titletext = await this.step4_title.textContent();
    console.log("Step 4 title text is : "+ titletext);
    return titletext!;
    }
    //Select the state values from state dropdown on step4
async selectStateOption(optionValue: string): Promise<void> {
    await this.state.waitFor({ state: 'visible', timeout: 10000 });
    await CommonUtils_UI.selectDropdownValue(this.state, optionValue);
    
}
//Enter the Zipcode field is accepting the input in step4
async enterZipcode(zipcode: string): Promise<void> {
    await this.Zipcode.waitFor({ state: 'visible', timeout: 10000 });
    await CommonUtils_UI.enterDataInTextBox(this.Zipcode, zipcode);
}
//Enter the phone number in step4
async enterPhoneNumber(phoneNumber: string): Promise<void> {
    await this.PhoneNumber.waitFor({ state: 'visible', timeout: 10000 });
    await CommonUtils_UI.enterDataInTextBox(this.PhoneNumber, phoneNumber);
}
//Select the email radio button in step4
async selectEmailRadioButton(){
    await CommonUtils_UI.clickOnElement(this.emailradiobutton);
}
//check the phone radio button in step4
async selectPhoneRadioButton(){
    await CommonUtils_UI.clickOnElement(this.Phoneradiobutton);
}
//check the edx email me radio button in step4
async selectedxEmailMeRadioButton(){
    await CommonUtils_UI.clickOnElement(this.edxemailmeradiobutton);
}
//Click on submit button in step4
async clickOnSubmitButtonStep4(){
    await CommonUtils_UI.clickOnElement(this.step4_NextButton);
} 




}//class