// --- FinGuard AI Frontend Application Logic ---

// State variables
let currentUser = null;
let currentToken = null;
let activeView = 'dashboard';
let formStep = 1;
let lastPrediction = null; // Store last single prediction for PDF download
let modelsChartInstance = null;
let importanceChartInstance = null;

// DOM Elements
const views = {
    dashboard: document.getElementById('dashboard-view'),
    eligibility: document.getElementById('eligibility-view'),
    result: document.getElementById('result-view'),
    bulk: document.getElementById('bulk-view'),
    metrics: document.getElementById('metrics-view'),
    history: document.getElementById('history-view'),
    profile: document.getElementById('profile-view')
};

// Application Init
document.addEventListener('DOMContentLoaded', () => {
    // Check for existing login token
    currentToken = localStorage.getItem('finguard_token');
    if (currentToken) {
        fetchCurrentUser();
    } else {
        updateAuthUI();
    }

    // Set up navigation
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const targetView = item.getAttribute('data-view');
            switchView(targetView);
        });
    });

    // Theme Toggle Setup
    const themeToggleBtn = document.getElementById('btn-theme-toggle');
    const savedTheme = localStorage.getItem('finguard_theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggleBtn.querySelector('i').className = 'fa-solid fa-sun';
        themeToggleBtn.querySelector('span').innerText = 'Light Mode';
    }
    
    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        localStorage.setItem('finguard_theme', isDark ? 'dark' : 'light');
        themeToggleBtn.querySelector('i').className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        themeToggleBtn.querySelector('span').innerText = isDark ? 'Light Mode' : 'Dark Mode';
        
        // Re-render charts to adjust gridline colors for dark mode if insights page is active
        if (activeView === 'metrics') {
            loadMetrics();
        }
    });

    // Form Navigation Setup
    document.getElementById('btn-form-next').addEventListener('click', handleFormNext);
    document.getElementById('btn-form-prev').addEventListener('click', handleFormPrev);
    
    // Preset profile fillers
    document.getElementById('preset-eligible').addEventListener('click', () => fillPreset('eligible'));
    document.getElementById('preset-highrisk').addEventListener('click', () => fillPreset('highrisk'));

    // Modal Close
    document.getElementById('btn-modal-close').addEventListener('click', closeAuthModal);
    document.getElementById('btn-auth-action').addEventListener('click', handleAuthAction);
    
    // Auth Modal form submission
    document.getElementById('auth-form').addEventListener('submit', handleAuthSubmit);
    document.getElementById('btn-auth-switch').addEventListener('click', toggleAuthMode);

    // CSV Bulk Upload dropzone setup
    setupBulkUpload();
    
    // PDF Download listener
    document.getElementById('btn-download-pdf').addEventListener('click', downloadPDFCertificate);
    document.getElementById('btn-download-csv-template').addEventListener('click', downloadCSVTemplate);
    
    // Sidebar user info link to profile
    document.getElementById('sidebar-user-info').addEventListener('click', () => {
        if (currentUser) switchView('profile');
    });

    // Profile signout button
    document.getElementById('btn-profile-signout').addEventListener('click', handleAuthAction);
});

// --- Navigation & View Manager ---

function switchView(viewName) {
    if (!views[viewName]) return;
    
    // Hide active view, show new view
    document.querySelectorAll('.view-section').forEach(section => {
        section.classList.remove('active');
    });
    views[viewName].classList.add('active');
    
    // Update sidebar styling
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-view') === viewName) {
            item.classList.add('active');
        }
    });

    activeView = viewName;
    
    // Adjust header text based on view
    const titleEl = document.getElementById('page-heading-title');
    const descEl = document.getElementById('page-heading-desc');
    
    switch (viewName) {
        case 'dashboard':
            titleEl.innerText = "System Dashboard";
            descEl.innerText = "Overview of your banking and credit analytics system";
            loadDashboardStats();
            break;
        case 'eligibility':
            titleEl.innerText = "Eligibility Evaluation";
            descEl.innerText = "Evaluate single credit card application for underwriting decision";
            resetForm();
            break;
        case 'result':
            titleEl.innerText = "Application Evaluation Result";
            descEl.innerText = "Visual breakdown of decision variables and applicant risk index";
            break;
        case 'bulk':
            titleEl.innerText = "Bulk Evaluation Portal";
            descEl.innerText = "Process files containing multiple financial records in a batch";
            break;
        case 'metrics':
            titleEl.innerText = "Machine Learning Insights";
            descEl.innerText = "Underwriting model accuracy comparison and training benchmarks";
            loadMetrics();
            break;
        case 'history':
            titleEl.innerText = "Evaluation Log Ledger";
            descEl.innerText = "Database log ledger of processed predictions and analyst feedback";
            loadHistoryLogs();
            break;
        case 'profile':
            titleEl.innerText = "User Account Profile";
            descEl.innerText = "Manage your security credentials and sign out of your account";
            renderProfile();
            break;
    }
}

// --- Loading Overlay ---

function showLoading(text = "Processing details...") {
    document.getElementById('loading-text').innerText = text;
    document.getElementById('loading-overlay').classList.add('active');
}

function hideLoading() {
    document.getElementById('loading-overlay').classList.remove('active');
}

// --- Form Wizard Management ---

function resetForm() {
    formStep = 1;
    document.getElementById('eligibility-form').reset();
    showStep(1);
}

function showStep(step) {
    document.querySelectorAll('.form-step-content').forEach((div, index) => {
        div.classList.remove('active');
        if (index === step - 1) {
            div.classList.add('active');
        }
    });

    // Update step indicators
    for (let i = 1; i <= 3; i++) {
        const ind = document.getElementById(`step-ind-${i}`);
        ind.className = 'step-indicator';
        if (i < step) {
            ind.classList.add('completed');
        } else if (i === step) {
            ind.classList.add('active');
        }
    }

    // Update buttons
    const prevBtn = document.getElementById('btn-form-prev');
    const nextBtn = document.getElementById('btn-form-next');
    
    prevBtn.style.visibility = step === 1 ? 'hidden' : 'visible';
    
    if (step === 3) {
        nextBtn.innerHTML = 'Submit Application <i class="fa-solid fa-paper-plane"></i>';
        nextBtn.className = 'btn-accent';
    } else {
        nextBtn.innerHTML = 'Next <i class="fa-solid fa-arrow-right"></i>';
        nextBtn.className = 'btn-accent';
    }
}

function handleFormNext() {
    if (formStep < 3) {
        // Validate current step fields
        const currentStepDiv = document.getElementById(`form-step-${formStep}`);
        const inputs = currentStepDiv.querySelectorAll('input, select');
        
        let valid = true;
        inputs.forEach(input => {
            if (!input.checkValidity()) {
                input.reportValidity();
                valid = false;
            }
        });
        
        if (valid) {
            formStep++;
            showStep(formStep);
        }
    } else {
        // Submit form
        submitSinglePrediction();
    }
}

function handleFormPrev() {
    if (formStep > 1) {
        formStep--;
        showStep(formStep);
    }
}

// Pre-fill form presets
function fillPreset(type) {
    if (type === 'eligible') {
        document.getElementById('field-age').value = 34;
        document.getElementById('field-gender').value = 'Female';
        document.getElementById('field-marital').value = 'Married';
        document.getElementById('field-family').value = 3;
        document.getElementById('field-education').value = 'Higher education';
        
        document.getElementById('field-income').value = 85000;
        document.getElementById('field-income-type').value = 'Working';
        document.getElementById('field-employment').value = 6.5;
        document.getElementById('field-housing').value = 'Owned';
        document.getElementById('field-loans').value = 'No';
        
        document.getElementById('field-credit').value = 'Good';
        document.getElementById('field-inquiries').value = 0;
    } else if (type === 'highrisk') {
        document.getElementById('field-age').value = 21;
        document.getElementById('field-gender').value = 'Male';
        document.getElementById('field-marital').value = 'Single';
        document.getElementById('field-family').value = 1;
        document.getElementById('field-education').value = 'Secondary / secondary special';
        
        document.getElementById('field-income').value = 18000;
        document.getElementById('field-income-type').value = 'Working';
        document.getElementById('field-employment').value = 0.5;
        document.getElementById('field-housing').value = 'Rented';
        document.getElementById('field-loans').value = 'Yes';
        
        document.getElementById('field-credit').value = 'Bad';
        document.getElementById('field-inquiries').value = 6;
    }
}

// --- Auth Modal & User Handling ---

function handleAuthAction() {
    if (currentUser) {
        // Logout
        showLoading("Logging out...");
        fetch('/api/auth/logout', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${currentToken}` }
        })
        .finally(() => {
            localStorage.removeItem('finguard_token');
            currentToken = null;
            currentUser = null;
            updateAuthUI();
            switchView('dashboard');
            hideLoading();
        });
    } else {
        openAuthModal();
    }
}

function openAuthModal() {
    document.getElementById('auth-modal').classList.add('active');
}

function closeAuthModal() {
    document.getElementById('auth-modal').classList.remove('active');
    document.getElementById('auth-form').reset();
}

let isLoginMode = true;
function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    const title = document.getElementById('auth-modal-title');
    const desc = document.getElementById('auth-modal-desc');
    const emailGroup = document.getElementById('auth-email-group');
    const roleGroup = document.getElementById('auth-role-group');
    const submitBtn = document.getElementById('btn-auth-submit');
    const switchPrompt = document.getElementById('auth-switch-prompt');
    const switchBtn = document.getElementById('btn-auth-switch');
    
    if (isLoginMode) {
        title.innerText = "Sign In to FinGuard";
        desc.innerText = "Access history logs and bulk evaluation";
        emailGroup.style.display = 'none';
        roleGroup.style.display = 'none';
        document.getElementById('auth-email').required = false;
        submitBtn.innerText = "Sign In";
        switchPrompt.innerText = "Don't have an account?";
        switchBtn.innerText = "Create Account";
    } else {
        title.innerText = "Register New Account";
        desc.innerText = "Set up your secure client credentials";
        emailGroup.style.display = 'flex';
        roleGroup.style.display = 'flex';
        document.getElementById('auth-email').required = true;
        submitBtn.innerText = "Register Account";
        switchPrompt.innerText = "Already registered?";
        switchBtn.innerText = "Sign In Instead";
    }
}

function handleAuthSubmit(e) {
    e.preventDefault();
    const username = document.getElementById('auth-username').value;
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const role = document.getElementById('auth-role').value;
    
    showLoading(isLoginMode ? "Signing in..." : "Creating account...");
    
    const url = isLoginMode ? '/api/auth/login' : '/api/auth/register';
    const payload = isLoginMode ? { username, password } : { username, email, password, role };
    
    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(res => {
        if (!res.ok) {
            return res.json().then(err => { throw new Error(err.error || "Authentication failed") });
        }
        return res.json();
    })
    .then(data => {
        if (isLoginMode) {
            currentToken = data.token;
            currentUser = data.user;
            localStorage.setItem('finguard_token', currentToken);
            updateAuthUI();
            closeAuthModal();
            switchView('dashboard');
        } else {
            // Register success, switch to login mode automatically
            alert("Account registered successfully! Please sign in.");
            toggleAuthMode();
        }
    })
    .catch(err => {
        alert(err.message);
    })
    .finally(() => {
        hideLoading();
    });
}

function fetchCurrentUser() {
    fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${currentToken}` }
    })
    .then(res => {
        if (!res.ok) {
            localStorage.removeItem('finguard_token');
            currentToken = null;
            throw new Error("Expired session");
        }
        return res.json();
    })
    .then(data => {
        currentUser = data.user;
        updateAuthUI();
        loadDashboardStats();
    })
    .catch(err => {
        updateAuthUI();
    });
}

function updateAuthUI() {
    const authBtnText = document.getElementById('auth-btn-text');
    const authBtnIcon = document.getElementById('btn-auth-action').querySelector('i');
    const sidebarUserInfo = document.getElementById('sidebar-user-info');
    const displayUsername = document.getElementById('display-username');
    const displayRole = document.getElementById('display-role');
    const avatarLetters = document.getElementById('avatar-letters');
    const navHistory = document.getElementById('nav-history');
    const navProfile = document.getElementById('nav-profile');
    
    if (currentUser) {
        authBtnText.innerText = "Sign Out";
        authBtnIcon.className = "fa-solid fa-arrow-right-from-bracket";
        
        displayUsername.innerText = currentUser.username;
        displayRole.innerText = currentUser.role;
        avatarLetters.innerText = currentUser.username.substring(0, 2).toUpperCase();
        sidebarUserInfo.style.display = 'flex';
        
        // Show prediction history and profile tab
        navHistory.style.display = 'flex';
        navProfile.style.display = 'flex';
    } else {
        authBtnText.innerText = "Sign In";
        authBtnIcon.className = "fa-solid fa-arrow-right-to-bracket";
        sidebarUserInfo.style.display = 'none';
        navHistory.style.display = 'none';
        navProfile.style.display = 'none';
    }
}

// --- Predict API Execution ---

function submitSinglePrediction() {
    if (!currentToken) {
        alert("You must sign in to submit a credit application. Your input values have been preserved.");
        openAuthModal();
        return;
    }
    showLoading("Running underwriting risk models...");
    
    const payload = {
        Age: parseInt(document.getElementById('field-age').value),
        Gender: document.getElementById('field-gender').value,
        Income_Type: document.getElementById('field-income-type').value,
        Annual_Income: parseFloat(document.getElementById('field-income').value),
        Employment_Duration: parseFloat(document.getElementById('field-employment').value),
        Education_Level: document.getElementById('field-education').value,
        Marital_Status: document.getElementById('field-marital').value,
        Family_Members: parseInt(document.getElementById('field-family').value),
        Housing_Type: document.getElementById('field-housing').value,
        Existing_Loans: document.getElementById('field-loans').value,
        Credit_History: document.getElementById('field-credit').value,
        Credit_Inquiries: parseInt(document.getElementById('field-inquiries').value)
    };
    
    const headers = { 'Content-Type': 'application/json' };
    if (currentToken) {
        headers['Authorization'] = `Bearer ${currentToken}`;
    }
    
    fetch('/api/predict', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
    })
    .then(res => {
        if (!res.ok) {
            return res.json().then(err => { throw new Error(err.error || "Model server error") });
        }
        return res.json();
    })
    .then(data => {
        lastPrediction = {
            input: payload,
            output: data
        };
        renderPredictionResults(data);
        switchView('result');
    })
    .catch(err => {
        alert(err.message);
    })
    .finally(() => {
        hideLoading();
    });
}

function renderPredictionResults(data) {
    const parent = document.getElementById('result-badge-parent');
    const verdict = document.getElementById('result-badge-verdict');
    const verdictText = document.getElementById('verdict-text');
    const headline = document.getElementById('result-headline');
    const insightsBox = document.getElementById('result-insights-box');
    const insightsTitle = document.getElementById('insights-title-text');
    const insightsList = document.getElementById('result-insights-list');
    const suggestionsList = document.getElementById('result-suggestions-list');
    
    // Clear lists
    insightsList.innerHTML = '';
    suggestionsList.innerHTML = '';
    
    // Calculate display percentage
    const percentage = Math.round(data.probability * 100);
    document.getElementById('result-probability-val').innerText = `${percentage}%`;
    
    // Radial gauge offset calculation (r=90, circumference = 565.48)
    const strokeDashOffset = 565.48 - (565.48 * data.probability);
    document.getElementById('result-gauge-fill').style.strokeDashoffset = strokeDashOffset;

    if (data.prediction === 'Approved') {
        parent.className = 'results-left approved';
        verdict.className = 'result-badge approved';
        verdict.innerHTML = '<i class="fa-solid fa-circle-check"></i> <span id="verdict-text">Approved</span>';
        headline.innerText = "Congratulations! Your credit card application is likely to be approved.";
        
        insightsTitle.innerText = "Key Strengths Identified";
        
        // Show positive factors
        data.positive_factors.forEach(fact => {
            const li = document.createElement('li');
            li.innerText = fact;
            insightsList.appendChild(li);
        });
    } else {
        parent.className = 'results-left rejected';
        verdict.className = 'result-badge rejected';
        verdict.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> <span id="verdict-text">Rejected</span>';
        headline.innerText = "Sorry, your credit card application is likely to be rejected.";
        
        insightsTitle.innerText = "Risk Factors Flagged";
        
        // Show risk factors
        data.risk_factors.forEach(fact => {
            const li = document.createElement('li');
            li.innerText = fact;
            insightsList.appendChild(li);
        });
    }
    
    // Render suggestions
    data.suggestions.forEach(sug => {
        const li = document.createElement('li');
        li.innerText = sug;
        suggestionsList.appendChild(li);
    });
}

// --- PDF Report Generator ---

function downloadPDFCertificate() {
    if (!lastPrediction) return;
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
    });
    
    const input = lastPrediction.input;
    const output = lastPrediction.output;
    const dateStr = new Date().toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    
    // PDF Styling
    doc.setFillColor(15, 23, 42); // Navy title bar
    doc.rect(0, 0, 210, 35, 'F');
    
    // Title text
    doc.setTextColor(255, 255, 255);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(18);
    doc.text("FINANCIAL UNDERWRITING EVALUATION REPORT", 15, 15);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text(`FINGUARD AI AUTOMATED ASSESSMENT ENGINE | GENERATED: ${dateStr.toUpperCase()}`, 15, 24);
    
    // Body layout settings
    let yPos = 50;
    
    // Applicant Information Table
    doc.setTextColor(15, 23, 42);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.text("APPLICANT RECORD PRESETS", 15, yPos);
    yPos += 5;
    
    // Draw horizontal separator line
    doc.setDrawColor(226, 232, 240);
    doc.line(15, yPos, 195, yPos);
    yPos += 5;
    
    const tableData = [
        ["Age", input.Age, "Gender", input.Gender],
        ["Annual Income", `$${input.Annual_Income.toLocaleString()}`, "Income Source", input.Income_Type],
        ["Employment Tenure", `${input.Employment_Duration} Years`, "Housing Status", input.Housing_Type],
        ["Marital Status", input.Marital_Status, "Household Size", input.Family_Members],
        ["Active Liabilities", input.Existing_Loans, "Credit Bureau History", input.Credit_History === 'Good' ? 'Satisfactory' : 'Unsatisfactory'],
        ["Credit File Inquiries", input.Credit_Inquiries, "Underwriting Policy", "Standard Risk Calibrated v1.0"]
    ];
    
    doc.autoTable({
        startY: yPos,
        head: [],
        body: tableData,
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
            0: { fontStyle: 'bold', width: 45 },
            1: { width: 50 },
            2: { fontStyle: 'bold', width: 45 },
            3: { width: 50 }
        }
    });
    
    yPos = doc.lastAutoTable.finalY + 15;
    
    // Decision Results Banner
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.text("UNDERWRITING POLICY VERDICT", 15, yPos);
    yPos += 5;
    doc.line(15, yPos, 195, yPos);
    yPos += 7;
    
    const isApproved = output.prediction === 'Approved';
    if (isApproved) {
        doc.setFillColor(236, 253, 245); // Soft green background
        doc.setDrawColor(16, 185, 129); // Green border
        doc.rect(15, yPos, 180, 20, 'FD');
        doc.setTextColor(16, 185, 129);
        doc.setFontSize(14);
        doc.text("VERDICT: APPLICATION APPROVED", 20, yPos + 8);
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        doc.text(`Credit Risk Probability Rating: ${(output.probability * 100).toFixed(1)}% | Low Risk Margin`, 20, yPos + 14);
    } else {
        doc.setFillColor(254, 242, 242); // Soft red background
        doc.setDrawColor(239, 68, 68); // Red border
        doc.rect(15, yPos, 180, 20, 'FD');
        doc.setTextColor(239, 68, 68);
        doc.setFontSize(14);
        doc.text("VERDICT: APPLICATION REJECTED", 20, yPos + 8);
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        doc.text(`Credit Risk Probability Rating: ${(output.probability * 100).toFixed(1)}% | Exceeds Volatility Threshold`, 20, yPos + 14);
    }
    
    yPos += 30;
    
    // Explanation lists
    doc.setTextColor(15, 23, 42);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.text(isApproved ? "CORE STRENGTH INDICATORS" : "IDENTIFIED COMPLIANCE RISK FACTORS", 15, yPos);
    yPos += 5;
    doc.line(15, yPos, 195, yPos);
    yPos += 7;
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105);
    
    const factors = isApproved ? output.positive_factors : output.risk_factors;
    factors.forEach(item => {
        doc.text(`- ${item}`, 20, yPos);
        yPos += 6;
    });
    
    yPos += 5;
    
    // Suggestions
    doc.setTextColor(15, 23, 42);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.text("PRESCRIBED REMEDIATION STEPS", 15, yPos);
    yPos += 5;
    doc.line(15, yPos, 195, yPos);
    yPos += 7;
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105);
    
    output.suggestions.forEach(item => {
        // Handle text wrapping for long suggestion texts
        const splitText = doc.splitTextToSize(`- ${item}`, 175);
        doc.text(splitText, 20, yPos);
        yPos += (splitText.length * 5);
    });
    
    // Footer / Sign Off
    yPos = 265;
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("CONFIDENTIAL SECURITY DOCUMENT FOR INTERNAL BANK RECORD ONLY.", 15, yPos);
    doc.text("Decision powered by FinGuard Automated Underwriting Classifiers.", 15, yPos + 4);
    
    // Save report
    doc.save(`Finguard_Report_${input.Age}_${input.Annual_Income}.pdf`);
}

// --- Bulk Upload Portal Logic ---

function setupBulkUpload() {
    const dropzone = document.getElementById('bulk-dropzone');
    const fileInput = document.getElementById('bulk-file-input');
    
    dropzone.addEventListener('click', () => fileInput.click());
    
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
    });
    
    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
    });
    
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            handleBulkCSV(e.dataTransfer.files[0]);
        }
    });
    
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            handleBulkCSV(fileInput.files[0]);
        }
    });
}

function handleBulkCSV(file) {
    if (!currentToken) {
        alert("You must sign in to perform bulk evaluations.");
        openAuthModal();
        return;
    }
    if (!file.name.endsWith('.csv')) {
        alert("Please upload a valid CSV formatted file.");
        return;
    }
    
    showLoading("Running batch calculations on CSV profiles...");
    
    const formData = new FormData();
    formData.append('file', file);
    
    const headers = {};
    if (currentToken) {
        headers['Authorization'] = `Bearer ${currentToken}`;
    }
    
    fetch('/api/predict/bulk', {
        method: 'POST',
        headers: headers,
        body: formData
    })
    .then(res => {
        if (!res.ok) {
            return res.json().then(err => { throw new Error(err.error || "Batch processing failed") });
        }
        return res.json();
    })
    .then(data => {
        renderBulkResults(data);
    })
    .catch(err => {
        alert(err.message);
    })
    .finally(() => {
        hideLoading();
    });
}

let bulkResultsData = []; // Store bulk rows globally for client filtering
function renderBulkResults(data) {
    bulkResultsData = data.results;
    
    // Render Stats
    document.getElementById('bulk-stat-total').innerText = data.summary.total_evaluated;
    document.getElementById('bulk-stat-approved').innerText = data.summary.approved;
    document.getElementById('bulk-stat-rejected').innerText = data.summary.rejected;
    document.getElementById('bulk-stat-rate').innerText = `${data.summary.approval_rate}%`;
    
    // Draw table
    renderBulkTableRows('all');
    
    // Set up filter click handlers
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filterType = btn.getAttribute('data-filter');
            renderBulkTableRows(filterType);
        });
    });
    
    // Display results panel
    document.getElementById('bulk-results-panel').style.display = 'block';
}

function renderBulkTableRows(filter) {
    const tbody = document.getElementById('bulk-results-tbody');
    tbody.innerHTML = '';
    
    let index = 1;
    bulkResultsData.forEach(row => {
        const isApproved = row.prediction === 'Approved';
        
        // Filter rows
        if (filter === 'approved' && !isApproved) return;
        if (filter === 'rejected' && isApproved) return;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index++}</td>
            <td>${row.applicant.Age}</td>
            <td>${row.applicant.Gender}</td>
            <td>$${row.applicant.Annual_Income.toLocaleString()}</td>
            <td>${row.applicant.Credit_History}</td>
            <td>${Math.round(row.probability * 100)}%</td>
            <td>
                <span class="table-badge ${isApproved ? 'approved' : 'rejected'}">
                    ${row.prediction}
                </span>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function downloadCSVTemplate() {
    const headers = "Age,Gender,Income_Type,Annual_Income,Employment_Duration,Education_Level,Marital_Status,Family_Members,Housing_Type,Existing_Loans,Credit_History,Credit_Inquiries\n";
    const sample1 = "34,Female,Working,85000,6.5,Higher education,Married,3,Owned,No,Good,0\n";
    const sample2 = "21,Male,Working,18000,0.5,Secondary / secondary special,Single,1,Rented,Yes,Bad,6\n";
    const sample3 = "55,Female,Pensioner,42000,0.0,Secondary / secondary special,Widow,1,Owned,No,Good,1\n";
    
    const blob = new Blob([headers + sample1 + sample2 + sample3], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'finguard_bulk_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// --- History Logs Loader ---

function loadHistoryLogs() {
    if (!currentToken) return;
    
    fetch('/api/history', {
        headers: { 'Authorization': `Bearer ${currentToken}` }
    })
    .then(res => res.json())
    .then(data => {
        const tbody = document.getElementById('history-results-tbody');
        tbody.innerHTML = '';
        
        document.getElementById('history-row-count').innerText = `Displaying ${data.history.length} evaluation records`;
        
        data.history.forEach(row => {
            const date = new Date(row.timestamp).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });
            
            const isApproved = row.prediction === 1;
            const statusLabel = isApproved ? 'Approved' : 'Rejected';
            
            // Build Feedback column options (Only for Bank Analysts)
            let feedbackContent = `<span class="table-badge">${row.feedback}</span>`;
            if (currentUser && (currentUser.role === 'Bank Analyst' || currentUser.role === 'Risk Officer')) {
                feedbackContent = `
                    <div class="feedback-actions">
                        <button class="btn-feedback correct ${row.feedback === 'Correct' ? 'active' : ''}" onclick="submitLogFeedback(${row.id}, 'Correct')"><i class="fa-regular fa-thumbs-up"></i></button>
                        <button class="btn-feedback incorrect ${row.feedback === 'Incorrect' ? 'active' : ''}" onclick="submitLogFeedback(${row.id}, 'Incorrect')"><i class="fa-regular fa-thumbs-down"></i></button>
                    </div>
                `;
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${date}</td>
                <td><strong>${row.username}</strong></td>
                <td>Age ${row.age} | $${row.annual_income.toLocaleString()} | ${row.housing_type}</td>
                <td><span class="table-badge ${row.credit_history === 'Good' ? 'approved' : 'rejected'}">${row.credit_history}</span></td>
                <td>${row.credit_inquiries}</td>
                <td>${Math.round(row.probability * 100)}%</td>
                <td><span class="table-badge ${isApproved ? 'approved' : 'rejected'}">${statusLabel}</span></td>
                <td id="feedback-cell-${row.id}">${feedbackContent}</td>
                <td>
                    <button class="btn-secondary" style="padding: 6px 10px; font-size:11px;" onclick="downloadHistoricalPDF(${JSON.stringify(row).replace(/"/g, '&quot;')})">
                        <i class="fa-solid fa-file-pdf"></i> Report
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    });
}

function submitLogFeedback(predId, feedbackVal) {
    fetch(`/api/history/${predId}/feedback`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentToken}`
        },
        body: JSON.stringify({ feedback: feedbackVal })
    })
    .then(res => {
        if (res.ok) {
            // Reload logs silently
            loadHistoryLogs();
        } else {
            alert("Failed to submit decision feedback.");
        }
    });
}

function downloadHistoricalPDF(row) {
    // Reconstruct input/output formats for historical data to match standard downloadPDFCertificate
    const isApproved = row.prediction === 1;
    const insights = isApproved ? row.risk_factors : row.risk_factors; // DB stores positive/risks in risk_factors column depending on outcome
    
    const reconstructedPred = {
        input: {
            Age: row.age,
            Gender: row.gender,
            Income_Type: row.income_type,
            Annual_Income: row.annual_income,
            Employment_Duration: row.employment_duration,
            Education_Level: row.education_level,
            Marital_Status: row.marital_status,
            Family_Members: row.family_members,
            Housing_Type: row.housing_type,
            Existing_Loans: row.existing_loans,
            Credit_History: row.credit_history,
            Credit_Inquiries: row.credit_inquiries
        },
        output: {
            prediction: isApproved ? 'Approved' : 'Rejected',
            probability: row.probability,
            risk_factors: !isApproved ? insights : [],
            positive_factors: isApproved ? insights : [],
            suggestions: row.suggestions
        }
    };
    
    lastPrediction = reconstructedPred;
    downloadPDFCertificate();
}

// --- Dashboard Statistics Loader ---

function loadDashboardStats() {
    // Simple fetch if authenticated as analyst
    const headers = {};
    if (currentToken) {
        headers['Authorization'] = `Bearer ${currentToken}`;
    }
    
    fetch('/api/stats', { headers: headers })
    .then(res => {
        if (!res.ok) throw new Error("Unauthorized dashboard load");
        return res.json();
    })
    .then(data => {
        document.getElementById('stat-total-predictions').innerText = data.total_applications;
        document.getElementById('stat-approval-rate').innerText = `${data.approval_rate}%`;
        document.getElementById('stat-avg-income').innerText = `$${Math.round(data.avg_income).toLocaleString()}`;
    })
    .catch(() => {
        // Fallback or guest baseline values
        document.getElementById('stat-total-predictions').innerText = "Guest Mode";
        document.getElementById('stat-approval-rate').innerText = "Calibrated";
        document.getElementById('stat-avg-income').innerText = "$50k Base";
    });
    
    // Try to load active model name from metrics endpoint
    fetch('/api/metrics')
    .then(res => res.json())
    .then(data => {
        document.getElementById('stat-model-type').innerText = data.best_model || "Random Forest";
    })
    .catch(() => {
        document.getElementById('stat-model-type').innerText = "Decision Tree";
    });
}

// --- Model Insights Page (Charts rendering) ---

function loadMetrics() {
    fetch('/api/metrics')
    .then(res => {
        if (!res.ok) throw new Error("Metrics endpoint unavailable");
        return res.json();
    })
    .then(data => {
        // Read CSS variables for proper chart colors in dark theme
        const isDark = document.body.classList.contains('dark-theme');
        const gridColor = isDark ? '#1e293b' : '#cbd5e1';
        const labelColor = isDark ? '#94a3b8' : '#475569';
        
        // 1. Render Model Performance Bar Chart
        const models = Object.keys(data.models);
        const accuracies = models.map(m => data.models[m].accuracy * 100);
        const precisions = models.map(m => data.models[m].precision * 100);
        const recalls = models.map(m => data.models[m].recall * 100);
        const f1s = models.map(m => data.models[m].f1_score * 100);
        
        const modelsCtx = document.getElementById('chart-models-comparison').getContext('2d');
        if (modelsChartInstance) modelsChartInstance.destroy();
        
        modelsChartInstance = new Chart(modelsCtx, {
            type: 'bar',
            data: {
                labels: models,
                datasets: [
                    { label: 'Accuracy', data: accuracies, backgroundColor: '#3b82f6' },
                    { label: 'Precision', data: precisions, backgroundColor: '#06b6d4' },
                    { label: 'Recall', data: recalls, backgroundColor: '#8b5cf6' },
                    { label: 'F1 Score', data: f1s, backgroundColor: '#10b981' }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: labelColor } }
                },
                scales: {
                    x: {
                        grid: { color: gridColor },
                        ticks: { color: labelColor }
                    },
                    y: {
                        grid: { color: gridColor },
                        ticks: { color: labelColor },
                        min: 50,
                        max: 100
                    }
                }
            }
        });
        
        // 2. Render Feature Importances Chart
        const features = Object.keys(data.feature_importances);
        const importances = Object.values(data.feature_importances).map(i => i * 100);
        
        const impCtx = document.getElementById('chart-feature-importance').getContext('2d');
        if (importanceChartInstance) importanceChartInstance.destroy();
        
        importanceChartInstance = new Chart(impCtx, {
            type: 'bar',
            data: {
                labels: features,
                datasets: [{
                    label: 'Importance Weight (%)',
                    data: importances,
                    backgroundColor: 'rgba(14, 165, 233, 0.75)',
                    borderColor: '#0ea5e9',
                    borderWidth: 1.5
                }]
            },
            options: {
                indexAxis: 'y', // Make it horizontal
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        grid: { color: gridColor },
                        ticks: { color: labelColor },
                        max: 100
                    },
                    y: {
                        grid: { color: gridColor },
                        ticks: { color: labelColor }
                    }
                }
            }
        });
    });
}

function renderProfile() {
    if (!currentUser) return;
    document.getElementById('profile-username').innerText = currentUser.username;
    document.getElementById('profile-email').innerText = currentUser.email;
    document.getElementById('profile-role-text').innerText = currentUser.role;
    
    const roleBadge = document.getElementById('profile-role-badge');
    roleBadge.innerText = currentUser.role;
    if (currentUser.role === 'Bank Analyst' || currentUser.role === 'Risk Officer') {
        roleBadge.className = 'table-badge approved';
        roleBadge.style.backgroundColor = 'var(--success-bg)';
        roleBadge.style.color = 'var(--success-color)';
    } else {
        roleBadge.className = 'table-badge';
        roleBadge.style.backgroundColor = 'var(--accent-glow)';
        roleBadge.style.color = 'var(--accent-color)';
    }
    
    document.getElementById('profile-avatar-letters').innerText = currentUser.username.substring(0, 2).toUpperCase();
}
