# Phase 8: Project Demonstration

This document serves as the guide for demonstrating the application's core functionality, deployment steps, and user flows.

---

## 1. Step-by-Step Demonstration Script

To perform a live walkthrough of **FinGuard AI**:

1. **Dashboard Overview:**
   - Present the sky-gradient fintech landing page.
   - Show the analytics counters (evaluated totals, average income, model name).
   - Demonstrate the **Light/Dark Mode** toggle to showcase the responsive theme styling.

2. **Sign-In Interception (Enforced Security):**
   - Attempt to click **Check Eligibility** and submit a form without signing in.
   - Show that the system blocks the submission, prompts the user to log in, and preserves their form inputs.

3. **Demographic Presets & Decisions:**
   - Log in as the administrator (`Nanda` / `Nanda@2125`).
   - Fill the **Eligible Profile** preset and submit. Show the green approval badge and strengths highlights. Export and open the PDF certificate.
   - Fill the **High-Risk Profile** preset and submit. Show the red rejection badge, risk factor list, and recommended remediation steps.

4. **Bulk CSV Import:**
   - Click **Bulk Evaluation** in the sidebar.
   - Download the template CSV and upload the pre-seeded `static/sample_applications.csv` file.
   - Show the batch approval counters and filter the processed output table.

5. **Saved Reports Log & Analyst Feedback:**
   - Navigate to the **Saved Reports** tab to show the audit trail.
   - Toggle the Correct/Incorrect feedback thumbs-up/down icons under the analyst view.

6. **Model Insights:**
   - Go to **Model Insights** to view the Chart.js visualizer showing model metric comparisons and horizontal feature importances.

---

## 2. Cloud Integration & Deployment Guide

You can deploy the Flask application to cloud platforms like **Render**, **Railway**, or **Heroku**:

### A. Deploying to Render
1. Create a free account at [render.com](https://render.com/).
2. Click **New** -> **Web Service** and connect your GitHub repository.
3. Configure the following settings:
   - **Environment:** `Python`
   - **Build Command:** `pip install -r requirements.txt && python train_model.py` (this automatically runs model training on Render during deployment build!)
   - **Start Command:** `gunicorn app:app` (ensure you add `gunicorn` to `requirements.txt` if deploying on Linux-based cloud services).
4. Render will deploy the app and provide a public URL (e.g. `https://finguard-ai.onrender.com`).

### B. Deploying to Railway
1. Sign in to [railway.app](https://railway.app/).
2. Create a **New Project** and connect your GitHub repository.
3. Railway automatically detects Python and will install dependencies.
4. Add a Start Command setting: `gunicorn app:app` (or `python app.py` running on `0.0.0.0` with the port environment variable injected by Railway).
