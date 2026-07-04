import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

# Set random seed for reproducibility
np.random.seed(42)

def generate_synthetic_data(num_samples=5000):
    print(f"Generating {num_samples} synthetic credit applications...")
    
    # 1. Age (18 - 70)
    age = np.random.randint(18, 71, size=num_samples)
    
    # 2. Gender (Male, Female)
    gender = np.random.choice(['Male', 'Female'], p=[0.48, 0.52], size=num_samples)
    
    # 3. Income Type
    income_types = ['Working', 'Pensioner', 'Commercial Associate', 'State Servant', 'Student']
    income_type = np.random.choice(income_types, p=[0.55, 0.20, 0.15, 0.09, 0.01], size=num_samples)
    
    # 4. Annual Income (Log-normal distribution to mimic real wealth distribution)
    # Mean around $55,000, standard deviation scaling appropriately
    annual_income = np.random.lognormal(mean=10.9, sigma=0.55, size=num_samples)
    # Clip between $15,000 and $600,000 to keep it realistic
    annual_income = np.clip(annual_income, 15000, 600000).astype(int)
    
    # 5. Employment Duration (Years)
    employment_duration = []
    for i in range(num_samples):
        if income_type[i] == 'Pensioner':
            # Pensioners are usually retired, low employment duration currently
            val = np.random.choice([0.0, np.random.uniform(0, 5)])
        elif income_type[i] == 'Student':
            val = np.random.uniform(0, 2)
        else:
            # Working adults: employment duration must be logically consistent with age
            max_possible = age[i] - 18
            if max_possible <= 0:
                val = 0.0
            else:
                # Random duration up to max_possible, with a bias towards 1 to 15 years
                val = min(max_possible, np.random.exponential(scale=6.0))
        employment_duration.append(round(val, 1))
    employment_duration = np.array(employment_duration)
    
    # 6. Education Level
    education_levels = ['Lower secondary', 'Secondary / secondary special', 'Incomplete higher', 'Higher education', 'Academic degree']
    education_level = np.random.choice(education_levels, p=[0.05, 0.60, 0.08, 0.26, 0.01], size=num_samples)
    
    # 7. Marital Status
    marital_statuses = ['Single', 'Married', 'Civil marriage', 'Widow', 'Separated']
    marital_status = np.random.choice(marital_statuses, p=[0.20, 0.60, 0.10, 0.05, 0.05], size=num_samples)
    
    # 8. Family Members (Depends on marital status)
    family_members = []
    for i in range(num_samples):
        if marital_status[i] in ['Married', 'Civil marriage']:
            val = np.random.choice([2, 3, 4, 5], p=[0.40, 0.35, 0.20, 0.05])
        else:
            val = np.random.choice([1, 2, 3], p=[0.70, 0.20, 0.10])
        family_members.append(val)
    family_members = np.array(family_members)
    
    # 9. Housing Type
    housing_types = ['Owned', 'Rented', 'With parents', 'Municipal', 'Office', 'Co-op']
    housing_type = np.random.choice(housing_types, p=[0.65, 0.15, 0.12, 0.04, 0.03, 0.01], size=num_samples)
    
    # 10. Existing Loans (Yes, No)
    existing_loans = np.random.choice(['Yes', 'No'], p=[0.35, 0.65], size=num_samples)
    
    # 11. Credit History (Good, Bad)
    credit_history = np.random.choice(['Good', 'Bad'], p=[0.83, 0.17], size=num_samples)
    
    # 12. Number of Credit Inquiries
    credit_inquiries = np.random.poisson(lam=1.1, size=num_samples)
    credit_inquiries = np.clip(credit_inquiries, 0, 10) # Cap at 10 inquiries
    
    # Create DataFrame
    df = pd.DataFrame({
        'Age': age,
        'Gender': gender,
        'Income_Type': income_type,
        'Annual_Income': annual_income,
        'Employment_Duration': employment_duration,
        'Education_Level': education_level,
        'Marital_Status': marital_status,
        'Family_Members': family_members,
        'Housing_Type': housing_type,
        'Existing_Loans': existing_loans,
        'Credit_History': credit_history,
        'Credit_Inquiries': credit_inquiries
    })
    
    # 13. Logical target variable assignment (mimic realistic underwriting)
    # Start with base log-odds of approval
    log_odds = np.zeros(num_samples)
    
    # Credit History is the strongest predictor
    log_odds += np.where(credit_history == 'Good', 3.8, -3.8)
    
    # Income effect (higher income -> higher odds)
    # Normalized around median income of $50,000
    log_odds += 1.5 * (np.log(annual_income) - np.log(50000))
    
    # Employment duration effect (longer stability -> higher odds)
    log_odds += 0.22 * employment_duration
    
    # Credit inquiries effect (too many inquiries -> credit seeking risk)
    log_odds -= 0.65 * credit_inquiries
    
    # Existing debt load
    log_odds -= np.where(existing_loans == 'Yes', 0.9, 0.0)
    
    # Education level effect
    education_weights = {
        'Academic degree': 1.2,
        'Higher education': 0.6,
        'Incomplete higher': 0.1,
        'Secondary / secondary special': 0.0,
        'Lower secondary': -0.8
    }
    log_odds += np.array([education_weights[el] for el in education_level])
    
    # Housing type effect
    housing_weights = {
        'Owned': 0.4,
        'Co-op': 0.2,
        'Office': 0.1,
        'With parents': 0.0,
        'Municipal': -0.2,
        'Rented': -0.4
    }
    log_odds += np.array([housing_weights[ht] for ht in housing_type])
    
    # Age stability (slightly positive for older applicants up to a point)
    log_odds += 0.015 * (age - 30)
    
    # Family dependents size (negative effect if very large)
    log_odds -= 0.2 * np.maximum(0, family_members - 2)
    
    # Add random noise to simulate real-world variance/unobserved factors
    noise = np.random.normal(0, 1.2, size=num_samples)
    log_odds += noise
    
    # Sigmoid function to get probabilities
    probabilities = 1 / (1 + np.exp(-log_odds))
    
    # Approve if probability is >= 0.50
    approved = (probabilities >= 0.50).astype(int)
    
    df['Approved'] = approved
    
    # Log approval rate
    approval_rate = approved.mean()
    print(f"Approval rate in generated dataset: {approval_rate * 100:.2f}%")
    
    return df

def main():
    # 1. Generate Dataset
    df = generate_synthetic_data(5000)
    
    # Split into features and target
    X = df.drop(columns=['Approved'])
    y = df['Approved']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # 2. Build Preprocessor Pipeline
    numeric_features = ['Age', 'Annual_Income', 'Employment_Duration', 'Family_Members', 'Credit_Inquiries']
    categorical_features = ['Gender', 'Income_Type', 'Education_Level', 'Marital_Status', 'Housing_Type', 'Existing_Loans', 'Credit_History']
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numeric_features),
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
        ]
    )
    
    # 3. Define Models to compare
    from sklearn.linear_model import LogisticRegression
    from sklearn.tree import DecisionTreeClassifier
    from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
    
    # Try importing XGBoost. If unavailable, fallback to GradientBoostingClassifier
    try:
        from xgboost import XGBClassifier
        xgboost_model = XGBClassifier(
            n_estimators=100,
            max_depth=5,
            learning_rate=0.1,
            random_state=42,
            eval_metric='logloss'
        )
        models = {
            "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
            "Decision Tree": DecisionTreeClassifier(max_depth=6, random_state=42),
            "Random Forest": RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42),
            "XGBoost": xgboost_model
        }
        print("XGBoost is available and will be trained.")
    except ImportError:
        gb_model = GradientBoostingClassifier(
            n_estimators=100,
            max_depth=5,
            learning_rate=0.1,
            random_state=42
        )
        models = {
            "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
            "Decision Tree": DecisionTreeClassifier(max_depth=6, random_state=42),
            "Random Forest": RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42),
            "XGBoost": gb_model  # Key named XGBoost so frontend logic remains consistent
        }
        print("XGBoost is NOT available. Falling back to scikit-learn Gradient Boosting Classifier (labeled as XGBoost).")

    # 4. Train and Evaluate Models
    metrics_report = {}
    trained_pipelines = {}
    best_f1 = 0
    best_model_name = ""
    
    for name, model in models.items():
        print(f"Training {name}...")
        pipeline = Pipeline(steps=[
            ('preprocessor', preprocessor),
            ('model', model)
        ])
        
        # Fit model
        pipeline.fit(X_train, y_train)
        trained_pipelines[name] = pipeline
        
        # Evaluate
        y_pred = pipeline.predict(X_test)
        y_prob = pipeline.predict_proba(X_test)[:, 1]
        
        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred)
        rec = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        cm = confusion_matrix(y_test, y_pred).tolist()
        
        metrics_report[name] = {
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "confusion_matrix": cm
        }
        print(f"{name} -> Accuracy: {acc:.4f}, F1-Score: {f1:.4f}")
        
        # Keep track of best model by F1 Score
        if f1 > best_f1:
            best_f1 = f1
            best_model_name = name

    print(f"\nBest Model Selected: {best_model_name} with F1-Score: {best_f1:.4f}")
    
    # 5. Extract Feature Importance for the best model (or a representative ensemble)
    best_pipeline = trained_pipelines[best_model_name]
    best_model = best_pipeline.named_steps['model']
    
    # Get feature names out of the transformer
    transformer = best_pipeline.named_steps['preprocessor']
    feature_names = transformer.get_feature_names_out()
    
    # Extract raw importances/coefficients
    raw_importances = []
    if hasattr(best_model, 'feature_importances_'):
        raw_importances = best_model.feature_importances_
    elif hasattr(best_model, 'coef_'):
        raw_importances = best_model.coef_[0]
    else:
        # Fallback to random forest if best model doesn't support easily (e.g. some settings)
        rf_pipeline = trained_pipelines["Random Forest"]
        raw_importances = rf_pipeline.named_steps['model'].feature_importances_
        feature_names = rf_pipeline.named_steps['preprocessor'].get_feature_names_out()
    
    # Group one-hot encoded category importances back to original feature groups
    importances_grouped = {}
    for fname, val in zip(feature_names, raw_importances):
        # fname looks like 'num__Age' or 'cat__Gender_Male'
        parts = fname.split('__')
        col_type = parts[0]
        col_name = parts[1]
        
        # Check which original feature this belongs to
        original_name = col_name
        for cat_feat in categorical_features:
            if col_name.startswith(cat_feat):
                original_name = cat_feat
                break
        
        # Sum importance (absolute value for coefficients)
        importances_grouped[original_name] = importances_grouped.get(original_name, 0.0) + abs(val)
        
    # Normalize grouped importances to sum to 1
    total_imp = sum(importances_grouped.values())
    if total_imp > 0:
        for k in importances_grouped:
            importances_grouped[k] = round(importances_grouped[k] / total_imp, 4)
            
    # Sort importances
    sorted_importances = dict(sorted(importances_grouped.items(), key=lambda item: item[1], reverse=True))
    
    # Save folder paths
    os.makedirs('models', exist_ok=True)
    
    # 6. Save Model and Metrics
    model_save_path = os.path.join('models', 'model.pkl')
    metrics_save_path = os.path.join('models', 'metrics.json')
    
    print(f"Saving selected model pipeline to {model_save_path}...")
    joblib.dump(best_pipeline, model_save_path)
    
    # Package metadata for JSON
    output_metrics = {
        "best_model": best_model_name,
        "models": metrics_report,
        "feature_importances": sorted_importances
    }
    
    print(f"Saving metrics report to {metrics_save_path}...")
    with open(metrics_save_path, 'w') as f:
        json.dump(output_metrics, f, indent=4)
        
    print("Model pipeline training and serialization completed successfully!")

if __name__ == '__main__':
    main()
