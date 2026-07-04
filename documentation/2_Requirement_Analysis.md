# Phase 2: Requirement Analysis

This phase defines the system bounds, user interfaces, functional requirements, and strict input validation rules.

---

## 1. Functional Requirements

### A. Authentication & Registration
- Users must be able to sign up with a unique username, email address, and password.
- **Security Constraint:** Public sign-ups must automatically default to the `Customer` role. No user can choose the `Bank Analyst` (Admin) role during registration.
- Administrators are pre-seeded in the database on startup.

### B. Eligibility Check (Single Application)
- Users must sign in to submit applications.
- Preserves form input values if an unauthenticated user attempts submission and gets redirected to the sign-in modal.
- Evaluates the inputs against the serialized ML pipeline to return an **Approved** or **Rejected** verdict.
- Generates descriptive positive highlights (for approvals) or risk highlights (for rejections) along with remediation suggestions.
- Automatically saves predictions to the database.

### C. Bulk CSV Upload
- Users must sign in as a Bank Analyst or Customer to access this panel.
- Accepts an uploaded CSV file, validates the column names case-insensitively, converts data types, runs batch predictions, and stores results.
- Returns batch aggregate statistics (approval rates, totals) and an interactive results list.

### D. Saved Reports & PDF Certificate
- Logged-in users can view past evaluations in a tabular history log.
- Customer views are limited to their own reports.
- Analysts can see all reports logged in the system.
- Users can download any prediction record as a vector PDF document.

### E. Model Insights Dashboard
- Displays side-by-side performance charts (Accuracy, Precision, Recall, F1) comparing Logistic Regression, Decision Tree, Random Forest, and XGBoost/Gradient Boosting.
- Displays horizontal bar charts detailing feature importance weights.

---

## 2. Non-Functional Requirements
- **Performance:** Model inference must complete in less than 10 milliseconds.
- **Portability:** Uses SQLite database for lightweight database portability. Port configuration must run on port `5005` to avoid common OS port conflicts.
- **Usability:** Fully responsive dashboard styling supporting a global Light/Dark theme. Includes field tooltips and sliders.

---

## 3. Input Validation Boundaries

| Input Field Name | Input Type | Validation Constraints | Tooltip Guidance |
| :--- | :--- | :--- | :--- |
| **Age** | Number | 18 to 70 years | Applicant age in years. |
| **Gender** | Dropdown | Male, Female | Applicant biological sex. |
| **Marital Status** | Dropdown | Single, Married, Civil marriage, Widow, Separated | Current legal marital status. |
| **Family Members** | Number | 1 to 8 | Total family members in household. |
| **Education Level** | Dropdown | Academic degree, Higher education, Incomplete higher, Secondary / secondary special, Lower secondary | Highest qualification attained. |
| **Annual Income** | Number | $5,000 to $1,000,000 | Gross yearly household income. |
| **Income Type** | Dropdown | Working, Commercial Associate, Pensioner, State Servant, Student | Primary source of income. |
| **Employment Duration** | Number | 0.0 to 50.0 years | Years in current work role (0 for retired/unemployed). |
| **Housing Type** | Dropdown | Owned, Rented, With parents, Municipal, Office, Co-op | Current residential status. |
| **Existing Loans** | Dropdown | Yes, No | Presence of active loans/mortgages. |
| **Credit History** | Dropdown | Good, Bad | Bureau records status (defaults/delinquencies). |
| **Credit Inquiries** | Number | 0 to 20 inquiries | Total bureau checks in the last 6 months. |
