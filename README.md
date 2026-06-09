# Playwright Automation Framework - Taxi Staging

End-to-end automation framework for Taxi staging forms using Playwright + TypeScript.

## Tech Stack

- Playwright test runner
- TypeScript
- dotenv
- Allure report + Playwright HTML report
- Nodemailer (post-run email)

## Current Project Structure

```text
.
|-- config/
|   `-- forms.ts
|-- pages/
|   |-- degree/
|   |   `-- ALB-UMT/
|   |       |-- ALB_MSB_3003.page.ts
|   |       `-- ELF_ALB-BIO_2581.page.ts
|   `-- login.page.ts
|-- testdata/
|   |-- degree/
|   |   `-- ALB-UMT/
|   |       `-- ALB_UMT.testdata.ts
|   `-- ALB_UMT_BIO_testdata.json
|-- tests/
|   |-- degree/
|   |   `-- ALB-UMT/
|   |       |-- ALB_MSB_3003.spec.ts
|   |       `-- ELF_ALB-BIO_2581.spec.ts
|   `-- setup/
|       |-- onelogin.setup.ts
|       `-- storageState.json
|-- utils/
|   |-- common_utils.ts
|   |-- generateReport.ts
|   |-- sendEmail.ts
|   `-- zipReport.ts
|-- global-teardown.ts
|-- playwright.config.ts
|-- package.json
`-- README.md
```

## Prerequisites

- Node.js 18+
- npm
- Java (only if you generate/open Allure report)

## Setup

```powershell
npm install
npx playwright install chromium
```

Create `.env` in project root:

```env
Taxi_Staging_URL=https://taxi.stg.mktg.2u.com/

# OneLogin credentials
EMAIL=your-email@2u.com
USERNAME=your-email@2u.com
PASSWORD=your-password

# Optional SMTP settings for report mail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
EMAIL_USER=sender@domain.com
EMAIL_PASS=app-password
EMAIL_TO=receiver1@domain.com,receiver2@domain.com
```

## Login and Session Reuse

- `tests/setup/onelogin.setup.ts` runs first (Playwright setup project).
- It performs OneLogin auth and stores session in `tests/setup/storageState.json`.
- All chromium tests reuse that session.
- MFA is typically required once per run.

## Test Suites

- `tests/degree/ALB-UMT/ALB_MSB_3003.spec.ts`
    - Scenario 1: random valid path + submit + thank-you validation
    - Scenario 2: iterate dropdown options + submit + thank-you validation
    - Scenario 3: negative validation flow + recovery + successful submit
- `tests/degree/ALB-UMT/ELF_ALB-BIO_2581.spec.ts`

## Terminal Commands

In VS Code Markdown Preview, you can Ctrl+Click these links to run commands in terminal:

- [Run All Tests](command:workbench.action.tasks.runTask?Run%20All%20Tests)
- [Run All Tests Headed](command:workbench.action.tasks.runTask?Run%20All%20Tests%20Headed)
- [Run 3003 Full](command:workbench.action.tasks.runTask?Run%203003%20Full)
- [Run Degree Full](command:workbench.action.tasks.runTask?Run%20Degree%20Full)
- [Run 3003 Scenario 1](command:workbench.action.tasks.runTask?Run%203003%20Scenario%201)
- [Open Playwright Report](command:workbench.action.tasks.runTask?Open%20Playwright%20Report)
- [Generate Allure Report](command:workbench.action.tasks.runTask?Generate%20Allure%20Report)
- [Open Allure Report](command:workbench.action.tasks.runTask?Open%20Allure%20Report)

If links do not run, open Command Palette and run: Tasks: Run Task.

Run all tests:

```powershell
npm test
# or
npx playwright test
```

Run all tests in headed mode:

```powershell
npx playwright test --headed
```

Run full 3003 suite (stable mode):

```powershell
npm run test:3003:full
# equivalent
npx playwright test tests/degree/ALB-UMT/ALB_MSB_3003.spec.ts --headed --workers=1
```

Run full degree suites (3003 + 2581):

```powershell
npm run test:degree:full
```

Run one scenario by name:

```powershell
npx playwright test tests/degree/ALB-UMT/ALB_MSB_3003.spec.ts -g "Scenario 1" --headed --workers=1 --no-deps
```

## Reports

Playwright HTML report:

```powershell
npx playwright show-report
```

Allure:

```powershell
npm run allure:report
npm run allure:open
```

or

```powershell
npm run test:allure
```

## Global Teardown Behavior

After execution, `global-teardown.ts`:

1. Reads `test-results.json`.
2. If there are no failed tests, it generates Allure report.
3. It then attempts to send the email report.
4. If tests fail, email is skipped.

## Notes

- Tests are configured for chromium in headed mode.
- Traces are captured on first retry.
- Screenshots and videos are enabled.
- Form URL mapping is centralized in `config/forms.ts`.
