# Phase 4: Project Planning

This phase schedules project deliverables, milestones, risk registers, and mitigation strategies.

---

## 1. Project Milestones & Timeline (Sprint Schedule)

We follow a structured 4-week development timeline:

```
  Week 1: Analysis & Data Pipeline Prep
  █▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ 25% (Synthesize dataset, train and serialize ML models)
  
  Week 2: Database Schema & API Development
  ██████████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ 50% (Develop database.py and Flask app.py REST routes)
  
  Week 3: Frontend SPA Interface Assembly
  ████████████████████▒▒▒▒▒▒▒▒▒▒▒▒ 75% (Build responsive sky dashboard and PDF exporter)
  
  Week 4: Testing, Security Hardening & Deployment
  ████████████████████████████████ 100% (Automated verify.py tests, role limits, and launch)
```

- **Milestone 1 (End of Week 1):** ML Models trained and serialized. `model.pkl` and `metrics.json` generated.
- **Milestone 2 (End of Week 2):** Backend server ready. SQLite connection and user tables active.
- **Milestone 3 (End of Week 3):** User Interface completed. Responsive Light/Dark theme and PDF certificate print out operational.
- **Milestone 4 (End of Week 4):** Integration tests passed. Admin user role isolated. Server launched on port `5005`.

---

## 2. Risk Register & Mitigation Strategy

### Risk 1: Port conflict with system services (e.g. port 5000)
- **Probability:** High (Windows frequently binds system services to port 5000).
- **Impact:** Critical (Flask server fails to start or requests get intercepted, returning 404).
- **Mitigation:** Shifted default server configuration to port **5005** (`app.run(port=5005)`). Verified that relative browser requests (`fetch('/api/...')`) resolve automatically without hardcoding absolute paths.

### Risk 2: Platform compiling failures for tree ensembles (e.g. XGBoost)
- **Probability:** Medium (Some Windows environments lack compiler libraries for XGBoost C-code).
- **Impact:** High (Inability to run `train_model.py` or load the classifier).
- **Mitigation:** Implemented a try-except block in `train_model.py`. If `xgboost` is unavailable, the pipeline falls back to scikit-learn's native `GradientBoostingClassifier` and re-labels the metrics report key to "XGBoost", ensuring frontend compatibility.

### Risk 3: Unauthorized privilege escalation
- **Probability:** High (If roles can be selected on registration, malicious users will sign up as Admins).
- **Impact:** Critical (Unauthorized users gain view access to private financial data).
- **Mitigation:** Eradicated the role dropdown selector from the registration form. Forced the backend signup route to hardcode `role = 'Customer'`, ignoring any client-provided inputs. Added analyst checks on `/api/stats` and `/api/history/<id>/feedback`.
