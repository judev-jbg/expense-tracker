import { GrMoney } from "react-icons/gr";
import { TbListNumbers } from "react-icons/tb";
import { LuChartLine } from "react-icons/lu";
import { IoCalendarOutline } from "react-icons/io5";
import { HiArrowTrendingDown, HiArrowTrendingUp } from "react-icons/hi2";
import { MdOutlineTrendingFlat } from "react-icons/md";

const DashboardSummary = ({ data, formatCurrency }) => {
  const summaryCards = [
    {
      title: "Total gastado",
      value: formatCurrency(data.totalAmount),
      icon: <GrMoney />,
      color: "primary",
      trend: null,
    },
    {
      title: "Cantidad de gastos",
      value: data.expenseCount.toString(),
      icon: <TbListNumbers />,
      color: "secondary",
      trend: null,
    },
    {
      title: "Gasto promedio",
      value: formatCurrency(data.avgExpenseAmount),
      icon: <LuChartLine />,
      color: "tertiary",
      trend: null,
    },
    {
      title: "Periodo",
      value: data.period,
      icon: <IoCalendarOutline />,
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
                    {card.trend.type === "up" ? (
                      <HiArrowTrendingUp />
                    ) : card.trend.type === "down" ? (
                      <HiArrowTrendingDown />
                    ) : (
                      <MdOutlineTrendingFlat />
                    )}
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
