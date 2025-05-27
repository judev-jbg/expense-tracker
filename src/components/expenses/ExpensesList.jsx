import { useState } from "react";
import ExpenseCard from "./ExpenseCard";

const ExpensesList = ({ expenses, onEdit, onDelete, onView, loading }) => {
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  // Sort expenses
  const sortedExpenses = [...expenses].sort((a, b) => {
    let aValue, bValue;

    switch (sortBy) {
      case "date":
        aValue = new Date(a.expense_date);
        bValue = new Date(b.expense_date);
        break;
      case "amount":
        aValue = parseFloat(a.amount);
        bValue = parseFloat(b.amount);
        break;
      case "type":
        aValue = a.expense_types.name.toLowerCase();
        bValue = b.expense_types.name.toLowerCase();
        break;
      case "entity":
        aValue = a.entities.name.toLowerCase();
        bValue = b.entities.name.toLowerCase();
        break;
      default:
        aValue = new Date(a.expense_date);
        bValue = new Date(b.expense_date);
    }

    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // Group expenses by month for better organization
  const groupedExpenses = sortedExpenses.reduce((groups, expense) => {
    const date = new Date(expense.expense_date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
    const monthName = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });

    if (!groups[key]) {
      groups[key] = {
        monthName,
        expenses: [],
        total: 0,
      };
    }

    groups[key].expenses.push(expense);
    groups[key].total += parseFloat(expense.amount);
    return groups;
  }, {});

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  if (loading) {
    return (
      <div className="expenses-loading">
        <div className="loading-spinner">Loading expenses...</div>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="empty-expenses md-card">
        <div className="empty-icon">💸</div>
        <h3 className="md-typescale-title-medium">No expenses found</h3>
        <p className="md-typescale-body-medium">
          Start tracking your expenses by adding your first one.
        </p>
      </div>
    );
  }

  return (
    <div className="expenses-list">
      {/* Sort Controls */}
      <div className="list-controls md-card">
        <div className="sort-controls">
          <span className="md-typescale-body-small">Sort by:</span>
          <div className="sort-buttons">
            {[
              { key: "date", label: "Date" },
              { key: "amount", label: "Amount" },
              { key: "type", label: "Type" },
              { key: "entity", label: "Entity" },
            ].map(({ key, label }) => (
              <button
                key={key}
                className={`sort-button ${sortBy === key ? "active" : ""}`}
                onClick={() => handleSort(key)}
              >
                {label}
                {sortBy === key && (
                  <span className="sort-indicator">
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="list-summary">
          <span className="md-typescale-body-small">
            {expenses.length} {expenses.length === 1 ? "expense" : "expenses"}
          </span>
        </div>
      </div>

      {/* Grouped Expenses */}
      <div className="expenses-groups">
        {Object.entries(groupedExpenses).map(([key, group]) => (
          <div key={key} className="expense-group">
            <div className="group-header">
              <h3 className="md-typescale-title-medium group-title">
                {group.monthName}
              </h3>
              <div className="group-summary">
                <span className="group-total md-typescale-title-small">
                  €{group.total.toFixed(2)}
                </span>
                <span className="group-count md-typescale-body-small">
                  {group.expenses.length}{" "}
                  {group.expenses.length === 1 ? "expense" : "expenses"}
                </span>
              </div>
            </div>

            <div className="expenses-grid">
              {group.expenses.map((expense) => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onView={onView}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpensesList;
