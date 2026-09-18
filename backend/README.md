# Budget Tracker

A simple full-stack budget tracker. Add income and expenses, see your totals update, and delete entries you no longer need. Everything is stored in MongoDB, so your data is still there after a refresh.

## Features

- Add income and expense transactions
- View all transactions in a table
- Delete a transaction
- Live totals: income, expenses, and balance
- Income and expenses are colour-coded
- Responsive layout that works on a phone
- Data saved permanently in MongoDB

## Technologies used

| Layer | Technology |
| ----- | ---------- |
| Frontend | HTML, CSS, vanilla JavaScript (`fetch`) |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Other | dotenv, cors |

## Project structure

```
budget-tracker/
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── backend/
│   ├── models/
│   │   └── Transaction.js
│   ├── routes/
│   │   └── transactions.js
│   ├── server.js
│   ├── package.json
│   └── .env
│
└── README.md
```

## Installation

1. Download or clone this project.
2. Open a terminal in the `backend` folder.
3. Install the packages:

```bash
npm install
```

4. Create a file named `.env` inside `backend` (copy `.env.example`) and fill in:

```
MONGODB_URI=your_mongodb_connection_string
PORT=5000
```

## How to run

From the `backend` folder:

```bash
npm start
```

Then open <http://localhost:5000> in your browser. The backend also serves the frontend, so you do not need a second server.

## API endpoints

| Method | Endpoint | What it does |
| ------ | -------- | ------------ |
| GET | `/api/transactions` | Returns all transactions, newest first |
| GET | `/api/transactions/summary` | Returns income, expense, and balance totals |
| POST | `/api/transactions` | Creates a transaction |
| DELETE | `/api/transactions/:id` | Deletes one transaction |

### POST body example

```json
{
  "amount": 25000,
  "type": "income",
  "category": "Salary",
  "description": "September salary",
  "date": "2026-09-01"
}
```

## MongoDB setup

### Option A — MongoDB Atlas (recommended)

1. Create a free account at <https://www.mongodb.com/cloud/atlas>.
2. Create a free M0 cluster.
3. Under **Database Access**, create a user with a username and password.
4. Under **Network Access**, add your IP address (or `0.0.0.0/0` while learning).
5. Click **Connect → Drivers** and copy the connection string.
6. Paste it into `.env`, replacing `<password>` with your real password and adding the database name:

```
MONGODB_URI=mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/budget-tracker
```

### Option B — Local MongoDB

Install MongoDB Community Server, start it, and use:

```
MONGODB_URI=mongodb://127.0.0.1:27017/budget-tracker
```

## Future improvements

- Edit an existing transaction
- Filter by month or category
- Search the transaction list
- Export to CSV
- User accounts so each person sees only their own data
- A simple chart of spending by category