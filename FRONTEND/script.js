// script.js
// All the browser logic: talk to the backend, draw the table, update the totals.

// Where the backend lives.
// Because server.js also serves this frontend, a relative URL works.
// If you open index.html directly from the file system instead,
// change this to: const API_URL = "http://localhost:5000/api/transactions";
const API_URL = "/api/transactions";

// ---------- Grab the HTML elements once ----------
const form = document.getElementById("transactionForm");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const descriptionInput = document.getElementById("description");
const dateInput = document.getElementById("date");

const tableBody = document.getElementById("transactionBody");
const emptyState = document.getElementById("emptyState");
const messageBox = document.getElementById("message");

const totalIncomeEl = document.getElementById("totalIncome");
const totalExpenseEl = document.getElementById("totalExpense");
const balanceEl = document.getElementById("balance");

// We keep the latest list here so we can re-draw without asking the server again.
let transactions = [];

// ---------- Small helpers ----------

// Turns 12500 into "₹12,500.00"
function formatMoney(value) {
  return "₹" + Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Turns an ISO date string into "18 Sep 2026"
function formatDate(value) {
  const d = new Date(value);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Shows a message under the form. type is "error" or "success".
function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = "message " + (type || "");

  // Clear it after 4 seconds so it does not stay forever.
  if (text) {
    setTimeout(() => {
      messageBox.textContent = "";
      messageBox.className = "message";
    }, 4000);
  }
}

// Stops text like <script> from being treated as HTML.
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ---------- Drawing ----------

// Adds up income and expenses and writes the three card values.
function updateSummary() {
  let income = 0;
  let expense = 0;

  transactions.forEach((t) => {
    if (t.type === "income") income += t.amount;
    else expense += t.amount;
  });

  totalIncomeEl.textContent = formatMoney(income);
  totalExpenseEl.textContent = formatMoney(expense);
  balanceEl.textContent = formatMoney(income - expense);
}

// Builds one <tr> of HTML for a transaction.
function rowHtml(t) {
  const sign = t.type === "income" ? "+" : "-";

  return `
    <tr>
      <td>${formatDate(t.date)}</td>
      <td>${escapeHtml(t.description || "—")}</td>
      <td>${escapeHtml(t.category)}</td>
      <td><span class="tag tag-${t.type}">${t.type === "income" ? "Income" : "Expense"}</span></td>
      <td class="right amount-${t.type}">${sign}${formatMoney(t.amount)}</td>
      <td>
        <button class="btn-delete" data-id="${t._id}">Delete</button>
      </td>
    </tr>
  `;
}

// Clears the table and re-draws every row.
function renderTransactions() {
  tableBody.innerHTML = transactions.map(rowHtml).join("");
  emptyState.style.display = transactions.length === 0 ? "block" : "none";
  updateSummary();
}

// ---------- Talking to the backend ----------

// GET /api/transactions
async function loadTransactions() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) throw new Error("Could not load transactions");

    transactions = await response.json();
    renderTransactions();
  } catch (error) {
    showMessage("Could not reach the server. Is the backend running?", "error");
  }
}

// POST /api/transactions
async function addTransaction(event) {
  event.preventDefault(); // stops the browser from reloading the page

  const newTransaction = {
    amount: Number(amountInput.value),
    type: typeInput.value,
    category: categoryInput.value.trim(),
    description: descriptionInput.value.trim(),
    date: dateInput.value,
  };

  // A quick check in the browser before bothering the server.
  if (!newTransaction.amount || newTransaction.amount <= 0) {
    return showMessage("Enter an amount greater than 0.", "error");
  }
  if (!newTransaction.category) {
    return showMessage("Enter a category.", "error");
  }

  const button = form.querySelector("button[type='submit']");
  button.disabled = true;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTransaction), // object -> JSON text
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.message || "Could not save");

    // Put the saved transaction at the top of our list and re-draw.
    transactions.unshift(data);
    renderTransactions();

    form.reset();          // clear the form
    setTodayAsDefault();   // put today's date back in
    amountInput.focus();
    showMessage("Transaction added.", "success");
  } catch (error) {
    showMessage(error.message, "error");
  } finally {
    button.disabled = false;
  }
}

// DELETE /api/transactions/:id
async function deleteTransaction(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    const data = await response.json();

    if (!response.ok) throw new Error(data.message || "Could not delete");

    // Keep every transaction except the deleted one.
    transactions = transactions.filter((t) => t._id !== id);
    renderTransactions();
    showMessage("Transaction deleted.", "success");
  } catch (error) {
    showMessage(error.message, "error");
  }
}

// ---------- Events ----------

form.addEventListener("submit", addTransaction);

// One listener on the table handles every Delete button,
// including buttons added later. This is called event delegation.
tableBody.addEventListener("click", (event) => {
  const button = event.target.closest(".btn-delete");
  if (!button) return;

  if (confirm("Delete this transaction?")) {
    deleteTransaction(button.dataset.id);
  }
});

// ---------- Start ----------

function setTodayAsDefault() {
  // toISOString gives "2026-09-18T..." and the date input wants "2026-09-18"
  dateInput.value = new Date().toISOString().split("T")[0];
}

setTodayAsDefault();
loadTransactions(); // runs as soon as the page opens