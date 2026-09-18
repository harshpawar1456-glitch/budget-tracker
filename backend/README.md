# 💰 Budget Tracker

A full-stack Budget Tracker web application that allows users to record
income and expenses, categorize transactions, and monitor their current
financial balance.

## 🚀 Features

- Add income and expense transactions
- Categorize transactions
- Add transaction descriptions and dates
- Automatically calculate total income
- Automatically calculate total expenses
- Display current balance
- Store transactions permanently in MongoDB
- Data persists after page refresh
- Responsive and clean user interface

## 🛠️ Tech Stack

### Frontend
- HTML
- CSS
- JavaScript

### Backend
- Node.js
- Express.js

### Database
- MongoDB Atlas
- Mongoose

## 📁 Project Structure

budget-tracker/
├── FRONTEND/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
└── backend/
    ├── models/
    │   └── Transaction.js
    ├── routes/
    │   └── transactions.js
    ├── server.js
    ├── package.json
    └── .gitignore

## ⚙️ Installation

Clone the repository:

git clone https://github.com/harshpawar1456-glitch/budget-tracker.git

Navigate to the backend:

cd budget-tracker/backend

Install dependencies:

npm install

Create a `.env` file inside the backend folder:

MONGODB_URI=your_mongodb_connection_string
PORT=5000

Start the server:

npm start

Open:

http://localhost:5000

## 🔐 Environment Variables

The MongoDB connection string is stored using environment variables.

The `.env` file is excluded from GitHub using `.gitignore` to prevent
database credentials from being exposed.

## 📸 Screenshots

Add screenshots of the Budget Tracker interface here.

## 🔮 Future Improvements

- User authentication
- Monthly budget limits
- Charts and spending analytics
- Transaction filtering
- Search functionality
- Export transactions to CSV
- Deployment to the cloud

## 👨‍💻 Author

Harsh Pawar

MBA Tech – Computer Engineering  
NMIMS MPSTME