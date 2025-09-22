const tablePart = document.querySelector(".table-part");
const transactionTable = document.getElementById("transaction-table");

function checkTableScroll() {
  const rowCount = transactionTable.rows.length - 1; 
  const maxRowCount = 10; 

  if (rowCount > maxRowCount) {
    tablePart.classList.add("scrollable");
  } else {
    tablePart.classList.remove("scrollable");
  }
}

checkTableScroll();

const observer = new MutationObserver(checkTableScroll);
observer.observe(transactionTable, {
  childList: true,
  subtree: true,
});

let transactions = [];

let editedTransaction = null;

function addTransaction() {
  const descriptionInput = document.getElementById("description");
  const amountInput = document.getElementById("amount");
  const typeInput = document.getElementById("type");
  const dateInput = document.getElementById("date");

  const description = descriptionInput.value;
  const amount = parseFloat(amountInput.value);
  const type = typeInput.value;
  const chosenDate = new Date(dateInput.value);

  descriptionInput.value = "";
  amountInput.value = "";
  dateInput.value = "";

  if (description.trim() === "" || isNaN(amount) || isNaN(chosenDate)) {
    return;
  }

  const transaction = {
    primeId: chosenDate.getTime(),
    description: description,
    amount: amount,
    type: type,
  };

  transactions.push(transaction);

  updateBalance();

  updateTransactionTable();
}

function deleteTransaction(primeId) {
  const index = transactions.findIndex(
    (transaction) => transaction.primeId === primeId
  );

  if (index > -1) {
    transactions.splice(index, 1);
  }

  updateBalance();

  updateTransactionTable();
}

function editTransaction(primeId) {
  const transaction = transactions.find(
    (transaction) => transaction.primeId === primeId
  );

  document.getElementById("description").value = transaction.description;
  document.getElementById("amount").value = transaction.amount;
  document.getElementById("type").value = transaction.type;

  editedTransaction = transaction;

  document.getElementById("add-transaction-btn").style.display = "none";
  document.getElementById("save-transaction-btn").style.display =
    "inline-block";

  const dateInput = document.getElementById("date");
  const chosenDate = new Date(transaction.primeId);
  const formattedDate = formatDate(chosenDate);
  dateInput.value = formattedDate;
}

function saveTransaction() {
  if (!editedTransaction) {
    return;
  }
  const descriptionInput = document.getElementById("description");
  const amountInput = document.getElementById("amount");
  const typeInput = document.getElementById("type");
  const dateInput = document.getElementById("date");

  const description = descriptionInput.value;
  const amount = parseFloat(amountInput.value);
  const type = typeInput.value;
  const chosenDate = new Date(dateInput.value);

  if (description.trim() === "" || isNaN(amount) || isNaN(chosenDate)) {
    return;
  }

  editedTransaction.description = description;
  editedTransaction.amount = amount;
  editedTransaction.type = type;
  editedTransaction.primeId = chosenDate.getTime();

  descriptionInput.value = "";
  amountInput.value = "";
  dateInput.value = "";

  editedTransaction = null;

  updateBalance();

  updateTransactionTable();

  document.getElementById("add-transaction-btn").style.display = "inline-block";
  document.getElementById("save-transaction-btn").style.display = "none";
}

function updateBalance() {
  const balanceElement = document.getElementById("balance");
  let balance = 0.0;

  transactions.forEach((transaction) => {
    if (transaction.type === "income") {
      balance += transaction.amount;
    } else if (transaction.type === "expense") {
      balance -= transaction.amount;
    }
  });

  const currencySelect = document.getElementById("currency");
  const currencyCode = currencySelect.value;
  const formattedBalance = formatCurrency(balance, currencyCode);

  balanceElement.textContent = formattedBalance;

  if (balance < 0) {
    balanceElement.classList.remove("positive-balance");
    balanceElement.classList.add("negative-balance");
  } else {
    balanceElement.classList.remove("negative-balance");
    balanceElement.classList.add("positive-balance");
  }
}

window.addEventListener("DOMContentLoaded", () => {
  let balance = 0.0;
  updateBalance(balance); 

  function updateBalance(balance) {
    const balanceElement = document.getElementById("balance");
    balanceElement.textContent = balance.toFixed(2); 
  }
});
function formatCurrency(amount, currencyCode) {
  const currencySymbols = {
    USD: "$",
    EUR: "€",
    VND: "VND",
  };

  const decimalSeparators = {
    USD: ".",
    EUR: ",",
    VND: ",",
  };

  const symbol = currencySymbols[currencyCode] || "";
  const decimalSeparator = decimalSeparators[currencyCode] || ".";

  const formattedAmount =
    symbol + amount.toFixed(2).replace(".", decimalSeparator);
  return formattedAmount;
}

function formatDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function updateTransactionTable() {
  const transactionTable = document.getElementById("transaction-table");

  while (transactionTable.rows.length > 1) {
    transactionTable.deleteRow(1);
  }

  transactions.forEach((transaction) => {
    const newRow = transactionTable.insertRow();

    const dateCell = newRow.insertCell();
    const date = new Date(transaction.primeId);
    dateCell.textContent = formatDate(date);

    const descriptionCell = newRow.insertCell();
    descriptionCell.textContent = transaction.description;

    const amountCell = newRow.insertCell();
    const currencySelect = document.getElementById("currency");
    const currencyCode = currencySelect.value;
    const formattedAmount = formatCurrency(transaction.amount, currencyCode);
    amountCell.textContent = formattedAmount;

    const typeCell = newRow.insertCell();
    typeCell.textContent = transaction.type;

    const actionCell = newRow.insertCell();
    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.classList.add("edit-button");
    editButton.addEventListener("click", () =>
      editTransaction(transaction.primeId)
    );
    actionCell.appendChild(editButton);

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.classList.add("delete-button");
    deleteButton.addEventListener("click", () =>
      deleteTransaction(transaction.primeId)
    );
    actionCell.appendChild(deleteButton);

    const saveButton = document.createElement("button");
    saveButton.textContent = "Save";
    saveButton.classList.add("save-button");
    saveButton.addEventListener("click", () =>
      saveTransaction(transaction.primeId)
    );
    actionCell.appendChild(saveButton);
  });
}

document
  .getElementById("add-transaction-btn")
  .addEventListener("click", addTransaction);

document
  .getElementById("save-transaction-btn")
  .addEventListener("click", saveTransaction);

updateBalance();
updateTransactionTable();

function handleDownload() {
  const exportFormat = prompt("Select export format: PDF or CSV").toLowerCase();

  if (exportFormat === "pdf") {
    exportToPDF();
  } else if (exportFormat === "csv") {
    exportToCSV();
  } else {
    alert('Invalid export format. Please enter either "PDF" or "CSV".');
  }
}

function exportToPDF() {
  const docDefinition = {
    content: [
      {
        table: {
          headerRows: 1,
          widths: ["auto", "*", "auto", "auto"],
          body: [
            [
              { text: "Date", style: "header" },
              { text: "Description", style: "header" },
              { text: "Amount", style: "header" },
              { text: "Type", style: "header" },
            ],
            ...transactions.map((transaction) => {
              const date = formatDate(new Date(transaction.primeId));
              const description = transaction.description;
              const amount = transaction.amount;
              const type = transaction.type;

              return [date, description, amount.toString(), type];
            }),
          ],
        },
      },
    ],
    styles: {
      header: {
        fontSize: 12,
        bold: true,
        margin: [0, 5],
      },
    },
  };

  pdfMake.createPdf(docDefinition).download("transactions.pdf");
}

function exportToCSV() {
  const csvContent =
    "Date,Description,Amount,Type\n" +
    transactions
      .map((transaction) => {
        const date = formatDate(new Date(transaction.primeId));
        const description = transaction.description;
        const amount = transaction.amount;
        const type = transaction.type;

        return `${date},${description},${amount},${type}`;
      })
      .join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "transactions.csv";
  link.click();
}
