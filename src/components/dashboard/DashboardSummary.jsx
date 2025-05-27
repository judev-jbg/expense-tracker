const DashboardSummary = ({ data, formatCurrency }) => {
  const summaryCards = [
    {
      title: "Total Spent",
      value: formatCurrency(data.totalAmount),
      icon: "💰",
      color: "primary",
      trend: null,
    },
    {
      title: "Total Expenses",
      value: data.expenseCount.toString(),
      icon: "📝",
      color: "secondary",
      trend: null,
    },
    {
      title: "Average Expense",
      value: formatCurrency(data.avgExpenseAmount),
      icon: "📊",
      color: "tertiary",
      trend: null,
    },
    {
      title: "Period",
      value: data.period,
      icon: "📅",
      color: "neutral",
      trend: null,
    },
  ];

  return (
    <div className="dashboard-summary">
      <div className="summary-grid">
        {summaryCards.map((card, index) => (
          <div key={index} className={`summary-card md-card ${card.color}`}>
            <div className="card-header">
              <div className="card-icon">{card.icon}</div>
              {card.trend && (
                <div className={`trend-indicator ${card.trend.type}`}>
                  <span className="trend-icon">
                    {card.trend.type === "up"
                      ? "↗️"
                      : card.trend.type === "down"
                      ? "↘️"
                      : "➡️"}
                  </span>
                  <span className="trend-value">{card.trend.value}</span>
                </div>
              )}
            </div>

            <div className="card-content">
              <div className="card-value md-typescale-headline-small">
                {card.value}
              </div>
              <div className="card-title md-typescale-body-medium">
                {card.title}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardSummary;
