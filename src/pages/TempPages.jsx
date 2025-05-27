// Temporary Dashboard Page
export const Dashboard = () => {
  return (
    <div className="page-container">
      <div className="md-card" style={{ padding: "24px", textAlign: "center" }}>
        <h2
          className="md-typescale-headline-medium"
          style={{ marginBottom: "16px" }}
        >
          📊 Dashboard
        </h2>
        <p
          className="md-typescale-body-medium"
          style={{ color: "var(--md-sys-color-on-surface-variant)" }}
        >
          This page will show your expense summary and analytics.
        </p>
        <p
          className="md-typescale-body-small"
          style={{ marginTop: "16px", fontStyle: "italic" }}
        >
          Coming soon in Module 4
        </p>
      </div>
    </div>
  );
};

// Temporary Expenses Page
export const Expenses = () => {
  return (
    <div className="page-container">
      <div className="md-card" style={{ padding: "24px", textAlign: "center" }}>
        <h2
          className="md-typescale-headline-medium"
          style={{ marginBottom: "16px" }}
        >
          💳 Expenses
        </h2>
        <p
          className="md-typescale-body-medium"
          style={{ color: "var(--md-sys-color-on-surface-variant)" }}
        >
          This page will allow you to manage your expenses with full CRUD
          operations.
        </p>
        <p
          className="md-typescale-body-small"
          style={{ marginTop: "16px", fontStyle: "italic" }}
        >
          Coming soon in Module 3
        </p>
      </div>
    </div>
  );
};

// Temporary Settings Page
export const Settings = () => {
  return (
    <div className="page-container">
      <div className="md-card" style={{ padding: "24px", textAlign: "center" }}>
        <h2
          className="md-typescale-headline-medium"
          style={{ marginBottom: "16px" }}
        >
          ⚙️ Settings
        </h2>
        <p
          className="md-typescale-body-medium"
          style={{ color: "var(--md-sys-color-on-surface-variant)" }}
        >
          This page will allow you to manage expense types, entities, and user
          settings.
        </p>
        <p
          className="md-typescale-body-small"
          style={{ marginTop: "16px", fontStyle: "italic" }}
        >
          Coming soon in Module 2
        </p>
      </div>
    </div>
  );
};
