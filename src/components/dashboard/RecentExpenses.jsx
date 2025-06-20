const RecentExpenses = ({ expenses, formatCurrency }) => {
  if (!expenses || expenses.length === 0) {
    return (
      <div className="widget md-card">
        <h3 className="md-typescale-title-medium widget-title">
          Recent Expenses
        </h3>
        <div className="empty-widget">
          <div className="empty-icon">📝</div>
          <p className="md-typescale-body-medium">No recent expenses</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="recent-expenses widget md-card">
      <div className="widget-header">
        <h3 className="md-typescale-title-medium widget-title">
          Gastos recientes
        </h3>
        <a href="/expenses" className="view-all-link md-typescale-body-small">
          Ver todos
        </a>
      </div>

      <div className="expenses-list">
        {expenses.map((expense, index) => (
          <div key={`${expense.id}-${index}`} className="expense-item">
            <div className="expense-icon-container">
              <span
                className="expense-icon"
                style={{ backgroundColor: expense.expense_types.color }}
              >
                {expense.expense_types.icon}
              </span>
            </div>

            <div className="expense-details">
              <div className="expense-main">
                <span className="expense-category md-typescale-body-medium">
                  {expense.expense_types.name}
                </span>
                <span className="expense-amount md-typescale-title-medium">
                  {formatCurrency(expense.amount)}
                </span>
              </div>

              <div className="expense-meta">
                <span className="expense-entity md-typescale-body-small">
                  {expense.entities.name}
                </span>
                <span className="expense-date md-typescale-body-small">
                  {formatDate(expense.expense_date)}
                </span>
              </div>

              {expense.description && (
                <div className="expense-description">
                  <span className="description-text md-typescale-body-small">
                    {expense.description.length > 50
                      ? `${expense.description.substring(0, 50)}...`
                      : expense.description}
                  </span>
                </div>
              )}
            </div>

            <div className="expense-actions">
              <button
                className="expense-action-button"
                onClick={() => (window.location.href = "/expenses")}
                title="View details"
              >
                {">"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="widget-footer">
        <a href="/expenses" className="md-button md-button-outlined full-width">
          Ver todos los gastos
        </a>
      </div>
    </div>
  );
};

export default RecentExpenses;
