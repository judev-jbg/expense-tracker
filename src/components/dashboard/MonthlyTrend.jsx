const MonthlyTrend = ({ data, year, formatCurrency }) => {
  if (!data || data.length === 0) {
    return null;
  }

  const maxAmount = Math.max(...data.map((d) => d.amount));
  const currentMonth = new Date().getMonth() + 1;

  return (
    <div className="monthly-trend widget md-card">
      <div className="widget-header">
        <h3 className="md-typescale-title-medium widget-title">
          Resumen mensual - {year}
        </h3>
        <div className="trend-summary">
          <span className="trend-total md-typescale-title-small">
            {formatCurrency(data.reduce((sum, item) => sum + item.amount, 0))}
          </span>
        </div>
      </div>

      <div className="monthly-chart">
        {data.map((month, index) => {
          const isCurrentMonth =
            month.month === currentMonth && year === new Date().getFullYear();
          const height =
            maxAmount > 0 ? Math.max((month.amount / maxAmount) * 100, 2) : 2;

          return (
            <div key={month.month} className="month-bar-container">
              <div className="month-info">
                <span className="month-amount md-typescale-body-small">
                  {month.amount > 0 ? formatCurrency(month.amount) : "€0"}
                </span>
              </div>

              <div className="month-bar-wrapper">
                <div
                  className={`month-bar ${isCurrentMonth ? "current" : ""}`}
                  style={{ height: `${height}%` }}
                  title={`${month.monthName}: ${formatCurrency(month.amount)}`}
                />
              </div>

              <div className="month-label">
                <span
                  className={`month-name md-typescale-body-small ${
                    isCurrentMonth ? "current" : ""
                  }`}
                >
                  {month.monthName}
                </span>
                {month.count > 0 && (
                  <span className="month-count md-typescale-body-small">
                    {month.count}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthlyTrend;
