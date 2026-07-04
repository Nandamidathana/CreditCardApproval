# Phase 5: Project Development

This phase describes the codebase development, including model training, database storage, and explanation generation algorithms.

---

## 1. Machine Learning Development (`train_model.py`)
- **Demographics Generation:** programmatically generates 5,000 applicant rows using standard numpy distributions (e.g. Poisson for inquiries, log-normal for incomes).
- **Correlation Seeding:** Applies mathematical weights (log-odds calculation) to determine applicant eligibility. This guarantees the model learns a realistic underwriting function (e.g., poor credit history results in massive negative coefficients).
- **Serialization:** Saves the best pipeline (e.g. Logistic Regression) to `models/model.pkl` and metric reports to `models/metrics.json` using `joblib`.

---

## 2. Database & Auth Development (`database.py`)
- **Initialization:** Automatically initializes table schemas on server boot if `database.db` does not exist.
- **Cryptography:** Protects user passwords by hashing them with `PBKDF2-SHA256` and dynamic salt.
- **Aggregations:** Calculates dashboard stats (approval rates, average income, weekly trend logs) using SQL aggregate queries (`AVG`, `SUM`, `COUNT`) for efficient dashboard load times.
- **Seeding:** Automatically seeds the main administrator profile:
  - **Username:** `Nanda`
  - **Password:** `Nanda@2125`

---

## 3. API Logic & Explainability Development (`app.py`)
- **REST Endpoints:** Exposes JSON APIs for predictions, CSV bulk evaluations, history logs, and overrides.
- **Explainability Logic:** Implements an algorithmic rule engine to evaluate client inputs and identify risk factors:
  - If `Credit_History == 'Bad'`: Flags "Poor credit history (critical risk indicator)" and prescribes "Focus on rebuilding credit..."
  - If `Credit_Inquiries > 3`: Flags "High number of recent inquiries..." and recommends "Limit new credit card applications..."
  - If `Annual_Income < 35,000`: Flags "Relatively low annual income..." and recommends "Apply with a co-signer..."
  - If `Employment_Duration < 1.5`: Flags "Short employment tenure..." and recommends "Maintain employment stability..."
  - If `Existing_Loans == 'Yes'`: Flags "Active existing loans..." and recommends "Pay down outstanding debt..."

---

## 4. Frontend SPA Dashboard Development (`index.html`, `style.css`, `app.js`)
- **Single Page App (SPA):** Eliminates page refreshes. Transition views are managed using CSS classes (`.view-section { display: none; }` and `.view-section.active { display: block; }`).
- **CSS Variables:** Implements variable tokens for background colors, gradients, card shadows, and fonts (Inter/Outfit). This enables a seamless global Dark Theme toggle.
- **Charts Visualization:** Renders Model Comparison charts and Feature Importance charts using Chart.js on client-side canvas elements.
- **Client-Side Exporters:** Uses jsPDF to build and download underwriting reports on the client side, avoiding server load.
