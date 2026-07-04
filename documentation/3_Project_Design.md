# Phase 3: Project Design

This phase details the system's software architecture, database design, REST API specifications, and machine learning pipeline structure.

---

## 1. System Architecture
The application follows a decoupled client-server structure:
- **Client-Side SPA:** A single HTML file ([index.html](file:///d:/2-2/CreditCardApprovalpro/static/index.html)) structured with dynamic display panels. CSS styles are managed via custom properties, and Javascript handles all view changes, form steps, Chart.js integrations, and PDF builds.
- **Server-Side REST API:** A Flask application ([app.py](file:///d:/2-2/CreditCardApprovalpro/app.py)) that handles API requests, interacts with the SQLite database, and feeds inputs into the preloaded ML model pipeline.

---

## 2. Database Design (SQLite)

We utilize SQLite (`database.db`) for secure and lightweight data storage.

### A. Table: `users`
Persists user logins and roles.
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
- `username` (TEXT UNIQUE NOT NULL)
- `password_hash` (TEXT NOT NULL)
- `email` (TEXT NOT NULL)
- `role` (TEXT NOT NULL DEFAULT 'Customer')
- `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

### B. Table: `predictions`
Logs evaluated applications.
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
- `user_id` (INTEGER, FOREIGN KEY to `users.id`)
- `age` (INTEGER NOT NULL)
- `gender` (TEXT NOT NULL)
- `income_type` (TEXT NOT NULL)
- `annual_income` (REAL NOT NULL)
- `employment_duration` (REAL NOT NULL)
- `education_level` (TEXT NOT NULL)
- `marital_status` (TEXT NOT NULL)
- `family_members` (INTEGER NOT NULL)
- `housing_type` (TEXT NOT NULL)
- `existing_loans` (TEXT NOT NULL)
- `credit_history` (TEXT NOT NULL)
- `credit_inquiries` (INTEGER NOT NULL)
- `prediction` (INTEGER NOT NULL) -- 1 = Approved, 0 = Rejected
- `probability` (REAL NOT NULL)
- `risk_factors` (TEXT NOT NULL) -- Stored as JSON string
- `suggestions` (TEXT NOT NULL) -- Stored as JSON string
- `feedback` (TEXT DEFAULT 'None') -- 'Correct', 'Incorrect', 'None'
- `timestamp` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

---

## 3. REST API Specifications

### A. Authentication Endpoints
- **POST `/api/auth/register`**
  - Payload: `{"username": "name", "email": "e@mail.com", "password": "pass"}`
  - Response: `{"message": "User registered successfully!"}`
- **POST `/api/auth/login`**
  - Payload: `{"username": "name", "password": "pass"}`
  - Response: `{"token": "randomhex", "user": {"username": "name", "role": "Customer"}}`
- **POST `/api/auth/logout`**
  - Headers: `Authorization: Bearer <token>`
  - Response: `{"message": "Logged out successfully"}`
- **GET `/api/auth/me`**
  - Headers: `Authorization: Bearer <token>`
  - Response: `{"user": {"username": "name", "email": "e@mail.com", "role": "Customer"}}`

### B. Prediction & Analytics Endpoints
- **POST `/api/predict`**
  - Headers: `Authorization: Bearer <token>`
  - Payload: All 12 applicant inputs.
  - Response: `{"id": 1, "prediction": "Approved", "probability": 0.98, "positive_factors": [...], "suggestions": [...]}`
- **POST `/api/predict/bulk`**
  - Headers: `Authorization: Bearer <token>`
  - Payload: `multipart/form-data` containing the CSV file.
  - Response: `{"summary": {"total_evaluated": 10, "approved": 6, "rejected": 4}, "results": [...]}`
- **GET `/api/history`**
  - Headers: `Authorization: Bearer <token>`
  - Response: List of historical evaluation records.
- **POST `/api/history/<id>/feedback`**
  - Headers: `Authorization: Bearer <token>` (Analyst role required)
  - Payload: `{"feedback": "Correct"}`
  - Response: `{"message": "Feedback updated successfully"}`
- **GET `/api/metrics`**
  - Response: Model F1/Accuracy scores and feature importance weights.
- **GET `/api/stats`**
  - Headers: `Authorization: Bearer <token>` (Analyst role required)
  - Response: Total records, approval rates, average incomes, and daily trend logs.

---

## 4. Machine Learning Preprocessor Pipeline
Before data is sent to the classifier, it undergoes column transformation via scikit-learn's `ColumnTransformer`:
- **Numerical Features** (`Age`, `Annual_Income`, `Employment_Duration`, `Family_Members`, `Credit_Inquiries`) are scaled using `StandardScaler` to bring feature variances to a standard normal distribution.
- **Categorical Features** (`Gender`, `Income_Type`, `Education_Level`, `Marital_Status`, `Housing_Type`, `Existing_Loans`, `Credit_History`) are encoded using `OneHotEncoder(handle_unknown='ignore')` to convert string categories into binary vectors safely.
- The pipeline encapsulates these preprocessors together with the estimator, so that the API feeds raw dictionaries directly into a single unified object.
