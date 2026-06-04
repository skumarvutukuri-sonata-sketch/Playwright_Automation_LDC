import {test, expect} from '@playwright/test';

import * as dotenv from 'dotenv';
dotenv.config();
import { LoginPage } from '../pages/login.page';

test.describe('Demo Form Tests', async() => {

test.use({ storageState: 'tests/setup/storageState.json' });


test.beforeEach(async ({ page }) => {

})


test('Verify the demo form', async ({ page }) => {
    console.log("------path ---------"+process.env.DEMO_FORM_URL);
    console.log("-------------1st method ---------");

})


test('Verify the demo form2', async ({ page }) => {
    console.log("------path ---------"+process.env.DEMO_FORM_URL);
    console.log("-------------1st method ---------");
    
})




})