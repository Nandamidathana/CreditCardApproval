# Phase 7: Project Documentation

This document serves as the operations and configuration manual for the Credit Card Approval Prediction System.

---

## 1. User Guides by System Role

### A. Customer User Guide
1. **Sign Up:** Click **"Sign In"** in the top header, click **"Create Account"** inside the modal, fill in your details (username, email, password), and submit.
2. **Access Form:** Navigate to the **"Check Eligibility"** tab.
3. **Run Prediction:** Complete the 3-step questionnaire (Age, Income, Credit history) and click **"Submit Application"**.
4. **View Suggestions:** Read the personalized risk factor highlights and financial advice on the Results panel.
5. **Download Certificate:** Click **"Save Report"** to export a local PDF certificate.
6. **Saved Reports:** Click **"Saved Reports"** in the sidebar to view your evaluation logs. Click **"Report"** on any row to re-download the PDF certificate.
7. **Profile View:** Click **"My Profile"** to check your registration details and sign out.

### B. Bank Analyst (Admin) User Guide
1. **Sign In:** Log in using the administrator credentials (**Username:** `Nanda` | **Password:** `Nanda@2125`).
2. **Dashboard Analytics:** Monitor system totals, approval rates, average applicant incomes, and daily application trends.
3. **Bulk Evaluation:** 
   - Navigate to the **"Bulk Evaluation"** tab.
   - Click **"Download CSV Template"** to get a formatted file.
   - Drag and drop your populated application CSV into the dropzone.
   - View batch statistics (total evaluated, batch approval rate) and filter records (All, Approved, Rejected) in the output table.
4. **Saved Reports Ledger:** Access all evaluations logged by every user in the database.
5. **Model Feedback:** Review the analyst audit buttons (Thumbs Up / Thumbs Down) under the **Feedback** column to label predictions as **Correct** or **Incorrect**.

---

## 2. Troubleshooting Registry

### Issue 1: Port conflict when launching the server (`OSError: [Errno 98] Address already in use`)
- **Reason:** Another service (like Windows AirPlay Receiver or SSDP Discovery) is using port 5000 or 5005.
- **Resolution:** Change the port parameter in `app.py` at line 449: `app.run(port=5006)` (or any other open port), and update the test URL in `verify.py`.

### Issue 2: `joblib.externals.loky.process_executor.TerminatedWorkerError` or pickle loading failures
- **Reason:** Version mismatch in scikit-learn or Python between the training environment and the server environment.
- **Resolution:** Run `python train_model.py` to regenerate the serialized model file (`model.pkl`) using your current Python environment's libraries.
