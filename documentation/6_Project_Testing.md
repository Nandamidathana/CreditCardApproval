# Phase 6: Project Testing

This phase describes the testing procedures, automated verification scripts, and manual test cases.

---

## 1. Automated Integration Testing (`verify.py`)

We built a 9-stage Python verification script ([verify.py](file:///C:/Users/NANDA/.gemini/antigravity/brain/9f4543e2-4bf5-4130-b28c-7d5bdce55b06/scratch/verify.py)) to test all API endpoints end-to-end.

### Test Execution Output (Consolidated Log):
```
--- FINGUARD AI API VERIFICATION TESTING ---

1. Testing Home page serving...
[PASS] Served index.html successfully.

2. Testing Admin User Authentication...
[PASS] Logged in admin. Token retrieved: 49ae49de66...

3. Testing User Registration...
[PASS] Customer registered successfully.

3.5. Testing Unauthenticated Prediction Check...
[PASS] Blocked guest prediction request (401 Unauthorized) successfully.

4. Testing Eligible Application Prediction...
[PASS] Eligible profile Approved. Probability: 0.9999

5. Testing High-Risk Application Prediction...
[PASS] High-risk profile Rejected. Probability: 0.0
       Risk Factors Flagged: ['Poor credit history (critical risk indicator for lenders).', 'High number of recent credit inquiries (6 inquiries). Suggests urgent credit-seeking behavior.', 'Relatively low annual income ($18,000).', 'Short employment tenure (0.5 years). Lenders favor stability.', 'Active existing loans (elevates debt-to-income ratio).', 'Young applicant age (limited financial footprint).', 'Housing status is rented (statistically lower stability score than home ownership).']

6. Testing Bulk Upload Endpoint...
[PASS] CSV processed. Total evaluated: 3, Approved: 2

7. Testing ML Metrics Retrieval...
[PASS] Model metrics retrieved. Best model trained: Logistic Regression

8. Testing History Endpoint...
[PASS] Prediction history records found: 10 records.

9. Testing Dashboard Aggregate Statistics...
[PASS] Stats fetched. Total applications: 10, Approval Rate: 60.0%

--- ALL TESTS COMPLETED SUCCESSFULLY! ---
```

---

## 2. Manual Test Cases (Web UI Verification)

### Test Case 1: Sign-In Enforcement (Guest Block)
- **Steps:**
  1. Open browser to `http://127.0.0.1:5005/`.
  2. Click **"Check Eligibility"** from the sidebar.
  3. Click **"Eligible Profile"** preset button to fill in applicant values.
  4. Navigate to Step 3 and click **"Submit Application"**.
- **Expected Outcome:** Form submission is blocked. An alert prompt shows **"You must sign in to submit a credit application."** and the Sign-In modal opens automatically. The entered form values remain intact.

### Test Case 2: One-Click Presets & Results Dial
- **Steps:**
  1. Open the Sign-In modal and log in as `Nanda` (Password: `Nanda@2125`).
  2. Go to the Eligibility Form and click **"Eligible Profile"** preset.
  3. Submit the form.
- **Expected Outcome:** The view switches to the Results Panel. The verdict shows a green **"Approved"** badge. The radial gauge animates to **100%**. The strengths box lists **"Excellent credit history record"** and **"Strong annual income"**.
- **Steps (High-Risk):**
  1. Go back to the form and click **"High-Risk Profile"** preset.
  2. Submit the form.
- **Expected Outcome:** The verdict shows a red **"Rejected"** badge. The radial gauge animates to **0%**. The risks box lists **"Poor credit history"**, **"High number of recent inquiries (6 inquiries)"**, and **"Active existing loans"**.
