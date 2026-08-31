import { test, expect } from '@playwright/test';

test('FORM_3668 - Harvard Cybersecurity lead form happy path', async ({ page }) => {
  await page.goto(
    'https://harvardx-onlinecourses.getsmarter.com/presentations/lp/harvard-cybersecurity-online-short-course-v2/',
    { waitUntil: 'domcontentloaded' }
  );

  // Open and scope to the active offcanvas drawer form.
  const formDrawer = page.locator('#formOffcanvas:visible').first();
  if (!(await formDrawer.isVisible())) {
    await page.getByRole('button', { name: 'View Course Brochure' }).first().click();
  }

  await expect(formDrawer).toBeVisible();
  await expect(formDrawer.locator('input[name="first_name"]')).toBeVisible();

  const email = `harvard.form.${Date.now()}@example.com`;

  await formDrawer.locator('input[name="first_name"]').fill('Auto');
  await formDrawer.locator('input[name="last_name"]').fill('Tester');
  await formDrawer.locator('input[name="email"]').fill(email);
  await formDrawer.getByRole('button', { name: 'Next Step' }).click({ force: true });

  await expect(formDrawer.getByText('Step 2 of 3')).toBeVisible();

  await formDrawer.locator('input[name="email_opt_out"][value="yes"]').check({ force: true });
  await formDrawer.locator('input[name="do_not_call"][value="no"]').check({ force: true });
  await formDrawer.locator('select[name="highest_level_of_education"]').selectOption({ index: 1 });
  await formDrawer.locator('select[name="work_experience"]').selectOption({ index: 1 });
  await formDrawer.getByRole('button', { name: 'Next Step' }).click({ force: true });

  await expect(formDrawer.getByText('Step 3 of 3')).toBeVisible();

  await formDrawer.locator('input[name="gdprProspect2uOptIn"][value="true"]').check({ force: true });
  await formDrawer.getByRole('button', { name: 'Submit' }).click({ force: true });

  await expect(page).toHaveURL(/\/presentations\/info\/harvard-cybersecurity-online-short-course\//);
  await expect(page.getByRole('heading', { name: 'About This Course' })).toBeVisible();
});

test('FORM_3668 - Harvard Cybersecurity lead form validation path', async ({ page }) => {
  await page.goto(
    'https://harvardx-onlinecourses.getsmarter.com/presentations/lp/harvard-cybersecurity-online-short-course-v2/',
    { waitUntil: 'domcontentloaded' }
  );

  const formDrawer = page.locator('#formOffcanvas:visible').first();
  if (!(await formDrawer.isVisible())) {
    await page.getByRole('button', { name: 'View Course Brochure' }).first().click();
  }

  await expect(formDrawer).toBeVisible();

  const validEmail = `harvard.validation.${Date.now()}@example.com`;

  await formDrawer.locator('input[name="first_name"]').fill('Auto');
  await formDrawer.locator('input[name="last_name"]').fill('Validator');
  await formDrawer.locator('input[name="email"]').fill('invalid-email');
  await formDrawer.getByRole('button', { name: 'Next Step' }).click({ force: true });

  // Validation check: invalid email should block progression from Step 1.
  await expect(formDrawer.getByText('Step 1 of 3')).toBeVisible();
  const invalidEmailState = await formDrawer
    .locator('input[name="email"]')
    .evaluate((el: HTMLInputElement) => el.checkValidity());
  expect(invalidEmailState).toBeFalsy();

  await formDrawer.locator('input[name="email"]').fill(validEmail);
  await formDrawer.getByRole('button', { name: 'Next Step' }).click({ force: true });

  await expect(formDrawer.getByText('Step 2 of 3')).toBeVisible();

  await formDrawer.locator('input[name="email_opt_out"][value="yes"]').check({ force: true });
  await formDrawer.locator('input[name="do_not_call"][value="no"]').check({ force: true });
  await formDrawer.locator('select[name="highest_level_of_education"]').selectOption({ index: 1 });
  await formDrawer.locator('select[name="work_experience"]').selectOption({ index: 1 });
  await formDrawer.getByRole('button', { name: 'Next Step' }).click({ force: true });

  await expect(formDrawer.getByText('Step 3 of 3')).toBeVisible();

  await formDrawer.locator('input[name="gdprProspect2uOptIn"][value="true"]').check({ force: true });
  await formDrawer.getByRole('button', { name: 'Submit' }).click({ force: true });

  await expect(page).toHaveURL(/\/presentations\/info\/harvard-cybersecurity-online-short-course\//);
});
