import sqlite3
import os
import json
from werkzeug.security import generate_password_hash, check_password_hash

DB_PATH = 'database.db'

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes the database schema if it doesn't already exist."""
    print("Initializing database...")
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Create Users Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        email TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'Customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # 2. Create Predictions Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        age INTEGER NOT NULL,
        gender TEXT NOT NULL,
        income_type TEXT NOT NULL,
        annual_income REAL NOT NULL,
        employment_duration REAL NOT NULL,
        education_level TEXT NOT NULL,
        marital_status TEXT NOT NULL,
        family_members INTEGER NOT NULL,
        housing_type TEXT NOT NULL,
        existing_loans TEXT NOT NULL,
        credit_history TEXT NOT NULL,
        credit_inquiries INTEGER NOT NULL,
        prediction INTEGER NOT NULL, -- 1 = Approved, 0 = Rejected
        probability REAL NOT NULL,
        risk_factors TEXT NOT NULL, -- JSON string
        suggestions TEXT NOT NULL, -- JSON string
        feedback TEXT DEFAULT 'None', -- 'Correct', 'Incorrect', 'None'
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
    ''')
    
    # 3. Create default Bank Analyst if it doesn't exist
    cursor.execute("SELECT id FROM users WHERE username = 'Nanda'")
    if not cursor.fetchone():
        admin_pass = generate_password_hash("Nanda@2125")
        cursor.execute(
            "INSERT INTO users (username, password_hash, email, role) VALUES (?, ?, ?, ?)",
            ("Nanda", admin_pass, "nanda@bank.com", "Bank Analyst")
        )
        print("Default bank analyst account created (Nanda / Nanda@2125).")
        
    conn.commit()
    conn.close()
    print("Database initialization complete.")

# --- User Auth Functions ---

def register_user(username, password, email, role='Customer'):
    """Registers a new user in the database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        password_hash = generate_password_hash(password)
        cursor.execute(
            "INSERT INTO users (username, password_hash, email, role) VALUES (?, ?, ?, ?)",
            (username, password_hash, email, role)
        )
        conn.commit()
        success = True
    except sqlite3.IntegrityError:
        # Username already exists
        success = False
    finally:
        conn.close()
    return success

def authenticate_user(username, password):
    """Verifies user credentials and returns user details if valid, else None."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, password_hash, email, role FROM users WHERE username = ?", (username,))
    user = cursor.fetchone()
    conn.close()
    
    if user and check_password_hash(user['password_hash'], password):
        return {
            "id": user['id'],
            "username": user['username'],
            "email": user['email'],
            "role": user['role']
        }
    return None

# --- Prediction Functions ---

def save_prediction(user_id, data, prediction, probability, risk_factors, suggestions):
    """Saves a credit card approval prediction query to the database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
    INSERT INTO predictions (
        user_id, age, gender, income_type, annual_income, employment_duration, 
        education_level, marital_status, family_members, housing_type, 
        existing_loans, credit_history, credit_inquiries, prediction, 
        probability, risk_factors, suggestions
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        user_id,
        int(data['Age']),
        data['Gender'],
        data['Income_Type'],
        float(data['Annual_Income']),
        float(data['Employment_Duration']),
        data['Education_Level'],
        data['Marital_Status'],
        int(data['Family_Members']),
        data['Housing_Type'],
        data['Existing_Loans'],
        data['Credit_History'],
        int(data['Credit_Inquiries']),
        int(prediction),
        float(probability),
        json.dumps(risk_factors),
        json.dumps(suggestions)
    ))
    
    prediction_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return prediction_id

def get_prediction_history(user_id=None):
    """Retrieves prediction history. If user_id is provided, filters for that user.
       If user is a Bank Analyst, returns all predictions."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if user_id is None:
        # Get all predictions with username joined (for admin/analyst view)
        cursor.execute('''
        SELECT p.*, COALESCE(u.username, 'Guest') as username
        FROM predictions p
        LEFT JOIN users u ON p.user_id = u.id
        ORDER BY p.timestamp DESC
        ''')
    else:
        # Get user's own history
        cursor.execute('''
        SELECT p.*, u.username
        FROM predictions p
        JOIN users u ON p.user_id = u.id
        WHERE p.user_id = ?
        ORDER BY p.timestamp DESC
        ''', (user_id,))
        
    rows = cursor.fetchall()
    conn.close()
    
    history = []
    for r in rows:
        item = dict(r)
        # Parse JSON columns back to Python types
        item['risk_factors'] = json.loads(item['risk_factors'])
        item['suggestions'] = json.loads(item['suggestions'])
        history.append(item)
    return history

def update_prediction_feedback(prediction_id, feedback):
    """Updates prediction feedback ('Correct' or 'Incorrect')."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE predictions SET feedback = ? WHERE id = ?",
        (feedback, prediction_id)
    )
    conn.commit()
    rows_affected = cursor.rowcount
    conn.close()
    return rows_affected > 0

# --- Dashboard Analytics Functions ---

def get_dashboard_stats():
    """Compiles key stats and metrics for the Bank Analyst dashboard."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    stats = {}
    
    # 1. Total applications
    cursor.execute("SELECT COUNT(*) FROM predictions")
    stats['total_applications'] = cursor.fetchone()[0]
    
    if stats['total_applications'] == 0:
        conn.close()
        return {
            "total_applications": 0,
            "approval_rate": 0,
            "avg_income": 0,
            "risk_distribution": {"High Risk (Rejected)": 0, "Low Risk (Approved)": 0},
            "recent_predictions": [],
            "daily_trends": {"dates": [], "approved": [], "rejected": []}
        }
    
    # 2. Approval Rate
    cursor.execute("SELECT COUNT(*) FROM predictions WHERE prediction = 1")
    approved_count = cursor.fetchone()[0]
    stats['approval_rate'] = round((approved_count / stats['total_applications']) * 100, 1)
    
    # 3. Average Annual Income
    cursor.execute("SELECT AVG(annual_income) FROM predictions")
    stats['avg_income'] = round(cursor.fetchone()[0], 2)
    
    # 4. Risk distribution (Approvals vs Rejections)
    stats['risk_distribution'] = {
        "Low Risk (Approved)": approved_count,
        "High Risk (Rejected)": stats['total_applications'] - approved_count
    }
    
    # 5. Daily application trends (last 7 days of activity)
    cursor.execute('''
    SELECT DATE(timestamp) as date_str, 
           SUM(CASE WHEN prediction = 1 THEN 1 ELSE 0 END) as approved,
           SUM(CASE WHEN prediction = 0 THEN 1 ELSE 0 END) as rejected
    FROM predictions
    GROUP BY date_str
    ORDER BY date_str ASC
    LIMIT 7
    ''')
    trend_rows = cursor.fetchall()
    
    stats['daily_trends'] = {
        "dates": [row['date_str'] for row in trend_rows],
        "approved": [row['approved'] for row in trend_rows],
        "rejected": [row['rejected'] for row in trend_rows]
    }
    
    conn.close()
    return stats
