import { useState } from "react";

const PeriodSelector = ({ selectedYear, selectedMonth, onPeriodChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const months = [
    { value: 1, name: "January", short: "Ene" },
    { value: 2, name: "February", short: "Feb" },
    { value: 3, name: "March", short: "Mar" },
    { value: 4, name: "April", short: "Abr" },
    { value: 5, name: "May", short: "May" },
    { value: 6, name: "June", short: "Jun" },
    { value: 7, name: "July", short: "Jul" },
    { value: 8, name: "August", short: "Ago" },
    { value: 9, name: "September", short: "Sep" },
    { value: 10, name: "October", short: "Oct" },
    { value: 11, name: "November", short: "Nov" },
    { value: 12, name: "December", short: "Dic" },
  ];

  const handleYearChange = (year) => {
    onPeriodChange(year, selectedMonth);
    setIsOpen(false);
  };

  const handleMonthChange = (month) => {
    onPeriodChange(selectedYear, month);
    setIsOpen(false);
  };

  const handleShowFullYear = () => {
    onPeriodChange(selectedYear, null);
    setIsOpen(false);
  };

  const getDisplayText = () => {
    if (selectedMonth) {
      const month = months.find((m) => m.value === selectedMonth);
      return `${month.name} ${selectedYear}`;
    }
    return `${selectedYear} (Año completo)`;
  };

  return (
    <div className="period-selector">
      <button
        className="period-selector-button md-button md-button-outlined"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="selector-text">{getDisplayText()}</span>
        <span className="selector-icon">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="period-dropdown md-card">
          {/* Quick Actions */}
          <div className="period-section">
            <h4 className="period-section-title md-typescale-title-small">
              Selección rapida
            </h4>
            <div className="quick-periods">
              <button
                className={`period-option ${!selectedMonth ? "active" : ""}`}
                onClick={handleShowFullYear}
              >
                Año {selectedYear}
              </button>
              <button
                className={`period-option ${
                  selectedMonth === new Date().getMonth() + 1 ? "active" : ""
                }`}
                onClick={() => handleMonthChange(new Date().getMonth() + 1)}
              >
                Este mes
              </button>
              <button
                className={`period-option ${
                  selectedMonth === new Date().getMonth() ? "active" : ""
                }`}
                onClick={() => handleMonthChange(new Date().getMonth())}
              >
                Ultimo mes
              </button>
            </div>
          </div>

          {/* Year Selection */}
          <div className="period-section">
            <h4 className="period-section-title md-typescale-title-small">
              Year
            </h4>
            <div className="year-grid">
              {years.map((year) => (
                <button
                  key={year}
                  className={`period-option ${
                    year === selectedYear ? "active" : ""
                  }`}
                  onClick={() => handleYearChange(year)}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>

          {/* Month Selection */}
          <div className="period-section">
            <h4 className="period-section-title md-typescale-title-small">
              Month
            </h4>
            <div className="month-grid">
              {months.map((month) => (
                <button
                  key={month.value}
                  className={`period-option ${
                    month.value === selectedMonth ? "active" : ""
                  }`}
                  onClick={() => handleMonthChange(month.value)}
                >
                  {month.short}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div className="period-overlay" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

export default PeriodSelector;
