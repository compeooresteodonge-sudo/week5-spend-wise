# SpendWise

SpendWise is a small browser-based monthly budget tracker. Set a budget, add expenses by category, and view your spending and remaining balance in the page. It also writes a clearly labeled summary to the browser's developer console.

## Run the project

Open `index.html` in a modern web browser. No installation or build step is required. Enter a monthly budget and submit it, then use the expense name and amount fields to add each expense. Alternatively, select **Enter a budget with JavaScript prompts** to enter a budget and any number of expenses in dialog prompts; leave an expense name blank to finish. Canceling the prompt flow saves none of its changes. All submitted expenses appear in the table and update the dashboard. Select **Edit** beside an expense to change its name or amount, then choose **Save** or **Cancel**. Open the browser developer tools and select the Console tab to see the calculation output.

## JavaScript concepts

- **Variables and data types:** `monthlyBudget` stores the budget as a number. `expenses` is an array of objects; each object stores an expense ID, category string, and numeric amount. DOM elements are stored in constants so the application can update the page.
- **User input:** HTML forms collect the budget, expense category, and expense amount. The **Enter a budget with JavaScript prompts** button also collects a budget and expenses with `prompt()`. Input methods validate positive KSh amounts to a maximum of two decimal places and require expense names before storing them.
- **Calculations:** `toCents()` and `fromCents()` keep money calculations accurate to two decimal places. `calculateTotalExpenses()` adds expense amounts in cents, and `calculateRemainingBalance()` subtracts the total from the monthly budget. The remaining balance can be negative when spending is over budget.
- **Functions:** Small reusable functions format currency, calculate totals, validate input, render the expense list, refresh the dashboard, and print a summary. `setBudget()` and `addExpense()` organize the user actions.
- **Displaying results:** The dashboard and expense list update in the browser. After a successful budget or expense update, `logBudgetSummary()` prints labeled budget, spending, and balance values, plus an expense table with formatted KSh amounts, in the console.

## Project files

- `index.html` contains the SpendWise page and links the stylesheet and JavaScript with a deferred script.
- `style.css` styles the responsive dashboard and its controls.
- `script.js` stores application data, collects input, performs calculations, and updates the page and console.