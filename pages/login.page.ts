
import {Page, Locator } from '@playwright/test';

export class LoginPage{
    readonly page : Page;
    readonly email_textBox : Locator;
    readonly next_button : Locator;
    readonly gmail_button : Locator;
    readonly urserName_textBox : Locator;
    readonly password_textbox : Locator;
    readonly submit_button : Locator;
    readonly org_dropdown : Locator;
    readonly continue_btn : Locator;
    readonly m_pwd_textbox : Locator;
    readonly m_sign_btn : Locator;



constructor (page : Page){
this.page = page;
this.gmail_button = page.getByRole('button', { name: 'Sign in with Google' });
this.next_button = page.getByRole('button', { name: 'Next' });
this.email_textBox = page.getByRole('textbox', { name: 'Email or phone' });
this.urserName_textBox = page.locator('#username');
this.password_textbox = page.locator('#password');
this.m_pwd_textbox = page.locator("//input[@name='passwd']")
this.submit_button = page.locator("//button[@type='submit']");
this.org_dropdown = page.locator("//select[@id='id_enterprise']");
this.continue_btn = page.locator("//button[@id='select-enterprise-submit']");
this.m_sign_btn = page.locator("//input[@type='submit']");




} // constructor

// launch URL
async launcUrl(url: string){
    await this.page.goto(url);
}

//click on gmail button
async click_gmail_button(){
    await this.gmail_button.click();
    await this.page.waitForLoadState('networkidle');
}

//enter email id
async enter_emailId(mailid : string){
    await this.email_textBox.fill(mailid);
    await this.next_button.click();
    await this.page.waitForLoadState('networkidle');

}

//async enter userid
async enter_userID(userid : string){
    await this.urserName_textBox.fill(userid);
    await this.page.waitForLoadState('networkidle');
}

//click on submit
async click_Submit(){
    await this.submit_button.click();
    await this.page.waitForLoadState('networkidle');
}

//enter password
async enter_password(password : string){

   // await this.password_textbox.fill(password);
   await this.m_pwd_textbox.fill(password);
    await this.page.waitForLoadState('networkidle');
}

//generic login method for re use
async valid_login(emailId : string, userid:string, password:string){
   // await this.gmail_button.click();

    //await this.email_textBox.fill(emailId);
   // await this.next_button.click();

    await this.urserName_textBox.fill(userid);
    await this.submit_button.click();
   
    await this.password_textbox.pressSequentially(password)
    await this.submit_button.click();

    
   

    // await this.m_pwd_textbox.pressSequentially(password);
    // await this.m_sign_btn.hover();
    // await this.m_sign_btn.click();

    // if(await this.org_dropdown.isDisabled){
    //     await this.org_dropdown.waitFor();
    //     await this.org_dropdown.selectOption("edX, Inc. (Stage)");
    //     await this.continue_btn.waitFor();
    //     await this.continue_btn.hover();
    //     await this.continue_btn.click();

    // }
    //await this.page.waitForLoadState('networkidle');
    //await this.page.waitForURL('https://2u.onelogin.com/portal/', { timeout: 60_000 });
    //await this.page.context().storageState({ path: 'storageState.json' });



}
//Navigating to Form
async navigate_to_form(formUrl : string){
    await this.page.goto(formUrl);
    await this.page.waitForLoadState('networkidle');
    //await this.valid_login(emailId, userid, password);

}

}// class