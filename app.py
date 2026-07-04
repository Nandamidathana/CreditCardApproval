import os
import json
import secrets
import pandas as pd
import numpy as np
import joblib
from flask import Flask, request, jsonify, send_from_directory
from database import (
    init_db, register_user, authenticate_user, save_prediction,
    get_prediction_history, update_prediction_feedback, get_dashboard_stats
)

app = Flask(__name__, static_folder='static', static_url_path='')
app.secret_key = secrets.token_hex(24)

# In-memory session tokens map (token -> user_dict)
ACTIVE_TOKENS = {}

# Global variable to hold the loaded model pipeline
model_pipeline = None
model_metrics = None

def load_model():
    """Loads the serialized machine learning pipeline and training metrics.
       Triggers model training automatically if the model file is missing."""
    global model_pipeline, model_metrics
    model_path = os.path.join('models', 'model.pkl')
    metrics_path = os.path.join('models', 'metrics.json')
    
    if not os.path.exists(model_path) or not os.path.exists(metrics_path):
        print("Serialized model or metrics not found. Triggering training pipeline...")
        try:
            import train_model
            train_model.main()
        except Exception as e:
            print(f"Failed to auto-train model: {e}")
            return
            
    try:
        model_pipeline = joblib.load(model_path)
        with open(metrics_path, 'r') as f:
            model_metrics = json.load(f)
        print("ML model and metrics loaded successfully.")
    except Exception as e:
        print(f"Error loading model or metrics: {e}")

# Helper to retrieve the logged-in user from the Authorization header
def get_current_user():
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        return ACTIVE_TOKENS.get(token)
    return None

# --- Custom explanation and suggestions generators ---

def generate_insights(data, prediction):
    """Generates specific risk factors and suggestions based on applicant attributes."""
    risk_factors = []
    suggestions = []
    
    credit_hist = data.get('Credit_History', 'Good')
    inquiries = int(data.get('Credit_Inquiries', 0))
    income = float(data.get('Annual_Income', 0))
    employment = float(data.get('Employment_Duration', 0))
    loans = data.get('Existing_Loans', 'No')
    age = int(data.get('Age', 0))
    edu = data.get('Education_Level', 'Secondary / secondary special')
    housing = data.get('Housing_Type', 'Rented')
    
    # Risk factor identification
    if credit_hist == 'Bad':
        risk_factors.append("Poor credit history (critical risk indicator for lenders).")
        suggestions.append("Focus on rebuilding credit: pay all current bills on time, reduce overall credit card utilization, and settle any outstanding defaults.")
        
    if inquiries > 3:
        risk_factors.append(f"High number of recent credit inquiries ({inquiries} inquiries). Suggests urgent credit-seeking behavior.")
        suggestions.append("Limit new credit applications and inquiries for the next 6 to 12 months to allow your credit file to stabilize.")
        
    if income < 35000:
        risk_factors.append(f"Relatively low annual income (${income:,.0f}).")
        suggestions.append("Consider applying with a co-signer or guarantor, or provide additional proof of stable, alternative income sources.")
        
    if employment < 1.5:
        risk_factors.append(f"Short employment tenure ({employment} years). Lenders favor stability.")
        suggestions.append("Maintain employment stability at your current job for at least 12-24 months to demonstrate income continuity.")
        
    if loans == 'Yes':
        risk_factors.append("Active existing loans (elevates debt-to-income ratio).")
        suggestions.append("Pay down existing balances on personal loans, auto loans, or credit cards to lower your monthly debt commitments.")
        
    if age < 22:
        risk_factors.append("Young applicant age (limited financial footprint).")
        suggestions.append("Start building a positive credit footprint using micro-loans, secured credit cards, or utility bills in your name.")
        
    if edu == 'Lower secondary':
        risk_factors.append("Lower educational level (statistically linked to higher volatility).")
        suggestions.append("Provide strong supplementary evidence of continuous salary receipts or collateral if possible.")
        
    if housing in ['Rented', 'Municipal']:
        risk_factors.append(f"Housing status is {housing.lower()} (statistically lower stability score than home ownership).")
        suggestions.append("Build up personal savings and liquid assets to provide a secondary safety net for debt servicing.")

    # Positive factors if approved
    positive_factors = []
    if prediction == 1:
        if credit_hist == 'Good':
            positive_factors.append("Excellent credit history record.")
        if income >= 75000:
            positive_factors.append(f"Strong annual income (${income:,.0f}).")
        if employment >= 5.0:
            positive_factors.append(f"Highly stable employment duration ({employment:.1f} years).")
        if inquiries <= 1:
            positive_factors.append("Very low recent credit inquiry count.")
        if housing == 'Owned':
            positive_factors.append("Homeowner status indicates low risk.")
            
        if not positive_factors:
            positive_factors.append("Overall balanced financial and personal risk profile.")
            
    # Default suggestions if no risks were flagged but application rejected
    if prediction == 0 and not suggestions:
        suggestions.append("Contact the financial institution directly to request a manual review of your asset base and collateral options.")
        risk_factors.append("Cumulative moderate-risk factors across multiple parameters.")
        
    return {
        "risk_factors": risk_factors if prediction == 0 else [],
        "positive_factors": positive_factors if prediction == 1 else [],
        "suggestions": suggestions if prediction == 0 else ["Maintain your healthy financial habits. Keep credit utilization low, and pay bills on time to maintain eligibility."]
    }

# --- Flask Server Routes ---

@app.route('/')
def serve_index():
    return send_from_directory('static', 'index.html')

# --- AUTH API ---

@app.route('/api/auth/register', methods=['POST'])
def handle_register():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')
    
    # Secure role: force all public signups to Customer
    role = 'Customer'
    
    if not username or not password or not email:
        return jsonify({"error": "Missing username, password, or email"}), 400
        
    success = register_user(username, password, email, role)
    if success:
        return jsonify({"message": "User registered successfully!"}), 201
    return jsonify({"error": "Username already exists"}), 400

@app.route('/api/auth/login', methods=['POST'])
def handle_login():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({"error": "Missing username or password"}), 400
        
    user = authenticate_user(username, password)
    if user:
        # Generate random hex token
        token = secrets.token_hex(32)
        ACTIVE_TOKENS[token] = user
        return jsonify({
            "message": "Login successful",
            "token": token,
            "user": {
                "username": user['username'],
                "email": user['email'],
                "role": user['role']
            }
        }), 200
    return jsonify({"error": "Invalid username or password"}), 401

@app.route('/api/auth/logout', methods=['POST'])
def handle_logout():
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        if token in ACTIVE_TOKENS:
            del ACTIVE_TOKENS[token]
            return jsonify({"message": "Logged out successfully"}), 200
    return jsonify({"error": "Invalid token"}), 400

@app.route('/api/auth/me', methods=['GET'])
def handle_me():
    user = get_current_user()
    if user:
        return jsonify({"user": user}), 200
    return jsonify({"error": "Unauthorized"}), 401

# --- PREDICTION API ---

@app.route('/api/predict', methods=['POST'])
def handle_predict():
    user = get_current_user()
    if not user:
        return jsonify({"error": "Authentication required. Please sign in to run predictions."}), 401
        
    global model_pipeline
    if model_pipeline is None:
        load_model()
        if model_pipeline is None:
            return jsonify({"error": "Model not available. Please contact administrator."}), 503
            
    data = request.get_json() or {}
    
    # 1. Validation
    required_fields = [
        'Age', 'Gender', 'Income_Type', 'Annual_Income', 'Employment_Duration', 
        'Education_Level', 'Marital_Status', 'Family_Members', 'Housing_Type', 
        'Existing_Loans', 'Credit_History', 'Credit_Inquiries'
    ]
    missing = [f for f in required_fields if f not in data]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400
        
    # Convert types for safety
    try:
        input_data = {
            'Age': int(data['Age']),
            'Gender': str(data['Gender']),
            'Income_Type': str(data['Income_Type']),
            'Annual_Income': float(data['Annual_Income']),
            'Employment_Duration': float(data['Employment_Duration']),
            'Education_Level': str(data['Education_Level']),
            'Marital_Status': str(data['Marital_Status']),
            'Family_Members': int(data['Family_Members']),
            'Housing_Type': str(data['Housing_Type']),
            'Existing_Loans': str(data['Existing_Loans']),
            'Credit_History': str(data['Credit_History']),
            'Credit_Inquiries': int(data['Credit_Inquiries'])
        }
    except ValueError as e:
        return jsonify({"error": f"Invalid numerical inputs: {e}"}), 400

    # 2. Run inference
    df = pd.DataFrame([input_data])
    
    try:
        # Predict probability
        probability = float(model_pipeline.predict_proba(df)[0, 1])
        prediction = int(model_pipeline.predict(df)[0])
    except Exception as e:
        return jsonify({"error": f"Model inference error: {e}"}), 500
        
    # 3. Generate explanation & suggestions
    insights = generate_insights(input_data, prediction)
    
    # 4. Save to Database (associate with logged-in user if available)
    user = get_current_user()
    user_id = user['id'] if user else None
    
    # Combine lists for DB storage
    risk_facs = insights['risk_factors']
    if prediction == 1:
        # Store positive factors as 'risk_factors' JSON in DB for approved cases to maintain schema
        risk_facs = insights['positive_factors']
        
    try:
        pred_id = save_prediction(
            user_id, input_data, prediction, probability, 
            risk_facs, insights['suggestions']
        )
    except Exception as e:
        print(f"Error saving prediction to DB: {e}")
        pred_id = None
        
    return jsonify({
        "id": pred_id,
        "prediction": "Approved" if prediction == 1 else "Rejected",
        "probability": round(probability, 4),
        "risk_factors": insights['risk_factors'],
        "positive_factors": insights['positive_factors'],
        "suggestions": insights['suggestions']
    }), 200

@app.route('/api/predict/bulk', methods=['POST'])
def handle_bulk_predict():
    user = get_current_user()
    if not user:
        return jsonify({"error": "Authentication required. Please sign in to run bulk predictions."}), 401
        
    global model_pipeline
    if model_pipeline is None:
        load_model()
        if model_pipeline is None:
            return jsonify({"error": "Model not available"}), 503
            
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
        
    file = request.files['file']
    if not file.filename.endswith('.csv'):
        return jsonify({"error": "Only CSV files are supported"}), 400
        
    try:
        df = pd.read_csv(file)
    except Exception as e:
        return jsonify({"error": f"Failed to parse CSV: {e}"}), 400
        
    # Standardize column casing & spacing (remove leading/trailing spaces)
    df.columns = [col.strip() for col in df.columns]
    
    # Validate columns
    required_fields = [
        'Age', 'Gender', 'Income_Type', 'Annual_Income', 'Employment_Duration', 
        'Education_Level', 'Marital_Status', 'Family_Members', 'Housing_Type', 
        'Existing_Loans', 'Credit_History', 'Credit_Inquiries'
    ]
    missing = [f for f in required_fields if f not in df.columns]
    if missing:
        return jsonify({"error": f"CSV missing required columns: {', '.join(missing)}"}), 400
        
    # Convert data types and handle missing data
    try:
        df['Age'] = df['Age'].astype(int)
        df['Gender'] = df['Gender'].astype(str)
        df['Income_Type'] = df['Income_Type'].astype(str)
        df['Annual_Income'] = df['Annual_Income'].astype(float)
        df['Employment_Duration'] = df['Employment_Duration'].astype(float)
        df['Education_Level'] = df['Education_Level'].astype(str)
        df['Marital_Status'] = df['Marital_Status'].astype(str)
        df['Family_Members'] = df['Family_Members'].astype(int)
        df['Housing_Type'] = df['Housing_Type'].astype(str)
        df['Existing_Loans'] = df['Existing_Loans'].astype(str)
        df['Credit_History'] = df['Credit_History'].astype(str)
        df['Credit_Inquiries'] = df['Credit_Inquiries'].astype(int)
    except Exception as e:
        return jsonify({"error": f"Data type mismatch in CSV: {e}"}), 400
        
    # Predict in batch
    try:
        probabilities = model_pipeline.predict_proba(df)[:, 1]
        predictions = model_pipeline.predict(df)
    except Exception as e:
        return jsonify({"error": f"Batch inference failed: {e}"}), 500
        
    # Process each prediction and save
    user = get_current_user()
    user_id = user['id'] if user else None
    
    results = []
    approved_count = 0
    total_records = len(df)
    
    for i in range(total_records):
        row_data = df.iloc[i].to_dict()
        pred = int(predictions[i])
        prob = float(probabilities[i])
        
        if pred == 1:
            approved_count += 1
            
        insights = generate_insights(row_data, pred)
        risk_facs = insights['risk_factors']
        if pred == 1:
            risk_facs = insights['positive_factors']
            
        # Save to DB
        pred_id = save_prediction(
            user_id, row_data, pred, prob, 
            risk_facs, insights['suggestions']
        )
        
        results.append({
            "id": pred_id,
            "applicant": {
                "Age": int(row_data['Age']),
                "Gender": row_data['Gender'],
                "Annual_Income": float(row_data['Annual_Income']),
                "Credit_History": row_data['Credit_History']
            },
            "prediction": "Approved" if pred == 1 else "Rejected",
            "probability": round(prob, 4)
        })
        
    # Bulk summary metrics
    summary = {
        "total_evaluated": total_records,
        "approved": approved_count,
        "rejected": total_records - approved_count,
        "approval_rate": round((approved_count / total_records) * 100, 1) if total_records > 0 else 0
    }
    
    return jsonify({
        "summary": summary,
        "results": results
    }), 200

# --- HISTORY & ANALYTICS API ---

@app.route('/api/history', methods=['GET'])
def handle_history():
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
        
    # If user is Bank Analyst or Risk Officer, let them see all records
    if user['role'] in ['Bank Analyst', 'Risk Officer']:
        history = get_prediction_history(user_id=None)
    else:
        # Customers only see their own history
        history = get_prediction_history(user_id=user['id'])
        
    return jsonify({"history": history}), 200

@app.route('/api/history/<int:pred_id>/feedback', methods=['POST'])
def handle_feedback(pred_id):
    user = get_current_user()
    if not user or user['role'] not in ['Bank Analyst', 'Risk Officer']:
        return jsonify({"error": "Unauthorized. Only bank analysts can log decision feedback."}), 403
        
    data = request.get_json() or {}
    feedback = data.get('feedback')
    if feedback not in ['Correct', 'Incorrect', 'None']:
        return jsonify({"error": "Feedback must be 'Correct', 'Incorrect', or 'None'"}), 400
        
    success = update_prediction_feedback(pred_id, feedback)
    if success:
        return jsonify({"message": f"Feedback updated to '{feedback}' successfully"}), 200
    return jsonify({"error": "Prediction record not found"}), 404

@app.route('/api/metrics', methods=['GET'])
def handle_metrics():
    global model_metrics
    if model_metrics is None:
        load_model()
        if model_metrics is None:
            return jsonify({"error": "Metrics not found"}), 503
    return jsonify(model_metrics), 200

@app.route('/api/stats', methods=['GET'])
def handle_stats():
    user = get_current_user()
    if not user or user['role'] not in ['Bank Analyst', 'Risk Officer']:
        return jsonify({"error": "Unauthorized"}), 403
        
    stats = get_dashboard_stats()
    return jsonify(stats), 200

if __name__ == '__main__':
    # Initialize DB
    init_db()
    # Pre-load ML model
    load_model()
    # Run server
    app.run(host='127.0.0.1', port=5005, debug=True)
