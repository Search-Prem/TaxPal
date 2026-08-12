# TaxPal

TaxPal is a full-stack personal finance management web application designed to help users manage their income, expenses, budgets, tax estimates, and financial reports from a single platform.

## Features

- User registration and login
- JWT-based authentication
- Add, edit, and delete income transactions
- Add, edit, and delete expense transactions
- Custom income and expense categories
- Financial dashboard
- Income and expense summaries
- Net balance calculation
- Savings rate calculation
- Expense category visualization
- Financial trends visualization
- Budget creation and deletion
- Budget health tracking
- Tax estimation
- Quarterly tax payment tracking
- Monthly and quarterly financial reports
- Transaction logs
- User settings
- Password reset functionality

## Dashboard

The dashboard provides an overview of the user's financial activity, including:

- Total Income
- Total Expense
- Net Balance
- Tax Estimate
- Savings Rate
- Active Budgets

It also provides visualizations for expense categories and financial trends.

## Budget Management

Users can create budgets based on their expense categories and specify:

- Expense category
- Budget amount
- Month
- Description

TaxPal also provides budget health information by comparing the budget amount with the expenses recorded for the corresponding category and month.

## Tax Management

The Tax Estimator allows users to calculate estimated tax based on their annual income and applicable deductions.

TaxPal also tracks estimated quarterly tax payments:

- Q1
- Q2
- Q3
- Q4

Users can mark individual quarterly installments as paid or unpaid.

## Reports

The Reports section provides financial information based on recorded transactions.

Users can view:

- Monthly reports
- Quarterly reports
- Summary information
- Individual month selections

## Transaction Management

Users can record both income and expenses with information such as:

- Transaction type
- Category
- Amount
- Date
- Description

Transactions can also be edited or deleted.

## Technology Stack

### Frontend

- React
- Vite
- Tailwind CSS
- React Router
- Chart.js
- React Icons
- Lucide React

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)
- bcrypt.js

### Development Tools

- Git
- GitHub
- npm
- REST APIs

## Project Structure

```text
TaxPal/
│
├── Client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   │
│   ├── package.json
│   └── vite.config.js
│
├── Server/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── server.js
│   └── package.json
│
└── README.md
Application Workflow
                    TaxPal
                      │
                Authentication
                      │
          ┌───────────┴───────────┐
          │                       │
       Register                 Login
                                  │
                                  ↓
                             Dashboard
                                  │
       ┌──────────────┬───────────┼───────────────┐
       │              │           │               │
       ↓              ↓           ↓               ↓
 Transactions      Budgets   Tax Estimator     Reports
       │              │           │               │
       ↓              ↓           ↓               ↓
 Income/Expense  Budget Health  Tax Records   Financial
    Records                                  Analysis
Installation
1. Clone the repository
git clone https://github.com/Search-Prem/TaxPal.git
cd TaxPal
2. Install frontend dependencies
cd Client
npm install
3. Install backend dependencies

Open a new terminal and run:

cd Server
npm install
Environment Variables

Create a .env file inside the Server directory.

Example:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GMAIL_USER=your_email
GMAIL_PASS=your_email_app_password
EMAIL=your_email

Do not commit the .env file to GitHub.

Running the Application
Start the Backend

From the Server directory:

npm start

If the project uses a development script:

npm run dev
Start the Frontend

From the Client directory:

npm run dev

The frontend will normally be available at:

http://localhost:5173
API Configuration

The frontend communicates with the backend using relative API paths:

/api/...

During local development, Vite proxies these requests to the configured backend.

For example:

/api/auth/login
        ↓
Vite Proxy
        ↓
/auth/login
        ↓
TaxPal Backend

This keeps API URLs centralized instead of hardcoding the backend URL throughout the React application.

Database

TaxPal uses MongoDB with Mongoose for persistent application data.

The database stores user-specific information including:

User accounts
Transactions
Budgets
Tax records
Tax payment information

Custom categories are currently maintained using browser local storage.

Authentication

TaxPal uses JWT-based authentication.

The authentication flow is:

User Login
    ↓
Backend validates credentials
    ↓
JWT token generated
    ↓
Token stored by frontend
    ↓
Token sent with protected API requests
    ↓
Backend authenticates the user

Passwords are hashed using bcrypt before being stored.

Security

The application includes:

JWT authentication
Password hashing
Protected API routes
User-specific database queries
Environment variables for sensitive credentials
Authentication checks for protected pages
Deployment

The backend can be deployed as a Node.js/Express application, while the React frontend can be deployed separately.

The application uses API routing so that frontend requests can communicate with the deployed backend without requiring individual API URLs to be hardcoded throughout the frontend.

Current Limitations
Custom categories are stored in browser local storage and therefore do not automatically synchronize between different devices.
Tax estimation is based on the application's implemented tax calculation workflow and should not be treated as professional tax advice.
Future Improvements

Possible future improvements include:

Cloud synchronization of custom categories
More advanced tax calculation options
Recurring transactions
Bill management
Additional financial analytics
Enhanced dashboard visualizations
Dark mode
Mobile-specific UI improvements
Author

Prem Kumar Garapati

GitHub:
https://github.com/Search-Prem
