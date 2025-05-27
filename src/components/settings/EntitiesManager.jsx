import { useState, useEffect } from "react";
import { entitiesService, expenseTypesService } from "../../libs/configService";
import EntityForm from "./EntityForm";
import EntityCard from "./EntityCard";

const EntitiesManager = () => {
  const [entities, setEntities] = useState([]);
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEntity, setEditingEntity] = useState(null);
  const [error, setError] = useState("");
  const [filterType, setFilterType] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    // Load both entities and expense types
    const [entitiesResult, typesResult] = await Promise.all([
      entitiesService.getAll(),
      expenseTypesService.getAll(),
    ]);

    if (entitiesResult.error) {
      setError(entitiesResult.error);
    } else {
      setEntities(entitiesResult.data || []);
    }

    if (typesResult.error) {
      setError(typesResult.error);
    } else {
      setExpenseTypes(typesResult.data || []);
    }

    setLoading(false);
  };

  const handleCreate = async (formData) => {
    const { data, error } = await entitiesService.create(formData);

    if (error) {
      setError(error);
      return false;
    } else {
      setEntities([...entities, data]);
      setShowForm(false);
      setError("");
      return true;
    }
  };

  const handleUpdate = async (formData) => {
    const { data, error } = await entitiesService.update(
      editingEntity.id,
      formData
    );

    if (error) {
      setError(error);
      return false;
    } else {
      setEntities(
        entities.map((entity) =>
          entity.id === editingEntity.id ? data : entity
        )
      );
      setEditingEntity(null);
      setShowForm(false);
      setError("");
      return true;
    }
  };

  const handleDelete = async (id) => {
    const { error } = await entitiesService.delete(id);

    if (error) {
      setError(error);
    } else {
      setEntities(entities.filter((entity) => entity.id !== id));
      setError("");
    }
  };

  const handleEdit = (entity) => {
    setEditingEntity(entity);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingEntity(null);
    setError("");
  };

  // Filter entities by expense type
  const filteredEntities = filterType
    ? entities.filter((entity) => entity.expense_type_id === filterType)
    : entities;

  // Group entities by expense type for display
  const entitiesByType = expenseTypes.reduce((acc, type) => {
    const typeEntities = filteredEntities.filter(
      (entity) => entity.expense_type_id === type.id
    );
    if (typeEntities.length > 0 || !filterType) {
      acc[type.id] = {
        type,
        entities: typeEntities,
      };
    }
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading entities...</div>
      </div>
    );
  }

  return (
    <div className="entities-manager">
      <div className="section-header">
        <div className="section-title">
          <h2 className="md-typescale-headline-small">Entities</h2>
          <p className="md-typescale-body-medium section-description">
            Manage specific companies, stores, and service providers for each
            expense type.
          </p>
        </div>

        <button
          className="md-button md-button-filled"
          onClick={() => setShowForm(true)}
          disabled={showForm || expenseTypes.length === 0}
        >
          <span className="button-icon">➕</span>
          Add Entity
        </button>
      </div>

      {error && (
        <div className="error-message md-card">
          <span className="error-icon">⚠️</span>
          <span className="md-typescale-body-medium">{error}</span>
        </div>
      )}

      {expenseTypes.length === 0 && (
        <div className="warning-message md-card">
          <span className="warning-icon">💡</span>
          <div>
            <span className="md-typescale-body-medium">
              You need to create expense types first before adding entities.
            </span>
            <br />
            <span className="md-typescale-body-small">
              Go to the Expense Types section to get started.
            </span>
          </div>
        </div>
      )}

      {/* Filter by expense type */}
      {expenseTypes.length > 0 && (
        <div className="entities-filter">
          <div className="md-text-field">
            <label htmlFor="filter-type" className="md-text-field-label">
              Filter by Expense Type
            </label>
            <select
              id="filter-type"
              className="md-text-field-input"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">All Types</option>
              {expenseTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.icon} {type.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {showForm && (
        <EntityForm
          entity={editingEntity}
          expenseTypes={expenseTypes}
          onSubmit={editingEntity ? handleUpdate : handleCreate}
          onCancel={handleCancelForm}
          isEditing={!!editingEntity}
        />
      )}

      <div className="entities-content">
        {entities.length === 0 ? (
          <div className="empty-state md-card">
            <div className="empty-icon">🏢</div>
            <h3 className="md-typescale-title-medium">No entities yet</h3>
            <p className="md-typescale-body-medium">
              Create your first entity to specify where you spend money.
            </p>
          </div>
        ) : (
          Object.values(entitiesByType).map(
            ({ type, entities: typeEntities }) => (
              <div key={type.id} className="entities-type-group">
                <div className="type-group-header">
                  <span
                    className="type-icon"
                    style={{ backgroundColor: type.color }}
                  >
                    {type.icon}
                  </span>
                  <h3 className="md-typescale-title-medium">{type.name}</h3>
                  <span className="entity-count md-typescale-body-small">
                    {typeEntities.length}{" "}
                    {typeEntities.length === 1 ? "entity" : "entities"}
                  </span>
                </div>

                <div className="entities-grid">
                  {typeEntities.map((entity) => (
                    <EntityCard
                      key={entity.id}
                      entity={entity}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>

                {typeEntities.length === 0 && !filterType && (
                  <div className="empty-type-state">
                    <p className="md-typescale-body-small">
                      No entities for {type.name} yet. Add one to get started.
                    </p>
                  </div>
                )}
              </div>
            )
          )
        )}
      </div>
    </div>
  );
};

export default EntitiesManager;
