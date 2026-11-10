// Application data
let monthlyBudget = 0;
const expenses = [];

const currencyFormatter = new Intl.NumberFormat("en-KE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const budgetValueElement = document.querySelector("#budget-value");
const spentValueElement = document.querySelector("#spent-value");
const remainingValueElement = document.querySelector("#remaining-value");
const remainingHintElement = document.querySelector("#remaining-hint");
const expenseListElement = document.querySelector("#expense-list");
const expenseCountElement = document.querySelector("#expense-count");
const statusMessageElement = document.querySelector("#status-message");
const budgetInputElement = document.querySelector("#budget-input");
const expenseCategoryElement = document.querySelector("#expense-category");
const expenseAmountElement = document.querySelector("#expense-amount");
let editingExpenseId = null;

function formatCurrency(amount) {
  return `KSh ${currencyFormatter.format(amount)}`;
}

function toCents(amount) {
  return Math.round((amount + Number.EPSILON) * 100);
}

function fromCents(cents) {
  return cents / 100;
}

function parseAmount(value) {
  const text = String(value).trim();
  if (!/^(?:\d+|\d*\.\d{1,2})$/.test(text)) {
    return null;
  }

  const [whole = "0", fraction = ""] = text.split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  return Number.isSafeInteger(cents) && cents > 0 ? fromCents(cents) : null;
}

function calculateTotalExpenses() {
  const totalCents = expenses.reduce((total, expense) => total + toCents(expense.amount), 0);
  return fromCents(totalCents);
}

function calculateRemainingBalance() {
  return fromCents(toCents(monthlyBudget) - toCents(calculateTotalExpenses()));
}

function logBudgetSummary() {
  const totalExpenses = calculateTotalExpenses();
  const remainingBalance = calculateRemainingBalance();

  console.log("SpendWise budget summary");
  console.log(`Monthly budget: ${formatCurrency(monthlyBudget)}`);
  console.log(`Total expenses: ${formatCurrency(totalExpenses)}`);
  console.log(`Remaining balance: ${formatCurrency(remainingBalance)}`);
  console.table(expenses.map((expense) => ({
    ID: expense.id,
    Expense: expense.category,
    "Amount (KSh)": formatCurrency(expense.amount)
  })));
}

function renderExpenses() {
  expenseListElement.replaceChildren();

  if (expenses.length === 0) {
    const emptyState = document.createElement("tr");
    const cell = document.createElement("td");
    cell.className = "empty-state";
    cell.colSpan = 4;
    cell.textContent = "No expenses yet. Add one to start tracking.";
    emptyState.append(cell);
    expenseListElement.append(emptyState);
  } else {
    expenses.forEach((expense) => {
      const item = document.createElement("tr");
      const number = document.createElement("td");
      number.textContent = expense.id;
      const category = document.createElement("td");
      category.textContent = expense.category;
      const amount = document.createElement("td");
      amount.className = "expense-amount";
      amount.textContent = formatCurrency(expense.amount);
      const actions = document.createElement("td");
      actions.className = "expense-actions";

      if (editingExpenseId === expense.id) {
        const categoryInput = document.createElement("input");
        categoryInput.type = "text";
        categoryInput.className = "edit-category-input";
        categoryInput.maxLength = 80;
        categoryInput.value = expense.category;
        categoryInput.setAttribute("aria-label", `Edit expense ${expense.id} name`);

        const amountInput = document.createElement("input");
        amountInput.type = "number";
        amountInput.className = "edit-amount-input";
        amountInput.min = "0.01";
        amountInput.step = "0.01";
        amountInput.value = expense.amount;
        amountInput.setAttribute("aria-label", `Edit expense ${expense.id} amount`);

        const saveButton = document.createElement("button");
        saveButton.type = "button";
        saveButton.className = "table-button";
        saveButton.dataset.action = "save";
        saveButton.dataset.id = expense.id;
        saveButton.textContent = "Save";

        const cancelButton = document.createElement("button");
        cancelButton.type = "button";
        cancelButton.className = "table-button";
        cancelButton.dataset.action = "cancel";
        cancelButton.dataset.id = expense.id;
        cancelButton.textContent = "Cancel";

        category.replaceChildren(categoryInput);
        amount.replaceChildren(amountInput);
        actions.append(saveButton, cancelButton);
      } else {
        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "table-button";
        editButton.dataset.action = "edit";
        editButton.dataset.id = expense.id;
        editButton.textContent = "Edit";
        editButton.setAttribute("aria-label", `Edit ${expense.category}`);
        actions.append(editButton);
      }

      item.append(number, category, amount, actions);
      expenseListElement.append(item);
    });
  }

  expenseCountElement.textContent = `${expenses.length} ${expenses.length === 1 ? "entry" : "entries"}`;
}

function handleExpenseTableClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button || !expenseListElement.contains(button)) {
    return;
  }

  const expenseId = Number(button.dataset.id);
  const expense = expenses.find((item) => item.id === expenseId);
  if (!expense) {
    return;
  }

  if (button.dataset.action === "edit") {
    editingExpenseId = expenseId;
    renderExpenses();
    expenseListElement.querySelector(".edit-category-input").focus();
    return;
  }

  if (button.dataset.action === "cancel") {
    editingExpenseId = null;
    renderExpenses();
    return;
  }

  const row = button.closest("tr");
  const category = row.querySelector(".edit-category-input").value.trim();
  const amount = parseAmount(row.querySelector(".edit-amount-input").value);
  if (!category || amount === null) {
    statusMessageElement.textContent = "Enter an expense name and a valid amount with no more than two decimal places.";
    return;
  }

  expense.category = category;
  expense.amount = amount;
  editingExpenseId = null;
  statusMessageElement.textContent = `${category} was updated.`;
  updateDashboard();
  logBudgetSummary();
}

function updateDashboard() {
  const totalExpenses = calculateTotalExpenses();
  const remainingBalance = calculateRemainingBalance();

  budgetValueElement.textContent = formatCurrency(monthlyBudget);
  spentValueElement.textContent = formatCurrency(totalExpenses);
  remainingValueElement.textContent = formatCurrency(remainingBalance);
  remainingValueElement.classList.toggle("over-budget", remainingBalance < 0);
  remainingHintElement.textContent = remainingBalance < 0
    ? `Over budget by ${formatCurrency(Math.abs(remainingBalance))}`
    : monthlyBudget === 0
      ? "Set a budget to get started"
      : "Available to spend";

  renderExpenses();
}

function setBudget(event) {
  event.preventDefault();
  const amount = parseAmount(budgetInputElement.value);
  if (amount === null) {
    budgetInputElement.setCustomValidity("Enter an amount greater than zero with no more than two decimal places.");
    budgetInputElement.reportValidity();
    budgetInputElement.setCustomValidity("");
    return;
  }

  monthlyBudget = amount;
  budgetInputElement.value = "";
  statusMessageElement.textContent = "Your monthly budget has been updated.";
  updateDashboard();
  logBudgetSummary();
}

function addExpense(event) {
  event.preventDefault();
  const category = expenseCategoryElement.value.trim();
  const amount = parseAmount(expenseAmountElement.value);
  if (category.length === 0 || amount === null) {
    statusMessageElement.textContent = "Enter an expense name and a valid amount with no more than two decimal places.";
    return;
  }

  expenses.push({
    id: expenses.length + 1,
    category,
    amount
  });

  statusMessageElement.textContent = `${category} was added to your expenses.`;
  expenseCategoryElement.value = "";
  expenseAmountElement.value = "";
  updateDashboard();
  logBudgetSummary();
}

function promptForPositiveAmount(message) {
  while (true) {
    const response = window.prompt(message);
    if (response === null) {
      return null;
    }

    const amount = parseAmount(response);
    if (amount !== null) {
      return amount;
    }

    window.alert("Please enter an amount greater than zero with no more than two decimal places.");
  }
}

function collectBudgetWithPrompts() {
  const budget = promptForPositiveAmount("Enter your monthly budget in KSh:");
  if (budget === null) {
    statusMessageElement.textContent = "Prompt entry canceled. No changes were saved.";
    return;
  }

  const promptedExpenses = [];
  while (true) {
    const response = window.prompt("Enter an expense name, or leave blank to finish:");
    if (response === null) {
      statusMessageElement.textContent = "Prompt entry canceled. No changes were saved.";
      return;
    }

    const category = response.trim();
    if (category.length === 0) {
      break;
    }
    if (category.length > 80) {
      window.alert("Expense names must be 80 characters or fewer.");
      continue;
    }

    const amount = promptForPositiveAmount(`Enter the amount for ${category} in KSh:`);
    if (amount === null) {
      statusMessageElement.textContent = "Prompt entry canceled. No changes were saved.";
      return;
    }

    promptedExpenses.push({
      id: expenses.length + promptedExpenses.length + 1,
      category,
      amount
    });
  }

  monthlyBudget = budget;
  expenses.push(...promptedExpenses);
  statusMessageElement.textContent = `Budget set and ${promptedExpenses.length} ${promptedExpenses.length === 1 ? "expense" : "expenses"} added.`;
  updateDashboard();
  logBudgetSummary();
}

document.querySelector("#budget-form").addEventListener("submit", setBudget);
document.querySelector("#expense-form").addEventListener("submit", addExpense);
expenseListElement.addEventListener("click", handleExpenseTableClick);
document.querySelector("#prompt-entry-button").addEventListener("click", collectBudgetWithPrompts);

updateDashboard();
console.log("SpendWise is ready. Set a budget or add an expense to get started.");