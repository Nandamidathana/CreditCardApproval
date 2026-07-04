# FinGuard AI: Credit Card Approval Prediction System

FinGuard AI is a production-ready, full-stack machine learning web application that automates credit card underwriting decisions. By evaluating applicant personal and financial details, the system calculates approval probabilities, flags specific risk factors, prescribes remediation recommendations, and generates downloadable PDF certificates.

---

## 👥 Team Members & Roles

- **Koduri Venkata Narasimha Reddy** (Team Lead)
- **Archana Choppa** (Member)
- **Abdul Nadeem Tousif** (Member)
- **Midathana Muktananda** (Member)
- **Yasaswi Dadi** (Member)

---

## 🔷 Tech Stack

- **Frontend:** HTML5, Vanilla CSS3 (custom sky fintech theme with Light/Dark mode toggles), JavaScript (SPA routing, Chart.js for data visualization, jsPDF for PDF certificate generation).
- **Backend:** Python (Flask REST API).
- **Database:** SQLite (persists registered users, evaluation history, and analyst feedback).
- **Machine Learning:** scikit-learn, pandas, numpy, joblib, and XGBoost.

---

## 📂 Repository Structure

The project repository is structured logically across developmental phases:

```
├── app.py                      # Flask REST API Web Server
├── database.py                 # SQLite Database Management & Authentication
├── train_model.py              # ML Training Pipeline & Model Serialization
├── requirements.txt            # Python Dependencies
├── README.md                   # Repository Entrypoint (This File)
├── models/
│   ├── model.pkl               # Serialized ML Pipeline (best model)
│   └── metrics.json            # Model Evaluation Metrics & Weights
├── static/
│   ├── index.html              # Frontend Single Page Dashboard
│   ├── sample_applications.csv # Bulk CSV Template File
│   ├── css/
│   │   └── style.css           # Responsive Fintech Layouts & Themes
│   └── js/
│       └── app.js              # SPA Routing, Charting, & PDF Exporter
├── documentation/              # End-to-End SDLC Project Documentation
│   ├── 1_Brainstorming_and_Ideation.md
│   ├── 2_Requirement_Analysis.md
│   ├── 3_Project_Design.md
│   ├── 4_Project_Planning.md
│   ├── 5_Project_Development.md
│   ├── 6_Project_Testing.md
│   ├── 7_Project_Documentation.md
│   └── 8_Project_Demonstration.md
└── scratch/
    └── verify.py               # 9-Stage Automated API Verification Suite
```

---

## 🛡️ Security & Role Architecture

1. **Authentication:** SQLite-backed user authentication with secure password hashing using `werkzeug.security` (PBKDF2-SHA256 with dynamic salting).
2. **Access Control:** 
   - **Guests:** Restricted to viewing the dashboard landing page. Must sign in to submit applications or upload CSVs.
   - **Customers:** Access the Eligibility Check form, view their personal Saved Reports, and download PDF certificates.
   - **Bank Analysts (Admins):** Access bulk evaluations, see the global Saved Reports log, toggle correctness feedback on predictions, and view overall system analytics charts.
3. **Privilege Hardening:** Public registration is locked strictly to the `Customer` role to prevent unauthorized administrative escalation.

---

## 🚀 Local Installation & Quick Start

### 1. Prerequisite Installations
Ensure Python 3.8+ is installed on your Windows, macOS, or Linux machine.

### 2. Clone Repository & Install Packages
Open your command prompt or terminal and run:
```bash
# Navigate to the project directory
cd CreditCardApprovalpro

# Install dependencies
pip install -r requirements.txt
```
*(Note: If compiling `xgboost` is not supported on your local system, the backend automatically falls back to scikit-learn's native Gradient Boosting engine and completes execution).*

### 3. Launch Server
Start the Flask web app:
```bash
python app.py
```
*(The server runs on port **5005** to avoid standard Windows port conflicts. On startup, it automatically creates the database schema and trains/saves the ML model if missing).*

### 4. Open Application
Navigate to:
👉 **[http://127.0.0.1:5005](http://127.0.0.1:5005)**
<<<<<<< HEAD
=======



>>>>>>> dbf95a199213bab6f7c12c3d18bf50842f58947f
---

## 📝 Comprehensive Project Documentation

We have compiled detailed documents for each phase of the Software Development Life Cycle (SDLC) in the **`documentation/`** folder:
1. **[Brainstorming & Ideation](file:///d:/2-2/CreditCardApprovalpro/documentation/1_Brainstorming_and_Ideation.md):** Problems in manual underwriting, product concept, and features checklist.
2. **[Requirement Analysis](file:///d:/2-2/CreditCardApprovalpro/documentation/2_Requirement_Analysis.md):** Functional/non-functional requirements, form bounds, and validation checks.
3. **[Project Design](file:///d:/2-2/CreditCardApprovalpro/documentation/3_Project_Design.md):** SPA design, DB schemas, REST API maps, and ML pipeline transform topologies.
4. **[Project Planning](file:///d:/2-2/CreditCardApprovalpro/documentation/4_Project_Planning.md):** Timelines, deliverables, risk audits, and mitigation buffers.
5. **[Project Development](file:///d:/2-2/CreditCardApprovalpro/documentation/5_Project_Development.md):** ML features engineering, explanation generation algorithms, and SPA interfaces.
6. **[Project Testing](file:///d:/2-2/CreditCardApprovalpro/documentation/6_Project_Testing.md):** The 9-stage automated test suites, manual verification, and performance logs.
7. **[Project Documentation](file:///d:/2-2/CreditCardApprovalpro/documentation/7_Project_Documentation.md):** Admin and customer operation guides, installation guidelines, and user profiles.
8. **[Project Demonstration](file:///d:/2-2/CreditCardApprovalpro/documentation/8_Project_Demonstration.md):** Dynamic user flows, mock screenshots, and cloud deployment guides (Render/Railway).
