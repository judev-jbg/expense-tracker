import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { expenseTypesService, dashboardService } from "../libs/configService";
import DashboardSummary from "../components/dashboard/DashboardSummary";
import ExpenseChart from "../components/dashboard/ExpenseChart";
import CategoryBreakdown from "../components/dashboard/CategoryBreakdown";
import RecentExpenses from "../components/dashboard/RecentExpenses";
import MonthlyTrend from "../components/dashboard/MonthlyTrend";
import InsightsWidget from "../components/dashboard/InsightsWidget";
import PeriodSelector from "../components/dashboard/PeriodSelector";

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Period state
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(null); // null = whole year
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [selectedYear, selectedMonth]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError("");

    try {
      // Load main dashboard data
      const dashboardResult = await dashboardService.getDashboardData(
        selectedYear,
        selectedMonth
      );

      if (dashboardResult.error) {
        setError(dashboardResult.error);
      } else {
        setDashboardData(dashboardResult.data);
        setHasData(dashboardResult.data.summary.expenseCount > 0);
      }

      // Load monthly trend data (only for yearly view)
      if (!selectedMonth) {
        const monthlyResult = await dashboardService.getMonthlyComparison(
          selectedYear
        );
        if (monthlyResult.error) {
          console.error("Monthly data error:", monthlyResult.error);
        } else {
          setMonthlyData(monthlyResult.data);
        }

        // Load insights
        const insightsResult = await dashboardService.getInsights(selectedYear);
        if (insightsResult.error) {
          console.error("Insights error:", insightsResult.error);
        } else {
          setInsights(insightsResult.data || []);
        }
      }
    } catch (error) {
      setError("Failed to load dashboard data");
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (year, month) => {
    setSelectedYear(year);
    setSelectedMonth(month);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-container">
          <div className="loading-spinner">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <div className="error-message md-card">
          <span className="error-icon">⚠️</span>
          <div>
            <h3 className="md-typescale-title-medium">
              Error Loading Dashboard
            </h3>
            <p className="md-typescale-body-medium">{error}</p>
            <button
              className="md-button md-button-outlined"
              onClick={loadDashboardData}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="dashboard-empty">
        <div className="empty-dashboard md-card">
          <div className="empty-icon">📊</div>
          <h2 className="md-typescale-headline-small">No Data Yet</h2>
          <p className="md-typescale-body-medium">
            Start adding expenses to see your financial dashboard come to life.
          </p>
          <div className="empty-actions">
            <a href="/expenses" className="md-button md-button-filled">
              Add Your First Expense
            </a>
          </div>
        </div>
      </div>
    );
  }

  const periodLabel = selectedMonth
    ? `${new Date(selectedYear, selectedMonth - 1).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })}`
    : selectedYear.toString();

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="md-typescale-headline-medium">Dashboard</h1>
          <p className="md-typescale-body-medium dashboard-subtitle">
            Welcome back, {user?.user_metadata?.first_name || "User"}! Here's
            your spending overview.
          </p>
        </div>

        <PeriodSelector
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          onPeriodChange={handlePeriodChange}
        />
      </div>

      {/* Period Label */}
      <div className="period-indicator">
        <h2 className="md-typescale-title-large period-title">{periodLabel}</h2>
      </div>

      {/* Summary Cards */}
      <DashboardSummary
        data={dashboardData.summary}
        formatCurrency={formatCurrency}
      />

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Left Column */}
        <div className="dashboard-main-column">
          {/* Monthly Trend (only for yearly view) */}
          {!selectedMonth && monthlyData && (
            <MonthlyTrend
              data={monthlyData}
              year={selectedYear}
              formatCurrency={formatCurrency}
            />
          )}

          {/* Expense Chart */}
          <ExpenseChart
            data={dashboardData.dailyTrend}
            period={selectedMonth ? "month" : "year"}
            formatCurrency={formatCurrency}
          />

          {/* Category Breakdown */}
          <CategoryBreakdown
            data={dashboardData.byExpenseType}
            formatCurrency={formatCurrency}
          />
        </div>

        {/* Right Column */}
        <div className="dashboard-sidebar">
          {/* Insights (only for yearly view) */}
          {!selectedMonth && insights.length > 0 && (
            <InsightsWidget
              insights={insights}
              formatCurrency={formatCurrency}
            />
          )}

          {/* Recent Expenses */}
          <RecentExpenses
            expenses={dashboardData.recentExpenses}
            formatCurrency={formatCurrency}
          />

          {/* Top Entities */}
          {dashboardData.byEntity.length > 0 && (
            <div className="widget md-card">
              <h3 className="md-typescale-title-medium widget-title">
                Top Spending Places
              </h3>
              <div className="entity-list">
                {dashboardData.byEntity.slice(0, 5).map((entity, index) => (
                  <div key={entity.id} className="entity-item">
                    <div className="entity-rank">#{index + 1}</div>
                    <div className="entity-info">
                      <span className="entity-name md-typescale-body-medium">
                        {entity.name}
                      </span>
                      <span className="entity-amount md-typescale-body-small">
                        {formatCurrency(entity.amount)} ({entity.count}{" "}
                        expenses)
                      </span>
                    </div>
                    <div className="entity-percentage">
                      {entity.percentage.toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
