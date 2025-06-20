import { HiOutlineLightBulb, HiLightBulb } from "react-icons/hi";
const InsightsWidget = ({ insights, formatCurrency }) => {
  if (!insights || insights.length === 0) {
    return null;
  }

  const formatInsightValue = (insight) => {
    switch (insight.type) {
      case "most_expensive_month":
      case "daily_average":
        return formatCurrency(insight.value);
      case "most_frequent":
        return `${insight.value} veces`;
      default:
        return insight.value.toString();
    }
  };

  const getInsightColor = (type) => {
    switch (type) {
      case "most_expensive_month":
        return "warning";
      case "daily_average":
        return "info";
      case "most_frequent":
        return "success";
      default:
        return "neutral";
    }
  };

  return (
    <div className="insights-widget widget md-card">
      <div className="widget-header">
        <h3 className="md-typescale-title-medium widget-title">
          <HiOutlineLightBulb /> Insights
        </h3>
      </div>

      <div className="insights-list">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`insight-item ${getInsightColor(insight.type)}`}
          >
            <div className="insight-icon">{insight.icon}</div>

            <div className="insight-content">
              <div className="insight-header">
                <span className="insight-title md-typescale-title-small">
                  {insight.title}
                </span>
                <span className="insight-value md-typescale-title-medium">
                  {formatInsightValue(insight)}
                </span>
              </div>

              <p className="insight-description md-typescale-body-small">
                {insight.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Tips */}
      <div className="insights-tips">
        <div className="tip-item">
          <span className="tip-icon">
            <HiLightBulb />
          </span>
          <span className="tip-text md-typescale-body-small">
            Siga sus pautas de gasto para identificar áreas de mejora
          </span>
        </div>
      </div>
    </div>
  );
};

export default InsightsWidget;
