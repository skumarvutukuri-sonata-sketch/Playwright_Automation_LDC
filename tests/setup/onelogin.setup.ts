import { test as setup } from '@playwright/test';
//import { LoginPage } from '../../pages/Publisher/Login.Page';
import { defineConfig, devices } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
dotenv.config();
import * as path from 'path';

const storageStatePath = path.resolve(__dirname, 'storageState.json');
setup('login and save session', async ({ page }) => {
  console.log("------path ---------"+storageStatePath);

  // login logic
  const loginPage = new LoginPage(page);
  await page.goto(process.env.Taxi_Staging_URL!);
  //await page.goto(process.env.ALB_UMT_BIO!);
  await loginPage.valid_login(process.env.EMAIL!, process.env.USERNAME!, process.env.PASSWORD!);
    //await loginPage.valid_login(logindata.email, logindata.username, logindata.password);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(10000);
        //await page.goto(process.env.ALB_UMT_BIO!);
        //await page.waitForLoadState('networkidle');
        await page.context().storageState({
        path: storageStatePath,
          });
        console.log("Succesfuly logged  and navigated to Home page");



});