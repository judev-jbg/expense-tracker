import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

const ExpenseFilters = ({
  filters,
  expenseTypes,
  entities,
  onApplyFilters,
  onClearFilters,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      search: "",
      expense_type_id: "",
      entity_id: "",
      year: new Date().getFullYear(),
      month: "",
      date_from: "",
      date_to: "",
      min_amount: "",
      max_amount: "",
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    // Check if any filters are active
    const activeFilters = Object.entries(watchedValues).some(([key, value]) => {
      if (key === "year") return value !== new Date().getFullYear();
      return value && value !== "";
    });
    setHasActiveFilters(activeFilters);
  }, [watchedValues]);

  // Apply filters when form changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const filterData = {};

      Object.entries(watchedValues).forEach(([key, value]) => {
        if (value && value !== "") {
          filterData[key] = value;
        }
      });

      onApplyFilters(filterData);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [watchedValues, onApplyFilters]);

  const handleClear = () => {
    reset({
      search: "",
      expense_type_id: "",
      entity_id: "",
      year: new Date().getFullYear(),
      month: "",
      date_from: "",
      date_to: "",
      min_amount: "",
      max_amount: "",
    });
    onClearFilters();
  };

  const handleQuickFilter = (type, value) => {
    const now = new Date();

    switch (type) {
      case "this-month":
        setValue("year", now.getFullYear());
        setValue("month", now.getMonth() + 1);
        setValue("date_from", "");
        setValue("date_to", "");
        break;
      case "last-month":
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
        setValue("year", lastMonth.getFullYear());
        setValue("month", lastMonth.getMonth() + 1);
        setValue("date_from", "");
        setValue("date_to", "");
        break;
      case "this-year":
        setValue("year", now.getFullYear());
        setValue("month", "");
        setValue("date_from", "");
        setValue("date_to", "");
        break;
      case "last-7-days":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        setValue("date_from", weekAgo.toISOString().split("T")[0]);
        setValue("date_to", now.toISOString().split("T")[0]);
        setValue("year", "");
        setValue("month", "");
        break;
      case "last-30-days":
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        setValue("date_from", monthAgo.toISOString().split("T")[0]);
        setValue("date_to", now.toISOString().split("T")[0]);
        setValue("year", "");
        setValue("month", "");
        break;
    }
  };

  // Generate year options (current year ± 5 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  // Generate month options
  const monthOptions = [
    { value: 1, name: "January" },
    { value: 2, name: "February" },
    { value: 3, name: "March" },
    { value: 4, name: "April" },
    { value: 5, name: "May" },
    { value: 6, name: "June" },
    { value: 7, name: "July" },
    { value: 8, name: "August" },
    { value: 9, name: "September" },
    { value: 10, name: "October" },
    { value: 11, name: "November" },
    { value: 12, name: "December" },
  ];

  return (
    <div className="expense-filters md-card">
      <div className="filters-header">
        <div className="filters-title">
          <h3 className="md-typescale-title-medium">Filters</h3>
          {hasActiveFilters && (
            <span className="active-filters-indicator">
              {Object.values(watchedValues).filter((v) => v && v !== "").length}{" "}
              active
            </span>
          )}
        </div>

        <div className="filters-actions">
          {hasActiveFilters && (
            <button
              type="button"
              className="md-button md-button-outlined clear-filters-button"
              onClick={handleClear}
            >
              Clear All
            </button>
          )}
          <button
            type="button"
            className="expand-filters-button"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
          >
            {isExpanded ? "▼" : "▶"} {isExpanded ? "Less" : "More"} Filters
          </button>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="quick-filters">
        <span className="md-typescale-body-small quick-filters-label">
          Quick:
        </span>
        <div className="quick-filter-buttons">
          {[
            { key: "this-month", label: "This Month" },
            { key: "last-month", label: "Last Month" },
            { key: "last-7-days", label: "Last 7 Days" },
            { key: "last-30-days", label: "Last 30 Days" },
            { key: "this-year", label: "This Year" },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              className="quick-filter-button"
              onClick={() => handleQuickFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Always Visible Filters */}
      <div className="filters-row">
        <div className="md-text-field">
          <label htmlFor="search" className="md-text-field-label">
            Search
          </label>
          <input
            id="search"
            type="text"
            className="md-text-field-input"
            placeholder="Search in descriptions..."
            {...register("search")}
          />
        </div>

        <div className="md-text-field">
          <label htmlFor="expense_type_id" className="md-text-field-label">
            Type
          </label>
          <select
            id="expense_type_id"
            className="md-text-field-input"
            {...register("expense_type_id")}
          >
            <option value="">All Types</option>
            {expenseTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.icon} {type.name}
              </option>
            ))}
          </select>
        </div>

        <div className="md-text-field">
          <label htmlFor="year" className="md-text-field-label">
            Year
          </label>
          <select
            id="year"
            className="md-text-field-input"
            {...register("year")}
          >
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expandable Filters */}
      {isExpanded && (
        <div className="expanded-filters">
          <div className="filters-row">
            <div className="md-text-field">
              <label htmlFor="entity_id" className="md-text-field-label">
                Entity
              </label>
              <select
                id="entity_id"
                className="md-text-field-input"
                {...register("entity_id")}
              >
                <option value="">All Entities</option>
                {entities.map((entity) => (
                  <option key={entity.id} value={entity.id}>
                    {entity.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md-text-field">
              <label htmlFor="month" className="md-text-field-label">
                Month
              </label>
              <select
                id="month"
                className="md-text-field-input"
                {...register("month")}
              >
                <option value="">All Months</option>
                {monthOptions.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="filters-row">
            <div className="md-text-field">
              <label htmlFor="date_from" className="md-text-field-label">
                From Date
              </label>
              <input
                id="date_from"
                type="date"
                className="md-text-field-input"
                {...register("date_from")}
              />
            </div>

            <div className="md-text-field">
              <label htmlFor="date_to" className="md-text-field-label">
                To Date
              </label>
              <input
                id="date_to"
                type="date"
                className="md-text-field-input"
                {...register("date_to")}
              />
            </div>
          </div>

          <div className="filters-row">
            <div className="md-text-field">
              <label htmlFor="min_amount" className="md-text-field-label">
                Min Amount (€)
              </label>
              <input
                id="min_amount"
                type="number"
                step="0.01"
                min="0"
                className="md-text-field-input"
                placeholder="0.00"
                {...register("min_amount")}
              />
            </div>

            <div className="md-text-field">
              <label htmlFor="max_amount" className="md-text-field-label">
                Max Amount (€)
              </label>
              <input
                id="max_amount"
                type="number"
                step="0.01"
                min="0"
                className="md-text-field-input"
                placeholder="999999.99"
                {...register("max_amount")}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseFilters;
