# FinGuard AI: Demonstration & Project Planning Documentation

This consolidated document contains the required project documentation modules:
1. **Communication Plan & Challenges**
2. **Demonstration of Proposed Features**
3. **Project Demo Planning**
4. **Scalability & Future Plan**
5. **Team Involvement in Demonstration**

---

## 1. Communication

| Detail | Value |
| :--- | :--- |
| **Date** | 15 March 2026 |
| **Team ID** | creditcardapproval |
| **Project Name** | FinGuard AI: Credit Card Approval Prediction System |
| **Maximum Marks** | 1 Mark |

### Communication Plan:
Effective communication is essential for a successful project demonstration. This document outlines the communication strategy used within the team and with stakeholders throughout the project lifecycle, including how updates, issues, and feedback were managed.

| S.No | Communication Type | Frequency | Channel / Tool | Participants | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Team Standup | Daily | WhatsApp & MS Teams | All Team Members | Discuss daily progress, assign tasks, and address immediate blockers. |
| 2 | Progress Update | Weekly | Google Meet | All Team Members & Stakeholders | Review weekly milestones, demo completed features, and adjust planning. |
| 3 | Issue / Bug Discussion | As Needed | GitHub Issues & WhatsApp | Developers & Team Lead | Report, reproduce, and resolve codebase bugs or model issues. |
| 4 | Stakeholder Review | Bi-Weekly | Google Meet | Team Lead & Stakeholders | Present high-level project status and gather external feedback. |
| 5 | Final Demo Rehearsal | Once | MS Teams | All Team Members | Dry-run the demonstration script, verify roles, and check screen-sharing. |
| 6 | Code Review & Merge | Bi-Weekly | GitHub Pull Requests | All Team Members | Peer review code changes, run verification tests, and merge features. |

### Communication Challenges & Resolutions:

| S.No | Challenge Faced | Resolution / Action Taken |
| :--- | :--- | :--- |
| 1 | Scheduling synchronous meetings across different personal schedules. | Resolved by setting a fixed 15-minute daily standup on WhatsApp and scheduling Google Meet syncs well in advance. |
| 2 | Debugging integration issues between Flask backend and Frontend SPA asynchronously. | Utilized GitHub Issues to document API payloads and responses, ensuring clear communication of data schemas. |
| 3 | Merging conflicting code changes in the frontend JavaScript files. | Adopted feature branches and mandatory pull request reviews before merging code into the main branch. |

---

## 2. Demonstration of Proposed Features

| Detail | Value |
| :--- | :--- |
| **Date** | 15 March 2026 |
| **Team ID** | creditcardapproval |
| **Project Name** | FinGuard AI: Credit Card Approval Prediction System |
| **Maximum Marks** | 1 Mark |

### Demonstration of Proposed Features:
This document captures all the features that were proposed during the project planning phase and tracks whether each feature was successfully implemented and demonstrated. It serves as evidence of the team's ability to deliver on the proposed solution.

| S.No | Feature Name | Description | Status (Implemented / Partial / Pending) | Demonstrated (Yes / No) | Remarks |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Secure Multi-Step Web Form | Interactive 3-step questionnaire with real-time field validation and user presets. | Implemented | Yes | Integrated with robust frontend and backend boundary validation. |
| 2 | Radial Probability Dial | Dynamic visual gauge displaying prediction confidence score. | Implemented | Yes | Animated with CSS transitions based on ML probability. |
| 3 | Explainable AI Insights | Section detailing positive highlights or risk factors and custom remediation steps. | Implemented | Yes | Tailored to individual decision outputs dynamically. |
| 4 | Bulk Prediction Engine | CSV uploader to evaluate multiple applications simultaneously. | Implemented | Yes | Supports file upload, format checks, and aggregate results download. |
| 5 | Model Insights Dashboard | Charts comparing model performance (Accuracy, Precision, Recall, F1) and feature importances. | Implemented | Yes | Built using Chart.js on the frontend. |
| 6 | Saved Reports & PDF Export | Secure persistent history log with the ability to export vector PDF certificates. | Implemented | Yes | Uses SQLite backend and client-side jsPDF. |
| 7 | Authentication & Role Hardening | Isolated guest, customer, and bank analyst roles. | Implemented | Yes | Enforces PBKDF2 hashing and backend privilege verification. |

### Feature Implementation Summary:

| Metric | Value |
| :--- | :--- |
| **Total Features Proposed** | 7 |
| **Total Features Implemented** | 7 |
| **Total Features Demonstrated** | 7 |
| **Overall Implementation Rate (%)** | 100% |

---

## 3. Project Demo Planning

| Detail | Value |
| :--- | :--- |
| **Date** | 15 March 2026 |
| **Team ID** | creditcardapproval |
| **Project Name** | FinGuard AI: Credit Card Approval Prediction System |
| **Maximum Marks** | 1 Mark |

### Project Demo Planning:
A well-structured demo plan ensures that the team presents the project effectively, covering all key aspects in a clear and organized manner. This document outlines the plan for demonstrating the project, including the flow of the demo, key features to highlight, and responsibilities of each team member.

| S.No | Demo Section | Description | Duration (mins) | Responsible Member |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Introduction & Problem Statement | Explain traditional underwriting bottlenecks, project scope, and goals. | 3 mins | Yasaswi Dadi |
| 2 | Solution Overview & Tech Stack | Present FinGuard AI system architecture, SQLite database, and Flask REST API. | 3 mins | Koduri Venkata Narasimha Reddy |
| 3 | Core Eligibility Check Demo | Show Guest limits, signup/login flow, demographic presets, and XAI results. | 4 mins | Archana Choppa |
| 4 | Bulk CSV Upload & Reports | Demonstrate bulk CSV processing, tabular reports, and PDF certificate export. | 3 mins | Midathana Muktananda |
| 5 | Model Insights & Visualization | Showcase Chart.js comparative performance bar charts and feature importances. | 3 mins | Abdul Nadeem Tousif |
| 6 | Q&A Session & Conclusion | Answer questions from evaluators and conclude the demonstration. | 4 mins | Yasaswi Dadi & Team |

### Demo Flow Summary:

| Step | Activity | Notes |
| :--- | :--- | :--- |
| 1 | Introduction & Problem Statement | Walk through slides and define problem statements (delays, bias, risk). |
| 2 | Solution Overview | Introduce Flask, SQLite, XGBoost model pipeline, and repository architecture. |
| 3 | Live Feature Demonstration | Walk through guest restrictions, login, single eligibility form, bulk CSV, and PDF export. |
| 4 | Q&A Session | Answer panel queries regarding model accuracy, feature weights, and security constraints. |

---

## 4. Scalability & Future Plan

| Detail | Value |
| :--- | :--- |
| **Date** | 15 March 2026 |
| **Team ID** | creditcardapproval |
| **Project Name** | FinGuard AI: Credit Card Approval Prediction System |
| **Maximum Marks** | 1 Mark |

### Scalability & Future Plan:
This document outlines how the current project solution can be scaled to handle larger user bases, increased data loads, or extended features in the future. It also captures the team's roadmap for enhancing and evolving the project beyond its current state.

### Current System Limitations:

| S.No | Limitation | Impact | Priority to Address (High / Medium / Low) |
| :--- | :--- | :--- | :--- |
| 1 | SQLite Database is file-locked during concurrent writes. | High (could slow down database response during multiple simultaneous bulk uploads). | High |
| 2 | Local Python model inference inside Flask main thread. | Medium (synchronous model inference blocks the event loop under heavy loads). | Medium |
| 3 | Client-side PDF generation using jsPDF. | Low (large datasets or complex page layouts might lag on low-powered client devices). | Low |

### Scalability Plan:

| S.No | Scalability Aspect | Current State | Proposed Upgrade / Solution |
| :--- | :--- | :--- | :--- |
| 1 | User Load | Flask built-in server (single process). | Deploy behind Gunicorn / Nginx WSGI servers and use Load Balancers. |
| 2 | Data Storage | Local SQLite database. | Migrate to a managed PostgreSQL or MySQL database cluster. |
| 3 | Performance | Synchronous local ML model execution. | Implement Celery task queue with Redis for asynchronous prediction processing. |
| 4 | Security | Cookie-based session storage. | Upgrade to stateless JWT authentication and implement OAuth 2.0. |

### Future Roadmap:

| Phase | Planned Feature / Enhancement | Target Timeline | Expected Impact |
| :--- | :--- | :--- | :--- |
| Phase 1 | Setup & Core ML MVP | Month 1 (Completed) | Functional local web application. |
| Phase 2 | Database Migration & API Scaling | Month 3 | Support for high concurrent transactions. |
| Phase 3 | Real-Time SHAP/LIME Explanations | Month 6 | Improved mathematical explanations for loan decisions. |
| Phase 4 | Mobile App & API Integrations | Month 12 | Seamless access for mobile banking clients. |

---

## 5. Team Involvement in Demonstration

| Detail | Value |
| :--- | :--- |
| **Date** | 15 March 2026 |
| **Team ID** | creditcardapproval |
| **Project Name** | FinGuard AI: Credit Card Approval Prediction System |
| **Maximum Marks** | 1 Mark |

### Team Involvement in Demonstration:
This document records the active participation and roles of each team member during the project demonstration. It ensures that every member contributes meaningfully to the presentation and that responsibilities are distributed fairly and clearly.

| S.No | Team Member Name | Role in Demo | Section Presented | Contribution Summary | Participation (Active / Passive) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Koduri Venkata Narasimha Reddy | Team Lead | Solution Overview & Tech Stack | Architected Flask backend APIs, database models, and coordinated presentation. | Active |
| 2 | Archana Choppa | Member | Eligibility Check & Presets | Designed frontend layout, form validations, and user preset interactions. | Active |
| 3 | Abdul Nadeem Tousif | Member | Model Insights & Analytics | Trained XGBoost pipeline, evaluated metrics, and built Chart.js graphics. | Active |
| 4 | Midathana Muktananda | Member | Bulk CSV & Saved Reports | Developed bulk CSV batch processing and tabular search history logs. | Active |
| 5 | Yasaswi Dadi | Member | Intro & Q&A Coordination | Formulated slides, presented problem statements, and managed Q&A responses. | Active |

### Team Coordination Notes:

| Aspect | Details |
| :--- | :--- |
| **Team Leader / Coordinator** | Koduri Venkata Narasimha Reddy |
| **Overall Team Coordination Rating (1-5)** | 5 |
| **Any issues during demo** | None. Transition between team member presentations and screen sharing went smoothly. |
| **How issues were resolved** | N/A (contingency backup slides and locally hosted fallback server were prepared but not needed). |
