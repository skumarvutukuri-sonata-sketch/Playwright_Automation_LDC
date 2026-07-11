# 🚀 Dynamic Form Automation Framework (Playwright)

## 1. Overview
The Dynamic Form Automation Framework is a data-driven, highly resilient Playwright testing architecture designed to dynamically crawl, interact with, and validate multi-step lead generation forms.

Unlike traditional automation that relies on hardcoded CSS selectors and rigid step definitions, this framework acts like a human. It scans the DOM step-by-step, identifies field types on the fly, tests deep frontend validations, intercepts backend API payloads, and automatically detects structural changes to the form over time.

---

## 2. Core Architecture & Components
The framework is broken down into modular classes to separate test data, browser interaction, and reporting.

You can copy and paste this entire block into your Core Architecture & Components section:

* **`dynamic_crawler.spec.ts` (The Orchestrator):** Reads the test data via CSVManager, loops through the required forms, and triggers both the Positive and Negative test paths.
* **`FormRunner.ts` (The State Manager):** Controls the step-by-step loop. It uses a "Smart Race" polling system to instantly detect if the form advanced to a new step or reached the Thank You page.
* **`FormEngine.ts` (The Interactor):** Evaluates individual fields. It dynamically decides how to fill them based on HTML attributes and the current TestMode.
* **`Helpers.ts` (The Utility Belt):** Provides resilient DOM-locating strategies to find fields even if their IDs change, and handles lightning-fast wait states to prevent script freezing.
* **`FormChangeDetector.ts` & `FieldCaptureBus.ts`:** Captures the layout of the form during runtime and compares it against a saved JSON baseline to detect if developers added, removed, or moved fields.
* **`ApiCapture.ts` & `PayloadValidator.ts` (The Backend Guardians):** Intercepts live network traffic to ensure the final backend API payload perfectly matches the data entered into the UI.
* **`DashboardGenerator.ts` (The Visualizer):** Compiles the raw pass/fail data into an interactive HTML dashboard featuring a 30-day historical trend analysis.
* **`sendEmail.ts` (The Messenger):** Handles the SMTP connections and builds the rich HTML templates for alerting the team.
* **`global-teardown.ts` (The Sweeper):** Runs automatically after all tests finish. It generates the final reports, triggers the dashboard build, and sweeps up all form change logs to send a single consolidated alert.

---

## 3. Test Execution Modes
Every form is tested in two distinct modes to ensure complete coverage:

### ✅ Positive Path (Happy Path)
* **Goal:** Ensure a normal user can successfully complete the form.
* **Behavior:** 1. Scans the step for visible fields. 
  2. Saves the field structure (name, type, step location) to the FieldCaptureBus. 
  3. Fills fields with valid data from DefaultData. 
  4. Clicks the Primary Button natively and waits for the step transition. 
  5. Validates the final API Request/Response upon reaching the Thank You page.

### 🚫 Negative Path (Validation Path)
* **Goal:** Ensure frontend CRM validation rules are strictly enforced.
* **Behavior:** 1. Empty Field Check: Attempts to click "Next/Submit" on an empty form and natively verifies that red validation error classes appear in the DOM. 
  2. Format Validation: For Email and Phone fields, it loops through an array of invalid inputs (e.g., test, test@, 123), forces the UI error to appear, and then "self-corrects" by entering valid data to proceed. 
  3. Uses Playwright's native `.waitFor()` speeds to execute these validations in milliseconds without crashing due to disabled buttons.

---

## 4. Smart Change Detection & Baselines
The framework includes a self-healing Gatekeeper system to protect form integrity.

* **Snapshot:** During the Positive Path, FormRunner maps every field it sees.
* **Compare:** After submission, it compares this live snapshot against the form's saved `.json` baseline.
* **Alert:** If fields are ADDED, REMOVED, MODIFIED, or MOVED, the test passes (to prevent false-positive failures), but the changes are saved to a temporary reports/form-changes directory.
* **Consolidate:** global-teardown.ts sweeps up these files and emails the team a single, consolidated alert table.

**Approving Changes:** If the form changes were intentional (e.g., Marketing added a "City" field), the QA team can update the baseline by running the test with the Gatekeeper Flag:

```bash
UPDATE_BASELINES=true npx playwright test
```

## 5. Running Specific Forms or Test Groups

The framework supports targeted execution through Playwright's native test filtering capabilities.

### Execute a Specific Negative Test Group

```bash
npx playwright test -g "Group:yale.*Negative"
```

This executes only the matching Negative Path tests for forms belonging to the Yale group.

### Execute Multiple Groups Simultaneously

You can combine regular expressions to execute multiple groups in a single run.

#### Mac / Linux

```bash
npx playwright test -g "Group:yale|Group:har"
```

#### Windows (CMD)

```cmd
npx playwright test -g "Group:yale|Group:har"
```

#### Windows (PowerShell)

```powershell
npx playwright test -g "Group:yale|Group:har"
```

---

## 6. Updating Baselines for Multiple Items

If multiple forms have intentional structural changes, you can approve them all in a single execution by combining the Gatekeeper flag with Playwright's regex filtering.

### Mac / Linux

```bash
UPDATE_BASELINES=true npx playwright test -g "Group:yale|Group:har"
```

### Windows (CMD)

```cmd
set UPDATE_BASELINES=true && npx playwright test -g "Group:yale|Group:har"
```

### Windows (PowerShell)

```powershell
$env:UPDATE_BASELINES="true"; npx playwright test -g "Group:yale|Group:har"
```

This allows QA teams to update baselines for multiple form groups simultaneously without having to update them individually.

---

## 7. Intelligent CLI Test Filtering

One of the framework's key performance optimizations is its integration with Playwright's native filtering engine.

Inside `dynamic_crawler.spec.ts`, the framework contains logic similar to:

```typescript
if (isSearchingViaCli) return true;
```

### Why This Works So Well

Normally, form execution is controlled by the CSV configuration:

```csv
Run = Yes
```

However, whenever a Playwright CLI filter is supplied:

```bash
npx playwright test -g "Group:yale"
```

the framework intentionally bypasses CSV execution filtering.

### Benefits

* Loads all form definitions into Playwright memory.
* Allows Playwright's highly optimized test runner to perform filtering.
* Eliminates the need to constantly modify CSV files.
* Supports powerful regex-based execution patterns.
* Enables fast debugging and targeted validation runs.

Because of this design, the framework can instantly execute only the requested form groups while maintaining maximum performance.

---

## 8. Reporting Output & Custom Dashboard

The framework provides multiple reporting layers tailored to different audiences, from executive stakeholders to automation engineers.

### 📊 8.1 Custom Executive Dashboard (`DashboardGenerator`)

At the end of every execution, the framework compiles test results into a standalone interactive HTML dashboard. This serves as the primary reporting artifact for QA Leads, Product Teams, and Stakeholders.

#### Key Features

##### 30-Day Historical Trend Analysis

Maintains a rolling history of up to 30 days of execution results, allowing teams to:

* Monitor long-term form stability.
* Identify recurring failures.
* Track pass/fail trends.
* Detect degradation patterns.

##### High-Level Metrics Overview

Displays:

* Total Forms Executed
* Total Execution Time
* Overall Pass Percentage
* Positive Path Success Rate
* Negative Path Success Rate

##### Form-by-Form Matrix

Provides a detailed breakdown of execution results for every form.

Example:

| Form | Positive Path | Negative Path | Status |
|--------|--------|--------|--------|
| Yale Lead Form | ✅ | ✅ | Passed |
| Harvard Inquiry Form | ✅ | ❌ | Partial |
| Contact Request Form | ❌ | ❌ | Failed |

##### Form Change Highlights

Forms containing:

* Added Fields
* Removed Fields
* Modified Fields
* Moved Fields

are visually highlighted to immediately draw attention to structural changes.

##### Environment Context

Displays:

* Environment Name (QA/UAT/PROD)
* Build Information
* Execution Timestamp
* Run Identifier

##### Standalone Portability

The dashboard is generated as a self-contained artifact that can be:

* Attached to Emails
* Hosted on Jenkins
* Published via GitHub Pages
* Shared in Slack or Microsoft Teams
* Embedded into Internal QA Portals

---

### 🔍 8.2 Allure Report (Deep-Dive Debugging)

A detailed interactive report intended for Automation Engineers and SDETs.

#### Included Artifacts

* Step-by-step execution logs.
* Failure screenshots.
* Playwright video recordings.
* Playwright traces.
* Browser console logs.
* Captured API Requests.
* Captured API Responses.

#### Debugging Benefits

Rapidly determine if failures originate from:

* Frontend Validation
* UI Rendering Issues
* Payload Generation Problems
* Backend Processing Errors
* Environment Instability

---

### 📝 8.3 Result Matrix CSV

The framework generates a flat-file execution matrix:

```text
result-matrix.csv
```

#### Data Captured

* Form Name
* Positive Path Result
* Negative Path Result
* Execution Duration
* Overall Status
* Environment

#### Integration Options

This file can easily be consumed by:

* Jira
* Zephyr
* Power BI
* Excel Dashboards
* Internal Reporting Platforms

The Custom Executive Dashboard also uses this file as its primary data source.

---

### ✉️ 8.4 Automated Nodemailer Alerts

After execution completes, the framework automatically sends two notification emails.

#### Execution Summary Email

Contains:

* Total Forms Processed
* Pass Percentage
* Failure Summary
* Dashboard Link
* Allure Report Link
* Execution Metadata

#### Consolidated Form Change Email

Generates a single HTML table showing all structural changes detected during execution.

Example:

| Form | Change Type | Field | Details |
|--------|--------|--------|--------|
| Yale Lead Form | Added | City | New Required Field |
| Harvard Inquiry Form | Removed | Fax | Field Removed |
| Contact Form | Moved | Email | Step 1 → Step 2 |

This allows stakeholders to quickly decide whether baseline approval is required using:

```bash
UPDATE_BASELINES=true
```
## 9. Prerequisites & Installation

To get this framework running on a fresh local machine, new team members need to complete the following steps.

### 9.1 System Requirements

#### Node.js
Version **18.0 or higher** is required.

#### Git
Required to clone the repository and manage source control.

### 9.2 Setup Steps

Clone the repository to your local machine, open a terminal at the project root, and run:

```bash
# Install all required Node packages from package.json
npm install

# Download the required Playwright browser binaries
npx playwright install
```

---

## 10. Environment Variables (.env Setup)

This framework relies on a `.env` file to manage sensitive credentials (such as SMTP configuration), environment settings, and feature flags (such as the Baseline Gatekeeper).

Create a `.env` file in the project root and populate it using the template below.

> **Important:** Do not commit this file to source control. Ensure `.env` is included in your `.gitignore`.

```env
# ======================================
# SSO & Login Credentials
# ======================================
ONELOGIN_URL=https://2u.onelogin.com
EMAIL=your.email@2u.com
USERID=your.email@2u.com
USERNAME=your.email@2u.com
PASSWORD=your-sso-password
MFA_SECRET=your-authenticator-secret

# ======================================
# Target Environments & URLs
# ======================================
TEST_ENV=dev
TEST_BASE_URL=https://taxi.dev.mktg.2u.com/
Taxi_Staging_URL=https://taxi.stg.mktg.2u.com/
NODE_ENV=staging

# ======================================
# Gmail SMTP Configuration
# ======================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USERNAME=your.email@2u.com
SMTP_PASSWORD=your-gmail-app-password

# ======================================
# Email Routing
# ======================================
EMAIL_FROM=no-reply@2u.com
EMAIL_TO=qa-team@2u.com
EMAIL_CC=automation-leads@2u.com
EMAIL_BCC=
EMAIL_SUBJECT_PREFIX=[LDC Automation]

# ======================================
# Framework Feature Flags
# ======================================

# Gatekeeper Flag:
# Set to 'true' ONLY when approving intentional form structure changes.
UPDATE_BASELINES=false
```

---

## 11. Folder Directory Tree

The following directory structure provides a high-level overview of the framework architecture and locations of key files.

```text
📦 project_root
 ┣ 📂 pages/                      # Page Object Models (e.g., login.page.ts)
 ┣ 📂 scripts/                    # Helper scripts (cleanReports.js, repo configs)
 ┣ 📂 test_data/                  # Source test data (Degree.csv, Short_Courses.csv)
 ┣ 📂 tests/                      # Playwright spec files (e.g., dynamic_crawler.spec.ts)

 ┣ 📂 utils/
 ┃ ┣ 📂 allure-history/          # Historical data for Allure trend graphs
 ┃ ┣ 📂 api/                     # API interception and payload validation logic
 ┃ ┣ 📂 form-snapshots/          # Saved JSON baselines for the Gatekeeper system
 ┃ ┣ 📂 reporting/               # Advanced reporting classes (Allure, Email, Matrix)
 ┃ ┣ 📜 CSVManager.ts            # Parses and filters the CSV test data
 ┃ ┣ 📜 DashboardGenerator.ts    # Builds the custom HTML executive dashboard
 ┃ ┣ 📜 FieldCaptureBus.ts       # Temporary memory for captured form fields
 ┃ ┣ 📜 FormChangeDetector.ts    # Compares live fields against snapshots
 ┃ ┣ 📜 FormEngine.ts            # Handles individual field interactions & validations
 ┃ ┣ 📜 FormRunner.ts            # Manages step-by-step form navigation
 ┃ ┣ 📜 Helpers.ts               # Resilient DOM locators and custom waits
 ┃ ┣ 📜 Logger.ts                # Custom console logging formatting
 ┃ ┗ 📜 sendEmail.ts             # Nodemailer SMTP logic for team alerts

 ┣ 📜 .env                       # Local environment variables & credentials
 ┣ 📜 .env.example               # Template for required environment variables
 ┣ 📜 global-setup.ts            # Playwright global setup (e.g., SSO auth state)
 ┣ 📜 global-teardown.ts         # Post-execution cleanup, report generation, and emails
 ┣ 📜 package.json               # Dependencies and CLI execution scripts
 ┣ 📜 playwright.config.ts       # Playwright configuration and runner settings
 ┣ 📜 postExecution.ts           # Dedicated post-run orchestrator script
 ┗ 📜 README.md                  # Project documentation
```

---

## 12. Test Data Management (The CSV Format)

The orchestrator is completely data-driven. It reads a CSV or Excel file to determine exactly which forms to test.

No new automation code is required to onboard additional forms. To add a new form to the test suite, simply add a new row to the test data file.

### Required Columns

| Column Header | Description | Example |
|--------------|-------------|----------|
| Group | CRM group or university identifier | yale |
| Form | Unique form ID | 3691 |
| URL | Direct link to the form | https://example.com/form |
| Run | Execution toggle (Yes or No) | Yes |

### Example

```csv
Group,Form,URL,Run
yale,3691,https://example.com/form,Yes
alb-umt,5122,https://example.com/form2,Yes
```

> **Note:** If tests are executed using the Playwright `-g` (grep) flag, the framework bypasses the `Run` column and force-executes only the matching forms.

---

## 13. CI/CD Pipeline Integration

This framework is fully CI/CD ready.

When executed within pipelines such as GitHub Actions, Jenkins, Azure DevOps, or GitLab CI, the framework automatically detects the CI environment and adjusts its execution behavior.

### Automatic CI Optimizations

#### Headless Mode

Browsers are automatically launched in headless mode.

#### Parallel Execution Control

To prevent SSO token collisions during authentication:

* `fullyParallel` is disabled.
* Worker count is restricted to `1`.
* SSO authentication remains stable across executions.

### Standard CI Pipeline Execution Flow

#### 1. Checkout Source Code

Retrieve the latest repository contents.

#### 2. Install Dependencies

```bash
npm ci
```

#### 3. Install Playwright Browsers

```bash
npx playwright install --with-deps
```

#### 4. Execute Tests

```bash
npm run test
```

#### 5. Publish Artifacts

Archive and publish:

```text
reports/
```

Contains:

* Custom Executive Dashboard
* Execution Summary Assets
* Form Change Reports

and

```text
allure-report/
```

Contains:

* Interactive Allure Dashboard
* Screenshots
* Videos
* Playwright Traces
* API Attachments

These artifacts should be retained by the CI/CD platform for post-execution analysis and historical reporting.