import { useMemo } from "react";

const ExpenseChart = ({ data, period, formatCurrency }) => {
  const formatDate = (dateString, period) => {
    const date = new Date(dateString);
    if (period === "month") {
      return date.getDate().toString();
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Sort data by date
    const sortedData = [...data].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    // Calculate max value for scaling
    const maxAmount = Math.max(...sortedData.map((d) => d.amount));

    return sortedData.map((item) => ({
      ...item,
      percentage: maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0,
      formattedDate: formatDate(item.date, period),
    }));
  }, [data, period]);

  const totalAmount = chartData.reduce((sum, item) => sum + item.amount, 0);

  if (chartData.length === 0) {
    return (
      <div className="widget md-card">
        <h3 className="md-typescale-title-medium widget-title">
          Spending Trend
        </h3>
        <div className="empty-chart">
          <div className="empty-icon">📈</div>
          <p className="md-typescale-body-medium">
            No data available for chart
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="expense-chart widget md-card">
      <div className="widget-header">
        <h3 className="md-typescale-title-medium widget-title">
          Spending Trend
        </h3>
        <div className="chart-summary">
          <span className="chart-total md-typescale-title-small">
            {formatCurrency(totalAmount)}
          </span>
          <span className="chart-period md-typescale-body-small">
            {chartData.length} {chartData.length === 1 ? "day" : "days"}
          </span>
        </div>
      </div>

      <div className="chart-container">
        <div className="chart-wrapper">
          {chartData.map((item, index) => (
            <div key={index} className="chart-bar-container">
              <div
                className="chart-bar"
                style={{ height: `${Math.max(item.percentage, 5)}%` }}
                title={`${item.formattedDate}: ${formatCurrency(item.amount)}`}
              >
                <div className="bar-fill" />
              </div>
              <div className="chart-label">
                <span className="label-date md-typescale-body-small">
                  {item.formattedDate}
                </span>
                <span className="label-amount md-typescale-body-small">
                  {formatCurrency(item.amount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExpenseChart;
