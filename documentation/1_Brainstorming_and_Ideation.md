# Phase 1: Brainstorming & Ideation

## 1. Problem Statement
In traditional banking institutions, credit card underwriting is a manual, labor-intensive, and error-prone process.
- **Delays:** Manual reviews take days or weeks, causing customer drop-off.
- **Inconsistencies:** Decision criteria vary among human underwriters, leading to bias and unequal treatment.
- **Exposure to Risk:** Credit officers have difficulty assessing complex, multi-dimensional correlations in applicant financial data (e.g. comparing recent inquiries, active debt levels, and employment tenure simultaneously).

---

## 2. Proposed Solution: FinGuard AI
FinGuard AI is an automated, web-based intelligence system that automates credit card underwriting using machine learning.
- **Instant Decisioning:** Processes applicant variables under 10 milliseconds.
- **Explainable AI (XAI):** Deciphers model predictions by isolating risk factors (e.g., low income, high inquiries) and outlining corrective steps.
- **Roles-Isolated Dashboard:** Provides a clear division of views for bank customers (simple eligibility checks) and bank personnel (bulk uploads, metrics charts, decision feedback loops).

---

## 3. Core Feature Checklist (Brainstormed & Selected)
During our brainstorming sessions, we selected the following core features:
- [x] **Secure Multi-Step Web Form:** Interactive 3-step questionnaire with real-time field validation.
- [x] **One-Click Demographic Presets:** Allows developers and analysts to test valid and invalid customer profiles instantly.
- [x] **Radial Probability Dial:** Dynamic visual indicator showing the application's confidence score.
- [x] **Bulk Prediction Engine:** CSV file uploader to evaluate thousands of applications in a single batch.
- [x] **Model Performance Comparison:** Side-by-side bar chart showing Accuracy, Precision, Recall, and F1 metrics for four separate ML algorithms.
- [x] **Interactive Feature Importance:** Horizontal chart indicating what features most heavily influence decision outputs.
- [x] **Saved Reports & PDF Download:** Database logs that preserve evaluation data, allowing users to print vector PDF underwriting certificates.
- [x] **Role Security & Hardening:** Eradicates client-side admin registration. All public signups are restricted to the Customer role. Default admin accounts are seeded securely.
