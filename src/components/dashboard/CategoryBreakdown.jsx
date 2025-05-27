const CategoryBreakdown = ({ data, formatCurrency }) => {
  if (!data || data.length === 0) {
    return (
      <div className="widget md-card">
        <h3 className="md-typescale-title-medium widget-title">
          Spending by Category
        </h3>
        <div className="empty-widget">
          <div className="empty-icon">🏷️</div>
          <p className="md-typescale-body-medium">No categories to display</p>
        </div>
      </div>
    );
  }

  const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="category-breakdown widget md-card">
      <div className="widget-header">
        <h3 className="md-typescale-title-medium widget-title">
          Spending by Category
        </h3>
        <span className="widget-total md-typescale-title-small">
          {formatCurrency(totalAmount)}
        </span>
      </div>

      <div className="category-list">
        {data.map((category, index) => (
          <div key={category.id} className="category-item">
            <div className="category-header">
              <div className="category-info">
                <span
                  className="category-icon"
                  style={{ backgroundColor: category.color }}
                >
                  {category.icon}
                </span>
                <div className="category-details">
                  <span className="category-name md-typescale-body-medium">
                    {category.name}
                  </span>
                  <span className="category-count md-typescale-body-small">
                    {category.count}{" "}
                    {category.count === 1 ? "expense" : "expenses"}
                  </span>
                </div>
              </div>

              <div className="category-amount">
                <span className="amount-value md-typescale-title-small">
                  {formatCurrency(category.amount)}
                </span>
                <span className="amount-percentage md-typescale-body-small">
                  {category.percentage.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="category-progress">
              <div
                className="progress-bar"
                style={{
                  width: `${category.percentage}%`,
                  backgroundColor: category.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryBreakdown;
