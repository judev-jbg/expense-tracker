import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import {
  userPreferencesService,
  expenseTypesService,
} from "../../libs/configService";

const UserPreferences = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [initialLoad, setInitialLoad] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    defaultValues: {
      theme: theme,
      currency: "EUR",
      date_format: "DD/MM/YYYY",
      default_expense_type_id: "",
      notification_settings: {
        email: true,
        push: false,
      },
    },
  });

  const watchedTheme = watch("theme");

  useEffect(() => {
    loadData();
  }, []);

  // Update theme when form theme changes (but only after initial load)
  useEffect(() => {
    // ← Modificar esta lógica
    if (!initialLoad && watchedTheme && watchedTheme !== theme) {
      setTheme(watchedTheme);
    }
  }, [watchedTheme, theme, setTheme, initialLoad]);

  const loadData = async () => {
    setLoading(true);

    // Load user preferences and expense types
    const [preferencesResult, typesResult] = await Promise.all([
      userPreferencesService.get(),
      expenseTypesService.getAll(),
    ]);

    if (typesResult.error) {
      setError(typesResult.error);
    } else {
      setExpenseTypes(typesResult.data || []);
    }

    // Default values
    const defaultPrefs = {
      theme: theme,
      currency: "EUR",
      date_format: "DD/MM/YYYY",
      default_expense_type_id: "",
      notification_settings: {
        email: true,
        push: false,
      },
    };

    if (preferencesResult.error) {
      setError(preferencesResult.error);
      reset(defaultPrefs);
    } else {
      // Merge existing preferences with defaults
      const existingPrefs = preferencesResult.data || {};
      reset({
        theme: existingPrefs.theme || defaultPrefs.theme,
        currency: existingPrefs.currency || defaultPrefs.currency,
        date_format: existingPrefs.date_format || defaultPrefs.date_format,
        default_expense_type_id:
          existingPrefs.default_expense_type_id ||
          defaultPrefs.default_expense_type_id,
        notification_settings:
          existingPrefs.notification_settings ||
          defaultPrefs.notification_settings,
      });
    }

    setLoading(false);
    setInitialLoad(false);
  };

  const onSubmit = async (data) => {
    setSaving(true);
    setError("");
    setSuccess("");

    const { error } = await userPreferencesService.update(data);

    if (error) {
      setError(error);
    } else {
      setSuccess("Preferences saved successfully!");
      // Update theme context
      setTheme(data.theme);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    }

    setSaving(false);
  };

  const currencies = [
    { code: "EUR", name: "Euro (€)", symbol: "€" },
    { code: "USD", name: "US Dollar ($)", symbol: "$" },
    { code: "GBP", name: "British Pound (£)", symbol: "£" },
    { code: "JPY", name: "Japanese Yen (¥)", symbol: "¥" },
    { code: "CAD", name: "Canadian Dollar (C$)", symbol: "C$" },
    { code: "AUD", name: "Australian Dollar (A$)", symbol: "A$" },
    { code: "CHF", name: "Swiss Franc (CHF)", symbol: "CHF" },
  ];

  const dateFormats = [
    { value: "DD/MM/YYYY", label: "DD/MM/YYYY (27/05/2025)" },
    { value: "MM/DD/YYYY", label: "MM/DD/YYYY (05/27/2025)" },
    { value: "YYYY-MM-DD", label: "YYYY-MM-DD (2025-05-27)" },
    { value: "DD-MM-YYYY", label: "DD-MM-YYYY (27-05-2025)" },
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading preferences...</div>
      </div>
    );
  }

  return (
    <div className="user-preferences">
      <div className="section-header">
        <div className="section-title">
          <h2 className="md-typescale-headline-small">User Preferences</h2>
          <p className="md-typescale-body-medium section-description">
            Customize your experience and default settings.
          </p>
        </div>
      </div>

      {error && (
        <div className="error-message md-card">
          <span className="error-icon">⚠️</span>
          <span className="md-typescale-body-medium">{error}</span>
        </div>
      )}

      {success && (
        <div className="success-message md-card">
          <span className="success-icon">✅</span>
          <span className="md-typescale-body-medium">{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="preferences-form">
        {/* User Information */}
        <div className="preferences-section md-card">
          <h3 className="md-typescale-title-medium section-title">
            Account Information
          </h3>

          <div className="user-info-display">
            <div className="user-avatar-large">
              {user?.user_metadata?.first_name?.charAt(0) ||
                user?.email?.charAt(0) ||
                "?"}
            </div>
            <div className="user-details">
              <h4 className="md-typescale-title-small">
                {user?.user_metadata?.full_name ||
                  `${user?.user_metadata?.first_name || ""} ${
                    user?.user_metadata?.last_name || ""
                  }`.trim() ||
                  "User"}
              </h4>
              <p className="md-typescale-body-medium user-email">
                {user?.email}
              </p>
              <p className="md-typescale-body-small">
                Member since {new Date(user?.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="preferences-section md-card">
          <h3 className="md-typescale-title-medium section-title">
            Appearance
          </h3>

          <div className="form-row">
            <div className="md-text-field">
              <label htmlFor="theme" className="md-text-field-label">
                Theme
              </label>
              <select
                id="theme"
                className="md-text-field-input"
                {...register("theme")}
                disabled={saving}
              >
                <option value="dark">🌙 Dark Theme</option>
                <option value="light">☀️ Light Theme</option>
              </select>
            </div>
          </div>
        </div>

        {/* Regional Settings */}
        <div className="preferences-section md-card">
          <h3 className="md-typescale-title-medium section-title">
            Regional Settings
          </h3>

          <div className="form-row form-row-split">
            <div className="md-text-field">
              <label htmlFor="currency" className="md-text-field-label">
                Currency
              </label>
              <select
                id="currency"
                className="md-text-field-input"
                {...register("currency")}
                disabled={saving}
              >
                {currencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md-text-field">
              <label htmlFor="date_format" className="md-text-field-label">
                Date Format
              </label>
              <select
                id="date_format"
                className="md-text-field-input"
                {...register("date_format")}
                disabled={saving}
              >
                {dateFormats.map((format) => (
                  <option key={format.value} value={format.value}>
                    {format.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Default Settings */}
        <div className="preferences-section md-card">
          <h3 className="md-typescale-title-medium section-title">
            Default Settings
          </h3>

          <div className="form-row">
            <div className="md-text-field">
              <label
                htmlFor="default_expense_type_id"
                className="md-text-field-label"
              >
                Default Expense Type
              </label>
              <select
                id="default_expense_type_id"
                className="md-text-field-input"
                {...register("default_expense_type_id")}
                disabled={saving}
              >
                <option value="">None (manual selection)</option>
                {expenseTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.icon} {type.name}
                  </option>
                ))}
              </select>
              <span className="md-typescale-body-small field-help">
                Pre-select this expense type when creating new expenses
              </span>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="preferences-section md-card">
          <h3 className="md-typescale-title-medium section-title">
            Notifications
          </h3>

          <div className="checkbox-group">
            <label className="checkbox-item">
              <input
                type="checkbox"
                className="checkbox-input"
                {...register("notification_settings.email")}
                disabled={saving}
              />
              <span className="checkbox-label md-typescale-body-medium">
                📧 Email notifications
              </span>
              <span className="checkbox-description md-typescale-body-small">
                Receive email updates about your account and expenses
              </span>
            </label>

            <label className="checkbox-item">
              <input
                type="checkbox"
                className="checkbox-input"
                {...register("notification_settings.push")}
                disabled={saving}
              />
              <span className="checkbox-label md-typescale-body-medium">
                🔔 Push notifications
              </span>
              <span className="checkbox-description md-typescale-body-small">
                Receive browser notifications for important updates
              </span>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="form-actions">
          <button
            type="submit"
            className={`md-button md-button-filled save-preferences-button ${
              saving ? "loading" : ""
            }`}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserPreferences;
